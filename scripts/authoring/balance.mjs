// Answer-position balancing for authored items.
//
// Items are written with the correct option first (correct: 0). balance():
//   - numeric options (every option starts with a number, all distinct) are
//     sorted ascending, the way real papers print them, and `correct` follows;
//   - text options are rotated so the correct one lands on the position used
//     least so far within that topic (and session), keeping distractor order.
// Items with option_diagrams, short answers, or `keep: true` are left alone
// but still counted.
const num = s => {
  const m = String(s).replace(/[−–]/g, '-').replace(/[$,\s]/g, '').match(/^-?\d*\.?\d+/)
  return m ? Number(m[0]) : NaN
}
export function balance(items) {
  const counts = {}
  const key = i => `${i.topic}|${i.calc ?? ''}`
  const bump = (i, pos) => { (counts[key(i)] ??= [0, 0, 0, 0])[pos]++ }
  // First pass: count the fixed ones and the numeric ones (their position is forced).
  const out = items.map(i => ({ ...i }))
  const textItems = []
  for (const i of out) {
    if (i.sa) continue
    if (i.option_diagrams || i.keep) { bump(i, i.correct); continue }
    if (i.correct !== 0) throw new Error(`write the correct option first: ${i.q.slice(0, 50)}`)
    const vals = i.options.map(num)
    const numeric = vals.every(v => !Number.isNaN(v)) && new Set(vals).size === vals.length
    if (numeric) {
      const right = i.options[0]
      const order = i.options.map((o, k) => [o, vals[k]]).sort((a, b) => a[1] - b[1]).map(x => x[0])
      i.options = order
      i.correct = order.indexOf(right)
      bump(i, i.correct)
    } else textItems.push(i)
  }
  // Second pass: text items fill the least-used positions.
  for (const i of textItems) {
    const c = (counts[key(i)] ??= [0, 0, 0, 0])
    const target = c.indexOf(Math.min(...c))
    const [right, ...rest] = i.options
    i.options = [...rest.slice(0, target), right, ...rest.slice(target)]
    i.correct = target
    c[target]++
  }
  for (const i of out) delete i.keep
  return out
}
