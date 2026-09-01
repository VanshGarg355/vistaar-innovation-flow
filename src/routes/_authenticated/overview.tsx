import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, FileSearch, Gauge, Globe2, Rocket, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Panel,
  SectionTitle,
  StatCard,
} from "@/components/vistaar/Primitives";
import { useAuth } from "@/hooks/useAuth";
import {
  listChallenges,
  listEvidence,
  listImpact,
  listPilots,
  listScale,
  listStartups,
} from "@/services/api";
import { ROLE_LABELS } from "@/types/vistaar";

export const Route = createFileRoute("/_authenticated/overview")({
  head: () => ({
    meta: [
      { title: "Overview — VISTAAR" },
      {
        name: "description",
        content:
          "Your VISTAAR lifecycle overview: challenges, matches, pilots, evidence, impact and scale.",
      },
      { property: "og:title", content: "Overview — VISTAAR" },
      {
        property: "og:description",
        content: "Lifecycle overview across challenges, pilots, evidence and scale.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { profile, role } = useAuth();

  const challenges = useQuery({ queryKey: ["challenges"], queryFn: listChallenges });
  const startups = useQuery({ queryKey: ["startups"], queryFn: listStartups });
  const pilots = useQuery({ queryKey: ["pilots"], queryFn: listPilots });
  const evidence = useQuery({ queryKey: ["evidence"], queryFn: () => listEvidence() });
  const impact = useQuery({ queryKey: ["impact"], queryFn: listImpact });
  const scale = useQuery({ queryKey: ["scale"], queryFn: listScale });

  const loading = challenges.isLoading || pilots.isLoading;
  const error = challenges.error ?? pilots.error ?? startups.error;

  if (error)
    return (
      <ErrorState message={(error as Error).message} onRetry={() => void challenges.refetch()} />
    );

  const verified = (evidence.data ?? []).filter((e) => e.verification_status === "verified").length;
  const avgImpact =
    (impact.data ?? []).length > 0
      ? Math.round(
          (impact.data ?? []).reduce((a, b) => a + Number(b.score ?? 0), 0) /
            (impact.data ?? []).length,
        )
      : 0;
  const beneficiaries = (impact.data ?? []).reduce((a, b) => a + Number(b.beneficiaries ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-primary">
          {role ? ROLE_LABELS[role] : "VISTAAR"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Everything from challenge to scale, in one connected lifecycle.
        </p>
      </div>

      {loading ? (
        <LoadingState rows={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Challenges"
            value={(challenges.data ?? []).length}
            icon={<FileSearch className="h-4 w-4" />}
            hint="Published & in progress"
          />
          <StatCard
            label="Solutions"
            value={(startups.data ?? []).length}
            accent="blue"
            icon={<Rocket className="h-4 w-4" />}
            hint="Registered innovators"
          />
          <StatCard
            label="Active pilots"
            value={(pilots.data ?? []).filter((p) => p.status !== "completed").length}
            accent="pink"
            icon={<Target className="h-4 w-4" />}
            hint="Being tested now"
          />
          <StatCard
            label="Verified evidence"
            value={verified}
            icon={<BadgeCheck className="h-4 w-4" />}
            hint="Independently checked"
          />
          <StatCard
            label="Avg impact score"
            value={avgImpact}
            suffix="/100"
            accent="blue"
            icon={<Gauge className="h-4 w-4" />}
          />
          <StatCard
            label="Beneficiaries"
            value={beneficiaries}
            accent="pink"
            hint="Across proven pilots"
          />
          <StatCard
            label="Scale projects"
            value={(scale.data ?? []).length}
            icon={<Globe2 className="h-4 w-4" />}
            hint="Replication plans"
          />
          <StatCard label="Evidence records" value={(evidence.data ?? []).length} accent="blue" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle
            eyebrow="Discover"
            title="Latest challenges"
            action={
              <Button asChild variant="glass" size="sm">
                <Link to="/challenges">View all</Link>
              </Button>
            }
          />
          <div className="mt-4 space-y-3">
            {(challenges.data ?? []).slice(0, 4).map((c) => (
              <Link key={c.id} to="/challenges/$id" params={{ id: c.id }} className="block">
                <Panel className="transition-colors hover:border-primary/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{c.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.department} · {c.location} · {c.sector}
                      </p>
                    </div>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {c.status}
                    </span>
                  </div>
                </Panel>
              </Link>
            ))}
            {(challenges.data ?? []).length === 0 && (
              <EmptyState
                title="No challenges yet"
                description="Publish the first government challenge to start the lifecycle."
                action={
                  <Button asChild variant="hero" size="sm">
                    <Link to="/challenges">Create challenge</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div>
          <SectionTitle
            eyebrow="Test"
            title="Pilots in flight"
            action={
              <Button asChild variant="glass" size="sm">
                <Link to="/pilots">View all</Link>
              </Button>
            }
          />
          <div className="mt-4 space-y-3">
            {(pilots.data ?? []).slice(0, 4).map((p) => (
              <Link key={p.id} to="/pilots/$id" params={{ id: p.id }} className="block">
                <Panel className="transition-colors hover:border-primary/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.department} · {p.location}
                      </p>
                    </div>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {p.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </Panel>
              </Link>
            ))}
            {(pilots.data ?? []).length === 0 && (
              <EmptyState
                title="No pilots yet"
                description="Approve a match to launch the first structured pilot."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
