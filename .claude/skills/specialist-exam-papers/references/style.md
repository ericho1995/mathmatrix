# Authoring style for set files

## Skeleton

```js
import { t, AOS, part, makeSet, curve, param, slopeField, steps, axes, argand, arc, sectorOutline, piTicks } from './sm.mjs'
const { PF, FG, CX, CA, VE, ST } = AOS
const S = makeSet(6)                       // practice set number

S.ex1(CA, 'proficient', t`Stem with \(maths\).`, [
  part('a', t`Prompt.`, 2, t`Answer`, t`Worked solution. 1 mark for …, 1 mark for …`),
])
S.ex1(PF, 'advanced', t`Prove by induction that …`, [part('', '', 3, t`Answer`, t`Solution`)])   // no sub-parts
S.mc(VE, 'proficient', t`Stem … is`, [t`A`, t`B`, t`C`, t`D`], 'C', t`Why C; why each distractor is tempting.`)
S.ex2(ST, 'advanced', t`Context.`, [ /* parts summing to 10 marks */ ], { diagram })
export const ITEMS = S.items
```

Paper order is file order: 10 × `ex1`, then 20 × `mc`, then 6 × `ex2`. Difficulty is `developing`, `proficient` or `advanced`. `part(…, { lines: n, diagram })` overrides the working space (defaults are 4/7/10/12 lines for 1–4 marks in Exam 1 and 3/6/8/10 in Section B; a part with a diagram gets 2).

## Maths (typeset by MathJax at build time)

- Inline `\( … \)`, displayed `\[ … \]`. Always inside the `t` tag (String.raw), so single backslashes. Never `${`.
- House macros (`scripts/lib/math.mjs`): `\tv{r}` for a vector with an under-tilde, `\ii \jj \kk`, `\cis`, `\Arg`, `\loge`, `\cosec`, `\E`, `\Var`, `\sd`, `\Pr`, `\R \C \Z \N \Q`, `\overrightarrow{AB}`.
- Use `\dfrac` for fractions in running text and `\displaystyle\int` for integrals with limits; plain `\frac` inside worked solutions keeps lines short.
- Brackets for functions (`\sin(x)`, `\loge(x)`), as VCAA prints them. Units go outside the maths: `m s⁻¹`, `cm³`.
- Anything MathJax can't draw fails `gen-math`, so fix the TeX. Unicode symbols inside `\( \)` also fail — use `\le`, `\pi` and so on.
- A number without maths needs no delimiters ('0.1587'). Put numeric MC options in ascending order.

## Diagrams (`function_graph` kind, plus `pseudocode`)

- `axes({xMin,xMax,yMin,yMax,xStep,yStep})`: blank gridded axes for "sketch … on the axes below" (as a part diagram). `argand(r)` does the same for complex regions. Add `xTickLabels: piTicks(1, 4, 4)` for π/4 ticks.
- A printed graph uses `grid: false`, `curves: [{ points: curve(f, a, b) }]` (sample each branch separately around asymptotes) and `segments` (asymptotes `dashed: true`, rays, `arrow: true`). Use `regions: [{ points }]` to shade (`sectorOutline(r1, r2, a0, a1)` for complex regions, and draw the same outline as a curve for a solid boundary), `labels: [{x, y, text, at}]` for text, and `equalAspect: true` for circles.
- For a slope field: `segments: slopeField((x, y) => …, steps(-2.25, 2.25, 0.5), steps(…), 0.34)`. The lattice is offset from the axes so strokes don't cover the tick labels.
- Pseudocode: `{ kind: 'pseudocode', lines: ['x ← 0', 'while x < 2 do', '    y ← y + h × f(x, y)', 'end while', 'print y'] }`. Keywords are bolded automatically; indent with 4 spaces. A "missing line" part uses ★.
- **Never label the point a part asks for.**

## Worked solutions (the answer key is part of the product)

- `expected_answer`: the final answer in its required form, typeset.
- `explanation`: the working a strong student would write; then "1 mark for …" per mark (or "Marks: …"); then "Common error: …" where an examiner report would flag one. CAS parts say "(by CAS)" and still give the integral or equation set up.
- MC explanation: the solution, then why each named distractor is wrong. Every distractor is a specific misconception (not squaring, the wrong root, the complement angle, a one-tailed p, displacement for distance, nX for a sum), never a random number.

## Answer letters

`build.mjs` prints A–D counts per set; target 5/5/5/5 and never exceed 7. Also vary letters within a topic across sets (verify-bank warns when one topic's answers share a letter over 40%). For text options, reorder; for numeric ones, change a distractor.
