import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Panel,
  SectionTitle,
} from "@/components/vistaar/Primitives";
import { useAuth } from "@/hooks/useAuth";
import { createChallenge, listChallenges, listDepartments } from "@/services/api";

export const Route = createFileRoute("/_authenticated/challenges/")({
  head: () => ({
    meta: [
      { title: "Challenges — VISTAAR" },
      {
        name: "description",
        content: "Browse and publish government challenges awaiting innovative solutions.",
      },
      { property: "og:title", content: "Challenges — VISTAAR" },
      { property: "og:description", content: "Government challenges open for innovation." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChallengesPage,
});

const SECTORS = [
  "Water",
  "Mobility",
  "Health",
  "Energy",
  "Waste",
  "Agriculture",
  "Education",
  "Safety",
];
const PRIORITIES = ["low", "medium", "high", "critical"];

function ChallengesPage() {
  const { session, role } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("all");
  const [open, setOpen] = useState(false);

  const challenges = useQuery({ queryKey: ["challenges"], queryFn: listChallenges });
  const departments = useQuery({ queryKey: ["departments"], queryFn: listDepartments });

  const [form, setForm] = useState({
    title: "",
    problem_statement: "",
    department: "",
    state: "",
    location: "",
    sector: "Water",
    category: "Efficiency",
    current_process: "",
    limitations: "",
    beneficiaries: "",
    expected_outcome: "",
    budget: "",
    timeline: "6 months",
    technologies: "",
    capabilities: "",
    kpiName: "",
    kpiBaseline: "",
    kpiTarget: "",
    kpiUnit: "",
    eligibility: "",
    certifications: "",
    priority: "high",
    deadline: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!session?.user.id) throw new Error("You must be signed in.");
      if (!form.title.trim() || !form.problem_statement.trim() || !form.department.trim())
        throw new Error("Title, problem statement and department are required.");
      return createChallenge(
        {
          title: form.title.trim(),
          problem_statement: form.problem_statement.trim(),
          department: form.department.trim(),
          state: form.state.trim(),
          location: form.location.trim(),
          sector: form.sector,
          category: form.category,
          current_process: form.current_process,
          limitations: form.limitations,
          beneficiaries: form.beneficiaries,
          expected_outcome: form.expected_outcome,
          budget: Number(form.budget || 0),
          timeline: form.timeline,
          technologies: form.technologies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          capabilities: form.capabilities
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          kpis: form.kpiName
            ? [
                {
                  kpi: form.kpiName,
                  baseline: Number(form.kpiBaseline || 0),
                  target: Number(form.kpiTarget || 0),
                  unit: form.kpiUnit,
                },
              ]
            : [],
          eligibility: form.eligibility,
          certifications: form.certifications,
          priority: form.priority,
          deadline: form.deadline || null,
          status: "published",
        },
        session.user.id,
      );
    },
    onSuccess: () => {
      toast.success("Challenge published");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["challenges"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not publish challenge"),
  });

  if (challenges.error)
    return (
      <ErrorState
        message={(challenges.error as Error).message}
        onRetry={() => void challenges.refetch()}
      />
    );

  const rows = (challenges.data ?? []).filter(
    (c) =>
      (sector === "all" || c.sector === sector) &&
      (q.trim() === "" ||
        `${c.title} ${c.problem_statement} ${c.department} ${c.location}`
          .toLowerCase()
          .includes(q.toLowerCase())),
  );

  const canCreate = role === "government_officer" || role === "admin";

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Discover"
        title="Government challenges"
        description="Real public problems, structured so innovators can respond with evidence."
        action={
          canCreate ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="mr-1 h-4 w-4" /> New challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Publish a challenge</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    create.mutate();
                  }}
                >
                  <Field
                    label="Title"
                    value={form.title}
                    onChange={(v) => setForm({ ...form, title: v })}
                  />
                  <div>
                    <Label htmlFor="ps">Problem statement</Label>
                    <Textarea
                      id="ps"
                      rows={3}
                      value={form.problem_statement}
                      onChange={(e) => setForm({ ...form, problem_statement: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="dept">Department</Label>
                      <Select
                        value={form.department}
                        onValueChange={(v) => {
                          const d = (departments.data ?? []).find((x) => x.name === v);
                          setForm({ ...form, department: v, state: d?.state ?? form.state });
                        }}
                      >
                        <SelectTrigger id="dept">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {(departments.data ?? []).map((d) => (
                            <SelectItem key={d.id} value={d.name}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Field
                      label="State"
                      value={form.state}
                      onChange={(v) => setForm({ ...form, state: v })}
                    />
                    <Field
                      label="Location / city"
                      value={form.location}
                      onChange={(v) => setForm({ ...form, location: v })}
                    />
                    <div>
                      <Label htmlFor="sec">Sector</Label>
                      <Select
                        value={form.sector}
                        onValueChange={(v) => setForm({ ...form, sector: v })}
                      >
                        <SelectTrigger id="sec">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTORS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cp">Current process & limitations</Label>
                    <Textarea
                      id="cp"
                      rows={2}
                      value={form.current_process}
                      onChange={(e) => setForm({ ...form, current_process: e.target.value })}
                      placeholder="How is this handled today?"
                    />
                    <Textarea
                      className="mt-2"
                      rows={2}
                      value={form.limitations}
                      onChange={(e) => setForm({ ...form, limitations: e.target.value })}
                      placeholder="Why does it fall short?"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Beneficiaries"
                      value={form.beneficiaries}
                      onChange={(v) => setForm({ ...form, beneficiaries: v })}
                    />
                    <Field
                      label="Expected outcome"
                      value={form.expected_outcome}
                      onChange={(v) => setForm({ ...form, expected_outcome: v })}
                    />
                    <Field
                      label="Budget (INR)"
                      value={form.budget}
                      onChange={(v) => setForm({ ...form, budget: v })}
                      type="number"
                    />
                    <Field
                      label="Timeline"
                      value={form.timeline}
                      onChange={(v) => setForm({ ...form, timeline: v })}
                    />
                    <Field
                      label="Technologies (comma separated)"
                      value={form.technologies}
                      onChange={(v) => setForm({ ...form, technologies: v })}
                    />
                    <Field
                      label="Capabilities (comma separated)"
                      value={form.capabilities}
                      onChange={(v) => setForm({ ...form, capabilities: v })}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <Field
                      label="KPI"
                      value={form.kpiName}
                      onChange={(v) => setForm({ ...form, kpiName: v })}
                    />
                    <Field
                      label="Baseline"
                      value={form.kpiBaseline}
                      onChange={(v) => setForm({ ...form, kpiBaseline: v })}
                      type="number"
                    />
                    <Field
                      label="Target"
                      value={form.kpiTarget}
                      onChange={(v) => setForm({ ...form, kpiTarget: v })}
                      type="number"
                    />
                    <Field
                      label="Unit"
                      value={form.kpiUnit}
                      onChange={(v) => setForm({ ...form, kpiUnit: v })}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field
                      label="Eligibility"
                      value={form.eligibility}
                      onChange={(v) => setForm({ ...form, eligibility: v })}
                    />
                    <div>
                      <Label htmlFor="pri">Priority</Label>
                      <Select
                        value={form.priority}
                        onValueChange={(v) => setForm({ ...form, priority: v })}
                      >
                        <SelectTrigger id="pri">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Field
                      label="Deadline"
                      value={form.deadline}
                      onChange={(v) => setForm({ ...form, deadline: v })}
                      type="date"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    disabled={create.isPending}
                  >
                    {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Publish
                    challenge
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="pl-9"
            placeholder="Search challenges"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search challenges"
          />
        </div>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-[180px]" aria-label="Filter by sector">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sectors</SelectItem>
            {SECTORS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {challenges.isLoading ? (
        <LoadingState rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No challenges found"
          description="Try a different search or sector filter."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((c) => (
            <Link key={c.id} to="/challenges/$id" params={{ id: c.id }}>
              <Panel className="h-full transition-colors hover:border-primary/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full gradient-border px-2 py-0.5 text-[11px] uppercase tracking-wide">
                    {c.sector}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {c.status}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold">{c.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {c.problem_statement}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {c.department} · {c.location} · {c.priority} priority
                </p>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  const id = label.replace(/\W+/g, "-").toLowerCase();
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
