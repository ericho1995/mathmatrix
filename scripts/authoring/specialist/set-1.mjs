// VCE Specialist Mathematics Unit 3 & 4 — Practice set 1 (the free sample).
// Examination 1: 10 questions, 40 marks, technology-free.
// Examination 2: Section A 20 multiple choice (A–D); Section B 6 questions, 60 marks.
// Answers verified in checks/set1.py.
import { t, AOS, part, makeSet, curve, slopeField, steps, axes, argand, arc, sectorOutline } from './sm.mjs'

const { PF, FG, CX, CA, VE, ST } = AOS
const S = makeSet(1)

// ════════════════ Examination 1 ════════════════

S.ex1(PF, 'proficient', t`Prove by mathematical induction that \(25^n - 1\) is divisible by 24 for all \(n \in \N\).`, [
  part('', '', 3,
    t`True for \(n = 1\) since \(25 - 1 = 24\). If \(25^k - 1 = 24m\), then \(25^{k+1} - 1 = 24(25m + 1)\), so the statement holds for all \(n \in \N\) by induction.`,
    t`Let \(P(n)\) be the statement “\(25^n - 1\) is divisible by 24”. Base case: \(25^1 - 1 = 24\), so \(P(1)\) is true. Inductive step: assume \(P(k)\), so \(25^k - 1 = 24m\) for some \(m \in \Z\). Then \(25^{k+1} - 1 = 25 \times 25^k - 1 = 25(24m + 1) - 1 = 24 \times 25m + 24 = 24(25m + 1)\), which is divisible by 24, so \(P(k) \Rightarrow P(k+1)\). Since \(P(1)\) is true, \(P(n)\) is true for all \(n \in \N\) by the principle of mathematical induction. Marks: 1 for the base case; 1 for using the assumption to write \(25^{k+1} - 1\) as a multiple of 24; 1 for a complete conclusion. Common error: “assuming what is to be proved” by starting from \(25^{k+1} - 1 = 24p\).`),
])

S.ex1(CX, 'proficient', t`Let \(z = -1 + \sqrt{3}i\).`, [
  part('a', t`Express \(z\) in the form \(r\cis(\theta)\), where \(r > 0\) and \(-\pi < \theta \le \pi\).`, 1,
    t`\(z = 2\cis\left(\dfrac{2\pi}{3}\right)\)`,
    t`\(|z| = \sqrt{1 + 3} = 2\). \(z\) is in the second quadrant with \(\tan^{-1}(\sqrt{3}) = \frac{\pi}{3}\), so \(\Arg(z) = \pi - \frac{\pi}{3} = \frac{2\pi}{3}\). Common error: giving \(-\frac{\pi}{3}\) from \(\tan^{-1}\left(\frac{\sqrt{3}}{-1}\right)\) without checking the quadrant.`),
  part('b', t`Find the smallest positive integer \(n\) for which \(z^n\) is a positive real number, and state the value of \(z^n\) for this \(n\).`, 1,
    t`\(n = 3\), \(z^3 = 8\)`,
    t`By de Moivre’s theorem \(z^n = 2^n\cis\left(\frac{2n\pi}{3}\right)\), which is real and positive when \(\frac{2n\pi}{3}\) is a multiple of \(2\pi\), first at \(n = 3\): \(z^3 = 8\cis(2\pi) = 8\).`),
  part('c', t`Hence, find all solutions of \(z^3 - 8 = 0\), \(z \in \C\), giving your answers in Cartesian form.`, 2,
    t`\(z = 2\), \(z = -1 + \sqrt{3}i\), \(z = -1 - \sqrt{3}i\)`,
    t`From part b., \(-1 + \sqrt{3}i\) is a solution, and so is its conjugate \(-1 - \sqrt{3}i\) (the coefficients are real); \(z = 2\) is the real solution. Equivalently \(z^3 - 8 = (z - 2)(z^2 + 2z + 4)\) and \(z^2 + 2z + 4 = 0\) gives \(z = -1 \pm \sqrt{3}i\). 1 mark for the method (conjugate root theorem, factorising, or \(z = 2\cis\left(\frac{2k\pi}{3}\right)\)); 1 mark for all three solutions.`),
])

S.ex1(FG, 'proficient', t`Let \(f: \R\setminus\{1\} \to \R\), \(f(x) = \dfrac{x^2 + 3}{x - 1}\).`, [
  part('a', t`Show that \(f(x) = x + 1 + \dfrac{4}{x - 1}\).`, 1,
    t`\(x^2 + 3 = (x - 1)(x + 1) + 4\), so \(f(x) = x + 1 + \dfrac{4}{x - 1}\).`,
    t`Write the numerator as \((x^2 - 1) + 4 = (x - 1)(x + 1) + 4\) and divide each term by \(x - 1\). Working backwards is also acceptable: \(x + 1 + \frac{4}{x - 1} = \frac{(x + 1)(x - 1) + 4}{x - 1} = \frac{x^2 + 3}{x - 1}\).`),
  part('b', t`Find the coordinates of the stationary points of the graph of \(f\).`, 2,
    t`\((-1, -2)\) and \((3, 6)\)`,
    t`\(f'(x) = 1 - \dfrac{4}{(x - 1)^2} = 0\) gives \((x - 1)^2 = 4\), so \(x = -1\) or \(x = 3\). Then \(f(-1) = \frac{4}{-2} = -2\) and \(f(3) = \frac{12}{2} = 6\). 1 mark for the \(x\)-values, 1 mark for both coordinates.`),
  part('c', t`Sketch the graph of \(y = f(x)\) on the axes below. Label any asymptotes with their equations, and label the stationary points and any axis intercepts with their coordinates.`, 2,
    t`Vertical asymptote \(x = 1\); oblique asymptote \(y = x + 1\); local maximum \((-1, -2)\); local minimum \((3, 6)\); \(y\)-intercept \((0, -3)\); no \(x\)-intercepts.`,
    t`The branch for \(x < 1\) rises to the local maximum \((-1, -2)\), passes through \((0, -3)\) and falls to \(-\infty\) as \(x \to 1^-\); the branch for \(x > 1\) comes down from \(+\infty\) to the local minimum \((3, 6)\) and then approaches \(y = x + 1\) from above. There are no \(x\)-intercepts because \(x^2 + 3 > 0\). 1 mark for both asymptotes with equations; 1 mark for the correct shape with the labelled points.`,
    { diagram: axes({ xMin: -5, xMax: 7, yMin: -8, yMax: 12, xStep: 1, yStep: 2 }) }),
])

S.ex1(CA, 'proficient', t`The curve with equation \(\tan^{-1}(y) + xy^2 = \dfrac{\pi}{4}\) passes through the point \((0, 1)\). Find the equation of the tangent to the curve at this point.`, [
  part('', '', 3,
    t`\(y = 1 - 2x\)`,
    t`Differentiating implicitly with respect to \(x\): \(\dfrac{1}{1 + y^2}\dfrac{dy}{dx} + y^2 + 2xy\dfrac{dy}{dx} = 0\). At \((0, 1)\): \(\dfrac{1}{2}\dfrac{dy}{dx} + 1 = 0\), so \(\dfrac{dy}{dx} = -2\). The tangent is \(y - 1 = -2(x - 0)\), that is, \(y = 1 - 2x\). Marks: 1 for correct implicit differentiation (including the product rule on \(xy^2\)); 1 for the gradient; 1 for the equation. Common error: differentiating \(xy^2\) as \(2y\dfrac{dy}{dx}\).`),
])

S.ex1(CA, 'proficient', t`Evaluate \(\displaystyle\int_0^{\frac{\pi}{4}} x\sec^2(x)\,dx\). Give your answer in the form \(\dfrac{\pi}{a} - \dfrac{1}{b}\loge(c)\), where \(a, b, c \in \Z^+\).`, [
  part('', '', 3,
    t`\(\dfrac{\pi}{4} - \dfrac{1}{2}\loge(2)\)`,
    t`Integrate by parts with \(u = x\) and \(\dfrac{dv}{dx} = \sec^2(x)\), so \(v = \tan(x)\): \[\int_0^{\frac{\pi}{4}} x\sec^2(x)\,dx = \Big[x\tan(x)\Big]_0^{\frac{\pi}{4}} - \int_0^{\frac{\pi}{4}}\tan(x)\,dx = \frac{\pi}{4} + \Big[\loge(\cos(x))\Big]_0^{\frac{\pi}{4}} = \frac{\pi}{4} + \loge\left(\frac{1}{\sqrt{2}}\right) = \frac{\pi}{4} - \frac{1}{2}\loge(2).\] Marks: 1 for the integration by parts; 1 for \(\int\tan(x)\,dx = -\loge(\cos(x))\); 1 for the answer in the required form (\(a = 4\), \(b = 2\), \(c = 2\)).`),
])

S.ex1(CA, 'proficient', t`Consider the differential equation \(\dfrac{dy}{dx} = y(2 - y)\), where \(y(0) = 1\).`, [
  part('a', t`Express \(\dfrac{1}{y(2 - y)}\) in partial fractions.`, 1,
    t`\(\dfrac{1}{2y} + \dfrac{1}{2(2 - y)}\)`,
    t`\(\dfrac{1}{y(2 - y)} = \dfrac{A}{y} + \dfrac{B}{2 - y}\) gives \(1 = A(2 - y) + By\). Setting \(y = 0\) gives \(A = \frac{1}{2}\); setting \(y = 2\) gives \(B = \frac{1}{2}\).`),
  part('b', t`Hence, solve the differential equation, expressing \(y\) in terms of \(x\).`, 3,
    t`\(y = \dfrac{2}{1 + e^{-2x}}\) (equivalently \(y = \dfrac{2e^{2x}}{e^{2x} + 1}\))`,
    t`Separating: \(\displaystyle\int \left(\frac{1}{2y} + \frac{1}{2(2 - y)}\right)dy = \int dx\), so \(\dfrac{1}{2}\loge\left|\dfrac{y}{2 - y}\right| = x + c\). When \(x = 0\), \(y = 1\), so \(c = \frac{1}{2}\loge(1) = 0\). Since \(0 < y < 2\) near the initial condition, \(\dfrac{y}{2 - y} = e^{2x}\), so \(y = 2e^{2x} - ye^{2x}\) and \(y = \dfrac{2e^{2x}}{1 + e^{2x}} = \dfrac{2}{1 + e^{-2x}}\). Marks: 1 for separating and integrating; 1 for the constant; 1 for \(y\) in terms of \(x\). Common error: \(\int \frac{1}{2(2 - y)}\,dy = \frac{1}{2}\loge|2 - y|\) (the sign is lost).`),
])

S.ex1(ST, 'proficient', t`The masses of apples from an orchard are normally distributed with a mean of 150 g and a standard deviation of 6 g. Apples are packed four to a box, and the mass of an empty box is normally distributed with a mean of 40 g and a standard deviation of 5 g. All masses are independent of each other.`, [
  part('a', t`Find the mean and the standard deviation of the total mass \(T\) grams of a box packed with four apples.`, 2,
    t`\(\E(T) = 640\) g, \(\sd(T) = 13\) g`,
    t`\(T = X_1 + X_2 + X_3 + X_4 + W\). \(\E(T) = 4 \times 150 + 40 = 640\). \(\Var(T) = 4 \times 6^2 + 5^2 = 144 + 25 = 169\), so \(\sd(T) = 13\). 1 mark each. Common error: treating the four apples as \(4X\), giving \(\Var = 16 \times 36 + 25\) — four different apples are four independent variables.`),
  part('b', t`Given that \(\Pr(T > 666) = \Pr(Z > a)\), where \(Z\) has the standard normal distribution, find \(a\).`, 1,
    t`\(a = 2\)`,
    t`\(a = \dfrac{666 - 640}{13} = \dfrac{26}{13} = 2\).`),
  part('c', t`A random sample of 16 apples from a second orchard, whose apples also have masses with a standard deviation of 6 g, has a mean mass of 147.5 g. Using \(\Pr(-1.96 < Z < 1.96) = 0.95\), find an approximate 95% confidence interval for the mean mass of apples from the second orchard.`, 1,
    t`\((144.56, 150.44)\)`,
    t`The standard error is \(\dfrac{6}{\sqrt{16}} = 1.5\), so the interval is \(147.5 \pm 1.96 \times 1.5 = 147.5 \pm 2.94\), that is, \((144.56, 150.44)\).`),
])

S.ex1(VE, 'proficient', t`The points \(A(2, -1, 1)\), \(B(3, 1, 0)\) and \(C(1, 0, 3)\) lie in the plane \(\Pi\).`, [
  part('a', t`Show that \(\overrightarrow{AB} \times \overrightarrow{AC} = 5\ii - \jj + 3\kk\).`, 1,
    t`\(\overrightarrow{AB} = \ii + 2\jj - \kk\), \(\overrightarrow{AC} = -\ii + \jj + 2\kk\), and their cross product is \(5\ii - \jj + 3\kk\).`,
    t`\(\overrightarrow{AB} \times \overrightarrow{AC} = \begin{vmatrix} \ii & \jj & \kk \\ 1 & 2 & -1 \\ -1 & 1 & 2 \end{vmatrix} = (4 + 1)\ii - (2 - 1)\jj + (1 + 2)\kk = 5\ii - \jj + 3\kk\).`),
  part('b', t`Find the Cartesian equation of \(\Pi\).`, 1,
    t`\(5x - y + 3z = 14\)`,
    t`With normal \(5\ii - \jj + 3\kk\) and the point \(A\): \(5(2) - (-1) + 3(1) = 14\). Check with \(B\): \(15 - 1 + 0 = 14\).`),
  part('c', t`Find the area of triangle \(ABC\).`, 1,
    t`\(\dfrac{\sqrt{35}}{2}\)`,
    t`Area \(= \frac{1}{2}\left|\overrightarrow{AB} \times \overrightarrow{AC}\right| = \frac{1}{2}\sqrt{25 + 1 + 9} = \frac{\sqrt{35}}{2}\).`),
  part('d', t`Find the coordinates of the point in \(\Pi\) that is closest to the origin.`, 2,
    t`\(\left(2, -\dfrac{2}{5}, \dfrac{6}{5}\right)\)`,
    t`The closest point lies on the line through \(O\) along the normal: \(\tv{r} = \lambda(5\ii - \jj + 3\kk)\). Substituting into the plane: \(25\lambda + \lambda + 9\lambda = 14\), so \(\lambda = \frac{2}{5}\), giving \(\left(2, -\frac{2}{5}, \frac{6}{5}\right)\). 1 mark for the method, 1 mark for the point.`),
])

S.ex1(VE, 'advanced', t`The position vector of a particle at time \(t\) seconds is \(\tv{r}(t) = e^t\cos(t)\ii + e^t\sin(t)\jj\), \(t \ge 0\), where displacement components are measured in metres.`, [
  part('a', t`Find the velocity vector \(\dot{\tv{r}}(t)\).`, 1,
    t`\(\dot{\tv{r}}(t) = e^t(\cos(t) - \sin(t))\ii + e^t(\sin(t) + \cos(t))\jj\)`,
    t`Apply the product rule to each component.`),
  part('b', t`Show that the speed of the particle at time \(t\) is \(\sqrt{2}e^t\) m s⁻¹.`, 2,
    t`\(|\dot{\tv{r}}(t)| = e^t\sqrt{(\cos t - \sin t)^2 + (\sin t + \cos t)^2} = \sqrt{2}e^t\)`,
    t`\((\cos(t) - \sin(t))^2 + (\sin(t) + \cos(t))^2 = 2\cos^2(t) + 2\sin^2(t) = 2\) (the cross terms cancel), so \(|\dot{\tv{r}}(t)| = e^t\sqrt{2}\). 1 mark for the expression for the speed, 1 mark for simplifying with \(\cos^2(t) + \sin^2(t) = 1\).`),
  part('c', t`Find the distance travelled by the particle from \(t = 0\) to \(t = \loge(3)\).`, 1,
    t`\(2\sqrt{2}\) m`,
    t`\(\displaystyle\int_0^{\loge(3)} \sqrt{2}e^t\,dt = \sqrt{2}\left(e^{\loge(3)} - 1\right) = 2\sqrt{2}\).`),
  part('d', t`Show that the angle between \(\tv{r}(t)\) and \(\dot{\tv{r}}(t)\) does not depend on \(t\), and state this angle.`, 2,
    t`\(\cos(\theta) = \dfrac{\tv{r} \cdot \dot{\tv{r}}}{|\tv{r}||\dot{\tv{r}}|} = \dfrac{e^{2t}}{e^t \times \sqrt{2}e^t} = \dfrac{1}{\sqrt{2}}\), so \(\theta = \dfrac{\pi}{4}\) for all \(t\).`,
    t`\(\tv{r} \cdot \dot{\tv{r}} = e^{2t}\left[\cos(t)(\cos(t) - \sin(t)) + \sin(t)(\sin(t) + \cos(t))\right] = e^{2t}\), \(|\tv{r}| = e^t\) and \(|\dot{\tv{r}}| = \sqrt{2}e^t\). The ratio \(\frac{1}{\sqrt{2}}\) is free of \(t\). 1 mark for the scalar product, 1 mark for the angle \(\frac{\pi}{4}\) (or 45°). The path is an equiangular spiral.`),
])

S.ex1(PF, 'advanced', t`Use proof by contradiction to prove that \(\log_2(3)\) is irrational.`, [
  part('', '', 3,
    t`Assuming \(\log_2(3) = \dfrac{p}{q}\) with \(p, q \in \Z^+\) gives \(2^p = 3^q\), an even number equal to an odd number — a contradiction.`,
    t`Suppose, for a contradiction, that \(\log_2(3)\) is rational. Since \(3 > 1\), \(\log_2(3) > 0\), so \(\log_2(3) = \frac{p}{q}\) for some \(p, q \in \Z^+\). Then \(2^{\frac{p}{q}} = 3\), so \(2^p = 3^q\). But \(2^p\) is even (as \(p \ge 1\)) and \(3^q\) is odd, so they cannot be equal. This contradiction shows that \(\log_2(3)\) is irrational. Marks: 1 for the assumption in the form \(\frac{p}{q}\) with positive integers; 1 for \(2^p = 3^q\); 1 for the parity contradiction and conclusion.`),
])

// ════════════════ Examination 2 — Section A ════════════════

S.mc(PF, 'developing', t`Consider the statement ‘For all real numbers \(x\), if \(x > 2\), then \(x^2 > 4\).’ The negation of this statement is`,
  [t`For all real numbers \(x\), if \(x > 2\), then \(x^2 \le 4\).`, t`There exists a real number \(x\) such that \(x > 2\) and \(x^2 \le 4\).`, t`There exists a real number \(x\) such that \(x \le 2\) and \(x^2 \le 4\).`, t`For all real numbers \(x\), if \(x^2 \le 4\), then \(x \le 2\).`], 'B',
  t`The negation of “for all \(x\), \(P(x) \Rightarrow Q(x)\)” is “there exists \(x\) with \(P(x)\) and not \(Q(x)\)”. A negates only the conclusion and keeps “for all”; D is the contrapositive, which is equivalent to the original statement, not its negation.`)

S.mc(PF, 'developing', t`Which one of the following values of \(n\) is a counterexample to the statement ‘If \(n^2\) is divisible by 4, then \(n\) is divisible by 4’, where \(n \in \N\)?`,
  ['3', '4', '6', '8'], 'C',
  t`A counterexample makes the hypothesis true and the conclusion false. \(6^2 = 36\) is divisible by 4 but 6 is not. For \(n = 3\) the hypothesis is false; for 4 and 8 the conclusion is true.`)

S.mc(FG, 'proficient', t`The graph of \(y = \dfrac{x^2 - 4}{x^2 - x - 2}\) has`,
  [t`a vertical asymptote \(x = -1\) and a horizontal asymptote \(y = 1\) only`, t`vertical asymptotes \(x = -1\) and \(x = 2\), and a horizontal asymptote \(y = 1\)`, t`a vertical asymptote \(x = -1\) and a horizontal asymptote \(y = 0\)`, t`vertical asymptotes \(x = -2\) and \(x = 1\), and a horizontal asymptote \(y = 1\)`], 'A',
  t`\(\dfrac{x^2 - 4}{x^2 - x - 2} = \dfrac{(x - 2)(x + 2)}{(x - 2)(x + 1)} = \dfrac{x + 2}{x + 1}\), \(x \ne 2\). The factor \(x - 2\) cancels, so \(x = 2\) is a point of discontinuity (a hole at \(\left(2, \frac{4}{3}\right)\)), not an asymptote. The only vertical asymptote is \(x = -1\), and \(y \to 1\) as \(x \to \pm\infty\).`)

S.mc(FG, 'proficient', t`The maximal domain and the range of the function with rule \(f(x) = 2\sin^{-1}(1 - 3x) + \dfrac{\pi}{2}\) are respectively`,
  [t`\(\left[0, \frac{2}{3}\right]\) and \([0, \pi]\)`, t`\(\left[-\frac{2}{3}, 0\right]\) and \(\left[-\frac{\pi}{2}, \frac{3\pi}{2}\right]\)`, t`\(\left[0, \frac{2}{3}\right]\) and \([-\pi, \pi]\)`, t`\(\left[0, \frac{2}{3}\right]\) and \(\left[-\frac{\pi}{2}, \frac{3\pi}{2}\right]\)`], 'D',
  t`The domain needs \(-1 \le 1 - 3x \le 1\), so \(0 \le x \le \frac{2}{3}\). \(\sin^{-1}\) has range \(\left[-\frac{\pi}{2}, \frac{\pi}{2}\right]\); doubling gives \([-\pi, \pi]\) and adding \(\frac{\pi}{2}\) gives \(\left[-\frac{\pi}{2}, \frac{3\pi}{2}\right]\). Option C omits the translation.`)

S.mc(CX, 'proficient', t`If \(z = 1 - i\) and \(w = \sqrt{3} + i\), then \(\Arg\left(\dfrac{z^5}{w^2}\right)\) is`,
  [t`\(\dfrac{5\pi}{12}\)`, t`\(\dfrac{7\pi}{12}\)`, t`\(-\dfrac{7\pi}{12}\)`, t`\(-\dfrac{19\pi}{12}\)`], 'A',
  t`\(\Arg(z) = -\frac{\pi}{4}\) and \(\Arg(w) = \frac{\pi}{6}\), so an argument of \(\frac{z^5}{w^2}\) is \(5\left(-\frac{\pi}{4}\right) - 2\left(\frac{\pi}{6}\right) = -\frac{19\pi}{12}\). This is outside \((-\pi, \pi]\); adding \(2\pi\) gives the principal argument \(\frac{5\pi}{12}\).`)

S.mc(CX, 'proficient', t`The shaded region of the complex plane shown below, including its boundary, is described by`,
  [t`\(\{z : 1 \le |z| \le 2\} \cap \left\{z : 0 \le \Arg(z) \le \frac{\pi}{3}\right\}\)`, t`\(\{z : 1 \le |z| \le 2\} \cap \left\{z : 0 \le \Arg(z) \le \frac{\pi}{6}\right\}\)`, t`\(\{z : |z| \le 2\} \cap \left\{z : 0 \le \Arg(z) \le \frac{\pi}{3}\right\}\)`, t`\(\{z : 1 \le |z - 1| \le 2\} \cap \left\{z : 0 \le \Arg(z) \le \frac{\pi}{3}\right\}\)`], 'A',
  t`The region lies between the circles of radius 1 and 2 centred at the origin. Its upper edge is the ray through \((1, \sqrt{3})\), which makes an angle \(\tan^{-1}(\sqrt{3}) = \frac{\pi}{3}\) with the positive real axis, and its lower edge is the positive real axis. C would include the points inside the unit circle; D describes circles centred at \(1\).`,
  { diagram: { kind: 'function_graph', xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5, xStep: 1, yStep: 1, xLabel: 'Re(z)', yLabel: 'Im(z)', grid: false, equalAspect: true, width: 230,
    curves: [{ points: arc(0, 0, 2), dotted: true }, { points: arc(0, 0, 1), dotted: true }, { points: sectorOutline(1, 2, 0, Math.PI / 3) }],
    regions: [{ points: sectorOutline(1, 2, 0, Math.PI / 3) }],
    segments: [{ from: [0, 0], to: [1, 1.732], dashed: true }],
    points: [{ x: 1, y: 1.732 }], labels: [{ x: 1, y: 1.732, text: '(1, √3)', at: 'ne' }] } })

S.mc(CX, 'proficient', t`The polynomial \(P(z) = z^3 + bz^2 + cz - 10\), where \(b, c \in \R\), has \(z = 2 + i\) as a root. The value of \(b\) is`,
  [t`\(-13\)`, t`\(-6\)`, t`\(-2\)`, t`\(6\)`], 'B',
  t`The coefficients are real, so \(2 - i\) is also a root. The product of the roots of \(z^3 + bz^2 + cz + d\) is \(-d = 10\), and \((2 + i)(2 - i) = 5\), so the third root is 2. The sum of the roots is \(-b = 6\), so \(b = -6\). (\(c = 13\) is the sum of the products of pairs.)`)

S.mc(CA, 'proficient', t`The pseudocode shown below uses Euler’s method to approximate the solution of a differential equation. The value printed when the pseudocode is run is`,
  ['1.220', '1.331', '1.362', '1.395'], 'C',
  t`Each pass computes \(y \leftarrow y + 0.1(x + y)\) and then \(x \leftarrow x + 0.1\): \(y_1 = 1 + 0.1(0 + 1) = 1.1\), \(y_2 = 1.1 + 0.1(0.1 + 1.1) = 1.22\), \(y_3 = 1.22 + 0.1(0.2 + 1.22) = 1.362\). 1.220 stops after two passes; 1.331 ignores \(x\) in \(f\); 1.395 updates \(x\) before \(y\).`,
  { diagram: { kind: 'pseudocode', lines: ['define f(x, y)', '    return x + y', 'x ← 0', 'y ← 1', 'h ← 0.1', 'for i from 1 to 3', '    y ← y + h × f(x, y)', '    x ← x + h', 'end for', 'print y'] } })

S.mc(CA, 'proficient', t`The slope field shown below represents the differential equation`,
  [t`\(\dfrac{dy}{dx} = x + y\)`, t`\(\dfrac{dy}{dx} = xy\)`, t`\(\dfrac{dy}{dx} = y - x\)`, t`\(\dfrac{dy}{dx} = x - y\)`], 'D',
  t`Along the line \(y = x\) the segments are horizontal, so \(\frac{dy}{dx} = 0\) when \(y = x\); this rules out A and B. At \((1, 0)\) the gradient is positive, so the rule is \(x - y\) (C gives \(-1\) there).`,
  { diagram: { kind: 'function_graph', xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y', grid: false, equalAspect: true, width: 240, curves: [], segments: slopeField((x, y) => x - y, steps(-2.25, 2.25, 0.5), steps(-2.25, 2.25, 0.5), 0.34) } })

S.mc(CA, 'proficient', t`A particle starts from rest and moves in a straight line with acceleration \(a = 2 - v\) m s⁻², where \(v\) m s⁻¹ is its velocity at time \(t\) seconds. The distance, in metres correct to two decimal places, travelled by the particle in the first 2 seconds is`,
  ['1.73', '2.00', '2.27', '4.00'], 'C',
  t`\(\dfrac{dv}{dt} = 2 - v\) with \(v(0) = 0\) gives \(v = 2(1 - e^{-t})\). The distance is \(\displaystyle\int_0^2 2(1 - e^{-t})\,dt = 2 + 2e^{-2} \approx 2.27\). 1.73 is the velocity at \(t = 2\); 4.00 assumes the limiting velocity 2 m s⁻¹ throughout.`)

S.mc(CA, 'proficient', t`The region enclosed by the curve \(y = x^2\), the \(y\)-axis and the line \(y = 4\), for \(x \ge 0\), is rotated about the \(y\)-axis. The volume of the solid of revolution formed is`,
  [t`\(\dfrac{16\pi}{3}\)`, t`\(8\pi\)`, t`\(16\pi\)`, t`\(\dfrac{128\pi}{5}\)`], 'B',
  t`About the \(y\)-axis the radius is \(x = \sqrt{y}\): \(V = \pi\displaystyle\int_0^4 x^2\,dy = \pi\int_0^4 y\,dy = 8\pi\). \(\frac{16\pi}{3}\) uses \(\sqrt{y}\) without squaring; \(16\pi\) is the enclosing cylinder; \(\frac{128\pi}{5}\) rotates the region under the curve about the \(x\)-axis.`)

S.mc(CA, 'proficient', t`The length of the curve \(y = \loge(\cos(x))\) from \(x = 0\) to \(x = \dfrac{\pi}{3}\) is`,
  [t`\(\loge(2)\)`, t`\(\dfrac{\pi}{3}\)`, t`\(\loge\left(2 + \sqrt{3}\right)\)`, t`\(\sqrt{3}\)`], 'C',
  t`\(\dfrac{dy}{dx} = -\tan(x)\), so \(\sqrt{1 + \tan^2(x)} = \sec(x)\) on this interval and \(L = \displaystyle\int_0^{\frac{\pi}{3}}\sec(x)\,dx = \loge\left(\sec\tfrac{\pi}{3} + \tan\tfrac{\pi}{3}\right) = \loge(2 + \sqrt{3}) \approx 1.317\) (by CAS). \(\sqrt{3}\) integrates \(\sec^2(x)\) instead; \(\loge(2)\) is only the vertical drop.`)

S.mc(CA, 'proficient', t`Using the substitution \(u = 1 - x\), the integral \(\displaystyle\int_0^1 x\sqrt{1 - x}\,dx\) is equal to`,
  [t`\(\displaystyle\int_0^1 \left(u^{\frac{1}{2}} - u^{\frac{3}{2}}\right)du\)`, t`\(\displaystyle\int_1^0 \left(u^{\frac{1}{2}} - u^{\frac{3}{2}}\right)du\)`, t`\(\displaystyle\int_0^1 \left(u^{\frac{3}{2}} - u^{\frac{1}{2}}\right)du\)`, t`\(\displaystyle\int_0^1 (1 - u)u\,du\)`], 'A',
  t`\(x = 1 - u\) and \(dx = -du\); the terminals \(x = 0, 1\) become \(u = 1, 0\). So the integral is \(\displaystyle\int_1^0 (1 - u)\sqrt{u}\,(-du) = \int_0^1 \left(u^{\frac{1}{2}} - u^{\frac{3}{2}}\right)du\). B forgets the factor \(-1\) from \(dx = -du\); C reverses the terminals as well; D drops the square root.`)

S.mc(CA, 'proficient', t`A tank initially holds 100 L of water in which 5 kg of salt is dissolved. Brine containing 0.2 kg of salt per litre flows into the tank at 3 L per minute, and the well-mixed solution flows out at 2 L per minute. If \(Q\) kg is the amount of salt in the tank after \(t\) minutes, then \(Q\) satisfies`,
  [t`\(\dfrac{dQ}{dt} = 0.6 - \dfrac{Q}{50}\)`, t`\(\dfrac{dQ}{dt} = 0.6 - \dfrac{2Q}{100 + t}\)`, t`\(\dfrac{dQ}{dt} = 0.6 - \dfrac{3Q}{100 + t}\)`, t`\(\dfrac{dQ}{dt} = 0.2 - \dfrac{2Q}{100 + t}\)`], 'B',
  t`Salt enters at \(0.2 \times 3 = 0.6\) kg per minute. The volume after \(t\) minutes is \(100 + 3t - 2t = 100 + t\) litres, so the concentration is \(\frac{Q}{100 + t}\) and salt leaves at \(\frac{2Q}{100 + t}\) kg per minute. A treats the volume as constant.`)

S.mc(VE, 'developing', t`Let \(\tv{a} = 2\ii - \jj + m\kk\) and \(\tv{b} = \ii + 3\jj + 2\kk\), where \(m \in \R\). The vector \(\tv{a} - \tv{b}\) is perpendicular to \(\tv{b}\) when \(m\) equals`,
  [t`\(-\dfrac{15}{2}\)`, t`\(\dfrac{1}{2}\)`, t`\(\dfrac{7}{2}\)`, t`\(\dfrac{15}{2}\)`], 'D',
  t`\(\tv{a} - \tv{b} = \ii - 4\jj + (m - 2)\kk\) and \((\tv{a} - \tv{b}) \cdot \tv{b} = 1 - 12 + 2(m - 2) = 2m - 15 = 0\), so \(m = \frac{15}{2}\). \(\frac{1}{2}\) solves \(\tv{a} \cdot \tv{b} = 0\) instead.`)

S.mc(VE, 'proficient', t`The vector component of \(\tv{a} = 3\ii - \jj + 2\kk\) perpendicular to \(\tv{b} = \ii + \jj + \kk\) is`,
  [t`\(\dfrac{4}{3}(\ii + \jj + \kk)\)`, t`\(\dfrac{1}{3}(13\ii + \jj + 10\kk)\)`, t`\(\dfrac{1}{3}(5\ii + 7\jj + 2\kk)\)`, t`\(\dfrac{1}{3}(5\ii - 7\jj + 2\kk)\)`], 'D',
  t`The vector resolute parallel to \(\tv{b}\) is \(\dfrac{\tv{a} \cdot \tv{b}}{\tv{b} \cdot \tv{b}}\tv{b} = \dfrac{4}{3}(\ii + \jj + \kk)\) (option A). The perpendicular component is \(\tv{a} - \dfrac{4}{3}(\ii + \jj + \kk) = \dfrac{5}{3}\ii - \dfrac{7}{3}\jj + \dfrac{2}{3}\kk\). B adds the resolute instead of subtracting it.`)

S.mc(VE, 'proficient', t`The shortest distance from the point \(P(1, 2, 3)\) to the line with vector equation \(\tv{r}(t) = \ii - \kk + t(\ii + 2\jj + 2\kk)\), \(t \in \R\), is`,
  [t`\(2\)`, t`\(4\)`, t`\(2\sqrt{5}\)`, t`\(6\)`], 'A',
  t`With \(A(1, 0, -1)\) on the line and direction \(\tv{d} = \ii + 2\jj + 2\kk\) (\(|\tv{d}| = 3\)): \(\overrightarrow{AP} = 2\jj + 4\kk\) and \(\left|\overrightarrow{AP} \times \tv{d}\right| = |-4\ii + 4\jj - 2\kk| = 6\), so the distance is \(\frac{6}{3} = 2\). 4 is the scalar resolute of \(\overrightarrow{AP}\) along the line; \(2\sqrt{5} = |\overrightarrow{AP}|\).`)

S.mc(VE, 'proficient', t`The position vector of a particle at time \(t\) seconds is \(\tv{r}(t) = (t^2 - 4t)\ii + 3t\jj\), \(t \ge 0\), with components in metres. The minimum speed of the particle, in m s⁻¹, is`,
  [t`\(0\)`, t`\(3\)`, t`\(\sqrt{13}\)`, t`\(5\)`], 'B',
  t`\(\dot{\tv{r}}(t) = (2t - 4)\ii + 3\jj\), so the speed is \(\sqrt{(2t - 4)^2 + 9}\), which is least when \(t = 2\): 3 m s⁻¹. The \(\jj\)-component is never zero, so the particle is never at rest. 5 is the initial speed.`)

S.mc(ST, 'proficient', t`The random variables \(X\) and \(Y\) are independent, with \(X\) normally distributed with mean 50 and standard deviation 3, and \(Y\) normally distributed with mean 48 and standard deviation 4. \(\Pr(X > Y)\), correct to four decimal places, is`,
  ['0.3446', '0.6125', '0.6554', '0.7752'], 'C',
  t`\(X - Y\) is normal with mean \(50 - 48 = 2\) and variance \(3^2 + 4^2 = 25\), so \(\Pr(X > Y) = \Pr(X - Y > 0) = \Pr\left(Z > -\frac{2}{5}\right) \approx 0.6554\). 0.3446 is \(\Pr(Y > X)\); 0.6125 adds the standard deviations (\(3 + 4\)); 0.7752 uses \(\sqrt{7}\).`)

S.mc(ST, 'proficient', t`The masses of a product are normally distributed with standard deviation 5 g. To test \(H_0: \mu = 100\) against \(H_1: \mu > 100\), a random sample of 25 items is taken and its mean mass is 101.2 g. At the 5% level of significance, the \(p\) value and the conclusion are`,
  [t`\(p = 0.1151\); reject \(H_0\)`, t`\(p = 0.2301\); do not reject \(H_0\)`, t`\(p = 0.3849\); do not reject \(H_0\)`, t`\(p = 0.1151\); do not reject \(H_0\)`], 'D',
  t`The standard error is \(\frac{5}{\sqrt{25}} = 1\), so \(z = 1.2\) and \(p = \Pr(\bar{X} \ge 101.2) = \Pr(Z \ge 1.2) \approx 0.1151 > 0.05\): do not reject \(H_0\). 0.2301 is the two-tailed value, which does not match \(H_1\); 0.3849 is \(\Pr(0 < Z < 1.2)\).`)

// ════════════════ Examination 2 — Section B ════════════════

const f1 = x => (4 * x) / (x * x - 1)
S.ex2(FG, 'advanced', t`Let \(f: \R\setminus\{-1, 1\} \to \R\), \(f(x) = \dfrac{4x}{x^2 - 1}\). Part of the graph of \(y = f(x)\) is shown below.`, [
  part('a', t`Express \(f(x)\) in partial fractions.`, 1,
    t`\(f(x) = \dfrac{2}{x - 1} + \dfrac{2}{x + 1}\)`,
    t`\(\dfrac{4x}{(x - 1)(x + 1)} = \dfrac{A}{x - 1} + \dfrac{B}{x + 1}\) gives \(4x = A(x + 1) + B(x - 1)\); \(x = 1\) gives \(A = 2\) and \(x = -1\) gives \(B = 2\).`),
  part('b', t`Show that \(f'(x) = -\dfrac{4(x^2 + 1)}{(x^2 - 1)^2}\) and hence explain why the graph of \(f\) has no stationary points.`, 2,
    t`By the quotient rule \(f'(x) = \dfrac{4(x^2 - 1) - 8x^2}{(x^2 - 1)^2} = -\dfrac{4(x^2 + 1)}{(x^2 - 1)^2}\), which is negative for every \(x\) in the domain, so \(f'(x) \ne 0\).`,
    t`1 mark for the derivative (from the quotient rule or from the partial fractions, \(-\frac{2}{(x - 1)^2} - \frac{2}{(x + 1)^2}\)); 1 mark for the reason: the numerator \(4(x^2 + 1)\) is never zero, so \(f'(x) < 0\) throughout.`),
  part('c', t`Find the area of the region bounded by the graph of \(f\), the \(x\)-axis and the lines \(x = 2\) and \(x = 4\). Give your answer in the form \(\loge(a)\), where \(a \in \Z^+\).`, 2,
    t`\(\loge(25)\)`,
    t`\(\displaystyle\int_2^4 \left(\frac{2}{x - 1} + \frac{2}{x + 1}\right)dx = \Big[2\loge|x^2 - 1|\Big]_2^4 = 2\loge(15) - 2\loge(3) = 2\loge(5) = \loge(25)\). 1 mark for the antiderivative, 1 mark for the answer.`),
  part('d', t`The region described in part c. is rotated about the \(x\)-axis to form a solid of revolution. Find the volume of the solid, correct to two decimal places.`, 2,
    t`17.44 cubic units`,
    t`\(V = \pi\displaystyle\int_2^4 \frac{16x^2}{(x^2 - 1)^2}\,dx \approx 17.44\) (by CAS). 1 mark for the integral, 1 mark for the value. Common error: omitting the square, \(\pi\int_2^4 f(x)\,dx\).`),
  part('e', t`Let \(g(x) = f(x) + kx\), where \(k \in \R\). Find the value of \(k\) for which the graph of \(g\) has a stationary point at \(x = 2\).`, 1,
    t`\(k = \dfrac{20}{9}\)`,
    t`\(g'(x) = -\dfrac{4(x^2 + 1)}{(x^2 - 1)^2} + k\), and \(g'(2) = -\frac{20}{9} + k = 0\).`),
  part('f', t`For the value of \(k\) found in part e., find the coordinates of all the stationary points of the graph of \(g\).`, 2,
    t`\(\left(2, \dfrac{64}{9}\right)\) and \(\left(-2, -\dfrac{64}{9}\right)\)`,
    t`\(g'(x) = 0\) gives \(20(x^2 - 1)^2 = 36(x^2 + 1)\). With \(u = x^2\): \(5u^2 - 19u - 4 = 0\), so \((5u + 1)(u - 4) = 0\) and \(u = 4\) (\(u = -\frac{1}{5}\) has no real \(x\)). So \(x = \pm 2\), with \(g(2) = \frac{8}{3} + \frac{40}{9} = \frac{64}{9}\) and \(g(-2) = -\frac{64}{9}\) (\(g\) is odd). 1 mark for \(x = \pm 2\), 1 mark for the coordinates.`),
], { diagram: { kind: 'function_graph', xMin: -4, xMax: 4, yMin: -8, yMax: 8, xStep: 1, yStep: 2, xLabel: 'x', yLabel: 'y', grid: false, width: 300,
  curves: [{ points: curve(f1, -4, -1.05, 80) }, { points: curve(f1, -0.95, 0.95, 80) }, { points: curve(f1, 1.05, 4, 80) }],
  segments: [{ from: [-1, -8], to: [-1, 8], dashed: true }, { from: [1, -8], to: [1, 8], dashed: true }] } })

S.ex2(CX, 'advanced', t`Let \(P(z) = z^4 - 2z^3 + 3z^2 - 2z + 2\), where \(z \in \C\).`, [
  part('a', t`Verify that \(z = 1 + i\) is a solution of \(P(z) = 0\).`, 1,
    t`\(P(1 + i) = -4 - 2(-2 + 2i) + 3(2i) - 2(1 + i) + 2 = 0\)`,
    t`\((1 + i)^2 = 2i\), \((1 + i)^3 = -2 + 2i\) and \((1 + i)^4 = -4\), so \(P(1 + i) = -4 + 4 - 4i + 6i - 2 - 2i + 2 = 0\).`),
  part('b', t`Hence, find all the solutions of \(P(z) = 0\).`, 2,
    t`\(z = 1 + i,\ 1 - i,\ i,\ -i\)`,
    t`\(P\) has real coefficients, so \(1 - i\) is also a solution and \((z - 1 - i)(z - 1 + i) = z^2 - 2z + 2\) is a factor. Dividing, \(P(z) = (z^2 - 2z + 2)(z^2 + 1)\), and \(z^2 + 1 = 0\) gives \(z = \pm i\). 1 mark for the conjugate and the quadratic factor, 1 mark for all four solutions.`),
  part('c', t`Plot the solutions of \(P(z) = 0\) on the Argand diagram below.`, 1,
    t`Points at \((1, 1)\), \((1, -1)\), \((0, 1)\) and \((0, -1)\).`,
    t`The four points are the vertices of a rectangle with sides 1 and 2.`,
    { diagram: argand(2) }),
  part('d', t`State the equation of the perpendicular bisector of the line segment joining the points representing \(i\) and \(1 + i\), in the form \(\operatorname{Re}(z) = a\).`, 1,
    t`\(\operatorname{Re}(z) = \dfrac{1}{2}\)`,
    t`The segment is horizontal from \((0, 1)\) to \((1, 1)\), so its perpendicular bisector is the vertical line through \(\left(\frac{1}{2}, 1\right)\).`),
  part('e', t`Find the equation of the circle that passes through all four solutions of \(P(z) = 0\), in the form \(|z - z_0| = r\), where \(z_0 \in \C\) and \(r \in \R^+\).`, 2,
    t`\(\left|z - \dfrac{1}{2}\right| = \dfrac{\sqrt{5}}{2}\)`,
    t`By symmetry the centre lies on \(\operatorname{Re}(z) = \frac{1}{2}\) (part d.) and on the real axis, so \(z_0 = \frac{1}{2}\). The radius is the distance to \(i\): \(\sqrt{\frac{1}{4} + 1} = \frac{\sqrt{5}}{2}\). 1 mark for the centre, 1 mark for the radius.`),
  part('f', t`Let \(S = \left\{z \in \C : \left|z - \tfrac{1}{2}\right| \le \tfrac{\sqrt{5}}{2}\right\} \cap \left\{z \in \C : \operatorname{Re}(z) \ge \tfrac{1}{2}\right\}\). Find the area of the region of the complex plane represented by \(S\).`, 1,
    t`\(\dfrac{5\pi}{8}\)`,
    t`\(S\) is the right half of a disc of radius \(\frac{\sqrt{5}}{2}\): \(\frac{1}{2}\pi\left(\frac{5}{4}\right) = \frac{5\pi}{8}\).`),
  part('g', t`Find the maximum value of \(|z|\) for \(z \in S\).`, 2,
    t`\(\dfrac{1 + \sqrt{5}}{2}\)`,
    t`\(|z|\) is the distance from the origin. The point of the circle furthest from \(O\) lies on the line through \(O\) and the centre \(\frac{1}{2}\), beyond the centre: \(z = \frac{1}{2} + \frac{\sqrt{5}}{2}\), which has \(\operatorname{Re}(z) \ge \frac{1}{2}\) so it is in \(S\). The maximum is \(\frac{1}{2} + \frac{\sqrt{5}}{2} = \frac{1 + \sqrt{5}}{2}\). 1 mark for locating the point, 1 mark for the value.`),
])

S.ex2(CA, 'advanced', t`A skydiver falls vertically from rest. Before her parachute opens, her acceleration is modelled by \(a = 9.8 - 0.02v^2\), where \(v\) m s⁻¹ is her speed \(t\) seconds after she leaves the aircraft and \(a\) is measured in m s⁻².`, [
  part('a', t`Find her limiting (terminal) speed. Give your answer in the form \(a\sqrt{b}\) m s⁻¹, where \(a, b \in \Z^+\).`, 1,
    t`\(7\sqrt{10}\) m s⁻¹ (about 22.14 m s⁻¹)`,
    t`The speed approaches the value where \(a = 0\): \(0.02v^2 = 9.8\), so \(v^2 = 490\) and \(v = \sqrt{490} = 7\sqrt{10}\).`),
  part('b', t`Write down a definite integral that gives the time taken for her speed to reach 20 m s⁻¹, and evaluate it correct to two decimal places.`, 2,
    t`\(t = \displaystyle\int_0^{20}\frac{1}{9.8 - 0.02v^2}\,dv \approx 3.37\) s`,
    t`From \(\frac{dv}{dt} = 9.8 - 0.02v^2\), \(\frac{dt}{dv} = \frac{1}{9.8 - 0.02v^2}\). 1 mark for the integral (terminals included), 1 mark for 3.37.`),
  part('c', t`Use \(a = v\dfrac{dv}{dx}\), where \(x\) metres is the distance she has fallen, to show that the distance she falls while her speed increases from 0 to \(V\) m s⁻¹ is \(x = 25\loge\left(\dfrac{490}{490 - V^2}\right)\).`, 2,
    t`\(x = \displaystyle\int_0^V \frac{v}{9.8 - 0.02v^2}\,dv = \Big[-25\loge(9.8 - 0.02v^2)\Big]_0^V = 25\loge\left(\frac{490}{490 - V^2}\right)\)`,
    t`\(\frac{dx}{dv} = \frac{v}{9.8 - 0.02v^2}\). Since \(\frac{d}{dv}(9.8 - 0.02v^2) = -0.04v\), \(\int \frac{v}{9.8 - 0.02v^2}\,dv = -25\loge(9.8 - 0.02v^2)\). Evaluating: \(25\loge\left(\frac{9.8}{9.8 - 0.02V^2}\right) = 25\loge\left(\frac{490}{490 - V^2}\right)\). 1 mark for setting up the integral, 1 mark for the antiderivative and simplification.`),
  part('d', t`Find the distance she falls before her speed reaches 20 m s⁻¹, correct to two decimal places.`, 1,
    t`42.36 m`,
    t`\(25\loge\left(\frac{490}{90}\right) = 25\loge\left(\frac{49}{9}\right) \approx 42.36\).`),
  part('e', t`Use Euler’s method with a step size of 0.5 seconds to estimate her speed 1 second after she leaves the aircraft. Give your answer correct to two decimal places.`, 2,
    t`9.56 m s⁻¹`,
    t`\(v_{n+1} = v_n + 0.5(9.8 - 0.02v_n^2)\), \(v_0 = 0\): \(v_1 = 4.9\), then \(v_2 = 4.9 + 0.5(9.8 - 0.02 \times 4.9^2) = 4.9 + 4.6599 = 9.5599\). 1 mark for \(v_1\), 1 mark for 9.56.`),
  part('f', t`When her speed reaches 20 m s⁻¹, the parachute opens and her acceleration is then modelled by \(a = 9.8 - 0.2v^2\). Find the time taken, after the parachute opens, for her speed to decrease to 7.5 m s⁻¹. Give your answer correct to two decimal places.`, 2,
    t`0.94 s`,
    t`\(t = \displaystyle\int_{20}^{7.5}\frac{1}{9.8 - 0.2v^2}\,dv \approx 0.94\) (both the integrand and \(dv\) are negative here, so the integral is positive). Her new limiting speed is 7 m s⁻¹, so 7.5 m s⁻¹ is reached in finite time. 1 mark for the integral with the correct terminals, 1 mark for 0.94.`),
])

S.ex2(VE, 'advanced', t`The lines \(L_1\) and \(L_2\) have vector equations \(\tv{r}_1(s) = \ii + 2\jj + s(\ii - \jj + 2\kk)\) and \(\tv{r}_2(t) = \jj + 3\kk + t(2\ii + \jj - \kk)\), where \(s, t \in \R\).`, [
  part('a', t`Show that \(L_1\) and \(L_2\) are not parallel and do not intersect.`, 2,
    t`The direction vectors are not scalar multiples; equating components gives \(s = \frac{1}{3}\), \(t = \frac{2}{3}\) from the \(\ii\) and \(\jj\) components, which fail the \(\kk\) component.`,
    t`\(\ii - \jj + 2\kk\) is not a multiple of \(2\ii + \jj - \kk\), so the lines are not parallel. If they met: \(1 + s = 2t\), \(2 - s = 1 + t\), \(2s = 3 - t\). The first two give \(t = \frac{2}{3}\), \(s = \frac{1}{3}\); then \(2s = \frac{2}{3}\) but \(3 - t = \frac{7}{3}\). No solution, so the lines are skew. 1 mark for each property.`),
  part('b', t`Find a vector that is perpendicular to both \(L_1\) and \(L_2\).`, 1,
    t`\(-\ii + 5\jj + 3\kk\) (or any non-zero multiple)`,
    t`\((\ii - \jj + 2\kk) \times (2\ii + \jj - \kk) = (1 - 2)\ii - (-1 - 4)\jj + (1 + 2)\kk = -\ii + 5\jj + 3\kk\).`),
  part('c', t`Find the shortest distance between \(L_1\) and \(L_2\).`, 2,
    t`\(\dfrac{\sqrt{35}}{7}\) (about 0.845)`,
    t`Project the vector between points on the lines onto the common normal \(\tv{n} = -\ii + 5\jj + 3\kk\): \(\left|(\jj + 3\kk - \ii - 2\jj) \cdot \hat{\tv{n}}\right| = \dfrac{|1 - 5 + 9|}{\sqrt{35}} = \dfrac{5}{\sqrt{35}} = \dfrac{\sqrt{35}}{7}\). 1 mark for the method, 1 mark for the value.`),
  part('d', t`Find the Cartesian equation of the plane \(\Pi\) that contains \(L_1\) and is parallel to \(L_2\).`, 2,
    t`\(-x + 5y + 3z = 9\)`,
    t`The normal is perpendicular to both directions, so it is \(-\ii + 5\jj + 3\kk\) from part b. The plane contains \((1, 2, 0)\): \(-1 + 10 + 0 = 9\). 1 mark for the normal, 1 mark for the equation.`),
  part('e', t`The point \(Q(0, 1, 3)\) lies on \(L_2\). Find the coordinates of the point in \(\Pi\) that is closest to \(Q\).`, 3,
    t`\(\left(\dfrac{1}{7}, \dfrac{2}{7}, \dfrac{18}{7}\right)\)`,
    t`Move from \(Q\) along the normal: \(\tv{r} = (0, 1, 3) + \lambda(-1, 5, 3)\). Substituting into \(-x + 5y + 3z = 9\): \(\lambda + 5 + 25\lambda + 9 + 9\lambda = 9\), so \(35\lambda = -5\) and \(\lambda = -\frac{1}{7}\). The point is \(\left(\frac{1}{7}, \frac{2}{7}, \frac{18}{7}\right)\); its distance from \(Q\) is \(\frac{\sqrt{35}}{7}\), agreeing with part c. 1 mark for the line along the normal, 1 mark for \(\lambda\), 1 mark for the point.`),
])

S.ex2(VE, 'advanced', t`A ball is hit from a point 2 m above level ground. Its position vector, relative to a point \(O\) on the ground, is \(\tv{r}_B(t) = 10t\ii + (2 + 12t - 4.9t^2)\jj\), \(t \ge 0\), where \(\ii\) is a unit vector horizontally forwards, \(\jj\) is a unit vector vertically up, displacement components are measured in metres and time \(t\) in seconds.`, [
  part('a', t`Find the maximum height reached by the ball and the time at which it occurs. Give both values correct to two decimal places.`, 2,
    t`9.35 m, when \(t \approx 1.22\) s`,
    t`The vertical velocity is \(12 - 9.8t = 0\) when \(t = \frac{12}{9.8} \approx 1.22\); the height is then \(2 + \frac{12^2}{2 \times 9.8} \approx 9.35\). 1 mark each.`),
  part('b', t`Find the speed of the ball when \(t = 1\), in m s⁻¹ correct to two decimal places.`, 1,
    t`10.24 m s⁻¹`,
    t`\(\dot{\tv{r}}_B(1) = 10\ii + 2.2\jj\), so the speed is \(\sqrt{100 + 4.84} \approx 10.24\).`),
  part('c', t`Find the Cartesian equation of the path of the ball.`, 1,
    t`\(y = 2 + \dfrac{6x}{5} - \dfrac{49x^2}{1000}\)`,
    t`\(x = 10t\) gives \(t = \frac{x}{10}\), so \(y = 2 + 12\left(\frac{x}{10}\right) - 4.9\left(\frac{x}{10}\right)^2 = 2 + 1.2x - 0.049x^2\).`),
  part('d', t`A drone moves in the same vertical plane, with position vector \(\tv{r}_D(t) = (30 - 5t)\ii + (7.4 - 0.5t)\jj\), \(t \ge 0\). Show that the ball hits the drone, and find the position vector of the point of impact.`, 2,
    t`Both are at \(20\ii + 6.4\jj\) when \(t = 2\).`,
    t`Equal \(\ii\)-components: \(10t = 30 - 5t\), so \(t = 2\). At \(t = 2\) the ball’s height is \(2 + 24 - 19.6 = 6.4\) and the drone’s is \(7.4 - 1 = 6.4\), so they are at the same point at the same time. 1 mark for \(t = 2\) from one component and checking the other, 1 mark for \(20\ii + 6.4\jj\). Note: it is not enough to show the paths cross — the times must agree.`),
  part('e', t`Find the angle between the directions of motion of the ball and the drone at the moment of impact, in degrees correct to one decimal place.`, 2,
    t`137.1°`,
    t`\(\dot{\tv{r}}_B(2) = 10\ii - 7.6\jj\) and \(\dot{\tv{r}}_D = -5\ii - 0.5\jj\). \(\cos(\theta) = \dfrac{-50 + 3.8}{\sqrt{157.76}\sqrt{25.25}} \approx -0.7321\), so \(\theta \approx 137.1^\circ\). 1 mark for both velocities, 1 mark for the angle.`),
  part('f', t`Find the distance travelled by the ball from when it is hit until it hits the drone, correct to two decimal places.`, 2,
    t`23.19 m`,
    t`\(\displaystyle\int_0^2 \sqrt{100 + (12 - 9.8t)^2}\,dt \approx 23.19\) (by CAS). 1 mark for the integral, 1 mark for the value. Common error: finding the straight-line distance \(|\tv{r}_B(2) - \tv{r}_B(0)|\).`),
])

S.ex2(ST, 'advanced', t`A café’s coffee machine is set to dispense 250 mL of coffee per cup. The volume dispensed is normally distributed with a standard deviation of 4 mL.`, [
  part('a', t`The mean volume of a random sample of 25 cups is 248.3 mL. Find a 95% confidence interval for the mean volume \(\mu\) mL dispensed by the machine. Give the values correct to two decimal places.`, 1,
    t`\((246.73, 249.87)\)`,
    t`\(248.3 \pm 1.96 \times \frac{4}{\sqrt{25}} = 248.3 \pm 1.568\) (using \(z = 1.95996\) on CAS).`),
  part('b', t`Explain whether this confidence interval supports the claim that the machine dispenses a mean of 250 mL.`, 1,
    t`No — 250 lies outside the interval.`,
    t`All plausible values of \(\mu\) at this level of confidence are below 250, so the interval does not support the claim.`),
  part('c', t`The owner tests \(H_0: \mu = 250\) against \(H_1: \mu < 250\) using the sample from part a. Find the \(p\) value of the test, correct to four decimal places.`, 2,
    t`\(p \approx 0.0168\)`,
    t`\(p = \Pr(\bar{X} \le 248.3 \mid \mu = 250)\), where \(\bar{X}\) is normal with mean 250 and standard deviation \(\frac{4}{5} = 0.8\). \(z = \frac{248.3 - 250}{0.8} = -2.125\), so \(p \approx 0.0168\). 1 mark for the distribution of \(\bar{X}\), 1 mark for the value.`),
  part('d', t`State the conclusion of the test at the 5% level of significance, giving a reason.`, 1,
    t`Reject \(H_0\), because \(p \approx 0.0168 < 0.05\).`,
    t`There is evidence at the 5% level that the mean volume is less than 250 mL.`),
  part('e', t`For tests of this kind, using a sample of 25 cups at the 5% level of significance, find the critical sample mean — the largest sample mean for which \(H_0\) is rejected. Give your answer correct to two decimal places.`, 1,
    t`248.68 mL`,
    t`\(\Pr(\bar{X} \le c \mid \mu = 250) = 0.05\) gives \(c = 250 - 1.6449 \times 0.8 \approx 248.68\).`),
  part('f', t`Suppose the true mean volume is 248 mL. Find the probability that a test of this kind fails to reject \(H_0\) (a type II error). Give your answer correct to three decimal places.`, 2,
    t`0.196`,
    t`A type II error occurs when \(\bar{X} > 248.68\) although \(\mu = 248\): \(\Pr(\bar{X} > 248.684 \mid \mu = 248) = \Pr(Z > 0.855) \approx 0.196\). 1 mark for the probability statement, 1 mark for the value.`),
  part('g', t`Find the smallest sample size for which the width of a 95% confidence interval for \(\mu\) is at most 2 mL.`, 2,
    t`62 cups`,
    t`The width is \(2 \times 1.96 \times \frac{4}{\sqrt{n}} \le 2\), so \(\sqrt{n} \ge 7.84\) and \(n \ge 61.46\). The sample size must be a whole number, so \(n = 62\). 1 mark for the inequality, 1 mark for rounding up to 62.`),
])

export const ITEMS = S.items
