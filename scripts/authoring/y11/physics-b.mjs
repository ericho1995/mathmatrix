// Year 11 Physics, set 2 supplement: eight more items so the Unit 1 & 2 pool
// fills eight practice papers.
//
//   node scripts/authoring/append-mc.mjs scripts/authoring/y11/physics-b.mjs year_11 BANK_Y11_PHYSICS_2B

export const HEADER = `Year 11 Physics, set 2 supplement (scripts/authoring/y11/physics-b.mjs).`

const ME = 'phys_mechanics'
const EL = 'phys_electricity'
const mc = (topic, d, q, options, e) => ({ topic, d, q, options, correct: 0, e })

export const ITEMS = [
  mc(ME, 'advanced', 'A 0.20 kg ball hits a wall at 5.0 m/s and rebounds at 5.0 m/s. What is the magnitude of its change in momentum?',
    ['2.0 kg m/s', '1.0 kg m/s', '0.50 kg m/s', '0 kg m/s'],
    'Take the rebound direction as positive. Δp = 0.20 × 5.0 − 0.20 × (−5.0) = 1.0 + 1.0 = 2.0 kg m/s. The speed is unchanged, but the velocity reverses, so the momentum changes.'),
  mc(ME, 'foundation', 'Which statement is Newton’s second law?',
    ['The acceleration of an object is proportional to the net force on it and inversely proportional to its mass', 'Every action has an equal and opposite reaction', 'An object stays at rest unless a force acts on it', 'Momentum is always conserved'],
    'Newton’s second law is F = ma: a larger net force gives a larger acceleration, and a larger mass gives a smaller one.'),
  mc(ME, 'proficient', 'The gravitational field strength on the Moon is 1.6 N/kg. What does a 70 kg astronaut weigh there?',
    ['112 N', '70 N', '44 N', '11.2 N'],
    'Weight = mg = 70 × 1.6 = 112 N. The astronaut’s mass is still 70 kg; only the weight changes.'),
  mc(ME, 'developing', 'A car doubles its speed. What happens to its momentum?',
    ['It doubles', 'It halves', 'It quadruples', 'It stays the same'],
    'Momentum p = mv is proportional to speed, so doubling the speed doubles the momentum. (Its kinetic energy quadruples.)'),
  mc(EL, 'developing', 'Which device is designed to transform electrical energy mainly into kinetic energy?',
    ['An electric motor', 'A heater', 'A loudspeaker', 'A globe'],
    'A motor uses electrical energy to make something turn. A heater produces heat, a globe light and a loudspeaker sound.'),
  mc(EL, 'proficient', 'Four identical 8.0 Ω resistors are connected in parallel. What is their combined resistance?',
    ['2.0 Ω', '4.0 Ω', '8.0 Ω', '32 Ω'],
    'For n identical resistors in parallel, R = 8.0 ÷ 4 = 2.0 Ω.'),
  mc(EL, 'developing', 'A 1.5 V cell supplies a current of 0.20 A. At what rate does it supply energy?',
    ['0.30 W', '1.7 W', '3.0 W', '7.5 W'],
    'P = VI = 1.5 × 0.20 = 0.30 W, which is 0.30 J every second.'),
  mc(ME, 'advanced', 'A person stands on bathroom scales in a lift. The reading falls below their normal weight. What is the lift doing?',
    ['Accelerating downwards', 'Moving upwards at a constant speed', 'Accelerating upwards', 'Stationary'],
    'The scales read the normal force. If N is less than mg, the net force is downwards, so the lift is accelerating downwards (speeding up on the way down, or slowing down on the way up).'),
]
