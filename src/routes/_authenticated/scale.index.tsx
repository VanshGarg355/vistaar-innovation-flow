import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe2, Loader2, Rocket, ShieldCheck } from "lucide-react";
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
  LoadingState,
  Panel,
  SectionTitle,
  StatCard,
} from "@/components/vistaar/Primitives";
import { useAuth } from "@/hooks/useAuth";
import { approveScale, listImpact, listPilots, listScale, upsertScale } from "@/services/api";

export const Route = createFileRoute("/_authenticated/scale/")({
  head: () => ({
    meta: [
      { title: "Scale — VISTAAR" },
      {
        name: "description",
        content:
          "Scale Engine: replicate proven pilots across departments and states with structured rollout plans.",
      },
      { property: "og:title", content: "Scale — VISTAAR" },
      { property: "og:description", content: "Scale proven innovations across government." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ScalePage,
});

function ScalePage() {
  const { session, role } = useAuth();
  const qc = useQueryClient();
  const scale = useQuery({ queryKey: ["scale"], queryFn: listScale });
  const impact = useQuery({ queryKey: ["impact"], queryFn: listImpact });
  const pilots = useQuery({ queryKey: ["pilots"], queryFn: listPilots });

  const canApprove = role === "government_officer" || role === "admin";

  const planScale = useMutation({
    mutationFn: async () => {
      const proven = (impact.data ?? []).filter((i) => i.score >= 70);
      if (proven.length === 0) throw new Error("No proven pilots to scale yet.");
      for (const imp of proven) {
        const p = (pilots.data ?? []).find((x) => x.id === imp.pilot_id);
        if (!p) continue;
        const existing = (scale.data ?? []).find((s) => s.pilot_id === p.id);
        if (existing) continue;
        await upsertScale({
          pilot_id: p.id,
          status: "assessing",
          target_departments: [
            {
              location: p.location,
              department: p.department,
              similarity: 95,
              expected_impact: "Direct replication of proven pilot model.",
              estimated_cost: Math.round(Number(p.budget) * 1.5),
              complexity: "medium",
              modifications: "Minor adaptation to local IT systems.",
              risks: "Training; integration timelines.",
            },
            {
              location: "Neighboring districts",
              department: p.department,
              similarity: 82,
              expected_impact: "High spillover potential on same KPI set.",
              estimated_cost: Math.round(Number(p.budget) * 2.2),
              complexity: "medium",
              modifications: "Geographic adaptation.",
              risks: "Regional process variation.",
            },
          ],
          target_states: [p?.location?.split(/[,\s]+/).pop() ?? "State 1", "State 2", "State 3"],
          budget: Math.round(Number(p.budget) * 5),
          infrastructure: "Shared IT backbone, field training program, MIS dashboards.",
          team_requirements:
            "Program lead, 4x district coordinators, M&E partner, IT integration team.",
          timeline: "Q1 Planning · Q2-3 Deployment · Q4 Review & second wave",
          risks: ["Training delays", "State-level procurement", "Data integration"],
          dependencies: ["Department sign-off", "State budget allocation", "Change management"],
          expected_beneficiaries: Math.round(Number(imp.beneficiaries) * 5),
          ai_recommendation: {
            suggested_wave: 1,
            readiness: imp.score,
            priority_departments: [p.department],
          },
        });
      }
      await qc.invalidateQueries({ queryKey: ["scale"] });
    },
    onSuccess: () => toast.success("Scale plans generated for proven pilots"),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not generate plans"),
  });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      if (!session?.user.id) throw new Error("Sign in required");
      await approveScale(id, session.user.id);
      await qc.invalidateQueries({ queryKey: ["scale"] });
    },
    onSuccess: () => toast.success("Scale project approved"),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not approve"),
  });

  if (scale.error)
    return (
      <ErrorState message={(scale.error as Error).message} onRetry={() => void scale.refetch()} />
    );

  const rows = scale.data ?? [];
  const approved = rows.filter((r) => r.status === "approved").length;
  const totalBenef = rows.reduce((a, b) => a + Number(b.expected_beneficiaries ?? 0), 0);
  const totalBudget = rows.reduce((a, b) => a + Number(b.budget ?? 0), 0);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Scale"
        title="Scale Engine"
        description="Replicate proven pilots across departments and states with structured rollout plans, risks and approvals."
        action={
          canApprove ? (
            <Button
              variant="hero"
              onClick={() => planScale.mutate()}
              disabled={planScale.isPending}
            >
              {planScale.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Rocket className="mr-2 h-4 w-4" /> Generate scale plans
            </Button>
          ) : undefined
        }
      />

      {scale.isLoading || impact.isLoading || pilots.isLoading ? (
        <LoadingState rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No scale projects yet"
          description="Proven pilots (impact score ≥ 70) can be turned into multi-department scale plans here."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Scale projects"
              value={rows.length}
              icon={<Globe2 className="h-4 w-4" />}
            />
            <StatCard
              label="Approved"
              value={approved}
              accent="blue"
              icon={<ShieldCheck className="h-4 w-4" />}
            />
            <StatCard
              label="Budget planned (₹ Cr)"
              value={Math.round(totalBudget / 10000000)}
              accent="pink"
            />
            <StatCard
              label="Expected beneficiaries"
              value={Math.round(totalBenef / 1000)}
              suffix="K"
              icon={<Globe2 className="h-4 w-4" />}
            />
          </div>

          <div className="space-y-6">
            {rows.map((s) => {
              const p = (pilots.data ?? []).find((x) => x.id === s.pilot_id);
              const imp = (impact.data ?? []).find((i) => i.pilot_id === s.pilot_id);
              return (
                <Panel key={s.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Rocket className="h-4 w-4 text-primary" />
                        <p className="font-semibold">Scale: {p?.name ?? `Pilot ${s.pilot_id}`}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p?.department} · Impact score {imp?.score ?? "—"}/100
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          "rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide " +
                          (s.status === "approved"
                            ? "border-success/40 text-success"
                            : "border-border text-muted-foreground")
                        }
                      >
                        {s.status.replace(/_/g, " ")}
                      </span>
                      {canApprove && s.status !== "approved" && (
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={() => approve.mutate(s.id)}
                          disabled={approve.isPending}
                        >
                          {approve.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Target states
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(s.target_states ?? []).map((st) => (
                          <span
                            key={st}
                            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Budget
                      </p>
                      <p className="mt-2">₹{Number(s.budget || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Expected beneficiaries
                      </p>
                      <p className="mt-2">
                        {Number(s.expected_beneficiaries || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="mt-6">
                    <AccordionItem value="depts">
                      <AccordionTrigger className="text-sm">
                        Target departments &amp; replication sites
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {(s.target_departments ?? []).map((d, i) => (
                            <div
                              key={i}
                              className="rounded-xl border border-border bg-surface/40 p-3 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-medium">
                                  {d.department} · {d.location}
                                </p>
                                <span className="text-primary">{d.similarity}% similar</span>
                              </div>
                              <p className="mt-2 text-muted-foreground">{d.expected_impact}</p>
                              <dl className="mt-3 grid grid-cols-2 gap-2">
                                <div>
                                  <dt className="uppercase tracking-wide text-muted-foreground">
                                    Cost
                                  </dt>
                                  <dd>₹{Number(d.estimated_cost || 0).toLocaleString("en-IN")}</dd>
                                </div>
                                <div>
                                  <dt className="uppercase tracking-wide text-muted-foreground">
                                    Complexity
                                  </dt>
                                  <dd>{d.complexity}</dd>
                                </div>
                              </dl>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="plan">
                      <AccordionTrigger className="text-sm">Rollout plan</AccordionTrigger>
                      <AccordionContent className="space-y-4 text-xs">
                        <div>
                          <p className="uppercase tracking-[0.16em] text-muted-foreground">
                            Timeline
                          </p>
                          <p className="mt-2 text-foreground/90">{s.timeline}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.16em] text-muted-foreground">
                            Infrastructure
                          </p>
                          <p className="mt-2 text-foreground/90">{s.infrastructure}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.16em] text-muted-foreground">Team</p>
                          <p className="mt-2 text-foreground/90">{s.team_requirements}</p>
                        </div>
                        {(s.risks ?? []).length > 0 && (
                          <div>
                            <p className="uppercase tracking-[0.16em] text-muted-foreground">
                              Risks
                            </p>
                            <ul className="mt-2 space-y-1 text-foreground/90">
                              {(s.risks ?? []).map((r) => (
                                <li key={r}>• {r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(s.dependencies ?? []).length > 0 && (
                          <div>
                            <p className="uppercase tracking-[0.16em] text-muted-foreground">
                              Dependencies
                            </p>
                            <ul className="mt-2 space-y-1 text-foreground/90">
                              {(s.dependencies ?? []).map((d) => (
                                <li key={d}>• {d}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Panel>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
