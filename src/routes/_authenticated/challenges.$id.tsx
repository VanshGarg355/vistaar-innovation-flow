import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Brain, Loader2, Rocket, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  EmptyState,
  ErrorState,
  FactorBar,
  LoadingState,
  Panel,
  ScoreRing,
  SectionTitle,
} from "@/components/vistaar/Primitives";
import { useAuth } from "@/hooks/useAuth";
import { runAiMatch } from "@/lib/ai.functions";
import {
  createPilot,
  getChallenge,
  listMatches,
  listStartups,
  notify,
  updateChallenge,
} from "@/services/api";

export const Route = createFileRoute("/_authenticated/challenges/$id")({
  head: () => ({
    meta: [
      { title: "Challenge detail — VISTAAR" },
      {
        name: "description",
        content: "Challenge detail with AI-matched solutions, decision trace and pilot launch.",
      },
      { property: "og:title", content: "Challenge detail — VISTAAR" },
      { property: "og:description", content: "AI-matched solutions with a full decision trace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChallengeDetail,
});

const INR = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function ChallengeDetail() {
  const { id } = Route.useParams();
  const { session, role } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const match = useServerFn(runAiMatch);

  const challenge = useQuery({ queryKey: ["challenge", id], queryFn: () => getChallenge(id) });
  const matches = useQuery({ queryKey: ["matches", id], queryFn: () => listMatches(id) });
  const startups = useQuery({ queryKey: ["startups"], queryFn: listStartups });

  const runMatch = useMutation({
    mutationFn: () => match({ data: { challengeId: id } }),
    onSuccess: (res) => {
      toast.success(`AI matching complete — ${res.matches} candidates scored`);
      if (res.aiNote) toast.message("Rationale fell back to the deterministic engine");
      void qc.invalidateQueries({ queryKey: ["matches", id] });
      void qc.invalidateQueries({ queryKey: ["challenge", id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "AI matching failed"),
  });

  const launch = useMutation({
    mutationFn: async (startupId: string) => {
      if (!session?.user.id) throw new Error("Sign in required");
      const c = challenge.data!;
      const pilot = await createPilot(
        {
          name: `${c.title} — Pilot`,
          challenge_id: c.id,
          startup_id: startupId,
          department: c.department,
          location: c.location,
          budget: c.budget,
          objectives: c.expected_outcome,
          kpis: c.kpis ?? [],
          status: "in_progress",
        },
        session.user.id,
      );
      await updateChallenge(c.id, { status: "pilot" });
      await notify({
        audience: "startup_owner",
        title: "Pilot approved",
        body: `A pilot has been approved for "${c.title}".`,
        kind: "pilot",
        link: `/pilots/${pilot.id}`,
      });
      return pilot;
    },
    onSuccess: (pilot) => {
      toast.success("Pilot created");
      void qc.invalidateQueries({ queryKey: ["pilots"] });
      void navigate({ to: "/pilots/$id", params: { id: pilot.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create the pilot"),
  });

  if (challenge.isLoading) return <LoadingState rows={5} />;
  if (challenge.error)
    return (
      <ErrorState
        message={(challenge.error as Error).message}
        onRetry={() => void challenge.refetch()}
      />
    );
  if (!challenge.data)
    return (
      <EmptyState
        title="Challenge not found"
        action={
          <Button asChild variant="glass">
            <Link to="/challenges">Back to challenges</Link>
          </Button>
        }
      />
    );

  const c = challenge.data;
  const canDecide = role === "government_officer" || role === "admin";
  const startupById = (sid: string) => (startups.data ?? []).find((s) => s.id === sid);

  return (
    <div className="space-y-8">
      <Link
        to="/challenges"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All challenges
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" glow="purple">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full gradient-border px-2 py-0.5 text-[11px] uppercase tracking-wide">
              {c.sector}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {c.status}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {c.priority} priority
            </span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{c.title}</h1>
          <p className="mt-3 text-muted-foreground">{c.problem_statement}</p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Department", c.department],
              ["Location", `${c.location}${c.state ? `, ${c.state}` : ""}`],
              ["Budget", INR(c.budget)],
              ["Timeline", c.timeline],
              ["Beneficiaries", c.beneficiaries],
              ["Expected outcome", c.expected_outcome],
              ["Current process", c.current_process],
              ["Limitations", c.limitations],
              ["Eligibility", c.eligibility],
              ["Certifications", c.certifications],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="mt-1 text-sm">{v as string}</dd>
                </div>
              ))}
          </dl>

          {(c.technologies?.length || c.capabilities?.length) && (
            <div className="mt-6 flex flex-wrap gap-2">
              {[...(c.technologies ?? []), ...(c.capabilities ?? [])].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel glow="blue">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Success KPIs
            </h2>
            <div className="mt-4 space-y-3">
              {(c.kpis ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No KPIs defined.</p>
              )}
              {(c.kpis ?? []).map((k) => (
                <div key={k.kpi} className="rounded-xl border border-border bg-surface/60 p-3">
                  <p className="text-sm font-medium">{k.kpi}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Baseline {k.baseline ?? "—"} {k.unit} → Target {k.target ?? "—"} {k.unit}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          {canDecide && (
            <Panel glow="pink">
              <h2 className="text-sm font-semibold">Run AI Match</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Scores every registered solution on six weighted factors and generates an
                explainable rationale.
              </p>
              <Button
                variant="hero"
                className="mt-4 w-full"
                onClick={() => runMatch.mutate()}
                disabled={runMatch.isPending}
              >
                {runMatch.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="mr-2 h-4 w-4" />
                )}
                {runMatch.isPending ? "Analysing solutions…" : "Find matching solutions"}
              </Button>
            </Panel>
          )}
        </div>
      </div>

      <div>
        <SectionTitle
          eyebrow="Match"
          title="AI-recommended solutions"
          description="AI recommends. Government decides. Every score is traceable."
        />
        {matches.isLoading ? (
          <LoadingState rows={3} />
        ) : (matches.data ?? []).length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No matches yet"
              description={
                canDecide
                  ? "Run AI Match to score registered solutions against this challenge."
                  : "The department has not run matching for this challenge yet."
              }
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {(matches.data ?? []).map((m) => {
              const s = startupById(m.startup_id);
              return (
                <Panel key={m.id}>
                  <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="flex shrink-0 justify-center">
                      <ScoreRing score={Math.round(m.overall_score)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{s?.name ?? "Solution"}</h3>
                          <p className="text-xs text-muted-foreground">{s?.tagline}</p>
                        </div>
                        <div className="flex gap-2">
                          {s && (
                            <Button asChild variant="glass" size="sm">
                              <Link to="/startups/$id" params={{ id: s.id }}>
                                View profile
                              </Link>
                            </Button>
                          )}
                          {canDecide && (
                            <Button
                              variant="hero"
                              size="sm"
                              onClick={() => launch.mutate(m.startup_id)}
                              disabled={launch.isPending}
                            >
                              {launch.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Rocket className="mr-2 h-4 w-4" />
                              )}
                              Approve pilot
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                        <FactorBar label="Problem fit (30%)" value={m.problem_fit} />
                        <FactorBar label="Technology fit (20%)" value={m.technology_fit} />
                        <FactorBar label="Impact potential (20%)" value={m.impact_potential} />
                        <FactorBar label="Evidence strength (15%)" value={m.evidence_strength} />
                        <FactorBar label="Scalability (10%)" value={m.scalability} />
                        <FactorBar
                          label="Deployment readiness (5%)"
                          value={m.deployment_readiness}
                        />
                      </div>

                      <Accordion type="single" collapsible className="mt-4">
                        <AccordionItem value="why">
                          <AccordionTrigger className="text-sm">
                            <span className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" /> Why this solution?
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-1.5 text-sm text-muted-foreground">
                              {(m.reasons ?? []).map((r) => (
                                <li key={r}>• {r}</li>
                              ))}
                            </ul>
                            {(m.limitations ?? []).length > 0 && (
                              <>
                                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                  Limitations
                                </p>
                                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                                  {(m.limitations ?? []).map((r) => (
                                    <li key={r}>• {r}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="trace">
                          <AccordionTrigger className="text-sm">Decision trace</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-xs text-muted-foreground">
                              Confidence: {Math.round(m.confidence)}%
                            </p>
                            <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-border bg-background/60 p-3 text-[11px] text-muted-foreground">
                              {JSON.stringify(m.trace, null, 2)}
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
