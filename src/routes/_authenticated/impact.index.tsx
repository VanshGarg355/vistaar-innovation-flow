import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Gauge, Users2 } from "lucide-react";

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
import { listImpact, listPilots } from "@/services/api";

export const Route = createFileRoute("/_authenticated/impact/")({
  head: () => ({
    meta: [
      { title: "Impact — VISTAAR" },
      {
        name: "description",
        content:
          "Measurable impact evaluation across VISTAAR pilots: KPIs, beneficiaries and composite scores.",
      },
      { property: "og:title", content: "Impact — VISTAAR" },
      { property: "og:description", content: "Evidence-driven impact scores and KPIs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ImpactPage,
});

function ImpactPage() {
  const impact = useQuery({ queryKey: ["impact"], queryFn: listImpact });
  const pilots = useQuery({ queryKey: ["pilots"], queryFn: listPilots });

  if (impact.error)
    return (
      <ErrorState message={(impact.error as Error).message} onRetry={() => void impact.refetch()} />
    );

  const rows = impact.data ?? [];
  const avg =
    rows.length > 0
      ? Math.round(rows.reduce((a, b) => a + Number(b.score ?? 0), 0) / rows.length)
      : 0;
  const beneficiaries = rows.reduce((a, b) => a + Number(b.beneficiaries ?? 0), 0);
  const proven = rows.filter((r) => r.score >= 70).length;

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Prove"
        title="Impact"
        description="Composite impact scores across pilots, measured against baseline, cost, adoption and sustainability."
      />

      {impact.isLoading || pilots.isLoading ? (
        <LoadingState rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No impact evaluations yet"
          description="Evaluate a completed pilot inside its detail page to generate a composite impact score."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Evaluated pilots"
              value={rows.length}
              icon={<Gauge className="h-4 w-4" />}
            />
            <StatCard label="Avg impact score" value={avg} suffix="/100" accent="blue" />
            <StatCard label="Proven solutions" value={proven} accent="pink" />
            <StatCard
              label="Beneficiaries"
              value={beneficiaries}
              icon={<Users2 className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {rows.map((imp) => {
              const p = (pilots.data ?? []).find((x) => x.id === imp.pilot_id);
              return (
                <Panel key={imp.id} className="h-full">
                  <div className="flex flex-col gap-6 sm:flex-row">
                    <div className="flex shrink-0 justify-center">
                      <ScoreRing score={imp.score} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{p?.name ?? `Pilot ${imp.pilot_id}`}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p?.department} · {p?.location}
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground">{imp.rationale}</p>
                      <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                        <FactorBar label="Outcome" value={imp.outcome} />
                        <FactorBar label="Efficiency" value={imp.efficiency} />
                        <FactorBar label="Cost effectiveness" value={imp.cost_effectiveness} />
                        <FactorBar label="Adoption" value={imp.adoption} />
                        <FactorBar label="Evidence strength" value={imp.evidence_strength} />
                        <FactorBar label="Sustainability" value={imp.sustainability} />
                      </div>
                      <p className="mt-4 text-xs text-muted-foreground">
                        Beneficiaries: {imp.beneficiaries.toLocaleString()} · Evaluated{" "}
                        {new Date(imp.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
