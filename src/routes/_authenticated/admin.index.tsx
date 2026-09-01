import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shield, Users, Cpu } from "lucide-react";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  Panel,
  SectionTitle,
  StatCard,
} from "@/components/vistaar/Primitives";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/types/vistaar";
import {
  listAudit,
  listDepartments,
  listModels,
  listProfiles,
  listUserRoles,
} from "@/services/api";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — VISTAAR" },
      {
        name: "description",
        content:
          "Admin console: users, roles, departments, AI model configuration and complete audit trail.",
      },
      { property: "og:title", content: "Admin — VISTAAR" },
      { property: "og:description", content: "User management, AI config and audit trail." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { role } = useAuth();
  const profiles = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });
  const roles = useQuery({ queryKey: ["roles"], queryFn: listUserRoles });
  const audit = useQuery({ queryKey: ["audit"], queryFn: () => listAudit() });
  const models = useQuery({ queryKey: ["ai-models"], queryFn: listModels });
  const depts = useQuery({ queryKey: ["departments"], queryFn: listDepartments });

  if (profiles.error || roles.error || audit.error)
    return (
      <ErrorState
        message={((profiles.error ?? roles.error ?? audit.error) as Error)?.message}
        onRetry={() => {
          void profiles.refetch();
          void roles.refetch();
          void audit.refetch();
        }}
      />
    );

  const isAdmin = role === "admin";
  const users = profiles.data ?? [];
  const roleRows = roles.data ?? [];
  const auditRows = audit.data ?? [];
  const modelRows = models.data ?? [];
  const deptRows = depts.data ?? [];

  const roleOf = (uid: string) => roleRows.find((r) => r.user_id === uid)?.role;

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Admin"
        title="Platform administration"
        description="Users, roles, departments, AI model configuration and a complete auditable activity trail."
      />

      {profiles.isLoading || roles.isLoading || audit.isLoading ? (
        <LoadingState rows={4} />
      ) : !isAdmin ? (
        <EmptyState
          title="Admin access required"
          description="This console is restricted to platform administrators."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Registered users"
              value={users.length}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              label="Audit events"
              value={auditRows.length}
              accent="blue"
              icon={<Shield className="h-4 w-4" />}
            />
            <StatCard
              label="AI model versions"
              value={modelRows.length}
              accent="pink"
              icon={<Cpu className="h-4 w-4" />}
            />
            <StatCard label="Departments" value={deptRows.length} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel>
              <SectionTitle eyebrow="Admin" title="Users &amp; roles" />
              <ul className="mt-4 space-y-3">
                {users.length === 0 && (
                  <EmptyState title="No users yet" description="Sign-ups will appear here." />
                )}
                {users.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/40 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{u.full_name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {roleOf(u.id) ? ROLE_LABELS[roleOf(u.id)!] : (u.organization ?? "Pending")}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <SectionTitle eyebrow="Admin" title="Departments" />
              <ul className="mt-4 space-y-3">
                {deptRows.length === 0 && (
                  <EmptyState title="No departments yet" description="Seed departments first." />
                )}
                {deptRows.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-xl border border-border bg-surface/40 px-4 py-3 text-sm"
                  >
                    <p className="font-medium">{d.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{d.state}</p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel glow="blue">
              <SectionTitle eyebrow="Admin" title="AI model versions" />
              <ul className="mt-4 space-y-3 text-sm">
                {modelRows.length === 0 && (
                  <EmptyState
                    title="No model versions registered"
                    description="The match engine currently uses a deterministic fallback."
                  />
                )}
                {modelRows.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-xl border border-border bg-surface/40 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {m.version}{" "}
                        {m.is_active && (
                          <span className="ml-2 rounded-full border border-success/40 px-2 py-0.5 text-[10px] uppercase text-success">
                            Active
                          </span>
                        )}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {m.dataset_size.toLocaleString()} training rows
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{m.notes}</p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <SectionTitle eyebrow="Admin" title="Recent audit trail" />
              <ul className="mt-4 max-h-[520px] space-y-2 overflow-auto text-xs">
                {auditRows.length === 0 && <EmptyState title="No activity yet" />}
                {auditRows.slice(0, 50).map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-border bg-surface/40 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p>
                        <span className="font-medium">{a.action}</span>
                        <span className="mx-2 text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{a.entity}</span>
                        {a.action.includes(".ai_") && (
                          <span className="ml-2 rounded-full border border-primary/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
                            AI
                          </span>
                        )}
                      </p>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {a.status}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {a.user_email} ·{" "}
                      {a.role
                        ? (ROLE_LABELS[a.role as keyof typeof ROLE_LABELS] ?? a.role)
                        : "no-role"}{" "}
                      · {new Date(a.created_at).toLocaleString()}
                    </p>
                    {a.new_value && (
                      <p className="mt-1 truncate text-muted-foreground/80">{a.new_value}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
