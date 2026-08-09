/**
 * Version 1 content: university-level concept explanations for the physics feed.
 * Formulas are stored in MathJax 3 (TeX) format — inline math wrapped in
 * `$...$`, and key equations as plain TeX rendered in display mode.
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
    keyFormula: String.raw`\vec{p} = m\vec{v}, \qquad \sum \vec{p}_{\text{before}} = \sum \vec{p}_{\text{after}}`,
    tags: ["newton", "collisions", "impulse"],
    content: [
      {
        heading: "The intuition",
        body: "A freight train and a bicycle can be moving at the same speed, yet no one doubts which is harder to stop. Momentum captures exactly that difference: it packages an object's mass together with its velocity, giving a single number that measures how much 'motion' is stored in a body. Change an object's momentum, and you have applied a force to it — force is, in fact, defined as the rate of change of momentum: $F = \\frac{d\\vec{p}}{dt}$.",
      },
      {
        heading: "The mathematics",
        body: "For a single particle, momentum is $\\vec{p} = m\\vec{v}$, a vector pointing along the velocity. For a system of particles, the total momentum is the vector sum of every particle's momentum. The conservation law follows directly from Newton's third law: when two objects interact, the forces they exert on each other are equal and opposite, so their momentum changes cancel exactly. Provided no external force acts on the system, the total momentum vector is constant in time.",
      },
      {
        heading: "Worked example",
        body: "A 2 kg ball moving at 3 m/s to the right collides head-on with a 1 kg ball at rest, and they stick together. Total momentum before: $2 \\times 3 + 1 \\times 0 = 6\\ \\text{kg·m/s}$. After the collision the combined mass is 3 kg, so the final velocity is $6/3 = 2\\ \\text{m/s}$ to the right. The kinetic energy dropped from $9\\ \\text{J}$ to $6\\ \\text{J}$ — momentum was conserved while energy was not, because it leaked into heat and deformation. This is an inelastic collision.",
      },
      {
        heading: "Why it matters",
        body: "Conservation of momentum is one of physics' most reliable tools because it holds even when we know nothing about the forces involved — in explosions, car crashes, rocket propulsion, and subatomic scattering. When a rocket expels hot gas downward, the gas carries momentum one way and the rocket must gain an equal and opposite momentum the other way. That is the entire mechanism of spaceflight.",
      },
    ],
    takeaways: [
      String.raw`Momentum is a vector: $\vec{p} = m\vec{v}$, with direction matching the velocity.`,
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
    keyFormula: String.raw`x(t) = A\cos(\omega t + \phi), \qquad \omega = \sqrt{\frac{k}{m}}`,
    tags: ["oscillators", "springs", "pendulum"],
    content: [
      {
        heading: "The intuition",
        body: "Pull a mass on a spring to the right and the spring pulls it back to the left; push it left and the spring pushes it right. The farther you displace the mass, the harder the spring yanks it back. That linear restoring force — $F = -kx$ — is the definition of a harmonic oscillator. The result is motion that repeats forever with a fixed period, tracing a perfect sine wave in time.",
      },
      {
        heading: "The mathematics",
        body: "Combining Newton's second law with $F = -kx$ gives the differential equation $m\\ddot{x} = -kx$, or $\\ddot{x} + \\frac{k}{m}x = 0$. Its general solution is $x(t) = A\\cos(\\omega t + \\phi)$, where the angular frequency $\\omega = \\sqrt{k/m}$ is set entirely by the system, the amplitude $A$ is set by how you start it, and $\\phi$ is the phase. The period $T = 2\\pi/\\omega$ is independent of amplitude — a remarkable property called isochronism: a small swing of a pendulum takes the same time as a big one.",
      },
      {
        heading: "Energy in the oscillator",
        body: "Energy sloshes back and forth between kinetic and potential. At the extremes the mass is momentarily at rest with all energy stored as spring potential $\\tfrac{1}{2}kx^2$; at the equilibrium point the spring is relaxed and all energy is kinetic $\\tfrac{1}{2}mv^2$. Because both forms are quadratic, the average kinetic energy equals the average potential energy — each exactly half of the total $\\tfrac{1}{2}kA^2$.",
      },
      {
        heading: "Why it matters",
        body: "Simple harmonic motion is the seed of nearly all of physics. Any system near a stable equilibrium responds linearly to small displacements, so molecules vibrating, atoms in a lattice, pendulums, LC circuits, and even the oscillations of stars all obey the same equation with different constants. It is why we can describe complex vibrations as superpositions of simple sines (Fourier analysis), and it underpins resonance — the reason a singer's note can shatter glass.",
      },
    ],
    takeaways: [
      String.raw`A linear restoring force $F = -kx$ produces sinusoidal motion.`,
      String.raw`The frequency $\omega = \sqrt{k/m}$ depends only on the system, not the amplitude.`,
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
    keyFormula: String.raw`\oint \vec{E} \cdot d\vec{A} = \frac{Q_{\text{enc}}}{\varepsilon_0}`,
    tags: ["electric fields", "flux", "symmetry"],
    content: [
      {
        heading: "The intuition",
        body: "Imagine charge as a source of 'field lines' that stream outward in all directions. A closed surface — any shape — catches a certain number of those lines; that count is the electric flux. Gauss's law says the total flux through any closed surface depends only on how much charge sits inside, never on the surface's shape or size. Enclose more charge, catch more lines. That is the entire law in words.",
      },
      {
        heading: "The mathematics",
        body: "Flux is the surface integral $\\oint \\vec{E} \\cdot d\\vec{A}$: the electric field dotted with the outward area element, summed over the closed surface. Gauss's law states $\\oint \\vec{E} \\cdot d\\vec{A} = Q_{\\text{enc}}/\\varepsilon_0$, where $Q_{\\text{enc}}$ is the net charge enclosed and $\\varepsilon_0$ the vacuum permittivity. It follows from the inverse-square nature of Coulomb's law, and it is one of Maxwell's four equations — the one governing the divergence of the electric field.",
      },
      {
        heading: "Worked example",
        body: "A point charge $Q$ sits at the center of a sphere of radius $r$. By symmetry $E$ is radial and constant in magnitude on the surface, so the flux is $E \\cdot 4\\pi r^2$. Gauss's law gives $E \\cdot 4\\pi r^2 = Q/\\varepsilon_0$, hence $E = \\frac{Q}{4\\pi\\varepsilon_0 r^2}$ — Coulomb's law, derived without integrating over the charge itself. The same trick works for infinite lines, infinite planes, and uniformly charged spheres, where Gauss's law reduces a hard integral to a multiplication.",
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
    keyFormula: String.raw`\mathcal{E} = -\frac{d\Phi_B}{dt}`,
    tags: ["induction", "generators", "maxwell"],
    content: [
      {
        heading: "The intuition",
        body: "Magnetic fields do no work on charges directly, but a magnetic field that changes in time creates something new: a swirling electric field. If you thread a loop of wire with a magnetic field and then change the amount of field threading it — by moving a magnet, spinning a coil, or switching a current — charges in the wire feel pushed around the loop. That push, per unit charge, is the induced electromotive force.",
      },
      {
        heading: "The mathematics",
        body: "Define the magnetic flux $\\Phi_B = \\int \\vec{B} \\cdot d\\vec{A}$ through the loop. Faraday's law states that the induced emf equals the negative rate of change of flux: $\\mathcal{E} = -\\frac{d\\Phi_B}{dt}$. The minus sign is Lenz's law: the induced current flows so that its own magnetic field opposes the change in flux that created it. In differential form the law reads $\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}$ — a changing magnetic field generates a circulating electric field.",
      },
      {
        heading: "Worked example",
        body: "A 100-turn coil of area $0.02\\ \\text{m}^2$ sits perpendicular to a magnetic field that drops from $0.5\\ \\text{T}$ to $0\\ \\text{T}$ in $0.1\\ \\text{s}$. The flux through one turn changes by $\\Delta\\Phi = 0.02 \\times 0.5 = 0.01\\ \\text{Wb}$, so the emf per turn is $0.01/0.1 = 0.1\\ \\text{V}$. Across 100 turns the induced emf is $10\\ \\text{V}$. If the coil has resistance $5\\ \\Omega$, the current is $2\\ \\text{A}$ — and Lenz's law tells you it flows in the direction that tries to keep the field alive.",
      },
      {
        heading: "Why it matters",
        body: "Faraday's law is the physical engine of the modern world. Generators rotate coils in magnetic fields to produce the alternating current in the power grid; transformers use changing flux to step voltages up and down; induction stoves heat pans with eddy currents; and wireless phone chargers couple power through air with nothing but changing flux. It is also the law that makes electromagnetic waves possible: a changing field of one kind generates the other, and the two propagate as light.",
      },
    ],
    takeaways: [
      String.raw`An emf is induced whenever magnetic flux through a loop changes: $\mathcal{E} = -d\Phi_B/dt$.`,
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
    keyFormula: String.raw`\Delta U = Q - W`,
    tags: ["energy", "heat", "work"],
    content: [
      {
        heading: "The intuition",
        body: "Think of a gas in a cylinder with a movable piston. You can add energy to the gas in two distinct ways: by heating it (the molecules move faster) or by doing mechanical work on it (the piston squeezes the molecules closer together). Both deposit energy into the gas's internal store, $U$. The first law simply demands that the change in that store equals heat added minus work done by the gas: energy in minus energy out.",
      },
      {
        heading: "The mathematics",
        body: "For a system, $\\Delta U = Q - W$, where $Q$ is heat added to the system, $W$ is work done by the system, and $\\Delta U$ is the change in internal energy. For an infinitesimal process, $dU = \\delta Q - \\delta W$, where $\\delta Q$ and $\\delta W$ are inexact differentials (they depend on the path) while $dU$ is exact (it depends only on the state). For an ideal gas, $U$ depends only on temperature: $\\Delta U = n C_V \\Delta T$. This is why an isothermal process — one at fixed temperature — must have $Q = W$ exactly.",
      },
      {
        heading: "Worked example",
        body: "A gas absorbs $500\\ \\text{J}$ of heat while expanding and doing $350\\ \\text{J}$ of work on its surroundings. The internal energy changes by $\\Delta U = 500 - 350 = +150\\ \\text{J}$, so the gas gets slightly hotter. If instead the same $500\\ \\text{J}$ is absorbed but the gas is held at constant volume, no work is done and all of it raises the internal energy — the temperature rises more for the same heat input, which is precisely why specific heats at constant volume and constant pressure differ.",
      },
      {
        heading: "Why it matters",
        body: "The first law is the accountant of every energy conversion: engines, refrigerators, metabolic pathways, and stars all obey it. It tells you, for example, that no engine can produce work without drawing energy from somewhere, and that a refrigerator must reject more heat to the room than it removes from the food. Combined with the second law, it forms the backbone of all of thermodynamics and energy engineering.",
      },
    ],
    takeaways: [
      String.raw`$\Delta U = Q - W$: energy into a system either heats it or does work on it.`,
      "Internal energy is a state function; heat and work are path-dependent.",
      String.raw`For an ideal gas, internal energy depends only on temperature: $\Delta U = n C_V \Delta T$.`,
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
    keyFormula: String.raw`\Delta S = \frac{Q_{\text{rev}}}{T}, \qquad S = k_B \ln \Omega`,
    tags: ["entropy", "irreversibility", "statistical mechanics"],
    content: [
      {
        heading: "The intuition",
        body: "Why does a hot cup of coffee cool down but never spontaneously reheat? There is no force stopping the molecules from rearranging into the hot state — it is simply overwhelmingly unlikely. A gas spread through a room has vastly more arrangements (microstates) than a gas crammed into one corner. Entropy is the measure of how many arrangements a state has; nature drifts toward the most probable, highest-entropy arrangements because there are so many more of them.",
      },
      {
        heading: "The mathematics",
        body: "Boltzmann's formula makes this precise: $S = k_B \\ln \\Omega$, where $\\Omega$ is the number of microstates consistent with the macroscopic state and $k_B$ is Boltzmann's constant. For reversible heat transfer, the thermodynamic definition is $\\Delta S = Q_{\\text{rev}}/T$. The second law states that for an isolated system, $\\Delta S \\geq 0$: entropy never decreases. In open systems, local order is possible only by exporting entropy to the surroundings — the price of every refrigerator, cell, and living organism.",
      },
      {
        heading: "Worked example",
        body: "A $100\\ \\text{J}$ parcel of heat flows from a hot reservoir at $400\\ \\text{K}$ into a cold one at $300\\ \\text{K}$. The hot reservoir loses entropy $\\Delta S_{\\text{hot}} = -100/400 = -0.25\\ \\text{J/K}$; the cold one gains $\\Delta S_{\\text{cold}} = +100/300 \\approx +0.33\\ \\text{J/K}$. The net change is about $+0.08\\ \\text{J/K}$ — positive, as the second law demands. Reverse the flow and the net change would be negative, which is why heat never spontaneously flows uphill.",
      },
      {
        heading: "Why it matters",
        body: "Entropy is the arrow of time: it is the only fundamental law that distinguishes past from future. It dictates the maximum efficiency of heat engines (the Carnot limit), explains why some reactions proceed and others do not, and gives thermodynamics its deepest statement — that the universe, left to itself, moves toward ever more probable arrangements. Statisticians, information theorists, and cosmologists all use the same mathematics of counting possibilities.",
      },
    ],
    takeaways: [
      String.raw`Entropy counts the microstates behind a macrostate: $S = k_B \ln \Omega$.`,
      String.raw`The second law: the entropy of an isolated system never decreases ($\Delta S \geq 0$).`,
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
    keyFormula: String.raw`\lambda = \frac{h}{p}`,
    tags: ["photons", "de broglie", "interference"],
    content: [
      {
        heading: "The intuition",
        body: "Shine light through two slits and you see interference fringes — the signature of a wave. But dim the light until photons arrive one at a time, and each arrives at a single spot like a particle. Run the experiment long enough and the spots build up into the same interference pattern. The light is not 'really' a wave that collapses, nor a particle stream: it is a quantum object whose behavior — wave-like or particle-like — is set by what you choose to measure.",
      },
      {
        heading: "The mathematics",
        body: "The bridge between the two pictures is Planck's constant. A photon of frequency $f$ carries energy $E = hf$; a particle of momentum $p$ carries a wavelength $\\lambda = h/p$ (de Broglie's relation). For a tennis ball, $p$ is enormous, so $\\lambda \\approx 10^{-34}\\ \\text{m}$ — immeasurably small, which is why macroscopic objects look like particles. For an electron, $\\lambda$ is comparable to atomic spacings, so electrons diffract off crystals just like X-rays — the phenomenon that founded solid-state physics.",
      },
      {
        heading: "Worked example",
        body: "An electron accelerated through $100\\ \\text{V}$ gains kinetic energy $100\\ \\text{eV}$. Its momentum is $p = \\sqrt{2mK} \\approx 5.4 \\times 10^{-24}\\ \\text{kg·m/s}$, giving a de Broglie wavelength $\\lambda = h/p \\approx 1.2\\ \\text{Å}$ — about the spacing between atoms in a crystal. Shoot such electrons at a nickel crystal and they scatter with the sharp Bragg peaks of a wave. The same electron, detected on a screen, always lands as a single localized flash.",
      },
      {
        heading: "Why it matters",
        body: "Duality is the reason quantum mechanics exists as a theory of wave functions rather than trajectories: the wave function is the object whose interference pattern builds up from single detection events. It is also an everyday technology — electron microscopes achieve atomic resolution by exploiting short electron wavelengths, and the wave-like nature of matter is what makes the semiconductor band structure, and therefore every transistor, possible.",
      },
    ],
    takeaways: [
      String.raw`Every quantum object has both a wavelength and a momentum, linked by $\lambda = h/p$.`,
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
    keyFormula: String.raw`i\hbar \frac{\partial \psi}{\partial t} = \hat{H}\psi`,
    tags: ["wave function", "eigenstates", "atoms"],
    content: [
      {
        heading: "The intuition",
        body: "In classical physics, a particle follows a definite path. Quantum mechanics replaces the path with a wave function $\\psi$ that encodes everything knowable about the system, spread over space. The Schrödinger equation is the rule for how that wave function changes with time — it plays the role Newton's second law plays for trajectories. Where Newton's law says 'force changes velocity', Schrödinger's equation says 'energy changes the wave function'.",
      },
      {
        heading: "The mathematics",
        body: "The time-dependent equation reads $i\\hbar \\frac{\\partial \\psi}{\\partial t} = \\hat{H}\\psi$, where $\\hat{H} = -\\frac{\\hbar^2}{2m}\\nabla^2 + V$ is the Hamiltonian operator: kinetic energy as a second derivative, plus potential energy as multiplication. When the potential is time-independent, solutions factor as $\\psi(x,t) = \\phi(x)e^{-iEt/\\hbar}$, and $\\phi$ satisfies the time-independent equation $\\hat{H}\\phi = E\\phi$ — an eigenvalue problem whose allowed energies $E$ are the quantized levels. The probability of finding the particle is $|\\psi|^2$, so $\\psi$ must be normalizable.",
      },
      {
        heading: "Worked example",
        body: "A particle in a one-dimensional box of width $L$ has $V = 0$ inside and $V = \\infty$ outside, forcing $\\phi(0) = \\phi(L) = 0$. The solutions are $\\phi_n(x) = \\sqrt{2/L}\\sin(n\\pi x/L)$ with energies $E_n = \\frac{n^2\\pi^2\\hbar^2}{2mL^2}$. The energies grow as $n^2$ — the ground state has $n = 1$, and a node at the center belongs to the first excited state, $n = 2$. This toy model explains the confinement energy of electrons in quantum dots and the discrete absorption lines of molecules.",
      },
      {
        heading: "Why it matters",
        body: "Applied to the hydrogen atom, the Schrödinger equation produces the discrete energy levels and orbitals that spectroscopy observes to many decimal places — the first theory to explain the periodic table from first principles. It governs chemistry, semiconductors, lasers, and nuclear physics at the non-relativistic scale. It also carries a profound interpretation: the universe at the quantum level is described by probabilities that evolve deterministically, and only measurement collapses them into definite outcomes.",
      },
    ],
    takeaways: [
      String.raw`$\psi$ encodes everything knowable; $|\psi|^2$ is the probability density.`,
      String.raw`The equation $i\hbar \partial\psi/\partial t = \hat{H}\psi$ is the quantum analogue of Newton's law.`,
      String.raw`Time-independent solutions are eigenvalue problems: $\hat{H}\phi = E\phi$.`,
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
    keyFormula: String.raw`\Delta t = \gamma \Delta t_0, \qquad \gamma = \frac{1}{\sqrt{1 - v^2/c^2}}`,
    tags: ["einstein", "lorentz", "clocks"],
    content: [
      {
        heading: "The intuition",
        body: "Build a clock from two mirrors with a light pulse bouncing between them. To an observer riding with the clock, the pulse travels straight up and down. To an observer watching the clock fly past, the pulse traces a longer zigzag path — yet both must measure the same light speed $c$. The only way out is that the moving clock's 'tick' takes longer: the moving observer's time runs slower. Time dilation is not an illusion; it is what the constancy of light speed forces upon us.",
      },
      {
        heading: "The mathematics",
        body: "From the light-clock geometry (a right triangle with legs $ct_0$ and $vt$, hypotenuse $ct$) one derives the Lorentz factor $\\gamma = 1/\\sqrt{1 - v^2/c^2}$. The proper time $\\Delta t_0$ — measured by a clock at rest relative to the events — relates to the dilated time by $\\Delta t = \\gamma\\Delta t_0$. At everyday speeds $\\gamma \\approx 1$ and the effect is invisible; at $v = 0.87c$, $\\gamma = 2$, so moving clocks tick at half the rate.",
      },
      {
        heading: "Worked example",
        body: "Muons are created high in the atmosphere by cosmic rays and decay in about $2.2\\ \\mu\\text{s}$ of their own time. At $v = 0.98c$, $\\gamma \\approx 5$, so from Earth's frame their lifetime stretches to about $11\\ \\mu\\text{s}$ — long enough to travel roughly $3\\ \\text{km}$ instead of the $0.65\\ \\text{km}$ they would cover without dilation. This is why muons reach the ground at all, and it is confirmed daily in particle accelerators, where short-lived particles survive for many more 'Earth seconds' than their internal clocks allow.",
      },
      {
        heading: "Why it matters",
        body: "Time dilation is not a curiosity: GPS satellites carry atomic clocks that run fast by about $38\\ \\mu\\text{s}$ per day (dilation from orbital speed plus a general-relativistic correction), and the system corrects for it — otherwise positions would drift by kilometres per day. It also forces us to abandon the notion of a universal 'now': simultaneity itself is relative, and time must be treated as a fourth dimension interwoven with space.",
      },
    ],
    takeaways: [
      String.raw`Moving clocks run slow: $\Delta t = \gamma \Delta t_0$ with $\gamma \geq 1$.`,
      "The effect follows solely from the constancy of the speed of light.",
      "Muon lifetimes and particle accelerators confirm it routinely.",
      "GPS satellites must correct for relativistic time dilation to stay accurate.",
    ],
  },
  {
    slug: "superposition-and-interference",
    title: "Superposition and Interference",
    topic: "waves" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 8,
    summary:
      "Waves add where they meet — crest on crest grows, crest on trough cancels. Superposition turns two ordinary waves into interference patterns, standing waves, and the physics inside every instrument and interferometer.",
    keyFormula: String.raw`y_{\text{tot}} = y_1 + y_2, \qquad d \sin \theta = m \lambda`,
    tags: ["interference", "standing waves", "double slit"],
    content: [
      {
        heading: "The intuition",
        body: "Drop two pebbles into a pond and watch the ripples cross: where two crests meet the water rises higher, and where a crest meets a trough it flattens out. This is superposition — at every point the total disturbance is simply the sum of the individual waves. The waves pass through each other untouched and continue on, but in the region where they overlap they briefly add, subtract, and create the intricate lacework of an interference pattern.",
      },
      {
        heading: "The mathematics",
        body: "For two waves of the same frequency arriving at a point with path difference $\\Delta$, the phase difference is $\\delta = 2\\pi\\Delta/\\lambda$. The waves add constructively when $\\delta = 2\\pi m$, i.e. when $\\Delta = m\\lambda$ — crest on crest — and destructively when $\\Delta = (m + \\tfrac{1}{2})\\lambda$. For two slits separated by $d$ sending light to a screen far away at angle $\\theta$, the path difference is $d\\sin\\theta$, giving bright fringes at $d\\sin\\theta = m\\lambda$ and dark fringes at $d\\sin\\theta = (m + \\tfrac{1}{2})\\lambda$. At every instant and point, the total field obeys $y_{\\text{tot}} = y_1 + y_2$.",
      },
      {
        heading: "Worked example",
        body: "Light of wavelength $500\\ \\text{nm}$ passes through a double slit with separation $d = 0.2\\ \\text{mm}$ onto a screen $2\\ \\text{m}$ away. The fringe spacing is $\\Delta y = \\lambda L/d = (5 \\times 10^{-7})(2)/(2 \\times 10^{-4}) = 5\\ \\text{mm}$. Alternate bright and dark bands, each $5\\ \\text{mm}$ apart, appear on the screen. Cover one slit and the bands vanish into a single broad diffraction blob — the interference pattern is unambiguous evidence that light is a wave.",
      },
      {
        heading: "Why it matters",
        body: "Interference is both a nuisance and a precision tool. Thin-film coatings use it to cancel reflections in lenses and create iridescent soap bubbles; noise-cancelling headphones generate inverted waves to cancel ambient sound; LIGO measures ripples in spacetime by watching laser interference shift by a fraction of a proton's width. Standing waves — the superposition of a wave with its own reflection — are the physics of every string, pipe, and drum, and the double-slit version of this phenomenon is the doorway into quantum mechanics.",
      },
    ],
    takeaways: [
      "Waves add linearly at every point: the total is the sum of the parts.",
      "Constructive interference when the path difference is a whole number of wavelengths; destructive at half-integer values.",
      "Standing waves are a wave superposing with its own reflection.",
      "Interference is the working principle of lenses, noise cancellation, and gravitational-wave detectors.",
    ],
  },
  {
    slug: "snells-law",
    title: "Snell's Law and Geometric Optics",
    topic: "optics" as const,
    difficulty: "intro" as const,
    readingMinutes: 7,
    summary:
      "Light bends when it crosses from one medium into another — the rule that governs lenses, prisms, fiber optics, and mirages. Snell's law is the whole of geometric optics in one equation.",
    keyFormula: String.raw`n_1 \sin \theta_1 = n_2 \sin \theta_2, \qquad \theta_c = \sin^{-1}\left(\frac{n_2}{n_1}\right)`,
    tags: ["refraction", "total internal reflection", "lenses"],
    content: [
      {
        heading: "The intuition",
        body: "A stick dipped in water looks bent. Light slows down when it enters water or glass, and the change of speed bends its path — like a marching band hitting a patch of mud at an angle: the side that enters first slows first, and the whole line pivots toward the mud. Light bends toward the normal when entering a denser (slower) medium and away from it when leaving. Fermat's principle sharpens this into a law: light takes the path that minimizes travel time, and the kink at the surface is simply the fastest route.",
      },
      {
        heading: "The mathematics",
        body: "Each transparent material is characterized by its refractive index $n = c/v$, the ratio of the speed of light in vacuum to its speed in the material ($n \\approx 1$ for air, $1.33$ for water, $1.5$ for glass). Snell's law relates the angles on either side of a boundary: $n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2$. When light travels from a dense to a rare medium, the outgoing angle grows until it reaches $90^\\circ$; beyond the critical angle $\\theta_c = \\sin^{-1}(n_2/n_1)$ the light cannot escape at all — total internal reflection.",
      },
      {
        heading: "Worked example",
        body: "A laser beam in air strikes a glass block ($n = 1.5$) at $45^\\circ$ to the normal. Snell's law gives $\\sin\\theta_2 = \\sin 45^\\circ / 1.5 \\approx 0.471$, so the beam enters at about $28^\\circ$ — it bends toward the normal by roughly $17^\\circ$. Now send light from glass back toward air at $50^\\circ$: since $50^\\circ > \\theta_c = \\sin^{-1}(1/1.5) \\approx 41.8^\\circ$, no light escapes — it reflects perfectly back into the glass.",
      },
      {
        heading: "Why it matters",
        body: "Snell's law designs every lens in your eye, camera, and microscope, and it explains prisms splitting white light into a rainbow. Total internal reflection is the entire principle of optical fiber, which carries internet traffic as light bouncing down a glass thread. The same physics creates mirages (light bending in hot air) and lets fibre-optic endoscopes look inside the human body.",
      },
    ],
    takeaways: [
      "Light bends toward the normal when entering a medium where it travels slower.",
      String.raw`Snell's law: $n_1 \sin \theta_1 = n_2 \sin \theta_2$.`,
      "Total internal reflection happens beyond the critical angle and powers fiber optics.",
      "Lenses, prisms, mirages, and rainbows all follow from the same bending rule.",
    ],
  },
  {
    slug: "bernoullis-principle",
    title: "Bernoulli's Principle",
    topic: "fluids" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 7,
    summary:
      "In a smoothly flowing fluid, faster flow means lower pressure. Bernoulli's equation is energy conservation applied to a fluid, and it explains lift, spray, siphons, and how a sailing boat sails into the wind.",
    keyFormula: String.raw`P + \tfrac{1}{2}\rho v^2 + \rho g h = \text{const}`,
    tags: ["fluid flow", "pressure", "lift"],
    content: [
      {
        heading: "The intuition",
        body: "Squeeze a garden hose nozzle and the water shoots out faster — and the pressure inside the narrowed section drops. That trade-off is Bernoulli: for an incompressible, frictionless fluid flowing steadily, the total of pressure energy, kinetic energy per unit volume, and gravitational potential per unit volume stays constant along a streamline. Speed up the flow and the pressure must fall to keep the total the same.",
      },
      {
        heading: "The mathematics",
        body: "The equation reads $P + \\tfrac{1}{2}\\rho v^2 + \\rho g h = \\text{const}$ along a streamline, where $P$ is pressure, $\\rho$ the density, $v$ the speed, and $h$ the height. Continuity demands that the same mass flows through every cross-section: $A_1 v_1 = A_2 v_2$, so a narrower pipe forces faster flow. Combined, the two equations let you compute pressure changes from geometry alone. For a fluid at rest the equation reduces to the hydrostatic formula $\\Delta P = \\rho g \\Delta h$.",
      },
      {
        heading: "Worked example",
        body: "Water ($\\rho = 1000\\ \\text{kg/m}^3$) flows through a pipe of area $4\\ \\text{cm}^2$ at $1\\ \\text{m/s}$; the pipe narrows to $1\\ \\text{cm}^2$, so by continuity $v_2 = 4\\ \\text{m/s}$. Bernoulli at constant height gives $P_2 = P_1 + \\tfrac{1}{2}\\rho(v_1^2 - v_2^2) = P_1 - 7500\\ \\text{Pa}$ — a pressure drop of $7.5\\ \\text{kPa}$ in the throat, exactly the effect that sucks fuel into a carburetor or perfume up an atomizer.",
      },
      {
        heading: "Why it matters",
        body: "Bernoulli's principle is the heart of flight: the curved top of a wing speeds the air above it, lowering pressure and producing lift (with the wing's angle of attack doing the rest of the job). It explains how aircraft instruments measure airspeed with a Pitot tube, why a shower curtain billows inward, and why fast-moving blood in a narrowed artery exerts less pressure on the wall — the reason aneurysms are dangerous. Sailboats use the same low-pressure region on the leeward side of the sail to sail into the wind.",
      },
    ],
    takeaways: [
      "Faster fluid flow means lower pressure — energy conservation per unit volume.",
      String.raw`$P + \tfrac{1}{2}\rho v^2 + \rho g h$ is constant along a streamline.`,
      "Continuity ($Av$ constant) forces narrow pipes to speed the flow up.",
      "Bernoulli explains lift, carburetors, Pitot tubes, and sailing into the wind.",
    ],
  },
  {
    slug: "maxwell-boltzmann-distribution",
    title: "The Maxwell–Boltzmann Distribution",
    topic: "statistical" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 9,
    summary:
      "Gas molecules do not all move at one speed — they spread across a distribution that widens and shifts with temperature. The Maxwell–Boltzmann distribution turns a gas's molecular chaos into predictions about chemistry, fusion, and why a hot drink cools.",
    keyFormula: String.raw`f(v) = 4\pi v^2 \left(\frac{m}{2\pi k_B T}\right)^{3/2} e^{-mv^2 / 2k_B T}`,
    tags: ["kinetic theory", "gases", "temperature"],
    content: [
      {
        heading: "The intuition",
        body: "A gas is a swarm of molecules colliding constantly, swapping energy on every impact. Left alone, the swarm settles into a steady pattern: most molecules move at a middle speed, a few crawl, and a precious few race far above the average. Heat the gas and the whole distribution stretches toward higher speeds. The Maxwell–Boltzmann distribution is the mathematical portrait of that pattern — the most probable arrangement, given that energy is conserved.",
      },
      {
        heading: "The mathematics",
        body: "The fraction of molecules with speed between $v$ and $v + dv$ is $f(v)\\,dv$ with $f(v) = 4\\pi v^2 \\left(\\frac{m}{2\\pi k_B T}\\right)^{3/2} e^{-mv^2/2k_B T}$. The factor $v^2$ counts how many velocity directions give the same speed; the exponential suppresses enormous speeds. Three characteristic speeds follow: the most probable $v_p = \\sqrt{2k_B T/m}$, the mean $\\bar{v} = \\sqrt{8k_B T/\\pi m}$, and the root-mean-square $v_{\\text{rms}} = \\sqrt{3k_B T/m}$ — the one that appears in $\\tfrac{1}{2}m v_{\\text{rms}}^2 = \\tfrac{3}{2}k_B T$.",
      },
      {
        heading: "Worked example",
        body: "Nitrogen molecules ($m \\approx 4.65 \\times 10^{-26}\\ \\text{kg}$) at room temperature $300\\ \\text{K}$: $v_{\\text{rms}} = \\sqrt{3k_B T/m} \\approx 517\\ \\text{m/s}$ — faster than a rifle bullet — with $v_p \\approx 422\\ \\text{m/s}$ and $\\bar{v} \\approx 476\\ \\text{m/s}$. Light hydrogen molecules move about four times faster at the same temperature because $v \\propto 1/\\sqrt{m}$.",
      },
      {
        heading: "Why it matters",
        body: "The high-speed tail of the distribution is where chemistry happens: only molecules with enough energy can break bonds in a collision, which is why reaction rates rocket with temperature and why molecules escape planetary atmospheres — light hydrogen leaks away from Earth while heavy gases stay. The distribution governs evaporation, effusion and Graham's law of separation, and it sets the conditions for controlled nuclear fusion, where a sufficiently hot gas must keep its fastest ions colliding hard enough to fuse.",
      },
    ],
    takeaways: [
      "Gas molecules spread across a speed distribution, not a single speed.",
      "The distribution widens and shifts to higher speeds as temperature rises.",
      String.raw`$v_{\text{rms}} = \sqrt{3k_B T/m}$ sets the average kinetic energy: $\tfrac{1}{2}m v_{\text{rms}}^2 = \tfrac{3}{2}k_B T$.`,
      "The high-speed tail drives chemical reactions, evaporation, and atmospheric escape.",
    ],
  },
  {
    slug: "kirchhoffs-laws",
    title: "Kirchhoff's Laws and DC Circuits",
    topic: "circuits" as const,
    difficulty: "intro" as const,
    readingMinutes: 6,
    summary:
      "Two bookkeeping rules — charge never piles up at a junction, and energy is conserved around a loop — reduce any DC circuit, however tangled, to algebra. Kirchhoff's laws are the foundation of all circuit analysis.",
    keyFormula: String.raw`\sum I_{\text{in}} = \sum I_{\text{out}}, \qquad \sum \mathcal{E} = \sum IR`,
    tags: ["circuits", "current", "voltage"],
    content: [
      {
        heading: "The intuition",
        body: "Think of electric current as water in pipes. At any junction, the water flowing in must equal the water flowing out — charge cannot accumulate at a T-junction. That is the junction rule. And if you walk around a closed loop of pipes, whatever pressure the pumps add must be exactly consumed by friction along the way — energy is conserved. That is the loop rule. Ohm's law $V = IR$ supplies the friction: each resistor drops voltage in proportion to the current through it.",
      },
      {
        heading: "The mathematics",
        body: "The junction rule states $\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$ at every node. The loop rule states $\\sum \\mathcal{E} = \\sum IR$ around any closed loop (with signs set by the direction you traverse: voltage rises through a battery from minus to plus, and drops through resistors in the direction of current). For a circuit with $J$ junctions, you write $J - 1$ independent junction equations plus one loop equation per independent loop, and solve the resulting linear system for every current — even when the circuit is too tangled to simplify with series and parallel rules.",
      },
      {
        heading: "Worked example",
        body: "Two batteries, $\\mathcal{E}_1 = 12\\ \\text{V}$ and $\\mathcal{E}_2 = 6\\ \\text{V}$, sit in a single loop with resistors $R_1 = 2\\ \\Omega$ and $R_2 = 4\\ \\Omega$, connected opposing each other. Traverse the loop with the 12 V battery: $12 - 6 = I(2 + 4)$, so $6 = 6I$ and $I = 1\\ \\text{A}$, flowing in the direction the larger battery pushes. Flip the second battery to aid the first and the loop equation becomes $12 + 6 = 6I$, giving $I = 3\\ \\text{A}$. The same circuit, one sign change, three times the current — which is exactly why Kirchhoff's sign conventions must be applied systematically.",
      },
      {
        heading: "Why it matters",
        body: "Kirchhoff's laws analyze everything from a flashlight to the power grid: they determine how current splits through parallel bulbs, how an ECG traces the electrical activity of the heart, and how engineers size wiring so nothing melts. They are also the foundation on which the more advanced tools of circuit theory — mesh analysis, nodal analysis, and the full machinery of electronics — are built.",
      },
    ],
    takeaways: [
      "The junction rule: charge flowing in equals charge flowing out at every node.",
      "The loop rule: voltage rises around a loop equal voltage drops.",
      "Kirchhoff's laws reduce any DC circuit to a system of linear equations.",
      "Ohm's law ($V = IR$) is the local rule; Kirchhoff's laws are the global bookkeeping.",
    ],
  },
  {
    slug: "radioactive-decay",
    title: "Radioactive Decay and Half-Life",
    topic: "atomic" as const,
    difficulty: "intro" as const,
    readingMinutes: 6,
    summary:
      "Unstable nuclei fall apart at random — but with such a reliable probability per second that a large sample decays with clockwork precision. Exponential decay and half-life are the tools of carbon dating, nuclear power, and medical imaging.",
    keyFormula: String.raw`N(t) = N_0 e^{-\lambda t}, \qquad t_{1/2} = \frac{\ln 2}{\lambda}`,
    tags: ["nuclear", "half-life", "dating"],
    content: [
      {
        heading: "The intuition",
        body: "You cannot predict which individual nucleus decays, or when. But each nucleus carries a fixed probability per second of decaying — like a room of people each flipping a biased coin once a second. In every second, the same fraction of the remaining population decays, so the decay slows as the population shrinks: the number of survivors falls by half over each equal interval. That interval is the half-life, and it is the same whether you start with a billion nuclei or two.",
      },
      {
        heading: "The mathematics",
        body: "The decay rate is proportional to the number present: $dN/dt = -\\lambda N$, where $\\lambda$ is the decay constant. The solution is exponential decay $N(t) = N_0 e^{-\\lambda t}$. The half-life follows from $N(t_{1/2}) = N_0/2$: $t_{1/2} = \\ln 2/\\lambda$. The activity $A = \\lambda N$ — decays per second, measured in becquerels — also decays exponentially, which is why an old source is less dangerous: after seven half-lives only about one percent of the original activity remains.",
      },
      {
        heading: "Worked example",
        body: "Carbon-14 has a half-life of about $5730$ years, and living things hold a constant ratio of $^{14}\\text{C}$ to $^{12}\\text{C}$ until they die. A wooden artifact shows one quarter of the modern $^{14}\\text{C}$ abundance. Two half-lives have passed ($1 \\to \\tfrac{1}{2} \\to \\tfrac{1}{4}$), so the wood is about $2 \\times 5730 = 11460$ years old — a result archaeology and geology use every day, cross-checked with tree rings and ice cores.",
      },
      {
        heading: "Why it matters",
        body: "Radioactivity is everywhere in modern life. Carbon dating reads the age of ancient remains; PET scanners trace short-lived isotopes inside the body to map organs and tumors; smoke detectors use alpha-emitting americium; nuclear reactors and stars run on the fission and fusion of radioactive fuel. Understanding decay — and its exponential character — is also the first lesson in radiation safety: it tells you exactly how long a contaminated object stays dangerous.",
      },
    ],
    takeaways: [
      "Decay is random per nucleus but statistically exponential for a large sample.",
      String.raw`$N(t) = N_0 e^{-\lambda t}$ with half-life $t_{1/2} = \ln 2 / \lambda$.`,
      "After $n$ half-lives, a fraction $1/2^n$ of the original nuclei remains.",
      "Half-life powers carbon dating, nuclear medicine, reactors, and radiation safety.",
    ],
  },
  {
    slug: "standard-model",
    title: "The Standard Model of Particle Physics",
    topic: "particle" as const,
    difficulty: "advanced" as const,
    readingMinutes: 10,
    summary:
      "The universe's matter is built from twelve elementary particles interacting through four forces exchanged by carrier particles. The Standard Model is the most precisely tested theory in science — and still leaves deep questions open.",
    keyFormula: String.raw`SU(3) \times SU(2) \times U(1)`,
    tags: ["quarks", "gauge bosons", "higgs"],
    content: [
      {
        heading: "The intuition",
        body: "Strip matter down as far as physics can go and you find a remarkably small menu. Six quarks build protons, neutrons, and every atomic nucleus; six leptons include the electron that orbits it and the neutrinos that stream through you. Forces are not pulls but exchanges: particles toss messenger particles back and forth like ice-skaters exchanging a ball — the electromagnetic force exchanges photons, the strong force exchanges gluons, and the weak force exchanges W and Z bosons.",
      },
      {
        heading: "The mathematics",
        body: "The theory is a gauge field theory with the symmetry group $SU(3) \\times SU(2) \\times U(1)$: the $SU(3)$ color symmetry generates the strong force via eight gluons; $SU(2) \\times U(1)$ unifies the weak and electromagnetic forces, whose W and Z bosons and photon emerge when the Higgs field breaks the symmetry. Quarks and leptons arrange themselves into three generations — (up, down, electron, electron neutrino), (charm, strange, muon, muon neutrino), (top, bottom, tau, tau neutrino) — the generations differing only in mass. The Higgs boson, discovered at CERN in 2012, is the last piece of the puzzle, giving the W, Z, and fermions their masses.",
      },
      {
        heading: "Worked example",
        body: "A proton is two up quarks and a down quark (uud); a neutron is udd. In beta decay, a down quark inside a neutron converts into an up quark by emitting a virtual $W^-$ boson, which promptly decays into an electron and an antineutrino: $n \\to p + e^- + \\bar{\\nu}_e$. This single process — a quark changing flavour through the weak force — is how radioactive nuclei emit beta particles, and it is the decay that makes carbon dating possible.",
      },
      {
        heading: "Why it matters",
        body: "The Standard Model has passed every experimental test for half a century, predicting particle properties to one part in a billion. It explains why atoms are stable, why the Sun shines (via weak interactions in fusion), and what the Higgs boson is. But it is not the final word: it says nothing about gravity, dark matter, or the cosmic excess of matter over antimatter, and neutrinos' tiny masses were a surprise. These gaps are the frontier — and the search for physics beyond the Standard Model is what the largest experiments on Earth are built for.",
      },
    ],
    takeaways: [
      "Matter is built from six quarks and six leptons arranged in three generations.",
      "Forces are exchanged messenger particles: photons, gluons, and W and Z bosons.",
      String.raw`The symmetry group $SU(3) \times SU(2) \times U(1)$ organizes the forces; the Higgs field gives particles mass.`,
      "The Standard Model is supremely precise but incomplete — no gravity, dark matter, or matter–antimatter asymmetry.",
    ],
  },
  {
    slug: "band-theory-of-solids",
    title: "Band Theory of Solids",
    topic: "solidstate" as const,
    difficulty: "advanced" as const,
    readingMinutes: 9,
    summary:
      "When atoms pack into a crystal, their discrete energy levels smear into bands, and the gaps between bands decide whether a solid is a metal, a semiconductor, or an insulator — and therefore whether your phone exists.",
    keyFormula: String.raw`E(k) = \epsilon_0 - 2t \cos(ka)`,
    tags: ["semiconductors", "electrons", "crystals"],
    content: [
      {
        heading: "The intuition",
        body: "A single atom has sharp, private energy levels. Bring two atoms close and their levels split — one slightly higher, one slightly lower — because the electrons now share two nuclei. Pack billions of atoms into a crystal and each level splits into billions of closely spaced levels that blend into a continuous band. Between bands lie gaps: energies no electron may take. Whether a solid conducts depends entirely on whether its bands are full, empty, or half-filled.",
      },
      {
        heading: "The mathematics",
        body: "In the simplest model (tight-binding), an electron hopping between neighbouring sites acquires an energy that depends on its wave number $k$: $E(k) = \\epsilon_0 - 2t\\cos(ka)$, where $t$ measures the hopping strength and $a$ the lattice spacing. The band spans from $\\epsilon_0 - 2t$ to $\\epsilon_0 + 2t$; the gap to the next band is set by the atomic levels and the lattice. Electrons fill states two per site (spin up and down). A metal has a partially filled band, so electrons can hop to slightly higher states under an electric field; an insulator has a completely full band separated by a large gap; a semiconductor has a full valence band with a small gap — a few electron-volts or less — that thermal energy can bridge.",
      },
      {
        heading: "Worked example",
        body: "Copper is a metal: its outermost band is only half full, so a tiny electric field nudges electrons into empty states and current flows easily — the reason copper wires conduct. Silicon is a semiconductor: its valence band is full, but the gap of about $1.1\\ \\text{eV}$ is small enough that at room temperature a few electrons are thermally excited into the conduction band, giving a small but real conductivity. Add a sprinkle of phosphorus (one extra electron per atom) and silicon becomes n-type, conducting far better — the controlled doping at the heart of every transistor.",
      },
      {
        heading: "Why it matters",
        body: "Band theory explains the entire electronics age: semiconductors' conductivity can be switched by doping, light, voltage, and heat, which is how transistors amplify and compute, how LEDs emit light (electrons falling across the gap release a photon of that gap's energy), and how solar cells collect it. From the silicon in your phone to the gallium nitride in laser pointers, band structure is the design sheet of solid-state technology.",
      },
    ],
    takeaways: [
      "Atomic levels split into bands when atoms form a crystal; gaps separate the bands.",
      "A metal has a partially filled band; an insulator a full band with a large gap; a semiconductor a small gap.",
      String.raw`Tight binding: $E(k) = \epsilon_0 - 2t \cos(ka)$ — energy depends on the electron's wave number.`,
      "Doping semiconductors (extra or missing electrons) is the basis of transistors, LEDs, and solar cells.",
    ],
  },
  {
    slug: "hubbles-law",
    title: "Hubble's Law and the Expanding Universe",
    topic: "cosmology" as const,
    difficulty: "intro" as const,
    readingMinutes: 7,
    summary:
      "Every distant galaxy is rushing away from us, and the farther it is, the faster it recedes. Hubble's law turns a handful of redshifts into the expansion of the universe — and a timeline back to the Big Bang.",
    keyFormula: String.raw`v = H_0 d`,
    tags: ["cosmology", "big bang", "redshift"],
    content: [
      {
        heading: "The intuition",
        body: "Look at any distant galaxy and its light is shifted toward the red — the galaxy is moving away. Measure a hundred galaxies and a pattern emerges: twice as far away means twice as fast. This is not a burst of galaxies fleeing from us in particular; every observer in the universe would see the same thing, because space itself is stretching. It is the signature of an expanding universe — raisins in a rising loaf of bread: each raisin sees every other raisin receding, with speed proportional to distance.",
      },
      {
        heading: "The mathematics",
        body: "Hubble's law states the recession speed is proportional to distance: $v = H_0 d$, with $H_0$ the Hubble constant, about $70\\ \\text{km/s}$ per megaparsec ($1\\ \\text{Mpc} \\approx 3.26\\ \\text{million light-years}$). The speed is measured from the redshift $z = \\Delta\\lambda/\\lambda$, with $v \\approx cz$ for nearby galaxies. Inverting the law gives a rough age for the universe: a galaxy at distance $d$ moving at $v$ took about $d/v = 1/H_0$ to get there, which works out to roughly $13.8$ billion years — the current best estimate.",
      },
      {
        heading: "Worked example",
        body: "A galaxy sits at $100\\ \\text{Mpc}$. With $H_0 = 70\\ \\text{km/s/Mpc}$, it recedes at $v = 70 \\times 100 = 7000\\ \\text{km/s}$, about $2.3$ percent of the speed of light ($z \\approx 0.023$). The galaxy's spectrum arrives stretched by that fraction, and the age estimate from $1/H_0$ is about $14$ billion years — consistent, after refined measurements, with the age of the oldest stars and of the cosmic microwave background.",
      },
      {
        heading: "Why it matters",
        body: "Hubble's law is the observational cornerstone of modern cosmology. Run the expansion backward and the universe was once a single, enormously hot and dense point — the Big Bang, whose afterglow we still see as the cosmic microwave background. In 1998 astronomers found the expansion is accelerating, implying a mysterious dark energy that now dominates the universe's energy budget. Hubble's law still organizes all of it: one equation, written a century ago, that lets us weigh the universe and read its history.",
      },
    ],
    takeaways: [
      "Distant galaxies recede with speed proportional to distance: $v = H_0 d$.",
      "Redshift measures recession speed: $z \\approx v/c$ for nearby galaxies.",
      String.raw`Running the expansion backward yields a universe about $1/H_0 \approx 13.8$ billion years old.`,
      "The expansion is accelerating — the signature of dark energy.",
    ],
  },
  {
    slug: "lagrangian-mechanics",
    title: "The Lagrangian Formulation of Mechanics",
    topic: "classical" as const,
    difficulty: "advanced" as const,
    readingMinutes: 9,
    summary:
      "Newton tracks forces; the Lagrangian formulation tracks energy, and nature takes the path of least action. This reformulation of classical mechanics is the gateway to everything modern — from quantum fields to spacecraft trajectories.",
    keyFormula: String.raw`L = T - V, \qquad \frac{d}{dt}\frac{\partial L}{\partial \dot{q}} - \frac{\partial L}{\partial q} = 0`,
    tags: ["least action", "euler-lagrange", "noether"],
    content: [
      {
        heading: "The intuition",
        body: "Newton's laws tell a particle which way to accelerate at every instant. The Lagrangian picture asks a different question: of all the paths a particle could take between two points, which one does it actually choose? The answer — the principle of least action — is that it takes the path for which the action $S = \\int L\\, dt$ is stationary (usually a minimum), where the Lagrangian is kinetic minus potential energy, $L = T - V$. Instead of tracking forces, you track energy, and the path falls out of a single variational problem.",
      },
      {
        heading: "The mathematics",
        body: "For generalized coordinates $q$ (any convenient set — angles, distances, even field values), the Lagrangian is $L = T - V$, and the actual motion satisfies the Euler–Lagrange equation $\\frac{d}{dt}\\frac{\\partial L}{\\partial \\dot{q}} - \\frac{\\partial L}{\\partial q} = 0$ — one equation per coordinate, derived without drawing a single free-body diagram, and constraint forces vanish automatically because you choose coordinates that respect the constraints. A profound bonus is Noether's theorem: every continuous symmetry of the Lagrangian implies a conserved quantity. Time translation symmetry gives energy conservation; space translation gives momentum; rotation gives angular momentum.",
      },
      {
        heading: "Worked example",
        body: "A simple pendulum of mass $m$ and length $\\ell$ is described by the single coordinate $\\theta$. The kinetic energy is $T = \\tfrac{1}{2}m\\ell^2\\dot{\\theta}^2$ and the potential is $V = mg\\ell(1 - \\cos\\theta)$, so $L = \\tfrac{1}{2}m\\ell^2\\dot{\\theta}^2 - mg\\ell(1 - \\cos\\theta)$. The Euler–Lagrange equation gives $\\ddot{\\theta} + \\frac{g}{\\ell}\\sin\\theta = 0$ — the exact pendulum equation, obtained without computing the string tension or resolving forces. For small angles, $\\sin\\theta \\approx \\theta$ recovers simple harmonic motion with $\\omega = \\sqrt{g/\\ell}$.",
      },
      {
        heading: "Why it matters",
        body: "The Lagrangian formulation is not a stylistic flourish; it is the language of all modern physics. Quantum mechanics and quantum field theory are built from Lagrangians, general relativity is derived from an action principle, and the Standard Model is literally a Lagrangian. In engineering, the same machinery designs spacecraft trajectories and robot motions. If you master Euler–Lagrange equations in classical mechanics, you have already learned the grammar of the entire theoretical physics curriculum.",
      },
    ],
    takeaways: [
      "Nature chooses the path of stationary action; the Lagrangian is $L = T - V$.",
      String.raw`The Euler–Lagrange equation $\frac{d}{dt}\frac{\partial L}{\partial \dot{q}} - \frac{\partial L}{\partial q} = 0$ gives the equations of motion for each coordinate.`,
      "Noether's theorem: symmetries of the Lagrangian imply conserved quantities.",
      "The Lagrangian formulation is the foundation of quantum theory, relativity, and modern engineering.",
    ],
  },
  {
    slug: "fourier-series-and-transforms",
    title: "Fourier Series and Transforms",
    topic: "mathematical" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 9,
    summary:
      "Any repeating wave — a square wave, a musical note, a heartbeat — is secretly a sum of pure sine waves. Fourier analysis is how physics decomposes complicated signals into simple harmonics, and it sits beneath sound, images, quantum mechanics, and the heat equation.",
    keyFormula: String.raw`f(x) = \frac{a_0}{2} + \sum_{n=1}^{\infty} \left(a_n \cos\frac{n\pi x}{L} + b_n \sin\frac{n\pi x}{L}\right)`,
    tags: ["harmonics", "signal analysis", "quantum"],
    content: [
      {
        heading: "The intuition",
        body: "A musical chord is several pure notes sounding at once, and your ear effortlessly separates them. Fourier's claim is that the reverse is always true: any periodic shape — even a harsh square wave — can be built by adding together the right pure sine and cosine waves with the right sizes. It is like saying every colour on a screen is a mix of three primaries, except the palette has infinitely many hues. The set of sines and cosines acts as a basis in which complicated waveforms become simple lists of amplitudes.",
      },
      {
        heading: "The mathematics",
        body: "A function with period $2L$ is written $f(x) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty}\\left(a_n \\cos\\frac{n\\pi x}{L} + b_n \\sin\\frac{n\\pi x}{L}\\right)$. The coefficients are extracted by integrating against each basis function, which works because sines and cosines are orthogonal: $a_n = \\frac{1}{L}\\int_{-L}^{L} f(x)\\cos\\frac{n\\pi x}{L}\\,dx$, and similarly for $b_n$. For non-periodic functions the sum becomes the Fourier transform $\\hat{f}(k) = \\int_{-\\infty}^{\\infty} f(x)\\,e^{-ikx}\\,dx$, trading a discrete list of harmonics for a continuous spectrum.",
      },
      {
        heading: "Worked example",
        body: "A square wave of amplitude 1 contains only odd harmonics: $f(x) = \\frac{4}{\\pi}\\left(\\sin x + \\frac{1}{3}\\sin 3x + \\frac{1}{5}\\sin 5x + \\cdots\\right)$. Add just the first term and you get a gentle sinusoid; add the third and the flanks start to flatten; carry the series to the 21st harmonic and the wave is recognizably square, with small overshoot spikes at the corners (the Gibbs phenomenon) that never vanish entirely. This is why a clipped amplifier signal sounds harsh — it injects many extra harmonics.",
      },
      {
        heading: "Why it matters",
        body: "Fourier analysis is the workhorse of science and engineering. MP3 and JPEG compression keep only the largest Fourier coefficients; the heat equation and wave equation are solved by decomposing initial conditions into harmonics that each evolve simply; in quantum mechanics, position and momentum are Fourier partners — the real origin of the uncertainty principle, since a sharply localised wave needs a huge spread of momenta. Wherever there is a wave, there is a Fourier series hiding underneath.",
      },
    ],
    takeaways: [
      "Any periodic function is a sum of sine and cosine harmonics with the right amplitudes.",
      "Orthogonality lets you extract each coefficient with a single integral.",
      "The Fourier transform generalises the idea to non-periodic signals.",
      "Fourier pairs (position and momentum) underlie the uncertainty principle and all wave physics.",
    ],
  },
] as const;

export type SeedConcept = (typeof SEED_CONCEPTS)[number];
