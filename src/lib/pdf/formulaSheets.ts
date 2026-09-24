// The formula sheets VCAA supplies with its mathematics examinations, laid out
// by ExamPaperDocument after the last question. A paper that asks students to
// use the formula sheet has to print one: without it, "use the formula sheet"
// questions test memory rather than the mathematics.
//
// Each cell is rich text — \( … \) is typeset maths — and scripts/gen-math.mjs
// reads this file so every formula is in the typesetting cache.

export interface FormulaRow {
  /** Printed in the narrow left column, e.g. "volume of a cone". */
  label?: string
  /** One or two formula cells. Two cells print side by side (a derivative and
   * its antiderivative, say). */
  cells: string[]
}

export interface FormulaSection {
  title: string
  rows: FormulaRow[]
}

export interface FormulaSheet {
  title: string
  sections: FormulaSection[]
}

const t = String.raw

export const SPECIALIST_FORMULA_SHEET: FormulaSheet = {
  title: 'Specialist Mathematics formulas',
  sections: [
    {
      title: 'Mensuration',
      rows: [
        { label: 'area of a circle segment', cells: [t`\(\dfrac{r^2}{2}\left(\theta - \sin(\theta)\right)\)`] },
        { label: 'volume of a cylinder', cells: [t`\(\pi r^2 h\)`] },
        { label: 'volume of a cone', cells: [t`\(\dfrac{1}{3}\pi r^2 h\)`] },
        { label: 'volume of a pyramid', cells: [t`\(\dfrac{1}{3}Ah\)`] },
        { label: 'volume of a sphere', cells: [t`\(\dfrac{4}{3}\pi r^3\)`] },
        { label: 'area of a triangle', cells: [t`\(\dfrac{1}{2}bc\sin(A)\)`] },
        { label: 'sine rule', cells: [t`\(\dfrac{a}{\sin(A)} = \dfrac{b}{\sin(B)} = \dfrac{c}{\sin(C)}\)`] },
        { label: 'cosine rule', cells: [t`\(c^2 = a^2 + b^2 - 2ab\cos(C)\)`] },
      ],
    },
    {
      title: 'Algebra, number and structure (complex numbers)',
      rows: [
        { cells: [t`\(z = x + iy = r\left(\cos(\theta) + i\sin(\theta)\right) = r\cis(\theta)\)`, t`\(|z| = \sqrt{x^2 + y^2} = r\)`] },
        { cells: [t`\(-\pi < \Arg(z) \le \pi\)`, t`\(z_1 z_2 = r_1 r_2 \cis(\theta_1 + \theta_2)\)`] },
        { cells: [t`\(\dfrac{z_1}{z_2} = \dfrac{r_1}{r_2}\cis(\theta_1 - \theta_2)\)`, t`de Moivre’s theorem  \(z^n = r^n \cis(n\theta)\)`] },
      ],
    },
    {
      title: 'Data analysis, probability and statistics',
      rows: [
        { label: t`for independent random variables \(X_1, X_2, \ldots, X_n\)`, cells: [t`\(\E(aX_1 + b) = a\E(X_1) + b\)`, t`\(\Var(aX_1 + b) = a^2\Var(X_1)\)`] },
        { cells: [t`\(\E(a_1X_1 + a_2X_2 + \cdots + a_nX_n) = a_1\E(X_1) + a_2\E(X_2) + \cdots + a_n\E(X_n)\)`] },
        { cells: [t`\(\Var(a_1X_1 + a_2X_2 + \cdots + a_nX_n) = a_1^2\Var(X_1) + a_2^2\Var(X_2) + \cdots + a_n^2\Var(X_n)\)`] },
        { label: t`for independent identically distributed variables \(X_1, X_2, \ldots, X_n\)`, cells: [t`\(\E(X_1 + X_2 + \cdots + X_n) = n\mu\)`, t`\(\Var(X_1 + X_2 + \cdots + X_n) = n\sigma^2\)`] },
        { label: t`approximate confidence interval for \(\mu\)`, cells: [t`\(\left(\bar{x} - z\dfrac{s}{\sqrt{n}},\ \bar{x} + z\dfrac{s}{\sqrt{n}}\right)\)`] },
        { label: t`distribution of sample mean \(\bar{X}\)`, cells: [t`mean  \(\E(\bar{X}) = \mu\)`, t`variance  \(\Var(\bar{X}) = \dfrac{\sigma^2}{n}\)`] },
      ],
    },
    {
      title: 'Circular (trigonometric) functions',
      rows: [
        { cells: [t`\(\cos^2(x) + \sin^2(x) = 1\)`] },
        { cells: [t`\(1 + \tan^2(x) = \sec^2(x)\)`, t`\(\cot^2(x) + 1 = \cosec^2(x)\)`] },
        { cells: [t`\(\sin(x + y) = \sin(x)\cos(y) + \cos(x)\sin(y)\)`, t`\(\sin(x - y) = \sin(x)\cos(y) - \cos(x)\sin(y)\)`] },
        { cells: [t`\(\cos(x + y) = \cos(x)\cos(y) - \sin(x)\sin(y)\)`, t`\(\cos(x - y) = \cos(x)\cos(y) + \sin(x)\sin(y)\)`] },
        { cells: [t`\(\tan(x + y) = \dfrac{\tan(x) + \tan(y)}{1 - \tan(x)\tan(y)}\)`, t`\(\tan(x - y) = \dfrac{\tan(x) - \tan(y)}{1 + \tan(x)\tan(y)}\)`] },
        { cells: [t`\(\cos(2x) = \cos^2(x) - \sin^2(x) = 2\cos^2(x) - 1 = 1 - 2\sin^2(x)\)`] },
        { cells: [t`\(\sin(2x) = 2\sin(x)\cos(x)\)`, t`\(\tan(2x) = \dfrac{2\tan(x)}{1 - \tan^2(x)}\)`] },
        { cells: [t`\(\sin^2(ax) = \dfrac{1}{2}\left(1 - \cos(2ax)\right)\)`, t`\(\cos^2(ax) = \dfrac{1}{2}\left(1 + \cos(2ax)\right)\)`] },
      ],
    },
    {
      title: 'Calculus',
      rows: [
        { cells: [t`\(\dfrac{d}{dx}\left(x^n\right) = nx^{n-1}\)`, t`\(\displaystyle\int x^n\,dx = \dfrac{1}{n+1}x^{n+1} + c,\ n \ne -1\)`] },
        { cells: [t`\(\dfrac{d}{dx}\left(e^{ax}\right) = ae^{ax}\)`, t`\(\displaystyle\int e^{ax}\,dx = \dfrac{1}{a}e^{ax} + c\)`] },
        { cells: [t`\(\dfrac{d}{dx}\left(\loge(x)\right) = \dfrac{1}{x}\)`, t`\(\displaystyle\int \dfrac{1}{x}\,dx = \loge|x| + c\)`] },
        { cells: [t`\(\dfrac{d}{dx}\left(\sin(ax)\right) = a\cos(ax)\)`, t`\(\displaystyle\int \sin(ax)\,dx = -\dfrac{1}{a}\cos(ax) + c\)`] },
        { cells: [t`\(\dfrac{d}{dx}\left(\cos(ax)\right) = -a\sin(ax)\)`, t`\(\displaystyle\int \cos(ax)\,dx = \dfrac{1}{a}\sin(ax) + c\)`] },
        { cells: [t`\(\dfrac{d}{dx}\left(\tan(ax)\right) = a\sec^2(ax)\)`, t`\(\displaystyle\int \sec^2(ax)\,dx = \dfrac{1}{a}\tan(ax) + c\)`] },
        { cells: [t`\(\dfrac{d}{dx}\left(\cot(ax)\right) = -a\cosec^2(ax)\)`, t`\(\displaystyle\int \cosec^2(ax)\,dx = -\dfrac{1}{a}\cot(ax) + c\)`] },
        { cells: [t`\(\dfrac{d}{dx}\left(\sec(ax)\right) = a\sec(ax)\tan(ax)\)`, t`\(\displaystyle\int \sec(ax)\tan(ax)\,dx = \dfrac{1}{a}\sec(ax) + c\)`] },
        { cells: [t`\(\dfrac{d}{dx}\left(\cosec(ax)\right) = -a\cosec(ax)\cot(ax)\)`, t`\(\displaystyle\int \cosec(ax)\cot(ax)\,dx = -\dfrac{1}{a}\cosec(ax) + c\)`] },
        { cells: [t`\(\dfrac{d}{dx}\left(\sin^{-1}(ax)\right) = \dfrac{a}{\sqrt{1 - (ax)^2}}\)`, t`\(\displaystyle\int \dfrac{1}{\sqrt{a^2 - x^2}}\,dx = \sin^{-1}\left(\dfrac{x}{a}\right) + c,\ a > 0\)`] },
        { cells: [t`\(\dfrac{d}{dx}\left(\cos^{-1}(ax)\right) = \dfrac{-a}{\sqrt{1 - (ax)^2}}\)`, t`\(\displaystyle\int \dfrac{-1}{\sqrt{a^2 - x^2}}\,dx = \cos^{-1}\left(\dfrac{x}{a}\right) + c,\ a > 0\)`] },
        { cells: [t`\(\dfrac{d}{dx}\left(\tan^{-1}(ax)\right) = \dfrac{a}{1 + (ax)^2}\)`, t`\(\displaystyle\int \dfrac{a}{a^2 + x^2}\,dx = \tan^{-1}\left(\dfrac{x}{a}\right) + c\)`] },
        { cells: [t`\(\displaystyle\int (ax + b)^{-1}\,dx = \dfrac{1}{a}\loge|ax + b| + c\)`, t`\(\displaystyle\int (ax + b)^n\,dx = \dfrac{1}{a(n+1)}(ax + b)^{n+1} + c,\ n \ne -1\)`] },
      ],
    },
    {
      title: 'Calculus — continued',
      rows: [
        { label: 'product rule', cells: [t`\(\dfrac{d}{dx}(uv) = u\dfrac{dv}{dx} + v\dfrac{du}{dx}\)`] },
        { label: 'quotient rule', cells: [t`\(\dfrac{d}{dx}\left(\dfrac{u}{v}\right) = \dfrac{v\dfrac{du}{dx} - u\dfrac{dv}{dx}}{v^2}\)`] },
        { label: 'chain rule', cells: [t`\(\dfrac{dy}{dx} = \dfrac{dy}{du}\dfrac{du}{dx}\)`] },
        { label: 'integration by parts', cells: [t`\(\displaystyle\int u\dfrac{dv}{dx}\,dx = uv - \int v\dfrac{du}{dx}\,dx\)`] },
        { label: 'Euler’s method', cells: [t`If \(\dfrac{dy}{dx} = f(x, y)\), \(x_0 = a\) and \(y_0 = b\), then \(x_{n+1} = x_n + h\) and \(y_{n+1} = y_n + hf(x_n, y_n)\).`] },
        { label: 'arc length parametric', cells: [t`\(\displaystyle\int_{t_1}^{t_2}\sqrt{\left(\dfrac{dx}{dt}\right)^2 + \left(\dfrac{dy}{dt}\right)^2}\,dt\)`] },
        { label: 'surface area Cartesian about the x-axis', cells: [t`\(\displaystyle\int_{x_1}^{x_2} 2\pi y\sqrt{1 + \left(\dfrac{dy}{dx}\right)^2}\,dx\)`] },
        { label: 'surface area Cartesian about the y-axis', cells: [t`\(\displaystyle\int_{y_1}^{y_2} 2\pi x\sqrt{1 + \left(\dfrac{dx}{dy}\right)^2}\,dy\)`] },
        { label: 'surface area parametric about the x-axis', cells: [t`\(\displaystyle\int_{t_1}^{t_2} 2\pi y\sqrt{\left(\dfrac{dx}{dt}\right)^2 + \left(\dfrac{dy}{dt}\right)^2}\,dt\)`] },
        { label: 'surface area parametric about the y-axis', cells: [t`\(\displaystyle\int_{t_1}^{t_2} 2\pi x\sqrt{\left(\dfrac{dx}{dt}\right)^2 + \left(\dfrac{dy}{dt}\right)^2}\,dt\)`] },
      ],
    },
    {
      title: 'Kinematics',
      rows: [
        { label: 'acceleration', cells: [t`\(a = \dfrac{d^2x}{dt^2} = \dfrac{dv}{dt} = v\dfrac{dv}{dx} = \dfrac{d}{dx}\left(\dfrac{1}{2}v^2\right)\)`] },
        { label: 'constant acceleration formulas', cells: [t`\(v = u + at\)`, t`\(s = ut + \dfrac{1}{2}at^2\)`] },
        { cells: [t`\(v^2 = u^2 + 2as\)`, t`\(s = \dfrac{1}{2}(u + v)t\)`] },
      ],
    },
    {
      title: 'Vectors in two and three dimensions',
      rows: [
        { cells: [t`\(\tv{r}(t) = x(t)\ii + y(t)\jj + z(t)\kk\)`, t`\(|\tv{r}(t)| = \sqrt{x(t)^2 + y(t)^2 + z(t)^2}\)`] },
        { cells: [t`\(\dot{\tv{r}}(t) = \dfrac{d\tv{r}}{dt} = \dfrac{dx}{dt}\ii + \dfrac{dy}{dt}\jj + \dfrac{dz}{dt}\kk\)`] },
        { label: t`for \(\tv{r}_1 = x_1\ii + y_1\jj + z_1\kk\) and \(\tv{r}_2 = x_2\ii + y_2\jj + z_2\kk\)`, cells: [t`vector scalar product  \(\tv{r}_1 \cdot \tv{r}_2 = |\tv{r}_1||\tv{r}_2|\cos(\theta) = x_1x_2 + y_1y_2 + z_1z_2\)`] },
        { cells: [t`vector cross product  \(\tv{r}_1 \times \tv{r}_2 = \begin{vmatrix} \ii & \jj & \kk \\ x_1 & y_1 & z_1 \\ x_2 & y_2 & z_2 \end{vmatrix} = (y_1z_2 - y_2z_1)\ii + (x_2z_1 - x_1z_2)\jj + (x_1y_2 - x_2y_1)\kk\)`] },
        { label: 'vector equation of a line', cells: [t`\(\tv{r}(t) = \tv{r}_1 + t\tv{r}_2 = (x_1 + x_2t)\ii + (y_1 + y_2t)\jj + (z_1 + z_2t)\kk\)`] },
        { label: 'parametric equation of a line', cells: [t`\(x(t) = x_1 + x_2t \quad y(t) = y_1 + y_2t \quad z(t) = z_1 + z_2t\)`] },
        { label: 'vector equation of a plane', cells: [t`\(\tv{r}(s, t) = \tv{r}_0 + s\tv{r}_1 + t\tv{r}_2 = (x_0 + x_1s + x_2t)\ii + (y_0 + y_1s + y_2t)\jj + (z_0 + z_1s + z_2t)\kk\)`] },
        { label: 'parametric equation of a plane', cells: [t`\(x(s, t) = x_0 + x_1s + x_2t \quad y(s, t) = y_0 + y_1s + y_2t \quad z(s, t) = z_0 + z_1s + z_2t\)`] },
        { label: 'Cartesian equation of a plane', cells: [t`\(ax + by + cz = d\)`] },
      ],
    },
  ],
}

export const FORMULA_SHEETS: Record<string, FormulaSheet> = {
  specialist_maths: SPECIALIST_FORMULA_SHEET,
}
