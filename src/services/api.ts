import { supabase } from "@/integrations/supabase/client";
import type {
  AppNotification,
  AppRole,
  AuditLog,
  Challenge,
  Evidence,
  ImpactScore,
  Match,
  Milestone,
  Pilot,
  ScaleProject,
  Startup,
} from "@/types/vistaar";

/**
 * Centralised data-access layer. Components never talk to the backend client
 * directly — every read/write goes through one of these service functions.
 */

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

/* ---------------------------------- audit --------------------------------- */

export interface AuditInput {
  action: string;
  entity: string;
  entity_id?: string;
  status?: string;
  prev_value?: string;
  new_value?: string;
}

export async function logAudit(input: AuditInput) {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) return;
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    user_email: user.email ?? "",
    role: roles?.[0]?.role ?? "",
    action: input.action,
    entity: input.entity,
    entity_id: input.entity_id ?? "",
    status: input.status ?? "success",
    prev_value: input.prev_value ?? "",
    new_value: input.new_value ?? "",
  });
}

export async function listAudit(filters: { action?: string; entity?: string; role?: string } = {}) {
  let q = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (filters.action) q = q.eq("action", filters.action);
  if (filters.entity) q = q.eq("entity", filters.entity);
  if (filters.role) q = q.eq("role", filters.role);
  return unwrap(await q) as AuditLog[];
}

/* -------------------------------- profiles -------------------------------- */

export async function listProfiles() {
  return unwrap(
    await supabase.from("profiles").select("*").order("created_at", { ascending: false }),
  ) as { id: string; full_name: string; email: string; organization: string; created_at: string }[];
}

export async function listUserRoles() {
  return unwrap(await supabase.from("user_roles").select("*")) as {
    id: string;
    user_id: string;
    role: AppRole;
  }[];
}

/* ------------------------------- challenges ------------------------------- */

export async function listChallenges() {
  return unwrap(
    await supabase.from("challenges").select("*").order("created_at", { ascending: false }),
  ) as unknown as Challenge[];
}

export async function getChallenge(id: string) {
  const res = await supabase.from("challenges").select("*").eq("id", id).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return res.data as unknown as Challenge | null;
}

export async function createChallenge(payload: Partial<Challenge>, userId: string) {
  const res = await supabase
    .from("challenges")
    .insert({ ...payload, created_by: userId } as never)
    .select()
    .single();
  if (res.error) throw new Error(res.error.message);
  const row = res.data as unknown as Challenge;
  await logAudit({
    action: payload.status === "published" ? "challenge.published" : "challenge.created",
    entity: "challenge",
    entity_id: row.id,
    new_value: row.title,
  });
  return row;
}

export async function updateChallenge(id: string, patch: Partial<Challenge>) {
  const res = await supabase
    .from("challenges")
    .update(patch as never)
    .eq("id", id)
    .select()
    .single();
  if (res.error) throw new Error(res.error.message);
  await logAudit({
    action: patch.status ? `challenge.${patch.status}` : "challenge.updated",
    entity: "challenge",
    entity_id: id,
    new_value: patch.status ?? "updated",
  });
  return res.data as unknown as Challenge;
}

/* --------------------------------- startups -------------------------------- */

export async function listStartups() {
  return unwrap(
    await supabase.from("startups").select("*").order("evidence_score", { ascending: false }),
  ) as unknown as Startup[];
}

export async function getStartup(id: string) {
  const res = await supabase.from("startups").select("*").eq("id", id).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return res.data as unknown as Startup | null;
}

export async function getMyStartup(userId: string) {
  const res = await supabase.from("startups").select("*").eq("owner_id", userId).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return res.data as unknown as Startup | null;
}

export async function upsertStartup(payload: Partial<Startup> & { owner_id: string }) {
  const existing = payload.id
    ? { id: payload.id }
    : await getMyStartup(payload.owner_id).then((s) => (s ? { id: s.id } : null));
  if (existing) {
    const res = await supabase
      .from("startups")
      .update(payload as never)
      .eq("id", existing.id)
      .select()
      .single();
    if (res.error) throw new Error(res.error.message);
    await logAudit({ action: "startup.updated", entity: "startup", entity_id: existing.id });
    return res.data as unknown as Startup;
  }
  const res = await supabase
    .from("startups")
    .insert(payload as never)
    .select()
    .single();
  if (res.error) throw new Error(res.error.message);
  const row = res.data as unknown as Startup;
  await logAudit({
    action: "startup.submitted",
    entity: "startup",
    entity_id: row.id,
    new_value: row.name,
  });
  return row;
}

/* --------------------------------- matches -------------------------------- */

export async function listMatches(challengeId?: string) {
  let q = supabase.from("matches").select("*").order("overall_score", { ascending: false });
  if (challengeId) q = q.eq("challenge_id", challengeId);
  return unwrap(await q) as unknown as Match[];
}

export async function listMatchesForStartup(startupId: string) {
  return unwrap(
    await supabase
      .from("matches")
      .select("*")
      .eq("startup_id", startupId)
      .order("overall_score", { ascending: false }),
  ) as unknown as Match[];
}

/* --------------------------------- pilots --------------------------------- */

export async function listPilots() {
  return unwrap(
    await supabase.from("pilots").select("*").order("created_at", { ascending: false }),
  ) as unknown as Pilot[];
}

export async function getPilot(id: string) {
  const res = await supabase.from("pilots").select("*").eq("id", id).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return res.data as unknown as Pilot | null;
}

const DEFAULT_MILESTONES = [
  "Deployment",
  "Initial Testing",
  "Data Collection",
  "Mid-Term Evaluation",
  "Final Evaluation",
];

export async function createPilot(payload: Partial<Pilot>, userId: string) {
  const res = await supabase
    .from("pilots")
    .insert({ ...payload, created_by: userId } as never)
    .select()
    .single();
  if (res.error) throw new Error(res.error.message);
  const pilot = res.data as unknown as Pilot;

  await supabase.from("milestones").insert(
    DEFAULT_MILESTONES.map((name, i) => ({
      pilot_id: pilot.id,
      name,
      owner: i % 2 === 0 ? "Startup" : "Government Department",
      target: "To be defined",
      status: "pending",
      position: i + 1,
    })) as never,
  );

  await notify({
    audience: "startup_owner",
    title: "New pilot created",
    body: `${pilot.name} has been created and milestones are ready.`,
    kind: "pilot",
  });
  await logAudit({
    action: "pilot.created",
    entity: "pilot",
    entity_id: pilot.id,
    new_value: pilot.name,
  });
  return pilot;
}

export async function updatePilot(id: string, patch: Partial<Pilot>) {
  const res = await supabase
    .from("pilots")
    .update(patch as never)
    .eq("id", id)
    .select()
    .single();
  if (res.error) throw new Error(res.error.message);
  await logAudit({
    action: "pilot.updated",
    entity: "pilot",
    entity_id: id,
    new_value: patch.status ?? "",
  });
  return res.data as unknown as Pilot;
}

export async function listMilestones(pilotId: string) {
  return unwrap(
    await supabase.from("milestones").select("*").eq("pilot_id", pilotId).order("position"),
  ) as unknown as Milestone[];
}

export async function updateMilestone(id: string, patch: Partial<Milestone>) {
  const res = await supabase
    .from("milestones")
    .update(patch as never)
    .eq("id", id)
    .select()
    .single();
  if (res.error) throw new Error(res.error.message);
  await logAudit({
    action: "milestone.updated",
    entity: "milestone",
    entity_id: id,
    new_value: patch.status ?? "",
  });
  return res.data as unknown as Milestone;
}

/* --------------------------------- evidence -------------------------------- */

export async function listEvidence(pilotId?: string) {
  let q = supabase.from("evidence").select("*").order("created_at", { ascending: false });
  if (pilotId) q = q.eq("pilot_id", pilotId);
  return unwrap(await q) as unknown as Evidence[];
}

export async function createEvidence(payload: Partial<Evidence>, userId: string) {
  const res = await supabase
    .from("evidence")
    .insert({ ...payload, submitted_by: userId } as never)
    .select()
    .single();
  if (res.error) throw new Error(res.error.message);
  const row = res.data as unknown as Evidence;
  await notify({
    audience: "evaluator",
    title: "Evidence awaiting verification",
    body: row.title,
    kind: "evidence",
  });
  await logAudit({
    action: "evidence.uploaded",
    entity: "evidence",
    entity_id: row.id,
    new_value: row.title,
  });
  return row;
}

export async function updateEvidence(id: string, patch: Partial<Evidence>) {
  const res = await supabase
    .from("evidence")
    .update(patch as never)
    .eq("id", id)
    .select()
    .single();
  if (res.error) throw new Error(res.error.message);
  if (patch.verification_status) {
    await logAudit({
      action: `evidence.${patch.verification_status}`,
      entity: "evidence",
      entity_id: id,
      new_value: patch.verification_status,
    });
    await notify({
      audience: "startup_owner",
      title: `Evidence ${patch.verification_status.replace("_", " ")}`,
      body: (res.data as unknown as Evidence).title,
      kind: "evidence",
    });
  }
  return res.data as unknown as Evidence;
}

/* ---------------------------------- impact -------------------------------- */

export async function listImpact() {
  return unwrap(
    await supabase.from("impact_scores").select("*").order("created_at", { ascending: false }),
  ) as unknown as ImpactScore[];
}

export async function upsertImpact(payload: Partial<ImpactScore> & { pilot_id: string }) {
  const existing = await supabase
    .from("impact_scores")
    .select("id")
    .eq("pilot_id", payload.pilot_id)
    .maybeSingle();
  if (existing.data) {
    const res = await supabase
      .from("impact_scores")
      .update(payload as never)
      .eq("id", existing.data.id)
      .select()
      .single();
    if (res.error) throw new Error(res.error.message);
    await logAudit({ action: "impact.evaluated", entity: "impact", entity_id: existing.data.id });
    return res.data as unknown as ImpactScore;
  }
  const res = await supabase
    .from("impact_scores")
    .insert(payload as never)
    .select()
    .single();
  if (res.error) throw new Error(res.error.message);
  await logAudit({ action: "impact.evaluated", entity: "impact", entity_id: payload.pilot_id });
  return res.data as unknown as ImpactScore;
}

/* ---------------------------------- scale --------------------------------- */

export async function listScale() {
  return unwrap(
    await supabase.from("scale_projects").select("*").order("created_at", { ascending: false }),
  ) as unknown as ScaleProject[];
}

export async function upsertScale(payload: Partial<ScaleProject> & { pilot_id: string }) {
  const existing = await supabase
    .from("scale_projects")
    .select("id")
    .eq("pilot_id", payload.pilot_id)
    .maybeSingle();
  if (existing.data) {
    const res = await supabase
      .from("scale_projects")
      .update(payload as never)
      .eq("id", existing.data.id)
      .select()
      .single();
    if (res.error) throw new Error(res.error.message);
    await logAudit({
      action: "scale.updated",
      entity: "scale",
      entity_id: existing.data.id,
      new_value: payload.status ?? "updated",
    });
    return res.data as unknown as ScaleProject;
  }
  const res = await supabase
    .from("scale_projects")
    .insert(payload as never)
    .select()
    .single();
  if (res.error) throw new Error(res.error.message);
  const row = res.data as unknown as ScaleProject;
  await logAudit({
    action: "scale.proposed",
    entity: "scale",
    entity_id: row.id,
    new_value: payload.status ?? "proposed",
  });
  return row;
}

export async function approveScale(id: string, userId: string) {
  const res = await supabase
    .from("scale_projects")
    .update({
      status: "approved",
      approved_by: userId,
      approved_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .select()
    .single();
  if (res.error) throw new Error(res.error.message);
  await logAudit({
    action: "scale.approved",
    entity: "scale",
    entity_id: id,
    new_value: "approved",
  });
  await notify({
    audience: "startup_owner",
    title: "Scale approved",
    body: "A government authority approved scaling of your solution.",
    kind: "scale",
  });
  return res.data as unknown as ScaleProject;
}

/* ------------------------------ notifications ------------------------------ */

export async function notify(input: {
  title: string;
  body?: string;
  kind?: string;
  audience?: AppRole;
  user_id?: string;
  link?: string;
}) {
  await supabase.from("notifications").insert({
    title: input.title,
    body: input.body ?? "",
    kind: input.kind ?? "info",
    audience: input.audience ?? null,
    user_id: input.user_id ?? null,
    link: input.link ?? "",
  } as never);
}

export async function listNotifications() {
  return unwrap(
    await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
  ) as unknown as AppNotification[];
}

export async function markNotificationRead(id: string) {
  await supabase
    .from("notifications")
    .update({ read: true } as never)
    .eq("id", id);
}

/* -------------------------------- ai models -------------------------------- */

export async function listModels() {
  return unwrap(
    await supabase.from("ai_model_versions").select("*").order("created_at", { ascending: false }),
  ) as {
    id: string;
    version: string;
    dataset_size: number;
    trained_at: string;
    metrics: Record<string, number>;
    is_active: boolean;
    notes: string;
  }[];
}

export async function listDepartments() {
  return unwrap(await supabase.from("departments").select("*").order("name")) as {
    id: string;
    name: string;
    state: string;
  }[];
}
