
# Prism 🌌

> Rebuild your physical intuition. Decode university physics.

**Prism** is an open-source pedagogical study feed designed for college physics students. Rather than leading with dense formalism, Prism anchors every concept in physical reality before translating it into mathematics. 

The repository houses the codebase for the Prism web application and the structured content engine that powers its concept feed across core syllabus topics.

## 🧭 The Prism Pedagogy

Every concept merged into this repository must adhere to our three-step explanatory structure:

1. **Conceptual Grounding:** Isolate the physical phenomenon. What is actually happening in the real world before a single symbol is written?
2. **Mathematical Translation:** Map the physical picture to formal equations. 
3. **Applied Execution:** Provide worked examples and crisp takeaways ready for university problem sets.

## 📚 Syllabus Coverage

The feed currently spans the modern undergraduate curriculum, heavily referencing canonical texts (Halliday & Resnick, Feynman, Griffiths, Taylor, and Schroeder). 

* **Classical & Analytical:** Mechanics, Fluid Dynamics, Waves, Analytical Mechanics
* **Fields & Thermal:** Electromagnetism, Thermodynamics, Statistical Mechanics
* **Modern Physics:** Quantum Mechanics, Solid State, Relativity, Astrophysics

## 🛠 Tech Stack

*(Note: Update these to match your actual implementation)*
* **Framework:** Next.js (App Router) / Astro
* **Styling:** Tailwind CSS
* **Content Engine:** MDX with custom components for physics callouts
* **Math Rendering:** KaTeX (for fast, precise LaTeX rendering)
### 🧰 The Physics Toolbox (Resources)

We believe in moving from theory to experimentation. The `/resources` directory powers the Prism Toolbox—a hand-picked, verified collection of learning aids organized by topic so students can stop Googling and start experimenting.

* **Interactive Simulators:** Embedded and linked physics engines (e.g., PhET, Falstad) to visualize fields, waves, and mechanics.
* **Calculators & Solvers:** Topic-specific computational tools for checking problem-set math.
* **Canonical Courses & Texts:** Curated pathways linking back to standard university materials.
 
###   🚀 Getting Started

To run the Prism feed locally:
```
git clone https://github.com/yourusername/prism.git
cd prism && npm install
npm run dev
```
### Adding a New Resource
To contribute a new tool to the toolbox, add an entry to `resources.json` (or the respective MDX collection) using our resource schema:
```json
{
  "title": "RLC Circuit Simulator",
  "type": "simulator",
  "topic": "Circuits & Electronics",
  "url": "https://...",
  "description": "Interactive sandbox for visualizing phase shifts in alternating current circuits."
}
```
##📜 License
MIT License. Explanations are original syntheses; external resource links remain the property of their respective creators.
