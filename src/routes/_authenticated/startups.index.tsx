import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
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
} from "@/components/vistaar/Primitives";
import { useAuth } from "@/hooks/useAuth";
import { getMyStartup, listStartups, upsertStartup } from "@/services/api";

export const Route = createFileRoute("/_authenticated/startups/")({
  head: () => ({
    meta: [
      { title: "Solutions — VISTAAR" },
      {
        name: "description",
        content: "Browse registered innovator solutions with evidence scores and scale readiness.",
      },
      { property: "og:title", content: "Solutions — VISTAAR" },
      {
        property: "og:description",
        content: "Registered innovators, ranked by verified evidence.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StartupsPage,
});

function StartupsPage() {
  const { session, role } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const startups = useQuery({ queryKey: ["startups"], queryFn: listStartups });
  const mine = useQuery({
    queryKey: ["my-startup", session?.user.id],
    queryFn: () => getMyStartup(session!.user.id),
    enabled: !!session?.user.id && role === "startup_owner",
  });

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    founder: "",
    description: "",
    problem: "",
    solution: "",
    sector: "",
    state: "",
    technologies: "",
    coverage: "",
    certifications: "",
  });

  useEffect(() => {
    const s = mine.data;
    if (!s) return;
    setForm({
      name: s.name ?? "",
      tagline: s.tagline ?? "",
      founder: s.founder ?? "",
      description: s.description ?? "",
      problem: s.problem ?? "",
      solution: s.solution ?? "",
      sector: s.sector ?? "",
      state: s.state ?? "",
      technologies: (s.technologies ?? []).join(", "),
      coverage: (s.coverage ?? []).join(", "),
      certifications: (s.certifications ?? []).join(", "),
    });
  }, [mine.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!session?.user.id) throw new Error("Sign in required");
      if (!form.name.trim() || !form.solution.trim())
        throw new Error("Name and solution are required.");
      return upsertStartup({
        owner_id: session.user.id,
        name: form.name.trim(),
        tagline: form.tagline,
        founder: form.founder,
        description: form.description,
        problem: form.problem,
        solution: form.solution,
        sector: form.sector,
        state: form.state,
        technologies: form.technologies
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        coverage: form.coverage
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        certifications: form.certifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        status: "submitted",
      });
    },
    onSuccess: () => {
      toast.success("Solution profile saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["startups"] });
      void qc.invalidateQueries({ queryKey: ["my-startup"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save profile"),
  });

  if (startups.error)
    return (
      <ErrorState
        message={(startups.error as Error).message}
        onRetry={() => void startups.refetch()}
      />
    );

  const rows = (startups.data ?? []).filter(
    (s) =>
      q.trim() === "" ||
      `${s.name} ${s.solution} ${s.sector} ${s.state}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Discover"
        title="Innovator solutions"
        description="Profiles ranked by verified evidence strength and scale readiness."
        action={
          role === "startup_owner" ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  {mine.data ? "Edit my solution" : "Register my solution"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {mine.data ? "Update solution profile" : "Register solution"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    save.mutate();
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <F
                      label="Startup name"
                      v={form.name}
                      on={(v) => setForm({ ...form, name: v })}
                    />
                    <F
                      label="Tagline"
                      v={form.tagline}
                      on={(v) => setForm({ ...form, tagline: v })}
                    />
                    <F
                      label="Founder"
                      v={form.founder}
                      on={(v) => setForm({ ...form, founder: v })}
                    />
                    <F label="Sector" v={form.sector} on={(v) => setForm({ ...form, sector: v })} />
                    <F label="State" v={form.state} on={(v) => setForm({ ...form, state: v })} />
                    <F
                      label="Technologies (comma separated)"
                      v={form.technologies}
                      on={(v) => setForm({ ...form, technologies: v })}
                    />
                    <F
                      label="Coverage (comma separated)"
                      v={form.coverage}
                      on={(v) => setForm({ ...form, coverage: v })}
                    />
                    <F
                      label="Certifications (comma separated)"
                      v={form.certifications}
                      on={(v) => setForm({ ...form, certifications: v })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prob">Problem you solve</Label>
                    <Textarea
                      id="prob"
                      rows={2}
                      value={form.problem}
                      onChange={(e) => setForm({ ...form, problem: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sol">Solution</Label>
                    <Textarea
                      id="sol"
                      rows={3}
                      value={form.solution}
                      onChange={(e) => setForm({ ...form, solution: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="desc">Description</Label>
                    <Textarea
                      id="desc"
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={save.isPending}>
                    {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                    profile
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          className="pl-9"
          placeholder="Search solutions"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search solutions"
        />
      </div>

      {startups.isLoading ? (
        <LoadingState rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState title="No solutions found" description="Try another search term." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((s) => (
            <Link key={s.id} to="/startups/$id" params={{ id: s.id }}>
              <Panel className="h-full transition-colors hover:border-primary/50">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{s.name}</h3>
                  <span className="rounded-full gradient-border px-2 py-0.5 text-[11px]">
                    {Math.round(s.evidence_score)} EV
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.tagline}</p>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{s.solution}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {s.sector} · {s.state} · scale readiness {Math.round(s.scale_readiness)}
                </p>
              </Panel>
            </Link>
          ))}
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
