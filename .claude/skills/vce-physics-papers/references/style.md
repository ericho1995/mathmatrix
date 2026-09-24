# Style: authoring API, figures, wording, solutions

## Set file skeleton

```js
import { t, AOS, part, makeSet, axes, curve } from './phys.mjs'
import { drawing, traced } from './draw.mjs'
const { MO, FI, EL, LM, IN } = AOS
const S = makeSet(6)
S.mc(MO, 'proficient', t`stem`, ['opt A', 'opt B', 'opt C', 'opt D'], 'C', t`worked explanation`)
S.mc(EL, 'proficient', t`stem`, ['doubled | doubled', …], 'D', t`…`, { headers: ['Peak EMF', 'Frequency'] })  // table MC
S.q(MO, 'advanced', t`stem … as shown in Figure 1.`, [
  part('a', t`Calculate …`, 2, t`expected answer`, t`worked solution with marking`, { unit: 'm s⁻¹' }),
  part('b', t`On the axes below, sketch …`, 2, t`…`, t`…`, { diagram: axes({ … }) }),
], { diagram: fig.done('Figure 1') })
export const ITEMS = S.items
```

- **The `t` tag.** `t` is `String.raw`. Maths goes in `\( … \)` or `\[ … \]`; never write `${` inside it, and never put Unicode maths symbols inside `\( \)`. Units go in plain text with superscripts: m s⁻¹, N kg⁻¹, kg m s⁻¹, V m⁻¹, m² s⁻². Numbers in scientific notation go in plain text as `2.5 × 10⁴` (or TeX when inside a formula).
- **What the build does.** It joins a number to its unit ("2.0 m"), paired units ("m s⁻¹") and "Figure 3" with no-break spaces, so never add them by hand.
- **Working space.**
  - `part()` sizes the lines from the marks (1→3, 2→5, 3→7, 4→9). It uses one line fewer when there is a `unit` box and 2 lines when the part has its own diagram.
  - Override with `{ lines: n }`.
- **Answer boxes.** Give `{ unit }` on every calculation whose answer is a single quantity. Leave it off for "show that", explanations, directions and two-quantity answers.
- **Tables of data.** Use `{ kind: 'data_table', title: 'Table 1', columns, rows }` as the question diagram, with `''` for cells the student fills in. Never put tables in TeX `array`.

## Figures

**Labelling.** Number figures in order within Section B ("Figure 1" …) and reference them in the stem.
- Drawings carry the caption through `done('Figure n')`.
- Graphs carry it through `caption: 'Figure n'` on the `function_graph` object.
- Tables are titled `Table n`.
- A Section A figure has no caption and is referred to as "shown below".

**`draw.mjs` coordinates.** y points down, and every element must stay inside the width × height box (verify-bank checks this).

**Primitives**
- `line`, `arrow`, `poly`, `rect`, `circle`, `arc`, `text`, `sym`, `dot`.
- **Arc angles** are in degrees, anticlockwise from east. a0 > a1 draws clockwise, and `arrow: 'end'` shows the direction of travel.

**Mechanics**
- `block`, `ground`, `wall(x, y1, y2, side)`, `ceiling`, `pulley`, `spring`, `incline` (sets `api.top`), `angle`, `dim`, `path`.
- **Placing things on a slope.** Define `on(s, n)` along the surface, as in set 2 Figure 1 and set 5 Figure 1.
- **Trajectories.** Use `path(traced(t => y(t), 0, T, t => x(t), y => y, 40))` with a fixed px per metre, and compute T in the check script.

**Circuits**
- `resistor`, `cell`, `meter` ('A', 'V', 'G' or '~'), `lamp`, `switchOpen`, `coil`.
- **`cell()` polarity.** It always puts the long (+) plate on top (or on the left). Draw the plates by hand when the current must run the other way (set 4 Figure 6).

**Fields**
- `fieldIn` and `fieldOut` (crosses or dots on a grid), `fieldLines`, `magnet`, `plates(x, y, len, gap, topSign, bottomSign)`, `charge`.
- Keep the field markers off beams and rods. Use two blocks, or rows chosen to miss them.

**Light**
- `slits`, and `levels(x1, x2, [{ y, left, right, dash }])`.
- **Level spacing.** Space the levels schematically when they crowd, and caption "(not to scale)".

**Graphs**
- **Blank axes:** `axes({ xMin, xMax, yMin, yMax, xStep, yStep, xLabel, yLabel, width })`.
- **Data graphs:** a `function_graph` with `curves: [{ points: curve(f, a, b, n) }]` (add `dashed` for a second line), `points`, `labels: [{ x, y, text, at }]`, `regions` (shaded area) and `grid: true`.
- **Point labels.** A `points[].label` prints in a legend *under* the graph, so to put a label on the graph use `labels`.

**Traps that have bitten**
- `rect(…, { w })` treats `w` as the width. Its options can no longer override the geometry, but a thick outline needs `poly(…, { closed: true, w })`.
- Labels sitting on paths, dimension lines, hatching or plates. `dim` puts its text at `offset` from the line, and a negative offset moves it to the other side.
- A plane or arrow icon pointing the wrong way. Check every motion arrow against the text.

## Wording (VCAA register)

- **Command words.** "Calculate …", "Show that …", "Explain …", "Describe …", "State …", "Determine whether …" and "On the axes below, sketch/plot …". The multiple-choice stem ends "…is closest to" or "Which one of the following …".
- **Values and terms.** Use the given sig figs (usually 2–3). Write "Ignore air resistance", "Treat the transformers as ideal" and "light-years".
- **Multiple-choice options.** Numeric options go in ascending order with units, and conceptual options run in parallel grammar.
- **Table MC.** Use it when two effects are asked about together (peak EMF | frequency; E_k max | current; pole | force).

## Worked solutions (the `solution` argument)

Show the substituted formula and the answer. Then give the mark allocation in words, and add the most common error where there is one:

> "\(v = \sqrt{\frac{GM_E}{r}} = \ldots = 3.87 \times 10^3\) m s⁻¹. 1 mark for the relationship, 1 mark for the value. Common error: using the altitude as the radius."

- **Explanations.** Name the idea each mark is for ("1 mark for no normal force").
- **Graph and sketch answers.** Give the features that earn marks, and an accepted range for gradient-based values.

## Distractors (each should be a real error)

- **Physics slips:** forgetting the square root (v²), using sin for cos, leaving out g, radius against diameter, altitude against radius, 1/γ against γ, P/c against P/c².
- **Unit and value slips:**
  - joules against electronvolts, and nm left unconverted;
  - RMS against peak, peak against peak-to-peak;
  - V²/R with the transmission voltage;
  - the impulse given as the speed;
  - the rectangle area instead of the triangle;
  - subtracting speeds instead of velocities;
  - neighbouring spectral lines.
- **Explain one or two distractors** in the explanation ("0.75 subtracts the speeds, ignoring the change of direction").
- **Keep the answer letter balanced.** When the key would bunch, change which errors you offer, not the order (numeric options stay ascending).
