import { motion } from "motion/react";

const NODES = [
  { id: "gov", label: "Government", x: 8, y: 50 },
  { id: "challenge", label: "Challenge", x: 26, y: 22 },
  { id: "ai", label: "AI Match", x: 46, y: 50 },
  { id: "startup", label: "Startup", x: 26, y: 78 },
  { id: "pilot", label: "Pilot", x: 66, y: 24 },
  { id: "evidence", label: "Evidence", x: 68, y: 74 },
  { id: "scale", label: "Scale", x: 90, y: 50 },
];

const EDGES: [string, string][] = [
  ["gov", "challenge"],
  ["challenge", "ai"],
  ["gov", "startup"],
  ["startup", "ai"],
  ["ai", "pilot"],
  ["ai", "evidence"],
  ["pilot", "scale"],
  ["evidence", "scale"],
  ["pilot", "evidence"],
];

const byId = (id: string) => NODES.find((n) => n.id === id)!;

/** Hero visual: the VISTAAR innovation network (Government → … → Scale). */
export function LifecycleNetwork({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="glass-panel relative overflow-hidden p-4 sm:p-6">
        <div className="pointer-events-none absolute -left-16 top-6 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-52 w-52 rounded-full bg-magenta/15 blur-3xl" />
        <svg
          viewBox="0 0 100 100"
          className="relative h-[300px] w-full sm:h-[380px]"
          role="img"
          aria-label="VISTAAR innovation lifecycle network from government challenge to scale"
        >
          <defs>
            <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6C3BFF" />
              <stop offset="55%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          {EDGES.map(([a, b], i) => {
            const A = byId(a);
            const B = byId(b);
            return (
              <motion.line
                key={`${a}-${b}`}
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke="url(#edge)"
                strokeWidth={0.45}
                strokeLinecap="round"
                className="animate-dash"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 1.1, delay: 0.15 * i }}
              />
            );
          })}

          {NODES.map((n, i) => (
            <g key={n.id}>
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={4.4}
                fill="url(#edge)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.12 * i }}
                style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={7.5}
                fill="url(#edge)"
                opacity={0.16}
                className="animate-pulse-node"
                style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              />
              <text
                x={n.x}
                y={n.y - 8}
                textAnchor="middle"
                fill="rgba(255,255,255,0.82)"
                style={{ fontSize: 3.1, letterSpacing: 0.2 }}
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {["Discover", "Match", "Test", "Prove", "Scale"].map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="rounded-xl border border-border bg-surface/60 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              {s}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Evidence pipeline animation: Raw data → Analysis → Evidence → Verified → Impact. */
export function EvidenceFlow() {
  const steps = ["Raw Data", "AI Analysis", "Evidence Passport", "Verification", "Impact"];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <motion.div
          key={s}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12 }}
          className="flex items-center gap-2"
        >
          <span className="gradient-border rounded-full px-3 py-1.5 text-xs font-medium">{s}</span>
          {i < steps.length - 1 && <span className="text-primary">→</span>}
        </motion.div>
      ))}
    </div>
  );
}

/** Scale animation: one pilot replicating outward. */
export function ScaleRipple() {
  const layers = ["1 Pilot", "Department", "Multi-department", "State", "Multi-state"];
  return (
    <div className="flex flex-col gap-2">
      {layers.map((l, i) => (
        <motion.div
          key={l}
          initial={{ opacity: 0, scaleX: 0.6 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.14, duration: 0.5 }}
          style={{ transformOrigin: "left", width: `${45 + i * 13}%` }}
          className="rounded-full border border-border bg-surface/70 px-4 py-2 text-xs"
        >
          <span className="gradient-text font-semibold">{l}</span>
        </motion.div>
      ))}
    </div>
  );
}
