# Blueprint: VCE Physics Unit 3 & 4 examination (study design 2024–2027)

## Format (from the 2024 VCAA specifications and every 2024 trial)

- One examination: 15 minutes reading, 150 minutes writing, 120 marks. Calculators are allowed, and the formula sheet is printed at the back.
- **Section A:** 20 multiple-choice questions, A–D, 1 mark each (25 minutes in the paper's section header).
- **Section B:** 100 marks over 14–19 short-answer questions (125 minutes). Questions are numbered from 1 in each section.
- `gen-exams.mjs` (`buildPhysicsUnit34Exams`) builds the paper:
  - id `physics-year_12-N`, title "Physics Unit 3 & 4 — Practice Exam N";
  - `formula_sheet: 'physics'`;
  - `premium: examIndex > 0`, so set 1 is the free sample.
- The section instructions come from `PHYSICS_INSTRUCTIONS` in `gen-exams.mjs`. They include "Take the value of g to be 9.81 m s⁻²" (the 2024 trials do this) and "Where an answer box is provided, write your final answer in the box."

## Marks per set (what sets 1–5 use; `build.mjs` prints this line)

| Area of study | topic slug | Section A | Section B |
|---|---|---|---|
| U3 AOS1 Motion (Newton, projectiles, circular, momentum, energy, springs) | `phys_motion` | 5 | 23–24 (4 questions) |
| U3 AOS2 Fields (gravitational, electric, magnetic) | `phys_fields` | 4 | 18–19 (3 questions) |
| U3 AOS3 Generating and transmitting electricity | `phys_electrical_power` | 4 | 23–24 (3 questions) |
| U4 AOS1 Light and matter, and special relativity | `phys_light_matter` | 6 | 24–25 (4 questions) |
| U4 AOS2 Scientific investigation (data, graphs, uncertainty) | `phys_investigation` | 1 | 10 (1 question) |

- **Question sizes.** Section B questions run 5–8 marks, with parts of 1–3 marks each. The investigation question is 10 marks.
- **Difficulty.** About a third `developing`, half `proficient` and the rest `advanced`, with the harder questions later in each area.
- **Order.** Sections follow the study design order: motion → fields → electricity → light and matter → investigation.
- **Answer letters.** Section A uses 5/5/5/5 per set, and the spread must also balance within each area across all sets. `verify-bank` warns at 40% or more; `coverage.mjs` prints the running counts.

## Study design scope (what to examine)

**U3 AOS1 Motion.** This area covers:
- Newton's laws in one and two dimensions: connected bodies, inclines (friction given as a force; no coefficient of friction μ), lifts and apparent weight.
- Projectiles near Earth, with no air resistance except as a qualitative effect.
- Uniform circular motion: horizontal circles, banked tracks, and the top and bottom of vertical circles.
- Impulse and momentum in one dimension; elastic and inelastic collisions.
- Work as the area under a force–distance graph; kinetic, gravitational potential and elastic (Hooke's law) energy; power.

**U3 AOS2 Fields.** This area covers:
- Field models and inverse-square laws; g = GM/r²; circular orbits (Kepler's third law through GM/r² = 4π²r/T²); weightlessness.
- Energy change as the area under a force–distance or field–distance graph.
- Electric fields of point charges and between parallel plates (E = V/d, W = qV); Coulomb's law.
- Magnetic fields of wires and solenoids (directions only); F = qvB and F = nIlB with I perpendicular or parallel to B only (no angles); r = mv/(qB); a comparison of the three fields.

**U3 AOS3 Electricity.** This area covers:
- DC motors: forces on a coil, and the role of the commutator.
- Flux, including Φ = B⊥A; Faraday's law (ε = −NΔΦ/Δt, average EMF); Lenz's law.
- AC generators with slip rings versus commutators; flux-time and EMF-time graphs; RMS and peak values.
- Ideal transformers, and the reasons real ones are not ideal (eddy currents, laminations); transmission losses (I²R, voltage drop); why distribution uses high voltage and AC.
- ε = NBAω is **not** on the formula sheet, so ask for average EMF or graph shape instead.

**U4 AOS1 Light and matter, and relativity.** This area covers:
- Light and matter:
  - wave model evidence: double slit with Δx = λL/d, path difference to bright and dark bands, and diffraction with λ/w;
  - the photoelectric effect: E_k max = hf − φ, stopping voltage, threshold, intensity, and graphs of V₀ or E_k against f;
  - photon energy and momentum; de Broglie wavelength λ = h/p; electron diffraction versus X-rays;
  - energy levels, emission and absorption, and electron-collision excitation; wave–particle duality, including single-photon or single-electron interference.
- Special relativity:
  - Einstein's two postulates, and Michelson–Morley;
  - proper time and length, time dilation and length contraction (muons, spacecraft);
  - E = mc², rest, total and relativistic kinetic energy (γ − 1)mc², and mass defect in fusion.
- The 2024 trials interleave relativity with light and matter, so it is tagged `phys_light_matter`.

**U4 AOS2 Investigation.** This area covers:
- independent, dependent and controlled variables, and hypotheses;
- accuracy versus precision; random versus systematic error; uncertainty (half the smallest division); outliers;
- linearising data (v² against h, F against v², V against 1/λ), plotting on the axes provided, a line of best fit, and the gradient with its unit;
- deducing a constant from the gradient, and one improvement to the method.

**Out of scope (do not examine).** The old-design content below must not appear:
- simple harmonic motion and pendulum formulas;
- the old-design topics (sound, astrophysics, detailed studies);
- charge and discharge of capacitors, and semiconductors beyond the diode/LED threshold used in an investigation;
- radioactive decay (half-life is fine only as a given ratio, as in the muon question).

## Data values (the 2024 formula sheet; `checks/*.py` use exactly these)

| Quantity | Value |
|---|---|
| g | 9.81 m s⁻² (surface value from GM/R² is 9.83) |
| mₑ | 9.11 × 10⁻³¹ kg |
| e | 1.60 × 10⁻¹⁹ C |
| h | 6.63 × 10⁻³⁴ J s and 4.14 × 10⁻¹⁵ eV s |
| c | 3.00 × 10⁸ m s⁻¹ |
| G | 6.67 × 10⁻¹¹ N m² kg⁻² |
| M_E | 5.98 × 10²⁴ kg |
| R_E | 6.37 × 10⁶ m |
| k | 8.99 × 10⁹ N m² C⁻² |

- hc = 1.242 × 10⁻⁶ eV m.
- Give any other constant in the stem: proton mass 1.67 × 10⁻²⁷ kg, neutron mass 1.675 × 10⁻²⁷ kg, and the masses of the Moon, Mars and so on.
- The formula sheet itself is `PHYSICS_FORMULA_SHEET` in `src/lib/pdf/formulaSheets.ts`.
