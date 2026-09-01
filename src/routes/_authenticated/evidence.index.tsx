import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileCheck2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Panel,
  SectionTitle,
  StatCard,
} from "@/components/vistaar/Primitives";
import { useAuth } from "@/hooks/useAuth";
import { analyzeEvidence } from "@/lib/ai.functions";
import { createEvidence, getMyStartup, listEvidence } from "@/services/api";

export const Route = createFileRoute("/_authenticated/evidence/")({
  head: () => ({
    meta: [
      { title: "Evidence Maker — VISTAAR" },
      {
        name: "description",
        content:
          "Evidence Maker: upload documents, structure KPI data and build verified evidence passports.",
      },
      { property: "og:title", content: "Evidence Maker — VISTAAR" },
      { property: "og:description", content: "Structured evidence with AI-powered analysis." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EvidencePage,
});

function EvidencePage() {
  const { session, role } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", kpi: "", unit: "", rawData: "" });

  const evidence = useQuery({ queryKey: ["evidence"], queryFn: () => listEvidence() });
  const analyze = useServerFn(analyzeEvidence);

  const submit = useMutation({
    mutationFn: async () => {
      if (!session?.user.id) throw new Error("Sign in required");
      if (!form.title.trim()) throw new Error("Give this evidence a title");
      if (!form.rawData.trim())
        throw new Error("Paste the raw KPI data, report text, or survey notes to analyze");

      // Ask the AI to extract structured KPI fields from the raw text. If the
      // AI gateway isn't configured or is rate-limited, fall back to saving
      // the raw submission as-is rather than blocking the user entirely.
      const result = await analyze({
        data: { title: form.title.trim(), kpi: form.kpi, unit: form.unit, rawData: form.rawData },
      });

      const mine = role === "startup_owner" ? await getMyStartup(session.user.id) : null;

      return createEvidence(
        {
          title: form.title.trim(),
          kind: "report",
          raw_data: form.rawData,
          startup_id: mine?.id ?? null,
          kpi: result.ok ? result.analysis.kpi || form.kpi : form.kpi,
          unit: result.ok ? result.analysis.unit || form.unit : form.unit,
          baseline: result.ok ? result.analysis.baseline : null,
          target: result.ok ? result.analysis.target : null,
          actual: result.ok ? result.analysis.actual : null,
          improvement_pct: result.ok ? result.analysis.improvement_pct : null,
          verification_status: "pending",
          ai_analysis: result.ok
            ? {
                summary: result.analysis.summary,
                confidence: result.analysis.confidence,
                flags: result.analysis.flags,
                recommendations: result.analysis.recommendations,
              }
            : { summary: `AI analysis unavailable: ${result.error}`, flags: [], recommendations: [] },
        },
        session.user.id,
      );
    },
    onSuccess: () => {
      toast.success("Evidence submitted for verification");
      setOpen(false);
      setForm({ title: "", kpi: "", unit: "", rawData: "" });
      void qc.invalidateQueries({ queryKey: ["evidence"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not submit evidence"),
  });

  if (evidence.error)
    return (
      <ErrorState
        message={(evidence.error as Error).message}
        onRetry={() => void evidence.refetch()}
      />
    );

  const canUpload = role === "startup_owner" || role === "government_officer" || role === "admin";
  const rows = evidence.data ?? [];
  const verified = rows.filter((e) => e.verification_status === "verified").length;
  const pending = rows.filter((e) => e.verification_status === "pending").length;
  const avgImprove =
    rows.length > 0
      ? Math.round(rows.reduce((a, b) => a + Number(b.improvement_pct ?? 0), 0) / rows.length)
      : 0;

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Prove"
        title="Evidence Maker"
        description="Upload raw data, structure KPI evidence and build verifiable passports for every pilot."
        action={
          canUpload ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Upload className="mr-2 h-4 w-4" /> New evidence
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit evidence</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit.mutate();
                  }}
                >
                  <div>
                    <Label htmlFor="ev-title">Title</Label>
                    <Input
                      id="ev-title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Q3 pilot performance report"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="ev-kpi">KPI (optional hint)</Label>
                      <Input
                        id="ev-kpi"
                        value={form.kpi}
                        onChange={(e) => setForm({ ...form, kpi: e.target.value })}
                        placeholder="e.g. Segregation compliance"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ev-unit">Unit (optional hint)</Label>
                      <Input
                        id="ev-unit"
                        value={form.unit}
                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        placeholder="e.g. %"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ev-raw">Raw data</Label>
                    <Textarea
                      id="ev-raw"
                      rows={6}
                      value={form.rawData}
                      onChange={(e) => setForm({ ...form, rawData: e.target.value })}
                      placeholder="Paste CSV rows, a report excerpt, or survey notes. The AI will extract baseline, target, actual and improvement % from this."
                    />
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={submit.isPending}>
                    {submit.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing &amp; saving…
                      </>
                    ) : (
                      "Analyze & submit"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {evidence.isLoading ? (
        <LoadingState rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No evidence yet"
          description="Open any pilot to submit KPI data, upload reports and generate AI-structured evidence."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total evidence"
              value={rows.length}
              icon={<FileCheck2 className="h-4 w-4" />}
            />
            <StatCard label="Verified" value={verified} accent="blue" />
            <StatCard label="Pending review" value={pending} accent="pink" />
            <StatCard label="Avg improvement" value={avgImprove} suffix="%" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {rows.map((e) => (
              <Panel key={e.id} className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 text-primary" />
                      <p className="font-medium">{e.title}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {e.kind.replace(/_/g, " ")} · {e.location} ·{" "}
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
                <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="uppercase tracking-wide text-muted-foreground">KPI</dt>
                    <dd className="mt-1">{e.kpi || "—"}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wide text-muted-foreground">Improvement</dt>
                    <dd className="mt-1">{e.improvement_pct ?? "—"}%</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wide text-muted-foreground">Baseline</dt>
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
                </dl>
                {e.ai_analysis?.summary && (
                  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
                    <p className="uppercase tracking-wide text-primary">AI summary</p>
                    <p className="mt-1 text-foreground/90">{e.ai_analysis.summary}</p>
                  </div>
                )}
              </Panel>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
