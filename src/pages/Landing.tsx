import { AuroraBackground } from "@/components/AuroraBackground";
import { MathInline } from "@/components/MathJax";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TOPICS, difficultyMeta, topicMeta } from "@/lib/topic-meta";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Atom,
  BookMarked,
  BookOpen,
  Clock3,
  Compass,
  Library,
  Lightbulb,
  Magnet,
  Sigma,
  Sparkles,
  Thermometer,
} from "lucide-react";
import { Link } from "react-router";

/* ---------- static preview of feed content (mirrors seeded concepts) ---------- */

const FEATURED = [
  {
    slug: "momentum-and-conservation",
    title: "Momentum and Its Conservation",
    topic: "mechanics",
    difficulty: "intro",
    summary:
      "Momentum is the quantity of motion a body carries — and the reason rockets fly. It can be transferred, but never created or destroyed.",
  },
  {
    slug: "entropy-and-the-second-law",
    title: "Entropy and the Second Law",
    topic: "thermodynamics",
    difficulty: "intermediate",
    summary:
      "Entropy counts the hidden arrangements of a system. The second law — entropy never decreases — is why time has a direction at all.",
  },
  {
    slug: "gauss-law",
    title: "Gauss's Law",
    topic: "electromagnetism",
    difficulty: "intermediate",
    summary:
      "The electric flux through any closed surface equals the charge inside it — one statement that tames the electric field of anything symmetric.",
  },
  {
    slug: "bernoullis-principle",
    title: "Bernoulli's Principle",
    topic: "fluids",
    difficulty: "intermediate",
    summary:
      "In a smoothly flowing fluid, faster flow means lower pressure — the physics behind lift, spray, and why a shower curtain billows inward.",
  },
  {
    slug: "hubbles-law",
    title: "Hubble's Law",
    topic: "cosmology",
    difficulty: "intro",
    summary:
      "The farther a galaxy is, the faster it recedes — one equation that reveals the expansion of the universe and a timeline back to the Big Bang.",
  },
  {
    slug: "snells-law",
    title: "Snell's Law",
    topic: "optics",
    difficulty: "intro",
    summary:
      "Light bends when it changes medium — the single rule behind lenses, prisms, fiber optics, and mirages.",
  },
] as const;

const REFERENCES = [
  {
    icon: BookOpen,
    title: "Fundamentals of Physics",
    authors: "Halliday, Resnick & Walker",
    blurb:
      "The canonical first-year companion — the exact problem-set energy the feed's worked examples are modeled on.",
    area: "Intro sequence",
    chip: "from-sky-400/30 to-indigo-500/20",
  },
  {
    icon: Lightbulb,
    title: "The Feynman Lectures on Physics",
    authors: "Feynman, Leighton & Sands",
    blurb:
      "The gold standard for physical intuition — every Prism explanation opens the same way Feynman did: with the picture first.",
    area: "Intuition first",
    chip: "from-amber-400/25 to-orange-500/15",
  },
  {
    icon: Magnet,
    title: "Introduction to Electrodynamics",
    authors: "David J. Griffiths",
    blurb:
      "The modern path through Gauss, Maxwell, and radiation — the source for every electromagnetism concept in the feed.",
    area: "Electromagnetism",
    chip: "from-indigo-400/30 to-violet-500/20",
  },
  {
    icon: Atom,
    title: "Introduction to Quantum Mechanics",
    authors: "David J. Griffiths",
    blurb:
      "Wavefunctions, operators, and spin without the fog — the backbone of the quantum, atomic, and particle sections.",
    area: "Quantum mechanics",
    chip: "from-teal-400/30 to-cyan-500/20",
  },
  {
    icon: Compass,
    title: "Classical Mechanics",
    authors: "John R. Taylor",
    blurb:
      "Lagrangians, Hamiltonians, and phase space made approachable — the reference behind analytical mechanics.",
    area: "Analytical mechanics",
    chip: "from-sky-400/30 to-cyan-500/20",
  },
  {
    icon: Thermometer,
    title: "An Introduction to Thermal Physics",
    authors: "Daniel V. Schroeder",
    blurb:
      "Entropy, the Boltzmann factor, and statistical ideas told as a story — thermodynamics and stat mech, minus the mystery.",
    area: "Thermal & statistical",
    chip: "from-blue-400/30 to-indigo-500/20",
  },
] as const;

const STEPS = [
  {
    icon: BookOpen,
    title: "Choose a concept",
    body: "Pick from a curated feed of core university-level topics, from Gauss's law to time dilation.",
  },
  {
    icon: Lightbulb,
    title: "Build intuition first",
    body: "Every explanation opens with the physical picture — what is really happening — before a single symbol appears.",
  },
  {
    icon: Sigma,
    title: "Then the mathematics",
    body: "Follow the equations, a worked example, and crisp key takeaways you can carry into problem sets.",
  },
] as const;

/* ---------- small building blocks ---------- */

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="glass-chip flex size-9 items-center justify-center rounded-xl text-primary transition-transform group-hover:scale-105">
        <Atom className="size-5" />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-foreground">
        Prism
      </span>
    </Link>
  );
}

function FloatingFormula({
  formula,
  note,
  className,
  delay = 0,
}: {
  formula: string;
  note: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      className={cn("absolute z-10 hidden lg:block", className)}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 6 + delay,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        className="glass rounded-2xl px-5 py-4"
      >
        <MathInline tex={formula} className="text-sm text-primary" />
        <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          {note}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ---------- page ---------- */

export default function Landing() {
  return (
    <div className="min-h-screen text-foreground">
      <AuroraBackground />

      {/* Floating nav */}
      <header className="sticky top-4 z-40 px-4">
        <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl py-2.5 pl-4 pr-2.5">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {["Concepts", "Topics", "How it works", "References"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/50 hover:text-foreground"
              >
                {label}
              </a>
            ))}
            <Link
              to="/resources"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/50 hover:text-foreground"
            >
              Resources
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="lg" className="rounded-xl">
              <Link to="/dashboard">
                Open the feed
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-24 text-center md:pt-32">
          <FloatingFormula
            formula="E = hf"
            note="Photon energy"
            className="left-2 top-40"
          />
          <FloatingFormula
            formula="\Delta S \geq 0"
            note="Second law"
            className="right-4 top-56"
            delay={1.2}
          />
          <FloatingFormula
            formula="F = -kx"
            note="Simple harmonic motion"
            className="bottom-24 left-6"
            delay={0.6}
          />
          <FloatingFormula
            formula="\Delta t = \gamma \Delta t_0"
            note="Time dilation"
            className="bottom-32 right-10"
            delay={1.8}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <Badge className="glass-chip gap-1.5 rounded-full border-0 px-3.5 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              Built for university physics students
            </Badge>

            <h1 className="font-display mt-7 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Understand physics.
              <br />
              <span className="text-cobalt">Actually understand it.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Prism is a study feed of core physics concepts, explained the way
              you wish your textbook did — intuition first, mathematics second,
              worked examples throughout.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-xl px-7 text-base">
                <Link to="/auth">
                  Start learning
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="glass-chip h-12 rounded-xl border-0 px-7 text-base"
              >
                <Link to="/dashboard">Browse the feed</Link>
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4 text-primary" />
                32 concepts
              </span>
              <span className="h-4 w-px bg-border" />
              <span className="flex items-center gap-1.5">
                <Atom className="size-4 text-primary" />
                16 topics
              </span>
              <span className="h-4 w-px bg-border" />
              <span className="flex items-center gap-1.5">
                <Clock3 className="size-4 text-primary" />
                ~4 h of reading
              </span>
            </div>
          </motion.div>
        </section>

        {/* Topics */}
        <section id="topics" className="mx-auto max-w-6xl scroll-mt-28 px-4 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl p-8 md:p-10"
          >
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Topics
                </p>
                <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                  The core of the undergraduate syllabus
                </h2>
              </div>
              <Button asChild variant="ghost" className="shrink-0">
                <Link to="/dashboard">
                  Explore all
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {TOPICS.map((topic) => (
                <Link
                  key={topic.id}
                  to="/dashboard"
                  className={cn(
                    "glass-chip group flex flex-col items-center gap-2.5 rounded-2xl px-4 py-5 text-center",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl bg-gradient-to-br",
                      topic.chip,
                    )}
                  >
                    <topic.icon className="size-5" />
                  </span>
                  <span className="text-sm font-medium leading-tight">
                    {topic.label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="mx-auto max-w-6xl scroll-mt-28 px-4 pb-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              How it works
            </p>
            <h2 className="font-display mx-auto mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
              Three steps between you and <span className="text-cobalt">it clicking</span>
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                className="glass glass-hover relative overflow-hidden rounded-3xl p-7"
              >
                <span className="absolute -right-3 -top-5 font-display text-[6rem] font-semibold leading-none text-primary/8">
                  {i + 1}
                </span>
                <span className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/30 to-indigo-500/20 text-primary">
                  <step.icon className="size-6" />
                </span>
                <h3 className="relative mt-5 text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured concepts */}
        <section
          id="concepts"
          className="mx-auto max-w-6xl scroll-mt-28 px-4 pb-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                The feed
              </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Start with the classics
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A taste of the 32-concept feed across all sixteen topics.
            </p>
            </div>
            <Button asChild variant="ghost" className="shrink-0">
              <Link to="/dashboard">
                View the whole feed
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {FEATURED.map((concept, i) => {
              const topic = topicMeta(concept.topic);
              const diff = difficultyMeta(concept.difficulty);
              return (
                <motion.div
                  key={concept.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                >
                  <Link
                    to="/dashboard"
                    className="glass glass-hover group flex h-full flex-col rounded-3xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br",
                          topic.chip,
                        )}
                      >
                        <topic.icon className="size-5" />
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("rounded-full border", diff.badge)}
                      >
                        {diff.label}
                      </Badge>
                    </div>
                    <h3 className="font-display mt-5 text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
                      {concept.title}
                    </h3>
                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {concept.summary}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Read the explanation
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* References */}
        <section
          id="references"
          className="mx-auto max-w-6xl scroll-mt-28 px-4 pb-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                References
              </p>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Built on the classics
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                The reading list every Prism concept traces back to — the same
                books your lecturers recommend.
              </p>
            </div>
          </motion.div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {REFERENCES.map((ref, i) => (
              <motion.div
                key={ref.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="glass glass-hover group flex h-full flex-col rounded-3xl p-6"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br",
                      ref.chip,
                    )}
                  >
                    <ref.icon className="size-5 text-primary" />
                  </span>
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary/15 bg-primary/5 text-[11px] font-medium text-muted-foreground"
                  >
                    {ref.area}
                  </Badge>
                </div>
                <h3 className="font-display mt-5 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
                  {ref.title}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {ref.authors}
                </p>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {ref.blurb}
                </p>
                <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary/80">
                  <BookMarked className="size-3.5" />
                  Study staple
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Resources callout */}
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="glass glass-hover group flex flex-col items-start justify-between gap-5 rounded-3xl p-7 sm:flex-row sm:items-center md:p-8"
          >
            <div className="flex items-start gap-4">
              <span className="glass-chip flex size-12 shrink-0 items-center justify-center rounded-2xl text-primary transition-transform group-hover:scale-105">
                <Library className="size-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Resources
                </p>
                <h2 className="font-display mt-1.5 text-2xl font-semibold tracking-tight">
                  A curated toolbox for learning Physics
                </h2>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Hand-picked simulators, calculators, references, and courses —
                  verified and organized by topic, so you can stop Googling and
                  start experimenting.
                </p>
              </div>
            </div>
            <Button asChild size="lg" className="shrink-0 rounded-xl">
              <Link to="/resources">
                Explore resources
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="glass-strong relative overflow-hidden rounded-[2rem] px-6 py-16 text-center md:py-20"
          >
            <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-sky-300/40 blur-[100px]" />
            <div className="absolute -bottom-28 right-10 h-56 w-56 rounded-full bg-indigo-300/35 blur-[100px]" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Ready when you are
              </p>
              <h2 className="font-display mx-auto mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Your semester, one feed of clarity
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                Sign in with your email and start reading concepts that finally
                make the equations feel obvious.
              </p>
              <div className="mt-8 flex justify-center">
                <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base">
                  <Link to="/auth">
                    Start learning free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/50 bg-white/25 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="glass-chip flex size-8 items-center justify-center rounded-lg text-primary">
              <Atom className="size-4" />
            </span>
            <div>
              <p className="font-display font-semibold tracking-tight">Prism</p>
              <p className="text-xs text-muted-foreground">
                Physics, made clear.
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/dashboard" className="transition-colors hover:text-foreground">
              Feed
            </Link>
            <Link to="/community" className="transition-colors hover:text-foreground">
              Community
            </Link>
            <Link to="/resources" className="transition-colors hover:text-foreground">
              Resources
            </Link>
            <Link to="/auth" className="transition-colors hover:text-foreground">
              Sign in
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            Built by <span className="font-semibold text-foreground">Rutforcode</span> with 🩷
          </p>
        </div>
      </footer>
    </div>
  );
}
