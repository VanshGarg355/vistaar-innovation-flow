import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Building2,
  Globe2,
  Sparkles,
  Users2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  FactorBar,
  LoadingState,
  Panel,
  ScoreRing,
  SectionTitle,
  StatCard,
} from "@/components/vistaar/Primitives";
import { recommendChallengesForStartup } from "@/lib/ai.functions";
import { getStartup } from "@/services/api";

export const Route = createFileRoute("/_authenticated/startups/$id")({
  head: () => ({
    meta: [
      { title: "Startup profile — VISTAAR" },
      {
        name: "description",
        content: "Full innovator profile, solution details, deployments and evidence strength.",
      },
      { property: "og:title", content: "Startup profile — VISTAAR" },
      { property: "og:description", content: "Innovator profile and evidence track record." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StartupDetail,
});

function StartupDetail() {
  const { id } = Route.useParams();
  const startup = useQuery({ queryKey: ["startup", id], queryFn: () => getStartup(id) });

  if (startup.isLoading) return <LoadingState rows={5} />;
  if (startup.error)
    return (
      <ErrorState
        message={(startup.error as Error).message}
        onRetry={() => void startup.refetch()}
      />
    );
  if (!startup.data)
    return (
      <EmptyState
        title="Solution not found"
        action={
          <Button asChild variant="glass">
            <Link to="/startups">Back to solutions</Link>
          </Button>
        }
      />
    );

  const s = startup.data;

  return (
    <div className="space-y-8">
      <Link
        to="/startups"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All solutions
      </Link>

      <Panel className="lg:col-span-2" glow="purple">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full gradient-border px-2 py-0.5 text-[11px] uppercase tracking-wide">
            {s.sector || "Sector"}
          </span>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {s.state || "State"}
          </span>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {s.deployment_status || s.status || "registered"}
          </span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{s.name}</h1>
        <p className="mt-2 text-sm text-primary">{s.tagline}</p>
        <p className="mt-3 text-muted-foreground">{s.description}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Evidence score"
            value={Math.round(s.evidence_score)}
            icon={<BadgeCheck className="h-4 w-4" />}
          />
          <StatCard
            label="Scale readiness"
            value={Math.round(s.scale_readiness)}
            accent="blue"
            icon={<Globe2 className="h-4 w-4" />}
          />
          <StatCard
            label="Team"
            value={(s.team ?? []).length}
            accent="pink"
            icon={<Users2 className="h-4 w-4" />}
          />
          <StatCard
            label="Deployments"
            value={(s.deployments ?? []).length}
            icon={<Building2 className="h-4 w-4" />}
          />
        </div>
      </Panel>

      <RecommendedChallenges startupId={s.id} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionTitle eyebrow="Discover" title="Problem" />
          <p className="mt-4 text-sm text-muted-foreground">
            {s.problem || "No problem statement provided yet."}
          </p>
          <div className="mt-6">
            <SectionTitle eyebrow="Discover" title="Solution" />
            <p className="mt-4 text-sm text-muted-foreground">
              {s.solution || "No solution description provided yet."}
            </p>
          </div>
          {(s.technologies ?? []).length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Technologies
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(s.technologies ?? []).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(s.coverage ?? []).length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Geographic coverage
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(s.coverage ?? []).map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(s.certifications ?? []).length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Certifications
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(s.certifications ?? []).map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    <Award className="h-3 w-3" /> {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel>
            <SectionTitle eyebrow="Discover" title="Founder & team" />
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Founder</dt>
                <dd>{s.founder || "—"}</dd>
              </div>
            </dl>
            {(s.team ?? []).length > 0 && (
              <ul className="mt-4 space-y-2 text-sm">
                {(s.team ?? []).map((t, i) => (
                  <li key={i} className="rounded-xl border border-border bg-surface/40 p-3">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {(s.deployments ?? []).length > 0 && (
            <Panel>
              <SectionTitle eyebrow="Discover" title="Previous deployments" />
              <ul className="mt-4 space-y-3 text-sm">
                {(s.deployments ?? []).map((d, i) => (
                  <li key={i} className="rounded-xl border border-border bg-surface/40 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{d.city}</p>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {d.year}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{d.scope}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {(s.case_studies ?? []).length > 0 && (
            <Panel>
              <SectionTitle eyebrow="Prove" title="Case studies" />
              <ul className="mt-4 space-y-3 text-sm">
                {(s.case_studies ?? []).map((c, i) => (
                  <li key={i} className="rounded-xl border border-border bg-surface/40 p-3">
                    <p className="font-medium">{c.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.result}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {(s.kpis ?? []).length > 0 && (
            <Panel glow="blue">
              <SectionTitle eyebrow="Prove" title="Track record KPIs" />
              <ul className="mt-4 space-y-2 text-sm">
                {(s.kpis ?? []).map((k, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface/40 px-3 py-2"
                  >
                    <span>{k.kpi}</span>
                    <span className="font-semibold text-primary">{k.value}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

/** "Recommended Challenges" — inverse of the challenge-side AI Match: scores
 *  every published challenge against this startup using the same deterministic
 *  weighted engine (scoreMatch), so the numbers here are directly comparable
 *  to the scores government officers see on the challenge detail page. */
function RecommendedChallenges({ startupId }: { startupId: string }) {
  const recommend = useServerFn(recommendChallengesForStartup);
  const recs = useMutation({
    mutationFn: () => recommend({ data: { startupId } }),
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not load recommended challenges"),
  });

  useEffect(() => {
    void recs.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startupId]);

  return (
    <Panel glow="pink">
      <SectionTitle
        eyebrow="Match"
        title="Recommended challenges"
        description="Published government challenges ranked against this profile."
      />
      {recs.isPending ? (
        <LoadingState rows={3} />
      ) : (recs.data?.recommendations ?? []).length === 0 ? (
        <EmptyState
          title="No published challenges match this profile yet"
          description="Recommendations refresh automatically as new challenges are published."
        />
      ) : (
        <div className="space-y-3">
          {recs.data!.recommendations.map((r) => (
            <Link
              key={r.challenge.id}
              to="/challenges/$id"
              params={{ id: r.challenge.id }}
              className="flex flex-col gap-4 rounded-xl border border-border bg-surface/40 p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{r.challenge.title}</p>
                  {r.cached && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      <Sparkles className="h-3 w-3" /> AI reasoned
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.challenge.department}
                  {r.challenge.sector ? ` · ${r.challenge.sector}` : ""}
                </p>
                <div className="mt-3 grid max-w-md grid-cols-2 gap-x-4 gap-y-2">
                  <FactorBar label="Problem fit" value={r.score.problem_fit} />
                  <FactorBar label="Technology fit" value={r.score.technology_fit} />
                </div>
              </div>
              <ScoreRing score={r.score.overall_score} size={88} />
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}
