// VCE Specialist Mathematics Unit 3 & 4 — Practice set 4.
// Answers verified in checks/set4.py.
import { t, AOS, part, makeSet, curve, slopeField, steps, axes, arc } from './sm.mjs'

const { PF, FG, CX, CA, VE, ST } = AOS
const S = makeSet(4)

// ════════════════ Examination 1 ════════════════

S.ex1(PF, 'advanced', t`Let \(f(x) = xe^{-x}\), and let \(f^{(n)}(x)\) denote the \(n\)th derivative of \(f(x)\). Prove by mathematical induction that \(f^{(n)}(x) = (-1)^n(x - n)e^{-x}\) for all \(n \in \N\).`, [
  part('', '', 3,
    t`True for \(n = 1\): \(f'(x) = (1 - x)e^{-x} = (-1)(x - 1)e^{-x}\). If \(f^{(k)}(x) = (-1)^k(x - k)e^{-x}\), differentiating gives \((-1)^{k+1}(x - (k + 1))e^{-x}\).`,
    t`Base case: \(f'(x) = e^{-x} - xe^{-x} = -(x - 1)e^{-x}\), which is the formula with \(n = 1\). Inductive step: assume \(f^{(k)}(x) = (-1)^k(x - k)e^{-x}\). Then by the product rule \[f^{(k+1)}(x) = (-1)^k\left[e^{-x} - (x - k)e^{-x}\right] = (-1)^k(k + 1 - x)e^{-x} = (-1)^{k+1}\big(x - (k + 1)\big)e^{-x},\] the formula with \(n = k + 1\). By induction it holds for all \(n \in \N\). Marks: 1 base case; 1 differentiating the assumed form; 1 rearranging to the \(n = k + 1\) form and concluding.`),
])

S.ex1(CX, 'proficient', t`Let \(z = \cis(\theta)\), where \(\theta \in \R\).`, [
  part('a', t`Show that \(z^n + \dfrac{1}{z^n} = 2\cos(n\theta)\) for \(n \in \Z^+\).`, 1,
    t`\(z^n + z^{-n} = \cis(n\theta) + \cis(-n\theta) = 2\cos(n\theta)\)`,
    t`By de Moivre’s theorem; the imaginary parts \(\pm\sin(n\theta)\) cancel.`),
  part('b', t`By expanding \(\left(z + \dfrac{1}{z}\right)^3\), show that \(\cos^3(\theta) = \dfrac{1}{4}\left(\cos(3\theta) + 3\cos(\theta)\right)\).`, 3,
    t`\(\left(z + z^{-1}\right)^3 = \left(z^3 + z^{-3}\right) + 3\left(z + z^{-1}\right)\), so \(8\cos^3(\theta) = 2\cos(3\theta) + 6\cos(\theta)\).`,
    t`Binomial expansion: \((z + z^{-1})^3 = z^3 + 3z + 3z^{-1} + z^{-3}\). Grouping and using part a: \((2\cos(\theta))^3 = 2\cos(3\theta) + 3 \times 2\cos(\theta)\). Divide by 8. Marks: 1 expansion; 1 grouping into \(z^n + z^{-n}\) pairs; 1 result.`),
])

S.ex1(FG, 'proficient', t`Let \(f: \R\setminus\{1\} \to \R\), \(f(x) = \dfrac{x^2}{(x - 1)^2}\).`, [
  part('a', t`Write down the equations of the asymptotes of the graph of \(f\).`, 1,
    t`\(x = 1\) and \(y = 1\)`,
    t`The denominator is zero at \(x = 1\) (the numerator is not), and \(f(x) = \left(\frac{x}{x - 1}\right)^2 \to 1\) as \(x \to \pm\infty\).`),
  part('b', t`Show that \(f'(x) = -\dfrac{2x}{(x - 1)^3}\), and hence find the coordinates of the stationary point of the graph of \(f\).`, 2,
    t`\(f'(x) = \dfrac{2x(x - 1)^2 - 2x^2(x - 1)}{(x - 1)^4} = -\dfrac{2x}{(x - 1)^3}\); stationary point \((0, 0)\).`,
    t`Cancel a factor of \(x - 1\): the numerator becomes \(2x(x - 1) - 2x^2 = -2x\). \(f'(x) = 0\) only at \(x = 0\). 1 mark for the derivative, 1 mark for the point.`),
  part('c', t`Given that \(f''(x) = \dfrac{4x + 2}{(x - 1)^4}\), find the coordinates of the point of inflection.`, 1,
    t`\(\left(-\dfrac{1}{2}, \dfrac{1}{9}\right)\)`,
    t`\(f''(x) = 0\) at \(x = -\frac{1}{2}\), and \(f''\) changes sign there (the denominator is positive). \(f\left(-\frac{1}{2}\right) = \frac{1/4}{9/4} = \frac{1}{9}\).`),
])

S.ex1(CA, 'proficient', t`A curve is defined by the parametric equations \(x = t^2\), \(y = \dfrac{2}{3}t^3\), where \(0 \le t \le 2\sqrt{2}\). Find the length of the curve.`, [
  part('', '', 3,
    t`\(\dfrac{52}{3}\)`,
    t`\(\dot{x} = 2t\), \(\dot{y} = 2t^2\), so \(\sqrt{\dot{x}^2 + \dot{y}^2} = \sqrt{4t^2(1 + t^2)} = 2t\sqrt{1 + t^2}\) for \(t \ge 0\). \[L = \int_0^{2\sqrt{2}} 2t\sqrt{1 + t^2}\,dt = \left[\frac{2}{3}(1 + t^2)^{\frac{3}{2}}\right]_0^{2\sqrt{2}} = \frac{2}{3}(27 - 1) = \frac{52}{3}.\] Marks: 1 for the integrand; 1 for the antiderivative; 1 for the value.`),
])

S.ex1(CA, 'proficient', t`A particle moves in a straight line so that its velocity \(v\) m s⁻¹ when it is \(x\) m from a point \(O\) is \(v = \dfrac{1}{x + 1}\), \(x \ge 0\). It starts at \(O\).`, [
  part('a', t`Find the acceleration of the particle when \(x = 1\).`, 2,
    t`\(-\dfrac{1}{8}\) m s⁻²`,
    t`\(a = v\dfrac{dv}{dx} = \dfrac{1}{x + 1} \times \dfrac{-1}{(x + 1)^2} = -\dfrac{1}{(x + 1)^3}\), which is \(-\frac{1}{8}\) at \(x = 1\). 1 mark for \(a = v\frac{dv}{dx}\), 1 mark for the value.`),
  part('b', t`Find the time taken for the particle to travel from \(O\) to the point where \(x = 3\).`, 2,
    t`\(\dfrac{15}{2}\) s`,
    t`\(\dfrac{dt}{dx} = \dfrac{1}{v} = x + 1\), so \(t = \displaystyle\int_0^3 (x + 1)\,dx = \frac{9}{2} + 3 = \frac{15}{2}\). 1 mark for \(\frac{dt}{dx} = \frac{1}{v}\), 1 mark for the time.`),
])

S.ex1(CA, 'proficient', t`Consider the differential equation \(\dfrac{dy}{dx} = x(1 + y^2)\), where \(y(0) = 1\).`, [
  part('a', t`Solve the differential equation, expressing \(y\) in terms of \(x\).`, 3,
    t`\(y = \tan\left(\dfrac{x^2}{2} + \dfrac{\pi}{4}\right)\)`,
    t`Separate: \(\displaystyle\int\frac{dy}{1 + y^2} = \int x\,dx\), so \(\tan^{-1}(y) = \frac{x^2}{2} + c\). \(y(0) = 1\) gives \(c = \tan^{-1}(1) = \frac{\pi}{4}\). Marks: 1 separating; 1 integrating (with \(\tan^{-1}\)); 1 the constant and \(y\).`),
  part('b', t`State the maximal interval, containing \(x = 0\), on which the solution is defined.`, 1,
    t`\(\left(-\sqrt{\dfrac{\pi}{2}}, \sqrt{\dfrac{\pi}{2}}\right)\)`,
    t`The solution comes from \(\tan^{-1}(y) = \frac{x^2}{2} + \frac{\pi}{4}\), which needs \(\frac{x^2}{2} + \frac{\pi}{4} < \frac{\pi}{2}\), that is, \(x^2 < \frac{\pi}{2}\).`),
])

S.ex1(CA, 'proficient', t`The region enclosed by the graph of \(y = \sin(2x)\) and the \(x\)-axis for \(0 \le x \le \dfrac{\pi}{2}\) is rotated about the \(x\)-axis. Find the volume of the solid formed.`, [
  part('', '', 3,
    t`\(\dfrac{\pi^2}{4}\)`,
    t`\(V = \pi\displaystyle\int_0^{\frac{\pi}{2}}\sin^2(2x)\,dx = \pi\int_0^{\frac{\pi}{2}}\frac{1 - \cos(4x)}{2}\,dx = \pi\left[\frac{x}{2} - \frac{\sin(4x)}{8}\right]_0^{\frac{\pi}{2}} = \frac{\pi^2}{4}\). Marks: 1 for the volume integral; 1 for the double-angle identity; 1 for the value.`),
])

S.ex1(ST, 'proficient', t`The time taken to complete a task is normally distributed with a standard deviation of 12 seconds. A trainer claims the mean time is 80 seconds. A supervisor thinks it is longer and will test \(H_0: \mu = 80\) against \(H_1: \mu > 80\) at the 5% level of significance, using a random sample of 36 workers. Use \(\Pr(Z > 1.645) = 0.05\).`, [
  part('a', t`Find the standard deviation of the sample mean.`, 1,
    t`2 seconds`,
    t`\(\frac{12}{\sqrt{36}} = 2\).`),
  part('b', t`Find the critical sample mean, above which \(H_0\) is rejected.`, 1,
    t`83.29 seconds`,
    t`\(80 + 1.645 \times 2 = 83.29\).`),
  part('c', t`The sample mean time is 83.8 seconds. State the conclusion of the test, giving a reason.`, 1,
    t`Reject \(H_0\): \(83.8 > 83.29\).`,
    t`The sample mean is in the critical region, so there is evidence at the 5% level that the mean time is longer than 80 seconds.`),
  part('d', t`State the probability that this test leads to a type I error.`, 1,
    t`0.05`,
    t`A type I error is rejecting \(H_0\) when it is true, which happens with probability equal to the level of significance.`),
])

S.ex1(VE, 'proficient', t`The points \(A(1, 1, 0)\), \(B(3, 2, 2)\) and \(C(2, -1, 0)\) are three vertices of a rectangle \(ABDC\).`, [
  part('a', t`Show that \(\angle BAC\) is a right angle.`, 1,
    t`\(\overrightarrow{AB} \cdot \overrightarrow{AC} = (2\ii + \jj + 2\kk) \cdot (\ii - 2\jj) = 2 - 2 + 0 = 0\)`,
    t`A zero scalar product between non-zero vectors means they are perpendicular.`),
  part('b', t`Find the area of triangle \(ABC\).`, 1,
    t`\(\dfrac{3\sqrt{5}}{2}\)`,
    t`\(|\overrightarrow{AB}| = 3\) and \(|\overrightarrow{AC}| = \sqrt{5}\); the triangle is right-angled at \(A\), so the area is \(\frac{1}{2} \times 3 \times \sqrt{5}\).`),
  part('c', t`Find the coordinates of \(D\).`, 1,
    t`\(D(4, 0, 2)\)`,
    t`\(\overrightarrow{OD} = \overrightarrow{OB} + \overrightarrow{AC} = (3, 2, 2) + (1, -2, 0)\).`),
  part('d', t`Find the Cartesian equation of the plane containing the rectangle.`, 2,
    t`\(4x + 2y - 5z = 6\)`,
    t`\(\overrightarrow{AB} \times \overrightarrow{AC} = (0 + 4)\ii - (0 - 2)\jj + (-4 - 1)\kk = 4\ii + 2\jj - 5\kk\). Substituting \(A\): \(4 + 2 - 0 = 6\). Check \(B\): \(12 + 4 - 10 = 6\). 1 mark for the normal, 1 mark for the equation.`),
])

S.ex1(VE, 'advanced', t`The position vector of a particle at time \(t\) seconds is \(\tv{r}(t) = \cos(2t)\ii + \sin(2t)\jj + t\kk\), \(t \ge 0\), with components in metres. Its path is a helix.`, [
  part('a', t`Show that the particle moves with constant speed, and state this speed.`, 2,
    t`\(|\dot{\tv{r}}(t)| = \sqrt{4\sin^2(2t) + 4\cos^2(2t) + 1} = \sqrt{5}\) m s⁻¹`,
    t`\(\dot{\tv{r}}(t) = -2\sin(2t)\ii + 2\cos(2t)\jj + \kk\). 1 mark for the velocity, 1 mark for the speed.`),
  part('b', t`Show that the acceleration of the particle is always perpendicular to its velocity.`, 2,
    t`\(\ddot{\tv{r}} \cdot \dot{\tv{r}} = 8\sin(2t)\cos(2t) - 8\sin(2t)\cos(2t) + 0 = 0\)`,
    t`\(\ddot{\tv{r}}(t) = -4\cos(2t)\ii - 4\sin(2t)\jj\). (This is always so when the speed is constant: \(\frac{d}{dt}|\dot{\tv{r}}|^2 = 2\ddot{\tv{r}} \cdot \dot{\tv{r}} = 0\).) 1 mark for the acceleration, 1 mark for the scalar product.`),
  part('c', t`Find the first time \(t > 0\) at which the particle is directly above its starting point, and the distance it has travelled along its path by then.`, 2,
    t`\(t = \pi\); \(\pi\sqrt{5}\) m`,
    t`Directly above \((1, 0, 0)\) needs \(\cos(2t) = 1\) and \(\sin(2t) = 0\), first at \(t = \pi\) (height \(\pi\)). At constant speed \(\sqrt{5}\), the distance is \(\pi\sqrt{5}\). 1 mark each.`),
])

// ════════════════ Examination 2 — Section A ════════════════

S.mc(PF, 'developing', t`The contrapositive of the statement ‘If \(x^2 \ne 4\), then \(x \ne 2\)’ is`,
  [t`If \(x \ne 2\), then \(x^2 \ne 4\).`, t`If \(x^2 = 4\), then \(x = 2\).`, t`If \(x^2 \ne 4\), then \(x = 2\).`, t`If \(x = 2\), then \(x^2 = 4\).`], 'D',
  t`The contrapositive of “if \(P\) then \(Q\)” is “if not \(Q\) then not \(P\)”: if \(x = 2\), then \(x^2 = 4\). B is the inverse (and is false, since \(x\) could be \(-2\)); A is the converse.`)

S.mc(PF, 'proficient', t`A student proves by induction that \(6^n - 1\) is divisible by 5 for all \(n \in \N\). Assuming that \(6^k - 1 = 5m\) for some integer \(m\), a correct inductive step uses`,
  [t`\(6^{k+1} - 1 = 6(6^k - 1) + 5\)`, t`\(6^{k+1} - 1 = (6^k - 1) + 5\)`, t`\(6^{k+1} - 1 = 6(6^k - 1) - 5\)`, t`\(6^{k+1} - 1 = 6^k(6 - 1)\)`], 'A',
  t`\(6(6^k - 1) + 5 = 6^{k+1} - 6 + 5 = 6^{k+1} - 1\), and the right side is \(6 \times 5m + 5 = 5(6m + 1)\). B and C are not identities; D would need \(6^{k+1} - 1 = 5 \times 6^k\), which is false.`)

S.mc(FG, 'proficient', t`The range of the function \(f: \left(-\frac{\pi}{2}, \frac{\pi}{2}\right) \to \R\), \(f(x) = 3 - 2\sec(x)\), is`,
  [t`\([1, \infty)\)`, t`\((-\infty, 1]\)`, t`\((-\infty, 1] \cup [5, \infty)\)`, t`\([-1, 1]\)`], 'B',
  t`On \(\left(-\frac{\pi}{2}, \frac{\pi}{2}\right)\), \(\cos(x) \in (0, 1]\), so \(\sec(x) \ge 1\) and \(3 - 2\sec(x) \le 1\), with no lower bound. C is the range over the whole maximal domain.`)

S.mc(FG, 'proficient', t`The range of the function with rule \(y = \dfrac{x^2 - 1}{x^2 + 1}\) is`,
  [t`\((-1, 1)\)`, t`\([-1, 1]\)`, t`\([-1, 1)\)`, t`\((-\infty, 1)\)`], 'C',
  t`\(y = 1 - \dfrac{2}{x^2 + 1}\). The fraction \(\frac{2}{x^2 + 1}\) takes every value in \((0, 2]\), so \(y \in [-1, 1)\): \(y = -1\) at \(x = 0\), and \(y = 1\) is an asymptote that is never reached.`)

S.mc(CX, 'developing', t`\(\left(\sqrt{3} + i\right)^6\) is equal to`,
  [t`\(64\)`, t`\(-64i\)`, t`\(64i\)`, t`\(-64\)`], 'D',
  t`\(\sqrt{3} + i = 2\cis\left(\frac{\pi}{6}\right)\), so the sixth power is \(64\cis(\pi) = -64\).`)

S.mc(CX, 'proficient', t`The quadratic equation \(z^2 + az + b = 0\), where \(a, b \in \R\), has \(z = 2 - 3i\) as a solution. The value of \(a + b\) is`,
  ['5', '9', '13', '17'], 'B',
  t`The other solution is the conjugate \(2 + 3i\). Sum of roots \(= 4 = -a\), so \(a = -4\); product \(= 4 + 9 = 13 = b\). So \(a + b = 9\). 17 takes \(a = 4\).`)

S.mc(CX, 'proficient', t`Which one of the following sets is represented by the shaded region of the complex plane shown below? The boundary is included.`,
  [t`\(\{z : |z| \le 2\} \cap \{z : \operatorname{Re}(z) \ge 1\}\)`, t`\(\{z : |z| \ge 2\} \cap \{z : \operatorname{Im}(z) \ge 1\}\)`, t`\(\{z : |z| \le 2\} \cap \{z : \operatorname{Im}(z) \ge 1\}\)`, t`\(\{z : |z - i| \le 2\} \cap \{z : \operatorname{Im}(z) \ge 1\}\)`], 'C',
  t`The region is the part of the disc of radius 2 centred at the origin that lies on or above the horizontal line \(\operatorname{Im}(z) = 1\). A uses a vertical line; D is a disc centred at \(i\).`,
  { diagram: { kind: 'function_graph', xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5, xStep: 1, yStep: 1, xLabel: 'Re(z)', yLabel: 'Im(z)', grid: false, equalAspect: true, width: 230,
    curves: [{ points: arc(0, 0, 2), dotted: true }, { points: [...arc(0, 0, 2, Math.PI / 6, (5 * Math.PI) / 6, 40), [-1.732, 1], [1.732, 1]] }],
    regions: [{ points: [...arc(0, 0, 2, Math.PI / 6, (5 * Math.PI) / 6, 40), [-1.732, 1]] }],
    segments: [{ from: [-2.4, 1], to: [2.4, 1], dashed: true }] } })

S.mc(CA, 'proficient', t`Which one of the following differential equations has the slope field shown below?`,
  [t`\(\dfrac{dy}{dx} = y(2 - y)\)`, t`\(\dfrac{dy}{dx} = x(2 - x)\)`, t`\(\dfrac{dy}{dx} = y(y - 2)\)`, t`\(\dfrac{dy}{dx} = 2 - y\)`], 'A',
  t`The gradients depend only on \(y\) (each row of segments is parallel), which rules out B. They are zero along \(y = 0\) and \(y = 2\), positive for \(0 < y < 2\) and negative outside that interval: \(y(2 - y)\). C has the opposite signs; D is zero only on \(y = 2\).`,
  { diagram: { kind: 'function_graph', xMin: -2.5, xMax: 2.5, yMin: -1.5, yMax: 3.5, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y', grid: false, equalAspect: true, width: 240, curves: [], segments: slopeField((x, y) => y * (2 - y), steps(-2.25, 2.25, 0.5), steps(-1, 3, 0.5), 0.34) } })

S.mc(CA, 'proficient', t`A metal rod cools according to Newton’s law of cooling. Its temperature \(T\) °C after \(t\) minutes is \(T = 20 + 60e^{-kt}\), and \(T = 50\) when \(t = 10\). The time, in minutes correct to two decimal places, taken for the rod to cool to 30 °C is`,
  ['17.92', '20.00', '25.85', '30.00'], 'C',
  t`\(50 = 20 + 60e^{-10k}\) gives \(e^{-10k} = \frac{1}{2}\), so \(k = \frac{\loge(2)}{10}\). Then \(60e^{-kt} = 10\) gives \(t = \frac{\loge(6)}{k} = \frac{10\loge(6)}{\loge(2)} \approx 25.85\). The excess temperature halves every 10 minutes, so after 20 minutes it is 35 °C and after 30 minutes 27.5 °C — the answer lies between. 17.92 is \(10\loge(6)\).`)

S.mc(CA, 'proficient', t`A particle moves in a straight line with acceleration \(a = 6t - 4\) m s⁻² at time \(t\) seconds. Initially it is at the origin with velocity 3 m s⁻¹. Its displacement from the origin, in metres, when \(t = 2\) is`,
  ['6', '7', '8', '14'], 'A',
  t`\(v = 3t^2 - 4t + 3\) and \(x = t^3 - 2t^2 + 3t\), so \(x(2) = 8 - 8 + 6 = 6\). 7 is the velocity at \(t = 2\); 14 omits the \(-4\) in the acceleration.`)

S.mc(CA, 'proficient', t`If \(y^2 = x^3\) and \(y > 0\), then \(\dfrac{d^2y}{dx^2}\) at the point \((1, 1)\) is`,
  [t`\(\dfrac{3}{4}\)`, t`\(\dfrac{3}{2}\)`, t`\(\dfrac{1}{4}\)`, t`\(-\dfrac{3}{4}\)`], 'A',
  t`\(y = x^{\frac{3}{2}}\), so \(\frac{dy}{dx} = \frac{3}{2}x^{\frac{1}{2}}\) and \(\frac{d^2y}{dx^2} = \frac{3}{4}x^{-\frac{1}{2}} = \frac{3}{4}\) at \(x = 1\). \(\frac{3}{2}\) is the first derivative.`)

S.mc(CA, 'proficient', t`The area of the region bounded by the graph of \(y = xe^{-x}\), the \(x\)-axis and the line \(x = 3\), correct to two decimal places, is`,
  ['0.05', '0.20', '0.80', '1.00'], 'C',
  t`\(\displaystyle\int_0^3 xe^{-x}\,dx = \Big[-(x + 1)e^{-x}\Big]_0^3 = 1 - 4e^{-3} \approx 0.80\). 1.00 is the area for \(x \ge 0\) without the line \(x = 3\).`)

S.mc(CA, 'proficient', t`The region bounded by the graph of \(y = \loge(x)\), the \(x\)-axis and the line \(x = e\) is rotated about the \(y\)-axis. The volume of the solid formed, correct to two decimal places, is`,
  ['2.26', '7.39', '10.04', '13.18'], 'D',
  t`For \(0 \le y \le 1\) the region runs from \(x = e^y\) to \(x = e\), so \(V = \pi\displaystyle\int_0^1\left(e^2 - e^{2y}\right)dy = \frac{\pi(e^2 + 1)}{2} \approx 13.18\). 10.04 uses only the inner radius; 2.26 rotates about the \(x\)-axis; 7.39 is \(e^2\).`)

S.mc(CA, 'proficient', t`The length of the curve \(y = x^{\frac{3}{2}}\) from \(x = 0\) to \(x = 4\), correct to two decimal places, is`,
  ['6.87', '8.94', '9.07', '12.00'], 'C',
  t`\(\displaystyle\int_0^4\sqrt{1 + \frac{9x}{4}}\,dx = \frac{8}{27}\left(10^{\frac{3}{2}} - 1\right) \approx 9.07\). 8.94 is the straight-line distance from \((0, 0)\) to \((4, 8)\), which must be shorter; 6.87 forgets to square \(\frac{dy}{dx}\).`)

S.mc(VE, 'developing', t`The angle between the vector \(\ii + \jj + \kk\) and the \(z\)-axis, correct to one decimal place, is`,
  ['35.3°', '54.7°', '60.0°', '90.0°'], 'B',
  t`\(\cos(\theta) = \frac{(\ii + \jj + \kk) \cdot \kk}{\sqrt{3}} = \frac{1}{\sqrt{3}}\), so \(\theta \approx 54.7^\circ\). 35.3° is the angle the vector makes with the \(xy\)-plane.`)

S.mc(VE, 'proficient', t`A unit vector perpendicular to both \(\ii + \jj\) and \(\jj + \kk\) is`,
  [t`\(\dfrac{1}{\sqrt{3}}(\ii + \jj + \kk)\)`, t`\(\dfrac{1}{\sqrt{2}}(\ii - \kk)\)`, t`\(\ii - \jj + \kk\)`, t`\(\dfrac{1}{\sqrt{3}}(\ii - \jj + \kk)\)`], 'D',
  t`\((\ii + \jj) \times (\jj + \kk) = \ii - \jj + \kk\), of magnitude \(\sqrt{3}\). C is perpendicular to both but not a unit vector; A is not perpendicular to either.`)

S.mc(VE, 'proficient', t`The plane that passes through the point \((1, -1, 2)\) and is perpendicular to the line \(\tv{r}(t) = t(2\ii - \jj + 3\kk)\), \(t \in \R\), has Cartesian equation`,
  [t`\(2x - y + 3z = 9\)`, t`\(2x - y + 3z = 0\)`, t`\(x - y + 2z = 14\)`, t`\(2x + y + 3z = 7\)`], 'A',
  t`The line’s direction is the plane’s normal: \(2x - y + 3z = d\), with \(d = 2 + 1 + 6 = 9\). B passes through the origin instead of the given point; C uses the point as the normal.`)

S.mc(VE, 'proficient', t`The position vector of a particle is \(\tv{r}(t) = 3\sin(2t)\ii + 4\cos(2t)\jj\), \(t \ge 0\). The maximum speed of the particle is`,
  ['4', '5', '6', '8'], 'D',
  t`\(\dot{\tv{r}}(t) = 6\cos(2t)\ii - 8\sin(2t)\jj\), so the speed squared is \(36\cos^2(2t) + 64\sin^2(2t) = 36 + 28\sin^2(2t)\), with maximum 64. 6 is the minimum speed; 5 comes from the position coefficients.`)

S.mc(ST, 'proficient', t`The random variable \(X\) is normally distributed with mean 20 and standard deviation 3. If \(T\) is the sum of four independent observations of \(X\), then \(\Pr(T > 85)\), correct to four decimal places, is`,
  ['0.0478', '0.2023', '0.3385', '0.7977'], 'B',
  t`\(T\) is normal with mean 80 and variance \(4 \times 9 = 36\), so \(\Pr(T > 85) = \Pr\left(Z > \frac{5}{6}\right) \approx 0.2023\). 0.3385 uses \(4X\) (standard deviation 12); 0.0478 uses a standard deviation of 3.`)

S.mc(ST, 'proficient', t`A 95% confidence interval for a population mean, based on a random sample of 25 and a known population standard deviation \(\sigma\), is \((48.04, 51.96)\). The value of \(\sigma\), correct to the nearest whole number, is`,
  ['2', '5', '10', '25'], 'B',
  t`The half-width is \(1.96 = 1.96 \times \frac{\sigma}{\sqrt{25}}\), so \(\sigma = 5\). 25 is the variance.`)

// ════════════════ Examination 2 — Section B ════════════════

S.ex2(FG, 'advanced', t`Consider the family of functions with rule \(f(x) = \dfrac{1}{x^2 - 2x + a}\), where \(a \in \R\).`, [
  part('a', t`For \(a = 5\), find the maximum value of \(f\) and state the range of \(f\).`, 2,
    t`Maximum \(\frac{1}{4}\) (at \(x = 1\)); range \(\left(0, \frac{1}{4}\right]\)`,
    t`\(x^2 - 2x + 5 = (x - 1)^2 + 4 \ge 4\), so \(f(x) \le \frac{1}{4}\), and \(f(x) \to 0^+\) as \(x \to \pm\infty\). 1 mark each.`),
  part('b', t`For \(a = 5\), find the coordinates of the points of inflection of the graph of \(f\).`, 2,
    t`\(\left(1 \pm \dfrac{2\sqrt{3}}{3}, \dfrac{3}{16}\right)\)`,
    t`Solving \(f''(x) = 0\) (by CAS) gives \((x - 1)^2 = \frac{4}{3}\). Then \(x^2 - 2x + 5 = \frac{4}{3} + 4 = \frac{16}{3}\), so \(y = \frac{3}{16}\). 1 mark for the \(x\)-values, 1 mark for the coordinates.`),
  part('c', t`For \(a = 5\), the region under the graph of \(f\) for \(0 \le x \le 2\) is rotated about the \(x\)-axis. Find the volume of the solid formed, correct to three decimal places.`, 1,
    t`0.339`,
    t`\(\pi\displaystyle\int_0^2\frac{dx}{\left((x - 1)^2 + 4\right)^2} \approx 0.339\).`),
  part('d', t`Find the set of values of \(a\) for which the graph of \(f\) has two vertical asymptotes.`, 1,
    t`\(a < 1\)`,
    t`\(x^2 - 2x + a = 0\) has two distinct real roots when \(4 - 4a > 0\).`),
  part('e', t`For \(a = 1\), describe the graph of \(f\) in terms of a transformation of the graph of \(y = \dfrac{1}{x^2}\).`, 1,
    t`A translation of 1 unit in the positive \(x\) direction.`,
    t`\(f(x) = \frac{1}{(x - 1)^2}\), with a single vertical asymptote \(x = 1\).`),
  part('f', t`For \(a = -3\), express \(f(x)\) in partial fractions.`, 1,
    t`\(\dfrac{1}{4(x - 3)} - \dfrac{1}{4(x + 1)}\)`,
    t`\(x^2 - 2x - 3 = (x - 3)(x + 1)\); \(1 = A(x + 1) + B(x - 3)\) gives \(A = \frac{1}{4}\), \(B = -\frac{1}{4}\).`),
  part('g', t`For \(a = -3\), find the area of the region bounded by the graph of \(f\), the \(x\)-axis and the lines \(x = 4\) and \(x = 6\). Give your answer in the form \(\dfrac{1}{4}\loge\left(\dfrac{p}{q}\right)\), where \(p, q \in \Z^+\).`, 2,
    t`\(\dfrac{1}{4}\loge\left(\dfrac{15}{7}\right)\)`,
    t`\(\frac{1}{4}\Big[\loge|x - 3| - \loge|x + 1|\Big]_4^6 = \frac{1}{4}\left(\loge(3) - \loge(7) - \loge(1) + \loge(5)\right) = \frac{1}{4}\loge\left(\frac{15}{7}\right)\). 1 mark for the antiderivative, 1 mark for the answer.`),
])

S.ex2(CX, 'advanced', t`This question uses de Moivre’s theorem to find exact values related to \(\cos\left(\dfrac{\pi}{9}\right)\).`, [
  part('a', t`By expanding \((\cos(\theta) + i\sin(\theta))^3\) and using de Moivre’s theorem, show that \(\cos(3\theta) = 4\cos^3(\theta) - 3\cos(\theta)\).`, 2,
    t`Real part of \(\cos^3(\theta) + 3i\cos^2(\theta)\sin(\theta) - 3\cos(\theta)\sin^2(\theta) - i\sin^3(\theta)\) is \(\cos^3(\theta) - 3\cos(\theta)(1 - \cos^2(\theta))\).`,
    t`By de Moivre’s theorem the left side is \(\cos(3\theta) + i\sin(3\theta)\). Equating real parts: \(\cos(3\theta) = \cos^3(\theta) - 3\cos(\theta)\sin^2(\theta) = 4\cos^3(\theta) - 3\cos(\theta)\). 1 mark for the expansion, 1 mark for equating real parts and simplifying.`),
  part('b', t`Hence show that \(x = \cos\left(\dfrac{\pi}{9}\right)\) is a solution of \(8x^3 - 6x - 1 = 0\).`, 2,
    t`With \(\theta = \frac{\pi}{9}\): \(\frac{1}{2} = \cos\left(\frac{\pi}{3}\right) = 4x^3 - 3x\), so \(8x^3 - 6x - 1 = 0\).`,
    t`1 mark for substituting \(\theta = \frac{\pi}{9}\), 1 mark for rearranging.`),
  part('c', t`Show that \(\cos\left(\dfrac{5\pi}{9}\right)\) and \(\cos\left(\dfrac{7\pi}{9}\right)\) are the other two solutions of \(8x^3 - 6x - 1 = 0\).`, 2,
    t`\(3 \times \frac{5\pi}{9} = \frac{5\pi}{3}\) and \(3 \times \frac{7\pi}{9} = \frac{7\pi}{3}\) both have cosine \(\frac{1}{2}\).`,
    t`Any \(\theta\) with \(\cos(3\theta) = \frac{1}{2}\) gives a solution \(x = \cos(\theta)\). The three values \(\cos\left(\frac{\pi}{9}\right) \approx 0.940\), \(\cos\left(\frac{5\pi}{9}\right) \approx -0.174\) and \(\cos\left(\frac{7\pi}{9}\right) \approx -0.766\) are distinct, and a cubic has at most three solutions. 1 mark for each justification.`),
  part('d', t`Hence find the exact value of \(\cos\left(\dfrac{\pi}{9}\right)\cos\left(\dfrac{5\pi}{9}\right)\cos\left(\dfrac{7\pi}{9}\right)\).`, 1,
    t`\(\dfrac{1}{8}\)`,
    t`For \(8x^3 + 0x^2 - 6x - 1 = 0\) the product of the roots is \(-\frac{-1}{8} = \frac{1}{8}\).`),
  part('e', t`Show that every solution of \(z^6 - z^3 + 1 = 0\) has modulus 1, and find the solutions in polar form. Hence explain how they are related to part c.`, 3,
    t`\(z = \cis\left(\pm\dfrac{\pi}{9}\right), \cis\left(\pm\dfrac{5\pi}{9}\right), \cis\left(\pm\dfrac{7\pi}{9}\right)\); their real parts are the solutions of \(8x^3 - 6x - 1 = 0\).`,
    t`With \(u = z^3\): \(u^2 - u + 1 = 0\) gives \(u = \frac{1 \pm \sqrt{3}i}{2} = \cis\left(\pm\frac{\pi}{3}\right)\), of modulus 1, so \(|z| = 1\). Then \(z^3 = \cis\left(\frac{\pi}{3}\right)\) gives arguments \(\frac{\pi}{9}, \frac{7\pi}{9}, -\frac{5\pi}{9}\), and the conjugates come from \(\cis\left(-\frac{\pi}{3}\right)\). Marks: 1 for the quadratic in \(z^3\); 1 for all six solutions; 1 for noting their real parts are the numbers in part c.`),
])

S.ex2(CA, 'advanced', t`A patient receives a drug through a drip. The amount of drug in the patient’s bloodstream, \(x\) mg, \(t\) hours after the drip starts, satisfies \(\dfrac{dx}{dt} = 5 - 0.25x\), where \(x(0) = 0\).`, [
  part('a', t`Solve the differential equation to show that \(x = 20\left(1 - e^{-0.25t}\right)\).`, 2,
    t`\(\displaystyle\int\frac{dx}{5 - 0.25x} = \int dt\) gives \(-4\loge|5 - 0.25x| = t + c\); \(x(0) = 0\) gives the result.`,
    t`\(5 - 0.25x = 5e^{-0.25t}\) (the constant from \(x(0) = 0\)), so \(0.25x = 5(1 - e^{-0.25t})\). 1 mark for separating and integrating, 1 mark for using the initial condition.`),
  part('b', t`State the limiting amount of drug in the bloodstream.`, 1,
    t`20 mg`,
    t`\(e^{-0.25t} \to 0\) as \(t \to \infty\) (equivalently, \(\frac{dx}{dt} = 0\) when \(x = 20\)).`),
  part('c', t`Find the time taken for the amount to reach 90% of this limiting value, correct to two decimal places.`, 1,
    t`9.21 h`,
    t`\(1 - e^{-0.25t} = 0.9\) gives \(t = 4\loge(10) \approx 9.21\).`),
  part('d', t`The drip is stopped after 8 hours, and the drug then leaves the bloodstream according to \(\dfrac{dx}{dt} = -0.25x\). Find the time, measured from when the drip started, at which the amount first falls below 5 mg. Give your answer in hours correct to two decimal places.`, 2,
    t`12.96 h`,
    t`\(x(8) = 20(1 - e^{-2}) \approx 17.293\). After that, \(x = 17.293e^{-0.25(t - 8)}\), and \(x = 5\) when \(t = 8 + 4\loge\left(\frac{17.293}{5}\right) \approx 12.96\). 1 mark for \(x(8)\), 1 mark for the time.`),
  part('e', t`Use Euler’s method with a step size of 1 hour to estimate the amount of drug after 2 hours of the drip, and explain why the estimate is larger than the exact value.`, 2,
    t`8.75 mg; the solution is concave down, so each Euler step overshoots.`,
    t`\(x_1 = 0 + 1 \times 5 = 5\), \(x_2 = 5 + 1 \times (5 - 1.25) = 8.75\). The exact value is \(20(1 - e^{-0.5}) \approx 7.87\). Since \(\frac{d^2x}{dt^2} = -0.25\frac{dx}{dt} < 0\), the gradient decreases over each step. 1 mark for the estimate, 1 mark for the reason.`),
  part('f', t`The pseudocode below uses Euler’s method for this differential equation, but the line marked ★ is missing. Write down the missing line.`, 2,
    t`x ← x + h × (5 − 0.25 × x)`,
    t`Each pass must update \(x\) using the gradient \(5 - 0.25x\) at the start of the step, before \(t\) is advanced. 1 mark for the Euler update form, 1 mark for the correct gradient.`,
    { diagram: { kind: 'pseudocode', lines: ['t ← 0', 'x ← 0', 'h ← 1', 'while t < 2 do', '    ★', '    t ← t + h', 'end while', 'print x'] }, lines: 3 }),
])

S.ex2(CA, 'advanced', t`A bowl is formed by rotating the curve \(x = 2\sqrt{y}\), \(0 \le y \le h\), about the \(y\)-axis, where \(x\), \(y\) and \(h\) are measured in centimetres and \(h > 0\).`, [
  part('a', t`Show that the volume of the bowl is \(2\pi h^2\) cm³, and find the volume when \(h = 4\).`, 1,
    t`\(V = \pi\displaystyle\int_0^h 4y\,dy = 2\pi h^2\); \(32\pi \approx 100.53\) cm³ when \(h = 4\).`,
    t`Discs of radius \(x = 2\sqrt{y}\) have area \(4\pi y\).`),
  part('b', t`Show that the area of the curved inner surface of the bowl is \(\dfrac{8\pi}{3}\left((h + 1)^{\frac{3}{2}} - 1\right)\) cm².`, 3,
    t`\(S = \displaystyle\int_0^h 2\pi x\sqrt{1 + \left(\frac{dx}{dy}\right)^2}\,dy = 4\pi\int_0^h\sqrt{y + 1}\,dy\)`,
    t`\(\frac{dx}{dy} = \frac{1}{\sqrt{y}}\), so \(2\pi(2\sqrt{y})\sqrt{1 + \frac{1}{y}} = 4\pi\sqrt{y + 1}\). Then \(4\pi \times \frac{2}{3}\left[(y + 1)^{\frac{3}{2}}\right]_0^h\). Marks: 1 for the formula about the \(y\)-axis; 1 for simplifying the integrand; 1 for integrating.`),
  part('c', t`Find the curved surface area when \(h = 4\), correct to two decimal places.`, 1,
    t`85.29 cm²`,
    t`\(\frac{8\pi}{3}\left(5\sqrt{5} - 1\right) \approx 85.29\).`),
  part('d', t`The bowl, with \(h = 4\), is filled with water at a constant rate of 2 cm³ s⁻¹. Find the rate at which the depth of water is increasing when the depth is 2 cm.`, 2,
    t`\(\dfrac{1}{4\pi} \approx 0.0796\) cm s⁻¹`,
    t`With depth \(y\), \(V = 2\pi y^2\), so \(\frac{dV}{dt} = 4\pi y\frac{dy}{dt}\): \(2 = 8\pi\frac{dy}{dt}\). 1 mark for the chain rule, 1 mark for the rate.`),
  part('e', t`Find the time taken to fill the bowl when \(h = 4\), correct to one decimal place.`, 1,
    t`50.3 s`,
    t`\(\frac{32\pi}{2} = 16\pi \approx 50.3\).`),
  part('f', t`Find the value of \(h\), correct to two decimal places, for which the curved surface area (in cm²) is numerically equal to the volume (in cm³).`, 2,
    t`\(h \approx 3.16\)`,
    t`Solve \(\frac{8\pi}{3}\left((h + 1)^{\frac{3}{2}} - 1\right) = 2\pi h^2\) for \(h > 0\) (CAS). 1 mark for the equation, 1 mark for the value.`),
])

S.ex2(VE, 'advanced', t`A soccer ball is kicked from ground level. Its position vector, relative to the kicking point \(O\), is \(\tv{r}(t) = 15t\ii + 2t\jj + (12t - 4.9t^2)\kk\), \(t \ge 0\), until it lands. Here \(\ii\) points straight downfield, \(\jj\) points to the left, \(\kk\) points vertically up, components are in metres and \(t\) is in seconds.`, [
  part('a', t`Find the maximum height reached by the ball, in metres correct to two decimal places.`, 1,
    t`7.35 m`,
    t`The vertical velocity \(12 - 9.8t\) is zero at \(t \approx 1.224\); the height is \(\frac{12^2}{2 \times 9.8} \approx 7.35\).`),
  part('b', t`Find the time at which the ball lands and its position vector at that time. Give values correct to two decimal places.`, 2,
    t`\(t \approx 2.45\) s; \(\tv{r} \approx 36.73\ii + 4.90\jj\)`,
    t`\(12t - 4.9t^2 = 0\) gives \(t = \frac{12}{4.9} \approx 2.449\). 1 mark for the time, 1 mark for the position.`),
  part('c', t`Find the speed of the ball when it lands, in m s⁻¹ correct to two decimal places.`, 1,
    t`19.31 m s⁻¹`,
    t`\(\dot{\tv{r}} = 15\ii + 2\jj + (12 - 9.8t)\kk = 15\ii + 2\jj - 12\kk\) at landing, so the speed is \(\sqrt{373}\). It equals the launch speed, as expected without air resistance.`),
  part('d', t`Find the angle between the ball’s direction of motion and the ground as it lands, in degrees correct to one decimal place.`, 2,
    t`38.4°`,
    t`The horizontal component of velocity has magnitude \(\sqrt{15^2 + 2^2} = \sqrt{229}\) and the vertical component is \(-12\). \(\tan(\theta) = \frac{12}{\sqrt{229}}\), so \(\theta \approx 38.4^\circ\). 1 mark for the components, 1 mark for the angle.`),
  part('e', t`The goal line is the vertical plane \(x = 30\). The goal mouth occupies \(0 \le y \le 7.32\) and \(0 \le z \le 2.44\) in this plane. Determine whether the ball enters the goal, giving reasons.`, 2,
    t`No — it crosses \(x = 30\) at \(t = 2\) at height 4.4 m, over the crossbar.`,
    t`\(15t = 30\) gives \(t = 2\); then \(y = 4\) (between the posts) but \(z = 24 - 19.6 = 4.4 > 2.44\). 1 mark for the time and position, 1 mark for the conclusion.`),
  part('f', t`Find the distance travelled by the ball through the air, in metres correct to two decimal places.`, 2,
    t`40.64 m`,
    t`\(\displaystyle\int_0^{12/4.9}\sqrt{15^2 + 2^2 + (12 - 9.8t)^2}\,dt \approx 40.64\). 1 mark for the integral, 1 mark for the value.`),
])

S.ex2(ST, 'advanced', t`A lift has a maximum safe load of 1000 kg. The masses of adults using the lift are normally distributed with mean 78 kg and standard deviation 12 kg, and the masses of children are normally distributed with mean 40 kg and standard deviation 8 kg. All masses are independent.`, [
  part('a', t`Find the probability that the total mass of 12 randomly chosen adults exceeds the safe load. Give your answer correct to four decimal places.`, 2,
    t`0.0618`,
    t`Total: mean \(12 \times 78 = 936\), variance \(12 \times 144 = 1728\). \(\Pr(T > 1000) \approx 0.0618\). 1 mark for the distribution, 1 mark for the probability.`),
  part('b', t`Find the probability that the total mass of 10 adults and 5 children exceeds the safe load, correct to four decimal places.`, 2,
    t`0.3168`,
    t`Mean \(780 + 200 = 980\), variance \(1440 + 5 \times 64 = 1760\). \(\Pr(T > 1000) \approx 0.3168\). 1 mark for the distribution, 1 mark for the probability.`),
  part('c', t`Find the probability that a randomly chosen adult has more than twice the mass of a randomly chosen child, correct to four decimal places.`, 2,
    t`0.4602`,
    t`\(D = A - 2C\) is normal with mean \(78 - 80 = -2\) and variance \(144 + 4 \times 64 = 400\), so \(\Pr(D > 0) = \Pr(Z > 0.1) \approx 0.4602\). 1 mark for the variance \(144 + 2^2 \times 64\), 1 mark for the probability. Common error: \(144 + 2 \times 64\).`),
  part('d', t`The lift company wants to check whether the mean mass of adults is greater than 78 kg. A random sample of 50 adults has a mean mass of 81.2 kg. Assuming the standard deviation is 12 kg, find the \(p\) value for a test of \(H_0: \mu = 78\) against \(H_1: \mu > 78\), correct to four decimal places, and state the conclusion at the 5% level.`, 3,
    t`\(p \approx 0.0297\); reject \(H_0\).`,
    t`\(\sd(\bar{X}) = \frac{12}{\sqrt{50}} \approx 1.697\), \(z \approx 1.886\), \(p = \Pr(\bar{X} \ge 81.2) \approx 0.0297 < 0.05\). There is evidence that the mean adult mass exceeds 78 kg. Marks: 1 standard error; 1 \(p\) value; 1 conclusion.`),
  part('e', t`Find a 90% confidence interval for the mean mass of adults using this sample. Give values correct to two decimal places.`, 1,
    t`\((78.41, 83.99)\)`,
    t`\(81.2 \pm 1.6449 \times 1.697\).`),
])

export const ITEMS = S.items
