import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, FileCheck2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  createEvidence,
  getPilot,
  getStartup,
  listEvidence,
  listMilestones,
  listImpact,
  updateMilestone,
  upsertImpact,
} from "@/services/api";

export const Route = createFileRoute("/_authenticated/pilots/$id")({
  head: () => ({
    meta: [
      { title: "Pilot detail — VISTAAR" },
      {
        name: "description",
        content:
          "Pilot milestones, evidence collection and impact evaluation for government innovation.",
      },
      { property: "og:title", content: "Pilot detail — VISTAAR" },
      { property: "og:description", content: "Milestones, evidence and impact." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PilotDetail,
});

function PilotDetail() {
  const { id } = Route.useParams();
  const { session, role } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const pilot = useQuery({ queryKey: ["pilot", id], queryFn: () => getPilot(id) });
  const milestones = useQuery({
    queryKey: ["milestones", id],
    queryFn: () => listMilestones(id),
  });
  const evidence = useQuery({
    queryKey: ["evidence", id],
    queryFn: () => listEvidence(id),
  });
  const impact = useQuery({
    queryKey: ["impact"],
    queryFn: listImpact,
  });
  const startup = useQuery({
    queryKey: ["startup", pilot.data?.startup_id ?? "__"],
    queryFn: () => getStartup(pilot.data!.startup_id!),
    enabled: !!pilot.data?.startup_id,
  });

  const canVerify = role === "evaluator" || role === "government_officer" || role === "admin";
  const canUpload = role === "startup_owner" || role === "government_officer" || role === "admin";

  const [open, setOpen] = useState(false);
  const [evForm, setEvForm] = useState({
    title: "",
    kind: "kpi_report",
    kpi: "",
    unit: "",
    baseline: "",
    target: "",
    actual: "",
    data_source: "",
    responsible_person: "",
    raw_data: "",
  });

  const saveEvidence = useMutation({
    mutationFn: async () => {
      if (!session?.user.id) throw new Error("Sign in required");
      return createEvidence(
        {
          pilot_id: id,
          startup_id: pilot.data?.startup_id ?? null,
          title: evForm.title.trim(),
          kind: evForm.kind,
          file_name: evForm.title.trim() + ".txt",
          raw_data: evForm.raw_data,
          kpi: evForm.kpi,
          unit: evForm.unit,
          baseline: evForm.baseline ? Number(evForm.baseline) : null,
          target: evForm.target ? Number(evForm.target) : null,
          actual: evForm.actual ? Number(evForm.actual) : null,
          improvement_pct:
            evForm.baseline && evForm.actual
              ? Math.round(
                  ((Number(evForm.actual) - Number(evForm.baseline)) / Number(evForm.baseline)) *
                    100,
                )
              : null,
          data_source: evForm.data_source,
          responsible_person: evForm.responsible_person,
          location: pilot.data?.location ?? "",
          verification_status: "pending",
          verifier_notes: "",
        },
        session.user.id,
      );
    },
    onSuccess: () => {
      toast.success("Evidence submitted");
      setOpen(false);
      setEvForm({
        title: "",
        kind: "kpi_report",
        kpi: "",
        unit: "",
        baseline: "",
        target: "",
        actual: "",
        data_source: "",
        responsible_person: "",
        raw_data: "",
      });
      void qc.invalidateQueries({ queryKey: ["evidence", id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not submit evidence"),
  });

  const markMilestone = useMutation({
    mutationFn: async (mid: string) => {
      return updateMilestone(mid, { status: "completed", approved: true });
    },
    onSuccess: () => {
      toast.success("Milestone marked complete");
      void qc.invalidateQueries({ queryKey: ["milestones", id] });
    },
  });

  const computeImpact = useMutation({
    mutationFn: async () => {
      if (!pilot.data) return;
      const p = pilot.data;
      const rows = evidence.data ?? [];
      const avgImprove =
        rows.length > 0
          ? rows.reduce((a, b) => a + Number(b.improvement_pct ?? 0), 0) / rows.length
          : 0;
      const verified = rows.filter((r) => r.verification_status === "verified").length;
      const evidenceStrength = rows.length > 0 ? Math.round((verified / rows.length) * 100) : 0;
      return upsertImpact({
        pilot_id: p.id,
        score: Math.round(
          Math.min(
            100,
            Math.max(
              0,
              0.3 * avgImprove +
                0.25 * evidenceStrength +
                0.15 * Math.round(100 * (rows.length / 5)) +
                0.15 * 70 +
                0.15 * 65,
            ),
          ),
        ),
        outcome: Math.round(Math.min(100, Math.max(0, avgImprove))),
        efficiency: Math.round(Math.min(100, Math.max(0, avgImprove * 0.8))),
        cost_effectiveness: 70,
        adoption: 65,
        evidence_strength: evidenceStrength,
        sustainability: 65,
        rationale:
          "Automatically scored from evidence improvements, verified count and deployment readiness.",
        beneficiaries: Math.round(1000 + rows.length * 300),
      });
    },
    onSuccess: () => {
      toast.success("Impact evaluated");
      void qc.invalidateQueries({ queryKey: ["impact"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not evaluate impact"),
  });

  if (pilot.isLoading) return <LoadingState rows={5} />;
  if (pilot.error)
    return (
      <ErrorState message={(pilot.error as Error).message} onRetry={() => void pilot.refetch()} />
    );
  if (!pilot.data)
    return (
      <EmptyState
        title="Pilot not found"
        action={
          <Button asChild variant="glass">
            <Link to="/pilots">Back to pilots</Link>
          </Button>
        }
      />
    );

  const p = pilot.data;
  const imp = (impact.data ?? []).find((i) => i.pilot_id === p.id);

  return (
    <div className="space-y-8">
      <Link
        to="/pilots"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All pilots
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" glow="purple">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full gradient-border px-2 py-0.5 text-[11px] uppercase tracking-wide">
              {p.department}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {p.status.replace(/_/g, " ")}
            </span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{p.name}</h1>
          <p className="mt-3 text-muted-foreground">{p.objectives}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Location", p.location],
              ["Budget", `₹${Number(p.budget || 0).toLocaleString("en-IN")}`],
              ["Start", p.start_date ? new Date(p.start_date).toLocaleDateString() : "TBD"],
              ["End", p.end_date ? new Date(p.end_date).toLocaleDateString() : "TBD"],
              ["Startup", startup.data?.name ?? "Assigned solution"],
              ["Challenge", p.challenge_id ?? "Ad-hoc pilot"],
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
        </Panel>

        <div className="space-y-4">
          <Panel glow="blue">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Pilot KPIs
            </h2>
            <div className="mt-4 space-y-3">
              {(p.kpis ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No KPIs defined yet.</p>
              )}
              {(p.kpis ?? []).map((k) => (
                <div key={k.kpi} className="rounded-xl border border-border bg-surface/60 p-3">
                  <p className="text-sm font-medium">{k.kpi}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Baseline {k.baseline ?? "—"} {k.unit} → Target {k.target ?? "—"} {k.unit}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          {canVerify && (
            <Panel glow="pink">
              <h2 className="text-sm font-semibold">Evaluate impact</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Aggregates evidence improvements and verification status into a composite impact
                score.
              </p>
              <Button
                variant="hero"
                className="mt-4 w-full"
                onClick={() => computeImpact.mutate()}
                disabled={computeImpact.isPending || (evidence.data ?? []).length === 0}
              >
                {computeImpact.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Compute impact score
              </Button>
              {imp && (
                <div className="mt-4 flex items-center gap-4">
                  <ScoreRing score={imp.score} />
                  <div className="text-xs text-muted-foreground">
                    {imp.beneficiaries.toLocaleString()} beneficiaries
                  </div>
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>

      <div>
        <SectionTitle
          eyebrow="Test"
          title="Milestones"
          description="Ordered pilot delivery stages."
        />
        <div className="mt-4 space-y-3">
          {milestones.isLoading ? (
            <LoadingState rows={4} />
          ) : (milestones.data ?? []).length === 0 ? (
            <EmptyState title="No milestones yet" />
          ) : (
            <Panel>
              <ol className="space-y-3">
                {(milestones.data ?? []).map((m) => (
                  <li
                    key={m.id}
                    className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-3"
                  >
                    <div
                      className={
                        m.status === "completed" || m.approved
                          ? "text-success"
                          : "text-muted-foreground"
                      }
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{m.name}</p>
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {m.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Owner: {m.owner} · Target: {m.target}{" "}
                        {m.deadline ? ` · Due ${new Date(m.deadline).toLocaleDateString()}` : ""}
                      </p>
                      {m.comments && (
                        <p className="mt-2 text-xs text-muted-foreground">{m.comments}</p>
                      )}
                    </div>
                    {canVerify && m.status !== "completed" && (
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => markMilestone.mutate(m.id)}
                        disabled={markMilestone.isPending}
                      >
                        Mark done
                      </Button>
                    )}
                  </li>
                ))}
              </ol>
            </Panel>
          )}
        </div>
      </div>

      <div>
        <SectionTitle
          eyebrow="Prove"
          title="Evidence"
          description="Upload, verify and transform raw data into structured evidence."
          action={
            canUpload ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Upload className="mr-2 h-4 w-4" /> Submit evidence
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Submit evidence</DialogTitle>
                  </DialogHeader>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveEvidence.mutate();
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <F
                        label="Title"
                        v={evForm.title}
                        on={(v) => setEvForm({ ...evForm, title: v })}
                      />
                      <F
                        label="KPI name"
                        v={evForm.kpi}
                        on={(v) => setEvForm({ ...evForm, kpi: v })}
                      />
                      <F
                        label="Unit"
                        v={evForm.unit}
                        on={(v) => setEvForm({ ...evForm, unit: v })}
                      />
                      <F
                        label="Data source"
                        v={evForm.data_source}
                        on={(v) => setEvForm({ ...evForm, data_source: v })}
                      />
                      <F
                        label="Baseline (number)"
                        v={evForm.baseline}
                        on={(v) => setEvForm({ ...evForm, baseline: v })}
                      />
                      <F
                        label="Target (number)"
                        v={evForm.target}
                        on={(v) => setEvForm({ ...evForm, target: v })}
                      />
                      <F
                        label="Actual (number)"
                        v={evForm.actual}
                        on={(v) => setEvForm({ ...evForm, actual: v })}
                      />
                      <F
                        label="Responsible"
                        v={evForm.responsible_person}
                        on={(v) => setEvForm({ ...evForm, responsible_person: v })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="raw">Raw notes / data</Label>
                      <textarea
                        id="raw"
                        rows={4}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                        value={evForm.raw_data}
                        onChange={(e) => setEvForm({ ...evForm, raw_data: e.target.value })}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="hero"
                      className="w-full"
                      disabled={saveEvidence.isPending}
                    >
                      {saveEvidence.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit for verification
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            ) : undefined
          }
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {evidence.isLoading ? (
            <LoadingState rows={3} />
          ) : (evidence.data ?? []).length === 0 ? (
            <EmptyState
              title="No evidence yet"
              description="Submit PDF, CSV, KPI results or survey outputs to build the evidence passport."
            />
          ) : (
            (evidence.data ?? []).map((e) => (
              <Panel key={e.id} className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 text-primary" />
                      <p className="font-medium">{e.title}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {e.kind.replace(/_/g, " ")} · Submitted{" "}
                      {new Date(e.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={
                      "rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide " +
                      (e.verification_status === "verified"
                        ? "border-success/40 text-success"
                        : e.verification_status === "rejected"
                          ? "border-destructive/40 text-destructive"
                          : "border-border text-muted-foreground")
                    }
                  >
                    {e.verification_status.replace(/_/g, " ")}
                  </span>
                </div>
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="passport">
                    <AccordionTrigger className="text-sm">Evidence passport</AccordionTrigger>
                    <AccordionContent>
                      <dl className="grid gap-3 text-xs sm:grid-cols-2">
                        <div>
                          <dt className="uppercase tracking-wide text-muted-foreground">KPI</dt>
                          <dd className="mt-1">{e.kpi || "—"}</dd>
                        </div>
                        <div>
                          <dt className="uppercase tracking-wide text-muted-foreground">Source</dt>
                          <dd className="mt-1">{e.data_source || "—"}</dd>
                        </div>
                        <div>
                          <dt className="uppercase tracking-wide text-muted-foreground">
                            Baseline
                          </dt>
                          <dd className="mt-1">
                            {e.baseline ?? "—"} {e.unit}
                          </dd>
                        </div>
                        <div>
                          <dt className="uppercase tracking-wide text-muted-foreground">Actual</dt>
                          <dd className="mt-1">
                            {e.actual ?? "—"} {e.unit}
                          </dd>
                        </div>
                        <div>
                          <dt className="uppercase tracking-wide text-muted-foreground">Target</dt>
                          <dd className="mt-1">
                            {e.target ?? "—"} {e.unit}
                          </dd>
                        </div>
                        <div>
                          <dt className="uppercase tracking-wide text-muted-foreground">
                            Improvement
                          </dt>
                          <dd className="mt-1">{e.improvement_pct ?? "—"}%</dd>
                        </div>
                      </dl>
                      {e.ai_analysis?.summary && (
                        <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
                          <p className="uppercase tracking-wide text-primary">AI summary</p>
                          <p className="mt-1 text-foreground/90">{e.ai_analysis.summary}</p>
                        </div>
                      )}
                      {e.ai_analysis?.recommendations &&
                        e.ai_analysis.recommendations.length > 0 && (
                          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                            {e.ai_analysis.recommendations.map((r) => (
                              <li key={r}>• {r}</li>
                            ))}
                          </ul>
                        )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Panel>
            ))
          )}
        </div>
      </div>

      {imp && (
        <div>
          <SectionTitle eyebrow="Prove" title="Impact evaluation" />
          <Panel className="mt-4" glow="pink">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex shrink-0 justify-center">
                <ScoreRing score={imp.score} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{imp.rationale}</p>
                <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  <FactorBar label="Outcome" value={imp.outcome} />
                  <FactorBar label="Efficiency" value={imp.efficiency} />
                  <FactorBar label="Cost effectiveness" value={imp.cost_effectiveness} />
                  <FactorBar label="Adoption" value={imp.adoption} />
                  <FactorBar label="Evidence strength" value={imp.evidence_strength} />
                  <FactorBar label="Sustainability" value={imp.sustainability} />
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Beneficiaries: {imp.beneficiaries.toLocaleString()}</span>
                  <Button
                    asChild
                    variant="glass"
                    size="sm"
                    onClick={() => void navigate({ to: "/scale" })}
                  >
                    <Link to="/scale">Prepare scale plan</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

function F({ label, v, on }: { label: string; v: string; on: (x: string) => void }) {
  const id = label.replace(/\W+/g, "-").toLowerCase();
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}
