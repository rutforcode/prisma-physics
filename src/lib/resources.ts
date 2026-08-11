import {
  BookOpen,
  Calculator,
  Code2,
  Eye,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Library,
  MousePointerClick,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

/**
 * Centralized resource library for the Prism Physics Resources page.
 *
 * Add or edit resources here without touching any UI component. Every URL in
 * this file was verified live (HTTP 200/redirect) before being added.
 */

export type ResourceCategory =
  | "Simulators"
  | "Interactive Tools"
  | "Learning"
  | "Articles"
  | "Reference"
  | "Calculators"
  | "Visualization"
  | "Programming"
  | "Experimental Physics";

export type ResourceTopic =
  | "Mechanics"
  | "Electromagnetism"
  | "Optics"
  | "Waves & Oscillations"
  | "Thermodynamics"
  | "Modern Physics"
  | "Quantum Physics"
  | "Nuclear Physics"
  | "Electronics"
  | "Mathematical Physics"
  | "Astrophysics"
  | "Experimental Physics";

export type ResourceLevel = "intro" | "intermediate" | "advanced";

export interface PhysicsResource {
  id: string;
  name: string;
  description: string;
  url: string;
  /** Display domain, e.g. "phet.colorado.edu" */
  domain: string;
  category: ResourceCategory;
  topics: ResourceTopic[];
  levels: ResourceLevel[];
  /** Quality indicators: Recommended, Free, Open Source, Interactive,
   *  Beginner Friendly, Advanced, University Level */
  badges: string[];
  featured: boolean;
  tags: string[];
  /** Organization / university / project that provides it */
  source: string;
  /** ISO date added to the library (drives "Recently Added" sorting) */
  addedAt: string;
  /** Curated usefulness signal 1–100 (drives "Most Useful" sorting) */
  score: number;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  "Simulators",
  "Interactive Tools",
  "Learning",
  "Articles",
  "Reference",
  "Calculators",
  "Visualization",
  "Programming",
  "Experimental Physics",
];

export const RESOURCE_TOPICS: ResourceTopic[] = [
  "Mechanics",
  "Electromagnetism",
  "Optics",
  "Waves & Oscillations",
  "Thermodynamics",
  "Modern Physics",
  "Quantum Physics",
  "Nuclear Physics",
  "Electronics",
  "Mathematical Physics",
  "Astrophysics",
  "Experimental Physics",
];

export const CATEGORY_META: Record<
  ResourceCategory,
  { icon: LucideIcon; chip: string }
> = {
  Simulators: {
    icon: Gamepad2,
    chip: "from-sky-400/30 to-blue-500/20 text-sky-700",
  },
  "Interactive Tools": {
    icon: MousePointerClick,
    chip: "from-cyan-400/30 to-teal-500/20 text-cyan-700",
  },
  Learning: {
    icon: GraduationCap,
    chip: "from-indigo-400/30 to-violet-500/20 text-indigo-700",
  },
  Articles: {
    icon: Newspaper,
    chip: "from-amber-400/30 to-orange-500/20 text-amber-700",
  },
  Reference: {
    icon: Library,
    chip: "from-emerald-400/30 to-green-500/20 text-emerald-700",
  },
  Calculators: {
    icon: Calculator,
    chip: "from-teal-400/30 to-emerald-500/20 text-teal-700",
  },
  Visualization: {
    icon: Eye,
    chip: "from-fuchsia-400/30 to-violet-500/20 text-fuchsia-700",
  },
  Programming: {
    icon: Code2,
    chip: "from-slate-400/30 to-blue-500/20 text-slate-700",
  },
  "Experimental Physics": {
    icon: FlaskConical,
    chip: "from-purple-400/30 to-fuchsia-500/20 text-purple-700",
  },
};

export const RESOURCES: PhysicsResource[] = [
  // ── Simulators ────────────────────────────────────────────────────────────
  {
    id: "phet",
    name: "PhET Interactive Simulations",
    description:
      "Free interactive simulations for physics and other sciences, built and classroom-tested at the University of Colorado Boulder.",
    url: "https://phet.colorado.edu/",
    domain: "phet.colorado.edu",
    category: "Simulators",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Waves & Oscillations",
      "Optics",
      "Thermodynamics",
      "Modern Physics",
      "Quantum Physics",
    ],
    levels: ["intro", "intermediate"],
    badges: ["Recommended", "Free", "Interactive", "Beginner Friendly"],
    featured: true,
    tags: ["Interactive", "Free", "Simulation", "HTML5"],
    source: "University of Colorado Boulder",
    addedAt: "2024-01-10",
    score: 99,
  },
  {
    id: "geogebra",
    name: "GeoGebra",
    description:
      "Dynamic mathematics and physics software combining geometry, algebra, spreadsheets, graphing, and interactive simulations.",
    url: "https://www.geogebra.org/",
    domain: "geogebra.org",
    category: "Simulators",
    topics: ["Mechanics", "Waves & Oscillations", "Optics", "Mathematical Physics"],
    levels: ["intro", "intermediate"],
    badges: ["Free", "Interactive", "Open Source"],
    featured: true,
    tags: ["Interactive", "Graphing", "Simulation", "Free"],
    source: "International GeoGebra Institute",
    addedAt: "2024-01-12",
    score: 93,
  },
  {
    id: "falstad",
    name: "Falstad Circuit Simulator",
    description:
      "Animated, browser-based circuit simulator with a huge library of analog and digital circuits you can edit and probe live.",
    url: "https://www.falstad.com/circuit/",
    domain: "falstad.com",
    category: "Simulators",
    topics: ["Electronics", "Electromagnetism"],
    levels: ["intro", "intermediate", "advanced"],
    badges: ["Free", "Interactive", "Open Source"],
    featured: true,
    tags: ["Circuits", "Electronics", "Animated", "Interactive"],
    source: "Paul Falstad",
    addedAt: "2024-01-15",
    score: 91,
  },
  {
    id: "myphysicslab",
    name: "MyPhysicsLab",
    description:
      "A collection of physics simulations — pendulums, springs, double pendulums, and more — with source code and controls to dig into the physics.",
    url: "https://www.myphysicslab.com/",
    domain: "myphysicslab.com",
    category: "Simulators",
    topics: ["Mechanics", "Waves & Oscillations", "Thermodynamics"],
    levels: ["intermediate", "advanced"],
    badges: ["Free", "Interactive", "Open Source"],
    featured: true,
    tags: ["Simulation", "Java", "Mechanics", "Open Source"],
    source: "Erik Neumann",
    addedAt: "2024-01-18",
    score: 88,
  },
  {
    id: "ophysics",
    name: "oPhysics",
    description:
      "A collection of interactive physics simulations — projectiles, springs, lenses, circuits, and more — designed for classroom use.",
    url: "https://ophysics.com/",
    domain: "ophysics.com",
    category: "Simulators",
    topics: [
      "Mechanics",
      "Waves & Oscillations",
      "Optics",
      "Electromagnetism",
      "Thermodynamics",
    ],
    levels: ["intro", "intermediate"],
    badges: ["Free", "Interactive", "Beginner Friendly"],
    featured: false,
    tags: ["Simulation", "Classroom", "Interactive"],
    source: "Tom Walsh",
    addedAt: "2024-02-02",
    score: 86,
  },
  {
    id: "physics-classroom-interactive",
    name: "The Physics Classroom — Interactive",
    description:
      "Interactive simulations and concept builders tied to the Physics Classroom's tutorial pages, great for building intuition step by step.",
    url: "https://www.physicsclassroom.com/Physics-Interactives",
    domain: "physicsclassroom.com",
    category: "Simulators",
    topics: [
      "Mechanics",
      "Waves & Oscillations",
      "Electromagnetism",
      "Optics",
      "Electronics",
    ],
    levels: ["intro", "intermediate"],
    badges: ["Free", "Interactive", "Beginner Friendly"],
    featured: false,
    tags: ["Concept Builders", "Simulation", "High School"],
    source: "The Physics Classroom",
    addedAt: "2024-02-10",
    score: 85,
  },
  {
    id: "physics-aviary",
    name: "The Physics Aviary",
    description:
      "Hundreds of physics simulations for labs, homework, and demonstrations — from circuits to relativity — with companion lab worksheets.",
    url: "https://www.thephysicsaviary.com/",
    domain: "thephysicsaviary.com",
    category: "Simulators",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Waves & Oscillations",
      "Optics",
      "Modern Physics",
    ],
    levels: ["intro", "intermediate"],
    badges: ["Free", "Interactive", "Beginner Friendly"],
    featured: false,
    tags: ["Simulation", "Labs", "Homework"],
    source: "The Physics Aviary",
    addedAt: "2024-03-01",
    score: 82,
  },

  // ── Interactive Tools ─────────────────────────────────────────────────────
  {
    id: "physport",
    name: "PhysPort",
    description:
      "A portal of research-based teaching materials, concept inventories, and assessment tools for physics educators and students.",
    url: "https://www.physport.org/",
    domain: "physport.org",
    category: "Interactive Tools",
    topics: ["Mechanics", "Electromagnetism", "Quantum Physics", "Experimental Physics"],
    levels: ["intermediate", "advanced"],
    badges: ["Free", "University Level"],
    featured: false,
    tags: ["Assessments", "Teaching", "Concept Inventories"],
    source: "American Association of Physics Teachers",
    addedAt: "2024-03-12",
    score: 76,
  },
  {
    id: "ck12",
    name: "CK-12 Physics FlexBook",
    description:
      "Adaptable open physics textbooks with interactive practice, simulations, and adaptive quizzes that adjust to your level.",
    url: "https://www.ck12.org/physics/",
    domain: "ck12.org",
    category: "Interactive Tools",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Waves & Oscillations",
      "Optics",
      "Thermodynamics",
      "Modern Physics",
    ],
    levels: ["intro"],
    badges: ["Free", "Interactive", "Beginner Friendly"],
    featured: false,
    tags: ["Textbook", "Quizzes", "Adaptive"],
    source: "CK-12 Foundation",
    addedAt: "2024-03-20",
    score: 78,
  },

  // ── Learning ──────────────────────────────────────────────────────────────
  {
    id: "mit-ocw",
    name: "MIT OpenCourseWare — Physics",
    description:
      "Full MIT physics courses — lecture notes, problem sets, and exams from 8.01 Mechanics through 8.05 Quantum Mechanics II.",
    url: "https://ocw.mit.edu/search/?d=Physics",
    domain: "ocw.mit.edu",
    category: "Learning",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Quantum Physics",
      "Thermodynamics",
      "Modern Physics",
      "Mathematical Physics",
    ],
    levels: ["intermediate", "advanced"],
    badges: ["Recommended", "Free", "University Level"],
    featured: true,
    tags: ["Course", "University", "Problem Sets", "Lectures"],
    source: "Massachusetts Institute of Technology",
    addedAt: "2024-01-20",
    score: 98,
  },
  {
    id: "openstax",
    name: "OpenStax Physics Textbooks",
    description:
      "Peer-reviewed, openly licensed physics textbooks — University Physics, College Physics, and more — free to read online.",
    url: "https://openstax.org/subjects/science",
    domain: "openstax.org",
    category: "Learning",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Waves & Oscillations",
      "Optics",
      "Thermodynamics",
      "Modern Physics",
    ],
    levels: ["intro", "intermediate"],
    badges: ["Recommended", "Free", "Open Source", "University Level"],
    featured: true,
    tags: ["Textbook", "OER", "Free"],
    source: "Rice University",
    addedAt: "2024-01-25",
    score: 96,
  },
  {
    id: "khan-academy",
    name: "Khan Academy — Physics",
    description:
      "Video-based physics courses with worked examples and practice exercises, from one-dimensional motion to quantum physics.",
    url: "https://www.khanacademy.org/science/physics",
    domain: "khanacademy.org",
    category: "Learning",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Waves & Oscillations",
      "Optics",
      "Thermodynamics",
      "Modern Physics",
    ],
    levels: ["intro", "intermediate"],
    badges: ["Recommended", "Free", "Beginner Friendly"],
    featured: true,
    tags: ["Videos", "Practice", "Free"],
    source: "Khan Academy",
    addedAt: "2024-02-01",
    score: 95,
  },
  {
    id: "hyperphysics",
    name: "HyperPhysics",
    description:
      "A concept-map–organized physics reference — click through linked pages to explore mechanics, electricity, relativity, and more.",
    url: "http://hyperphysics.phy-astr.gsu.edu/hbase/index.html",
    domain: "hyperphysics.phy-astr.gsu.edu",
    category: "Learning",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Thermodynamics",
      "Modern Physics",
      "Quantum Physics",
      "Nuclear Physics",
      "Waves & Oscillations",
      "Optics",
    ],
    levels: ["intro", "intermediate", "advanced"],
    badges: ["Recommended", "Free", "Reference"],
    featured: true,
    tags: ["Reference", "Concept Maps", "Free"],
    source: "Georgia State University",
    addedAt: "2024-02-05",
    score: 94,
  },
  {
    id: "feynman-lectures",
    name: "The Feynman Lectures on Physics",
    description:
      "The complete, free online edition of Feynman, Leighton, and Sands — the famous Caltech lectures with audio and original figures.",
    url: "https://www.feynmanlectures.caltech.edu/",
    domain: "feynmanlectures.caltech.edu",
    category: "Learning",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Quantum Physics",
      "Waves & Oscillations",
      "Thermodynamics",
      "Mathematical Physics",
    ],
    levels: ["intermediate", "advanced"],
    badges: ["Recommended", "Free", "University Level"],
    featured: true,
    tags: ["Classic", "Lectures", "Free"],
    source: "California Institute of Technology",
    addedAt: "2024-02-08",
    score: 97,
  },
  {
    id: "libretexts",
    name: "Physics LibreTexts",
    description:
      "An open, collaboratively built library of physics textbooks and courses covering introductory through graduate topics.",
    url: "https://phys.libretexts.org/",
    domain: "phys.libretexts.org",
    category: "Learning",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Thermodynamics",
      "Quantum Physics",
      "Optics",
      "Nuclear Physics",
      "Mathematical Physics",
    ],
    levels: ["intro", "intermediate", "advanced"],
    badges: ["Free", "Open Source", "University Level"],
    featured: false,
    tags: ["Textbook", "OER", "Open Access"],
    source: "UC Davis",
    addedAt: "2024-02-15",
    score: 88,
  },
  {
    id: "physics-hypertextbook",
    name: "The Physics Hypertextbook",
    description:
      "A free, modern introductory physics text with clear explanations, worked examples, and practice problems.",
    url: "https://physics.info/",
    domain: "physics.info",
    category: "Learning",
    topics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Waves & Oscillations"],
    levels: ["intro", "intermediate"],
    badges: ["Free", "Beginner Friendly"],
    featured: false,
    tags: ["Textbook", "Free"],
    source: "Glenn Elert",
    addedAt: "2024-03-05",
    score: 80,
  },
  {
    id: "bozeman-science",
    name: "Bozeman Science — Physics",
    description:
      "Short, well-produced video lessons covering the full AP Physics curriculum, with clear derivations and demonstrations.",
    url: "https://bozemanscience.com/physics",
    domain: "bozemanscience.com",
    category: "Learning",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Waves & Oscillations",
      "Thermodynamics",
      "Modern Physics",
    ],
    levels: ["intro", "intermediate"],
    badges: ["Free", "Beginner Friendly"],
    featured: false,
    tags: ["Videos", "AP Physics", "Free"],
    source: "Bozeman Science",
    addedAt: "2024-03-18",
    score: 75,
  },

  // ── Articles ──────────────────────────────────────────────────────────────
  {
    id: "physics-world",
    name: "Physics World",
    description:
      "The Institute of Physics's news magazine — research highlights, explainers, and opinion from across modern physics.",
    url: "https://physicsworld.com/",
    domain: "physicsworld.com",
    category: "Articles",
    topics: [
      "Modern Physics",
      "Quantum Physics",
      "Astrophysics",
      "Nuclear Physics",
      "Experimental Physics",
    ],
    levels: ["intermediate", "advanced"],
    badges: ["Free", "University Level"],
    featured: false,
    tags: ["News", "Magazine", "Research"],
    source: "Institute of Physics",
    addedAt: "2024-04-01",
    score: 79,
  },
  {
    id: "symmetry",
    name: "Symmetry Magazine",
    description:
      "A joint Fermilab/SLAC publication explaining particle physics — accelerators, dark matter, neutrinos, and the people behind them.",
    url: "https://www.symmetrymagazine.org/",
    domain: "symmetrymagazine.org",
    category: "Articles",
    topics: ["Nuclear Physics", "Modern Physics", "Astrophysics", "Experimental Physics"],
    levels: ["intro", "intermediate"],
    badges: ["Free", "Beginner Friendly"],
    featured: false,
    tags: ["Particle Physics", "Feature", "Free"],
    source: "Fermilab & SLAC",
    addedAt: "2024-04-10",
    score: 78,
  },
  {
    id: "minutephysics",
    name: "MinutePhysics",
    description:
      "Short animated videos that explain physics ideas — from relativity to quantum tunneling — quickly and intuitively.",
    url: "https://www.youtube.com/user/minutephysics",
    domain: "youtube.com",
    category: "Articles",
    topics: [
      "Mechanics",
      "Modern Physics",
      "Quantum Physics",
      "Thermodynamics",
      "Astrophysics",
    ],
    levels: ["intro"],
    badges: ["Free", "Beginner Friendly"],
    featured: false,
    tags: ["Videos", "Animated", "Free"],
    source: "Henry Reich",
    addedAt: "2024-04-15",
    score: 81,
  },
  {
    id: "aps-news",
    name: "American Physical Society",
    description:
      "The APS publishes research journals, Physics Magazine explainers, and news covering the frontiers of physics research.",
    url: "https://www.aps.org/",
    domain: "aps.org",
    category: "Articles",
    topics: [
      "Modern Physics",
      "Quantum Physics",
      "Nuclear Physics",
      "Experimental Physics",
    ],
    levels: ["intermediate", "advanced"],
    badges: ["Free", "University Level"],
    featured: false,
    tags: ["Research", "Journals", "Society"],
    source: "American Physical Society",
    addedAt: "2024-04-20",
    score: 77,
  },

  // ── Reference ─────────────────────────────────────────────────────────────
  {
    id: "nist",
    name: "NIST — Physical Measurement Laboratory",
    description:
      "Authoritative constants, units, and measurement resources — including the official CODATA values of the fundamental physical constants.",
    url: "https://www.nist.gov/pml",
    domain: "nist.gov",
    category: "Reference",
    topics: [
      "Mathematical Physics",
      "Modern Physics",
      "Experimental Physics",
      "Quantum Physics",
    ],
    levels: ["intermediate", "advanced"],
    badges: ["Recommended", "Free", "University Level"],
    featured: true,
    tags: ["Constants", "Units", "Metrology"],
    source: "National Institute of Standards and Technology",
    addedAt: "2024-02-12",
    score: 93,
  },
  {
    id: "wolfram-mathworld",
    name: "Wolfram MathWorld",
    description:
      "The web's most extensive mathematics resource — definitions, formulas, and derivations for the math behind physics.",
    url: "https://mathworld.wolfram.com/",
    domain: "mathworld.wolfram.com",
    category: "Reference",
    topics: ["Mathematical Physics"],
    levels: ["intermediate", "advanced"],
    badges: ["Free", "University Level"],
    featured: true,
    tags: ["Mathematics", "Reference", "Formulas"],
    source: "Wolfram Research",
    addedAt: "2024-02-14",
    score: 89,
  },
  {
    id: "wikipedia-physics",
    name: "Wikipedia — Physics Portals",
    description:
      "The curated Physics and Physics-related portals — a surprisingly good first stop for overviews, history, and links to primary sources.",
    url: "https://en.wikipedia.org/wiki/Portal:Physics",
    domain: "en.wikipedia.org",
    category: "Reference",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Quantum Physics",
      "Thermodynamics",
      "Astrophysics",
      "Modern Physics",
    ],
    levels: ["intro", "intermediate", "advanced"],
    badges: ["Free", "Open Source"],
    featured: true,
    tags: ["Encyclopedia", "Free", "Open"],
    source: "Wikimedia Foundation",
    addedAt: "2024-02-16",
    score: 86,
  },
  {
    id: "physics-se",
    name: "Physics Stack Exchange",
    description:
      "A high-quality Q&A community where physicists answer conceptual and technical questions — with rigorous, cited answers.",
    url: "https://physics.stackexchange.com/",
    domain: "physics.stackexchange.com",
    category: "Reference",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Quantum Physics",
      "Thermodynamics",
      "Mathematical Physics",
      "Modern Physics",
    ],
    levels: ["intermediate", "advanced"],
    badges: ["Free", "Community"],
    featured: false,
    tags: ["Q&A", "Community", "Free"],
    source: "Stack Exchange Network",
    addedAt: "2024-04-05",
    score: 84,
  },
  {
    id: "arxiv",
    name: "arXiv — Physics",
    description:
      "The preprint server where physicists publish research first — searchable archives of every major physics field.",
    url: "https://arxiv.org/",
    domain: "arxiv.org",
    category: "Reference",
    topics: [
      "Quantum Physics",
      "Nuclear Physics",
      "Astrophysics",
      "Modern Physics",
      "Mathematical Physics",
      "Experimental Physics",
    ],
    levels: ["advanced"],
    badges: ["Free", "Open Access", "University Level"],
    featured: false,
    tags: ["Papers", "Preprints", "Research"],
    source: "Cornell University",
    addedAt: "2024-04-08",
    score: 90,
  },
  {
    id: "cern",
    name: "CERN — Physics Resources",
    description:
      "The home of the Large Hadron Collider — particle physics news, educational resources, and a window into experimental physics.",
    url: "https://home.cern/",
    domain: "home.cern",
    category: "Reference",
    topics: ["Nuclear Physics", "Quantum Physics", "Experimental Physics"],
    levels: ["intro", "intermediate"],
    badges: ["Free", "University Level"],
    featured: false,
    tags: ["Particle Physics", "Research", "Education"],
    source: "CERN",
    addedAt: "2024-04-12",
    score: 85,
  },
  {
    id: "fermilab",
    name: "Fermilab",
    description:
      "America's particle physics and accelerator laboratory — science news, education pages, and virtual tours of frontier experiments.",
    url: "https://www.fnal.gov/",
    domain: "fnal.gov",
    category: "Reference",
    topics: ["Nuclear Physics", "Modern Physics", "Experimental Physics"],
    levels: ["intro", "intermediate"],
    badges: ["Free", "University Level"],
    featured: false,
    tags: ["Particle Physics", "Research", "Education"],
    source: "Fermi National Accelerator Laboratory",
    addedAt: "2024-04-14",
    score: 80,
  },

  // ── Calculators ───────────────────────────────────────────────────────────
  {
    id: "wolframalpha",
    name: "WolframAlpha — Physics",
    description:
      "Compute physical quantities, solve equations, and look up constants with curated physics knowledge — from kinematics to quantum mechanics.",
    url: "https://www.wolframalpha.com/",
    domain: "wolframalpha.com",
    category: "Calculators",
    topics: [
      "Mechanics",
      "Electromagnetism",
      "Quantum Physics",
      "Thermodynamics",
      "Mathematical Physics",
      "Astrophysics",
    ],
    levels: ["intro", "intermediate", "advanced"],
    badges: ["Recommended", "University Level"],
    featured: true,
    tags: ["Computation", "Constants", "Problem Solving"],
    source: "Wolfram Research",
    addedAt: "2024-02-20",
    score: 92,
  },
  {
    id: "desmos",
    name: "Desmos Graphing Calculator",
    description:
      "A beautiful, free graphing calculator — plot functions, data, and parametric curves, ideal for visualizing physics models.",
    url: "https://www.desmos.com/calculator",
    domain: "desmos.com",
    category: "Calculators",
    topics: ["Mechanics", "Waves & Oscillations", "Mathematical Physics"],
    levels: ["intro", "intermediate"],
    badges: ["Free", "Interactive", "Beginner Friendly"],
    featured: false,
    tags: ["Graphing", "Free", "Visualization"],
    source: "Desmos Studio",
    addedAt: "2024-02-22",
    score: 87,
  },

  // ── Visualization ─────────────────────────────────────────────────────────
  {
    id: "nasa",
    name: "NASA",
    description:
      "Imagery, missions, and data from space exploration — an endlessly deep resource for astrophysics and planetary science.",
    url: "https://www.nasa.gov/",
    domain: "nasa.gov",
    category: "Visualization",
    topics: ["Astrophysics", "Modern Physics"],
    levels: ["intro", "intermediate"],
    badges: ["Recommended", "Free", "University Level"],
    featured: true,
    tags: ["Space", "Imagery", "Missions"],
    source: "National Aeronautics and Space Administration",
    addedAt: "2024-02-24",
    score: 94,
  },
  {
    id: "esa",
    name: "European Space Agency",
    description:
      "ESA's science missions and observatories — stunning visualizations, mission data, and resources on astronomy and space physics.",
    url: "https://www.esa.int/",
    domain: "esa.int",
    category: "Visualization",
    topics: ["Astrophysics", "Modern Physics"],
    levels: ["intro", "intermediate"],
    badges: ["Free", "University Level"],
    featured: false,
    tags: ["Space", "Missions", "Visualization"],
    source: "European Space Agency",
    addedAt: "2024-02-26",
    score: 88,
  },
  {
    id: "stellarium",
    name: "Stellarium",
    description:
      "An open-source planetarium that renders a realistic sky — great for learning constellations, celestial mechanics, and observing.",
    url: "https://stellarium.org/",
    domain: "stellarium.org",
    category: "Visualization",
    topics: ["Astrophysics", "Mechanics"],
    levels: ["intro"],
    badges: ["Free", "Open Source", "Beginner Friendly"],
    featured: false,
    tags: ["Planetarium", "Astronomy", "Open Source"],
    source: "Stellarium Community",
    addedAt: "2024-03-08",
    score: 86,
  },

  // ── Programming ───────────────────────────────────────────────────────────
  {
    id: "python",
    name: "Python",
    description:
      "The most widely used language in physics — from data analysis to simulations — with a gentle official tutorial to start.",
    url: "https://www.python.org/",
    domain: "python.org",
    category: "Programming",
    topics: ["Mathematical Physics", "Experimental Physics"],
    levels: ["intro", "intermediate"],
    badges: ["Recommended", "Free", "Open Source", "Beginner Friendly"],
    featured: true,
    tags: ["Language", "Free", "Open Source"],
    source: "Python Software Foundation",
    addedAt: "2024-02-28",
    score: 93,
  },
  {
    id: "numpy",
    name: "NumPy",
    description:
      "The fundamental package for scientific computing in Python — n-dimensional arrays, linear algebra, and fast numerical methods.",
    url: "https://numpy.org/",
    domain: "numpy.org",
    category: "Programming",
    topics: ["Mathematical Physics", "Experimental Physics"],
    levels: ["intermediate"],
    badges: ["Free", "Open Source"],
    featured: true,
    tags: ["Scientific Computing", "Arrays", "Open Source"],
    source: "NumPy Project",
    addedAt: "2024-03-02",
    score: 90,
  },
  {
    id: "scipy",
    name: "SciPy",
    description:
      "The ecosystem for mathematics, science, and engineering in Python — integration, optimization, signal processing, and more.",
    url: "https://scipy.org/",
    domain: "scipy.org",
    category: "Programming",
    topics: ["Mathematical Physics", "Experimental Physics"],
    levels: ["intermediate", "advanced"],
    badges: ["Free", "Open Source"],
    featured: true,
    tags: ["Scientific Computing", "Optimization", "Open Source"],
    source: "SciPy Project",
    addedAt: "2024-03-03",
    score: 89,
  },
  {
    id: "glowscript",
    name: "GlowScript / VPython",
    description:
      "Write 3D physics simulations in your browser — the modern home of VPython, used in Matter & Interactions courses worldwide.",
    url: "https://www.glowscript.org/",
    domain: "glowscript.org",
    category: "Programming",
    topics: ["Mechanics", "Electromagnetism", "Mathematical Physics"],
    levels: ["intro", "intermediate"],
    badges: ["Free", "Open Source", "Interactive"],
    featured: false,
    tags: ["3D", "Simulation", "Education"],
    source: "GlowScript Project",
    addedAt: "2024-03-10",
    score: 84,
  },

  // ── Experimental Physics ──────────────────────────────────────────────────
  {
    id: "exploratorium",
    name: "Exploratorium",
    description:
      "The museum of science, art, and human perception — hands-on exhibits and experiments that make physics tangible.",
    url: "https://www.exploratorium.edu/",
    domain: "exploratorium.edu",
    category: "Experimental Physics",
    topics: ["Experimental Physics", "Optics", "Mechanics", "Waves & Oscillations"],
    levels: ["intro"],
    badges: ["Free", "Interactive", "Beginner Friendly"],
    featured: false,
    tags: ["Museum", "Hands-on", "Exhibits"],
    source: "Exploratorium, San Francisco",
    addedAt: "2024-03-15",
    score: 82,
  },
  {
    id: "iop",
    name: "Institute of Physics",
    description:
      "The IOP's education resources — experiments, teacher guides, and career content supporting physics learning at every level.",
    url: "https://www.iop.org/",
    domain: "iop.org",
    category: "Experimental Physics",
    topics: ["Experimental Physics", "Mechanics", "Electromagnetism"],
    levels: ["intro", "intermediate"],
    badges: ["Free", "University Level"],
    featured: false,
    tags: ["Education", "Experiments", "Careers"],
    source: "Institute of Physics",
    addedAt: "2024-03-22",
    score: 79,
  },
];

export const RESOURCE_BY_ID: Record<string, PhysicsResource> = Object.fromEntries(
  RESOURCES.map((r) => [r.id, r]),
);

export type ResourceSortKey = "recommended" | "az" | "recent" | "useful";

export const SORT_OPTIONS: { value: ResourceSortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "az", label: "A–Z" },
  { value: "recent", label: "Recently Added" },
  { value: "useful", label: "Most Useful" },
];

export function sortResources(
  list: PhysicsResource[],
  sort: ResourceSortKey,
): PhysicsResource[] {
  const arr = [...list];
  switch (sort) {
    case "az":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "recent":
      return arr.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    case "useful":
      return arr.sort((a, b) => b.score - a.score);
    case "recommended":
    default:
      return arr.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) || b.score - a.score,
      );
  }
}
