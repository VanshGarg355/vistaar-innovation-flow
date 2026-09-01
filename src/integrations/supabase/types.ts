export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_model_versions: {
        Row: {
          created_at: string;
          dataset_size: number;
          id: string;
          is_active: boolean;
          metrics: Json;
          notes: string;
          trained_at: string;
          version: string;
        };
        Insert: {
          created_at?: string;
          dataset_size?: number;
          id?: string;
          is_active?: boolean;
          metrics?: Json;
          notes?: string;
          trained_at?: string;
          version: string;
        };
        Update: {
          created_at?: string;
          dataset_size?: number;
          id?: string;
          is_active?: boolean;
          metrics?: Json;
          notes?: string;
          trained_at?: string;
          version?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          action: string;
          created_at: string;
          entity: string;
          entity_id: string;
          id: string;
          new_value: string;
          prev_value: string;
          role: string;
          status: string;
          user_email: string;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity?: string;
          entity_id?: string;
          id?: string;
          new_value?: string;
          prev_value?: string;
          role?: string;
          status?: string;
          user_email?: string;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity?: string;
          entity_id?: string;
          id?: string;
          new_value?: string;
          prev_value?: string;
          role?: string;
          status?: string;
          user_email?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          beneficiaries: string;
          budget: number;
          capabilities: string[];
          category: string;
          certifications: string;
          created_at: string;
          created_by: string | null;
          current_process: string;
          deadline: string | null;
          department: string;
          eligibility: string;
          expected_outcome: string;
          id: string;
          kpis: Json;
          limitations: string;
          location: string;
          priority: string;
          problem_statement: string;
          sector: string;
          state: string;
          status: string;
          technologies: string[];
          timeline: string;
          title: string;
        };
        Insert: {
          beneficiaries?: string;
          budget?: number;
          capabilities?: string[];
          category?: string;
          certifications?: string;
          created_at?: string;
          created_by?: string | null;
          current_process?: string;
          deadline?: string | null;
          department?: string;
          eligibility?: string;
          expected_outcome?: string;
          id?: string;
          kpis?: Json;
          limitations?: string;
          location?: string;
          priority?: string;
          problem_statement?: string;
          sector?: string;
          state?: string;
          status?: string;
          technologies?: string[];
          timeline?: string;
          title: string;
        };
        Update: {
          beneficiaries?: string;
          budget?: number;
          capabilities?: string[];
          category?: string;
          certifications?: string;
          created_at?: string;
          created_by?: string | null;
          current_process?: string;
          deadline?: string | null;
          department?: string;
          eligibility?: string;
          expected_outcome?: string;
          id?: string;
          kpis?: Json;
          limitations?: string;
          location?: string;
          priority?: string;
          problem_statement?: string;
          sector?: string;
          state?: string;
          status?: string;
          technologies?: string[];
          timeline?: string;
          title?: string;
        };
        Relationships: [];
      };
      departments: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          state: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          state?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          state?: string;
        };
        Relationships: [];
      };
      evidence: {
        Row: {
          actual: number | null;
          ai_analysis: Json;
          baseline: number | null;
          created_at: string;
          data_source: string;
          file_name: string;
          id: string;
          improvement_pct: number | null;
          kind: string;
          kpi: string;
          location: string;
          pilot_id: string | null;
          raw_data: string;
          responsible_person: string;
          startup_id: string | null;
          submitted_by: string | null;
          target: number | null;
          title: string;
          unit: string;
          verification_status: string;
          verifier_notes: string;
        };
        Insert: {
          actual?: number | null;
          ai_analysis?: Json;
          baseline?: number | null;
          created_at?: string;
          data_source?: string;
          file_name?: string;
          id?: string;
          improvement_pct?: number | null;
          kind?: string;
          kpi?: string;
          location?: string;
          pilot_id?: string | null;
          raw_data?: string;
          responsible_person?: string;
          startup_id?: string | null;
          submitted_by?: string | null;
          target?: number | null;
          title: string;
          unit?: string;
          verification_status?: string;
          verifier_notes?: string;
        };
        Update: {
          actual?: number | null;
          ai_analysis?: Json;
          baseline?: number | null;
          created_at?: string;
          data_source?: string;
          file_name?: string;
          id?: string;
          improvement_pct?: number | null;
          kind?: string;
          kpi?: string;
          location?: string;
          pilot_id?: string | null;
          raw_data?: string;
          responsible_person?: string;
          startup_id?: string | null;
          submitted_by?: string | null;
          target?: number | null;
          title?: string;
          unit?: string;
          verification_status?: string;
          verifier_notes?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evidence_pilot_id_fkey";
            columns: ["pilot_id"];
            isOneToOne: false;
            referencedRelation: "pilots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evidence_startup_id_fkey";
            columns: ["startup_id"];
            isOneToOne: false;
            referencedRelation: "startups";
            referencedColumns: ["id"];
          },
        ];
      };
      impact_scores: {
        Row: {
          adoption: number;
          beneficiaries: number;
          cost_effectiveness: number;
          created_at: string;
          created_by: string | null;
          efficiency: number;
          evidence_strength: number;
          id: string;
          outcome: number;
          pilot_id: string;
          rationale: string;
          score: number;
          sustainability: number;
        };
        Insert: {
          adoption?: number;
          beneficiaries?: number;
          cost_effectiveness?: number;
          created_at?: string;
          created_by?: string | null;
          efficiency?: number;
          evidence_strength?: number;
          id?: string;
          outcome?: number;
          pilot_id: string;
          rationale?: string;
          score?: number;
          sustainability?: number;
        };
        Update: {
          adoption?: number;
          beneficiaries?: number;
          cost_effectiveness?: number;
          created_at?: string;
          created_by?: string | null;
          efficiency?: number;
          evidence_strength?: number;
          id?: string;
          outcome?: number;
          pilot_id?: string;
          rationale?: string;
          score?: number;
          sustainability?: number;
        };
        Relationships: [
          {
            foreignKeyName: "impact_scores_pilot_id_fkey";
            columns: ["pilot_id"];
            isOneToOne: false;
            referencedRelation: "pilots";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          challenge_id: string;
          confidence: number;
          created_at: string;
          decision: string;
          deployment_readiness: number;
          evidence_strength: number;
          id: string;
          impact_potential: number;
          limitations: string[];
          overall_score: number;
          problem_fit: number;
          reasons: string[];
          scalability: number;
          startup_id: string;
          technology_fit: number;
          trace: Json;
        };
        Insert: {
          challenge_id: string;
          confidence?: number;
          created_at?: string;
          decision?: string;
          deployment_readiness?: number;
          evidence_strength?: number;
          id?: string;
          impact_potential?: number;
          limitations?: string[];
          overall_score?: number;
          problem_fit?: number;
          reasons?: string[];
          scalability?: number;
          startup_id: string;
          technology_fit?: number;
          trace?: Json;
        };
        Update: {
          challenge_id?: string;
          confidence?: number;
          created_at?: string;
          decision?: string;
          deployment_readiness?: number;
          evidence_strength?: number;
          id?: string;
          impact_potential?: number;
          limitations?: string[];
          overall_score?: number;
          problem_fit?: number;
          reasons?: string[];
          scalability?: number;
          startup_id?: string;
          technology_fit?: number;
          trace?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "matches_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_startup_id_fkey";
            columns: ["startup_id"];
            isOneToOne: false;
            referencedRelation: "startups";
            referencedColumns: ["id"];
          },
        ];
      };
      milestones: {
        Row: {
          approved: boolean;
          comments: string;
          created_at: string;
          deadline: string | null;
          id: string;
          name: string;
          owner: string;
          pilot_id: string;
          position: number;
          status: string;
          target: string;
        };
        Insert: {
          approved?: boolean;
          comments?: string;
          created_at?: string;
          deadline?: string | null;
          id?: string;
          name: string;
          owner?: string;
          pilot_id: string;
          position?: number;
          status?: string;
          target?: string;
        };
        Update: {
          approved?: boolean;
          comments?: string;
          created_at?: string;
          deadline?: string | null;
          id?: string;
          name?: string;
          owner?: string;
          pilot_id?: string;
          position?: number;
          status?: string;
          target?: string;
        };
        Relationships: [
          {
            foreignKeyName: "milestones_pilot_id_fkey";
            columns: ["pilot_id"];
            isOneToOne: false;
            referencedRelation: "pilots";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          audience: Database["public"]["Enums"]["app_role"] | null;
          body: string;
          created_at: string;
          id: string;
          kind: string;
          link: string;
          read: boolean;
          title: string;
          user_id: string | null;
        };
        Insert: {
          audience?: Database["public"]["Enums"]["app_role"] | null;
          body?: string;
          created_at?: string;
          id?: string;
          kind?: string;
          link?: string;
          read?: boolean;
          title: string;
          user_id?: string | null;
        };
        Update: {
          audience?: Database["public"]["Enums"]["app_role"] | null;
          body?: string;
          created_at?: string;
          id?: string;
          kind?: string;
          link?: string;
          read?: boolean;
          title?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      pilots: {
        Row: {
          budget: number;
          challenge_id: string | null;
          created_at: string;
          created_by: string | null;
          department: string;
          end_date: string | null;
          id: string;
          kpis: Json;
          location: string;
          name: string;
          objectives: string;
          start_date: string | null;
          startup_id: string | null;
          status: string;
        };
        Insert: {
          budget?: number;
          challenge_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          department?: string;
          end_date?: string | null;
          id?: string;
          kpis?: Json;
          location?: string;
          name: string;
          objectives?: string;
          start_date?: string | null;
          startup_id?: string | null;
          status?: string;
        };
        Update: {
          budget?: number;
          challenge_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          department?: string;
          end_date?: string | null;
          id?: string;
          kpis?: Json;
          location?: string;
          name?: string;
          objectives?: string;
          start_date?: string | null;
          startup_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pilots_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pilots_startup_id_fkey";
            columns: ["startup_id"];
            isOneToOne: false;
            referencedRelation: "startups";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          organization: string;
        };
        Insert: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id: string;
          organization?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          organization?: string;
        };
        Relationships: [];
      };
      scale_projects: {
        Row: {
          ai_recommendation: Json;
          approved_at: string | null;
          approved_by: string | null;
          budget: number;
          created_at: string;
          dependencies: string[];
          expected_beneficiaries: number;
          id: string;
          infrastructure: string;
          pilot_id: string;
          risks: string[];
          status: string;
          target_departments: Json;
          target_states: string[];
          team_requirements: string;
          timeline: string;
        };
        Insert: {
          ai_recommendation?: Json;
          approved_at?: string | null;
          approved_by?: string | null;
          budget?: number;
          created_at?: string;
          dependencies?: string[];
          expected_beneficiaries?: number;
          id?: string;
          infrastructure?: string;
          pilot_id: string;
          risks?: string[];
          status?: string;
          target_departments?: Json;
          target_states?: string[];
          team_requirements?: string;
          timeline?: string;
        };
        Update: {
          ai_recommendation?: Json;
          approved_at?: string | null;
          approved_by?: string | null;
          budget?: number;
          created_at?: string;
          dependencies?: string[];
          expected_beneficiaries?: number;
          id?: string;
          infrastructure?: string;
          pilot_id?: string;
          risks?: string[];
          status?: string;
          target_departments?: Json;
          target_states?: string[];
          team_requirements?: string;
          timeline?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scale_projects_pilot_id_fkey";
            columns: ["pilot_id"];
            isOneToOne: false;
            referencedRelation: "pilots";
            referencedColumns: ["id"];
          },
        ];
      };
      startups: {
        Row: {
          case_studies: Json;
          certifications: string[];
          coverage: string[];
          created_at: string;
          deployment_status: string;
          deployments: Json;
          description: string;
          documents: Json;
          evidence_score: number;
          founder: string;
          id: string;
          kpis: Json;
          name: string;
          owner_id: string | null;
          problem: string;
          scale_readiness: number;
          sector: string;
          solution: string;
          state: string;
          status: string;
          tagline: string;
          team: Json;
          technologies: string[];
        };
        Insert: {
          case_studies?: Json;
          certifications?: string[];
          coverage?: string[];
          created_at?: string;
          deployment_status?: string;
          deployments?: Json;
          description?: string;
          documents?: Json;
          evidence_score?: number;
          founder?: string;
          id?: string;
          kpis?: Json;
          name: string;
          owner_id?: string | null;
          problem?: string;
          scale_readiness?: number;
          sector?: string;
          solution?: string;
          state?: string;
          status?: string;
          tagline?: string;
          team?: Json;
          technologies?: string[];
        };
        Update: {
          case_studies?: Json;
          certifications?: string[];
          coverage?: string[];
          created_at?: string;
          deployment_status?: string;
          deployments?: Json;
          description?: string;
          documents?: Json;
          evidence_score?: number;
          founder?: string;
          id?: string;
          kpis?: Json;
          name?: string;
          owner_id?: string | null;
          problem?: string;
          scale_readiness?: number;
          sector?: string;
          solution?: string;
          state?: string;
          status?: string;
          tagline?: string;
          team?: Json;
          technologies?: string[];
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "government_officer" | "startup_owner" | "evaluator" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["government_officer", "startup_owner", "evaluator", "admin"],
    },
  },
} as const;
