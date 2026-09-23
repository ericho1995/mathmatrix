// Shared helpers for the Specialist Mathematics Unit 3 & 4 sets.
// Topics follow the 2023–2027 study design's areas of study.
export const SM = s => {
  const PF = 'sm_proof', FG = 'sm_functions', CX = 'sm_complex_numbers', CA = 'sm_calculus', VE = 'sm_vectors', ST = 'sm_statistics'
  const code = {
    [PF]: 'VCE-SM-U34-AOS1', // Discrete mathematics: logic and proof
    [FG]: 'VCE-SM-U34-AOS2', // Functions, relations and graphs
    [CX]: 'VCE-SM-U34-AOS3', // Algebra, number and structure: complex numbers
    [CA]: 'VCE-SM-U34-AOS4', // Calculus, differential equations, kinematics
    [VE]: 'VCE-SM-U34-AOS5', // Space and measurement: vectors
    [ST]: 'VCE-SM-U34-AOS6', // Data analysis, probability and statistics
  }
  return {
    PF, FG, CX, CA, VE, ST,
    ex1: (t, d, q, p, extra = {}) => ({ t, s, d, calc: false, q, p, code: code[t], ...extra }),
    mc: (t, d, q, o, e, extra = {}) => ({ t, s, d, calc: true, q, o, e, code: code[t], ...extra }),
    ex2: (t, d, q, p, extra = {}) => ({ t, s, d, calc: true, q, p, code: code[t], ...extra }),
  }
}

export const sample = (f, a, b, n) => Array.from({ length: n + 1 }, (_, i) => {
  const x = a + ((b - a) * i) / n
  return [Math.round(x * 1000) / 1000, Math.round(f(x) * 1000) / 1000]
})
