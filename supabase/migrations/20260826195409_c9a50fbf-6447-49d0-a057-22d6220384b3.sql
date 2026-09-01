
CREATE TYPE public.app_role AS ENUM ('government_officer','startup_owner','evaluator','admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  organization text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "roles readable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own role insert at signup" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role <> 'admin');

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.departments TO authenticated, anon;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "departments public read" ON public.departments FOR SELECT USING (true);

CREATE TABLE public.startups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  founder text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  problem text NOT NULL DEFAULT '',
  solution text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  technologies text[] NOT NULL DEFAULT '{}',
  team jsonb NOT NULL DEFAULT '[]',
  deployments jsonb NOT NULL DEFAULT '[]',
  case_studies jsonb NOT NULL DEFAULT '[]',
  certifications text[] NOT NULL DEFAULT '{}',
  kpis jsonb NOT NULL DEFAULT '[]',
  coverage text[] NOT NULL DEFAULT '{}',
  documents jsonb NOT NULL DEFAULT '[]',
  evidence_score int NOT NULL DEFAULT 0,
  scale_readiness int NOT NULL DEFAULT 0,
  deployment_status text NOT NULL DEFAULT 'pilot_ready',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.startups TO authenticated;
GRANT ALL ON public.startups TO service_role;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "startups readable by authenticated" ON public.startups FOR SELECT TO authenticated USING (true);
CREATE POLICY "startup owner insert" ON public.startups FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "startup owner update" ON public.startups FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "startup owner delete" ON public.startups FOR DELETE TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  problem_statement text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  current_process text NOT NULL DEFAULT '',
  limitations text NOT NULL DEFAULT '',
  beneficiaries text NOT NULL DEFAULT '',
  expected_outcome text NOT NULL DEFAULT '',
  budget numeric NOT NULL DEFAULT 0,
  timeline text NOT NULL DEFAULT '',
  technologies text[] NOT NULL DEFAULT '{}',
  capabilities text[] NOT NULL DEFAULT '{}',
  kpis jsonb NOT NULL DEFAULT '[]',
  eligibility text NOT NULL DEFAULT '',
  certifications text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'medium',
  deadline date,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenges TO authenticated;
GRANT ALL ON public.challenges TO service_role;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenges readable by authenticated" ON public.challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "gov creates challenges" ON public.challenges FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "gov updates challenges" ON public.challenges FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "gov deletes challenges" ON public.challenges FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  overall_score int NOT NULL DEFAULT 0,
  problem_fit int NOT NULL DEFAULT 0,
  technology_fit int NOT NULL DEFAULT 0,
  impact_potential int NOT NULL DEFAULT 0,
  evidence_strength int NOT NULL DEFAULT 0,
  scalability int NOT NULL DEFAULT 0,
  deployment_readiness int NOT NULL DEFAULT 0,
  reasons text[] NOT NULL DEFAULT '{}',
  limitations text[] NOT NULL DEFAULT '{}',
  confidence int NOT NULL DEFAULT 0,
  trace jsonb NOT NULL DEFAULT '{}',
  decision text NOT NULL DEFAULT 'ai_recommended',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, startup_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches readable by authenticated" ON public.matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "gov manages matches" ON public.matches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.pilots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE SET NULL,
  startup_id uuid REFERENCES public.startups(id) ON DELETE SET NULL,
  department text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  start_date date,
  end_date date,
  budget numeric NOT NULL DEFAULT 0,
  objectives text NOT NULL DEFAULT '',
  kpis jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'not_started',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pilots TO authenticated;
GRANT ALL ON public.pilots TO service_role;
ALTER TABLE public.pilots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pilots readable by authenticated" ON public.pilots FOR SELECT TO authenticated USING (true);
CREATE POLICY "gov manages pilots" ON public.pilots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id uuid NOT NULL REFERENCES public.pilots(id) ON DELETE CASCADE,
  name text NOT NULL,
  owner text NOT NULL DEFAULT '',
  deadline date,
  target text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  comments text NOT NULL DEFAULT '',
  approved boolean NOT NULL DEFAULT false,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestones TO authenticated;
GRANT ALL ON public.milestones TO service_role;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones readable by authenticated" ON public.milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "gov and evaluators manage milestones" ON public.milestones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'evaluator'))
  WITH CHECK (public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'evaluator'));

CREATE TABLE public.evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id uuid REFERENCES public.pilots(id) ON DELETE CASCADE,
  startup_id uuid REFERENCES public.startups(id) ON DELETE SET NULL,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'report',
  file_name text NOT NULL DEFAULT '',
  raw_data text NOT NULL DEFAULT '',
  kpi text NOT NULL DEFAULT '',
  unit text NOT NULL DEFAULT '',
  baseline numeric,
  target numeric,
  actual numeric,
  improvement_pct numeric,
  data_source text NOT NULL DEFAULT '',
  responsible_person text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  verification_status text NOT NULL DEFAULT 'pending',
  verifier_notes text NOT NULL DEFAULT '',
  ai_analysis jsonb NOT NULL DEFAULT '{}',
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence TO authenticated;
GRANT ALL ON public.evidence TO service_role;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evidence readable by authenticated" ON public.evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated submit evidence" ON public.evidence FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "submitter or reviewer updates evidence" ON public.evidence FOR UPDATE TO authenticated
  USING (auth.uid() = submitted_by OR public.has_role(auth.uid(),'evaluator') OR public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = submitted_by OR public.has_role(auth.uid(),'evaluator') OR public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "submitter deletes evidence" ON public.evidence FOR DELETE TO authenticated
  USING (auth.uid() = submitted_by OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.impact_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id uuid NOT NULL REFERENCES public.pilots(id) ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0,
  outcome int NOT NULL DEFAULT 0,
  efficiency int NOT NULL DEFAULT 0,
  cost_effectiveness int NOT NULL DEFAULT 0,
  adoption int NOT NULL DEFAULT 0,
  evidence_strength int NOT NULL DEFAULT 0,
  sustainability int NOT NULL DEFAULT 0,
  rationale text NOT NULL DEFAULT '',
  beneficiaries int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.impact_scores TO authenticated;
GRANT ALL ON public.impact_scores TO service_role;
ALTER TABLE public.impact_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "impact readable by authenticated" ON public.impact_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "reviewers manage impact" ON public.impact_scores FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'evaluator') OR public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'evaluator') OR public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.scale_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id uuid NOT NULL REFERENCES public.pilots(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'assessment',
  target_departments jsonb NOT NULL DEFAULT '[]',
  target_states text[] NOT NULL DEFAULT '{}',
  budget numeric NOT NULL DEFAULT 0,
  infrastructure text NOT NULL DEFAULT '',
  team_requirements text NOT NULL DEFAULT '',
  timeline text NOT NULL DEFAULT '',
  risks text[] NOT NULL DEFAULT '{}',
  dependencies text[] NOT NULL DEFAULT '{}',
  expected_beneficiaries int NOT NULL DEFAULT 0,
  ai_recommendation jsonb NOT NULL DEFAULT '{}',
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scale_projects TO authenticated;
GRANT ALL ON public.scale_projects TO service_role;
ALTER TABLE public.scale_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scale readable by authenticated" ON public.scale_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "gov manages scale" ON public.scale_projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'government_officer') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  audience public.app_role,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'info',
  link text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or role notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (audience IS NOT NULL AND public.has_role(auth.uid(), audience)));
CREATE POLICY "authenticated create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "own notifications update" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR (audience IS NOT NULL AND public.has_role(auth.uid(), audience)))
  WITH CHECK (user_id = auth.uid() OR (audience IS NOT NULL AND public.has_role(auth.uid(), audience)));

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  action text NOT NULL,
  entity text NOT NULL DEFAULT '',
  entity_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'success',
  prev_value text NOT NULL DEFAULT '',
  new_value text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit readable by oversight roles" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'government_officer') OR user_id = auth.uid());
CREATE POLICY "authenticated append audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ai_model_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  dataset_size int NOT NULL DEFAULT 0,
  trained_at timestamptz NOT NULL DEFAULT now(),
  metrics jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT false,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ai_model_versions TO authenticated;
GRANT ALL ON public.ai_model_versions TO service_role;
ALTER TABLE public.ai_model_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "models readable by authenticated" ON public.ai_model_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manages models" ON public.ai_model_versions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- seed data
INSERT INTO public.departments (name, state) VALUES
 ('Municipal Corporation','Maharashtra'),
 ('Urban Development','Karnataka'),
 ('Municipal Services','Gujarat'),
 ('Health Department','Rajasthan'),
 ('Water Resources','Tamil Nadu'),
 ('Transport Department','Delhi');

INSERT INTO public.startups (id, name, tagline, founder, description, problem, solution, sector, state, technologies, team, deployments, case_studies, certifications, kpis, coverage, evidence_score, scale_readiness, deployment_status, status) VALUES
('11111111-1111-4111-8111-000000000001','AquaSense AI','Non-revenue water intelligence for cities','Ritu Menon','AquaSense AI uses acoustic IoT sensors and ML to localise pipeline leakage in municipal water networks within 3 metres.','Urban water utilities lose 30-45% of supply to undetected pipeline leakage.','Acoustic sensor mesh + ML leak localisation dashboard with work-order integration.','Water','Maharashtra','{"IoT","Machine Learning","Edge Computing","GIS"}','[{"name":"Ritu Menon","role":"CEO"},{"name":"Arjun Rao","role":"CTO"},{"name":"Sana Iqbal","role":"Head of Deployments"}]','[{"city":"Pune","year":2024,"scope":"120 km network"},{"city":"Nashik","year":2023,"scope":"60 km network"}]','[{"title":"Pune NRW reduction","result":"28% reduction in non-revenue water"}]','{"ISO 27001","BIS Water Metering"}','[{"kpi":"Water loss reduction","value":"28%"},{"kpi":"Detection accuracy","value":"94%"}]','{"Maharashtra","Gujarat"}',87,91,'government_deployed','verified'),
('11111111-1111-4111-8111-000000000002','FlowGrid Mobility','Adaptive signal control for Indian corridors','Karthik Iyer','FlowGrid uses computer vision at junctions to run adaptive signal timing tuned for mixed traffic.','Fixed-time signals cause avoidable congestion on dense urban corridors.','Vision-based adaptive signal controller with corridor-level green wave optimisation.','Mobility','Karnataka','{"Computer Vision","Edge AI","Reinforcement Learning"}','[{"name":"Karthik Iyer","role":"CEO"},{"name":"Neha Shah","role":"Head of AI"}]','[{"city":"Bengaluru","year":2024,"scope":"22 junctions"}]','[{"title":"ORR corridor","result":"19% travel-time reduction"}]','{"ISO 9001"}','[{"kpi":"Travel time","value":"-19%"},{"kpi":"Idle emissions","value":"-14%"}]','{"Karnataka","Telangana"}',78,74,'pilot_ready','verified'),
('11111111-1111-4111-8111-000000000003','BinLogic','AI waste segregation at source','Meera Krishnan','BinLogic deploys vision-enabled smart bins and route optimisation for municipal waste services.','Mixed waste at source makes downstream processing costly and inefficient.','Vision-based bin classification, citizen nudges and dynamic collection routing.','Waste','Gujarat','{"Computer Vision","IoT","Route Optimisation"}','[{"name":"Meera Krishnan","role":"CEO"}]','[{"city":"Surat","year":2024,"scope":"1,200 bins"}]','[{"title":"Surat ward pilot","result":"41% segregation compliance gain"}]','{"CPCB Compliance"}','[{"kpi":"Segregation compliance","value":"+41%"}]','{"Gujarat"}',71,68,'pilot_ready','verified'),
('11111111-1111-4111-8111-000000000004','GramCare Health','Last-mile rural diagnostics','Dr. Anil Verma','GramCare runs tele-diagnostic kiosks with AI triage for primary healthcare in rural blocks.','Rural populations travel 40+ km for basic diagnostics and specialist consults.','Tele-diagnostic kiosk with AI triage, ASHA worker app and specialist routing.','Health','Rajasthan','{"Telemedicine","AI Triage","Mobile Health"}','[{"name":"Dr. Anil Verma","role":"Founder"},{"name":"Pooja Nair","role":"Clinical Lead"}]','[{"city":"Barmer","year":2023,"scope":"18 kiosks"}]','[{"title":"Barmer block","result":"3.2x increase in screenings"}]','{"NABH Tele-health"}','[{"kpi":"Screenings/month","value":"3.2x"},{"kpi":"Referral accuracy","value":"88%"}]','{"Rajasthan","Madhya Pradesh"}',83,79,'government_deployed','verified'),
('11111111-1111-4111-8111-000000000005','PipeNet Analytics','Hydraulic modelling and pressure intelligence','Sanjay Bhatt','PipeNet builds digital twins of distribution networks to predict bursts and optimise pressure zones.','Utilities lack predictive visibility into pipeline stress and burst risk.','Hydraulic digital twin with pressure-zone optimisation and burst risk scoring.','Water','Tamil Nadu','{"Digital Twin","Machine Learning","SCADA Integration"}','[{"name":"Sanjay Bhatt","role":"CEO"}]','[{"city":"Coimbatore","year":2024,"scope":"90 km network"}]','[{"title":"Coimbatore twin","result":"22% fewer burst events"}]','{"ISO 27001"}','[{"kpi":"Burst events","value":"-22%"}]','{"Tamil Nadu"}',74,70,'pilot_ready','verified');

INSERT INTO public.challenges (id, title, problem_statement, department, state, location, sector, category, current_process, limitations, beneficiaries, expected_outcome, budget, timeline, technologies, capabilities, kpis, eligibility, certifications, priority, deadline, status) VALUES
('22222222-2222-4222-8222-000000000001','AI-Based Water Leakage Detection','The city loses an estimated 38% of treated water to undetected distribution losses across a 240 km pipeline network.','Municipal Corporation','Maharashtra','Pune','Water','Infrastructure','Manual valve surveys and complaint-driven leak repair.','Detection is reactive, slow and lacks precise localisation.','2.4 million residents','Reduce non-revenue water by at least 20% within 9 months.',12000000,'9 months','{"IoT","Machine Learning","GIS"}','{"Leak localisation","SCADA integration","Field workflow"}','[{"kpi":"Non-revenue water","baseline":1000,"target":800,"unit":"KL/day"},{"kpi":"Detection time","baseline":72,"target":12,"unit":"hours"}]','Registered Indian entity with prior municipal deployment.','ISO 27001 preferred','high','2026-11-30','published'),
('22222222-2222-4222-8222-000000000002','AI-Based Traffic Optimization','Peak-hour congestion on 18 arterial corridors adds 24 minutes to average commute time.','Urban Development','Karnataka','Bengaluru','Mobility','Traffic Management','Fixed-time signal plans revised twice a year.','No responsiveness to real-time demand or incidents.','5.1 million commuters','Cut average corridor travel time by 15%.',18000000,'12 months','{"Computer Vision","Edge AI"}','{"Adaptive signalling","Corridor coordination"}','[{"kpi":"Travel time","baseline":24,"target":20,"unit":"minutes"}]','Prior deployment in an Indian city required.','ISO 9001 preferred','high','2026-12-15','published'),
('22222222-2222-4222-8222-000000000003','Smart Waste Segregation','Only 34% of household waste is segregated at source, raising processing cost per tonne.','Municipal Services','Gujarat','Surat','Waste','Sanitation','Manual ward-level awareness drives and spot checks.','No measurement, no feedback loop, low compliance.','900,000 households','Increase source segregation compliance to 70%.',7500000,'8 months','{"Computer Vision","IoT"}','{"Bin classification","Citizen engagement"}','[{"kpi":"Segregation compliance","baseline":34,"target":70,"unit":"%"}]','Startups with municipal waste experience.','CPCB compliance','medium','2026-10-31','published'),
('22222222-2222-4222-8222-000000000004','Rural Healthcare Access','Residents in 62 remote villages travel over 40 km for primary diagnostics.','Health Department','Rajasthan','Barmer District','Health','Primary Care','Monthly mobile medical camps.','Limited coverage, no continuity of care, delayed referrals.','480,000 rural residents','Bring basic diagnostics within 5 km for 80% of the population.',22000000,'15 months','{"Telemedicine","AI Triage"}','{"Kiosk deployment","ASHA enablement"}','[{"kpi":"Monthly screenings","baseline":1200,"target":4000,"unit":"screenings"}]','Health-tech entities with rural deployment record.','NABH preferred','high','2027-01-31','published');

INSERT INTO public.matches (challenge_id, startup_id, overall_score, problem_fit, technology_fit, impact_potential, evidence_strength, scalability, deployment_readiness, reasons, limitations, confidence, trace) VALUES
('22222222-2222-4222-8222-000000000001','11111111-1111-4111-8111-000000000001',92,95,90,94,87,91,89,'{"Direct problem alignment with non-revenue water reduction","Acoustic IoT + ML stack matches required technology","Verified 28% reduction in a comparable Indian city","Existing SCADA and GIS integration experience"}','{"Evidence limited to two Maharashtra deployments","Network size 2x larger than prior deployment"}',88,'{"weights":{"problem_fit":30,"technology_fit":20,"impact_potential":20,"evidence_strength":15,"scalability":10,"deployment_readiness":5},"inputs":["challenge KPIs","startup deployments","verified evidence"]}'),
('22222222-2222-4222-8222-000000000001','11111111-1111-4111-8111-000000000005',81,84,82,80,74,78,76,'{"Hydraulic digital twin complements leak localisation","Proven burst-risk reduction in Coimbatore"}','{"No direct acoustic leak detection capability"}',79,'{"weights":{"problem_fit":30,"technology_fit":20,"impact_potential":20,"evidence_strength":15,"scalability":10,"deployment_readiness":5}}'),
('22222222-2222-4222-8222-000000000002','11111111-1111-4111-8111-000000000002',89,92,90,88,78,80,84,'{"Adaptive signal control directly targets corridor travel time","Bengaluru ORR deployment demonstrates 19% improvement"}','{"Evidence from a single city"}',84,'{"weights":{"problem_fit":30,"technology_fit":20,"impact_potential":20,"evidence_strength":15,"scalability":10,"deployment_readiness":5}}');

INSERT INTO public.pilots (id, name, challenge_id, startup_id, department, location, start_date, end_date, budget, objectives, kpis, status) VALUES
('33333333-3333-4333-8333-000000000001','Pune NRW Reduction Pilot','22222222-2222-4222-8222-000000000001','11111111-1111-4111-8111-000000000001','Municipal Corporation','Pune Zone 3','2026-03-01','2026-09-30',4200000,'Deploy acoustic sensing across 60 km of Zone 3 network and reduce non-revenue water by 20%.','[{"kpi":"Non-revenue water","baseline":1000,"target":800,"actual":720,"unit":"KL/day"},{"kpi":"Detection time","baseline":72,"target":12,"actual":9,"unit":"hours"}]','under_review');

INSERT INTO public.milestones (pilot_id, name, owner, deadline, target, status, position, approved) VALUES
('33333333-3333-4333-8333-000000000001','Deployment','AquaSense AI','2026-03-31','Install 240 acoustic nodes','completed',1,true),
('33333333-3333-4333-8333-000000000001','Initial Testing','Municipal Corporation','2026-04-30','Validate detection accuracy > 90%','completed',2,true),
('33333333-3333-4333-8333-000000000001','Data Collection','AquaSense AI','2026-06-30','90 days of continuous flow data','completed',3,true),
('33333333-3333-4333-8333-000000000001','Mid-Term Evaluation','Evaluator Panel','2026-07-31','Interim NRW reduction > 12%','in_progress',4,false),
('33333333-3333-4333-8333-000000000001','Final Evaluation','Evaluator Panel','2026-09-30','Confirm 20% NRW reduction','pending',5,false);

INSERT INTO public.evidence (pilot_id, startup_id, title, kind, file_name, kpi, unit, baseline, target, actual, improvement_pct, data_source, responsible_person, location, verification_status, ai_analysis) VALUES
('33333333-3333-4333-8333-000000000001','11111111-1111-4111-8111-000000000001','Zone 3 monthly flow balance','csv','zone3-flow-june.csv','Non-revenue water','KL/day',1000,800,720,28,'SCADA district metering','Ritu Menon','Pune Zone 3','verified','{"summary":"Flow balance shows a sustained reduction from 1000 to 720 KL/day across 90 days.","confidence":"high","flags":[]}'),
('33333333-3333-4333-8333-000000000001','11111111-1111-4111-8111-000000000001','Leak repair response log','report','repair-log-q2.pdf','Detection time','hours',72,12,9,87.5,'Municipal work-order system','Sana Iqbal','Pune Zone 3','verified','{"summary":"Mean detection-to-repair time fell from 72 to 9 hours.","confidence":"high","flags":[]}');

INSERT INTO public.impact_scores (pilot_id, score, outcome, efficiency, cost_effectiveness, adoption, evidence_strength, sustainability, rationale, beneficiaries) VALUES
('33333333-3333-4333-8333-000000000001',87,92,88,84,80,87,86,'Both primary KPIs exceeded target with verified SCADA-sourced evidence over a 90-day window.',2400000);

INSERT INTO public.ai_model_versions (version, dataset_size, metrics, is_active, notes) VALUES
('vistaar-match-v1.4',18420,'{"match_success_rate":0.86,"precision":0.88,"recall":0.83,"mae_score":4.2}',true,'Weighted multi-factor matcher with LLM explainability layer.'),
('vistaar-match-v1.3',15100,'{"match_success_rate":0.81,"precision":0.83,"recall":0.79,"mae_score":5.6}',false,'Previous production matcher.');
