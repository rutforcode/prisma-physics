/**
 * Second batch of university-level concept explanations, giving every topic
 * at least two entries. Same shape as `SEED_CONCEPTS` in seedData.ts; the
 * `concepts.seed` mutation upserts both arrays together (see convex/concepts.ts).
 * Formulas are in MathJax 3 (TeX) format — inline math in `$...$`.
 */

export const SEED_CONCEPTS_EXTRA = [
  {
    slug: "standing-waves-and-resonance",
    title: "Standing Waves and Resonance",
    topic: "waves" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 8,
    summary:
      "A wave and its own reflection can lock into fixed, frozen shapes — nodes and antinodes that vibrate without travelling. Standing waves are why guitars sing, pipes whistle, and bridges can collapse.",
    keyFormula: String.raw`f_n = \frac{nv}{2L}, \qquad \lambda_n = \frac{2L}{n}`,
    tags: ["resonance", "harmonics", "strings"],
    content: [
      {
        heading: "The intuition",
        body: "Pluck a guitar string and a pulse races to both ends, reflects, and races back. Repeatedly reflected, the two opposing trains of waves overlap — and at certain special frequencies they lock into a shape that stands still in space: the string bulges in fixed loops, with silent points (nodes) at the ends and between the loops, and maximum motion (antinodes) in between. Because the ends of a string are pinned, only wavelengths that fit a whole number of half-loops can persist; everything else dies out within a few reflections.",
      },
      {
        heading: "The mathematics",
        body: "For a string of length $L$ fixed at both ends, the boundary conditions demand nodes at each end, so the allowed wavelengths are $\\lambda_n = 2L/n$ for $n = 1, 2, 3, \\dots$. With wave speed $v$, the frequencies are the harmonics $f_n = nv/2L$: the fundamental $f_1 = v/2L$ plus integer multiples. A pipe open at both ends behaves identically, while a pipe closed at one end has a node at the closed end and an antinode at the open end, admitting only the odd harmonics $f_n = nv/4L$ with $n$ odd. A system driven at exactly one of these natural frequencies builds up huge amplitudes — that is resonance.",
      },
      {
        heading: "Worked example",
        body: "A guitar string of length $L = 0.65\\ \\text{m}$ carries a wave speed $v = 440\\ \\text{m/s}$. The fundamental is $f_1 = v/2L = 440/1.3 \\approx 338\\ \\text{Hz}$, with the second harmonic at $676\\ \\text{Hz}$ and the third at $1014\\ \\text{Hz}$ — pressing a fret shortens $L$ and raises every harmonic together, which is how one string produces a full melody. A closed organ pipe of length $0.34\\ \\text{m}$ with the speed of sound $340\\ \\text{m/s}$ has $f_1 = v/4L = 250\\ \\text{Hz}$, and its next allowed tone is the third harmonic, $750\\ \\text{Hz}$.",
      },
      {
        heading: "Why it matters",
        body: "Standing waves and resonance are everywhere. Every string, drum, pipe, and voice uses harmonics to make its characteristic sound; MRI scanners excite standing waves of nuclear spin; microwave ovens cook at a resonant frequency that forms hot spots a half-wavelength apart; and the Tacoma Narrows bridge collapsed when wind-driven vibrations matched its natural frequency. In quantum mechanics the same boundary-condition thinking — waves that must fit — quantizes the energy levels of a particle in a box and the orbitals of atoms.",
      },
    ],
    takeaways: [
      "Standing waves form when a wave superposes with its own reflection; nodes stay still, antinodes move most.",
      String.raw`A string fixed at both ends admits only $\lambda_n = 2L/n$, giving harmonics $f_n = nv/2L$.`,
      "A pipe closed at one end allows only odd harmonics.",
      "Driving a system at its natural frequency is resonance — the physics of instruments, microwaves, and bridge failures.",
    ],
  },
  {
    slug: "diffraction-and-the-single-slit",
    title: "Diffraction and the Single Slit",
    topic: "optics" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 8,
    summary:
      "Light bends around obstacles and spreads after passing through any opening. Diffraction sets the resolution limit of every telescope and microscope — and makes X-ray crystallography possible.",
    keyFormula: String.raw`a \sin \theta = m\lambda, \qquad \theta_1 \approx \frac{\lambda}{a}`,
    tags: ["diffraction", "resolution", "huygens"],
    content: [
      {
        heading: "The intuition",
        body: "Shine a laser through a narrow slit onto a wall and the spot is not a sharp rectangle — it is a bright central band flanked by fainter stripes. The light has spread sideways, as if the slit itself were a new source. This is diffraction: every point of a wavefront acts as a tiny secondary source (Huygens' principle), so when only part of a wavefront gets through, the wave can no longer reconstruct a straight beam and blooms sideways instead. The narrower the slit, the wider the spread.",
      },
      {
        heading: "The mathematics",
        body: "Divide the slit of width $a$ into many small sources. Dark fringes occur where the light from one half of the slit cancels the other half, which happens at angles satisfying $a\\sin\\theta = m\\lambda$ for $m = \\pm 1, \\pm 2, \\dots$ (unlike the double slit, $m = 0$ is the bright central maximum). The central maximum has angular half-width $\\theta_1 \\approx \\lambda/a$ when the angle is small. Wider slits diffract less; shorter wavelengths diffract less — which is why radio waves bend around buildings while light does not.",
      },
      {
        heading: "Worked example",
        body: "A slit of width $a = 0.1\\ \\text{mm}$ is lit by green light of wavelength $\\lambda = 500\\ \\text{nm}$. The central maximum's angular half-width is $\\theta_1 \\approx \\lambda/a = (5 \\times 10^{-7})/(10^{-4}) = 5 \\times 10^{-3}$ radians, about $0.29^\\circ$. On a screen $2\\ \\text{m}$ away the central bright band is therefore about $2 \\times (2)(0.005) = 20\\ \\text{mm}$ wide. Repeat with the slit ten times wider and the band shrinks to about $2\\ \\text{mm}$ — the beam looks undiffracted only because most slits are huge compared to the wavelength.",
      },
      {
        heading: "Why it matters",
        body: "Diffraction caps the sharpness of every imaging system: two stars closer together than roughly $\\lambda/D$ blur into one, which is why the largest telescopes exist and why microscopes cannot resolve below about half a wavelength of light (electron microscopes beat this using much shorter wavelengths). The same spreading makes sound audible around corners, lets CDs and DVDs read data from sub-micron pits, and, inverted, is the principle of X-ray crystallography — firing X-rays at crystals and reading their diffraction pattern reveals the atomic structure of DNA and proteins.",
      },
    ],
    takeaways: [
      "Every opening diffracts; narrower openings spread light more.",
      String.raw`Single-slit dark fringes satisfy $a \sin \theta = m\lambda$ with $m \neq 0$; the central maximum has half-width $\lambda/a$.`,
      "Diffraction limits optical resolution to about a wavelength — bigger apertures see finer detail.",
      "Diffraction patterns are how X-ray crystallography reads atomic structure.",
    ],
  },
  {
    slug: "buoyancy-and-archimedes-principle",
    title: "Buoyancy and Archimedes' Principle",
    topic: "fluids" as const,
    difficulty: "intro" as const,
    readingMinutes: 6,
    summary:
      "An object in a fluid feels an upward force equal to the weight of the fluid it displaces. One ancient observation explains ships, submarines, hot-air balloons, and why an iceberg hides most of itself.",
    keyFormula: String.raw`F_B = \rho_{\text{fluid}} V_{\text{sub}} g`,
    tags: ["buoyancy", "archimedes", "floating"],
    content: [
      {
        heading: "The intuition",
        body: "Pressure in a fluid grows with depth, so the bottom of a submerged object is pushed upward harder than the top is pushed downward — the mismatch is a net upward force. Legend has it Archimedes leapt from his bath when he realized the force equals the weight of the water the object displaces: his crown, weighed in air and in water, betrayed how much gold it truly contained. The buoyant force cares only about the displaced fluid, never about the object's own material.",
      },
      {
        heading: "The mathematics",
        body: "Archimedes' principle states the buoyant force is $F_B = \\rho_{\\text{fluid}} V_{\\text{sub}} g$, where $V_{\\text{sub}}$ is the submerged volume and $\\rho_{\\text{fluid}}$ the fluid density. An object floats when this force balances its weight, $mg = \\rho_{\\text{obj}} V g$; the fraction submerged is therefore $V_{\\text{sub}}/V = \\rho_{\\text{obj}}/\\rho_{\\text{fluid}}$. An object denser than the fluid sinks, but even then it weighs less in the fluid — the apparent weight is $mg - F_B$, the reading on a spring scale dipped into water.",
      },
      {
        heading: "Worked example",
        body: "An iceberg floats in seawater ($\\rho = 1025\\ \\text{kg/m}^3$) with ice density $917\\ \\text{kg/m}^3$. The submerged fraction is $917/1025 \\approx 0.89$ — about nine tenths of the berg sits below the surface, which is why the tip of the iceberg is a real warning. A helium balloon of volume $1\\ \\text{m}^3$ displaces air ($\\rho \\approx 1.2\\ \\text{kg/m}^3$) while the helium inside weighs almost nothing, so the net lift is about $(1.2 - 0.18)(1)(9.8) \\approx 10\\ \\text{N}$ — enough to lift a kilogram of payload for every cubic metre of balloon.",
      },
      {
        heading: "Why it matters",
        body: "Buoyancy is the engineering principle of ships (steel floats because the hull displaces a huge volume of water), submarines (adjusting ballast changes displaced volume and hence depth), and hot-air balloons (warm air is less dense, so the balloon displaces heavier cold air). Hydrometers use it to measure the density of liquids — from battery acid to milk — and it explains why swimmers feel lighter and why the Dead Sea's saltiness makes people float effortlessly.",
      },
    ],
    takeaways: [
      "The buoyant force equals the weight of the displaced fluid.",
      String.raw`$F_B = \rho_{\text{fluid}} V_{\text{sub}} g$ — it never depends on the object's own material.`,
      "The fraction of a floating object that is submerged equals its density divided by the fluid's.",
      "Buoyancy runs ships, submarines, balloons, hydrometers, and Archimedes' famous crown test.",
    ],
  },
  {
    slug: "ideal-gas-law-and-kinetic-theory",
    title: "The Ideal Gas Law and Kinetic Theory",
    topic: "statistical" as const,
    difficulty: "intro" as const,
    readingMinutes: 7,
    summary:
      "Pressure is billions of molecules hammering a wall; temperature is their average kinetic energy. The ideal gas law packages both insights into one equation that rules everything from tyres to stars.",
    keyFormula: String.raw`PV = nRT`,
    tags: ["kinetic theory", "pressure", "gas laws"],
    content: [
      {
        heading: "The intuition",
        body: "A balloon is not pushed out by some calm pressure substance — it is pounded by trillions of air molecules bouncing off its inner wall every instant, each impact a tiny elastic kick. The pressure you feel is just the time-averaged force of all those kicks per unit area. Heat the gas and the molecules move faster, hitting harder and more often: pressure rises. Squeeze it into a smaller volume and the same molecules hit the walls more frequently: pressure rises again. Temperature, in this picture, is simply a measure of how fast the molecules jitter.",
      },
      {
        heading: "The mathematics",
        body: "The ideal gas law $PV = nRT$ ties together pressure $P$, volume $V$, amount $n$ (moles), and absolute temperature $T$, with $R = 8.31\\ \\text{J/(mol·K)}$. Kinetic theory derives it from mechanics: the average pressure from molecular impacts is $P = \\tfrac{1}{3}(N/V)m v_{\\text{rms}}^2$, and comparing with $PV = nRT$ yields the central result $\\tfrac{1}{2}m v_{\\text{rms}}^2 = \\tfrac{3}{2}k_B T$ — average kinetic energy per molecule is set by temperature alone, regardless of the gas. The law holds exactly only for point-like, non-interacting molecules; real gases correct it with van der Waals terms.",
      },
      {
        heading: "Worked example",
        body: "A car tyre is inflated to a gauge pressure of $2.2\\ \\text{atm}$ ($3.2\\ \\text{atm}$ absolute) at $20^\\circ\\text{C} = 293\\ \\text{K}$. Driving heats the tyre to $50^\\circ\\text{C} = 323\\ \\text{K}$ at constant volume, so $P_2/P_1 = T_2/T_1 = 323/293 \\approx 1.10$ and the absolute pressure climbs to about $3.5\\ \\text{atm}$ — a gauge reading near $2.5\\ \\text{atm}$. A tyre pressure warning light does not lie: it is reading a temperature effect.",
      },
      {
        heading: "Why it matters",
        body: "The ideal gas law is the everyday workhorse of thermodynamics: it governs breathing (your lungs expand and contract a fixed amount of gas), weather balloons expanding as they rise, scuba tanks and decompression calculations, engine cylinders compressing fuel–air mixtures, and the pressure–temperature balance inside stars. It is also the stepping stone to statistical mechanics — the same molecular picture, generalised to a distribution of speeds, is exactly the Maxwell–Boltzmann story.",
      },
    ],
    takeaways: [
      String.raw`$PV = nRT$: pressure, volume, amount, and absolute temperature in one law.`,
      "Pressure is the time-averaged impact of molecules on the walls.",
      String.raw`Average kinetic energy per molecule is $\tfrac{3}{2}k_B T$ — set by temperature alone.`,
      "Real gases deviate from the ideal law at high density and low temperature.",
    ],
  },
  {
    slug: "rc-circuits",
    title: "RC Circuits and the Time Constant",
    topic: "circuits" as const,
    difficulty: "intro" as const,
    readingMinutes: 7,
    summary:
      "A capacitor never charges or discharges instantly — a resistor stretches its response into a smooth exponential. The product RC sets the pace of every timing circuit, from camera flashes to pacemakers.",
    keyFormula: String.raw`Q(t) = Q_0\left(1 - e^{-t/RC}\right), \qquad \tau = RC`,
    tags: ["capacitors", "time constant", "exponential"],
    content: [
      {
        heading: "The intuition",
        body: "A capacitor stores charge like a reservoir fills with water: at first the current gushes in, but as the reservoir rises, the incoming flow throttles down — and the last drops trickle in slowly. The resistor is the tap: a small resistance lets the capacitor charge almost instantly; a large one drags the process out. The charge follows an exponential curve that approaches its final value but only fully arrives after forever. In practice, after about five time constants it is close enough to complete.",
      },
      {
        heading: "The mathematics",
        body: "In a series RC circuit driven by a battery of emf $\\mathcal{E}$, Kirchhoff's loop rule gives $\\mathcal{E} = IR + Q/C$. Since $I = dQ/dt$, this is a first-order differential equation whose solution is $Q(t) = Q_0\\left(1 - e^{-t/RC}\\right)$, with $Q_0 = C\\mathcal{E}$. The time constant $\\tau = RC$ is the time to reach about $63\\%$ of the final charge (since $1 - e^{-1} \\approx 0.632$). Discharging instead, $Q(t) = Q_0 e^{-t/RC}$: every $\\tau$ seconds the stored charge drops by another factor of $e$. After $5\\tau$, only $0.7\\%$ remains — the rule of thumb for fully discharged.",
      },
      {
        heading: "Worked example",
        body: "A $10\\ \\text{k}\\Omega$ resistor charges a $100\\ \\mu\\text{F}$ capacitor: $\\tau = RC = 10^4 \\times 10^{-4} = 1\\ \\text{s}$. To reach $90\\%$ of full charge we need $1 - e^{-t/\\tau} = 0.9$, so $t = \\tau \\ln 10 \\approx 2.3\\ \\text{s}$; to all practical purposes it is charged after $5\\ \\text{s}$. Flip the switch to discharge and after $1\\ \\text{s}$ only $37\\%$ remains, after $5\\ \\text{s}$ about $0.7\\%$. That predictable ramp is what camera flashes use to build up energy between shots and then dump it in a burst.",
      },
      {
        heading: "Why it matters",
        body: "RC circuits are the heartbeat of timing electronics: the flash in a camera, the pacemaker that charges and fires at a physician-set interval, the blinking LED in a toy, and the filters that shape audio signals all run on the exponential set by $RC$. Every integrated circuit contains millions of tiny RC delays that set its clock speed. Understanding the time constant — when to call a capacitor charged or discharged — is the first skill of practical electronics.",
      },
    ],
    takeaways: [
      "A capacitor charges and discharges exponentially, never instantly.",
      String.raw`The time constant $\tau = RC$: $63\%$ in one $\tau$, about $99.3\%$ after five.`,
      "Charging follows $Q = Q_0(1 - e^{-t/RC})$; discharging follows $Q = Q_0 e^{-t/RC}$.",
      "RC exponentials set the timing of camera flashes, pacemakers, and every digital clock.",
    ],
  },
  {
    slug: "bohr-model-of-the-atom",
    title: "The Bohr Model of the Atom",
    topic: "atomic" as const,
    difficulty: "intro" as const,
    readingMinutes: 7,
    summary:
      "Electrons circle the nucleus only in allowed orbits, and every jump between orbits emits or absorbs a photon of a precise colour. Bohr's 1913 model explained the spectral lines that had baffled physics for decades.",
    keyFormula: String.raw`E_n = -\frac{13.6\ \text{eV}}{n^2}, \qquad \Delta E = hf`,
    tags: ["hydrogen", "spectral lines", "energy levels"],
    content: [
      {
        heading: "The intuition",
        body: "Classical physics predicted a hydrogen atom could not exist: an orbiting electron radiates energy and should spiral into the nucleus in a flash. Bohr kept the planetary picture but added a quantum rule: the electron may only occupy certain orbits, and while it is in one it does not radiate at all. It changes orbit only by absorbing or emitting a single photon whose energy exactly matches the difference between two levels. The result is a ladder of discrete energies — and because each rung has a fixed energy, the emitted colours are fixed too.",
      },
      {
        heading: "The mathematics",
        body: "Bohr quantized angular momentum in units of $\\hbar$: $mvr = n\\hbar$ for $n = 1, 2, 3, \\dots$. Balancing Coulomb attraction against centripetal force gives the energy levels $E_n = -\\frac{13.6\\ \\text{eV}}{n^2}$ for hydrogen, with the ground state at $-13.6\\ \\text{eV}$ and levels bunching toward zero as $n$ grows. A transition from level $n_i$ to $n_f$ releases a photon with $hf = E_{n_i} - E_{n_f}$, which is the Rydberg formula in disguise: $\\frac{1}{\\lambda} = R\\left(\\frac{1}{n_f^2} - \\frac{1}{n_i^2}\\right)$. Transitions landing on $n_f = 1$ form the ultraviolet Lyman series; those landing on $n_f = 2$ form the visible Balmer series.",
      },
      {
        heading: "Worked example",
        body: "The first excited state of hydrogen is $E_2 = -13.6/4 = -3.4\\ \\text{eV}$. An electron dropping from $n = 2$ to $n = 1$ releases $\\Delta E = 13.6 - 3.4 = 10.2\\ \\text{eV}$, a photon of wavelength $\\lambda = hc/\\Delta E = 1240\\ \\text{eV·nm}/10.2 \\approx 122\\ \\text{nm}$ — deep ultraviolet (Lyman alpha). The famous red Balmer line is $n = 3 \\to n = 2$: $\\Delta E = 13.6(1/4 - 1/9) \\approx 1.89\\ \\text{eV}$, giving $\\lambda \\approx 656\\ \\text{nm}$. Real hydrogen's spectrum matches these numbers to extraordinary precision.",
      },
      {
        heading: "Why it matters",
        body: "The Bohr model was the first theory to derive the spectrum of hydrogen from first principles, and it introduced the quantum leap — energy emitted in indivisible chunks — that became the core of all quantum physics. It remains useful for one-electron ions (He$^+$, Li$^{2+}$, with the $13.6\\ \\text{eV}$ scale multiplied by $Z^2$) and as the mental image behind lasers and spectroscopy, which read the composition of stars from their spectral lines. Its circular-orbit picture was superseded by Schrödinger's wave mechanics, but the energy ladder it produced survives intact.",
      },
    ],
    takeaways: [
      "Electrons occupy only quantized orbits; they radiate only when jumping between them.",
      String.raw`Hydrogen levels: $E_n = -13.6\ \text{eV}/n^2$; photons carry $hf = \Delta E$.`,
      "Each transition produces one precise colour — Lyman (UV), Balmer (visible), Paschen (infrared).",
      "Bohr's energy ladder survives in wave mechanics; only the orbit picture was replaced.",
    ],
  },
  {
    slug: "quarks-and-quantum-chromodynamics",
    title: "Quarks and Quantum Chromodynamics",
    topic: "particle" as const,
    difficulty: "advanced" as const,
    readingMinutes: 10,
    summary:
      "Protons and neutrons are built from quarks held by the strong force, which grows stronger with distance. Quantum chromodynamics explains why quarks are forever trapped inside hadrons — and why a proton weighs far more than its parts.",
    keyFormula: String.raw`V(r) = -\frac{4}{3}\frac{\alpha_s \hbar c}{r} + kr`,
    tags: ["quarks", "strong force", "confinement"],
    content: [
      {
        heading: "The intuition",
        body: "Quarks carry a charge called colour — red, green, or blue — and the strong force is their glue. Unlike electric charge, colour charge comes in three kinds, and the glue itself (gluons) also carries colour, so the field lines of the strong force do not spread out like an electric field; they clump into a tube stretching between quarks. Pull two quarks apart and the tube does not weaken — it tightens, like a rubber band. That is why no experiment has ever isolated a free quark: the force needed to separate them grows, and snapping the band just creates new quark pairs.",
      },
      {
        heading: "The mathematics",
        body: "The theory is a gauge field theory with $SU(3)$ colour symmetry and eight gluons. The quark–antiquark potential combines a Coulomb-like term at short range with a linear term at long range: $V(r) = -\\frac{4}{3}\\frac{\\alpha_s \\hbar c}{r} + kr$. The coupling $\\alpha_s$ is not constant — it runs: at tiny distances the force is weak (asymptotic freedom, for which Gross, Politzer, and Wilczek won the 2004 Nobel Prize), while at hadron scale it is so strong that quarks are permanently confined. Hadrons are colourless: baryons combine three quarks (one of each colour), and mesons pair a quark with an antiquark.",
      },
      {
        heading: "Worked example",
        body: "A proton contains two up quarks and a down quark whose rest masses sum to only about $9\\ \\text{MeV}$ — yet the proton itself weighs $938\\ \\text{MeV}$. More than $99\\%$ of its mass is not the quarks at all but the energy of the gluon fields binding them, via $E = mc^2$. This is why mass comes from energy is not a slogan: the proton's heft is stored in the strong-field tube. When a high-energy collision stretches such a tube beyond its limit, it snaps and the stored energy materializes as new quark–antiquark pairs — the jets of particles sprayed out in detectors at the LHC.",
      },
      {
        heading: "Why it matters",
        body: "QCD is the theory of the nucleus: the residual strong force that binds protons and neutrons is a leak of the colour force between the quarks inside them, and without it there would be no atoms beyond hydrogen. Deep inelastic scattering revealed quarks inside protons (Nobel Prize, 1990), and modern colliders test QCD at ever-higher energies, hunting for exotic hadrons and the quark–gluon plasma that filled the early universe. Confinement also explains why the strong force is short-ranged despite being the strongest force — its own strength traps it inside hadrons.",
      },
    ],
    takeaways: [
      "Quarks carry colour charge; the strong force is mediated by eight colour-carrying gluons.",
      "The strong coupling runs: weak at short distances (asymptotic freedom), strong at large ones (confinement).",
      "Quarks never appear alone — hadrons are always colourless combinations.",
      "Over 99% of a proton's mass is binding energy of gluon fields, not quark rest mass.",
    ],
  },
  {
    slug: "superconductivity",
    title: "Superconductivity",
    topic: "solidstate" as const,
    difficulty: "advanced" as const,
    readingMinutes: 9,
    summary:
      "Below a critical temperature, some materials lose all electrical resistance and expel magnetic fields entirely. Superconductivity powers MRI scanners, levitating trains, and the magnets that steer particles at the LHC.",
    keyFormula: String.raw`\rho = 0 \quad (T < T_c)`,
    tags: ["superconductors", "meissner effect", "bcs theory"],
    content: [
      {
        heading: "The intuition",
        body: "In 1911 Heike Kamerlingh Onnes cooled mercury to a few kelvin and watched its resistance vanish — not gradually, but abruptly, to exactly zero. A current started in a superconducting loop flows for years without a battery. Even stranger: a superconductor expels magnetic field from its interior (the Meissner effect), which is why a magnet floats above a superconducting disc — the superconductor behaves as a perfect magnetic mirror. Something fundamental must change inside the material at $T_c$.",
      },
      {
        heading: "The mathematics",
        body: "BCS theory (Bardeen, Cooper, Schrieffer, 1957) explains conventional superconductors: electrons, repelled by each other, pair up indirectly through lattice vibrations. One electron distorts the crystal lattice, creating a positive region that attracts a second electron — the two move together as a Cooper pair. Pairs are bosons, so they all condense into a single quantum state; scattering (which causes resistance) requires breaking a pair, and the energy gap $\\Delta$ below $T_c$ makes that impossible at low temperature. The theory predicts $T_c$, the gap, and the isotope effect, and it launched the subfield that won the 1972 Nobel Prize. High-temperature superconductors (YBCO, $T_c \\approx 92\\ \\text{K}$, discovered 1987) are not explained by simple BCS and remain a frontier problem.",
      },
      {
        heading: "Worked example",
        body: "Mercury superconducts below $T_c = 4.2\\ \\text{K}$; niobium–titanium alloy, the workhorse magnet wire, below about $9\\ \\text{K}$; and YBCO ceramics below $92\\ \\text{K}$ — above the boiling point of liquid nitrogen ($77\\ \\text{K}$), which is what makes them practical. An MRI magnet wound from niobium–titanium carries thousands of amperes with zero resistance, cooled by liquid helium, and once energised it needs no power supply: the current just keeps circulating, sustaining the field that images your body.",
      },
      {
        heading: "Why it matters",
        body: "Superconductivity is quietly essential technology: the magnets of MRI scanners, particle accelerators like the LHC, and experimental fusion reactors all rely on superconducting coils producing fields no ordinary electromagnet could sustain. Maglev trains float on superconducting repulsion. Superconducting qubits are among the leading platforms for quantum computers. And the dream of lossless power transmission — superconducting cables carrying city-scale current without heating — keeps driving the search for room-temperature superconductors, one of physics' most coveted prizes.",
      },
    ],
    takeaways: [
      "Below $T_c$, resistance drops abruptly to exactly zero.",
      "The Meissner effect: superconductors expel magnetic fields — the physics of magnetic levitation.",
      "BCS theory: electrons pair via lattice vibrations; the pairing gap kills resistance.",
      "Superconductors power MRI, particle accelerators, maglev trains, and quantum-computer qubits.",
    ],
  },
  {
    slug: "cosmic-microwave-background",
    title: "The Cosmic Microwave Background",
    topic: "cosmology" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 8,
    summary:
      "The sky glows faintly in microwaves — the afterglow of the Big Bang, cooled for 13.8 billion years. Its near-perfect blackbody spectrum and tiny hot and cold spots carry the universe's birth certificate.",
    keyFormula: String.raw`T_0 = 2.725\ \text{K}, \qquad z_{\text{rec}} \approx 1100`,
    tags: ["big bang", "cosmology", "recombination"],
    content: [
      {
        heading: "The intuition",
        body: "For the first 380,000 years the universe was a hot, dense fog of plasma in which light could not travel far — photons scattered endlessly off free electrons. Then expansion cooled the plasma enough that electrons and protons combined into neutral hydrogen, the fog cleared, and the light set free that day has been travelling ever since, stretched by the expansion of space. What we see today is that same light, cooled from about $3000\\ \\text{K}$ to $2.725\\ \\text{K}$: a faint glow of microwaves arriving from every direction, day and night, from every part of the sky.",
      },
      {
        heading: "The mathematics",
        body: "Recombination happened at redshift $z_{\\text{rec}} \\approx 1100$, when the temperature had fallen to about $3000\\ \\text{K}$. Since then the expansion has stretched wavelengths by the factor $1 + z$, cooling the radiation to today's $T_0 = 2.725\\ \\text{K}$. The spectrum is the most perfect blackbody ever measured; Wien's law places its peak at $\\lambda_{\\max} = 2.9\\ \\text{mm·K}/T \\approx 1.06\\ \\text{mm}$ — hence microwave. Tiny anisotropies, of order $\\Delta T/T \\approx 10^{-5}$, encode the density fluctuations that grew into galaxies and clusters.",
      },
      {
        heading: "Worked example",
        body: "COBE's 1992 measurement of the background's spectrum matched a $2.725\\ \\text{K}$ blackbody so exactly that the data points are invisible against the curve (Mather and Smoot shared the 2006 Nobel Prize). The same satellite then found the millionth-of-a-degree ripples: patches slightly hotter (denser) and cooler (rarer) than average. Those seed fluctuations, amplified by gravity over billions of years, are why galaxies exist at all — and their detailed statistics let cosmologists read off the universe's composition: about $5\\%$ ordinary matter, $27\\%$ dark matter, and $68\\%$ dark energy.",
      },
      {
        heading: "Why it matters",
        body: "The cosmic microwave background is the decisive evidence for the Big Bang (rival steady-state theories predicted no such glow), and it has become cosmology's precision instrument. Satellite maps — COBE, WMAP, then Planck — determined the universe's age ($13.8$ billion years), geometry (flat), and composition; the largest angular scale of its fluctuations even confirms the universe is spatially flat to about a percent. Every deeper map tests new physics — primordial gravitational waves, extra species of neutrinos, and the earliest moments after the Big Bang.",
      },
    ],
    takeaways: [
      "The CMB is the afterglow of the Big Bang, released at recombination and cooled to 2.725 K.",
      "Its blackbody spectrum is the most perfect ever measured; its peak sits at about 1 mm.",
      "Fluctuations of about one part in 100,000 seeded all galaxies and clusters.",
      "CMB maps determine the universe's age, geometry, and composition — 5% matter, 27% dark matter, 68% dark energy.",
    ],
  },
  {
    slug: "hamiltonian-mechanics",
    title: "Hamiltonian Mechanics and Phase Space",
    topic: "classical" as const,
    difficulty: "advanced" as const,
    readingMinutes: 9,
    summary:
      "Swap velocity for momentum and the equations of motion become a symmetrical pair driven by a single energy function. Hamiltonian mechanics is the direct ancestor of quantum mechanics — and the language of chaos.",
    keyFormula: String.raw`H = T + V, \qquad \dot{q} = \frac{\partial H}{\partial p}, \qquad \dot{p} = -\frac{\partial H}{\partial q}`,
    tags: ["phase space", "hamiltonian", "liouville"],
    content: [
      {
        heading: "The intuition",
        body: "The Lagrangian treats position and velocity as partners; the Hamiltonian formulation treats position and momentum as equals. Instead of one second-order equation for each coordinate, you get two first-order equations, and the whole dynamics flows from a single function — the Hamiltonian $H = T + V$, the total energy. The payoff is geometric: the state of the system is a single point in phase space (one axis per position, one per momentum), and time evolution is a flow that sweeps every point along its trajectory without ever losing or gaining fluid — like an incompressible river.",
      },
      {
        heading: "The mathematics",
        body: "The Hamiltonian is obtained from the Lagrangian by a Legendre transform: $H = \\sum p_i \\dot{q}_i - L$, with momenta $p_i = \\partial L/\\partial \\dot{q}_i$. Hamilton's equations are $\\dot{q} = \\frac{\\partial H}{\\partial p}$ and $\\dot{p} = -\\frac{\\partial H}{\\partial q}$ — a symmetric pair whose skew symmetry makes phase-space volume conserved (Liouville's theorem). Because $H$ is usually conserved, trajectories ride on constant-energy surfaces, and the phase-space portrait — fixed points, closed orbits, and chaotic wandering — becomes the map of all possible motions.",
      },
      {
        heading: "Worked example",
        body: "The simple harmonic oscillator has $H = p^2/2m + \\tfrac{1}{2}m\\omega^2 q^2$. Hamilton's equations give $\\dot{q} = p/m$ and $\\dot{p} = -m\\omega^2 q$; differentiating the first and substituting recovers $\\ddot{q} = -\\omega^2 q$. In phase space the motion is an ellipse whose axes are the amplitude of position and of momentum — the same ellipse traced forever, never crossing. Add slight damping or nonlinearity and that tidy ellipse can wrinkle into the strange, layered patterns of chaos.",
      },
      {
        heading: "Why it matters",
        body: "Hamiltonian mechanics is the closest classical relative of quantum mechanics: the wave equation is built from the same $H$ promoted to an operator, and phase-space ideas underpin the uncertainty principle and the statistical mechanics of gases (counting cells of phase space). Celestial mechanics and satellite navigation use Hamiltonian perturbation theory, plasma physics and particle accelerators are described in phase space, and chaos theory — from weather to planetary orbits — is fundamentally the study of Hamiltonian flows. Learn phase space and you have the picture behind half of modern physics.",
      },
    ],
    takeaways: [
      String.raw`Hamilton's equations: $\dot{q} = \partial H/\partial p$ and $\dot{p} = -\partial H/\partial q$, driven by the total energy $H = T + V$.`,
      "The state of a system is one point in phase space; motion is a flow of that point.",
      "Liouville's theorem: Hamiltonian flows preserve phase-space volume — the foundation of statistical mechanics.",
      "Quantum mechanics is Hamiltonian mechanics with observables promoted to operators.",
    ],
  },
  {
    slug: "vector-calculus-and-the-divergence-theorem",
    title: "Vector Calculus and the Divergence Theorem",
    topic: "mathematical" as const,
    difficulty: "intermediate" as const,
    readingMinutes: 8,
    summary:
      "Fields have three local fingerprints — gradient, divergence, and curl — and one grand bookkeeping identity: what flows out of a volume equals what is produced inside. This is the language of Maxwell's equations.",
    keyFormula: String.raw`\int_V (\nabla \cdot \vec{F})\,dV = \oint_S \vec{F} \cdot d\vec{A}`,
    tags: ["vector calculus", "divergence", "maxwell"],
    content: [
      {
        heading: "The intuition",
        body: "A physicist's field is a flow or force defined at every point — wind, temperature, electric field. Vector calculus gives three ways to examine a field locally. The gradient $\\nabla f$ points in the steepest direction of rise of a scalar and its length is the steepness. The divergence $\\nabla \\cdot \\vec{F}$ measures how much the field is spreading out from a point — a faucet has positive divergence, a drain negative. The curl $\\nabla \\times \\vec{F}$ measures how much the field circulates around a point — a whirlpool has curl, a straight river does not. Together they describe exactly how a field changes from point to point.",
      },
      {
        heading: "The mathematics",
        body: "In Cartesian coordinates, $\\nabla f = \\left(\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}, \\frac{\\partial f}{\\partial z}\\right)$, $\\nabla \\cdot \\vec{F} = \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z}$, and the curl is the antisymmetric combination of partial derivatives. The divergence theorem (Gauss's theorem) is the bookkeeping identity: the total flux of $\\vec{F}$ through a closed surface equals the integral of its divergence over the enclosed volume, $\\int_V \\nabla \\cdot \\vec{F}\\,dV = \\oint_S \\vec{F} \\cdot d\\vec{A}$. Its rotational sibling, Stokes' theorem, equates the circulation of a field around a loop with the curl's flux through any surface spanning it.",
      },
      {
        heading: "Worked example",
        body: "Verify the divergence theorem for $\\vec{F} = (x, y, z)$ on a sphere of radius $R$. The divergence is $\\nabla \\cdot \\vec{F} = 1 + 1 + 1 = 3$, so the volume integral is $3 \\times \\tfrac{4}{3}\\pi R^3 = 4\\pi R^3$. On the surface, $\\vec{F}$ points radially with magnitude $R$, so the flux is $R \\times 4\\pi R^2 = 4\\pi R^3$. Both sides agree — and notice that exactly this theorem turns the differential statement $\\nabla \\cdot \\vec{E} = \\rho/\\varepsilon_0$ into the integral form $\\oint \\vec{E}\\cdot d\\vec{A} = Q_{\\text{enc}}/\\varepsilon_0$: Gauss's law is the divergence theorem applied to the electric field.",
      },
      {
        heading: "Why it matters",
        body: "Vector calculus is the mother tongue of field physics. Maxwell's equations are four statements about divergence and curl of the electric and magnetic fields; the heat equation and diffusion are divergence statements about energy or particle flow; fluid dynamics writes conservation laws as divergences; and potential theory — gravity, electrostatics, groundwater — is gradient theory. The divergence theorem lets you flip between local differential laws and global flux laws, which is the single most used move in theoretical physics.",
      },
    ],
    takeaways: [
      "Gradient points uphill, divergence measures spreading, curl measures circulation.",
      String.raw`The divergence theorem: $\int_V \nabla \cdot \vec{F}\,dV = \oint_S \vec{F} \cdot d\vec{A}$ — outflow equals internal production.`,
      "Gauss's law is the divergence theorem applied to the electric field.",
      "Maxwell's equations, heat flow, and fluid dynamics are all written in this language.",
    ],
  },
  {
    slug: "general-relativity",
    title: "General Relativity and Spacetime Curvature",
    topic: "relativity" as const,
    difficulty: "advanced" as const,
    readingMinutes: 9,
    summary:
      "Gravity is not a force pulling across empty space — it is the curvature of spacetime itself. General relativity bends starlight, slows clocks, and predicts black holes and gravitational waves.",
    keyFormula: String.raw`G_{\mu\nu} = \frac{8\pi G}{c^4} T_{\mu\nu}`,
    tags: ["gravity", "spacetime", "black holes"],
    content: [
      {
        heading: "The intuition",
        body: "Einstein's leap: a falling apple and a coasting astronaut feel exactly the same — no experiment inside a freely falling lab can tell gravity from acceleration (the equivalence principle). So gravity is not a force you feel; it is the geometry of the arena in which you move. Massive objects warp spacetime around them, and objects simply follow the straightest possible paths — geodesics — through the warped geometry. A ball thrown near Earth curves toward the ground the way a marble rolls in a curved bowl: not because the bowl pulls it, but because the bowl is curved.",
      },
      {
        heading: "The mathematics",
        body: "The Einstein field equations $G_{\mu\nu} = \frac{8\pi G}{c^4} T_{\mu\nu}$ equate the curvature of spacetime (left, via the Einstein tensor built from the metric) with the distribution of energy and momentum (right, the stress–energy tensor). In weak fields the equations reduce to Newton's law, with $G$ the gravitational constant. Two immediate consequences: light bends in gravity because its geodesics curve (the deflection doubles the Newtonian prediction), and time runs slower in stronger gravity — gravitational time dilation, which the Schwarzschild solution for a spherical mass quantifies and which sets the boundary of a black hole at the event horizon.",
      },
      {
        heading: "Worked example",
        body: "GPS is the everyday proof. Orbiting clocks experience weaker gravity (running fast by about $45\ \mu\text{s}$ per day) and orbital speed (running slow by about $7\ \mu\text{s}$ per day); the net is about $+38\ \mu\text{s}$ per day, and the system deliberately detunes the satellites' clocks to compensate — without it, positions would drift by kilometres each day. In 1919 Eddington photographed stars near the Sun during an eclipse and measured light bent by $1.75$ arcseconds, exactly as predicted; and in 2015 LIGO detected gravitational waves — ripples of spacetime curvature from colliding black holes — opening a new way to observe the universe.",
      },
      {
        heading: "Why it matters",
        body: "General relativity is the modern theory of gravity and the backbone of astrophysics: it predicts black holes (now imaged directly by the Event Horizon Telescope), gravitational waves (the 2017 Nobel Prize), gravitational lensing used to map dark matter, and the expanding-universe solutions that anchor cosmology. It corrected Newtonian mechanics for Mercury's orbit, governs the timing of GPS and interplanetary navigation, and its merger with quantum mechanics is the great open problem of fundamental physics.",
      },
    ],
    takeaways: [
      "Gravity is the curvature of spacetime; freely falling objects follow geodesics.",
      String.raw`The Einstein field equations $G_{\mu\nu} = 8\pi G T_{\mu\nu}/c^4$ couple geometry to energy and momentum.`,
      "Stronger gravity slows clocks — GPS corrects for about 38 microseconds per day.",
      "General relativity predicts black holes, gravitational waves, and gravitational lensing.",
    ],
  },
] as const;
