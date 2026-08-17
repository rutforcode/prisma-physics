
# Prism 🌌

> Rebuild your physical intuition. Decode university physics.

**Prism** is an open-source pedagogical study feed designed for college physics students. Rather than leading with dense formalism, Prism anchors every concept in physical reality before translating it into mathematics. 

The repository houses the codebase for the Prism web application and the structured content engine that powers its 32-concept feed across 16 core syllabus topics.

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

## 🚀 Getting Started

To run the Prism feed locally:

```bash
# Clone the repository
git clone https://github.com/yourusername/prism.git
cd prism

# Install dependencies
npm install

# Start the development server
npm run dev
