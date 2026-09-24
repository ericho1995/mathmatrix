// VCE Specialist Mathematics Unit 3 & 4 — Practice set 3.
// Answers verified in checks/set3.py.
import { t, AOS, part, makeSet, param, axes, argand } from './sm.mjs'

const { PF, FG, CX, CA, VE, ST } = AOS
const S = makeSet(3)

// ════════════════ Examination 1 ════════════════

S.ex1(PF, 'proficient', t`Consider the statement \(n! > 2^n\), where \(n \in \N\).`, [
  part('a', t`Show that the statement is false for \(n = 3\) and true for \(n = 4\).`, 1,
    t`\(3! = 6 < 8 = 2^3\); \(4! = 24 > 16 = 2^4\)`,
    t`Direct evaluation of both sides.`),
  part('b', t`Prove by mathematical induction that \(n! > 2^n\) for all integers \(n \ge 4\).`, 3,
    t`Base case \(n = 4\) from part a; if \(k! > 2^k\) with \(k \ge 4\), then \((k + 1)! = (k + 1)k! > (k + 1)2^k > 2 \times 2^k = 2^{k+1}\).`,
    t`Assume \(k! > 2^k\) for some integer \(k \ge 4\). Then \((k + 1)! = (k + 1) \times k! > (k + 1) \times 2^k\), and since \(k + 1 > 2\), \((k + 1)2^k > 2^{k+1}\). So \((k + 1)! > 2^{k+1}\), and the statement is true for \(n = k + 1\). With the base case \(n = 4\), it is true for all \(n \ge 4\) by induction. Marks: 1 for using the assumption; 1 for justifying \(k + 1 > 2\); 1 for the conclusion referring to \(n \ge 4\).`),
])

S.ex1(CX, 'proficient', t`Let \(S = \left\{z \in \C : |z - (1 + i)| \le \sqrt{2}\right\}\).`, [
  part('a', t`Show that the boundary of \(S\) passes through the origin.`, 1,
    t`\(|0 - (1 + i)| = \sqrt{1 + 1} = \sqrt{2}\)`,
    t`The origin is at distance \(\sqrt{2}\) from the centre \(1 + i\), which equals the radius.`),
  part('b', t`Sketch \(S\) on the Argand diagram below.`, 1,
    t`The closed disc with centre \((1, 1)\) and radius \(\sqrt{2}\), boundary included; it passes through \(0\), \(2\) and \(2i\).`,
    t`The circle also passes through \(2\) and \(2i\), since \(|2 - (1 + i)| = |1 - i| = \sqrt{2}\). Shade the inside and draw the boundary as a solid curve.`,
    { diagram: argand(3) }),
  part('c', t`Find the maximum value of \(|z|\) for \(z \in S\).`, 1,
    t`\(2\sqrt{2}\)`,
    t`The furthest point from the origin is diametrically opposite \(0\), at \(2 + 2i\): \(|1 + i| + \sqrt{2} = 2\sqrt{2}\).`),
  part('d', t`Find the set of possible values of \(\Arg(z)\) for \(z \in S\), \(z \ne 0\).`, 1,
    t`\(-\dfrac{\pi}{4} < \Arg(z) < \dfrac{3\pi}{4}\)`,
    t`At the origin the circle’s tangent is perpendicular to the radius, which has direction \(\frac{\pi}{4}\); so the tangent has directions \(-\frac{\pi}{4}\) and \(\frac{3\pi}{4}\). Points of \(S\) near \(0\) approach these arguments but never reach them.`),
])

S.ex1(FG, 'proficient', t`Let \(f(x) = 2\sin^{-1}(1 - x)\).`, [
  part('a', t`State the maximal domain and the range of \(f\).`, 2,
    t`Domain \([0, 2]\), range \([-\pi, \pi]\)`,
    t`\(-1 \le 1 - x \le 1\) gives \(0 \le x \le 2\). \(\sin^{-1}\) has range \(\left[-\frac{\pi}{2}, \frac{\pi}{2}\right]\), doubled. 1 mark each.`),
  part('b', t`Find \(f'(x)\), expressing your answer in terms of \(x\) with no inverse circular functions.`, 1,
    t`\(f'(x) = -\dfrac{2}{\sqrt{2x - x^2}}\)`,
    t`\(f'(x) = 2 \times \dfrac{-1}{\sqrt{1 - (1 - x)^2}}\), and \(1 - (1 - x)^2 = 2x - x^2\).`),
  part('c', t`Find the gradient of the graph of \(f\) at \(x = \dfrac{1}{2}\).`, 1,
    t`\(-\dfrac{4}{\sqrt{3}} = -\dfrac{4\sqrt{3}}{3}\)`,
    t`\(2x - x^2 = 1 - \frac{1}{4} = \frac{3}{4}\), so \(f'\left(\frac{1}{2}\right) = -\dfrac{2}{\sqrt{3}/2} = -\dfrac{4}{\sqrt{3}}\).`),
])

S.ex1(CA, 'proficient', t`The curve \(y = 2\sqrt{x}\), \(0 \le x \le 3\), is rotated about the \(x\)-axis. Find the area of the curved surface generated.`, [
  part('', '', 3,
    t`\(\dfrac{56\pi}{3}\)`,
    t`\(\dfrac{dy}{dx} = \dfrac{1}{\sqrt{x}}\), so \(2\pi y\sqrt{1 + \left(\dfrac{dy}{dx}\right)^2} = 4\pi\sqrt{x}\sqrt{\dfrac{x + 1}{x}} = 4\pi\sqrt{x + 1}\). \[S = 4\pi\int_0^3\sqrt{x + 1}\,dx = 4\pi \times \frac{2}{3}\Big[(x + 1)^{\frac{3}{2}}\Big]_0^3 = \frac{8\pi}{3}(8 - 1) = \frac{56\pi}{3}.\] Marks: 1 for the surface area integral; 1 for simplifying the integrand; 1 for the value.`),
])

S.ex1(CA, 'proficient', t`Consider \(\displaystyle\int_0^{\frac{\pi}{2}}\sin^2(x)\cos^3(x)\,dx\).`, [
  part('a', t`Show that \(\sin^2(x)\cos^3(x) = \left(\sin^2(x) - \sin^4(x)\right)\cos(x)\).`, 1,
    t`\(\cos^3(x) = \cos^2(x)\cos(x) = (1 - \sin^2(x))\cos(x)\)`,
    t`Use \(\cos^2(x) = 1 - \sin^2(x)\) and expand.`),
  part('b', t`Hence, evaluate the integral.`, 3,
    t`\(\dfrac{2}{15}\)`,
    t`Let \(u = \sin(x)\), so \(\frac{du}{dx} = \cos(x)\); the terminals become \(u = 0\) and \(u = 1\). \[\int_0^1 (u^2 - u^4)\,du = \frac{1}{3} - \frac{1}{5} = \frac{2}{15}.\] Marks: 1 for the substitution; 1 for the new terminals and integrand; 1 for the value.`),
])

S.ex1(CA, 'proficient', t`The volume of a spherical balloon is increasing at a constant rate of 10 cm³ s⁻¹. Find the rate at which its surface area is increasing when its radius is 5 cm.`, [
  part('', '', 3,
    t`4 cm² s⁻¹`,
    t`\(V = \frac{4}{3}\pi r^3\), so \(\frac{dV}{dt} = 4\pi r^2\frac{dr}{dt}\): at \(r = 5\), \(10 = 100\pi\frac{dr}{dt}\) and \(\frac{dr}{dt} = \frac{1}{10\pi}\). \(S = 4\pi r^2\), so \(\frac{dS}{dt} = 8\pi r\frac{dr}{dt} = 40\pi \times \frac{1}{10\pi} = 4\). (Equivalently \(\frac{dS}{dt} = \frac{2}{r}\frac{dV}{dt}\).) Marks: 1 for \(\frac{dr}{dt}\); 1 for the chain rule for \(S\); 1 for the value.`),
])

S.ex1(CA, 'proficient', t`Consider the differential equation \(\dfrac{dy}{dx} = \dfrac{x}{y}\), where \(y(0) = 2\).`, [
  part('a', t`Use Euler’s method with a step size of 0.5 to find an approximation to \(y(1)\).`, 2,
    t`\(y(1) \approx \dfrac{17}{8} = 2.125\)`,
    t`\(y_1 = 2 + 0.5 \times \frac{0}{2} = 2\) at \(x = 0.5\); \(y_2 = 2 + 0.5 \times \frac{0.5}{2} = 2.125\) at \(x = 1\). 1 mark for each step.`),
  part('b', t`Solve the differential equation, and hence find the exact value of \(y(1)\).`, 2,
    t`\(y = \sqrt{x^2 + 4}\), so \(y(1) = \sqrt{5}\)`,
    t`Separate: \(\int y\,dy = \int x\,dx\), so \(y^2 = x^2 + c\); \(y(0) = 2\) gives \(c = 4\), and \(y > 0\). 1 mark for the solution, 1 mark for \(\sqrt{5}\). (Euler’s estimate 2.125 is below \(\sqrt{5} \approx 2.236\) because the solution is concave up.)`),
])

S.ex1(ST, 'proficient', t`The heights of seedlings of a certain plant are normally distributed with a standard deviation of 2 cm. A random sample of 16 seedlings has a mean height of 12.5 cm.`, [
  part('a', t`Find the standard deviation of the sample mean for samples of size 16.`, 1,
    t`0.5 cm`,
    t`\(\frac{\sigma}{\sqrt{n}} = \frac{2}{4}\).`),
  part('b', t`Using \(\Pr(-1.96 < Z < 1.96) = 0.95\), find an approximate 95% confidence interval for the mean height of these seedlings.`, 1,
    t`\((11.52, 13.48)\)`,
    t`\(12.5 \pm 1.96 \times 0.5 = 12.5 \pm 0.98\).`),
  part('c', t`Using \(z = 2\) as an approximation to 1.96, find the smallest sample size for which a 95% confidence interval for the mean height would have width at most 1 cm.`, 1,
    t`64`,
    t`Width \(= 2 \times 2 \times \frac{2}{\sqrt{n}} \le 1\), so \(\sqrt{n} \ge 8\) and \(n \ge 64\).`),
])

S.ex1(VE, 'proficient', t`The planes \(\Pi_1\) and \(\Pi_2\) have Cartesian equations \(x + y + z = 6\) and \(x - y + 2z = 5\) respectively.`, [
  part('a', t`Find a vector equation of the line of intersection of \(\Pi_1\) and \(\Pi_2\).`, 3,
    t`\(\tv{r}(t) = \dfrac{11}{2}\ii + \dfrac{1}{2}\jj + t(3\ii - \jj - 2\kk)\), \(t \in \R\) (or equivalent)`,
    t`The line is perpendicular to both normals, so its direction is \((\ii + \jj + \kk) \times (\ii - \jj + 2\kk) = 3\ii - \jj - 2\kk\). A point on both planes: with \(z = 0\), \(x + y = 6\) and \(x - y = 5\), so \(x = \frac{11}{2}\), \(y = \frac{1}{2}\). Marks: 1 for the direction; 1 for a common point; 1 for the equation.`),
  part('b', t`Find the acute angle between \(\Pi_1\) and \(\Pi_2\), giving your answer in the form \(\cos^{-1}(a)\).`, 2,
    t`\(\cos^{-1}\left(\dfrac{\sqrt{2}}{3}\right)\)`,
    t`The angle between the planes is the angle between their normals: \(\cos(\theta) = \dfrac{|1 - 1 + 2|}{\sqrt{3}\sqrt{6}} = \dfrac{2}{\sqrt{18}} = \dfrac{\sqrt{2}}{3}\). 1 mark for the scalar product, 1 mark for the answer.`),
])

S.ex1(VE, 'advanced', t`The position vector of a particle at time \(t\) seconds is \(\tv{r}(t) = (t^2 - 1)\ii + (t^3 - 3t)\jj\), \(t \ge 0\), with components in metres.`, [
  part('a', t`Find the time at which the particle is moving parallel to \(\ii\), and its position vector at that time.`, 2,
    t`\(t = 1\); \(\tv{r}(1) = -2\jj\)`,
    t`\(\dot{\tv{r}}(t) = 2t\ii + (3t^2 - 3)\jj\). The \(\jj\)-component is zero when \(t = 1\) (\(t \ge 0\)), and the \(\ii\)-component is then 2, not 0. 1 mark for the time, 1 mark for the position.`),
  part('b', t`Show that the path of the particle satisfies \(y^2 = (x + 1)(x - 2)^2\).`, 2,
    t`\(x + 1 = t^2\) and \(x - 2 = t^2 - 3\), so \((x + 1)(x - 2)^2 = t^2(t^2 - 3)^2 = (t^3 - 3t)^2 = y^2\).`,
    t`1 mark for expressing \(x + 1\) and \(x - 2\) in terms of \(t\), 1 mark for completing the verification.`),
  part('c', t`Find the distance between the positions of the particle at \(t = 0\) and \(t = 2\).`, 1,
    t`\(2\sqrt{5}\) m`,
    t`\(\tv{r}(0) = -\ii\) and \(\tv{r}(2) = 3\ii + 2\jj\), so the distance is \(|4\ii + 2\jj| = \sqrt{20}\).`),
  part('d', t`Find the acceleration of the particle when \(t = 1\).`, 1,
    t`\(2\ii + 6\jj\) m s⁻²`,
    t`\(\ddot{\tv{r}}(t) = 2\ii + 6t\jj\).`),
])

// ════════════════ Examination 2 — Section A ════════════════

S.mc(PF, 'proficient', t`Which one of the following statements is true?`,
  [t`For all \(x \in \R\), \(x^2 \ge x\).`, t`For all \(x \in \Z\), \(x^2 \ge x\).`, t`There exists \(x \in \Z\) such that \(x^2 < x\).`, t`For all \(x \in \R\), if \(x^2 > 1\), then \(x > 1\).`], 'B',
  t`For an integer, \(x^2 - x = x(x - 1)\) is a product of consecutive integers, never negative, so B is true and C is false. A fails at \(x = \frac{1}{2}\); D fails at \(x = -2\).`)

S.mc(PF, 'developing', t`To prove the statement ‘if \(n^2\) is odd, then \(n\) is odd’ by proving its contrapositive, a student would prove that`,
  [t`if \(n\) is odd, then \(n^2\) is odd`, t`if \(n^2\) is even, then \(n\) is even`, t`\(n^2\) is odd and \(n\) is even is impossible`, t`if \(n\) is even, then \(n^2\) is even`], 'D',
  t`The contrapositive of “if \(P\) then \(Q\)” is “if not \(Q\) then not \(P\)”: if \(n\) is even (not odd), then \(n^2\) is even (not odd). A is the converse; C describes a proof by contradiction.`)

S.mc(FG, 'proficient', t`\(\dfrac{3x + 5}{(x + 1)^2}\) is equal to`,
  [t`\(\dfrac{3}{x + 1} + \dfrac{2}{(x + 1)^2}\)`, t`\(\dfrac{3}{x + 1} + \dfrac{5}{(x + 1)^2}\)`, t`\(\dfrac{2}{x + 1} + \dfrac{3}{(x + 1)^2}\)`, t`\(\dfrac{5}{x + 1} - \dfrac{2}{(x + 1)^2}\)`], 'A',
  t`\(3x + 5 = 3(x + 1) + 2\), so dividing by \((x + 1)^2\) gives \(\frac{3}{x + 1} + \frac{2}{(x + 1)^2}\). A repeated factor needs both \(\frac{A}{x + 1}\) and \(\frac{B}{(x + 1)^2}\).`)

S.mc(FG, 'proficient', t`The graph of \(y = \dfrac{2x^3 - x + 1}{x^2 + 1}\) has an oblique asymptote with equation`,
  [t`\(y = x\)`, t`\(y = 2x - 1\)`, t`\(y = 2x\)`, t`\(y = 2x + 1\)`], 'C',
  t`\(2x^3 - x + 1 = 2x(x^2 + 1) - 3x + 1\), so \(y = 2x + \dfrac{1 - 3x}{x^2 + 1}\), and the fraction tends to 0 as \(x \to \pm\infty\). The graph has no vertical asymptote since \(x^2 + 1 > 0\).`)

S.mc(CX, 'developing', t`\(\dfrac{(1 + i)^8}{(1 - i)^4}\) is equal to`,
  [t`\(-4\)`, t`\(4\)`, t`\(-4i\)`, t`\(4i\)`], 'A',
  t`\((1 + i)^2 = 2i\), so \((1 + i)^8 = (2i)^4 = 16\). \((1 - i)^2 = -2i\), so \((1 - i)^4 = (-2i)^2 = -4\). The quotient is \(-4\). (In polar form: \(\frac{16\cis(2\pi)}{4\cis(-\pi)} = 4\cis(3\pi) = -4\).)`)

S.mc(CX, 'proficient', t`For \(\theta \in \R\), the solutions of \(z^2 - 2\cos(\theta)z + 1 = 0\) always lie on`,
  [t`the real axis`, t`the line \(\operatorname{Re}(z) = 1\)`, t`the circle \(|z| = 2\)`, t`the circle \(|z| = 1\)`], 'D',
  t`The quadratic formula gives \(z = \cos(\theta) \pm \sqrt{\cos^2(\theta) - 1} = \cos(\theta) \pm i\sin(\theta) = \cis(\pm\theta)\), each of modulus 1. (Also, the product of the roots is 1 and they are conjugates.)`)

S.mc(CX, 'proficient', t`The set of points in the complex plane given by \(\left\{z : \Arg(z - 1) = \dfrac{\pi}{4}\right\}\) is`,
  [t`the ray starting at \(1\), including \(1\), at an angle of \(\frac{\pi}{4}\) to the positive real axis`, t`the ray starting at \(1\), excluding \(1\), at an angle of \(\frac{\pi}{4}\) to the positive real axis`, t`the line through \(1\) with gradient 1`, t`the ray starting at \(-1\), excluding \(-1\), at an angle of \(\frac{\pi}{4}\) to the positive real axis`], 'B',
  t`\(z - 1\) is the vector from 1 to \(z\); its argument is \(\frac{\pi}{4}\) for points on the ray from 1 in that direction. \(\Arg(0)\) is undefined, so \(z = 1\) is excluded. C would also contain the points with \(\Arg(z - 1) = -\frac{3\pi}{4}\).`)

S.mc(CA, 'proficient', t`Consider the pseudocode shown below. The value printed is`,
  ['3.50', '3.75', '4.00', '4.25'], 'C',
  t`Each pass applies Euler’s method to \(\frac{dy}{dx} = \frac{y}{x}\) with \(h = 0.25\): \(y = 2.5, 3, 3.5, 4\) at \(x = 1.25, 1.5, 1.75, 2\), when the loop stops. The exact solution through \((1, 2)\) is \(y = 2x\), a straight line, so every Euler step is exact. 3.50 stops one pass early.`,
  { diagram: { kind: 'pseudocode', lines: ['x ← 1', 'y ← 2', 'h ← 0.25', 'while x < 2 do', '    y ← y + h × (y ÷ x)', '    x ← x + h', 'end while', 'print y'] } })

S.mc(CA, 'developing', t`The solution of \(\dfrac{dy}{dx} = y(3 - y)\) with \(y(0) = 1\) has the property that, as \(x \to \infty\), \(y\) approaches`,
  ['0', '1', '1.5', '3'], 'D',
  t`This is a logistic equation with carrying capacity 3: for \(0 < y < 3\), \(\frac{dy}{dx} > 0\) and \(y\) increases towards the equilibrium \(y = 3\). 1.5 is where \(y\) grows fastest.`)

S.mc(CA, 'proficient', t`A particle moves in a straight line with velocity \(v(t) = 4 - 2t\) m s⁻¹ for \(0 \le t \le 5\). The distance travelled by the particle in the 5 seconds is`,
  ['−5 m', '5 m', '9 m', '13 m'], 'D',
  t`The particle stops and turns at \(t = 2\). Distance \(= \int_0^2 (4 - 2t)\,dt + \left|\int_2^5 (4 - 2t)\,dt\right| = 4 + 9 = 13\). \(-5\) m is the displacement \(\int_0^5 (4 - 2t)\,dt\).`)

S.mc(CA, 'proficient', t`A particle moving in a straight line has acceleration \(a = -4x\) m s⁻², where \(x\) m is its displacement from a point \(O\). Its speed at \(O\) is 6 m s⁻¹. The particle is momentarily at rest when \(|x|\) equals`,
  ['1.5', '3', '6', '9'], 'B',
  t`\(\frac{d}{dx}\left(\frac{1}{2}v^2\right) = -4x\) gives \(v^2 = 36 - 4x^2\), which is zero when \(x = \pm 3\).`)

S.mc(CA, 'proficient', t`\(\displaystyle\int_0^{\frac{\pi}{3}}\frac{\sin(x)}{1 + \cos(x)}\,dx\) is equal to`,
  [t`\(\loge\left(\frac{3}{4}\right)\)`, t`\(\loge\left(\frac{4}{3}\right)\)`, t`\(\loge\left(\frac{3}{2}\right)\)`, t`\(\loge(2)\)`], 'B',
  t`With \(u = 1 + \cos(x)\), \(du = -\sin(x)\,dx\): the antiderivative is \(-\loge(1 + \cos(x))\), giving \(-\loge\left(\frac{3}{2}\right) + \loge(2) = \loge\left(\frac{4}{3}\right)\). A has the sign reversed.`)

S.mc(CA, 'proficient', t`The area of the region enclosed by the graph of \(y = \sin^{-1}(x)\), the \(y\)-axis and the line \(y = \dfrac{\pi}{2}\) is`,
  [t`\(\dfrac{\pi}{2} - 1\)`, t`\(1\)`, t`\(\dfrac{\pi}{2}\)`, t`\(2\)`], 'B',
  t`Integrate with respect to \(y\): \(x = \sin(y)\), so the area is \(\int_0^{\frac{\pi}{2}}\sin(y)\,dy = 1\). \(\frac{\pi}{2} - 1\) is the area between the curve and the \(x\)-axis for \(0 \le x \le 1\); the two add to the rectangle \(1 \times \frac{\pi}{2}\).`)

S.mc(CA, 'developing', t`A cup of tea is placed in a room with a constant temperature of 22 °C. Its temperature \(T\) °C decreases at a rate proportional to the difference between its temperature and the room’s. For a positive constant \(k\), the differential equation is`,
  [t`\(\dfrac{dT}{dt} = -kT\)`, t`\(\dfrac{dT}{dt} = k(T - 22)\)`, t`\(\dfrac{dT}{dt} = -k(T - 22)\)`, t`\(\dfrac{dT}{dt} = -k(22 - T)\)`], 'C',
  t`The rate is proportional to \(T - 22\), and \(T\) decreases while \(T > 22\), so \(\frac{dT}{dt} = -k(T - 22)\) with \(k > 0\). B and D both describe the tea heating up while \(T > 22\).`)

S.mc(VE, 'developing', t`The scalar resolute of \(\tv{a} = \ii + 2\jj - 2\kk\) in the direction of \(\tv{b} = 2\ii - \jj + 2\kk\) is`,
  [t`\(-\dfrac{4}{3}\)`, t`\(-\dfrac{4}{9}\)`, t`\(\dfrac{4}{9}\)`, t`\(\dfrac{4}{3}\)`], 'A',
  t`\(\tv{a} \cdot \hat{\tv{b}} = \dfrac{2 - 2 - 4}{3} = -\dfrac{4}{3}\). \(-\frac{4}{9}\) divides by \(|\tv{b}|^2\), which belongs in the vector resolute, not the scalar resolute. A negative scalar resolute means the angle between the vectors is obtuse.`)

S.mc(VE, 'proficient', t`The points \(A(1, 2, 3)\), \(B(3, 1, 5)\) and \(C(a, b, 11)\) are collinear when`,
  [t`\(a = 5\) and \(b = 0\)`, t`\(a = 7\) and \(b = -1\)`, t`\(a = 9\) and \(b = 2\)`, t`\(a = 9\) and \(b = -2\)`], 'D',
  t`\(C\) lies on the line through \(A\) with direction \(\overrightarrow{AB} = 2\ii - \jj + 2\kk\): \(3 + 2\lambda = 11\) gives \(\lambda = 4\), so \(a = 1 + 8 = 9\) and \(b = 2 - 4 = -2\).`)

S.mc(VE, 'developing', t`The area of the parallelogram with adjacent sides \(\tv{a} = \ii + \jj\) and \(\tv{b} = \jj + 2\kk\) is`,
  [t`\(\dfrac{3}{2}\)`, t`\(\sqrt{5}\)`, t`\(3\)`, t`\(9\)`], 'C',
  t`\(\tv{a} \times \tv{b} = 2\ii - 2\jj + \kk\), with magnitude 3. \(\frac{3}{2}\) is the area of the triangle; 9 forgets the square root.`)

S.mc(VE, 'proficient', t`The line with vector equation \(\tv{r}(t) = \ii + 2\kk + t(2\ii + \jj - \kk)\), \(t \in \R\), is parallel to, but does not lie in, the plane`,
  [t`\(x - y + z = 4\)`, t`\(x + y + z = 3\)`, t`\(2x + y - z = 0\)`, t`\(x - 2y + z = 3\)`], 'A',
  t`Parallel requires the direction to be perpendicular to the normal: only \((\ii - \jj + \kk) \cdot (2\ii + \jj - \kk) = 0\). The point \((1, 0, 2)\) gives \(1 - 0 + 2 = 3 \ne 4\), so the line is not in the plane. C has the direction vector as its normal, so it is perpendicular to the line.`)

S.mc(ST, 'developing', t`For samples of size 16 from a population, the standard deviation of the sample mean is 2.5. The standard deviation of the population is`,
  ['0.625', '2.5', '10', '40'], 'C',
  t`\(\sd(\bar{X}) = \frac{\sigma}{\sqrt{n}}\), so \(\sigma = 2.5 \times 4 = 10\). 0.625 divides by 4 instead; 40 multiplies by \(n\) rather than \(\sqrt{n}\).`)

S.mc(ST, 'developing', t`In a hypothesis test, a type I error is made when`,
  [t`\(H_0\) is rejected when \(H_0\) is true`, t`\(H_0\) is not rejected when \(H_0\) is false`, t`\(H_0\) is rejected when \(H_0\) is false`, t`\(H_0\) is not rejected when \(H_0\) is true`], 'A',
  t`A type I error is a false rejection; its probability is the level of significance. B is a type II error; C and D are correct decisions.`)

// ════════════════ Examination 2 — Section B ════════════════

S.ex2(FG, 'advanced', t`A logo is based on the curve with parametric equations \(x = 2\cos^3(t)\), \(y = 2\sin^3(t)\), \(0 \le t \le 2\pi\), shown below.`, [
  part('a', t`Show that the Cartesian equation of the curve is \(x^{\frac{2}{3}} + y^{\frac{2}{3}} = 2^{\frac{2}{3}}\).`, 1,
    t`\(x^{\frac{2}{3}} + y^{\frac{2}{3}} = 2^{\frac{2}{3}}\left(\cos^2(t) + \sin^2(t)\right) = 2^{\frac{2}{3}}\)`,
    t`\(x^{\frac{2}{3}} = 2^{\frac{2}{3}}\cos^2(t)\) and \(y^{\frac{2}{3}} = 2^{\frac{2}{3}}\sin^2(t)\) (real cube roots).`),
  part('b', t`Show that \(\dfrac{dy}{dx} = -\tan(t)\), where defined.`, 2,
    t`\(\dfrac{dy}{dx} = \dfrac{6\sin^2(t)\cos(t)}{-6\cos^2(t)\sin(t)} = -\tan(t)\)`,
    t`\(\frac{dx}{dt} = -6\cos^2(t)\sin(t)\) and \(\frac{dy}{dt} = 6\sin^2(t)\cos(t)\). 1 mark for both derivatives, 1 mark for the quotient.`),
  part('c', t`Find the coordinates of the point in the first quadrant where the tangent to the curve has gradient \(-1\).`, 1,
    t`\(\left(\dfrac{\sqrt{2}}{2}, \dfrac{\sqrt{2}}{2}\right)\)`,
    t`\(\tan(t) = 1\) with \(0 < t < \frac{\pi}{2}\) gives \(t = \frac{\pi}{4}\), and \(2\left(\frac{1}{\sqrt{2}}\right)^3 = \frac{1}{\sqrt{2}}\).`),
  part('d', t`Find the total length of the curve.`, 2,
    t`12`,
    t`\(\sqrt{\dot{x}^2 + \dot{y}^2} = 6|\sin(t)\cos(t)|\). By symmetry, \(L = 4\displaystyle\int_0^{\frac{\pi}{2}}6\sin(t)\cos(t)\,dt = 4 \times 3 = 12\). 1 mark for the integral (with the absolute value or symmetry), 1 mark for 12. Common error: integrating \(6\sin(t)\cos(t)\) over \([0, 2\pi]\), which gives 0.`),
  part('e', t`Find the area enclosed by the curve, correct to three decimal places.`, 2,
    t`4.712 (exactly \(\frac{3\pi}{2}\))`,
    t`Using the Cartesian form, \(A = 4\displaystyle\int_0^2\left(2^{\frac{2}{3}} - x^{\frac{2}{3}}\right)^{\frac{3}{2}}dx \approx 4.712\). 1 mark for the integral, 1 mark for the value.`),
  part('f', t`The curve is rotated about the \(x\)-axis. Find the total surface area of the solid formed, correct to two decimal places.`, 2,
    t`30.16 (exactly \(\frac{48\pi}{5}\))`,
    t`The upper half (\(0 \le t \le \pi\)) generates the surface: \(S = 2\displaystyle\int_0^{\frac{\pi}{2}}2\pi(2\sin^3(t)) \times 6\sin(t)\cos(t)\,dt = \frac{48\pi}{5} \approx 30.16\). 1 mark for the integral, 1 mark for the value.`),
], { diagram: { kind: 'function_graph', xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y', grid: false, equalAspect: true, width: 230, curves: [{ points: param(s => 2 * Math.cos(s) ** 3, s => 2 * Math.sin(s) ** 3, 0, 2 * Math.PI, 240) }] } })

S.ex2(CX, 'advanced', t`Let \(C = \{z \in \C : |z - 2| = 2\}\) and \(L = \left\{z \in \C : \Arg(z) = \dfrac{\pi}{4}\right\}\).`, [
  part('a', t`Show that \(C\) can be written as \(\{z \in \C : z\bar{z} = 2(z + \bar{z})\}\).`, 1,
    t`\(|z - 2|^2 = (z - 2)(\bar{z} - 2) = z\bar{z} - 2z - 2\bar{z} + 4 = 4\)`,
    t`Squaring and using \(|w|^2 = w\bar{w}\) gives \(z\bar{z} - 2(z + \bar{z}) = 0\).`),
  part('b', t`Sketch \(C\) and \(L\) on the Argand diagram below.`, 2,
    t`\(C\): circle with centre \(2\) and radius 2 (through \(0\) and \(4\)). \(L\): ray from the origin (origin excluded) through \(1 + i\).`,
    t`1 mark for the circle, 1 mark for the ray with an open circle at the origin.`,
    { diagram: argand(4, { width: 280 }) }),
  part('c', t`Find the complex number represented by the point of intersection of \(C\) and \(L\).`, 2,
    t`\(2 + 2i\)`,
    t`On \(L\), \(z = a + ai\) with \(a > 0\). Then \((a - 2)^2 + a^2 = 4\), so \(2a^2 - 4a = 0\) and \(a = 2\) (\(a = 0\) gives the origin, which is not on \(L\)). 1 mark for the equation, 1 mark for the answer.`),
  part('d', t`Find the area of the region \(\{z : |z - 2| \le 2\} \cap \left\{z : 0 \le \Arg(z) \le \frac{\pi}{4}\right\}\).`, 2,
    t`\(\pi + 2\)`,
    t`The region is the triangle with vertices \(0\), \(2\) and \(2 + 2i\) (area 2) together with the quarter of the disc between \(2\), \(4\) and \(2 + 2i\) (area \(\frac{1}{4}\pi \times 2^2 = \pi\)). 1 mark for splitting the region, 1 mark for the area.`),
  part('e', t`Describe the set of points \(w = z^2\), where \(z \in L\).`, 1,
    t`The positive imaginary axis (excluding \(0\)).`,
    t`\(\Arg(z^2) = 2 \times \frac{\pi}{4} = \frac{\pi}{2}\), and \(|z|^2\) takes every positive value.`),
  part('f', t`Find the three cube roots of \(2 + 2i\) in polar form, with arguments in \((-\pi, \pi]\).`, 2,
    t`\(\sqrt{2}\cis\left(\dfrac{\pi}{12}\right)\), \(\sqrt{2}\cis\left(\dfrac{3\pi}{4}\right)\), \(\sqrt{2}\cis\left(-\dfrac{7\pi}{12}\right)\)`,
    t`\(2 + 2i = 2\sqrt{2}\cis\left(\frac{\pi}{4}\right)\) and \((2\sqrt{2})^{\frac{1}{3}} = \sqrt{2}\). The arguments are \(\frac{\pi}{12} + \frac{2k\pi}{3}\). 1 mark for the modulus and first root, 1 mark for the other two.`),
])

S.ex2(CA, 'advanced', t`A tank initially contains 50 L of pure water. Brine containing 0.5 kg of salt per litre flows in at 4 L min⁻¹, and the well-mixed solution flows out at 2 L min⁻¹. The tank holds 100 L. Let \(Q\) kg be the amount of salt in the tank \(t\) minutes after the brine starts to flow.`, [
  part('a', t`Show that \(\dfrac{dQ}{dt} = 2 - \dfrac{Q}{25 + t}\) while the tank is filling.`, 2,
    t`In: \(0.5 \times 4 = 2\) kg min⁻¹. Volume \(50 + 2t\), so out: \(\frac{2Q}{50 + 2t} = \frac{Q}{25 + t}\).`,
    t`1 mark for the inflow rate, 1 mark for the outflow using the changing volume.`),
  part('b', t`Verify that \(Q = \dfrac{t(t + 50)}{t + 25}\) satisfies the differential equation and the initial condition.`, 2,
    t`\(Q(0) = 0\), and \(\frac{dQ}{dt} = \frac{t^2 + 50t + 1250}{(t + 25)^2} = 2 - \frac{t(t + 50)}{(t + 25)^2}\).`,
    t`\(2 - \frac{Q}{25 + t} = \frac{2(t + 25)^2 - t(t + 50)}{(t + 25)^2} = \frac{t^2 + 50t + 1250}{(t + 25)^2}\), which equals \(\frac{dQ}{dt}\) found by the quotient rule. 1 mark for each check.`),
  part('c', t`Find the time at which the tank is full and the amount of salt in it at that time.`, 2,
    t`\(t = 25\) min; 37.5 kg`,
    t`\(50 + 2t = 100\) gives \(t = 25\); \(Q(25) = \frac{25 \times 75}{50} = 37.5\). 1 mark each.`),
  part('d', t`Find the time at which the concentration of salt in the tank first reaches 0.3 kg L⁻¹, in minutes correct to two decimal places.`, 2,
    t`14.53 min`,
    t`Solve \(\dfrac{t(t + 50)}{(t + 25)(50 + 2t)} = 0.3\): \(t^2 + 50t - 937.5 = 0\), so \(t \approx 14.53\). 1 mark for the equation, 1 mark for the value.`),
  part('e', t`When the tank is full, the brine is replaced by pure water flowing in at 2 L min⁻¹, so the volume stays at 100 L. Find the time, measured from when the brine started, at which the tank contains 10 kg of salt. Give your answer in minutes correct to one decimal place.`, 2,
    t`91.1 min`,
    t`Now \(\frac{dQ}{dt} = -\frac{2Q}{100}\) with \(Q = 37.5\) at \(t = 25\), so \(Q = 37.5e^{-0.02(t - 25)}\). \(Q = 10\) gives \(t = 25 + 50\loge(3.75) \approx 91.1\). 1 mark for the model, 1 mark for the time.`),
])

S.ex2(CA, 'advanced', t`When the engine of a boat is switched off, the boat is travelling at 10 m s⁻¹. It then moves in a straight line, and while it slows its acceleration is \(a = -0.05v^2\) m s⁻², where \(v\) m s⁻¹ is its velocity \(t\) seconds after the engine is switched off.`, [
  part('a', t`Show that \(v = \dfrac{10}{1 + 0.5t}\).`, 2,
    t`\(\int v^{-2}\,dv = -\int 0.05\,dt\) gives \(\frac{1}{v} = 0.05t + 0.1\).`,
    t`\(-\frac{1}{v} = -0.05t + c\), and \(v(0) = 10\) gives \(c = -0.1\). So \(v = \frac{1}{0.05t + 0.1} = \frac{10}{0.5t + 1}\). 1 mark for separating and integrating, 1 mark for the constant.`),
  part('b', t`Find the time taken for the boat to slow to 2 m s⁻¹.`, 1,
    t`8 s`,
    t`\(\frac{1}{2} = 0.05t + 0.1\) gives \(t = 8\).`),
  part('c', t`Using \(a = v\dfrac{dv}{dx}\), where \(x\) m is the distance travelled after the engine is switched off, show that \(v = 10e^{-0.05x}\).`, 2,
    t`\(v\frac{dv}{dx} = -0.05v^2\), so \(\frac{dv}{dx} = -0.05v\) and \(v = 10e^{-0.05x}\).`,
    t`Separating: \(\loge(v) = -0.05x + c\), with \(v = 10\) at \(x = 0\). 1 mark for the differential equation in \(x\), 1 mark for the solution.`),
  part('d', t`Find the distance travelled while the boat slows to 2 m s⁻¹, correct to two decimal places.`, 1,
    t`32.19 m`,
    t`\(2 = 10e^{-0.05x}\) gives \(x = 20\loge(5) \approx 32.19\).`),
  part('e', t`Explain why this model predicts that the boat never comes to rest.`, 1,
    t`\(v = \frac{10}{1 + 0.5t} > 0\) for all \(t \ge 0\); it only approaches 0.`,
    t`Also \(x = 20\loge(1 + 0.5t)\) increases without bound, so the model is only realistic while the boat is moving quickly.`),
  part('f', t`A better model includes friction: \(a = -(0.5 + 0.05v^2)\). Using this model, find the time taken for the boat to stop from 10 m s⁻¹, correct to two decimal places, and the distance it travels while stopping, correct to one decimal place.`, 3,
    t`8.00 s; 24.0 m`,
    t`\(t = \displaystyle\int_0^{10}\frac{dv}{0.5 + 0.05v^2} = 2\sqrt{10}\tan^{-1}\left(\sqrt{10}\right) \approx 8.00\). \(x = \displaystyle\int_0^{10}\frac{v\,dv}{0.5 + 0.05v^2} = 10\loge(11) \approx 24.0\). 1 mark for the time integral, 1 mark for the time, 1 mark for the distance.`),
])

S.ex2(VE, 'advanced', t`A square-based pyramid \(OABCV\) has vertices \(O(0, 0, 0)\), \(A(4, 0, 0)\), \(B(4, 4, 0)\), \(C(0, 4, 0)\) and apex \(V(2, 2, 6)\), with distances in metres.`, [
  part('a', t`Find the vectors \(\overrightarrow{VA}\) and \(\overrightarrow{VB}\).`, 1,
    t`\(\overrightarrow{VA} = 2\ii - 2\jj - 6\kk\), \(\overrightarrow{VB} = 2\ii + 2\jj - 6\kk\)`,
    t`Subtract the position vector of \(V\).`),
  part('b', t`Show that \(3\ii + \kk\) is normal to the face \(VAB\), and find the Cartesian equation of the plane containing this face.`, 3,
    t`\(\overrightarrow{VA} \times \overrightarrow{VB} = 24\ii + 8\kk = 8(3\ii + \kk)\); plane \(3x + z = 12\).`,
    t`The cross product is \(((-2)(-6) - (-6)(2))\ii - (2(-6) - (-6)(2))\jj + (2 \times 2 - (-2)(2))\kk = 24\ii + 0\jj + 8\kk\). Substituting \(A\): \(3(4) + 0 = 12\); check \(V\): \(6 + 6 = 12\). 1 mark for the cross product, 1 mark for identifying the normal, 1 mark for the equation.`),
  part('c', t`Find the angle between the face \(VAB\) and the base, in degrees correct to one decimal place.`, 2,
    t`71.6°`,
    t`The base has normal \(\kk\): \(\cos(\theta) = \frac{(3\ii + \kk) \cdot \kk}{\sqrt{10}} = \frac{1}{\sqrt{10}}\), so \(\theta \approx 71.6^\circ\). 1 mark for the method, 1 mark for the angle.`),
  part('d', t`Find the shortest distance from \(O\) to the plane containing face \(VAB\), correct to two decimal places.`, 1,
    t`3.79 m`,
    t`\(\frac{|0 - 12|}{\sqrt{10}} \approx 3.79\).`),
  part('e', t`Find the volume of the pyramid.`, 1,
    t`32 m³`,
    t`\(\frac{1}{3} \times 4^2 \times 6 = 32\).`),
  part('f', t`The face \(VBC\) has normal \(3\jj + \kk\). Find the acute angle between the planes containing faces \(VAB\) and \(VBC\), in degrees correct to one decimal place.`, 2,
    t`84.3°`,
    t`\(\cos(\theta) = \dfrac{(3\ii + \kk) \cdot (3\jj + \kk)}{\sqrt{10}\sqrt{10}} = \dfrac{1}{10}\), so \(\theta \approx 84.3^\circ\). (The angle inside the pyramid between these faces is the obtuse angle, \(95.7^\circ\).) 1 mark for the scalar product, 1 mark for the angle.`),
])

S.ex2(ST, 'advanced', t`A manufacturer claims that its batteries have a mean life of 500 hours. Battery lives are normally distributed with a standard deviation of 30 hours. A consumer group suspects the mean is lower, and tests \(H_0: \mu = 500\) against \(H_1: \mu < 500\) at the 5% level of significance using random samples of 36 batteries.`, [
  part('a', t`One sample of 36 batteries has a mean life of 490 hours. Find the \(p\) value of the test, correct to four decimal places.`, 2,
    t`0.0228`,
    t`\(\sd(\bar{X}) = \frac{30}{6} = 5\), so \(p = \Pr(\bar{X} \le 490 \mid \mu = 500) = \Pr(Z \le -2) \approx 0.0228\). 1 mark for the standard error, 1 mark for \(p\).`),
  part('b', t`State the conclusion of the test.`, 1,
    t`Reject \(H_0\) since \(p < 0.05\).`,
    t`There is evidence at the 5% level that the mean battery life is less than 500 hours.`),
  part('c', t`Find the critical sample mean for this test, correct to two decimal places.`, 1,
    t`491.78 hours`,
    t`\(\Pr(\bar{X} \le c \mid \mu = 500) = 0.05\) gives \(c = 500 - 1.6449 \times 5 \approx 491.78\). Sample means at or below 491.78 lead to rejecting \(H_0\).`),
  part('d', t`Suppose the true mean life is 488 hours. Find the probability of a type II error for this test, correct to three decimal places.`, 2,
    t`0.225`,
    t`A type II error is failing to reject \(H_0\): \(\Pr(\bar{X} > 491.78 \mid \mu = 488) = \Pr(Z > 0.756) \approx 0.225\). 1 mark for the probability statement, 1 mark for the value.`),
  part('e', t`Find the smallest sample size for which the probability of a type II error, when the true mean is 488 hours, is at most 0.05 (still testing at the 5% level).`, 2,
    t`68`,
    t`Need \(500 - 1.6449\frac{30}{\sqrt{n}} \le 488 + 1.6449\frac{30}{\sqrt{n}}\), so \(\sqrt{n} \ge \frac{2 \times 1.6449 \times 30}{12} \approx 8.22\) and \(n \ge 67.6\). 1 mark for the inequality, 1 mark for 68.`),
  part('f', t`Find a 95% confidence interval for the mean battery life using the sample in part a, correct to two decimal places, and explain how it relates to the conclusion in part b.`, 2,
    t`\((480.20, 499.80)\); 500 lies outside the interval, which is consistent with rejecting \(H_0\).`,
    t`\(490 \pm 1.96 \times 5\). 1 mark for the interval, 1 mark for the comment.`),
])

export const ITEMS = S.items
