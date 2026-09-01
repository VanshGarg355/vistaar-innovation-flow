import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  BadgeCheck,
  FileSearch,
  Gauge,
  Globe2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Rocket,
  ShieldCheck,
  Target,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VistaarWordmark } from "@/components/vistaar/Brand";
import { useAuth } from "@/hooks/useAuth";
import { listNotifications, markNotificationRead } from "@/services/api";
import { ROLE_LABELS, type AppRole } from "@/types/vistaar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/challenges", label: "Challenges", icon: FileSearch },
  { to: "/startups", label: "Solutions", icon: Rocket },
  { to: "/pilots", label: "Pilots", icon: Target },
  { to: "/evidence", label: "Evidence", icon: BadgeCheck },
  { to: "/impact", label: "Impact", icon: Gauge },
  { to: "/scale", label: "Scale", icon: Globe2 },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
] as const;

const SELF_SERVICE_ROLES = (Object.keys(ROLE_LABELS) as AppRole[]).filter((r) => r !== "admin");

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const notifications = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });
  const unread = (notifications.data ?? []).filter((n) => !n.read).length;

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/auth", replace: true });
  }

  const nav = NAV.filter((n) => n.to !== "/admin" || role === "admin");
  const needsAccountSetup = !loading && !role;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-surface/80 p-4 backdrop-blur-xl transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Link to="/overview" aria-label="VISTAAR overview">
            <VistaarWordmark compact />
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 space-y-1" aria-label="Sections">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "gradient-surface font-semibold text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-4 rounded-xl border border-border bg-background/60 p-3">
          <p className="truncate text-sm font-medium">{profile?.full_name ?? "VISTAAR user"}</p>
          <p className="mt-0.5 text-xs gradient-text font-semibold">
            {role ? ROLE_LABELS[role] : "No role"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/70 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>
          <p className="hidden text-xs uppercase tracking-[0.22em] text-muted-foreground sm:block">
            Discover → Match → Test → Prove → Scale
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full gradient-surface px-1 text-[10px] font-bold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <p className="border-b border-border px-4 py-3 text-sm font-semibold">
                Notifications
              </p>
              <div className="max-h-80 overflow-y-auto">
                {(notifications.data ?? []).length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Nothing yet.
                  </p>
                )}
                {(notifications.data ?? []).map((n) => (
                  <button
                    key={n.id}
                    onClick={async () => {
                      await markNotificationRead(n.id);
                      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
                    }}
                    className={cn(
                      "block w-full border-b border-border px-4 py-3 text-left text-sm hover:bg-accent/40",
                      !n.read && "bg-primary/5",
                    )}
                  >
                    <span className="font-medium">{n.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{n.body}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {needsAccountSetup ? <AccountSetupGate /> : children}
        </main>
      </div>
    </div>
  );
}

function AccountSetupGate() {
  const { profile, completeProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [organization, setOrganization] = useState(profile?.organization ?? "");
  const [selectedRole, setSelectedRole] = useState<AppRole>("government_officer");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setOrganization(profile?.organization ?? "");
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) return setError("Full name is required.");
    if (!organization.trim()) return setError("Organization is required.");

    setBusy(true);
    try {
      await completeProfile({
        fullName: fullName.trim(),
        organization: organization.trim(),
        role: selectedRole,
      });
      toast.success("Account setup completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete account setup");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-2xl items-center justify-center">
      <div className="glass-panel glow-purple w-full p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Account setup
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Finish your VISTAAR profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose the role you need so the platform can unlock the right officer, startup or
          evaluator tools.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="setup-full-name">Full name</Label>
            <Input
              id="setup-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div>
            <Label htmlFor="setup-organization">Organization</Label>
            <Input
              id="setup-organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              autoComplete="organization"
            />
          </div>
          <div>
            <Label htmlFor="setup-role">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as AppRole)}
            >
              <SelectTrigger id="setup-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SELF_SERVICE_ROLES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {ROLE_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save role and continue
          </Button>
        </form>
      </div>
    </div>
  );
}
