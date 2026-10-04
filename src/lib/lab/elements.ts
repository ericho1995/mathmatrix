// The first 20 elements, as Years 7–10 and VCE Unit 1 meet them: symbol,
// name, the mass number of the most common isotope, and where each sits in
// the periodic table (period, and group 1–18).

export type ElementKind = 'metal' | 'nonmetal' | 'metalloid' | 'noble'

export interface Element {
  z: number
  symbol: string
  name: string
  /** Mass number of the most common isotope. */
  mass: number
  period: number
  group: number
  kind: ElementKind
}

export const ELEMENTS: Element[] = [
  { z: 1, symbol: 'H', name: 'hydrogen', mass: 1, period: 1, group: 1, kind: 'nonmetal' },
  { z: 2, symbol: 'He', name: 'helium', mass: 4, period: 1, group: 18, kind: 'noble' },
  { z: 3, symbol: 'Li', name: 'lithium', mass: 7, period: 2, group: 1, kind: 'metal' },
  { z: 4, symbol: 'Be', name: 'beryllium', mass: 9, period: 2, group: 2, kind: 'metal' },
  { z: 5, symbol: 'B', name: 'boron', mass: 11, period: 2, group: 13, kind: 'metalloid' },
  { z: 6, symbol: 'C', name: 'carbon', mass: 12, period: 2, group: 14, kind: 'nonmetal' },
  { z: 7, symbol: 'N', name: 'nitrogen', mass: 14, period: 2, group: 15, kind: 'nonmetal' },
  { z: 8, symbol: 'O', name: 'oxygen', mass: 16, period: 2, group: 16, kind: 'nonmetal' },
  { z: 9, symbol: 'F', name: 'fluorine', mass: 19, period: 2, group: 17, kind: 'nonmetal' },
  { z: 10, symbol: 'Ne', name: 'neon', mass: 20, period: 2, group: 18, kind: 'noble' },
  { z: 11, symbol: 'Na', name: 'sodium', mass: 23, period: 3, group: 1, kind: 'metal' },
  { z: 12, symbol: 'Mg', name: 'magnesium', mass: 24, period: 3, group: 2, kind: 'metal' },
  { z: 13, symbol: 'Al', name: 'aluminium', mass: 27, period: 3, group: 13, kind: 'metal' },
  { z: 14, symbol: 'Si', name: 'silicon', mass: 28, period: 3, group: 14, kind: 'metalloid' },
  { z: 15, symbol: 'P', name: 'phosphorus', mass: 31, period: 3, group: 15, kind: 'nonmetal' },
  { z: 16, symbol: 'S', name: 'sulfur', mass: 32, period: 3, group: 16, kind: 'nonmetal' },
  { z: 17, symbol: 'Cl', name: 'chlorine', mass: 35, period: 3, group: 17, kind: 'nonmetal' },
  { z: 18, symbol: 'Ar', name: 'argon', mass: 40, period: 3, group: 18, kind: 'noble' },
  { z: 19, symbol: 'K', name: 'potassium', mass: 39, period: 4, group: 1, kind: 'metal' },
  { z: 20, symbol: 'Ca', name: 'calcium', mass: 40, period: 4, group: 2, kind: 'metal' },
]

export const byZ = (z: number) => ELEMENTS.find(e => e.z === z)

/** Electrons per shell, filling 2, 8, 8, 2 as taught up to Year 10 (good to 20 electrons). */
export function shells(electrons: number): number[] {
  const caps = [2, 8, 8, 8]
  const out: number[] = []
  let left = electrons
  for (const cap of caps) {
    if (left <= 0) break
    out.push(Math.min(cap, left))
    left -= cap
  }
  return out
}

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻' }
/** "Na⁺", "O²⁻", "Ca²⁺" — the charge as chemists write it. */
export function ionSymbol(symbol: string, charge: number): string {
  if (charge === 0) return symbol
  const mag = Math.abs(charge) === 1 ? '' : String(Math.abs(charge))
  return symbol + (mag + (charge > 0 ? '+' : '-')).split('').map(c => SUP[c]).join('')
}
