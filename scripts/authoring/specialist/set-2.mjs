// VCE Specialist Mathematics Unit 3 & 4 — Practice set 2.
// Answers verified in checks/set2.py.
import { t, AOS, part, makeSet, curve, param, axes, argand, piTicks } from './sm.mjs'

const { PF, FG, CX, CA, VE, ST } = AOS
const S = makeSet(2)

// ════════════════ Examination 1 ════════════════

S.ex1(PF, 'proficient', t`Prove by mathematical induction that \(\displaystyle\sum_{r=1}^{n} r\,2^r = (n - 1)2^{n+1} + 2\) for all \(n \in \N\).`, [
  part('', '', 3,
    t`True for \(n = 1\) (both sides equal 2); if true for \(n = k\), adding \((k + 1)2^{k+1}\) gives \(k\,2^{k+2} + 2\), the formula for \(n = k + 1\).`,
    t`Base case: the left side is \(1 \times 2 = 2\) and the right side is \(0 \times 4 + 2 = 2\). Inductive step: assume \(\sum_{r=1}^{k} r\,2^r = (k - 1)2^{k+1} + 2\). Then \[\sum_{r=1}^{k+1} r\,2^r = (k - 1)2^{k+1} + 2 + (k + 1)2^{k+1} = 2k \times 2^{k+1} + 2 = k\,2^{k+2} + 2 = \big((k + 1) - 1\big)2^{(k+1)+1} + 2,\] which is the statement for \(n = k + 1\). By the principle of mathematical induction the statement is true for all \(n \in \N\). Marks: 1 base case; 1 adding the \((k + 1)\)th term to the assumption; 1 simplifying to the required form and concluding.`),
])

S.ex1(CX, 'proficient', t`Let \(P(z) = z^3 + z - 10\), where \(z \in \C\).`, [
  part('a', t`Show that \(z = 2\) is a solution of \(P(z) = 0\).`, 1,
    t`\(P(2) = 8 + 2 - 10 = 0\)`,
    t`Substitute \(z = 2\). (By the factor theorem, \(z - 2\) is then a factor of \(P(z)\).)`),
  part('b', t`Hence, find the other two solutions of \(P(z) = 0\).`, 2,
    t`\(z = -1 + 2i\) and \(z = -1 - 2i\)`,
    t`\(P(z) = (z - 2)(z^2 + 2z + 5)\), found by division or by matching coefficients. \(z^2 + 2z + 5 = (z + 1)^2 + 4 = 0\) gives \(z = -1 \pm 2i\). 1 mark for the quadratic factor, 1 mark for the solutions.`),
  part('c', t`The three solutions of \(P(z) = 0\) are represented by points in the complex plane. Find the area of the triangle that has these points as its vertices.`, 1,
    t`6 square units`,
    t`The vertices are \((2, 0)\), \((-1, 2)\) and \((-1, -2)\). The side from \((-1, 2)\) to \((-1, -2)\) has length 4 and the perpendicular distance from \((2, 0)\) to it is 3, so the area is \(\frac{1}{2} \times 4 \times 3 = 6\).`),
])

S.ex1(FG, 'proficient', t`Let \(f: (0, \pi)\setminus\left\{\frac{\pi}{2}\right\} \to \R\), \(f(x) = \cosec(2x) + 1\).`, [
  part('a', t`Sketch the graph of \(y = f(x)\) on the axes below. Label the asymptotes with their equations and the turning points with their coordinates.`, 2,
    t`Asymptotes \(x = 0\), \(x = \frac{\pi}{2}\), \(x = \pi\); local minimum \(\left(\frac{\pi}{4}, 2\right)\); local maximum \(\left(\frac{3\pi}{4}, 0\right)\).`,
    t`\(\cosec(2x) = \frac{1}{\sin(2x)}\) is undefined where \(\sin(2x) = 0\): \(x = 0, \frac{\pi}{2}, \pi\). On \(\left(0, \frac{\pi}{2}\right)\) the graph is a U-shape with minimum \(1 + 1 = 2\) at \(x = \frac{\pi}{4}\); on \(\left(\frac{\pi}{2}, \pi\right)\) it is an inverted U with maximum \(-1 + 1 = 0\) at \(x = \frac{3\pi}{4}\), touching the \(x\)-axis there. 1 mark for the asymptotes, 1 mark for the shape with the turning points.`,
    { diagram: { ...axes({ xMin: 0, xMax: 3.3, yMin: -4, yMax: 6, yStep: 1 }), xTickLabels: piTicks(1, 4, 4) } }),
  part('b', t`Solve the equation \(f(x) = 3\).`, 2,
    t`\(x = \dfrac{\pi}{12}\) or \(x = \dfrac{5\pi}{12}\)`,
    t`\(\cosec(2x) = 2\), so \(\sin(2x) = \frac{1}{2}\) with \(2x \in (0, 2\pi)\): \(2x = \frac{\pi}{6}\) or \(\frac{5\pi}{6}\). 1 mark for \(\sin(2x) = \frac{1}{2}\), 1 mark for both solutions. Common error: giving only \(\frac{\pi}{12}\).`),
  part('c', t`State the range of \(f\).`, 1,
    t`\((-\infty, 0] \cup [2, \infty)\)`,
    t`\(\cosec(2x)\) takes every value in \((-\infty, -1] \cup [1, \infty)\) on this domain; add 1.`),
])

S.ex1(CA, 'proficient', t`The region enclosed by the graphs of \(y = x^2\) and \(y = 2x\) is rotated about the \(y\)-axis to form a solid of revolution.`, [
  part('a', t`Find the coordinates of the points of intersection of the two graphs.`, 1,
    t`\((0, 0)\) and \((2, 4)\)`,
    t`\(x^2 = 2x\) gives \(x = 0\) or \(x = 2\).`),
  part('b', t`Find the volume of the solid of revolution.`, 3,
    t`\(\dfrac{8\pi}{3}\) cubic units`,
    t`About the \(y\)-axis, for \(0 \le y \le 4\) the outer radius is \(x = \sqrt{y}\) (from \(y = x^2\)) and the inner radius is \(x = \frac{y}{2}\) (from \(y = 2x\)). \[V = \pi\int_0^4 \left(y - \frac{y^2}{4}\right)dy = \pi\left[\frac{y^2}{2} - \frac{y^3}{12}\right]_0^4 = \pi\left(8 - \frac{16}{3}\right) = \frac{8\pi}{3}.\] Marks: 1 for expressing the radii in terms of \(y\); 1 for the integral; 1 for the value. Common error: using the \(x\)-axis formula \(\pi\int y^2\,dx\).`),
])

S.ex1(CA, 'proficient', t`A particle moves in a straight line. When it is \(x\) m from a fixed point \(O\), its acceleration is \((2x + 3)\) m s⁻². When \(x = 0\) its velocity is 2 m s⁻¹, and the particle moves in the positive direction throughout. Find the velocity of the particle when \(x = 1\).`, [
  part('', '', 3,
    t`\(v = 2\sqrt{3}\) m s⁻¹ when \(x = 1\)`,
    t`Use \(a = \dfrac{d}{dx}\left(\frac{1}{2}v^2\right)\): \(\frac{1}{2}v^2 = x^2 + 3x + c\), and \(v = 2\) at \(x = 0\) gives \(c = 2\). So \(v^2 = 2x^2 + 6x + 4\), and at \(x = 1\), \(v^2 = 12\); \(v > 0\), so \(v = 2\sqrt{3}\). Marks: 1 for the antiderivative of \(\frac{1}{2}v^2\); 1 for the constant; 1 for the value.`),
])

S.ex1(CA, 'proficient', t`Find the length of the curve \(y = \dfrac{2}{3}x^{\frac{3}{2}}\) from \(x = 0\) to \(x = 3\).`, [
  part('', '', 3,
    t`\(\dfrac{14}{3}\)`,
    t`\(\dfrac{dy}{dx} = x^{\frac{1}{2}}\), so \(1 + \left(\dfrac{dy}{dx}\right)^2 = 1 + x\) and \[L = \int_0^3 \sqrt{1 + x}\,dx = \left[\frac{2}{3}(1 + x)^{\frac{3}{2}}\right]_0^3 = \frac{2}{3}(8 - 1) = \frac{14}{3}.\] Marks: 1 for \(\frac{dy}{dx}\); 1 for the integral; 1 for the value.`),
])

S.ex1(CA, 'proficient', t`Let \(g(x) = \dfrac{5x + 1}{(x - 1)(x + 2)}\).`, [
  part('a', t`Express \(g(x)\) in partial fractions.`, 1,
    t`\(g(x) = \dfrac{2}{x - 1} + \dfrac{3}{x + 2}\)`,
    t`\(5x + 1 = A(x + 2) + B(x - 1)\): \(x = 1\) gives \(A = 2\); \(x = -2\) gives \(B = 3\).`),
  part('b', t`Hence, evaluate \(\displaystyle\int_2^3 g(x)\,dx\), giving your answer in the form \(\loge\left(\dfrac{a}{b}\right)\), where \(a, b \in \Z^+\).`, 2,
    t`\(\loge\left(\dfrac{125}{16}\right)\)`,
    t`\(\Big[2\loge|x - 1| + 3\loge|x + 2|\Big]_2^3 = (2\loge(2) + 3\loge(5)) - (0 + 3\loge(4)) = 3\loge(5) - 4\loge(2) = \loge\left(\frac{125}{16}\right)\). 1 mark for the antiderivative, 1 mark for the answer.`),
])

S.ex1(ST, 'proficient', t`The lengths of bolts made by a machine are normally distributed with a standard deviation of 0.2 cm. The machine is meant to produce bolts with a mean length of 5 cm. To check it, a random sample of 16 bolts is measured, and the sample mean length is 5.1 cm. A two-tailed test is conducted at the 5% level of significance.`, [
  part('a', t`Write down suitable null and alternative hypotheses for the test.`, 1,
    t`\(H_0: \mu = 5\), \(H_1: \mu \ne 5\)`,
    t`\(\mu\) is the mean length (cm) of all bolts made by the machine. The test is two-tailed because a change in either direction matters.`),
  part('b', t`Find the value of the test statistic \(z = \dfrac{\bar{x} - \mu}{\sigma/\sqrt{n}}\).`, 1,
    t`\(z = 2\)`,
    t`\(\frac{\sigma}{\sqrt{n}} = \frac{0.2}{4} = 0.05\), so \(z = \frac{5.1 - 5}{0.05} = 2\).`),
  part('c', t`Given that \(\Pr(Z > 2) \approx 0.023\), find the \(p\) value of the test and state its conclusion, giving a reason.`, 2,
    t`\(p \approx 0.046 < 0.05\), so reject \(H_0\): there is evidence the mean length is not 5 cm.`,
    t`For a two-tailed test \(p = \Pr(|Z| \ge 2) = 2 \times 0.023 = 0.046\). 1 mark for doubling the tail probability, 1 mark for the conclusion with the comparison to 0.05. Common error: using the one-tailed value 0.023 (the conclusion happens to agree here, but the \(p\) value is wrong).`),
])

S.ex1(VE, 'proficient', t`The line \(L\) has vector equation \(\tv{r}(t) = \ii + 2\kk + t(2\ii - \jj + 2\kk)\), \(t \in \R\), and the plane \(\Pi\) has Cartesian equation \(x + 2y - 2z = 5\).`, [
  part('a', t`Find the coordinates of the point where \(L\) meets \(\Pi\).`, 2,
    t`\((-3, 2, -2)\)`,
    t`Substitute \(x = 1 + 2t\), \(y = -t\), \(z = 2 + 2t\): \(1 + 2t - 2t - 4 - 4t = 5\), so \(-3 - 4t = 5\) and \(t = -2\). 1 mark for \(t\), 1 mark for the point.`),
  part('b', t`Find the sine of the acute angle between \(L\) and \(\Pi\).`, 2,
    t`\(\dfrac{4}{9}\)`,
    t`The angle \(\theta\) between a line and a plane satisfies \(\sin(\theta) = \dfrac{|\tv{d} \cdot \tv{n}|}{|\tv{d}||\tv{n}|}\), where \(\tv{n}\) is the normal: \(\dfrac{|2 - 2 - 4|}{3 \times 3} = \dfrac{4}{9}\). 1 mark for the scalar product, 1 mark for the value. Common error: giving the cosine, which is the angle with the normal.`),
  part('c', t`Find the distance from the point \(A(1, 0, 2)\) on \(L\) to the plane \(\Pi\).`, 1,
    t`\(\dfrac{8}{3}\)`,
    t`\(\dfrac{|1 + 0 - 4 - 5|}{\sqrt{1 + 4 + 4}} = \dfrac{8}{3}\). (Check: \(|\overrightarrow{AP}|\sin(\theta) = 6 \times \frac{4}{9} = \frac{8}{3}\), where \(P\) is the point from part a.)`),
])

S.ex1(VE, 'proficient', t`The position vector of a particle at time \(t\) seconds is \(\tv{r}(t) = 3\cos(t)\ii + 2\sin(t)\jj\), \(t \ge 0\), with components measured in metres.`, [
  part('a', t`Find the Cartesian equation of the path of the particle.`, 1,
    t`\(\dfrac{x^2}{9} + \dfrac{y^2}{4} = 1\)`,
    t`\(\cos(t) = \frac{x}{3}\), \(\sin(t) = \frac{y}{2}\) and \(\cos^2(t) + \sin^2(t) = 1\).`),
  part('b', t`Show that the acceleration of the particle is \(\ddot{\tv{r}}(t) = -\tv{r}(t)\).`, 1,
    t`\(\ddot{\tv{r}}(t) = -3\cos(t)\ii - 2\sin(t)\jj = -\tv{r}(t)\)`,
    t`\(\dot{\tv{r}}(t) = -3\sin(t)\ii + 2\cos(t)\jj\); differentiate again.`),
  part('c', t`Find all values of \(t\) in the interval \([0, 2\pi]\) for which the velocity of the particle is perpendicular to its position vector.`, 2,
    t`\(t = 0, \dfrac{\pi}{2}, \pi, \dfrac{3\pi}{2}, 2\pi\)`,
    t`\(\tv{r} \cdot \dot{\tv{r}} = -9\sin(t)\cos(t) + 4\sin(t)\cos(t) = -5\sin(t)\cos(t) = -\frac{5}{2}\sin(2t)\), which is zero when \(2t\) is a multiple of \(\pi\). These are the ends of the axes of the ellipse. 1 mark for the scalar product, 1 mark for all five values.`),
  part('d', t`Find the maximum speed of the particle and the values of \(t \in [0, 2\pi]\) at which it occurs.`, 2,
    t`3 m s⁻¹, at \(t = \dfrac{\pi}{2}\) and \(t = \dfrac{3\pi}{2}\)`,
    t`\(|\dot{\tv{r}}|^2 = 9\sin^2(t) + 4\cos^2(t) = 4 + 5\sin^2(t)\), which is greatest (9) when \(\sin^2(t) = 1\). 1 mark for the speed, 1 mark for the times.`),
])

// ════════════════ Examination 2 — Section A ════════════════

S.mc(PF, 'developing', t`The converse of the statement ‘If a quadrilateral is a square, then its diagonals are equal in length’ is`,
  ['If the diagonals of a quadrilateral are equal in length, then it is a square.', 'If a quadrilateral is not a square, then its diagonals are not equal in length.', 'If the diagonals of a quadrilateral are not equal in length, then it is not a square.', 'A quadrilateral is a square and its diagonals are not equal in length.'], 'A',
  t`The converse of “if \(P\) then \(Q\)” is “if \(Q\) then \(P\)”. B is the inverse, C is the contrapositive (equivalent to the original) and D is the negation. The converse here is false: a rectangle has equal diagonals.`)

S.mc(PF, 'developing', t`A proof by contradiction that \(\sqrt{2} + \sqrt{3}\) is irrational would begin by assuming that`,
  [t`\(\sqrt{2}\) and \(\sqrt{3}\) are both rational`, t`\(\sqrt{2} + \sqrt{3}\) is irrational`, t`\(\sqrt{2} + \sqrt{3}\) is rational`, t`\(\left(\sqrt{2} + \sqrt{3}\right)^2\) is rational`], 'C',
  t`A proof by contradiction assumes the negation of the statement to be proved and derives a contradiction. The negation of “\(\sqrt{2} + \sqrt{3}\) is irrational” is “\(\sqrt{2} + \sqrt{3}\) is rational”.`)

S.mc(FG, 'proficient', t`The graph of \(y = \dfrac{x}{x^2 + bx + 4}\), where \(b \in \R\), has exactly one vertical asymptote when`,
  [t`\(b = 0\)`, t`\(b = \pm 2\)`, t`\(-4 < b < 4\)`, t`\(b = \pm 4\)`], 'D',
  t`A single vertical asymptote needs the denominator to have exactly one (repeated) root: \(b^2 - 16 = 0\), so \(b = \pm 4\). The root is \(x = \mp 2\), which is not a zero of the numerator. For \(-4 < b < 4\) there are no vertical asymptotes.`)

S.mc(FG, 'proficient', t`For \(0 \le x \le 2\pi\), the graph of \(y = \sec\left(x - \dfrac{\pi}{4}\right)\) has vertical asymptotes with equations`,
  [t`\(x = \dfrac{\pi}{4}\) and \(x = \dfrac{5\pi}{4}\)`, t`\(x = \dfrac{3\pi}{4}\) and \(x = \dfrac{7\pi}{4}\)`, t`\(x = \dfrac{\pi}{2}\) and \(x = \dfrac{3\pi}{2}\)`, t`\(x = \dfrac{\pi}{4}\) and \(x = \dfrac{3\pi}{4}\)`], 'B',
  t`\(\sec(u)\) is undefined where \(\cos(u) = 0\): \(x - \frac{\pi}{4} = \frac{\pi}{2}\) or \(\frac{3\pi}{2}\), so \(x = \frac{3\pi}{4}\) or \(\frac{7\pi}{4}\). C ignores the translation; A gives the zeros of \(\sin\left(x - \frac{\pi}{4}\right)\).`)

S.mc(CX, 'proficient', t`One of the solutions of \(z^4 = -8 + 8\sqrt{3}i\) is`,
  [t`\(2\cis\left(\dfrac{\pi}{6}\right)\)`, t`\(2\cis\left(\dfrac{\pi}{3}\right)\)`, t`\(4\cis\left(\dfrac{\pi}{6}\right)\)`, t`\(2\cis\left(\dfrac{\pi}{12}\right)\)`], 'A',
  t`\(-8 + 8\sqrt{3}i = 16\cis\left(\frac{2\pi}{3}\right)\), so \(z = 16^{\frac{1}{4}}\cis\left(\frac{2\pi}{3} \times \frac{1}{4} + \frac{k\pi}{2}\right) = 2\cis\left(\frac{\pi}{6} + \frac{k\pi}{2}\right)\). With \(k = 0\): \(2\cis\left(\frac{\pi}{6}\right)\). Check: \(2^4\cis\left(\frac{4\pi}{6}\right) = 16\cis\left(\frac{2\pi}{3}\right)\). C forgets the fourth root of the modulus.`)

S.mc(CX, 'proficient', t`In the complex plane, the set of points satisfying \(|z - 3| = 2|z|\) is`,
  [t`the circle with centre \(1\) and radius \(2\)`, t`the line \(\operatorname{Re}(z) = 1\)`, t`the circle with centre \(-1\) and radius \(2\)`, t`the circle with centre \(-1\) and radius \(4\)`], 'C',
  t`With \(z = x + iy\): \((x - 3)^2 + y^2 = 4(x^2 + y^2)\), so \(3x^2 + 3y^2 + 6x - 9 = 0\), \(x^2 + 2x + y^2 = 3\) and \((x + 1)^2 + y^2 = 4\): centre \(-1\), radius 2. (\(|z - a| = |z - b|\) gives a line; a ratio other than 1 gives a circle.)`)

S.mc(CX, 'proficient', t`For any non-zero complex number \(z\), the expression \(\dfrac{z}{\bar{z}} + \dfrac{\bar{z}}{z}\) is always`,
  [t`equal to 2`, t`a real number`, t`purely imaginary`, t`equal to 0`], 'B',
  t`With \(z = r\cis(\theta)\), \(\frac{z}{\bar{z}} = \cis(2\theta)\) and \(\frac{\bar{z}}{z} = \cis(-2\theta)\), so the sum is \(2\cos(2\theta)\), which is real. It equals 2 only when \(z\) is real, and 0 when \(\theta = \pm\frac{\pi}{4}\) or \(\pm\frac{3\pi}{4}\).`)

S.mc(CA, 'proficient', t`Euler’s method with a step size of 0.5 is used to approximate the solution of \(\dfrac{dy}{dx} = \sqrt{x + y}\), where \(y(1) = 3\). The approximation to \(y(2)\), correct to two decimal places, is`,
  ['4.00', '5.00', '5.12', '5.17'], 'D',
  t`\(y_1 = 3 + 0.5\sqrt{1 + 3} = 4\) at \(x = 1.5\); \(y_2 = 4 + 0.5\sqrt{1.5 + 4} \approx 5.17\) at \(x = 2\). 4.00 stops after one step; 5.00 reuses the first gradient; 5.12 forgets to advance \(x\) in the second step.`)

S.mc(CA, 'proficient', t`A population \(P\) is modelled by \(\dfrac{dP}{dt} = 0.3P\left(1 - \dfrac{P}{800}\right)\), where \(P(0) = 100\) and \(t\) is in years. The population is increasing most rapidly when \(t\), correct to two decimal places, equals`,
  ['3.24', '4.00', '6.49', '400.00'], 'C',
  t`The rate \(0.3P\left(1 - \frac{P}{800}\right)\) is a quadratic in \(P\), greatest at \(P = 400\). The solution is \(P = \dfrac{800}{1 + 7e^{-0.3t}}\), and \(P = 400\) when \(7e^{-0.3t} = 1\): \(t = \frac{\loge(7)}{0.3} \approx 6.49\). 400 is the population at that time, not the time; 3.24 uses 0.6 in place of 0.3.`)

S.mc(CA, 'proficient', t`Water is poured at 0.5 m³ per minute into a tank in the shape of an inverted right circular cone with radius 2 m and height 4 m. When the depth of water is 1 m, the depth is increasing, in metres per minute, at the rate`,
  [t`\(\dfrac{1}{8\pi}\)`, t`\(\dfrac{2}{\pi}\)`, t`\(\dfrac{1}{2\pi}\)`, t`\(\dfrac{8}{\pi}\)`], 'B',
  t`By similar triangles \(r = \frac{h}{2}\), so \(V = \frac{1}{3}\pi\left(\frac{h}{2}\right)^2 h = \frac{\pi h^3}{12}\) and \(\frac{dV}{dh} = \frac{\pi h^2}{4}\). Then \(\frac{dh}{dt} = \frac{dV}{dt} \div \frac{dV}{dh} = 0.5 \div \frac{\pi}{4} = \frac{2}{\pi}\) at \(h = 1\). D inverts the chain rule.`)

S.mc(CA, 'developing', t`\(\displaystyle\int_0^1 x^2e^x\,dx\) is equal to`,
  [t`\(e - 2\)`, t`\(1\)`, t`\(e - 1\)`, t`\(2e - 2\)`], 'A',
  t`By parts twice: \(\int x^2e^x\,dx = x^2e^x - 2\int xe^x\,dx = (x^2 - 2x + 2)e^x + c\). Evaluating: \(e(1 - 2 + 2) - 2 = e - 2\).`)

S.mc(CA, 'proficient', t`The curve \(y = \sqrt{x}\), \(0 \le x \le 4\), is rotated about the \(x\)-axis. The area of the curved surface generated is given by`,
  [t`\(2\pi\displaystyle\int_0^4 \sqrt{4x + 1}\,dx\)`, t`\(\pi\displaystyle\int_0^4 x\,dx\)`, t`\(\pi\displaystyle\int_0^4 \sqrt{x + 1}\,dx\)`, t`\(\pi\displaystyle\int_0^4 \sqrt{4x + 1}\,dx\)`], 'D',
  t`\(S = 2\pi\int_0^4 y\sqrt{1 + \left(\frac{dy}{dx}\right)^2}\,dx\) with \(\frac{dy}{dx} = \frac{1}{2\sqrt{x}}\): \(2\pi\sqrt{x}\sqrt{1 + \frac{1}{4x}} = 2\pi\sqrt{x + \frac{1}{4}} = \pi\sqrt{4x + 1}\). B is the volume of the solid, not its surface area.`)

S.mc(CA, 'developing', t`A car travelling at 25 m s⁻¹ brakes with constant deceleration and comes to rest after travelling 50 m. The time taken to stop, in seconds, is`,
  ['2', '4', '6.25', '8'], 'B',
  t`\(v^2 = u^2 + 2as\): \(0 = 625 + 100a\), so \(a = -6.25\). Then \(t = \frac{v - u}{a} = \frac{-25}{-6.25} = 4\). (Or \(s = \frac{1}{2}(u + v)t\): \(50 = 12.5t\).) 6.25 is the deceleration, not the time.`)

S.mc(CA, 'proficient', t`Which one of the following is a solution of the differential equation \(\dfrac{d^2y}{dx^2} + 4y = 0\)?`,
  [t`\(y = e^{2x}\)`, t`\(y = \sin(4x)\)`, t`\(y = 3\sin(2x)\)`, t`\(y = \cos\left(\frac{x}{2}\right)\)`], 'C',
  t`For \(y = 3\sin(2x)\), \(\frac{d^2y}{dx^2} = -12\sin(2x) = -4y\). For \(e^{2x}\), \(y'' = 4y\) (wrong sign); for \(\sin(4x)\), \(y'' = -16y\); for \(\cos\left(\frac{x}{2}\right)\), \(y'' = -\frac{1}{4}y\).`)

S.mc(VE, 'proficient', t`The acute angle between the planes \(2x - y + 2z = 3\) and \(x + 2y + 2z = 1\), correct to one decimal place, is`,
  ['26.4°', '48.2°', '63.6°', '116.4°'], 'C',
  t`The angle between planes is the angle between their normals: \(\cos(\theta) = \frac{|2 - 2 + 4|}{3 \times 3} = \frac{4}{9}\), so \(\theta \approx 63.6^\circ\). 26.4° is its complement (the formula for a line and a plane); 116.4° is obtuse.`)

S.mc(VE, 'developing', t`The vector of magnitude 6 in the same direction as \(2\ii - \jj + 2\kk\) is`,
  [t`\(2\ii - \jj + 2\kk\)`, t`\(4\ii - 2\jj + 4\kk\)`, t`\(12\ii - 6\jj + 12\kk\)`, t`\(\frac{2}{3}\ii - \frac{1}{3}\jj + \frac{2}{3}\kk\)`], 'B',
  t`\(|2\ii - \jj + 2\kk| = 3\), so the unit vector is \(\frac{1}{3}(2\ii - \jj + 2\kk)\) (option D); multiplying by 6 gives \(4\ii - 2\jj + 4\kk\). C multiplies by 6 without first dividing by the magnitude.`)

S.mc(VE, 'proficient', t`The plane with vector equation \(\tv{r}(s, t) = \ii + \kk + s(\ii + \jj) + t(\jj + \kk)\), \(s, t \in \R\), has Cartesian equation`,
  [t`\(x - y + z = 2\)`, t`\(x + y + z = 2\)`, t`\(x - y + z = 0\)`, t`\(x - y - z = 0\)`], 'A',
  t`A normal is \((\ii + \jj) \times (\jj + \kk) = \ii - \jj + \kk\). The plane contains \((1, 0, 1)\), so \(x - y + z = 1 - 0 + 1 = 2\). C passes through the origin, which is not on the plane.`)

S.mc(VE, 'proficient', t`A particle has acceleration \(\ddot{\tv{r}}(t) = -4\cos(2t)\ii - 4\sin(2t)\jj\), \(t \ge 0\). Initially it is at the point with position vector \(\ii\) and its velocity is \(2\jj\). The path of the particle is`,
  ['the circle with centre O and radius 1', 'the circle with centre O and radius 2', 'the ellipse with semi-axes 1 and 2', 'a straight line through the point (1, 0)'], 'A',
  t`Integrating with the initial velocity: \(\dot{\tv{r}} = -2\sin(2t)\ii + 2\cos(2t)\jj\) (which is \(2\jj\) at \(t = 0\)). Integrating again with \(\tv{r}(0) = \ii\): \(\tv{r} = \cos(2t)\ii + \sin(2t)\jj\), so \(x^2 + y^2 = 1\). The speed is constant at 2, which is why B is tempting.`)

S.mc(ST, 'developing', t`The independent random variables \(X\) and \(Y\) have \(\Var(X) = 4\) and \(\Var(Y) = 9\). \(\Var(3X - 2Y)\) is`,
  ['0', '30', '36', '72'], 'D',
  t`\(\Var(aX + bY) = a^2\Var(X) + b^2\Var(Y)\) for independent variables, so \(9 \times 4 + 4 \times 9 = 72\). The variances add even though the variables are subtracted; 0 subtracts them, 30 forgets to square the coefficients, and 36 counts only \(3X\).`)

S.mc(ST, 'proficient', t`A 90% confidence interval for a population mean \(\mu\), calculated from a random sample, is \((12.4, 15.6)\). Which one of the following statements is correct?`,
  [t`There is a 90% probability that \(\mu\) lies between 12.4 and 15.6.`, t`90% of the sample values lie between 12.4 and 15.6.`, t`The sample mean lies between 12.4 and 15.6 with probability 0.9.`, t`About 90% of intervals constructed in this way from repeated random samples would contain \(\mu\).`], 'D',
  t`The 90% describes the method: in repeated sampling about 90% of such intervals capture \(\mu\). A particular interval either contains \(\mu\) or it does not, so A is not correct. The sample mean is the centre of the interval, 14, with certainty.`)

// ════════════════ Examination 2 — Section B ════════════════

const slide = x => (x <= 1 ? 4 - 2 * Math.atan(x) : 0.25 * (x - 3) ** 2 + 3 - Math.PI / 2)
S.ex2(FG, 'advanced', t`The side profile of a playground slide is shown below. For \(0 \le x \le 1\) the profile is modelled by \(y = 4 - 2\tan^{-1}(x)\), and for \(1 < x \le 3\) by \(y = a(x - 3)^2 + k\), where \(a, k \in \R\). The two sections join smoothly at \(x = 1\), and \(x\) and \(y\) are measured in metres.`, [
  part('a', t`Show that the gradient of the first section at \(x = 1\) is \(-1\).`, 1,
    t`\(\dfrac{dy}{dx} = -\dfrac{2}{1 + x^2} = -1\) at \(x = 1\)`,
    t`\(\frac{d}{dx}\left(\tan^{-1}(x)\right) = \frac{1}{1 + x^2}\).`),
  part('b', t`Find the exact values of \(a\) and \(k\).`, 3,
    t`\(a = \dfrac{1}{4}\), \(k = 3 - \dfrac{\pi}{2}\)`,
    t`Smooth join: equal gradients, \(2a(1 - 3) = -1\), so \(a = \frac{1}{4}\). Equal heights: \(a(1 - 3)^2 + k = 4 - 2\tan^{-1}(1) = 4 - \frac{\pi}{2}\), so \(1 + k = 4 - \frac{\pi}{2}\) and \(k = 3 - \frac{\pi}{2}\). 1 mark for each condition, 1 mark for both values.`),
  part('c', t`Find \(\dfrac{d^2y}{dx^2}\) for each section at \(x = 1\), and explain whether the second derivative is continuous at \(x = 1\).`, 2,
    t`First section: 1; second section: \(\frac{1}{2}\). Not continuous — the curvature changes abruptly at the join.`,
    t`For \(y = 4 - 2\tan^{-1}(x)\), \(\frac{d^2y}{dx^2} = \frac{4x}{(1 + x^2)^2}\), which is 1 at \(x = 1\); for the quadratic it is \(2a = \frac{1}{2}\). The first derivatives agree but the second derivatives do not. 1 mark for both values, 1 mark for the conclusion.`),
  part('d', t`Find the length of the slide from \(x = 0\) to \(x = 3\), in metres correct to two decimal places.`, 2,
    t`4.17 m`,
    t`\(\displaystyle\int_0^1\sqrt{1 + \frac{4}{(1 + x^2)^2}}\,dx + \int_1^3\sqrt{1 + \frac{(x - 3)^2}{4}}\,dx \approx 4.17\) (by CAS). 1 mark for setting up both integrals, 1 mark for the value.`),
  part('e', t`Find the angle, in degrees correct to one decimal place, that the slide makes with the horizontal at \(x = 0\).`, 1,
    t`63.4°`,
    t`The gradient at \(x = 0\) is \(-2\), so the angle is \(\tan^{-1}(2) \approx 63.4^\circ\).`),
  part('f', t`The region between the slide and the ground \((y = 0)\), for \(0 \le x \le 3\), is a solid panel. Find its area in square metres, correct to two decimal places.`, 1,
    t`6.65 m²`,
    t`\(\displaystyle\int_0^1\left(4 - 2\tan^{-1}(x)\right)dx + \int_1^3\left(\frac{1}{4}(x - 3)^2 + 3 - \frac{\pi}{2}\right)dx \approx 6.65\).`),
], { diagram: { kind: 'function_graph', xMin: 0, xMax: 3.4, yMin: 0, yMax: 4.4, xStep: 1, yStep: 1, xLabel: 'x (m)', yLabel: 'y (m)', grid: false, width: 280, curves: [{ points: curve(slide, 0, 3, 120) }] } })

S.ex2(CX, 'advanced', t`Let \(w = \cis\left(\dfrac{\pi}{3}\right)\).`, [
  part('a', t`Show that \(w\) is a solution of \(z^6 = 1\).`, 1,
    t`\(w^6 = \cis(2\pi) = 1\)`,
    t`By de Moivre’s theorem, \(\left(\cis\left(\frac{\pi}{3}\right)\right)^6 = \cis\left(\frac{6\pi}{3}\right) = \cis(2\pi) = 1\).`),
  part('b', t`The six solutions of \(z^6 = 1\) are the vertices of a regular hexagon in the complex plane. Find the exact area of the hexagon.`, 2,
    t`\(\dfrac{3\sqrt{3}}{2}\)`,
    t`The vertices lie on the unit circle, \(\frac{\pi}{3}\) apart, so the hexagon is six equilateral triangles of side 1, each of area \(\frac{\sqrt{3}}{4}\). 1 mark for the method, 1 mark for the area.`),
  part('c', t`Explain why \(1 + w + w^2 + w^3 + w^4 + w^5 = 0\).`, 1,
    t`It is a geometric series: \(\dfrac{w^6 - 1}{w - 1} = 0\) since \(w^6 = 1\) and \(w \ne 1\).`,
    t`Alternatively, the six vectors from the origin to the vertices of the regular hexagon sum to zero by symmetry.`),
  part('d', t`Find all the solutions of \(z^6 = -64\), giving them in Cartesian form.`, 2,
    t`\(z = \pm\sqrt{3} \pm i\) (all four sign choices) and \(z = \pm 2i\)`,
    t`\(-64 = 64\cis(\pi)\), so \(z = 2\cis\left(\frac{\pi}{6} + \frac{k\pi}{3}\right)\), \(k = 0, \ldots, 5\): arguments \(\pm\frac{\pi}{6}, \pm\frac{\pi}{2}, \pm\frac{5\pi}{6}\). 1 mark for the polar form, 1 mark for all six in Cartesian form.`),
  part('e', t`Find the area of the region \(\{z \in \C : |z| \le 2\} \cap \left\{z \in \C : \frac{\pi}{6} \le \Arg(z) \le \frac{\pi}{2}\right\}\).`, 1,
    t`\(\dfrac{2\pi}{3}\)`,
    t`A sector of radius 2 and angle \(\frac{\pi}{3}\): \(\frac{1}{2} \times 4 \times \frac{\pi}{3} = \frac{2\pi}{3}\). Its corners are two of the solutions from part d.`),
  part('f', t`The solution \(\sqrt{3} + i\) is multiplied by \(w\). Find the result in Cartesian form, and describe the transformation of the complex plane that multiplication by \(w\) represents.`, 1,
    t`\(2i\); an anticlockwise rotation of \(\frac{\pi}{3}\) about the origin.`,
    t`\(\left(\sqrt{3} + i\right)w = 2\cis\left(\frac{\pi}{6}\right)\cis\left(\frac{\pi}{3}\right) = 2\cis\left(\frac{\pi}{2}\right) = 2i\).`),
  part('g', t`Find the number of complex numbers \(z\) that satisfy \(\bar{z} = z^5\), and describe them.`, 2,
    t`7: \(z = 0\) and the six solutions of \(z^6 = 1\).`,
    t`Taking moduli, \(|z| = |z|^5\), so \(|z| = 0\) or \(|z| = 1\). If \(|z| = 1\) then \(\bar{z} = \frac{1}{z}\), so the equation becomes \(z^6 = 1\), which has six solutions. 1 mark for \(|z| \in \{0, 1\}\), 1 mark for the count of 7.`),
])

S.ex2(CA, 'advanced', t`The inside of a vase is formed by rotating the curve \(x = 1 + \dfrac{y^2}{16}\), \(0 \le y \le 8\), about the \(y\)-axis, where \(x\) and \(y\) are measured in centimetres. The vase has a flat base at \(y = 0\).`, [
  part('a', t`Write down a definite integral that gives the volume of water in the vase when the depth of water is \(h\) cm.`, 1,
    t`\(V = \pi\displaystyle\int_0^h\left(1 + \frac{y^2}{16}\right)^2dy\)`,
    t`Discs of radius \(x = 1 + \frac{y^2}{16}\) stacked from the base to the water surface.`),
  part('b', t`Find the volume of the vase, in cm³ correct to two decimal places.`, 1,
    t`172.58 cm³`,
    t`\(\pi\int_0^8\left(1 + \frac{y^2}{16}\right)^2dy = \pi\left(8 + \frac{512}{24} + \frac{32768}{1280}\right) \approx 172.58\).`),
  part('c', t`Water is poured into the vase at a constant rate of 5 cm³ s⁻¹. Find the rate, in cm s⁻¹ correct to three decimal places, at which the depth is increasing when the depth is 4 cm.`, 2,
    t`0.398 cm s⁻¹`,
    t`\(\frac{dV}{dh} = \pi\left(1 + \frac{h^2}{16}\right)^2 = 4\pi\) at \(h = 4\), so \(\frac{dh}{dt} = \frac{5}{4\pi} \approx 0.398\). 1 mark for \(\frac{dV}{dh}\) (from the fundamental theorem), 1 mark for the rate.`),
  part('d', t`Find the time taken to fill the vase, in seconds correct to one decimal place.`, 1,
    t`34.5 s`,
    t`\(\frac{172.578}{5} \approx 34.5\).`),
  part('e', t`Find the depth of water, in cm correct to two decimal places, when the vase is half full by volume.`, 2,
    t`6.53 cm`,
    t`Solve \(\pi\left(h + \frac{h^3}{24} + \frac{h^5}{1280}\right) = \frac{172.578}{2}\) for \(0 < h < 8\): \(h \approx 6.53\). The vase widens upwards, so half the volume is reached well above half the height. 1 mark for the equation, 1 mark for the value.`),
  part('f', t`Find the depth of water when the radius of the water surface is 3 cm.`, 1,
    t`\(4\sqrt{2} \approx 5.66\) cm`,
    t`\(1 + \frac{h^2}{16} = 3\) gives \(h^2 = 32\).`),
  part('g', t`The inside curved surface of the vase is to be glazed. Find its area in cm², correct to one decimal place.`, 2,
    t`142.2 cm²`,
    t`About the \(y\)-axis: \(S = \displaystyle\int_0^8 2\pi x\sqrt{1 + \left(\frac{dx}{dy}\right)^2}\,dy\) with \(x = 1 + \frac{y^2}{16}\) and \(\frac{dx}{dy} = \frac{y}{8}\), giving \(S \approx 142.2\). 1 mark for the integral, 1 mark for the value.`),
])

S.ex2(CA, 'advanced', t`A rumour spreads through a school of 1200 students. The number of students, \(N\), who have heard the rumour \(t\) hours after 8 am is modelled by the differential equation \(\dfrac{dN}{dt} = kN(1200 - N)\), where \(k\) is a positive constant. At 8 am, 20 students have heard the rumour.`, [
  part('a', t`Show that \(N = \dfrac{1200}{1 + 59e^{-1200kt}}\) satisfies the differential equation and the initial condition.`, 2,
    t`\(N(0) = \frac{1200}{60} = 20\), and \(\frac{dN}{dt} = \frac{1200 \times 59 \times 1200k\,e^{-1200kt}}{(1 + 59e^{-1200kt})^2} = kN(1200 - N)\).`,
    t`\(1200 - N = \frac{1200 \times 59e^{-1200kt}}{1 + 59e^{-1200kt}}\), so \(kN(1200 - N) = \frac{k \times 1200^2 \times 59e^{-1200kt}}{(1 + 59e^{-1200kt})^2}\), which matches the derivative. (Solving by separation of variables and partial fractions is also acceptable.) 1 mark for the initial condition, 1 mark for verifying the differential equation.`),
  part('b', t`At 10 am, 200 students have heard the rumour. Show that \(k = \dfrac{1}{2400}\loge\left(\dfrac{59}{5}\right)\).`, 2,
    t`\(200 = \frac{1200}{1 + 59e^{-2400k}}\) gives \(e^{-2400k} = \frac{5}{59}\).`,
    t`\(1 + 59e^{-2400k} = 6\), so \(e^{-2400k} = \frac{5}{59}\) and \(-2400k = \loge\left(\frac{5}{59}\right)\). 1 mark for substituting \(t = 2\), 1 mark for rearranging.`),
  part('c', t`Find the time, correct to the nearest minute, at which the rumour is spreading most rapidly, and the number of students who have heard it then.`, 2,
    t`11:18 am (\(t \approx 3.30\)); 600 students`,
    t`\(kN(1200 - N)\) is greatest at \(N = 600\). Then \(59e^{-1200kt} = 1\), so \(t = \frac{\loge(59)}{1200k} \approx 3.304\) h, about 3 h 18 min after 8 am. 1 mark for \(N = 600\), 1 mark for the time.`),
  part('d', t`Find the time, correct to the nearest minute, at which 90% of the students have heard the rumour.`, 1,
    t`1:05 pm (\(t \approx 5.08\))`,
    t`\(N = 1080\) gives \(1 + 59e^{-1200kt} = \frac{10}{9}\), so \(t = \frac{\loge(531)}{1200k} \approx 5.085\) h.`),
  part('e', t`Use Euler’s method with a step size of 0.5 hours to estimate the number of students who have heard the rumour at 9 am. Give your answer correct to the nearest whole number.`, 2,
    t`51 students`,
    t`\(N_{n+1} = N_n + 0.5kN_n(1200 - N_n)\) with \(N_0 = 20\): \(N_1 \approx 32.13\), \(N_2 \approx 51.43\). 1 mark for the first step, 1 mark for the estimate.`),
  part('f', t`The model gives \(N = 66\) at 9 am. Explain why Euler’s method underestimates \(N\) here.`, 1,
    t`For \(N < 600\) the graph of \(N\) against \(t\) is concave up, so each tangent step lies below the curve.`,
    t`\(\frac{d^2N}{dt^2} = k(1200 - 2N)\frac{dN}{dt} > 0\) while \(N < 600\): the gradient keeps increasing, and Euler’s method uses the gradient at the start of each step.`),
])

S.ex2(VE, 'advanced', t`Two drones, \(A\) and \(B\), fly in straight lines at constant velocities. Relative to a point \(O\) on the ground, their position vectors \(t\) seconds after they are launched are \(\tv{r}_A(t) = 2t\ii + 3t\jj + (10 + t)\kk\) and \(\tv{r}_B(t) = (20 - t)\ii + (2t + 5)\jj + (20 - t)\kk\), \(t \ge 0\), where \(\kk\) is vertically up and components are measured in metres.`, [
  part('a', t`Find the speed of drone \(A\), in m s⁻¹ correct to two decimal places.`, 1,
    t`\(\sqrt{14} \approx 3.74\) m s⁻¹`,
    t`\(\dot{\tv{r}}_A = 2\ii + 3\jj + \kk\), with magnitude \(\sqrt{4 + 9 + 1}\).`),
  part('b', t`Find the acute angle between the paths of the two drones, in degrees correct to one decimal place.`, 2,
    t`70.9°`,
    t`Direction vectors \(2\ii + 3\jj + \kk\) and \(-\ii + 2\jj - \kk\): \(\cos(\theta) = \frac{-2 + 6 - 1}{\sqrt{14}\sqrt{6}} = \frac{3}{\sqrt{84}}\), so \(\theta \approx 70.9^\circ\). 1 mark for the scalar product, 1 mark for the angle.`),
  part('c', t`Show that the paths of the two drones do not intersect.`, 2,
    t`Equating the paths with separate parameters, \(2s = 20 - u\), \(3s = 2u + 5\), \(10 + s = 20 - u\) has no solution.`,
    t`The first and third equations give \(s = 10\), \(u = 0\), but then the second gives \(30 = 5\). The paths are skew. 1 mark for using different parameters for the two paths, 1 mark for the inconsistency. Common error: using the same \(t\) for both, which only tests whether the drones collide.`),
  part('d', t`Find the minimum distance between the two drones and the time at which it occurs. Give both values correct to two decimal places.`, 3,
    t`2.99 m, at \(t \approx 6.07\) s`,
    t`\(\tv{r}_B - \tv{r}_A = (20 - 3t)\ii + (5 - t)\jj + (10 - 2t)\kk\), so the square of the distance is \(14t^2 - 170t + 525\). This is least at \(t = \frac{170}{28} = \frac{85}{14} \approx 6.07\), where the distance is \(\approx 2.99\). 1 mark for the distance function, 1 mark for the time, 1 mark for the minimum distance.`),
  part('e', t`Drone \(A\) must not cross the plane \(x + y + z = 30\). Find the time at which it reaches this plane and the coordinates of the point where it does so.`, 2,
    t`\(t = \dfrac{10}{3}\) s, at \(\left(\dfrac{20}{3}, 10, \dfrac{40}{3}\right)\)`,
    t`\(2t + 3t + 10 + t = 30\) gives \(t = \frac{10}{3}\). 1 mark for the time, 1 mark for the point.`),
])

S.ex2(ST, 'advanced', t`A mill fills bags of flour on two machines. The mass of flour in a bag filled by machine \(A\) is normally distributed with mean 1010 g and standard deviation 8 g. The mass in a bag filled by machine \(B\) is normally distributed with mean 1005 g and standard deviation 6 g. All masses are independent.`, [
  part('a', t`Find the probability that a bag filled by machine \(A\) contains less than 1000 g, correct to four decimal places.`, 1,
    t`0.1056`,
    t`\(\Pr(X < 1000) = \Pr(Z < -1.25) \approx 0.1056\).`),
  part('b', t`Find the probability that the total mass of flour in five bags filled by machine \(A\) exceeds 5070 g, correct to four decimal places.`, 2,
    t`0.1318`,
    t`The total is normal with mean \(5 \times 1010 = 5050\) and variance \(5 \times 64 = 320\). \(\Pr(T > 5070) \approx 0.1318\). 1 mark for the distribution, 1 mark for the probability. Common error: using \(5X\), with variance \(25 \times 64\).`),
  part('c', t`One bag from each machine is chosen at random. Find the probability that the bag from machine \(A\) contains more flour than the bag from machine \(B\), correct to four decimal places.`, 2,
    t`0.6915`,
    t`\(D = A - B\) is normal with mean 5 and variance \(64 + 36 = 100\), so \(\Pr(D > 0) = \Pr(Z > -0.5) \approx 0.6915\). 1 mark for the distribution of \(D\), 1 mark for the probability.`),
  part('d', t`The supervisor suspects that the mean of machine \(B\) has dropped below 1005 g. A random sample of 36 bags from machine \(B\) has a mean of 1002.8 g. Assuming the standard deviation is still 6 g, find the \(p\) value for a test of \(H_0: \mu = 1005\) against \(H_1: \mu < 1005\), correct to four decimal places.`, 2,
    t`\(p \approx 0.0139\)`,
    t`\(\bar{X}\) is normal with mean 1005 and standard deviation \(\frac{6}{\sqrt{36}} = 1\) under \(H_0\), so \(p = \Pr(\bar{X} \le 1002.8) = \Pr(Z \le -2.2) \approx 0.0139\). 1 mark for the standard error, 1 mark for \(p\).`),
  part('e', t`State the conclusion of the test at the 1% level of significance.`, 1,
    t`Do not reject \(H_0\): \(p \approx 0.0139 > 0.01\).`,
    t`There is not enough evidence at the 1% level that the mean has decreased (although there would be at the 5% level).`),
  part('f', t`For this test at the 1% level, find the largest sample mean, correct to two decimal places, that would lead to \(H_0\) being rejected.`, 1,
    t`1002.67 g`,
    t`\(\Pr(\bar{X} \le c) = 0.01\) under \(H_0\) gives \(c = 1005 - 2.3263 \times 1 \approx 1002.67\).`),
  part('g', t`Find a 99% confidence interval for the mean mass of flour in bags filled by machine \(B\), using the sample in part d. Give the values correct to two decimal places.`, 1,
    t`\((1000.22, 1005.38)\)`,
    t`\(1002.8 \pm 2.5758 \times 1\). The interval contains 1005, consistent with not rejecting \(H_0\) at the 1% level in a two-tailed sense.`),
])

export const ITEMS = S.items
