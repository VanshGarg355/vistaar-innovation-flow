export type AppRole = "government_officer" | "startup_owner" | "evaluator" | "admin";

export const ROLE_LABELS: Record<AppRole, string> = {
  government_officer: "Government Officer",
  startup_owner: "Startup Owner",
  evaluator: "Evaluator",
  admin: "Admin",
};

export type ChallengeStatus = "draft" | "published" | "matching" | "pilot" | "completed";
export type PilotStatus = "not_started" | "in_progress" | "under_review" | "completed";
export type VerificationStatus = "pending" | "verified" | "rejected" | "more_evidence";

export interface Kpi {
  kpi: string;
  baseline?: number;
  target?: number;
  actual?: number;
  unit?: string;
}

export interface Challenge {
  id: string;
  created_by: string | null;
  title: string;
  problem_statement: string;
  department: string;
  state: string;
  location: string;
  sector: string;
  category: string;
  current_process: string;
  limitations: string;
  beneficiaries: string;
  expected_outcome: string;
  budget: number;
  timeline: string;
  technologies: string[];
  capabilities: string[];
  kpis: Kpi[];
  eligibility: string;
  certifications: string;
  priority: string;
  deadline: string | null;
  status: string;
  created_at: string;
}

export interface Startup {
  id: string;
  owner_id: string | null;
  name: string;
  tagline: string;
  founder: string;
  description: string;
  problem: string;
  solution: string;
  sector: string;
  state: string;
  technologies: string[];
  team: { name: string; role: string }[];
  deployments: { city: string; year: number; scope: string }[];
  case_studies: { title: string; result: string }[];
  certifications: string[];
  kpis: { kpi: string; value: string }[];
  coverage: string[];
  documents: { name: string; type: string }[];
  evidence_score: number;
  scale_readiness: number;
  deployment_status: string;
  status: string;
  created_at: string;
}

export interface Match {
  id: string;
  challenge_id: string;
  startup_id: string;
  overall_score: number;
  problem_fit: number;
  technology_fit: number;
  impact_potential: number;
  evidence_strength: number;
  scalability: number;
  deployment_readiness: number;
  reasons: string[];
  limitations: string[];
  confidence: number;
  trace: Record<string, unknown>;
  decision: string;
  created_at: string;
}

export interface Pilot {
  id: string;
  name: string;
  challenge_id: string | null;
  startup_id: string | null;
  department: string;
  location: string;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  objectives: string;
  kpis: Kpi[];
  status: string;
  created_by: string | null;
  created_at: string;
}

export interface Milestone {
  id: string;
  pilot_id: string;
  name: string;
  owner: string;
  deadline: string | null;
  target: string;
  status: string;
  comments: string;
  approved: boolean;
  position: number;
}

export interface Evidence {
  id: string;
  pilot_id: string | null;
  startup_id: string | null;
  title: string;
  kind: string;
  file_name: string;
  raw_data: string;
  kpi: string;
  unit: string;
  baseline: number | null;
  target: number | null;
  actual: number | null;
  improvement_pct: number | null;
  data_source: string;
  responsible_person: string;
  location: string;
  verification_status: string;
  verifier_notes: string;
  ai_analysis: {
    summary?: string;
    confidence?: string;
    flags?: string[];
    recommendations?: string[];
  };
  submitted_by: string | null;
  created_at: string;
}

export interface ImpactScore {
  id: string;
  pilot_id: string;
  score: number;
  outcome: number;
  efficiency: number;
  cost_effectiveness: number;
  adoption: number;
  evidence_strength: number;
  sustainability: number;
  rationale: string;
  beneficiaries: number;
  created_at: string;
}

export interface ScaleProject {
  id: string;
  pilot_id: string;
  status: string;
  target_departments: {
    location: string;
    department: string;
    similarity: number;
    expected_impact: string;
    estimated_cost: number;
    complexity: string;
    modifications: string;
    risks: string;
  }[];
  target_states: string[];
  budget: number;
  infrastructure: string;
  team_requirements: string;
  timeline: string;
  risks: string[];
  dependencies: string[];
  expected_beneficiaries: number;
  ai_recommendation: Record<string, unknown>;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string | null;
  audience: AppRole | null;
  title: string;
  body: string;
  kind: string;
  link: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string;
  role: string;
  action: string;
  entity: string;
  entity_id: string;
  status: string;
  prev_value: string;
  new_value: string;
  created_at: string;
}
