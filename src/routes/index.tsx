import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Building2,
  FileSearch,
  Gauge,
  Globe2,
  Layers,
  Rocket,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { VistaarWordmark } from "@/components/vistaar/Brand";
import { EvidenceFlow, LifecycleNetwork, ScaleRipple } from "@/components/vistaar/LifecycleNetwork";
import { Panel } from "@/components/vistaar/Primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VISTAAR — From Government Challenges to Scalable Impact" },
      {
        name: "description",
        content:
          "VISTAAR is an evidence-driven government innovation lifecycle platform: discover innovators, AI-match solutions to challenges, run structured pilots, prove impact and scale what works.",
      },
      { property: "og:title", content: "VISTAAR — From Government Challenges to Scalable Impact" },
      {
        property: "og:description",
        content:
          "Discover the right innovation. Match with confidence. Test with structure. Prove with evidence. Scale what works.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const LIFECYCLE = [
  {
    key: "DISCOVER",
    icon: FileSearch,
    text: "Publish challenges and surface the innovators who can actually solve them.",
  },
  {
    key: "MATCH",
    icon: Brain,
    text: "Weighted AI matching with a full decision trace — never a black box.",
  },
  {
    key: "TEST",
    icon: Target,
    text: "Structured pilots with milestones, owners, deadlines and KPI targets.",
  },
  {
    key: "PROVE",
    icon: BadgeCheck,
    text: "Evidence passports, verification and an auditable impact score.",
  },
  { key: "SCALE", icon: Globe2, text: "Replicate proven solutions across departments and states." },
];

const PROBLEMS = [
  "The right solutions are difficult to discover",
  "Startups are hard to compare objectively",
  "Pilots are inconsistent and undocumented",
  "Evidence is scattered across departments",
  "Effectiveness is difficult to validate",
  "Successful solutions rarely scale beyond one location",
];

function Section({
  id,
  eyebrow,
  title,
  children,
  description,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </p>
        <h2 className="max-w-3xl text-3xl font-bold sm:text-4xl">{title}</h2>
        {description && <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>}
        <div className="mt-8">{children}</div>
      </motion.div>
    </section>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <VistaarWordmark compact />
          <nav
            className="hidden items-center gap-6 text-sm text-muted-foreground md:flex"
            aria-label="Main"
          >
            <a href="#problem" className="transition-colors hover:text-foreground">
              Problem
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#ai-match" className="transition-colors hover:text-foreground">
              AI Match
            </a>
            <a href="#evidence" className="transition-colors hover:text-foreground">
              Evidence
            </a>
            <a href="#scale" className="transition-colors hover:text-foreground">
              Scale
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button asChild variant="hero" size="sm">
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full gradient-surface" /> Government Innovation
                Operating System
              </span>
              <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
                <span className="gradient-text">VISTAAR</span>
              </h1>
              <p className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
                From Government Challenges to Scalable Impact.
              </p>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Discover the right innovators. Test solutions. Prove impact. Scale what works — on
                one evidence-driven lifecycle, from the original challenge to nationwide
                replication.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/auth">
                    Explore Solutions <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <Link to="/auth">Submit a Challenge</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/auth">I'm a Startup</Link>
                </Button>
              </div>
              <dl className="mt-10 grid grid-cols-3 gap-4 text-center sm:max-w-md">
                {[
                  ["5", "Lifecycle stages"],
                  ["6", "Match factors"],
                  ["100%", "Auditable"],
                ].map(([v, l]) => (
                  <div key={l} className="glass-panel px-3 py-4">
                    <dt className="font-display text-2xl font-bold gradient-text">{v}</dt>
                    <dd className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {l}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <LifecycleNetwork className="animate-float-slow" />
            </motion.div>
          </div>
        </section>

        {/* Problem */}
        <Section
          id="problem"
          eyebrow="The Problem"
          title="Governments face a critical gap between innovation and impact."
          description="Promising solutions exist, but the system connecting them to public problems is broken — leading to wasted resources, repeated experimentation, weak evidence and lost public impact."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROBLEMS.map((p) => (
              <Panel key={p} className="text-sm text-muted-foreground">
                <span className="mb-3 block h-1 w-10 rounded-full gradient-surface" />
                {p}
              </Panel>
            ))}
          </div>
        </Section>

        {/* Solution */}
        <Section
          eyebrow="The Solution"
          title="An evidence-driven innovation lifecycle, not another portal."
          description="VISTAAR connects government challenges with startups and manages the complete journey: Challenge → AI Match → Pilot → Evidence → Impact → Scale. Every innovation keeps its full history."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Layers,
                t: "One connected lifecycle",
                d: "Challenges, matches, pilots, evidence, impact and scale live in one linked record.",
              },
              {
                icon: ShieldCheck,
                t: "Evidence over opinion",
                d: "Decisions are backed by verified KPI evidence, not slide decks.",
              },
              {
                icon: TrendingUp,
                t: "Built to replicate",
                d: "Proven pilots become deployment blueprints for other departments and states.",
              },
            ].map(({ icon: Icon, t, d }) => (
              <Panel key={t} glow="purple">
                <Icon className="h-6 w-6 text-primary" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </Panel>
            ))}
          </div>
        </Section>

        {/* How it works */}
        <Section
          id="how"
          eyebrow="How VISTAAR Works"
          title="DISCOVER → MATCH → TEST → PROVE → SCALE"
        >
          <div className="grid gap-4 md:grid-cols-5">
            {LIFECYCLE.map(({ key, icon: Icon, text }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-panel p-5"
              >
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <p className="mt-3 font-display text-sm font-bold tracking-[0.16em] gradient-text">
                  {key}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{text}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* AI Match */}
        <Section
          id="ai-match"
          eyebrow="AI Match"
          title="Intelligent matching with a visible decision trace."
          description="Every challenge is scored against every solution on six weighted factors — problem fit (30%), technology fit (20%), impact potential (20%), evidence strength (15%), scalability (10%) and deployment readiness (5%)."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel glow="blue">
              <h3 className="text-lg font-semibold">Why this startup?</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {[
                  "Strong problem alignment",
                  "Technology compatibility",
                  "Similar previous deployment",
                  "Verified evidence base",
                  "High scalability",
                  "Suitable deployment environment",
                ].map((r) => (
                  <li key={r} className="flex gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> {r}
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel glow="pink">
              <h3 className="text-lg font-semibold">AI recommends. Government decides.</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                VISTAAR separates the AI recommendation from the authorised government decision. The
                decision trace shows the inputs, weights, evidence considered, confidence level and
                stated limitations of every score.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {["Inputs", "Weights", "Evidence", "Confidence", "Limitations"].map((c) => (
                  <span key={c} className="gradient-border rounded-full px-3 py-1">
                    {c}
                  </span>
                ))}
              </div>
            </Panel>
          </div>
        </Section>

        {/* Evidence */}
        <Section
          id="evidence"
          eyebrow="Evidence Maker"
          title="Turn raw pilot data into a verified evidence passport."
          description="Upload reports, CSVs, KPI data or survey results. VISTAAR extracts KPIs, compares baseline against outcome, flags inconsistencies and produces a verifiable evidence record — clearly labelling user-provided data, verified data and AI analysis."
        >
          <Panel>
            <EvidenceFlow />
            <div className="mt-6 grid gap-3 sm:grid-cols-4 text-sm">
              {[
                ["Baseline", "1,000 KL/day"],
                ["After solution", "720 KL/day"],
                ["Improvement", "28%"],
                ["Status", "Verified"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border bg-surface/60 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {k}
                  </p>
                  <p className="mt-1 font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </Panel>
        </Section>

        {/* Impact + Scale */}
        <Section
          id="scale"
          eyebrow="Prove & Scale"
          title="Measurable outcomes that travel."
          description="A transparent impact score built from outcome, efficiency, cost effectiveness, adoption, evidence strength and sustainability — then a scale assessment that recommends where the solution should go next."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel glow="purple">
              <Gauge className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold">Impact score with reasoning</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Every score answers "why this score?" against verified evidence, so decision makers
                can defend it.
              </p>
            </Panel>
            <Panel glow="pink">
              <h3 className="text-lg font-semibold">One pilot → many deployments</h3>
              <div className="mt-4">
                <ScaleRipple />
              </div>
            </Panel>
          </div>
        </Section>

        {/* Audiences */}
        <Section eyebrow="Who it's for" title="Built for both sides of the innovation gap.">
          <div className="grid gap-4 md:grid-cols-2">
            <Panel>
              <Building2 className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold">For Government</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Publish challenges and compare innovators objectively</li>
                <li>Run structured, comparable pilots</li>
                <li>Defend decisions with verified evidence</li>
                <li>Replicate what works across departments and states</li>
              </ul>
            </Panel>
            <Panel>
              <Rocket className="h-6 w-6 text-magenta" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold">For Startups</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Discover real government demand</li>
                <li>Get matched on merit and evidence</li>
                <li>Track pilot milestones and feedback</li>
                <li>Unlock scale opportunities beyond one city</li>
              </ul>
            </Panel>
          </div>
        </Section>

        {/* Trust */}
        <Section
          eyebrow="Trust & Transparency"
          title="Every action is logged. Every claim is traceable."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [
                "Full audit trail",
                "Registration, matches, pilots, evidence, verification and scale approvals are recorded with actor, entity and timestamp.",
              ],
              [
                "Role-based access",
                "Government officers, startups, evaluators and admins see and do only what their role permits.",
              ],
              ["Honest AI", "AI assumptions are never presented as verified facts."],
            ].map(([t, d]) => (
              <Panel key={t}>
                <h3 className="text-base font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </Panel>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="glass-panel glow-purple relative overflow-hidden p-10 text-center">
            <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 gradient-surface opacity-20 blur-3xl" />
            <h2 className="relative font-display text-3xl font-bold sm:text-4xl">
              Build the next generation of government innovation with{" "}
              <span className="gradient-text">VISTAAR</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
              Discover the right innovation. Match with confidence. Test with structure. Prove with
              evidence. Scale what works.
            </p>
            <div className="relative mt-8 flex justify-center gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/auth">Get started</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <VistaarWordmark compact />
          <p>From Government Challenges to Scalable Impact.</p>
        </div>
      </footer>
    </div>
  );
}
