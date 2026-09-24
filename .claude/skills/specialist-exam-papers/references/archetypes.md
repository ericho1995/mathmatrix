# Question archetypes

Recurring question shapes from VCAA 2016–2025 and the 2023–2024 trial papers, grouped by area of study. `[S1 E1]` means set 1 already uses it in Examination 1, `[S3 B]` means set 3 Section B, and so on. Run `coverage.mjs` for exact stems. Prefer archetypes a set has not used, and a fresh context or new numbers when reusing one.

## Proof (`sm_proof`)
- Induction, divisibility: aⁿ − bⁿ divisible by a − b, or 25ⁿ − 1 by 24 [S1 E1]. Sample: 9ⁿ − 5ⁿ by 4.
- Induction, sum formula: Σ r·2^r [S2 E1]; 1/2 + 1/4 + … (VCAA sample); Σ 1/(r(r+1)).
- Induction, inequality from n₀: n! > 2ⁿ (n ≥ 4) [S3 E1]; 2ⁿ > n² (n ≥ 5, VCAA sample); 3ⁿ ≥ 2n + 1.
- Induction, nth derivative: xe^{2x} (VCAA 2023), xe^{−x} [S4 E1], x·ln x, sin(ax) patterns.
- Induction, recurrence: a_{n+1} = 2a_n + 1 ⇒ closed form. (Unused.)
- Contradiction: log₂3 irrational [S1 E1]; m² − n² ≠ 10 by parity [S5 E1]; √2 + √3 irrational; n³ + 1 even for odd n (sample); infinitely many primes (4k + 3 variant).
- Section A logic: negation with quantifiers [S1], counterexample [S1, S5], converse [S2], contrapositive [S3, S4, S5], "assume … to start a contradiction" [S2], true/false quantified statements [S3], choosing the inductive step [S4].

## Functions (`sm_functions`)
- Rational function, oblique asymptote: show f = x + a + b/(x − c), stationary points, sketch on blank axes [S1 E1]; (x² + x − 6)/(x − 1) (VCAA 2023).
- Rational with parameters and CAS: 4x/(x² − 1) — partial fractions, f′ < 0, area in the form ln a, volume, g = f + kx stationary points [S1 B]; family 1/(x² − 2x + a) [S4 B]; (x − a)²/(x − b)² (Insight 2024).
- Repeated factor x²/(x − 1)²: asymptotes, f′, inflection [S4 E1].
- Reciprocal circular: cosec(2x) + 1 sketch with π ticks, solve, range [S2 E1]; asymptotes of sec(x − π/4) [S2 A]; range of 3 − 2sec x [S4 A]; number of solutions of sec x = x [S5 A].
- Inverse circular: domain and range of 2sin⁻¹(1 − 3x) + π/2 [S1 A]; 2sin⁻¹(1 − x) with f′ [S3 E1]; tan⁻¹x + tan⁻¹(1/x) constant, ∫tan⁻¹, volume about the y-axis [S5 B]; horizontal asymptotes of a tan⁻¹ graph [S5 A].
- Parametric: astroid 2cos³t, 2sin³t — Cartesian form, dy/dx, length, area, surface [S3 B]; sec t, tan t hyperbola branch [S5 E1]; ellipse track (VCAA 2023 B1).
- Piecewise smooth join: slide 4 − 2tan⁻¹x then quadratic — matching value and gradient, second-derivative jump, arc length, area [S2 B]; walking track (VCAA 2023).

## Complex numbers (`sm_complex_numbers`)
- Polar form, De Moivre power, roots of zⁿ = w in Cartesian form [S1 E1, S2 B, S3 B].
- Real polynomial with a given complex root → all roots (conjugate root theorem) [S1 B quartic, S2 E1 cubic, S4 A]; b, c coefficients [S1 A].
- Complex-coefficient quadratic (conjugate is not a root) [S5 E1].
- Loci and regions: circle through the origin, max |z|, Arg range [S3 E1]; |z − 3| = 2|z| is a circle [S2 A]; shaded ring sector or segment → set notation [S1 A, S4 A]; Arg(z − 1) = π/4 is a ray excluding its endpoint [S3 A]; circle plus ray, intersection, region area [S3 B]; perpendicular bisector in the form |z| = |z − w| [S5 B].
- Roots of unity: hexagon area, 1 + w + … + w⁵ = 0, z̄ = z⁵ count [S2 B]; 7th roots and a cos sum (VCAA 2023).
- Trig identities via De Moivre: cos³θ [S4 E1]; cos 3θ → 8x³ − 6x − 1, product of cosines, z⁶ − z³ + 1 [S4 B].
- Rotation: multiply by i or cis θ [S2 B, S5 B square].
- Algebra MC: (1 + i)⁸/(1 − i)⁴ [S3], z/z̄ + z̄/z real [S2], w^{2025} [S5], z⁴ + 4 roots [S5].

## Calculus (`sm_calculus`)
- Implicit differentiation: tangent to tan⁻¹y + xy² = π/4 [S1 E1]; second derivative on x³ + y³ = 9 [S5 E1]; arcsin(y²) (VCAA 2023).
- Integration: by parts x sec²x [S1 E1], x²eˣ [S2 A], x cos 2x [S5 A]; substitution u = 1 − x [S1 A], u = x + 1 [S5 E1], sin²cos³ [S3 E1]; partial fractions to ln(a/b) [S2 E1]; reduction formula Iₙ = −1 + nIₙ₋₁ (VCAA 2023 A).
- Volumes: about the y-axis between y = x² and y = 2x [S2 E1]; sin²(2x) about the x-axis [S4 E1]; √x vs x² [S5 A]; ln x about the y-axis [S4 A]; vase x = 1 + y²/16 with related rates [S2 B]; paraboloid bowl with S = V [S4 B].
- Arc length: (2/3)x^{3/2} [S2 E1]; parametric t², (2/3)t³ [S4 E1]; ln(cos x) → ln(2 + √3) [S1 A]; x^{3/2} vs chord [S4 A].
- Surface area: 2√x about the x-axis [S3 E1]; √x setup [S2 A]; x² about the y-axis [S5 A]; parametric (VCAA 2023 E1).
- Related rates: cone filling [S2 A]; balloon surface [S3 E1].
- DEs: logistic by partial fractions [S1 E1]; tan⁻¹ solution with domain [S4 E1]; e^{x−y} [S5 E1]; y dy = x dx with Euler comparison [S3 E1]; logistic rumour with k from data and Euler [S2 B]; logistic with harvesting, equilibria and stability [S5 B, S5 A]; mixing with changing volume [S1 A, S3 B]; Newton's cooling [S4 A]; drug infusion with pseudocode ★ line [S4 B]; verify y″ + 4y = 0 [S2 A], y″ − y′ − 2y [S5 A].
- Euler and pseudocode: for-loop output [S1 A]; while-loop, exact because the solution is linear [S3 A]; while y ≤ 3, print x [S5 A]; hand Euler [S2 A, S3 E1].
- Slope fields: identify x − y [S1 A]; y(2 − y) [S4 A].
- Kinematics: a = 2 − v distance [S1 A]; skydiver a = 9.8 − 0.02v² with terminal speed, v dv/dx distance, Euler, parachute phase [S1 B]; a = 2x + 3 via ½v² [S2 E1]; braking with constant a [S2 A]; boat a = −0.05v², then with friction [S3 B]; v = 1/(x + 1) time as ∫1/v dx [S4 E1]; v = 3t² − 12t + 9 distance [S5 E1]; a = −4x SHM [S3 A, S5 B]; a = −v² [S5 A].

## Vectors (`sm_vectors`)
- Plane through three points, area, closest point to O [S1 E1]; rectangle, fourth vertex, plane [S4 E1]; pyramid face planes, angle with base, dihedral angle, volume [S3 B].
- Line–plane: intersection and sine of the angle [S2 E1]; parallel but not contained [S3 A]; angle [S5 A].
- Plane–plane: line of intersection and angle [S3 E1, S5 B with a plane through the line and a point]; angle [S2 A]; distance between parallel planes [S5 A].
- Skew lines: not parallel and not intersecting, common normal, distance, plane containing one parallel to the other, foot of perpendicular [S1 B]. Point to line distance [S1 A, S5 B].
- Reflection in a plane and foot of perpendicular [S5 E1].
- Vector calculus: e^t spiral with constant angle [S1 E1]; ellipse, a = −r [S2 E1]; t² − 1, t³ − 3t Cartesian [S3 E1]; helix [S4 E1]; integrate v to get r [S5 E1]; ball vs drone collision [S1 B]; 3D drones closest approach and plane crossing [S2 B]; 3D soccer kick over the crossbar [S4 B]; min speed [S1 A]; max speed [S4 A]; path from acceleration [S2 A]; path length [S5 A].
- Algebra MC: perpendicular condition [S1 A]; vector resolute [S1 A]; scalar resolute [S3 A]; unit vector of magnitude 6 [S2 A]; collinear points [S3 A]; parallelogram area [S3 A]; angle with an axis [S4 A]; unit normal [S4 A]; line through two points [S5 A].

## Statistics (`sm_statistics`)
- Linear combinations: box of apples [S1 E1]; bags from two machines, Pr(A > B) [S2 B]; lift load, adults and children, A > 2C [S4 B]; tech-free X − Y with a given Pr(Z < 0.8) [S5 E1]; cereal carton [S5 B]; MC Pr(X > Y) [S1 A], Var(3X − 2Y) [S2 A], sum of 4 [S4 A].
- Sample mean: Pr(X̄ < 48) [S5 A]; σ from sd(X̄) [S3 A].
- CI: tech-free with 1.96 [S1 E1, S3 E1]; interpretation [S2 A]; σ from the interval [S4 A]; sample size for width [S1 B, S3 E1, S5 B].
- Hypothesis tests: one-tailed p and conclusion [S1 A, S1 B, S3 B, S4 B, S5 B]; two-tailed tech-free [S2 E1]; critical mean [S1 B, S2 B, S3 B, S4 E1]; type I/II definitions [S3 A]; type II probability [S1 B, S3 B]; n for a required type II error [S3 B]; p = 0.03 at 5% vs 1% [S5 A].
- Unused so far: uniform or custom pdf linear combinations (Insight 2024 rectangles); dial setting for power (Insight 2024 g); CI for a sum.
