// Question text marks maths as TeX between \( … \) (inline) or \[ … \]
// (displayed). The PDFs typeset it; anything that shows text on screen without
// a maths renderer — the free practice quiz — uses this instead, which turns
// the TeX into readable linear text: \dfrac{x^2+1}{x-1} becomes (x² + 1)/(x − 1).
// Best effort by design: it covers the notation the question bank uses.

const GREEK: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ',
  vartheta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ',
  tau: 'τ', upsilon: 'υ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω', Gamma: 'Γ', Delta: 'Δ',
  Theta: 'Θ', Lambda: 'Λ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
}
const SYMBOLS: Record<string, string> = {
  times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠',
  approx: '≈', equiv: '≡', infty: '∞', to: '→', rightarrow: '→', Rightarrow: '⇒', implies: '⇒', iff: '⇔',
  Leftrightarrow: '⇔', leftarrow: '←', gets: '←', in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆', cup: '∪',
  cap: '∩', emptyset: '∅', forall: '∀', exists: '∃', neg: '¬', lnot: '¬', land: '∧', wedge: '∧', lor: '∨',
  vee: '∨', int: '∫', sum: 'Σ', prod: 'Π', partial: '∂', nabla: '∇', circ: '∘', degree: '°', ldots: '…',
  cdots: '…', dots: '…', prime: '′', angle: '∠', perp: '⊥', parallel: '∥', therefore: '∴', sim: '~',
  R: 'R', C: 'C', Z: 'Z', N: 'N', Q: 'Q', cis: 'cis', Arg: 'Arg', cosec: 'cosec', E: 'E', Var: 'Var',
  sd: 'sd', Pr: 'Pr', loge: 'logₑ', ii: 'i', jj: 'j', kk: 'k', sin: 'sin', cos: 'cos', tan: 'tan',
  sec: 'sec', cot: 'cot', log: 'log', ln: 'ln', exp: 'exp', lim: 'lim', max: 'max', min: 'min',
  quad: ' ', qquad: '  ', ',': ' ', ';': ' ', ':': ' ', '!': '', ' ': ' ', '{': '{', '}': '}', '|': '‖', '%': '%',
  displaystyle: '', textstyle: '', left: '', right: '', big: '', Big: '', bigg: '', Bigg: '', dd: 'd',
}
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '−': '⁻', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ', x: 'ˣ', '=': '⁼' }
const SUB: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '−': '₋', n: 'ₙ', e: 'ₑ', k: 'ₖ', '(': '₍', ')': '₎' }

/** Reads one argument: a {braced group} or a single character/command. */
function readArg(s: string, i: number): [string, number] {
  while (s[i] === ' ') i++
  if (s[i] === '{') {
    let depth = 0
    for (let j = i; j < s.length; j++) {
      if (s[j] === '{') depth++
      else if (s[j] === '}' && --depth === 0) return [s.slice(i + 1, j), j + 1]
    }
    return [s.slice(i + 1), s.length]
  }
  if (s[i] === '\\') {
    const m = s.slice(i).match(/^\\([a-zA-Z]+|.)/)
    if (m) return [m[0], i + m[0].length]
  }
  return [s[i] ?? '', i + 1]
}

const simple = (x: string) => /^[\w.′·παβγθλμσ√²³]+$|^[−-]?\d+(\.\d+)?$/.test(x) || x.length <= 1

function script(x: string, map: Record<string, string>, marker: string): string {
  const chars = Array.from(x)
  if (chars.length && chars.every(c => map[c])) return chars.map(c => map[c]).join('')
  return x.length === 1 ? `${marker}${x}` : `${marker}(${x})`
}

/** Converts one TeX fragment to linear text. */
export function texToPlain(tex: string): string {
  let out = ''
  let i = 0
  const s = tex
  while (i < s.length) {
    const c = s[i]
    if (c === '\\') {
      const m = s.slice(i).match(/^\\([a-zA-Z]+|.)/)
      const name = m ? m[1] : ''
      i += m ? m[0].length : 1
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
        const [a, i1] = readArg(s, i)
        const [b, i2] = readArg(s, i1)
        i = i2
        const pa = texToPlain(a), pb = texToPlain(b)
        out += `${simple(pa) ? pa : `(${pa})`}/${simple(pb) ? pb : `(${pb})`}`
      } else if (name === 'sqrt') {
        let index = ''
        if (s[i] === '[') { const j = s.indexOf(']', i); index = s.slice(i + 1, j); i = j + 1 }
        const [a, i1] = readArg(s, i)
        i = i1
        const pa = texToPlain(a)
        out += `${index ? script(index, SUP, '^') : ''}√${simple(pa) ? pa : `(${pa})`}`
      } else if (['text', 'mathrm', 'operatorname', 'mathbf', 'mathit', 'boldsymbol', 'mathbb', 'tv', 'textrm', 'mbox'].includes(name)) {
        const [a, i1] = readArg(s, i)
        i = i1
        out += name === 'text' || name === 'textrm' || name === 'mbox' ? a : texToPlain(a)
      } else if (name === 'bar' || name === 'overline') {
        const [a, i1] = readArg(s, i)
        i = i1
        out += texToPlain(a) + '̄'
      } else if (name === 'dot') {
        const [a, i1] = readArg(s, i)
        i = i1
        out += texToPlain(a) + '̇'
      } else if (name === 'hat') {
        const [a, i1] = readArg(s, i)
        i = i1
        out += texToPlain(a) + '̂'
      } else if (name === 'begin' || name === 'end') {
        const [, i1] = readArg(s, i)
        i = i1
        if (name === 'begin') out += '['
        else out += ']'
      } else if (name === '\\') {
        out += '; '
      } else if (GREEK[name]) {
        out += GREEK[name]
      } else if (name in SYMBOLS) {
        out += SYMBOLS[name]
      } else {
        out += name
      }
    } else if (c === '^' || c === '_') {
      const [a, i1] = readArg(s, i + 1)
      i = i1
      out += script(texToPlain(a), c === '^' ? SUP : SUB, c)
    } else if (c === '{' || c === '}') {
      i++
    } else if (c === '&') {
      out += ' '
      i++
    } else if (c === '-') {
      out += '−'
      i++
    } else if (c === '~') {
      out += ' '
      i++
    } else {
      out += c
      i++
    }
  }
  return out.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')
}

const MATH = /\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g

export function hasMath(text: string | undefined | null): boolean {
  return typeof text === 'string' && /\\\(|\\\[/.test(text)
}

/** Replaces every maths fragment in a piece of question text with linear text. */
export function mathToPlain(text: string): string {
  if (!hasMath(text)) return text
  return text.replace(MATH, (_m, inline: string | undefined, display: string | undefined) => texToPlain((inline ?? display ?? '').trim()))
}
