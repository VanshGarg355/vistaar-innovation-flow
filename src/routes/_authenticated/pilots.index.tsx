import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Panel,
  SectionTitle,
} from "@/components/vistaar/Primitives";
import { useAuth } from "@/hooks/useAuth";
import { listPilots } from "@/services/api";

export const Route = createFileRoute("/_authenticated/pilots/")({
  head: () => ({
    meta: [
      { title: "Pilots — VISTAAR" },
      {
        name: "description",
        content: "Manage active pilots, milestones and progress tracking across the lifecycle.",
      },
      { property: "og:title", content: "Pilots — VISTAAR" },
      { property: "og:description", content: "Structured pilots with milestone tracking." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PilotsPage,
});

function PilotsPage() {
  const { role } = useAuth();
  const pilots = useQuery({ queryKey: ["pilots"], queryFn: listPilots });

  if (pilots.error)
    return (
      <ErrorState message={(pilots.error as Error).message} onRetry={() => void pilots.refetch()} />
    );

  const canCreate = role === "government_officer" || role === "admin";

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Test"
        title="Pilots"
        description="Structured pilots connecting challenges with innovator solutions through verified milestones."
        action={
          canCreate ? (
            <Button asChild variant="hero">
              <Link to="/challenges">Launch from a challenge</Link>
            </Button>
          ) : undefined
        }
      />

      {pilots.isLoading ? (
        <LoadingState rows={4} />
      ) : (pilots.data ?? []).length === 0 ? (
        <EmptyState
          title="No pilots yet"
          description="Approve an AI-matched solution inside a challenge to launch the first pilot."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(pilots.data ?? []).map((p) => (
            <Link key={p.id} to="/pilots/$id" params={{ id: p.id }} className="block">
              <Panel className="h-full transition-colors hover:border-primary/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <p className="font-semibold">{p.name}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.department} · {p.location}
                    </p>
                  </div>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {p.status.replace(/_/g, " ")}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <dt className="uppercase tracking-wide">Budget</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      ₹{Number(p.budget || 0).toLocaleString("en-IN")}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wide">Timeline</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {p.start_date ? new Date(p.start_date).toLocaleDateString() : "TBD"}
                    </dd>
                  </div>
                </dl>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
