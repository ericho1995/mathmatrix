// VCE Specialist Mathematics Unit 3 & 4 — Practice set 5.
// Answers verified in checks/set5.py.
import { t, AOS, part, makeSet, curve, axes, argand } from './sm.mjs'

const { PF, FG, CX, CA, VE, ST } = AOS
const S = makeSet(5)

// ════════════════ Examination 1 ════════════════

S.ex1(PF, 'advanced', t`Use proof by contradiction to prove that there are no positive integers \(m\) and \(n\) such that \(m^2 - n^2 = 10\).`, [
  part('', '', 3,
    t`Assume \(m^2 - n^2 = (m - n)(m + n) = 10\). The factors \(m - n\) and \(m + n\) have the same parity, so their product is odd or a multiple of 4 — never 10.`,
    t`Suppose, for a contradiction, that positive integers \(m\) and \(n\) satisfy \(m^2 - n^2 = 10\). Then \((m - n)(m + n) = 10\). Since \((m + n) - (m - n) = 2n\) is even, \(m - n\) and \(m + n\) are both even or both odd. If both are odd, the product is odd; if both are even, the product is a multiple of 4. But 10 is even and not a multiple of 4. This contradiction shows no such integers exist. Marks: 1 for the assumption and factorisation; 1 for the parity argument; 1 for the contradiction and conclusion.`),
])

S.ex1(CX, 'proficient', t`Consider the equation \(z^2 - (3 + i)z + 4 + 3i = 0\), where \(z \in \C\).`, [
  part('a', t`Verify that \(z = 1 + 2i\) is a solution of the equation.`, 1,
    t`\((1 + 2i)^2 - (3 + i)(1 + 2i) + 4 + 3i = (-3 + 4i) - (1 + 7i) + 4 + 3i = 0\)`,
    t`Expand \((1 + 2i)^2 = -3 + 4i\) and \((3 + i)(1 + 2i) = 3 + 6i + i - 2 = 1 + 7i\).`),
  part('b', t`Find the other solution.`, 1,
    t`\(z = 2 - i\)`,
    t`The sum of the solutions is \(3 + i\), so the other is \(3 + i - (1 + 2i) = 2 - i\). (The coefficients are not all real, so the conjugate \(1 - 2i\) is not a solution.)`),
  part('c', t`The two solutions are represented by points \(A\) and \(B\) in the complex plane, and \(O\) is the origin. Show that angle \(AOB\) is a right angle, and find the area of triangle \(AOB\).`, 2,
    t`\(\overrightarrow{OA} \cdot \overrightarrow{OB} = (1)(2) + (2)(-1) = 0\); area \(\dfrac{5}{2}\)`,
    t`Treat \(1 + 2i\) and \(2 - i\) as the vectors \((1, 2)\) and \((2, -1)\). Their scalar product is zero, and each has length \(\sqrt{5}\), so the area is \(\frac{1}{2}\sqrt{5}\sqrt{5}\). (Equivalently, \(2 - i = -i(1 + 2i)\): a rotation by \(-\frac{\pi}{2}\).) 1 mark each.`),
])

S.ex1(FG, 'proficient', t`A curve is defined by the parametric equations \(x = \sec(t)\), \(y = \tan(t)\), where \(-\dfrac{\pi}{2} < t < \dfrac{\pi}{2}\).`, [
  part('a', t`Show that the Cartesian equation of the curve is \(x^2 - y^2 = 1\).`, 1,
    t`\(x^2 - y^2 = \sec^2(t) - \tan^2(t) = 1\)`,
    t`Use the identity \(1 + \tan^2(t) = \sec^2(t)\).`),
  part('b', t`State the set of possible values of \(x\).`, 1,
    t`\([1, \infty)\)`,
    t`For \(-\frac{\pi}{2} < t < \frac{\pi}{2}\), \(\cos(t) \in (0, 1]\), so \(\sec(t) \ge 1\). The curve is only the right-hand branch of the hyperbola.`),
  part('c', t`Find \(\dfrac{dy}{dx}\) in terms of \(t\), and find the gradient of the curve at the point where \(t = \dfrac{\pi}{4}\).`, 2,
    t`\(\dfrac{dy}{dx} = \dfrac{1}{\sin(t)}\); gradient \(\sqrt{2}\)`,
    t`\(\frac{dy}{dt} = \sec^2(t)\) and \(\frac{dx}{dt} = \sec(t)\tan(t)\), so \(\frac{dy}{dx} = \frac{\sec(t)}{\tan(t)} = \frac{1}{\sin(t)}\). At \(t = \frac{\pi}{4}\) this is \(\sqrt{2}\). 1 mark for the derivative, 1 mark for the gradient.`),
])

S.ex1(CA, 'proficient', t`The curve with equation \(x^3 + y^3 = 9\) passes through the point \((1, 2)\).`, [
  part('a', t`Find \(\dfrac{dy}{dx}\) at the point \((1, 2)\).`, 2,
    t`\(-\dfrac{1}{4}\)`,
    t`\(3x^2 + 3y^2\frac{dy}{dx} = 0\), so \(\frac{dy}{dx} = -\frac{x^2}{y^2} = -\frac{1}{4}\). 1 mark for differentiating implicitly, 1 mark for the value.`),
  part('b', t`Find \(\dfrac{d^2y}{dx^2}\) at the point \((1, 2)\).`, 2,
    t`\(-\dfrac{9}{16}\)`,
    t`Differentiate \(\frac{dy}{dx} = -\frac{x^2}{y^2}\) with the quotient rule: \(\frac{d^2y}{dx^2} = -\frac{2xy^2 - 2x^2y\frac{dy}{dx}}{y^4}\). At \((1, 2)\) with \(\frac{dy}{dx} = -\frac{1}{4}\): \(-\frac{8 + 1}{16} = -\frac{9}{16}\). 1 mark for the derivative (including \(\frac{dy}{dx}\) from the chain rule), 1 mark for the value.`),
])

S.ex1(CA, 'proficient', t`Using the substitution \(u = x + 1\), evaluate \(\displaystyle\int_0^3\frac{x}{\sqrt{x + 1}}\,dx\).`, [
  part('', '', 3,
    t`\(\dfrac{8}{3}\)`,
    t`With \(u = x + 1\), \(x = u - 1\), \(du = dx\), and the terminals become 1 and 4: \[\int_1^4\frac{u - 1}{\sqrt{u}}\,du = \int_1^4\left(u^{\frac{1}{2}} - u^{-\frac{1}{2}}\right)du = \left[\frac{2}{3}u^{\frac{3}{2}} - 2u^{\frac{1}{2}}\right]_1^4 = \left(\frac{16}{3} - 4\right) - \left(\frac{2}{3} - 2\right) = \frac{8}{3}.\] Marks: 1 for the integral in \(u\) with new terminals; 1 for the antiderivative; 1 for the value.`),
])

S.ex1(CA, 'proficient', t`A particle moves in a straight line. Its velocity at time \(t\) seconds is \(v = 3t^2 - 12t + 9\) m s⁻¹, \(t \ge 0\).`, [
  part('a', t`Find the times at which the particle is momentarily at rest.`, 1,
    t`\(t = 1\) and \(t = 3\)`,
    t`\(3(t^2 - 4t + 3) = 3(t - 1)(t - 3) = 0\).`),
  part('b', t`Find the distance travelled by the particle in the first 4 seconds.`, 2,
    t`12 m`,
    t`Taking \(x(0) = 0\), \(x = t^3 - 6t^2 + 9t\): \(x(1) = 4\), \(x(3) = 0\), \(x(4) = 4\). The particle goes out 4 m, back 4 m and out 4 m again: \(4 + 4 + 4 = 12\). 1 mark for using the turning points, 1 mark for the distance. Common error: the displacement 4 m.`),
  part('c', t`Find the acceleration of the particle when \(t = 4\).`, 1,
    t`12 m s⁻²`,
    t`\(a = \frac{dv}{dt} = 6t - 12\).`),
])

S.ex1(CA, 'proficient', t`Solve the differential equation \(\dfrac{dy}{dx} = e^{x - y}\), where \(y(0) = \loge(2)\), giving \(y\) in terms of \(x\).`, [
  part('', '', 3,
    t`\(y = \loge\left(e^x + 1\right)\)`,
    t`\(\frac{dy}{dx} = e^xe^{-y}\), so \(\int e^y\,dy = \int e^x\,dx\) and \(e^y = e^x + c\). \(y(0) = \loge(2)\) gives \(2 = 1 + c\), so \(c = 1\) and \(y = \loge(e^x + 1)\). Marks: 1 separating; 1 integrating; 1 the constant and \(y\).`),
])

S.ex1(ST, 'proficient', t`The random variables \(X\) and \(Y\) are independent and normally distributed, with \(X\) having mean 20 and standard deviation 3, and \(Y\) having mean 16 and standard deviation 4. Use \(\Pr(Z < 0.8) = 0.788\), where \(Z\) is standard normal.`, [
  part('a', t`Find the mean and the standard deviation of \(X - Y\).`, 2,
    t`Mean 4, standard deviation 5`,
    t`\(\E(X - Y) = 20 - 16 = 4\); \(\Var(X - Y) = 9 + 16 = 25\) (variances add). 1 mark each.`),
  part('b', t`Find \(\Pr(X > Y)\).`, 1,
    t`0.788`,
    t`\(\Pr(X - Y > 0) = \Pr\left(Z > \frac{0 - 4}{5}\right) = \Pr(Z > -0.8) = \Pr(Z < 0.8) = 0.788\).`),
  part('c', t`Find the value of \(k\) for which \(\Pr(X - Y > k) = 0.212\).`, 1,
    t`\(k = 8\)`,
    t`\(0.212 = 1 - 0.788 = \Pr(Z > 0.8)\), so \(\frac{k - 4}{5} = 0.8\) and \(k = 8\).`),
])

S.ex1(VE, 'proficient', t`The plane \(\Pi\) has Cartesian equation \(2x - y + 2z = 4\), and \(P\) is the point \((3, 1, 4)\).`, [
  part('a', t`Find the shortest distance from \(P\) to \(\Pi\).`, 1,
    t`3`,
    t`\(\frac{|6 - 1 + 8 - 4|}{\sqrt{4 + 1 + 4}} = \frac{9}{3} = 3\).`),
  part('b', t`Find the coordinates of the point in \(\Pi\) that is closest to \(P\).`, 2,
    t`\((1, 2, 2)\)`,
    t`Move from \(P\) along the normal: \((3, 1, 4) + \lambda(2, -1, 2)\). Substituting: \(2(3 + 2\lambda) - (1 - \lambda) + 2(4 + 2\lambda) = 4\) gives \(13 + 9\lambda = 4\), so \(\lambda = -1\). 1 mark for the method, 1 mark for the point.`),
  part('c', t`Find the coordinates of the reflection of \(P\) in \(\Pi\).`, 1,
    t`\((-1, 3, 0)\)`,
    t`Use \(\lambda = -2\): twice the distance from \(P\) to the plane.`),
  part('d', t`Find the Cartesian equation of the plane that passes through \(P\) and is parallel to \(\Pi\).`, 1,
    t`\(2x - y + 2z = 13\)`,
    t`Same normal; \(2(3) - 1 + 2(4) = 13\). The planes are 3 units apart, as in part a.`),
])

S.ex1(VE, 'advanced', t`A particle moves in a plane. Its velocity at time \(t\) seconds is \(\dot{\tv{r}}(t) = (2 - 2t)\ii + (3t^2 - 3)\jj\) m s⁻¹, \(t \ge 0\), and initially it is at the point with position vector \(\ii\).`, [
  part('a', t`Find the position vector \(\tv{r}(t)\).`, 2,
    t`\(\tv{r}(t) = (1 + 2t - t^2)\ii + (t^3 - 3t)\jj\)`,
    t`Antidifferentiate each component and use \(\tv{r}(0) = \ii\) to find the constants. 1 mark for antidifferentiating, 1 mark for the constants.`),
  part('b', t`Find the time and the position vector when the particle is at rest.`, 2,
    t`\(t = 1\); \(2\ii - 2\jj\)`,
    t`Both components are zero only when \(t = 1\) (\(2 - 2t = 0\) and \(3t^2 - 3 = 0\)). 1 mark for the time, 1 mark for the position.`),
  part('c', t`Find the position vector of the particle when it crosses the \(x\)-axis for \(t > 0\).`, 1,
    t`\(\left(2\sqrt{3} - 2\right)\ii\), when \(t = \sqrt{3}\)`,
    t`\(t^3 - 3t = 0\) gives \(t = \sqrt{3}\) for \(t > 0\), and \(1 + 2\sqrt{3} - 3 = 2\sqrt{3} - 2\).`),
  part('d', t`Find the speed of the particle when \(t = 2\).`, 1,
    t`\(\sqrt{85}\) m s⁻¹`,
    t`\(\dot{\tv{r}}(2) = -2\ii + 9\jj\).`),
])

// ════════════════ Examination 2 — Section A ════════════════

S.mc(PF, 'developing', t`Which one of the following is logically equivalent to the statement ‘If it rains, then the match is cancelled’?`,
  ['If the match is not cancelled, then it did not rain.', 'If the match is cancelled, then it rained.', 'If it does not rain, then the match is not cancelled.', 'It rains and the match is not cancelled.'], 'A',
  t`A statement is equivalent to its contrapositive: “if not \(Q\) then not \(P\)”. B is the converse and C the inverse, neither of which follows (the match might be cancelled for another reason); D is the negation.`)

S.mc(PF, 'proficient', t`The statement ‘For all \(n \in \N\), \(n^2 + n + 41\) is prime’ is shown to be false by the counterexample \(n =\)`,
  ['1', '10', '39', '40'], 'D',
  t`\(40^2 + 40 + 41 = 1681 = 41^2\), which is not prime. For \(n = 1\), 10 and 39 the values 43, 151 and 1601 are all prime. (\(n = 41\) also fails, since every term is then divisible by 41.)`)

S.mc(FG, 'proficient', t`The graph of \(y = \tan^{-1}(x - 1) + \dfrac{\pi}{2}\) has horizontal asymptotes with equations`,
  [t`\(y = 0\) and \(y = \pi\)`, t`\(y = -\frac{\pi}{2}\) and \(y = \frac{\pi}{2}\)`, t`\(y = 1\) and \(y = \pi + 1\)`, t`\(y = 0\) only`], 'A',
  t`\(\tan^{-1}(u) \to \pm\frac{\pi}{2}\) as \(u \to \pm\infty\); adding \(\frac{\pi}{2}\) gives 0 and \(\pi\). The horizontal translation by 1 does not change the asymptotes.`)

S.mc(FG, 'proficient', t`The number of solutions of the equation \(\sec(x) = x\) for \(0 \le x \le 2\pi\) is`,
  ['0', '1', '2', '3'], 'B',
  t`For \(0 \le x < \frac{\pi}{2}\), \(\sec(x) \ge 1\) and \(\sec(x) > x\). For \(\frac{\pi}{2} < x < \frac{3\pi}{2}\), \(\sec(x) \le -1 < x\). For \(\frac{3\pi}{2} < x \le 2\pi\), \(\sec(x)\) falls from \(+\infty\) to 1 while \(x\) rises past 4.7, so the graphs cross exactly once (near \(x \approx 4.92\)).`)

S.mc(CX, 'developing', t`If \(|z| = 2\) and \(\Arg(z) = -\dfrac{2\pi}{3}\), then \(z^3\) is equal to`,
  [t`\(-8\)`, t`\(-8i\)`, t`\(8\)`, t`\(8i\)`], 'C',
  t`By de Moivre’s theorem, \(z^3 = 2^3\cis\left(3 \times -\frac{2\pi}{3}\right) = 8\cis(-2\pi) = 8\). Cubing triples the argument, and \(-2\pi\) is a full turn.`)

S.mc(CX, 'proficient', t`Let \(w = \dfrac{1 + i}{1 - i}\). Then \(w^{2025}\) is equal to`,
  [t`\(1\)`, t`\(-1\)`, t`\(-i\)`, t`\(i\)`], 'D',
  t`\(w = \frac{(1 + i)^2}{(1 - i)(1 + i)} = \frac{2i}{2} = i\). Since \(2025 = 4 \times 506 + 1\), \(i^{2025} = i\).`)

S.mc(CX, 'proficient', t`The solutions of \(z^4 + 4 = 0\), \(z \in \C\), are`,
  [t`\(1 + i,\ 1 - i,\ -1 + i,\ -1 - i\)`, t`\(\sqrt{2} + \sqrt{2}i,\ \sqrt{2} - \sqrt{2}i,\ -\sqrt{2} + \sqrt{2}i,\ -\sqrt{2} - \sqrt{2}i\)`, t`\(2,\ -2,\ 2i,\ -2i\)`, t`\(\sqrt{2},\ -\sqrt{2},\ \sqrt{2}i,\ -\sqrt{2}i\)`], 'A',
  t`\(-4 = 4\cis(\pi)\), so \(z = \sqrt{2}\cis\left(\frac{\pi}{4} + \frac{k\pi}{2}\right) = \pm 1 \pm i\). B has modulus 2, not \(\sqrt{2}\); D gives \(z^4 = 4\).`)

S.mc(CA, 'proficient', t`The pseudocode below applies Euler’s method to a differential equation. The value printed is`,
  ['0.50', '0.55', '0.75', '1.00'], 'C',
  t`Each pass multiplies \(y\) by 1.5 (\(y \leftarrow y + 0.25 \times 2y\)): \(y = 1.5, 2.25, 3.375\) at \(x = 0.25, 0.5, 0.75\). The loop stops when \(y > 3\) and prints \(x = 0.75\). The exact solution \(y = e^{2x}\) reaches 3 at \(x = \frac{\loge(3)}{2} \approx 0.55\).`,
  { diagram: { kind: 'pseudocode', lines: ['x ← 0', 'y ← 1', 'h ← 0.25', 'while y ≤ 3 do', '    y ← y + h × 2 × y', '    x ← x + h', 'end while', 'print x'] } })

S.mc(CA, 'proficient', t`A population with logistic growth is harvested at a constant rate, so that \(\dfrac{dP}{dt} = 0.5P\left(1 - \dfrac{P}{1000}\right) - 60\). The largest equilibrium population, correct to the nearest whole number, is`,
  ['139', '500', '861', '1000'], 'C',
  t`Equilibrium: \(0.5P - 0.0005P^2 = 60\), so \(P^2 - 1000P + 120\,000 = 0\) and \(P \approx 139\) or \(861\). 1000 is the carrying capacity without harvesting.`)

S.mc(CA, 'proficient', t`A particle moves in a straight line with acceleration \(a = -v^2\) m s⁻², where \(v\) m s⁻¹ is its velocity when its displacement from the origin is \(x\) m. When \(x = 0\), \(v = 4\). When \(x = \loge(2)\), \(v\) is equal to`,
  ['1', '2', '3', '4'], 'B',
  t`\(v\frac{dv}{dx} = -v^2\) gives \(\frac{dv}{dx} = -v\), so \(v = 4e^{-x}\). At \(x = \loge(2)\), \(v = 2\).`)

S.mc(CA, 'proficient', t`The region enclosed by the graphs of \(y = \sqrt{x}\) and \(y = x^2\) is rotated about the \(x\)-axis. The volume of the solid formed is`,
  [t`\(\dfrac{1}{3}\)`, t`\(\dfrac{9\pi}{70}\)`, t`\(\dfrac{3\pi}{10}\)`, t`\(\dfrac{\pi}{2}\)`], 'C',
  t`\(V = \pi\displaystyle\int_0^1\left((\sqrt{x})^2 - (x^2)^2\right)dx = \pi\left(\frac{1}{2} - \frac{1}{5}\right) = \frac{3\pi}{10}\). \(\frac{9\pi}{70}\) squares the difference \((\sqrt{x} - x^2)^2\) instead of subtracting the squares; \(\frac{1}{3}\) is the area of the region.`)

S.mc(CA, 'proficient', t`The curve \(y = x^2\), \(0 \le x \le 1\), is rotated about the \(y\)-axis. The area of the curved surface formed, correct to two decimal places, is`,
  ['0.85', '3.14', '3.81', '5.33'], 'D',
  t`\(S = \displaystyle\int_0^1 2\pi x\sqrt{1 + (2x)^2}\,dx = \frac{\pi}{6}\left(5\sqrt{5} - 1\right) \approx 5.33\) (the \(x\)-form of the \(y\)-axis formula, since \(dy = 2x\,dx\)). 3.81 rotates about the \(x\)-axis instead; 0.85 omits the \(2\pi\).`)

S.mc(CA, 'developing', t`An antiderivative of \(x\cos(2x)\) is`,
  [t`\(\dfrac{x}{2}\sin(2x) - \dfrac{1}{4}\cos(2x)\)`, t`\(\dfrac{x}{2}\sin(2x) + \dfrac{1}{4}\cos(2x)\)`, t`\(2x\sin(2x) + \cos(2x)\)`, t`\(\dfrac{x^2}{2}\sin(2x)\)`], 'B',
  t`By parts with \(u = x\), \(\frac{dv}{dx} = \cos(2x)\): \(\frac{x}{2}\sin(2x) - \int\frac{1}{2}\sin(2x)\,dx = \frac{x}{2}\sin(2x) + \frac{1}{4}\cos(2x)\). Check by differentiating. A has the sign error from \(\int\sin(2x)\,dx\).`)

S.mc(CA, 'proficient', t`For all constants \(A\) and \(B\), \(y = Ae^{2x} + Be^{-x}\) is a solution of the differential equation`,
  [t`\(\dfrac{d^2y}{dx^2} - \dfrac{dy}{dx} - 2y = 0\)`, t`\(\dfrac{d^2y}{dx^2} + \dfrac{dy}{dx} - 2y = 0\)`, t`\(\dfrac{d^2y}{dx^2} - 2\dfrac{dy}{dx} - y = 0\)`, t`\(\dfrac{d^2y}{dx^2} + \dfrac{dy}{dx} + 2y = 0\)`], 'A',
  t`\(y' = 2Ae^{2x} - Be^{-x}\) and \(y'' = 4Ae^{2x} + Be^{-x}\). Then \(y'' - y' - 2y = (4 - 2 - 2)Ae^{2x} + (1 + 1 - 2)Be^{-x} = 0\).`)

S.mc(VE, 'developing', t`A vector equation of the line through the points \((1, 2, -1)\) and \((3, -2, 3)\) is`,
  [t`\(\tv{r}(t) = \ii + 2\jj - \kk + t(4\ii + 2\kk)\)`, t`\(\tv{r}(t) = 3\ii - 2\jj + 3\kk + t(\ii + 2\jj - \kk)\)`, t`\(\tv{r}(t) = \ii + 2\jj - \kk + t(2\ii + 4\jj - 4\kk)\)`, t`\(\tv{r}(t) = \ii + 2\jj - \kk + t(\ii - 2\jj + 2\kk)\)`], 'D',
  t`The direction is \((3 - 1, -2 - 2, 3 + 1) = (2, -4, 4)\), a multiple of \(\ii - 2\jj + 2\kk\), and the line passes through \((1, 2, -1)\). A adds the position vectors; C has the wrong signs.`)

S.mc(VE, 'proficient', t`The distance between the parallel planes \(x - 2y + 2z = 3\) and \(x - 2y + 2z = -6\) is`,
  [t`\(\dfrac{1}{3}\)`, t`\(1\)`, t`\(3\)`, t`\(9\)`], 'C',
  t`Both planes have normal \(\ii - 2\jj + 2\kk\), of length 3, so the distance is \(\frac{|3 - (-6)|}{3} = 3\). 9 forgets to divide by the length of the normal; 1 subtracts the constants without regard to sign.`)

S.mc(VE, 'proficient', t`The acute angle between the line \(\tv{r}(t) = t(2\ii + \jj + 2\kk)\), \(t \in \R\), and the plane \(x + y + z = 0\), correct to one decimal place, is`,
  ['15.8°', '45.0°', '57.7°', '74.2°'], 'D',
  t`\(\sin(\theta) = \frac{|\tv{d} \cdot \tv{n}|}{|\tv{d}||\tv{n}|} = \frac{5}{3\sqrt{3}}\), so \(\theta \approx 74.2^\circ\). 15.8° is the angle between the line and the normal.`)

S.mc(VE, 'proficient', t`A particle has velocity \(\dot{\tv{r}}(t) = e^t\ii + 2\jj\) m s⁻¹. The distance it travels from \(t = 0\) to \(t = 1\), in metres correct to two decimal places, is`,
  ['2.64', '2.66', '3.37', '3.72'], 'B',
  t`\(\displaystyle\int_0^1\sqrt{e^{2t} + 4}\,dt \approx 2.66\). 2.64 is the magnitude of the displacement \((e - 1)\ii + 2\jj\), which is slightly shorter because the path curves; 3.72 adds the components’ integrals; 3.37 is the speed at \(t = 1\).`)

S.mc(ST, 'developing', t`The random variable \(X\) is normally distributed with mean 50 and standard deviation 8. For random samples of size 16, \(\Pr(\bar{X} < 48)\), correct to four decimal places, is`,
  ['0.0228', '0.1587', '0.4013', '0.8413'], 'B',
  t`\(\sd(\bar{X}) = \frac{8}{4} = 2\), so \(\Pr(\bar{X} < 48) = \Pr(Z < -1) \approx 0.1587\). 0.4013 uses the population standard deviation, \(\Pr(Z < -0.25)\).`)

S.mc(ST, 'proficient', t`The \(p\) value of a hypothesis test is 0.03. Which one of the following is correct?`,
  [t`\(H_0\) is rejected at the 5% level of significance but not at the 1% level.`, t`\(H_0\) is rejected at both the 5% and the 1% levels of significance.`, t`The probability that \(H_0\) is true is 0.03.`, t`\(H_0\) is not rejected at the 5% level of significance.`], 'A',
  t`\(H_0\) is rejected when \(p\) is less than the level of significance: \(0.03 < 0.05\) but \(0.03 > 0.01\). The \(p\) value is the probability of a result at least this extreme assuming \(H_0\) is true, not the probability that \(H_0\) is true.`)

// ════════════════ Examination 2 — Section B ════════════════

S.ex2(FG, 'advanced', t`Let \(f: \R\setminus\{0\} \to \R\), \(f(x) = \tan^{-1}(x) + \tan^{-1}\left(\dfrac{1}{x}\right)\).`, [
  part('a', t`Show that \(f'(x) = 0\) for all \(x \ne 0\).`, 2,
    t`\(f'(x) = \dfrac{1}{1 + x^2} + \dfrac{-1/x^2}{1 + 1/x^2} = \dfrac{1}{1 + x^2} - \dfrac{1}{x^2 + 1} = 0\)`,
    t`Differentiate \(\tan^{-1}\left(\frac{1}{x}\right)\) with the chain rule, then multiply the numerator and denominator by \(x^2\). 1 mark for the chain rule, 1 mark for simplifying.`),
  part('b', t`Hence state the value of \(f(x)\) for \(x > 0\) and for \(x < 0\).`, 2,
    t`\(\dfrac{\pi}{2}\) for \(x > 0\); \(-\dfrac{\pi}{2}\) for \(x < 0\)`,
    t`\(f\) is constant on each interval of its domain (but may differ between them). \(f(1) = \frac{\pi}{4} + \frac{\pi}{4}\) and \(f(-1) = -\frac{\pi}{2}\). 1 mark each.`),
  part('c', t`Show that \(\dfrac{d}{dx}\left(x\tan^{-1}(x)\right) = \tan^{-1}(x) + \dfrac{x}{1 + x^2}\), and hence find the exact value of \(\displaystyle\int_0^1\tan^{-1}(x)\,dx\).`, 3,
    t`\(\dfrac{\pi}{4} - \dfrac{1}{2}\loge(2)\)`,
    t`The derivative follows from the product rule. Rearranging and integrating: \(\displaystyle\int_0^1\tan^{-1}(x)\,dx = \Big[x\tan^{-1}(x)\Big]_0^1 - \int_0^1\frac{x}{1 + x^2}\,dx = \frac{\pi}{4} - \frac{1}{2}\loge(2)\). Marks: 1 product rule; 1 rearranging to integrate \(\tan^{-1}(x)\); 1 value.`),
  part('d', t`The region bounded by the graph of \(y = \tan^{-1}(x)\), the \(y\)-axis and the line \(y = \dfrac{\pi}{4}\) is rotated about the \(y\)-axis. Find the exact volume of the solid formed.`, 2,
    t`\(\pi\left(1 - \dfrac{\pi}{4}\right)\)`,
    t`\(x = \tan(y)\) for \(0 \le y \le \frac{\pi}{4}\): \(V = \pi\displaystyle\int_0^{\frac{\pi}{4}}\tan^2(y)\,dy = \pi\int_0^{\frac{\pi}{4}}(\sec^2(y) - 1)\,dy = \pi\left(1 - \frac{\pi}{4}\right)\). 1 mark for the integral, 1 mark for the value.`),
  part('e', t`Find the length of the graph of \(y = \tan^{-1}(x)\) from \(x = 0\) to \(x = 1\), correct to three decimal places.`, 1,
    t`1.278`,
    t`\(\displaystyle\int_0^1\sqrt{1 + \frac{1}{(1 + x^2)^2}}\,dx \approx 1.278\).`),
])

S.ex2(CX, 'advanced', t`A square in the complex plane has its centre at the origin. Its vertices, in anticlockwise order, are \(z_1 = 3 + i\), \(z_2\), \(z_3\) and \(z_4\).`, [
  part('a', t`Explain why \(z_2 = iz_1\), and find \(z_2\), \(z_3\) and \(z_4\) in Cartesian form.`, 2,
    t`Multiplying by \(i\) rotates by \(\frac{\pi}{2}\) anticlockwise about \(O\). \(z_2 = -1 + 3i\), \(z_3 = -3 - i\), \(z_4 = 1 - 3i\).`,
    t`The vertices of a square centred at \(O\) are successive quarter-turns of each other. 1 mark for the reason, 1 mark for the three vertices.`),
  part('b', t`Show that the four vertices are the solutions of \(z^4 = 28 + 96i\).`, 2,
    t`\(z_1^4 = (8 + 6i)^2 = 28 + 96i\), and \(z_k^4 = (i^{k-1}z_1)^4 = z_1^4\).`,
    t`\((3 + i)^2 = 8 + 6i\) and \((8 + 6i)^2 = 64 - 36 + 96i\). Since \(i^4 = 1\), every vertex has the same fourth power, and a quartic has exactly four solutions. 1 mark for \(z_1^4\), 1 mark for the other vertices.`),
  part('c', t`Find the area of the square.`, 1,
    t`20`,
    t`Side \(|z_2 - z_1| = |-4 + 2i| = \sqrt{20}\).`),
  part('d', t`Find the equation of the circle inscribed in the square, in the form \(|z| = r\).`, 2,
    t`\(|z| = \sqrt{5}\)`,
    t`The radius is the distance from \(O\) to the midpoint of a side: \(\left|\frac{z_1 + z_2}{2}\right| = |1 + 2i| = \sqrt{5}\). 1 mark for the midpoint, 1 mark for the equation.`),
  part('e', t`Find the area of the region inside the square but outside the inscribed circle.`, 1,
    t`\(20 - 5\pi\)`,
    t`\(20 - \pi(\sqrt{5})^2\).`),
  part('f', t`The line through \(z_1\) and \(z_2\) can be written as \(\{z : |z| = |z - w|\}\) for some \(w \in \C\). Find \(w\).`, 2,
    t`\(w = 2 + 4i\)`,
    t`\(\{z : |z| = |z - w|\}\) is the perpendicular bisector of the segment from \(0\) to \(w\). The side through \(z_1\) and \(z_2\) is perpendicular to \(1 + 2i\) at the point \(1 + 2i\), so \(w = 2(1 + 2i)\). Check: \(|3 + i| = |1 - 3i| = \sqrt{10}\). 1 mark for the perpendicular bisector idea, 1 mark for \(w\).`),
])

S.ex2(CA, 'advanced', t`The number of yeast cells in a culture, \(N\) thousand, \(t\) hours after it is set up, is modelled by \(\dfrac{dN}{dt} = 0.8N\left(1 - \dfrac{N}{40}\right)\), where \(N(0) = 2\).`, [
  part('a', t`Verify that \(N = \dfrac{40}{1 + 19e^{-0.8t}}\) satisfies the differential equation and the initial condition.`, 2,
    t`\(N(0) = \frac{40}{20} = 2\); \(\frac{dN}{dt} = \frac{608e^{-0.8t}}{(1 + 19e^{-0.8t})^2} = 0.8N\left(1 - \frac{N}{40}\right)\).`,
    t`\(1 - \frac{N}{40} = \frac{19e^{-0.8t}}{1 + 19e^{-0.8t}}\), so \(0.8N\left(1 - \frac{N}{40}\right) = \frac{0.8 \times 40 \times 19e^{-0.8t}}{(1 + 19e^{-0.8t})^2}\), matching the derivative. 1 mark for each check.`),
  part('b', t`Find the time at which there are 30 thousand cells, in hours correct to two decimal places.`, 1,
    t`5.05 h`,
    t`\(1 + 19e^{-0.8t} = \frac{4}{3}\) gives \(e^{-0.8t} = \frac{1}{57}\), so \(t = \frac{\loge(57)}{0.8} \approx 5.05\).`),
  part('c', t`Find the maximum rate of growth of the culture and the time at which it occurs, correct to two decimal places.`, 2,
    t`8 thousand cells per hour, at \(t \approx 3.68\) h`,
    t`\(0.8N\left(1 - \frac{N}{40}\right)\) is greatest at \(N = 20\), where it is 8. \(N = 20\) when \(19e^{-0.8t} = 1\): \(t = \frac{\loge(19)}{0.8}\). 1 mark each.`),
  part('d', t`Cells are now harvested at a constant rate of \(h\) thousand per hour, so that \(\dfrac{dN}{dt} = 0.8N\left(1 - \dfrac{N}{40}\right) - h\). Find the largest value of \(h\) for which the population has an equilibrium value.`, 2,
    t`\(h = 8\)`,
    t`An equilibrium needs \(0.8N\left(1 - \frac{N}{40}\right) = h\) to have a solution, and the left side is at most 8 (part c). 1 mark for relating \(h\) to the maximum growth rate, 1 mark for 8.`),
  part('e', t`For \(h = 6\), find the two equilibrium values of \(N\) and state, with a reason, which one is stable.`, 2,
    t`\(N = 10\) and \(N = 30\); \(N = 30\) is stable.`,
    t`\(0.02N^2 - 0.8N + 6 = 0\) gives \(N^2 - 40N + 300 = 0\), so \(N = 10\) or 30. For \(10 < N < 30\), \(\frac{dN}{dt} > 0\), and for \(N > 30\), \(\frac{dN}{dt} < 0\), so populations near 30 move towards 30; populations just below 10 decrease away from 10. 1 mark for the values, 1 mark for stability with a reason.`),
  part('f', t`For \(h = 6\) and \(N(0) = 20\), use Euler’s method with a step size of 1 hour to estimate \(N\) when \(t = 2\).`, 1,
    t`23.92 thousand`,
    t`\(N_1 = 20 + (8 - 6) = 22\); \(N_2 = 22 + \left(0.8 \times 22 \times 0.45 - 6\right) = 23.92\).`),
])

S.ex2(CA, 'advanced', t`A particle attached to a spring moves along the \(x\)-axis, where \(x\) m is its displacement from its equilibrium position \(O\). Its acceleration is \(a = -4x\) m s⁻². At \(t = 0\) the particle is at \(O\) and moving in the positive direction with speed 6 m s⁻¹.`, [
  part('a', t`Use \(a = v\dfrac{dv}{dx}\) to show that \(v^2 = 36 - 4x^2\).`, 2,
    t`\(\frac{1}{2}v^2 = -2x^2 + c\) and \(v = 6\) at \(x = 0\) gives \(c = 18\).`,
    t`\(\int v\,dv = \int -4x\,dx\). 1 mark for integrating, 1 mark for the constant.`),
  part('b', t`Find the maximum displacement of the particle from \(O\).`, 1,
    t`3 m`,
    t`\(v = 0\) when \(4x^2 = 36\).`),
  part('c', t`Verify that \(x = 3\sin(2t)\) satisfies \(a = -4x\) and both initial conditions.`, 2,
    t`\(\ddot{x} = -12\sin(2t) = -4x\); \(x(0) = 0\), \(\dot{x}(0) = 6\cos(0) = 6\).`,
    t`1 mark for the second derivative, 1 mark for the initial conditions.`),
  part('d', t`Find the first time at which the particle is 1.5 m from \(O\).`, 1,
    t`\(\dfrac{\pi}{12}\) s`,
    t`\(3\sin(2t) = 1.5\) gives \(2t = \frac{\pi}{6}\).`),
  part('e', t`Find the distance travelled by the particle in the first 2 seconds, in metres correct to two decimal places.`, 2,
    t`8.27 m`,
    t`The particle reaches \(x = 3\) at \(t = \frac{\pi}{4}\), then turns back. The next turn is at \(t = \frac{3\pi}{4} \approx 2.36 > 2\), so on \(\left[\frac{\pi}{4}, 2\right]\) it moves from 3 to \(3\sin(4) \approx -2.27\). Distance \(= 3 + 3 - 3\sin(4) \approx 8.27\) (or \(\int_0^2|6\cos(2t)|\,dt\)). 1 mark for identifying the turning point, 1 mark for the distance.`),
  part('f', t`Find the average speed of the particle over the first 2 seconds, correct to two decimal places.`, 1,
    t`4.14 m s⁻¹`,
    t`\(\frac{8.27}{2}\). (The average velocity is \(\frac{x(2) - x(0)}{2} \approx -1.14\) m s⁻¹, a different quantity.)`),
  part('g', t`State the maximum speed of the particle and where it occurs.`, 1,
    t`6 m s⁻¹, at \(O\)`,
    t`\(v^2 = 36 - 4x^2\) is greatest when \(x = 0\).`),
])

S.ex2(VE, 'advanced', t`The planes \(\Pi_1\) and \(\Pi_2\) have Cartesian equations \(x + y - z = 2\) and \(2x - y + z = 1\) respectively, and \(P\) is the point \((3, 2, 5)\).`, [
  part('a', t`Show that the point \(A(1, 1, 0)\) lies on both planes, and that the planes are perpendicular.`, 2,
    t`\(1 + 1 - 0 = 2\), \(2 - 1 + 0 = 1\); normals \((1, 1, -1) \cdot (2, -1, 1) = 0\).`,
    t`1 mark for checking \(A\), 1 mark for the scalar product of the normals.`),
  part('b', t`Find a vector equation of the line \(L\) along which the planes intersect.`, 2,
    t`\(\tv{r}(t) = \ii + \jj + t(\jj + \kk)\), \(t \in \R\)`,
    t`The direction is \((\ii + \jj - \kk) \times (2\ii - \jj + \kk) = -3\jj - 3\kk\), a multiple of \(\jj + \kk\); \(A\) is on both planes. 1 mark for the direction, 1 mark for the equation.`),
  part('c', t`Find the coordinates of the point on \(L\) closest to \(P\), and the shortest distance from \(P\) to \(L\).`, 3,
    t`\((1, 4, 3)\); \(2\sqrt{3}\)`,
    t`\(\overrightarrow{AP} = 2\ii + \jj + 5\kk\). The closest point has \(t = \frac{\overrightarrow{AP} \cdot (\jj + \kk)}{|\jj + \kk|^2} = \frac{6}{2} = 3\), giving \((1, 4, 3)\). The distance is \(|(3, 2, 5) - (1, 4, 3)| = |(2, -2, 2)| = 2\sqrt{3}\). Marks: 1 for the method, 1 for the point, 1 for the distance.`),
  part('d', t`Find the Cartesian equation of the plane \(\Pi_3\) that contains both \(L\) and \(P\).`, 2,
    t`\(2x + y - z = 3\)`,
    t`A normal is \(\overrightarrow{AP} \times (\jj + \kk) = -4\ii - 2\jj + 2\kk\), a multiple of \(2\ii + \jj - \kk\); \(2(1) + 1 - 0 = 3\), and \(P\) gives \(6 + 2 - 5 = 3\). 1 mark for the normal, 1 mark for the equation.`),
  part('e', t`Find the acute angle between \(\Pi_3\) and \(\Pi_1\), in degrees correct to one decimal place.`, 1,
    t`19.5°`,
    t`\(\cos(\theta) = \frac{(2, 1, -1) \cdot (1, 1, -1)}{\sqrt{6}\sqrt{3}} = \frac{4}{\sqrt{18}}\).`),
])

S.ex2(ST, 'advanced', t`Boxes of cereal are labelled 500 g. The filling machine can be set to any mean mass \(\mu\) grams, and the mass of cereal in a box is then normally distributed with mean \(\mu\) and standard deviation 6 g.`, [
  part('a', t`With \(\mu = 508\), find the proportion of boxes that contain less than the labelled mass, correct to four decimal places.`, 1,
    t`0.0912`,
    t`\(\Pr(X < 500) = \Pr\left(Z < -\frac{4}{3}\right) \approx 0.0912\).`),
  part('b', t`Find the smallest value of \(\mu\), correct to two decimal places, for which at most 1% of boxes contain less than 500 g.`, 1,
    t`513.96 g`,
    t`\(\mu = 500 + 2.3263 \times 6\).`),
  part('c', t`With \(\mu = 508\), boxes are packed 12 to a carton. An empty carton has a mass that is normally distributed with mean 250 g and standard deviation 20 g. Find the probability that a full carton has a total mass of more than 6400 g, correct to four decimal places.`, 2,
    t`0.0306`,
    t`Mean \(12 \times 508 + 250 = 6346\); variance \(12 \times 36 + 400 = 832\). \(\Pr(T > 6400) \approx 0.0306\). 1 mark for the distribution, 1 mark for the probability.`),
  part('d', t`An inspector suspects the machine is set below 508 g. A random sample of 30 boxes has a mean of 505.4 g. Test \(H_0: \mu = 508\) against \(H_1: \mu < 508\): find the \(p\) value, correct to four decimal places, and state the conclusion at the 1% level of significance.`, 3,
    t`\(p \approx 0.0088\); reject \(H_0\) at the 1% level.`,
    t`\(\sd(\bar{X}) = \frac{6}{\sqrt{30}} \approx 1.095\), so \(z \approx -2.374\) and \(p \approx 0.0088 < 0.01\). There is strong evidence the mean is below 508 g. Marks: 1 standard error; 1 \(p\) value; 1 conclusion.`),
  part('e', t`Find a 95% confidence interval for \(\mu\) using this sample, correct to two decimal places.`, 1,
    t`\((503.25, 507.55)\)`,
    t`\(505.4 \pm 1.96 \times 1.095\).`),
  part('f', t`Find the smallest sample size for which a 95% confidence interval for \(\mu\) has a half-width of at most 1 g.`, 2,
    t`139`,
    t`\(1.96 \times \frac{6}{\sqrt{n}} \le 1\) gives \(\sqrt{n} \ge 11.76\) and \(n \ge 138.3\); round up. 1 mark for the inequality, 1 mark for 139.`),
])

export const ITEMS = S.items
