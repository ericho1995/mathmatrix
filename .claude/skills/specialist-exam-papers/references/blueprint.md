# Specialist Mathematics Unit 3 & 4 — paper blueprint

Distilled from VCAA 2016–2025 papers and examiner reports, the 2023 VCAA sample questions, and 2023–2024 trial papers (MAV, NEAP, Insight, Kilbaha, TSSM, Heffernan, QATS). Study design 2023–2027.

## Format (what `verify-bank` §10b enforces)

| Paper | Time | Content | Marks |
|---|---|---|---|
| Examination 1 | 15 min reading + 60 min, **no technology** | 9–11 questions (use 10), each 3–6 marks, parts worth 1–4 | 40 |
| Examination 2 Section A | within 15 + 120 min, CAS | 20 multiple choice, **4 options A–D** (5 options before 2024), 1 mark each | 20 |
| Examination 2 Section B | same | 6 extended questions, 9–11 marks each (use 10) | 60 |

The formula sheet is supplied with both papers. It is printed from `src/lib/pdf/formulaSheets.ts`, so check a formula is on it before a question relies on students knowing it. The section instructions are set in `scripts/gen-exams.mjs` (`SPECIALIST_INSTRUCTIONS`), including "an exact value must be given, unless otherwise specified" (Exam 1 and Section B) and "g = 9.8" (Exam 2).

## Area-of-study spread per set (target)

| AOS | topic slug | Exam 1 | Section A | Section B |
|---|---|---|---|---|
| Discrete mathematics: logic and proof | `sm_proof` | 1 (induction or contradiction), sometimes 2 | 2 | 0 |
| Functions, relations and graphs | `sm_functions` | 1 | 2 | 1 |
| Complex numbers | `sm_complex_numbers` | 1 | 3 | 1 |
| Calculus (incl. DEs, kinematics) | `sm_calculus` | 3–4 | 7 | 2 |
| Vectors, lines, planes, vector calculus | `sm_vectors` | 2 | 4 | 1 |
| Data analysis, probability and statistics | `sm_statistics` | 1 | 2 | 1 |

VCAA 2023 Section B, for calibration: (1) piecewise walking track — smooth join, turning point and inflection, ellipse parametric, arc length; (2) 7th roots of unity, ray, De Moivre sum of cosines; (3) volume and surface area of revolution, "efficiency ratio"; (4) logistic model — partial fractions, max growth, harvesting; (5) planes, line/plane angle, distance and foot of perpendicular; (6) CI, sample size, one-tailed test, critical mean, type II error.

VCAA 2023 Examination 1, for calibration: rational function with oblique asymptote (show form, sketch); arg of (b − i)³; v(x) → acceleration and limit; implicit derivative with arcsin at a point, "in the form −π√a/b"; ∫x² ln x by parts; sum of three normals and sample mean → Pr(a < Z < b); parametric surface area "in the form π/d (a√c − b)"; induction on the nth derivative of xe²ˣ; plane through three points with a parameter, parallelogram area; circular motion position vector — identity rewrite, Cartesian path, arc length, r ⟂ v.

## In the study design (examinable)

- **Proof:** direct, contrapositive, contradiction, counterexample, converse, negation with quantifiers ("for all", "there exists"); induction for sums, divisibility, inequalities (n ≥ n₀), nth derivatives, recurrences.
- **Functions:** rational functions (vertical, horizontal and oblique asymptotes, holes, partial fractions including repeated linear factors); reciprocal circular (sec, cosec, cot); inverse circular (domain, range, derivatives); parametric curves → Cartesian; implicit relations.
- **Complex:** Cartesian and polar forms, cis, Arg ∈ (−π, π]; De Moivre; nth roots and roots of unity; conjugate root theorem; factorising real polynomials; loci and regions (|z − a| = r, |z − a| = |z − b|, Arg(z − a) = θ rays, Re/Im half-planes) with areas; multiplication as rotation and dilation.
- **Calculus:** chain, product and quotient rules; implicit differentiation (first and second derivatives); inverse circular derivatives; related rates; integration by substitution, by parts, partial fractions, trig identities; area; volumes of revolution about either axis; **arc length** (Cartesian and parametric); **surface area of revolution** (Cartesian and parametric, about either axis); separable DEs, logistic DEs (incl. harvesting), mixing problems, Newton's cooling, verifying solutions (including second order); Euler's method by hand and in **pseudocode**; slope fields; kinematics — a = dv/dt = v dv/dx = d/dx(½v²), v(x) models, constant-acceleration formulas, distance vs displacement.
- **Vectors:** 2D/3D algebra, scalar and cross products, scalar and vector resolutes, angles, areas; vector, parametric and Cartesian equations of lines and planes; line–plane and plane–plane intersections and angles; distance from a point to a line or plane, between parallel planes, between skew lines; reflections; vector calculus (position, velocity, acceleration, speed, paths, collisions vs crossing paths, closest approach, arc length of a path).
- **Statistics:** E and Var of linear combinations of independent random variables (sums of n independent copies ≠ nX); distribution of the sample mean; CIs for μ with known σ (width, sample size); one- and two-tailed z tests, p-value, conclusion, critical sample mean, type I/II error, sample size for a given type II error.

## Out (don't write)

Dynamics (forces, resolving, Newton's laws, momentum); integrating factors or other non-separable first-order methods; ellipse/hyperbola complex loci (|z − a| + |z − b| = k); matrices; vector proofs of geometric theorems (units 1&2); t-tests or unknown-σ intervals.

## Conventions students expect

- Exact answers unless told "correct to n decimal places". Tech-free forms: "in the form a√b", "in the form π/a − (1/b)logₑ(c), where a, b, c ∈ Z⁺".
- "Show that" parts give the result, so a later part can still be done; "Hence" means the previous part should be used ("hence or otherwise" allows any method).
- Mark allocations: 1 per answer-only part; 2–3 for method + answer; 4 for induction or multi-step. The answer key states what earns each mark.
- Examiner-report error patterns worth targeting in distractors: wrong quadrant for Arg; forgetting the principal argument range; subtracting variances; nX vs X₁ + … + Xₙ; distance vs displacement; one- vs two-tailed p; line–plane angle via cos rather than sin; not squaring in volume/surface formulas; |x| in log antiderivatives; missing +c or wrong constant; Euler updating x before y.
