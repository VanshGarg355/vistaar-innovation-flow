import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { askJson, fallbackReasons, scoreMatch } from "./ai.server";

/** Writes an audit_logs row from within a server function. Never throws —
 *  a logging failure must not block the underlying AI action. */
async function logServerAudit(
  supabase: SupabaseClient,
  userId: string,
  input: { action: string; entity: string; entity_id?: string; new_value?: string; status?: string },
) {
  try {
    const [{ data: userRes }, { data: roles }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    await supabase.from("audit_logs").insert({
      user_id: userId,
      user_email: userRes?.user?.email ?? "",
      role: roles?.[0]?.role ?? "",
      action: input.action,
      entity: input.entity,
      entity_id: input.entity_id ?? "",
      status: input.status ?? "success",
      prev_value: "",
      new_value: input.new_value ?? "",
    } as never);
  } catch {
    // Audit logging is best-effort; the calling action already succeeded.
  }
}

/** AI Match engine: scores every startup against a challenge and persists matches. */
export const runAiMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { challengeId: string }) => {
    if (!input?.challengeId) throw new Error("challengeId is required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: challenge, error: cErr } = await supabase
      .from("challenges")
      .select("*")
      .eq("id", data.challengeId)
      .maybeSingle();
    if (cErr) throw new Error("Could not load the challenge");
    if (!challenge) throw new Error("Challenge not found");

    const { data: startups, error: sErr } = await supabase.from("startups").select("*");
    if (sErr) throw new Error("Could not load startups");
    if (!startups?.length) return { matches: [], aiNote: "No startup profiles available yet." };

    const ch = challenge as never as {
      id: string;
      title: string;
      problem_statement: string;
      sector: string;
      state: string;
      technologies: string[];
      capabilities: string[];
      kpis: unknown;
    };

    const scored = (startups as never as Parameters<typeof scoreMatch>[1][])
      .map((s, i) => ({
        startup: startups[i] as never as { id: string; name: string },
        raw: s,
        score: scoreMatch(ch, s),
      }))
      .sort((a, b) => b.score.overall_score - a.score.overall_score)
      .slice(0, 6);

    const prompt = {
      challenge: {
        title: ch.title,
        problem: ch.problem_statement,
        sector: ch.sector,
        state: ch.state,
        technologies: ch.technologies,
        capabilities: ch.capabilities,
      },
      candidates: scored.map((c) => ({
        id: c.startup.id,
        name: c.startup.name,
        solution: c.raw.solution,
        technologies: c.raw.technologies,
        deployments: c.raw.deployments,
        evidence_score: c.raw.evidence_score,
        computed_scores: c.score,
      })),
    };

    const ai = await askJson<{
      candidates: { id: string; reasons: string[]; limitations: string[] }[];
    }>(
      'You are the explainability layer of VISTAAR, a government innovation platform. The numeric match scores are already computed by a deterministic weighted engine and MUST NOT be changed. For each candidate produce 3-5 short factual reasons (\'why this startup\') grounded strictly in the supplied data, and 1-3 honest limitations. Never invent deployments or metrics. Respond as JSON: {"candidates":[{"id":"...","reasons":["..."],"limitations":["..."]}]}',
      JSON.stringify(prompt),
    );

    const rows = scored.map((c) => {
      const explained = ai.data?.candidates?.find((x) => x.id === c.startup.id);
      const fb = fallbackReasons(ch, c.raw, c.score);
      return {
        challenge_id: ch.id,
        startup_id: c.startup.id,
        ...c.score,
        reasons: explained?.reasons?.length ? explained.reasons.slice(0, 5) : fb.reasons,
        limitations: explained?.limitations?.length
          ? explained.limitations.slice(0, 3)
          : fb.limitations,
        decision: "ai_recommended",
        trace: {
          weights: {
            problem_fit: 30,
            technology_fit: 20,
            impact_potential: 20,
            evidence_strength: 15,
            scalability: 10,
            deployment_readiness: 5,
          },
          inputs: [
            "challenge problem statement + KPIs",
            "required technologies and capabilities",
            "startup solution, technologies, deployments",
            "verified evidence score and scale readiness",
          ],
          explainability: ai.error
            ? "deterministic fallback"
            : "AI-generated rationale over deterministic scores",
          model: ai.error ? null : "vistaar-match-v1.4",
        },
      };
    });

    const { error: upErr } = await supabase
      .from("matches")
      .upsert(rows as never, { onConflict: "challenge_id,startup_id" });
    if (upErr) throw new Error("Could not save the match results");

    await supabase
      .from("challenges")
      .update({ status: "matching" } as never)
      .eq("id", ch.id);

    await logServerAudit(supabase, context.userId, {
      action: "match.ai_run",
      entity: "challenge",
      entity_id: ch.id,
      new_value: `${rows.length} startups scored${ai.error ? " (deterministic fallback, AI unavailable)" : ""}`,
      status: ai.error ? "partial" : "success",
    });

    return { matches: rows.length, aiNote: ai.error ?? null };
  });

/** Recommends published challenges for one startup, reusing the same deterministic scorer. */
export const recommendChallengesForStartup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { startupId: string }) => {
    if (!input?.startupId) throw new Error("startupId is required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: startup, error: sErr } = await supabase
      .from("startups")
      .select("*")
      .eq("id", data.startupId)
      .maybeSingle();
    if (sErr) throw new Error("Could not load the startup");
    if (!startup) throw new Error("Startup not found");

    const { data: challenges, error: cErr } = await supabase
      .from("challenges")
      .select("*")
      .eq("status", "published");
    if (cErr) throw new Error("Could not load challenges");
    if (!challenges?.length) return { recommendations: [] };

    const s = startup as never as Parameters<typeof scoreMatch>[1];

    const scored = (challenges as never as Parameters<typeof scoreMatch>[0][])
      .map((c, i) => ({
        challenge: challenges[i] as never as {
          id: string;
          title: string;
          department: string;
          sector: string;
          deadline: string | null;
        },
        score: scoreMatch(c, s),
      }))
      .sort((a, b) => b.score.overall_score - a.score.overall_score)
      .slice(0, 5);

    // Reuse an existing matches row (already scored via runAiMatch from the
    // challenge side) so we don't pay for a second LLM explanation call.
    const { data: existing } = await supabase
      .from("matches")
      .select("*")
      .eq("startup_id", data.startupId)
      .in(
        "challenge_id",
        scored.map((x) => x.challenge.id),
      );

    await logServerAudit(supabase, context.userId, {
      action: "match.recommend_run",
      entity: "startup",
      entity_id: data.startupId,
      new_value: `${scored.length} challenges ranked`,
    });

    return {
      recommendations: scored.map((x) => ({
        challenge: x.challenge,
        score: x.score,
        cached:
          (existing as never as { challenge_id: string }[] | null)?.find(
            (m) => m.challenge_id === x.challenge.id,
          ) ?? null,
      })),
    };
  });

/** Evidence Maker: extracts KPI structure and analysis from submitted evidence. */
export const analyzeEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { title: string; kpi?: string; unit?: string; rawData: string }) => {
    if (!input?.rawData?.trim()) throw new Error("Evidence content is required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const ai = await askJson<{
      kpi: string;
      unit: string;
      baseline: number | null;
      target: number | null;
      actual: number | null;
      improvement_pct: number | null;
      summary: string;
      confidence: string;
      flags: string[];
      recommendations: string[];
    }>(
      "You are the VISTAAR Evidence Maker. Read raw pilot evidence (CSV rows, report text, survey notes) and extract structured evidence. Output strict JSON with keys kpi, unit, baseline, target, actual, improvement_pct, summary, confidence (low|medium|high), flags (inconsistencies or missing evidence), recommendations (additional evidence to request). Use null when a number is genuinely absent — never guess. Label uncertainty in flags.",
      JSON.stringify({
        title: data.title,
        kpiHint: data.kpi ?? "",
        unitHint: data.unit ?? "",
        content: data.rawData.slice(0, 8000),
      }),
    );

    if (!ai.data) {
      await logServerAudit(supabase, context.userId, {
        action: "evidence.ai_analyzed",
        entity: "evidence",
        new_value: data.title,
        status: "failed",
      });
      return {
        ok: false as const,
        error: ai.error ?? "Evidence analysis failed",
      };
    }

    const improvement =
      ai.data.improvement_pct ??
      (ai.data.baseline && ai.data.actual
        ? Math.round(((ai.data.baseline - ai.data.actual) / ai.data.baseline) * 1000) / 10
        : null);

    await logServerAudit(supabase, context.userId, {
      action: "evidence.ai_analyzed",
      entity: "evidence",
      new_value: `${data.title} · confidence: ${ai.data.confidence}`,
    });

    return {
      ok: true as const,
      analysis: { ...ai.data, improvement_pct: improvement },
    };
  });

/** AI Scale recommendation over a proven pilot. */
export const recommendScale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { pilotId: string }) => {
    if (!input?.pilotId) throw new Error("pilotId is required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: pilot } = await supabase
      .from("pilots")
      .select("*")
      .eq("id", data.pilotId)
      .maybeSingle();
    if (!pilot) throw new Error("Pilot not found");
    const p = pilot as never as {
      id: string;
      name: string;
      department: string;
      location: string;
      kpis: unknown;
      startup_id: string | null;
    };

    const [{ data: evidence }, { data: impact }, { data: departments }, { data: startup }] =
      await Promise.all([
        supabase
          .from("evidence")
          .select("kpi, baseline, actual, unit, verification_status")
          .eq("pilot_id", p.id),
        supabase.from("impact_scores").select("*").eq("pilot_id", p.id).maybeSingle(),
        supabase.from("departments").select("name, state"),
        p.startup_id
          ? supabase
              .from("startups")
              .select("name, sector, technologies, coverage")
              .eq("id", p.startup_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

    const ai = await askJson<{
      summary: string;
      confidence: string;
      targets: {
        location: string;
        department: string;
        similarity: number;
        expected_impact: string;
        estimated_cost: number;
        complexity: string;
        modifications: string;
        risks: string;
      }[];
      risks: string[];
      dependencies: string[];
      expected_beneficiaries: number;
      budget: number;
      timeline: string;
      infrastructure: string;
      team_requirements: string;
    }>(
      "You are the VISTAAR Scale Engine. Given a proven pilot, its verified evidence, its impact score and a list of candidate government departments/states, recommend replication targets. Similarity is 0-100. Costs in INR. Be conservative and explicit about risks and required modifications. Respond as strict JSON with keys summary, confidence, targets[], risks[], dependencies[], expected_beneficiaries, budget, timeline, infrastructure, team_requirements. This is a recommendation only — government approval is required.",
      JSON.stringify({ pilot: p, evidence, impact, departments, startup }),
    );

    if (!ai.data) {
      await logServerAudit(supabase, context.userId, {
        action: "scale.ai_recommended",
        entity: "pilot",
        entity_id: p.id,
        new_value: p.name,
        status: "failed",
      });
      return { ok: false as const, error: ai.error ?? "Scale analysis failed" };
    }

    await logServerAudit(supabase, context.userId, {
      action: "scale.ai_recommended",
      entity: "pilot",
      entity_id: p.id,
      new_value: `${p.name} · ${ai.data.targets?.length ?? 0} targets suggested`,
    });

    return { ok: true as const, recommendation: ai.data };
  });
