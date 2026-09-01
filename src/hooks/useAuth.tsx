import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import type { AppRole } from "@/types/vistaar";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  organization: string;
}

interface AuthProfileInput {
  email?: string;
  fullName?: string;
  organization?: string;
  role?: AppRole;
}

interface SignUpResult {
  needsEmailConfirmation: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    fullName: string;
    organization: string;
    role: AppRole;
  }) => Promise<SignUpResult>;
  completeProfile: (input: {
    fullName: string;
    organization: string;
    role: AppRole;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);
const PROFILE_SELECT = "id, full_name, email, organization";
const APP_ROLES: AppRole[] = ["government_officer", "startup_owner", "evaluator", "admin"];

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRole(value: unknown): AppRole | null {
  return APP_ROLES.includes(value as AppRole) ? (value as AppRole) : null;
}

function normalizeSelfServiceRole(value: unknown): AppRole | null {
  const role = normalizeRole(value);
  return role && role !== "admin" ? role : null;
}

function profileSeed(user: User, input: AuthProfileInput = {}): Profile {
  const metadata = user.user_metadata ?? {};
  const email = text(input.email) || text(user.email) || text(metadata.email);
  const fullName =
    text(input.fullName) ||
    text(metadata.full_name) ||
    text(metadata.name) ||
    email.split("@")[0] ||
    "VISTAAR user";

  return {
    id: user.id,
    full_name: fullName,
    email,
    organization: text(input.organization) || text(metadata.organization),
  };
}

function duplicateRow(error: { code?: string } | null) {
  return error?.code === "23505";
}

function authErrorMessage(error: { message?: string } | null | undefined) {
  return error?.message ?? "";
}

function canRetryPasswordSignIn(error: { message?: string } | null | undefined) {
  const message = authErrorMessage(error).toLowerCase();
  return message.includes("invalid login credentials") || message.includes("email not confirmed");
}

function existingAccountResponse(user: User | null) {
  return !!user && Array.isArray(user.identities) && user.identities.length === 0;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function upsertProfile(user: User, input: AuthProfileInput = {}) {
  const row = profileSeed(user, input);
  const res = await supabase
    .from("profiles")
    .upsert(row as never, { onConflict: "id" })
    .select(PROFILE_SELECT)
    .single();

  if (res.error) throw new Error(`Could not save your profile: ${res.error.message}`);
  return (res.data as Profile) ?? row;
}

async function ensureProfile(user: User, input: AuthProfileInput = {}) {
  const existing = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();
  if (existing.error) throw new Error(`Could not load your profile: ${existing.error.message}`);
  if (existing.data) return existing.data as Profile;
  return upsertProfile(user, input);
}

async function readRole(userId: string) {
  const existing = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing.error) throw new Error(`Could not load your role: ${existing.error.message}`);
  return normalizeRole(existing.data?.role);
}

async function ensureRole(user: User, input: AuthProfileInput = {}) {
  const currentRole = await readRole(user.id);
  if (currentRole) return currentRole;

  const intendedRole =
    normalizeSelfServiceRole(input.role) ?? normalizeSelfServiceRole(user.user_metadata?.role);
  if (!intendedRole) return null;

  const inserted = await supabase
    .from("user_roles")
    .insert({ user_id: user.id, role: intendedRole } as never)
    .select("role")
    .maybeSingle();

  if (inserted.error && !duplicateRow(inserted.error)) {
    throw new Error(`Could not assign your role: ${inserted.error.message}`);
  }

  if (inserted.error && duplicateRow(inserted.error)) {
    return readRole(user.id);
  }

  return normalizeRole(inserted.data?.role) ?? intendedRole;
}

async function ensureUserRecords(
  user: User,
  input: AuthProfileInput = {},
  options: { overwriteProfile?: boolean } = {},
) {
  const [nextProfile, nextRole] = await Promise.all([
    options.overwriteProfile ? upsertProfile(user, input) : ensureProfile(user, input),
    ensureRole(user, input),
  ]);

  return { profile: nextProfile, role: nextRole };
}

async function appendAuthAudit(input: {
  userId: string;
  email: string;
  role?: AppRole | null;
  action: string;
  entity: string;
}) {
  await supabase.from("audit_logs").insert({
    user_id: input.userId,
    user_email: input.email,
    role: input.role ?? "",
    action: input.action,
    entity: input.entity,
    entity_id: input.userId,
    status: "success",
  } as never);
}

async function signInAfterBootstrap(email: string, password: string) {
  for (const delay of [250, 750, 1250]) {
    await sleep(delay);
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (!result.error) return result.data;
    if (!canRetryPasswordSignIn(result.error)) throw new Error(result.error.message);
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadContext = useCallback(async (user: User | null | undefined) => {
    if (!user) {
      setProfile(null);
      setRole(null);
      return;
    }

    try {
      const context = await ensureUserRecords(user);
      setProfile(context.profile);
      setRole(context.role);
    } catch (error) {
      console.error("[Auth] Could not load account context", error);
      setProfile(profileSeed(user));
      setRole(normalizeSelfServiceRole(user.user_metadata?.role));
    }
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(true);
      // defer supabase calls out of the auth callback
      setTimeout(() => {
        void loadContext(next?.user).finally(() => setLoading(false));
      }, 0);
    });

    void supabase.auth
      .getSession()
      .then(async ({ data }) => {
        setSession(data.session);
        await loadContext(data.session?.user);
      })
      .catch((error) => {
        console.error("[Auth] Could not restore session", error);
        setSession(null);
        setProfile(null);
        setRole(null);
      })
      .finally(() => setLoading(false));

    return () => sub.subscription.unsubscribe();
  }, [loadContext]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (canRetryPasswordSignIn(error)) {
        throw new Error(
          "Invalid login credentials. Check the email/password, or create a fresh account if this one was not confirmed yet.",
        );
      }
      throw new Error(error.message);
    }

    setSession(data.session);
    if (data.user) {
      const context = await ensureUserRecords(data.user);
      setProfile(context.profile);
      setRole(context.role);
      await appendAuthAudit({
        userId: data.user.id,
        email,
        role: context.role,
        action: "auth.login",
        entity: "session",
      });
    }
  }, []);

  const signUp = useCallback(
    async (input: {
      email: string;
      password: string;
      fullName: string;
      organization: string;
      role: AppRole;
    }) => {
      const selectedRole = normalizeSelfServiceRole(input.role);
      if (!selectedRole) {
        throw new Error("Admin access must be granted by an existing administrator.");
      }

      const cleanInput = {
        email: input.email.trim(),
        fullName: input.fullName.trim(),
        organization: input.organization.trim(),
        role: selectedRole,
      };

      const { data, error } = await supabase.auth.signUp({
        email: cleanInput.email,
        password: input.password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/overview` : "/overview",
          data: {
            full_name: cleanInput.fullName,
            organization: cleanInput.organization,
            role: cleanInput.role,
          },
        },
      });
      if (error) throw new Error(error.message);

      let authData = data;
      if (!authData.session) {
        const bootstrappedSession = await signInAfterBootstrap(cleanInput.email, input.password);
        if (bootstrappedSession?.session && bootstrappedSession.user) {
          authData = bootstrappedSession;
        } else if (existingAccountResponse(data.user)) {
          throw new Error(
            "An account already exists for this email. Log in with its password or use a different email.",
          );
        }
      }

      if (authData.session) setSession(authData.session);
      if (authData.user && authData.session) {
        const context = await ensureUserRecords(authData.user, cleanInput, {
          overwriteProfile: true,
        });
        setProfile(context.profile);
        setRole(context.role);
        await appendAuthAudit({
          userId: authData.user.id,
          email: cleanInput.email,
          role: context.role,
          action: "auth.registered",
          entity: "user",
        });
      }

      return { needsEmailConfirmation: !authData.session };
    },
    [],
  );

  const completeProfile = useCallback(
    async (input: { fullName: string; organization: string; role: AppRole }) => {
      if (!session?.user) throw new Error("You must be signed in.");
      const selectedRole = normalizeSelfServiceRole(input.role);
      if (!selectedRole) {
        throw new Error("Choose Government Officer, Startup Owner or Evaluator.");
      }

      const cleanInput = {
        email: session.user.email ?? "",
        fullName: input.fullName.trim(),
        organization: input.organization.trim(),
        role: selectedRole,
      };

      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: cleanInput.fullName,
          organization: cleanInput.organization,
          role: cleanInput.role,
        },
      });
      if (error) throw new Error(error.message);

      const updatedUser = data.user ?? session.user;
      const context = await ensureUserRecords(updatedUser, cleanInput, { overwriteProfile: true });
      if (!context.role) throw new Error("Could not assign an account role.");

      setSession((current) => (current ? { ...current, user: updatedUser } : current));
      setProfile(context.profile);
      setRole(context.role);
      await appendAuthAudit({
        userId: updatedUser.id,
        email: cleanInput.email,
        role: context.role,
        action: "auth.profile_completed",
        entity: "user",
      });
    },
    [session],
  );

  const signOut = useCallback(async () => {
    const uid = session?.user?.id;
    if (uid) {
      await appendAuthAudit({
        userId: uid,
        email: session?.user?.email ?? "",
        role,
        action: "auth.logout",
        entity: "session",
      });
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setSession(null);
    setProfile(null);
    setRole(null);
  }, [role, session]);

  const refresh = useCallback(async () => {
    await loadContext(session?.user);
  }, [loadContext, session]);

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      role,
      loading,
      signIn,
      signUp,
      completeProfile,
      signOut,
      refresh,
    }),
    [session, profile, role, loading, signIn, signUp, completeProfile, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
