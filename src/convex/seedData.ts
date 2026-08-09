/**
 * Version 1 content: university-level concept explanations for the physics feed.
 * Each entry maps to the `concepts` table in convex/schema.ts.
 */

export const SEED_CONCEPTS = [
  {
    slug: "momentum-and-conservation",
    title: "Momentum and Its Conservation",
    topic: "mechanics" as const,
    difficulty: "intro" as const,
    readingMinutes: 6,
    summary:
      "Momentum is the 'quantity of motion' a body carries. In any isolated system it can be transferred between objects but never created or destroyed — the deep reason rockets work, billiard balls scatter, and particles collide.",
    keyFormula: "p = m·v,  and  Σp_before = Σp_after",
    tags: ["newton", "collisions", "impulse"],
    content: [
      {
        heading: "The intuition",
        body: "A freight train and a bicycle can be moving at the same speed, yet no one doubts which is harder to stop. Momentum captures exactly that difference: it packages an object's mass together with its velocity, giving a single number that measures how much 'motion' is stored in a body. Change an object's momentum, and you have applied a force to it — force is, in fact, defined as the rate of change of momentum (F = dp/dt).",
      },
      {
        heading: "The mathematics",
        body: "For a single particle, momentum is p = mv, a vector pointing along the velocity. For a system of particles, the total momentum is the vector sum of every particle's momentum. The conservation law follows directly from Newton's third law: when two objects interact, the forces they exert on each other are equal and opposite, so their momentum changes cancel exactly. Provided no external force acts on the system, the total momentum vector is constant in time.",
      },
      {
        heading: "Worked example",
        body: "A 2 kg ball moving at 3 m/s to the right collides head-on with a 1 kg ball at rest, and they stick together. Total momentum before: 2×3 + 1×0 = 6 kg·m/s. After the collision the combined mass is 3 kg, so the final velocity is 6/3 = 2 m/s to the right. The kinetic energy dropped from 9 J to 6 J — momentum was conserved while energy was not, because it leaked into heat and deformation. This is an inelastic collision.",
      },
      {
        heading: "Why it matters",
        body: "Conservation of momentum is one of physics' most reliable tools because it holds even when we know nothing about the forces involved — in explosions, car crashes, rocket propulsion, and subatomic scattering. When a rocket expels hot gas downward, the gas carries momentum one way and the rocket must gain an equal and opposite momentum the other way. That is the entire mechanism of spaceflight.",
      },
    ],
    takeaways: [
      "Momentum is a vector: p = mv, with direction matching the velocity.",
      "The total momentum of an isolated system is always conserved.",
      "Conservation follows from Newton's third law, so it holds even when forces are unknown.",
      "Inelastic collisions conserve momentum but not kinetic energy.",
    ],
  },
  {
    slug: "simple-harmonic-motion",
    title: "Simple Harmonic Motion",
    topic: "mechanics" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 8,
    summary:
      "When a restoring force is proportional to displacement, an object oscillates with a sinusoidal motion — the same mathematics behind pendulums, springs, molecules, and AC circuits.",
    keyFormula: "x(t) = A·cos(ωt + φ),  ω = √(k/m)",
    tags: ["oscillators", "springs", "pendulum"],
    content: [
      {
        heading: "The intuition",
        body: "Pull a mass on a spring to the right and the spring pulls it back to the left; push it left and the spring pushes it right. The farther you displace the mass, the harder the spring yanks it back. That linear restoring force — F = −kx — is the definition of a harmonic oscillator. The result is motion that repeats forever with a fixed period, tracing a perfect sine wave in time.",
      },
      {
        heading: "The mathematics",
        body: "Combining F = ma with F = −kx gives the differential equation m·ẍ = −kx, or ẍ + (k/m)x = 0. Its general solution is x(t) = A·cos(ωt + φ), where the angular frequency ω = √(k/m) is set entirely by the system, the amplitude A is set by how you start it, and φ is the phase. The period T = 2π/ω is independent of amplitude — a remarkable property called isochronism: a small swing of a pendulum takes the same time as a big one.",
      },
      {
        heading: "Energy in the oscillator",
        body: "Energy sloshes back and forth between kinetic and potential. At the extremes the mass is momentarily at rest with all energy stored as spring potential ½kx²; at the equilibrium point the spring is relaxed and all energy is kinetic ½mv². Because both forms are quadratic, the average kinetic energy equals the average potential energy — each exactly half of the total ½kA².",
      },
      {
        heading: "Why it matters",
        body: "Simple harmonic motion is the seed of nearly all of physics. Any system near a stable equilibrium responds linearly to small displacements, so molecules vibrating, atoms in a lattice, pendulums, LC circuits, and even the oscillations of stars all obey the same equation with different constants. It is why we can describe complex vibrations as superpositions of simple sines (Fourier analysis), and it underpins resonance — the reason a singer's note can shatter glass.",
      },
    ],
    takeaways: [
      "A linear restoring force F = −kx produces sinusoidal motion.",
      "The frequency ω = √(k/m) depends only on the system, not the amplitude.",
      "Energy alternates between kinetic and potential, each averaging half the total.",
      "SHM is the universal approximation for any system near stable equilibrium.",
    ],
  },
  {
    slug: "gauss-law",
    title: "Gauss's Law",
    topic: "electromagnetism" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 9,
    summary:
      "The electric flux through any closed surface is proportional to the charge inside it. This single statement lets you compute electric fields of symmetric charge distributions with almost no calculus.",
    keyFormula: "∮ E·dA = Q_enc / ε₀",
    tags: ["electric fields", "flux", "symmetry"],
    content: [
      {
        heading: "The intuition",
        body: "Imagine charge as a source of 'field lines' that stream outward in all directions. A closed surface — any shape — catches a certain number of those lines; that count is the electric flux. Gauss's law says the total flux through any closed surface depends only on how much charge sits inside, never on the surface's shape or size. Enclose more charge, catch more lines. That is the entire law in words.",
      },
      {
        heading: "The mathematics",
        body: "Flux is the surface integral ∮ E·dA: the electric field dotted with the outward area element, summed over the closed surface. Gauss's law states ∮ E·dA = Q_enc/ε₀, where Q_enc is the net charge enclosed and ε₀ the vacuum permittivity. It follows from the inverse-square nature of Coulomb's law, and it is one of Maxwell's four equations — the one governing the divergence of the electric field.",
      },
      {
        heading: "Worked example",
        body: "A point charge Q sits at the center of a sphere of radius r. By symmetry E is radial and constant in magnitude on the surface, so the flux is E·4πr². Gauss's law gives E·4πr² = Q/ε₀, hence E = Q/(4πε₀r²) — Coulomb's law, derived without integrating over the charge itself. The same trick works for infinite lines, infinite planes, and uniformly charged spheres, where Gauss's law reduces a hard integral to a multiplication.",
      },
      {
        heading: "Why it matters",
        body: "Gauss's law is the field theorist's first tool: it reveals that a uniformly charged sphere behaves, outside, exactly like a point charge, and that the field inside a conductor in electrostatic equilibrium is zero — the reason Faraday cages work. More deeply, it is the geometric statement that electric charge is the source of electric field, the model for how all field theories (including gravity) relate sources to fields.",
      },
    ],
    takeaways: [
      "Flux through a closed surface depends only on the enclosed charge.",
      "Gauss's law is equivalent to Coulomb's law plus the superposition principle.",
      "It is most powerful when the charge distribution has high symmetry.",
      "It explains screening inside conductors — the Faraday cage effect.",
    ],
  },
  {
    slug: "faradays-law",
    title: "Faraday's Law of Induction",
    topic: "electromagnetism" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 8,
    summary:
      "A changing magnetic flux through a loop drives an electromotive force around it. This single law turns motion into electricity — the physics inside every generator, transformer, and induction stove.",
    keyFormula: "ε = −dΦ_B / dt",
    tags: ["induction", "generators", "maxwell"],
    content: [
      {
        heading: "The intuition",
        body: "Magnetic fields do no work on charges directly, but a magnetic field that changes in time creates something new: a swirling electric field. If you thread a loop of wire with a magnetic field and then change the amount of field threading it — by moving a magnet, spinning a coil, or switching a current — charges in the wire feel pushed around the loop. That push, per unit charge, is the induced electromotive force.",
      },
      {
        heading: "The mathematics",
        body: "Define the magnetic flux Φ_B = ∫ B·dA through the loop. Faraday's law states that the induced emf equals the negative rate of change of flux: ε = −dΦ_B/dt. The minus sign is Lenz's law: the induced current flows so that its own magnetic field opposes the change in flux that created it. In differential form the law reads ∇×E = −∂B/∂t — a changing magnetic field generates a circulating electric field.",
      },
      {
        heading: "Worked example",
        body: "A 100-turn coil of area 0.02 m² sits perpendicular to a magnetic field that drops from 0.5 T to 0 T in 0.1 s. The flux through one turn changes by ΔΦ = 0.02 × 0.5 = 0.01 Wb, so the emf per turn is 0.01/0.1 = 0.1 V. Across 100 turns the induced emf is 10 V. If the coil has resistance 5 Ω, the current is 2 A — and Lenz's law tells you it flows in the direction that tries to keep the field alive.",
      },
      {
        heading: "Why it matters",
        body: "Faraday's law is the physical engine of the modern world. Generators rotate coils in magnetic fields to produce the alternating current in the power grid; transformers use changing flux to step voltages up and down; induction stoves heat pans with eddy currents; and wireless phone chargers couple power through air with nothing but changing flux. It is also the law that makes electromagnetic waves possible: a changing field of one kind generates the other, and the two propagate as light.",
      },
    ],
    takeaways: [
      "An emf is induced whenever magnetic flux through a loop changes.",
      "Lenz's law fixes the direction: induced effects oppose their cause.",
      "The emf scales with the number of turns — coil windings multiply it.",
      "Faraday's law underlies generators, transformers, and electromagnetic waves.",
    ],
  },
  {
    slug: "first-law-thermodynamics",
    title: "The First Law of Thermodynamics",
    topic: "thermodynamics" as const,
    difficulty: "intro" as const,
    readingMinutes: 6,
    summary:
      "Energy can change form and move between systems, but it is never created or destroyed. The first law is the bookkeeping rule that connects heat, work, and internal energy.",
    keyFormula: "ΔU = Q − W",
    tags: ["energy", "heat", "work"],
    content: [
      {
        heading: "The intuition",
        body: "Think of a gas in a cylinder with a movable piston. You can add energy to the gas in two distinct ways: by heating it (the molecules move faster) or by doing mechanical work on it (the piston squeezes the molecules closer together). Both deposit energy into the gas's internal store, U. The first law simply demands that the change in that store equals heat added minus work done by the gas: energy in minus energy out.",
      },
      {
        heading: "The mathematics",
        body: "For a system, ΔU = Q − W, where Q is heat added to the system, W is work done by the system, and ΔU is the change in internal energy. For an infinitesimal process, dU = δQ − δW, where δQ and δW are inexact differentials (they depend on the path) while dU is exact (it depends only on the state). For an ideal gas, U depends only on temperature: ΔU = n·C_v·ΔT. This is why an isothermal process — one at fixed temperature — must have Q = W exactly.",
      },
      {
        heading: "Worked example",
        body: "A gas absorbs 500 J of heat while expanding and doing 350 J of work on its surroundings. The internal energy changes by ΔU = 500 − 350 = +150 J, so the gas gets slightly hotter. If instead the same 500 J is absorbed but the gas is held at constant volume, no work is done and all 500 J raises the internal energy — the temperature rises more for the same heat input, which is precisely why specific heats at constant volume and constant pressure differ.",
      },
      {
        heading: "Why it matters",
        body: "The first law is the accountant of every energy conversion: engines, refrigerators, metabolic pathways, and stars all obey it. It tells you, for example, that no engine can produce work without drawing energy from somewhere, and that a refrigerator must reject more heat to the room than it removes from the food. Combined with the second law, it forms the backbone of all of thermodynamics and energy engineering.",
      },
    ],
    takeaways: [
      "ΔU = Q − W: energy into a system either heats it or does work on it.",
      "Internal energy is a state function; heat and work are path-dependent.",
      "For an ideal gas, internal energy depends only on temperature.",
      "The first law rules every energy conversion, from engines to stars.",
    ],
  },
  {
    slug: "entropy-and-the-second-law",
    title: "Entropy and the Second Law",
    topic: "thermodynamics" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 9,
    summary:
      "Entropy counts the number of microscopic arrangements a system can hide in. The second law — entropy never decreases in an isolated system — explains why time has a direction.",
    keyFormula: "ΔS = Q_rev / T,   S = k_B·ln Ω",
    tags: ["entropy", "irreversibility", "statistical mechanics"],
    content: [
      {
        heading: "The intuition",
        body: "Why does a hot cup of coffee cool down but never spontaneously reheat? There is no force stopping the molecules from rearranging into the hot state — it is simply overwhelmingly unlikely. A gas spread through a room has vastly more arrangements (microstates) than a gas crammed into one corner. Entropy is the measure of how many arrangements a state has; nature drifts toward the most probable, highest-entropy arrangements because there are so many more of them.",
      },
      {
        heading: "The mathematics",
        body: "Boltzmann's formula makes this precise: S = k_B·ln Ω, where Ω is the number of microstates consistent with the macroscopic state and k_B is Boltzmann's constant. For reversible heat transfer, the thermodynamic definition is ΔS = Q_rev/T. The second law states that for an isolated system, ΔS ≥ 0: entropy never decreases. In open systems, local order is possible only by exporting entropy to the surroundings — the price of every refrigerator, cell, and living organism.",
      },
      {
        heading: "Worked example",
        body: "A 100 J parcel of heat flows from a hot reservoir at 400 K into a cold one at 300 K. The hot reservoir loses entropy ΔS_hot = −100/400 = −0.25 J/K; the cold one gains ΔS_cold = +100/300 ≈ +0.33 J/K. The net change is about +0.08 J/K — positive, as the second law demands. Reverse the flow and the net change would be negative, which is why heat never spontaneously flows uphill.",
      },
      {
        heading: "Why it matters",
        body: "Entropy is the arrow of time: it is the only fundamental law that distinguishes past from future. It dictates the maximum efficiency of heat engines (the Carnot limit), explains why some reactions proceed and others do not, and gives thermodynamics its deepest statement — that the universe, left to itself, moves toward ever more probable arrangements. Statisticians, information theorists, and cosmologists all use the same mathematics of counting possibilities.",
      },
    ],
    takeaways: [
      "Entropy counts the microstates behind a macrostate: S = k_B·ln Ω.",
      "The second law: the entropy of an isolated system never decreases.",
      "Heat flows from hot to cold because the reverse would lower total entropy.",
      "Local order (life, refrigerators) always comes at the cost of exporting entropy.",
    ],
  },
  {
    slug: "wave-particle-duality",
    title: "Wave–Particle Duality",
    topic: "quantum" as const,
    difficulty: "intro" as const,
    readingMinutes: 7,
    summary:
      "Light and matter refuse to be just waves or just particles. Every quantum object carries both a wavelength and a momentum, and which face it shows depends on the experiment you run.",
    keyFormula: "λ = h / p",
    tags: ["photons", "de broglie", "interference"],
    content: [
      {
        heading: "The intuition",
        body: "Shine light through two slits and you see interference fringes — the signature of a wave. But dim the light until photons arrive one at a time, and each arrives at a single spot like a particle. Run the experiment long enough and the spots build up into the same interference pattern. The light is not 'really' a wave that collapses, nor a particle stream: it is a quantum object whose behavior — wave-like or particle-like — is set by what you choose to measure.",
      },
      {
        heading: "The mathematics",
        body: "The bridge between the two pictures is Planck's constant. A photon of frequency f carries energy E = hf; a particle of momentum p carries a wavelength λ = h/p (de Broglie's relation). For a tennis ball, p is enormous, so λ ≈ 10⁻³⁴ m — immeasurably small, which is why macroscopic objects look like particles. For an electron, λ is comparable to atomic spacings, so electrons diffract off crystals just like X-rays — the phenomenon that founded solid-state physics.",
      },
      {
        heading: "Worked example",
        body: "An electron accelerated through 100 V gains kinetic energy 100 eV. Its momentum is p = √(2·m·K) ≈ 5.4×10⁻²⁴ kg·m/s, giving a de Broglie wavelength λ = h/p ≈ 1.2 Å — about the spacing between atoms in a crystal. Shoot such electrons at a nickel crystal and they scatter with the sharp Bragg peaks of a wave. The same electron, detected by a screen, always lands as a single localized flash.",
      },
      {
        heading: "Why it matters",
        body: "Duality is the reason quantum mechanics exists as a theory of wave functions rather than trajectories: the wave function is the object whose interference pattern builds up from single detection events. It is also an everyday technology — electron microscopes achieve atomic resolution by exploiting short electron wavelengths, and the wave-like nature of matter is what makes the semiconductor band structure, and therefore every transistor, possible.",
      },
    ],
    takeaways: [
      "Every quantum object has both a wavelength and a momentum, linked by λ = h/p.",
      "Which behavior you observe — wave or particle — depends on the measurement.",
      "The double-slit pattern builds from single localised detection events.",
      "Electron diffraction makes electron microscopes and band theory possible.",
    ],
  },
  {
    slug: "schrodinger-equation",
    title: "The Schrödinger Equation",
    topic: "quantum" as const,
    difficulty: "advanced" as const,
    readingMinutes: 10,
    summary:
      "The central equation of non-relativistic quantum mechanics. It governs how the wave function evolves, and its energy eigenstates explain why atoms are stable and why electrons occupy discrete orbitals.",
    keyFormula: "iħ·∂ψ/∂t = Ĥψ",
    tags: ["wave function", "eigenstates", "atoms"],
    content: [
      {
        heading: "The intuition",
        body: "In classical physics, a particle follows a definite path. Quantum mechanics replaces the path with a wave function ψ that encodes everything knowable about the system, spread over space. The Schrödinger equation is the rule for how that wave function changes with time — it plays the role Newton's second law plays for trajectories. Where Newton's law says 'force changes velocity', Schrödinger's equation says 'energy changes the wave function'.",
      },
      {
        heading: "The mathematics",
        body: "The time-dependent equation reads iħ·∂ψ/∂t = Ĥψ, where Ĥ = −(ħ²/2m)∇² + V is the Hamiltonian operator: kinetic energy as a second derivative, plus potential energy as multiplication. When the potential is time-independent, solutions factor as ψ(x,t) = φ(x)·e^(−iEt/ħ), and φ satisfies the time-independent equation Ĥφ = Eφ — an eigenvalue problem whose allowed energies E are the quantized levels. The probability of finding the particle is |ψ|², so ψ must be normalizable.",
      },
      {
        heading: "Worked example",
        body: "A particle in a 1-D box of width L has V = 0 inside and ∞ outside, forcing φ(0) = φ(L) = 0. The solutions are φₙ(x) = √(2/L)·sin(nπx/L) with energies Eₙ = n²π²ħ²/(2mL²). The energies grow as n² — the ground state has n = 1, and a node at the center belongs to the first excited state, n = 2. This toy model explains the confinement energy of electrons in quantum dots and the discrete absorption lines of molecules.",
      },
      {
        heading: "Why it matters",
        body: "Applied to the hydrogen atom, the Schrödinger equation produces the discrete energy levels and orbitals that spectroscopy observes to many decimal places — the first theory to explain the periodic table from first principles. It governs chemistry, semiconductors, lasers, and nuclear physics at the non-relativistic scale. It also carries a profound interpretation: the universe at the quantum level is described by probabilities that evolve deterministically, and only measurement collapses them into definite outcomes.",
      },
    ],
    takeaways: [
      "ψ encodes everything knowable; |ψ|² is the probability density.",
      "The equation iħ∂ψ/∂t = Ĥψ is the quantum analogue of Newton's law.",
      "Time-independent solutions are eigenvalue problems: Ĥφ = Eφ.",
      "The particle-in-a-box shows how confinement quantizes energy levels.",
    ],
  },
  {
    slug: "time-dilation",
    title: "Time Dilation in Special Relativity",
    topic: "relativity" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 8,
    summary:
      "Two observers in relative motion measure different elapsed times between the same events: moving clocks run slow. It follows directly from the single postulate that light's speed is the same for everyone.",
    keyFormula: "Δt = γ·Δt₀,  γ = 1/√(1 − v²/c²)",
    tags: ["einstein", "lorentz", "clocks"],
    content: [
      {
        heading: "The intuition",
        body: "Build a clock from two mirrors with a light pulse bouncing between them. To an observer riding with the clock, the pulse travels straight up and down. To an observer watching the clock fly past, the pulse traces a longer zigzag path — yet both must measure the same light speed c. The only way out is that the moving clock's 'tick' takes longer: the moving observer's time runs slower. Time dilation is not an illusion; it is what the constancy of light speed forces upon us.",
      },
      {
        heading: "The mathematics",
        body: "From the light-clock geometry (a right triangle with legs ct₀ and vt, hypotenuse ct), one derives the Lorentz factor γ = 1/√(1 − v²/c²). The proper time Δt₀ — measured by a clock at rest relative to the events — relates to the dilated time by Δt = γ·Δt₀. At everyday speeds γ ≈ 1 and the effect is invisible; at v = 0.87c, γ = 2, so moving clocks tick at half the rate.",
      },
      {
        heading: "Worked example",
        body: "Muons are created high in the atmosphere by cosmic rays and decay in about 2.2 μs of their own time. At v = 0.98c, γ ≈ 5, so from Earth's frame their lifetime stretches to about 11 μs — long enough to travel roughly 3 km instead of the 0.65 km they'd cover without dilation. This is why muons reach the ground at all, and it is confirmed daily in particle accelerators, where short-lived particles survive for many more 'Earth seconds' than their internal clocks allow.",
      },
      {
        heading: "Why it matters",
        body: "Time dilation is not a curiosity: GPS satellites carry atomic clocks that run fast by about 38 μs per day (dilation from orbital speed plus a general-relativistic correction), and the system corrects for it — otherwise positions would drift by kilometres per day. It also forces us to abandon the notion of a universal 'now': simultaneity itself is relative, and time must be treated as a fourth dimension interwoven with space.",
      },
    ],
    takeaways: [
      "Moving clocks run slow: Δt = γ·Δt₀ with γ ≥ 1.",
      "The effect follows solely from the constancy of the speed of light.",
      "Muon lifetimes and particle accelerators confirm it routinely.",
      "GPS satellites must correct for relativistic time dilation to stay accurate.",
    ],
  },
] as const;

export type SeedConcept = (typeof SEED_CONCEPTS)[number];
