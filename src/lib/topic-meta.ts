import {
  Activity,
  Aperture,
  Atom,
  Boxes,
  CircuitBoard,
  Compass,
  Droplets,
  Flame,
  Hourglass,
  Layers,
  Magnet,
  Orbit,
  Rocket,
  Sigma,
  Telescope,
  Waves,
  type LucideIcon,
} from "lucide-react";

export type TopicId =
  | "mechanics"
  | "fluids"
  | "thermodynamics"
  | "statistical"
  | "electromagnetism"
  | "circuits"
  | "waves"
  | "optics"
  | "quantum"
  | "atomic"
  | "particle"
  | "solidstate"
  | "relativity"
  | "cosmology"
  | "classical"
  | "mathematical";

export type DifficultyId = "intro" | "intermediate" | "advanced";

export interface TopicMeta {
  id: TopicId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** gradient classes for the icon chip */
  chip: string;
  /** soft tint for selected chip states */
  selected: string;
}

export const TOPICS: TopicMeta[] = [
  {
    id: "mechanics",
    label: "Mechanics",
    shortLabel: "Mech",
    icon: Rocket,
    chip: "from-sky-400/30 to-blue-500/20 text-sky-700",
    selected: "bg-sky-500/15 text-sky-800 border-sky-300/60",
  },
  {
    id: "fluids",
    label: "Fluid Mechanics",
    shortLabel: "Fluids",
    icon: Droplets,
    chip: "from-cyan-400/30 to-teal-500/20 text-cyan-700",
    selected: "bg-cyan-500/15 text-cyan-800 border-cyan-300/60",
  },
  {
    id: "thermodynamics",
    label: "Thermodynamics",
    shortLabel: "Thermo",
    icon: Flame,
    chip: "from-teal-400/30 to-emerald-500/20 text-teal-700",
    selected: "bg-teal-500/15 text-teal-800 border-teal-300/60",
  },
  {
    id: "statistical",
    label: "Statistical Mechanics",
    shortLabel: "Stat Mech",
    icon: Activity,
    chip: "from-emerald-400/30 to-green-500/20 text-emerald-700",
    selected: "bg-emerald-500/15 text-emerald-800 border-emerald-300/60",
  },
  {
    id: "electromagnetism",
    label: "Electromagnetism",
    shortLabel: "E&M",
    icon: Magnet,
    chip: "from-indigo-400/30 to-violet-500/20 text-indigo-700",
    selected: "bg-indigo-500/15 text-indigo-800 border-indigo-300/60",
  },
  {
    id: "circuits",
    label: "Circuits & Electronics",
    shortLabel: "Circuits",
    icon: CircuitBoard,
    chip: "from-amber-400/30 to-orange-500/20 text-amber-700",
    selected: "bg-amber-500/15 text-amber-800 border-amber-300/60",
  },
  {
    id: "waves",
    label: "Waves & Oscillations",
    shortLabel: "Waves",
    icon: Waves,
    chip: "from-cyan-400/30 to-sky-500/20 text-cyan-700",
    selected: "bg-cyan-500/15 text-cyan-800 border-cyan-300/60",
  },
  {
    id: "optics",
    label: "Optics",
    shortLabel: "Optics",
    icon: Aperture,
    chip: "from-sky-400/30 to-indigo-500/20 text-sky-700",
    selected: "bg-sky-500/15 text-sky-800 border-sky-300/60",
  },
  {
    id: "quantum",
    label: "Quantum Mechanics",
    shortLabel: "Quantum",
    icon: Orbit,
    chip: "from-violet-400/30 to-purple-500/20 text-violet-700",
    selected: "bg-violet-500/15 text-violet-800 border-violet-300/60",
  },
  {
    id: "atomic",
    label: "Atomic & Nuclear",
    shortLabel: "Atomic",
    icon: Atom,
    chip: "from-purple-400/30 to-fuchsia-500/20 text-purple-700",
    selected: "bg-purple-500/15 text-purple-800 border-purple-300/60",
  },
  {
    id: "particle",
    label: "Particle Physics",
    shortLabel: "Particles",
    icon: Boxes,
    chip: "from-blue-400/30 to-sky-500/20 text-blue-700",
    selected: "bg-blue-500/15 text-blue-800 border-blue-300/60",
  },
  {
    id: "solidstate",
    label: "Solid State Physics",
    shortLabel: "Solid St.",
    icon: Layers,
    chip: "from-indigo-400/30 to-blue-500/20 text-indigo-700",
    selected: "bg-indigo-500/15 text-indigo-800 border-indigo-300/60",
  },
  {
    id: "relativity",
    label: "Relativity",
    shortLabel: "Relativ",
    icon: Hourglass,
    chip: "from-blue-400/30 to-cyan-500/20 text-blue-700",
    selected: "bg-blue-500/15 text-blue-800 border-blue-300/60",
  },
  {
    id: "cosmology",
    label: "Astrophysics & Cosmology",
    shortLabel: "Cosmo",
    icon: Telescope,
    chip: "from-fuchsia-400/30 to-violet-500/20 text-fuchsia-700",
    selected: "bg-fuchsia-500/15 text-fuchsia-800 border-fuchsia-300/60",
  },
  {
    id: "classical",
    label: "Analytical Mechanics",
    shortLabel: "Analytic",
    icon: Compass,
    chip: "from-slate-400/30 to-blue-500/20 text-slate-700",
    selected: "bg-slate-500/15 text-slate-800 border-slate-300/60",
  },
  {
    id: "mathematical",
    label: "Mathematical Physics",
    shortLabel: "Math",
    icon: Sigma,
    chip: "from-zinc-400/30 to-slate-500/20 text-zinc-700",
    selected: "bg-zinc-500/15 text-zinc-800 border-zinc-300/60",
  },
];

export const topicMeta = (id: string): TopicMeta =>
  TOPICS.find((t) => t.id === id) ?? TOPICS[0];

export interface DifficultyMeta {
  id: DifficultyId;
  label: string;
  badge: string;
  dots: number;
}

export const DIFFICULTIES: DifficultyMeta[] = [
  {
    id: "intro",
    label: "Intro",
    badge: "bg-sky-500/12 text-sky-800 border-sky-300/50",
    dots: 1,
  },
  {
    id: "intermediate",
    label: "Intermediate",
    badge: "bg-indigo-500/12 text-indigo-800 border-indigo-300/50",
    dots: 2,
  },
  {
    id: "advanced",
    label: "Advanced",
    badge: "bg-violet-500/12 text-violet-800 border-violet-300/50",
    dots: 3,
  },
];

export const difficultyMeta = (id: string): DifficultyMeta =>
  DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1];
