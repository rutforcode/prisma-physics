import {
  Atom,
  Flame,
  Magnet,
  Rocket,
  Waves,
  type LucideIcon,
} from "lucide-react";

export type TopicId =
  | "mechanics"
  | "electromagnetism"
  | "thermodynamics"
  | "waves"
  | "quantum"
  | "relativity";

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
    id: "electromagnetism",
    label: "Electromagnetism",
    shortLabel: "E&M",
    icon: Magnet,
    chip: "from-indigo-400/30 to-violet-500/20 text-indigo-700",
    selected: "bg-indigo-500/15 text-indigo-800 border-indigo-300/60",
  },
  {
    id: "thermodynamics",
    label: "Thermodynamics",
    shortLabel: "Thermo",
    icon: Flame,
    chip: "from-cyan-400/30 to-teal-500/20 text-cyan-700",
    selected: "bg-cyan-500/15 text-cyan-800 border-cyan-300/60",
  },
  {
    id: "waves",
    label: "Waves & Optics",
    shortLabel: "Waves",
    icon: Waves,
    chip: "from-teal-400/30 to-emerald-500/20 text-teal-700",
    selected: "bg-teal-500/15 text-teal-800 border-teal-300/60",
  },
  {
    id: "quantum",
    label: "Quantum",
    shortLabel: "Quantum",
    icon: Atom,
    chip: "from-violet-400/30 to-purple-500/20 text-violet-700",
    selected: "bg-violet-500/15 text-violet-800 border-violet-300/60",
  },
  {
    id: "relativity",
    label: "Relativity",
    shortLabel: "Relativ",
    icon: Atom,
    chip: "from-blue-400/30 to-sky-500/20 text-blue-700",
    selected: "bg-blue-500/15 text-blue-800 border-blue-300/60",
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
