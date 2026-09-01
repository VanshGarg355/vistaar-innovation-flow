/** Server-only AI helpers for VISTAAR (scoring engine + Lovable AI gateway). */

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

export interface GatewayResult<T> {
  data: T | null;
  error?: string;
}

/** Calls the Lovable AI gateway and parses a JSON object out of the reply. */
export async function askJson<T>(system: string, user: string): Promise<GatewayResult<T>> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { data: null, error: "AI is not configured" };

  let res: Response;
  try {
    res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
  } catch {
    return { data: null, error: "AI service unreachable" };
  }

  if (res.status === 429)
    return { data: null, error: "AI rate limit reached, please retry shortly" };
  if (res.status === 402) return { data: null, error: "AI credits exhausted for this workspace" };
  if (!res.ok) return { data: null, error: `AI request failed (${res.status})` };

  try {
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content ?? "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1)
      return { data: null, error: "AI returned an unreadable response" };
    return { data: JSON.parse(text.slice(start, end + 1)) as T };
  } catch {
    return { data: null, error: "AI returned an unreadable response" };
  }
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function overlap(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0;
  const lower = b.map((x) => x.toLowerCase());
  const hits = a.filter((x) =>
    lower.some((y) => y.includes(x.toLowerCase()) || x.toLowerCase().includes(y)),
  );
  return hits.length / a.length;
}

function textOverlap(a: string, b: string) {
  const stop = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "into",
    "are",
    "was",
    "has",
  ]);
  const words = new Set(
    a
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((w) => w.length > 3 && !stop.has(w)),
  );
  if (!words.size) return 0;
  const target = b.toLowerCase();
  let hits = 0;
  words.forEach((w) => {
    if (target.includes(w)) hits += 1;
  });
  return hits / words.size;
}

export interface ScoreBreakdown {
  overall_score: number;
  problem_fit: number;
  technology_fit: number;
  impact_potential: number;
  evidence_strength: number;
  scalability: number;
  deployment_readiness: number;
  confidence: number;
}

/** Transparent, deterministic weighted scoring — the numbers the UI explains. */
export function scoreMatch(
  challenge: {
    problem_statement: string;
    title: string;
    sector: string;
    state: string;
    technologies: string[];
    capabilities: string[];
  },
  startup: {
    problem: string;
    solution: string;
    description: string;
    sector: string;
    state: string;
    technologies: string[];
    deployments: unknown[];
    evidence_score: number;
    scale_readiness: number;
    deployment_status: string;
    coverage: string[];
  },
): ScoreBreakdown {
  const problemText = `${startup.problem} ${startup.solution} ${startup.description}`;
  const sectorBonus = challenge.sector && challenge.sector === startup.sector ? 26 : 0;
  const problem_fit = clamp(
    40 +
      sectorBonus +
      textOverlap(`${challenge.title} ${challenge.problem_statement}`, problemText) * 60,
  );
  const technology_fit = clamp(
    38 +
      overlap(challenge.technologies, startup.technologies) * 55 +
      (startup.technologies.length > 2 ? 6 : 0),
  );
  const deployments = Array.isArray(startup.deployments) ? startup.deployments.length : 0;
  const impact_potential = clamp(46 + deployments * 9 + startup.evidence_score * 0.32);
  const evidence_strength = clamp(startup.evidence_score);
  const scalability = clamp(
    startup.scale_readiness * 0.8 + (startup.coverage?.length ?? 0) * 6 + (deployments > 1 ? 8 : 0),
  );
  const readinessBase =
    startup.deployment_status === "government_deployed"
      ? 88
      : startup.deployment_status === "scaled"
        ? 94
        : 70;
  const deployment_readiness = clamp(
    readinessBase +
      (startup.coverage?.includes(challenge.state) ? 8 : 0) +
      (startup.state === challenge.state ? 4 : 0),
  );

  const overall_score = clamp(
    problem_fit * 0.3 +
      technology_fit * 0.2 +
      impact_potential * 0.2 +
      evidence_strength * 0.15 +
      scalability * 0.1 +
      deployment_readiness * 0.05,
  );

  const confidence = clamp(52 + evidence_strength * 0.3 + deployments * 6);

  return {
    overall_score,
    problem_fit,
    technology_fit,
    impact_potential,
    evidence_strength,
    scalability,
    deployment_readiness,
    confidence,
  };
}

/** Deterministic fallback explanation when the AI gateway is unavailable. */
export function fallbackReasons(
  challenge: { sector: string; technologies: string[]; state: string },
  startup: {
    sector: string;
    technologies: string[];
    deployments: unknown[];
    evidence_score: number;
    coverage: string[];
  },
  score: ScoreBreakdown,
) {
  const reasons: string[] = [];
  if (challenge.sector === startup.sector)
    reasons.push(`Operates in the same sector (${challenge.sector}).`);
  const shared = challenge.technologies.filter((t) =>
    startup.technologies.some((s) => s.toLowerCase().includes(t.toLowerCase())),
  );
  if (shared.length) reasons.push(`Technology overlap on ${shared.join(", ")}.`);
  const dep = Array.isArray(startup.deployments) ? startup.deployments.length : 0;
  if (dep) reasons.push(`${dep} prior deployment${dep > 1 ? "s" : ""} in comparable environments.`);
  if (startup.evidence_score >= 70)
    reasons.push(`Strong verified evidence base (${startup.evidence_score}/100).`);
  if (startup.coverage?.includes(challenge.state))
    reasons.push(`Already operating in ${challenge.state}.`);
  if (!reasons.length)
    reasons.push("Partial alignment based on solution description and sector proximity.");

  const limitations: string[] = [];
  if (score.evidence_strength < 70)
    limitations.push("Evidence base is thin for this problem class.");
  if (score.technology_fit < 70) limitations.push("Not all required technologies are covered.");
  if (!dep) limitations.push("No documented prior government deployment.");
  if (!limitations.length)
    limitations.push("Deployment scale is larger than previous engagements.");

  return { reasons, limitations };
}
