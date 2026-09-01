import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VistaarWordmark } from "@/components/vistaar/Brand";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS, type AppRole } from "@/types/vistaar";

const PABBLY_WEBHOOK_URL = "https://connect.pabbly.com/webhook-listener/webhook/IjU3NjMwNTZmMDYzNzA0MzE1MjZmNTUzMCI_3D_pc/IjU3NjcwNTY4MDYzNDA0M2Q1MjY4NTUzMjUxMzUi_pc";

async function sendToPabbly(data: Record<string, unknown>) {
  try {
    await fetch(PABBLY_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    // Don't let a webhook failure block auth — just log it
    console.error("Pabbly webhook failed:", err);
  }
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — VISTAAR" },
      {
        name: "description",
        content:
          "Sign in or create a VISTAAR account as a government officer, startup, evaluator or admin.",
      },
      { property: "og:title", content: "Sign in — VISTAAR" },
      {
        property: "og:description",
        content: "Access the government innovation lifecycle platform.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp, session, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [role, setRole] = useState<AppRole>("government_officer");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/overview" });
  }, [loading, session, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!loginEmail.trim() || !loginPw) return setError("Enter your email and password.");

    void sendToPabbly({
      form: "login",
      email: loginEmail.trim(),
      timestamp: new Date().toISOString(),
    });

    setBusy(true);
    try {
      await signIn(loginEmail.trim(), loginPw);
      toast.success("Signed in to VISTAAR");
      await navigate({ to: "/overview" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!name.trim()) return setError("Full name is required.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (!org.trim()) return setError("Organization is required.");
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== pw2) return setError("Passwords do not match.");

    void sendToPabbly({
      form: "signup",
      name: name.trim(),
      email: email.trim(),
      organization: org.trim(),
      role,
      timestamp: new Date().toISOString(),
    });

    setBusy(true);
    try {
      const result = await signUp({
        email: email.trim(),
        password: pw,
        fullName: name.trim(),
        organization: org.trim(),
        role,
      });
      if (result.needsEmailConfirmation) {
        toast.success("Account created. Confirm your email to continue.");
        setMessage("Your account was created. Confirm your email, then log in to use VISTAAR.");
        setLoginEmail(email.trim());
        setLoginPw("");
        setPw("");
        setPw2("");
        setTab("login");
        return;
      }
      toast.success("Account created");
      await navigate({ to: "/overview" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Link to="/" aria-label="VISTAAR home">
            <VistaarWordmark />
          </Link>
          <p className="text-sm text-muted-foreground">
            From Government Challenges to Scalable Impact.
          </p>
        </div>

        <div className="glass-panel glow-purple p-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2 bg-muted/60">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground"
              >
                {error}
              </p>
            )}
            {message && (
              <p
                role="status"
                className="mt-4 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground"
              >
                {message}
              </p>
            )}

            <TabsContent value="login" className="mt-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="officer@gov.in"
                  />
                </div>
                <div>
                  <Label htmlFor="login-pw">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-pw"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      value={loginPw}
                      onChange={(e) => setLoginPw(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Log in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="su-name">Full name</Label>
                  <Input
                    id="su-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label htmlFor="su-email">Email</Label>
                  <Input
                    id="su-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="su-org">Organization</Label>
                  <Input
                    id="su-org"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="Municipal Corporation / Startup name"
                  />
                </div>
                <div>
                  <Label htmlFor="su-role">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                    <SelectTrigger id="su-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ROLE_LABELS) as AppRole[])
                        .filter((r) => r !== "admin")
                        .map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Admin access is granted by an existing administrator.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="su-pw">Password</Label>
                    <Input
                      id="su-pw"
                      type={showPw ? "text" : "password"}
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="su-pw2">Confirm</Label>
                    <Input
                      id="su-pw2"
                      type={showPw ? "text" : "password"}
                      value={pw2}
                      onChange={(e) => setPw2(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden /> Passwords are hashed
            server-side. Every sign-in is written to the audit trail.
          </p>
        </div>
      </motion.div>
    </main>
  );
}