// VCE Physics Unit 3 & 4 — Practice exam 4.
// Section A: 20 multiple choice. Section B: 15 questions, 100 marks.
// Every value is computed in checks/set4.py.
import { t, AOS, part, makeSet, axes, curve } from './phys.mjs'
import { drawing, traced } from './draw.mjs'

const { MO, FI, EL, LM, IN } = AOS
const S = makeSet(4)

// ════════════════ Section A ════════════════

S.mc(MO, 'developing', t`A skydiver falls vertically at a constant (terminal) velocity. Which one of the following statements is correct?`,
  ['The air resistance on the skydiver is equal in size to the skydiver’s weight.', 'The net force on the skydiver is downwards.', 'The skydiver’s weight is zero.', 'The air resistance on the skydiver is greater than the skydiver’s weight.'], 'A',
  t`Constant velocity means zero acceleration, so by Newton’s first law the net force is zero: the upward air resistance balances the weight. The weight is unchanged.`)

S.mc(MO, 'proficient', t`A 0.15 kg ball hits a wall at 20 m s⁻¹ and rebounds along the same line at 15 m s⁻¹. The magnitude of the change in momentum of the ball is`,
  ['0.75 kg m s⁻¹', '5.25 kg m s⁻¹', '35.0 kg m s⁻¹', '525 kg m s⁻¹'], 'B',
  t`The velocity reverses: \(\Delta v = -15 - 20 = -35\) m s⁻¹, so \(|\Delta p| = 0.15 \times 35 = 5.25\) kg m s⁻¹. 0.75 subtracts the speeds, ignoring the change of direction.`)

S.mc(MO, 'proficient', t`A 30 kg child on a swing moves through the lowest point at 4.0 m s⁻¹. The ropes are 2.5 m long. The total tension in the ropes at the lowest point is closest to`,
  ['102 N', '294 N', '486 N', '678 N'], 'C',
  t`At the lowest point the net force is upwards, towards the centre: \(T - mg = \frac{mv^2}{r}\), so \(T = 30 \times 9.81 + \frac{30 \times 4.0^2}{2.5} = 294 + 192 = 486\) N. 102 N subtracts the centripetal term, as if at the top.`)

S.mc(MO, 'proficient', t`A car travelling on a level road brakes with a constant braking force and stops. If the car had been travelling at twice the speed, with the same braking force, its stopping distance would have been`,
  ['four times as long', 'twice as long', 'the same', 'half as long'], 'A',
  t`The work done by the braking force removes the kinetic energy: \(Fs = \frac{1}{2}mv^2\), so \(s \propto v^2\). Doubling \(v\) makes the stopping distance four times as long.`)

S.mc(MO, 'developing', t`A large truck collides head-on with a small car. During the collision, compared with the force that the truck exerts on the car, the force that the car exerts on the truck is`,
  ['much smaller', 'slightly smaller', 'larger', 'the same size'], 'D',
  t`These forces are a Newton’s third-law pair, so they are equal in size and opposite in direction. The car suffers the larger acceleration because its mass is smaller.`)

S.mc(FI, 'proficient', t`A satellite orbits at an altitude equal to twice Earth’s radius. The gravitational field strength at the satellite is closest to`,
  ['1.09 N kg⁻¹', '2.46 N kg⁻¹', '3.28 N kg⁻¹', '4.91 N kg⁻¹'], 'A',
  t`An altitude of \(2R_E\) puts the satellite \(3R_E\) from Earth’s centre, so \(g = \frac{9.83}{3^2} = 1.09\) N kg⁻¹. 2.46 N kg⁻¹ uses \(2R_E\) from the centre; 3.28 N kg⁻¹ uses an inverse (not inverse-square) law.`)

S.mc(FI, 'proficient', t`Satellite X orbits Earth at four times the orbital radius of satellite Y. The ratio of their periods, \(\frac{T_X}{T_Y}\), is`,
  ['2', '4', '8', '16'], 'C',
  t`From \(\frac{GMm}{r^2} = \frac{4\pi^2mr}{T^2}\), \(T^2 \propto r^3\), so \(\frac{T_X}{T_Y} = 4^{\frac{3}{2}} = 8\).`)

S.mc(FI, 'developing', t`An electron is between two horizontal parallel plates. The top plate is positive and the bottom plate is negative. The electric force on the electron is directed`,
  ['towards the bottom plate', 'parallel to the plates', 'towards the top plate', 'nowhere — it is zero because the field is uniform'], 'C',
  t`The field points from the positive to the negative plate (downwards); a negative charge experiences a force opposite to the field, so the electron is pushed up, towards the positive plate. A uniform field exerts a constant force, not zero force.`)

S.mc(FI, 'developing', t`A proton moves parallel to the field lines of a uniform magnetic field. The magnetic force on the proton is`,
  ['perpendicular to the field', 'zero', 'in the direction of the field', 'opposite to the direction of the field'], 'B',
  t`A charge experiences a magnetic force only from the component of its velocity perpendicular to the field. Moving parallel to the field, that component is zero, so the force is zero.`)

S.mc(EL, 'developing', t`The coil of a simple DC motor rotates in a uniform magnetic field. The turning effect (torque) on the coil is greatest when`,
  ['the plane of the coil is perpendicular to the magnetic field', 'the plane of the coil is parallel to the magnetic field', 'the current in the coil is zero', 'the brushes are in the gaps of the split ring'], 'B',
  t`The forces on the sides of the coil are always perpendicular to the field. When the plane of the coil is parallel to the field, these forces act at the greatest distance from the axis and produce the most torque; when the plane is perpendicular, they act through the axis and produce none.`)

S.mc(EL, 'proficient', t`A 1000 W heater operates from a 240 V RMS supply. The peak current in the heater is closest to`,
  ['2.95 A', '4.17 A', '5.89 A', '8.33 A'], 'C',
  t`\(I_{\text{RMS}} = \frac{P}{V_{\text{RMS}}} = \frac{1000}{240} = 4.17\) A, and \(I_{\text{peak}} = \sqrt{2} \times 4.17 = 5.89\) A. 4.17 A is the RMS value.`)

S.mc(EL, 'proficient', t`The magnetic flux through a rotating coil varies sinusoidally with time. The EMF induced in the coil is greatest at the instants when the flux through the coil is`,
  ['a maximum', 'zero', 'half its maximum value', 'a maximum in the opposite direction'], 'B',
  t`The EMF depends on the rate of change of flux — the gradient of the flux–time graph. A sinusoid is steepest where it crosses zero and flat at its peaks, so the EMF is greatest when the flux is zero.`)

S.mc(EL, 'proficient', t`A step-down transformer draws 0.50 A from a 240 V supply. Its output is 12 V at 9.0 A. The efficiency of the transformer is`,
  ['50%', '75%', '80%', '90%'], 'D',
  t`Input power \(= 240 \times 0.50 = 120\) W; output power \(= 12 \times 9.0 = 108\) W; efficiency \(= \frac{108}{120} = 90\%\). The rest is lost as heat in the windings and the core.`)

S.mc(LM, 'developing', t`The energy of a photon of light of wavelength 600 nm is closest to`,
  ['2.07 eV', '3.31 eV', '6.21 eV', '2.07 × 10⁹ eV'], 'A',
  t`\(E = \frac{hc}{\lambda} = \frac{4.14 \times 10^{-15} \times 3.00 \times 10^8}{600 \times 10^{-9}} = 2.07\) eV. 3.31 comes from the energy in joules (\(3.31 \times 10^{-19}\) J) with the power of ten dropped; \(2.07 \times 10^9\) eV leaves the wavelength in nanometres.`)

S.mc(LM, 'developing', t`Young’s double-slit experiment was historically significant because it`,
  ['proved the existence of photons', 'gave the first measurement of the speed of light', 'showed that light is made of particles', 'provided strong evidence for the wave model of light'], 'D',
  t`Bright and dark bands are an interference pattern, which only waves produce: the two paths reinforce or cancel depending on the path difference. Photons were proposed a century later to explain the photoelectric effect.`)

S.mc(LM, 'proficient', t`The de Broglie wavelength of a 0.145 kg baseball travelling at 40 m s⁻¹ is closest to`,
  ['2.86 × 10⁻³⁶ m', '1.14 × 10⁻³⁴ m', '4.57 × 10⁻³³ m', '1.83 × 10⁻³¹ m'], 'B',
  t`\(\lambda = \frac{h}{mv} = \frac{6.63 \times 10^{-34}}{0.145 \times 40} = 1.14 \times 10^{-34}\) m — far smaller than any gap it could pass through, which is why everyday objects show no observable wave behaviour.`)

S.mc(LM, 'developing', t`Two inertial observers are moving relative to each other. According to special relativity, which one of the following quantities will they always measure to be the same?`,
  ['the length of an object moving relative to one of them', 'the time between two events', 'the speed of light in a vacuum', 'the total energy of a moving particle'], 'C',
  t`This is Einstein’s second postulate. Lengths, time intervals and energies all depend on the observer’s frame of reference.`)

S.mc(LM, 'proficient', t`The energy levels of hydrogen are \(E_n = -\frac{13.6}{n^2}\) eV. The wavelength of the photon emitted when an electron in hydrogen moves from the \(n = 4\) level to the \(n = 2\) level is closest to`,
  ['122 nm', '365 nm', '435 nm', '487 nm'], 'D',
  t`\(\Delta E = 13.6\left(\frac{1}{4} - \frac{1}{16}\right) = 2.55\) eV and \(\lambda = \frac{hc}{\Delta E} = \frac{1.242 \times 10^{-6}}{2.55} = 4.87 \times 10^{-7}\) m. 435 nm is the \(n = 5 \to 2\) line; 122 nm is \(n = 2 \to 1\).`)

S.mc(LM, 'developing', t`Which one of the following observations is best explained by the particle (photon) model of light rather than the wave model?`,
  ['No photoelectrons are emitted below a threshold frequency, however intense the light.', 'Bright and dark bands form in a double-slit experiment.', 'Light spreads out after passing through a narrow gap.', 'Light changes direction when it enters glass.'], 'A',
  t`A threshold frequency means each electron is released by a single photon of energy \(hf\), so if \(hf < \phi\) no electrons escape, however many photons arrive. Interference and diffraction are wave behaviour.`)

S.mc(IN, 'developing', t`When graphing her results, a student finds that one data point lies well away from the line of best fit through all the other points. The most appropriate response is to`,
  ['include the point when drawing the line of best fit', 'delete the point without recording it', 'draw the line of best fit through that point', 'repeat that measurement to check it, and report any result that is excluded'], 'D',
  t`An outlier may be a mistake or a genuine effect. Scientists check it by repeating the measurement; if it is excluded, they record it and the reason. Deleting data without comment is poor practice.`)

// ════════════════ Section B ════════════════

const vt = { kind: 'function_graph', xMin: 0, xMax: 10, yMin: 0, yMax: 3, xStep: 1, yStep: 0.5, xLabel: 't (s)', yLabel: 'v (m s⁻¹)', width: 340, grid: true,
  curves: [{ points: [[0, 0], [2, 2.4], [8, 2.4], [9.6, 0]] }], caption: 'Figure 1' }
S.q(MO, 'proficient', t`A lift and its passengers have a total mass of 800 kg. Figure 1 shows the velocity of the lift as it moves upwards from rest between two floors.`, [
  part('a', t`Calculate the tension in the lift cable during the first 2.0 s.`, 2,
    t`8.81 × 10³ N`,
    t`From the graph, \(a = \frac{2.4}{2.0} = 1.2\) m s⁻² upwards. \(T - mg = ma\), so \(T = 800 \times (9.81 + 1.2) = 8808\) N. 1 mark for the acceleration from the gradient, 1 mark for the tension.`, { unit: 'N' }),
  part('b', t`Calculate the tension in the lift cable between \(t = 8.0\) s and \(t = 9.6\) s.`, 2,
    t`6.65 × 10³ N`,
    t`\(a = \frac{0 - 2.4}{1.6} = -1.5\) m s⁻², so \(T = 800 \times (9.81 - 1.5) = 6648\) N. 1 mark for the deceleration, 1 mark for the tension.`, { unit: 'N' }),
  part('c', t`Calculate the distance the lift travels between the two floors.`, 1,
    t`18.7 m`,
    t`The area under the velocity–time graph: \(\frac{1}{2}(2.0)(2.4) + (6.0)(2.4) + \frac{1}{2}(1.6)(2.4) = 2.4 + 14.4 + 1.92 = 18.7\) m.`, { unit: 'm' }),
  part('d', t`Explain why passengers feel lighter as the lift slows down near the top.`, 1,
    t`The lift accelerates downwards, so the floor pushes up with a normal force smaller than the passengers’ weight (\(N = m(g - a)\)); that normal force is what they feel as their weight.`,
    t`The sensation of weight is the normal force, not the gravitational force, which is unchanged.`),
], { diagram: vt })

// Supply drop: 1 px per 1.5 m.
const drop = drawing(320, 160)
drop.rect(12, 8, 44, 9, { fill: 'mid', rx: 4 }).poly([[12, 8], [12, 0.5], [22, 8]], { closed: true, fill: 'dark' }).arrow(62, 12, 100, 12).text(118, 15, '60 m s⁻¹', { anchor: 'start', size: 8.5 })
  .path(traced(tt => 22 + (0.5 * 9.81 * tt * tt) / 1.5, 0, 6.058, s => 30 + (60 * s) / 1.5, v => v, 40))
  .ground(10, 310, 142).dim(12, 22, 12, 142, '180 m', { offset: -16 }).dot(30, 22, 2.4)
S.q(MO, 'proficient', t`A supply package is released from a plane flying horizontally at 60 m s⁻¹ at a height of 180 m over flat ground, as shown in Figure 2. Ignore air resistance.`, [
  part('a', t`Calculate the time the package takes to reach the ground.`, 2,
    t`6.06 s`,
    t`The package starts with zero vertical velocity: \(180 = \frac{1}{2} \times 9.81 \times t^2\), so \(t = \sqrt{\frac{360}{9.81}} = 6.06\) s. 1 mark for the equation, 1 mark for the value.`, { unit: 's' }),
  part('b', t`Calculate the horizontal distance travelled by the package.`, 1,
    t`364 m`,
    t`\(x = 60 \times 6.06 = 364\) m (363 m from unrounded values).`, { unit: 'm' }),
  part('c', t`Calculate the speed of the package as it reaches the ground, and the angle its velocity makes with the horizontal.`, 2,
    t`84.4 m s⁻¹ at 44.7° below the horizontal`,
    t`\(v_y = 9.81 \times 6.06 = 59.4\) m s⁻¹ and \(v_x = 60\) m s⁻¹, so \(v = \sqrt{60^2 + 59.4^2} = 84.4\) m s⁻¹ at \(\tan^{-1}\left(\frac{59.4}{60}\right) = 44.7^\circ\) below the horizontal. 1 mark for the speed, 1 mark for the angle.`),
  part('d', t`The plane continues at the same velocity. Describe its position relative to the package when the package lands.`, 1,
    t`Directly above it.`,
    t`Without air resistance, the package keeps the plane’s horizontal velocity of 60 m s⁻¹ throughout its fall.`),
], { diagram: drop.done('Figure 2') })

// Banked track: surface rises at 18° from (30, 110); the block sits on it.
const bk = (s, n = 0) => { const a = (18 * Math.PI) / 180; return [30 + s * Math.cos(a) - n * Math.sin(a), 110 - s * Math.sin(a) - n * Math.cos(a)] }
const bank = drawing(300, 130)
bank.poly([[30, 110], [270, 110], [270, 32]], { closed: true, fill: 'light' }).angle(30, 110, 34, 0, 18, '18°')
  .poly([bk(130), bk(176), bk(176, 20), bk(130, 20)], { closed: true, fill: 'mid' }).dot(...bk(153, 10), 2)
  .arrow(120, 30, 50, 30).text(85, 22, 'towards the centre of the curve', { size: 8 })
S.q(MO, 'advanced', t`A racing car takes a curve of radius 120 m on a track banked at 18° to the horizontal. Figure 3 shows a cross-section of the track, with the car represented by a block.`, [
  part('a', t`On Figure 3, draw and label arrows showing the forces acting on the car when it travels at the speed for which no sideways friction is needed. Ignore air resistance.`, 2,
    t`Two forces from the car’s centre: its weight, vertically down, and the normal force, perpendicular to the track surface (up and towards the centre of the curve).`,
    t`1 mark for the weight drawn vertically; 1 mark for the normal force perpendicular to the track surface. No separate “centripetal force” arrow should be drawn — the centripetal force is the net (horizontal) force.`),
  part('b', t`Calculate the speed at which the car can take the curve with no sideways friction.`, 3,
    t`19.6 m s⁻¹`,
    t`Vertically: \(N\cos(18^\circ) = mg\). Horizontally: \(N\sin(18^\circ) = \frac{mv^2}{r}\). Dividing: \(\tan(18^\circ) = \frac{v^2}{rg}\), so \(v = \sqrt{120 \times 9.81 \times \tan(18^\circ)} = 19.6\) m s⁻¹. Marks: 1 for the vertical balance; 1 for the horizontal component providing the centripetal force; 1 for the speed.`, { unit: 'm s⁻¹' }),
  part('c', t`The car takes the curve at a higher speed. State the direction of the friction force needed to keep it on its path, and explain.`, 1,
    t`Down the slope: at the higher speed the horizontal component of the normal force alone is too small to provide the centripetal force, so friction must add an inward component.`,
    t`Without friction the car would slide up and out of the curve.`),
], { diagram: bank.done('Figure 3') })

S.q(MO, 'proficient', t`A 3.0 kg firework is at rest when it explodes into two pieces. A 1.0 kg piece moves east at 12 m s⁻¹.`, [
  part('a', t`Calculate the velocity of the 2.0 kg piece.`, 2,
    t`6.0 m s⁻¹ west`,
    t`The total momentum stays zero: \(1.0 \times 12 + 2.0v = 0\), so \(v = -6.0\) m s⁻¹, i.e. 6.0 m s⁻¹ west. 1 mark for conservation of momentum, 1 mark for the value and direction.`),
  part('b', t`Calculate the kinetic energy released in the explosion.`, 2,
    t`108 J`,
    t`\(\frac{1}{2}(1.0)(12)^2 + \frac{1}{2}(2.0)(6.0)^2 = 72 + 36 = 108\) J. 1 mark for each kinetic energy (or the method), 1 mark for the total.`, { unit: 'J' }),
  part('c', t`Explain how momentum is conserved in the explosion even though kinetic energy is not.`, 1,
    t`The forces between the pieces are internal and equal and opposite (Newton’s third law), so the total momentum is unchanged; the kinetic energy comes from chemical energy stored in the explosive.`,
    t`Momentum is conserved for any isolated system; kinetic energy is conserved only in elastic collisions.`),
  part('d', t`The explosion lasts 0.020 s. Calculate the average force on the 1.0 kg piece.`, 1,
    t`600 N`,
    t`\(F = \frac{\Delta p}{\Delta t} = \frac{1.0 \times 12}{0.020} = 600\) N (east).`, { unit: 'N' }),
])

const em = drawing(330, 90)
em.circle(40, 42, 26, { fill: 'light' }).text(40, 46, 'Earth', { size: 8.5 }).circle(290, 42, 9, { fill: 'light' }).text(290, 66, 'Moon', { size: 8.5 })
  .dim(40, 80, 290, 80, '3.84 × 10⁸ m (centre to centre)', { offset: -6 })
S.q(FI, 'advanced', t`The Moon (mass \(7.35 \times 10^{22}\) kg) orbits Earth at a distance of \(3.84 \times 10^8\) m between their centres, as shown in Figure 4. The figure is not to scale.`, [
  part('a', t`Calculate the strength of Earth’s gravitational field at the Moon’s distance.`, 2,
    t`2.70 × 10⁻³ N kg⁻¹`,
    t`\(g = \frac{GM_E}{r^2} = \frac{6.67 \times 10^{-11} \times 5.98 \times 10^{24}}{(3.84 \times 10^8)^2} = 2.70 \times 10^{-3}\) N kg⁻¹. 1 mark for the substitution, 1 mark for the value.`, { unit: 'N kg⁻¹' }),
  part('b', t`Use your answer to part a to calculate the Moon’s orbital speed.`, 2,
    t`1.02 × 10³ m s⁻¹`,
    t`Gravity provides the centripetal acceleration: \(g = \frac{v^2}{r}\), so \(v = \sqrt{2.70 \times 10^{-3} \times 3.84 \times 10^8} = 1.02 \times 10^3\) m s⁻¹. (This gives a period of about 27 days.) 1 mark for \(g = \frac{v^2}{r}\), 1 mark for the value.`, { unit: 'm s⁻¹' }),
  part('c', t`At one point on the line between Earth and the Moon, the gravitational fields of Earth and the Moon cancel. Calculate the distance of this point from the centre of Earth.`, 3,
    t`3.46 × 10⁸ m`,
    t`At distance \(x\) from Earth: \(\frac{GM_E}{x^2} = \frac{GM_M}{(d - x)^2}\), so \(\frac{d - x}{x} = \sqrt{\frac{M_M}{M_E}} = \sqrt{\frac{7.35 \times 10^{22}}{5.98 \times 10^{24}}} = 0.1109\). Then \(x = \frac{d}{1.1109} = \frac{3.84 \times 10^8}{1.1109} = 3.46 \times 10^8\) m (90% of the way to the Moon). Marks: 1 for equating the fields; 1 for the square-root ratio; 1 for the distance.`, { unit: 'm' }),
], { diagram: em.done('Figure 4') })

const gun = drawing(300, 112)
gun.rect(60, 20, 6, 70, { fill: 'dark' }).text(63, 104, 'cathode', { size: 8.5 }).rect(180, 20, 6, 30, { fill: 'dark' }).rect(180, 60, 6, 30, { fill: 'dark' }).text(183, 104, 'anode', { size: 8.5 })
  .arrow(70, 55, 170, 55).arrow(190, 55, 262, 55).text(226, 48, 'e⁻', { size: 9 }).dim(63, 15, 183, 15, '1.5 cm', { offset: -9 })
  .text(20, 58, '0 V', { size: 8.5 }).text(222, 30, '+2.5 kV', { size: 8.5 })
S.q(FI, 'proficient', t`In an electron gun, electrons leave a cathode with negligible speed and are accelerated towards an anode 1.5 cm away. The anode is at a potential 2.5 kV higher than the cathode, and electrons pass through a hole in it, as shown in Figure 5. Treat the field between the cathode and anode as uniform.`, [
  part('a', t`Calculate the magnitude of the electric field between the cathode and the anode.`, 1,
    t`1.7 × 10⁵ V m⁻¹`,
    t`\(E = \frac{V}{d} = \frac{2500}{0.015} = 1.7 \times 10^5\) V m⁻¹.`, { unit: 'V m⁻¹' }),
  part('b', t`Calculate the magnitude of the force on an electron between the cathode and the anode.`, 1,
    t`2.7 × 10⁻¹⁴ N`,
    t`\(F = qE = 1.60 \times 10^{-19} \times 1.67 \times 10^5 = 2.7 \times 10^{-14}\) N.`, { unit: 'N' }),
  part('c', t`Calculate the speed of the electrons as they pass through the anode.`, 2,
    t`2.96 × 10⁷ m s⁻¹`,
    t`\(\frac{1}{2}mv^2 = qV\), so \(v = \sqrt{\frac{2 \times 1.60 \times 10^{-19} \times 2500}{9.11 \times 10^{-31}}} = 2.96 \times 10^7\) m s⁻¹. 1 mark for the energy equation, 1 mark for the value.`, { unit: 'm s⁻¹' }),
  part('d', t`A similar gun accelerates protons through the same potential difference. Compare the kinetic energy and the speed of the protons with those of the electrons.`, 2,
    t`Same kinetic energy (2.5 keV), because the charges have equal magnitude; much lower speed (about \(6.9 \times 10^5\) m s⁻¹), because the proton’s mass is about 1840 times larger.`,
    t`1 mark for the equal kinetic energy with its reason, 1 mark for the lower speed with its reason.`),
], { diagram: gun.done('Figure 5') })

// Rails seen from above. The cell's long (+) plate is at the bottom, so
// conventional current runs along the bottom rail and up the rod.
const rail = drawing(330, 120)
rail.fieldOut(90, 34, 80, 60, 25).fieldOut(222, 34, 100, 60, 25).line(76, 28, 316, 28, { w: 2 }).line(76, 96, 316, 96, { w: 2 })
  .line(76, 28, 76, 59).line(71, 59, 81, 59, { w: 2.2 }).line(66, 65, 86, 65, { w: 1.2 }).line(76, 65, 76, 96)
  .text(62, 66, 'power supply', { anchor: 'end', size: 8 }).line(196, 24, 196, 100, { w: 3 })
  .arrow(208, 80, 208, 44).text(214, 66, 'I', { anchor: 'start', italic: true }).text(196, 114, 'rod', { size: 8.5 })
S.q(FI, 'proficient', t`Figure 6 is a top view of a metal rod resting across two horizontal rails 0.20 m apart. A uniform magnetic field of 0.50 T is directed vertically upwards (out of the page). The power supply drives a current of 5.0 A through the rod in the direction shown.`, [
  part('a', t`Calculate the magnitude of the magnetic force on the rod.`, 1,
    t`0.50 N`,
    t`\(F = IlB = 5.0 \times 0.20 \times 0.50 = 0.50\) N.`, { unit: 'N' }),
  part('b', t`State the direction of the force on the rod (left or right on Figure 6).`, 1,
    t`To the right (away from the power supply)`,
    t`Current up the page, field out of the page: the right-hand rule gives a force to the right.`),
  part('c', t`The rod has a mass of 0.10 kg. Calculate its initial acceleration, ignoring friction.`, 1,
    t`5.0 m s⁻²`,
    t`\(a = \frac{F}{m} = \frac{0.50}{0.10} = 5.0\) m s⁻².`, { unit: 'm s⁻²' }),
  part('d', t`The current is reversed and doubled. State the new force on the rod.`, 1,
    t`1.0 N, to the left`,
    t`The force is proportional to the current and reverses with it.`),
  part('e', t`As the rod speeds up, the current through it decreases, even though the power supply is unchanged. Explain why.`, 2,
    t`The moving rod cuts magnetic field lines (the flux through the circuit changes), so an EMF is induced in it. By Lenz’s law this EMF opposes the current that causes the motion, reducing the net EMF and hence the current.`,
    t`1 mark for identifying the induced EMF in the moving rod, 1 mark for its direction opposing the supply (Lenz’s law).`),
], { diagram: rail.done('Figure 6') })

const flux = { kind: 'function_graph', xMin: 0, xMax: 80, yMin: -6, yMax: 6, xStep: 10, yStep: 2, xLabel: 't (ms)', yLabel: 'Φ (mWb)', width: 360, grid: true,
  curves: [{ points: curve(x => 5 * Math.cos((2 * Math.PI * x) / 40), 0, 80, 160) }], caption: 'Figure 7' }
S.q(EL, 'advanced', t`The coil of an AC generator has 150 turns and rotates at a constant rate in a uniform magnetic field. Figure 7 shows the magnetic flux through each turn of the coil.`, [
  part('a', t`State the frequency of rotation of the coil.`, 1,
    t`25 Hz`,
    t`One cycle of the flux takes 40 ms: \(f = \frac{1}{0.040} = 25\) Hz.`, { unit: 'Hz' }),
  part('b', t`Calculate the average EMF induced in the coil between \(t = 0\) and \(t = 10\) ms.`, 2,
    t`75 V`,
    t`The flux falls from \(5.0 \times 10^{-3}\) Wb to zero in 0.010 s: \(\varepsilon = N\frac{\Delta\Phi_B}{\Delta t} = 150 \times \frac{5.0 \times 10^{-3}}{0.010} = 75\) V. 1 mark for the change in flux and time, 1 mark for the EMF.`, { unit: 'V' }),
  part('c', t`On the axes below, sketch the shape of the EMF induced in the coil from \(t = 0\) to \(t = 80\) ms. Draw its peaks at 0.5 units.`, 2,
    t`A sinusoid that is zero at \(t = 0\), 20, 40, 60 and 80 ms and has its peaks (±0.5 units) at 10, 30, 50 and 70 ms — a sine curve, a quarter-cycle out of step with the flux.`,
    t`1 mark for the EMF being zero where the flux is a maximum or minimum; 1 mark for peaks where the flux crosses zero, with the same period of 40 ms. (With \(\varepsilon = -N\frac{\Delta\Phi_B}{\Delta t}\), the EMF is positive while the flux is decreasing; either sign convention is accepted if consistent.)`,
    { diagram: axes({ xMin: 0, xMax: 80, yMin: -1.2, yMax: 1.2, xStep: 10, yStep: 0.5, xLabel: 't (ms)', yLabel: 'EMF (units)', width: 360 }) }),
  part('d', t`The rate of rotation is doubled. On the same axes as part c, sketch the new EMF, and label it D.`, 2,
    t`A sinusoid with peaks at 1.0 unit and a period of 20 ms (four cycles in 80 ms).`,
    t`1 mark for doubling the peak; 1 mark for halving the period.`),
  part('e', t`Explain why doubling the rate of rotation doubles the peak EMF.`, 1,
    t`The same change in flux now happens in half the time, so the rate of change of flux, and hence the EMF (\(\varepsilon = -N\frac{\Delta\Phi_B}{\Delta t}\)), doubles.`,
    t`Linking the doubled rate of change of flux to Faraday’s law earns the mark.`),
], { diagram: flux })

S.q(EL, 'proficient', t`A substation transformer in a suburb steps 11 kV down to 240 V (both RMS). It supplies 50 houses, each drawing 2.4 kW. Treat the transformer as ideal.`, [
  part('a', t`Calculate the ratio of primary turns to secondary turns.`, 1,
    t`45.8 : 1`,
    t`\(\frac{N_1}{N_2} = \frac{11\,000}{240} = 45.8\).`),
  part('b', t`Calculate the total RMS current supplied to the houses.`, 1,
    t`500 A`,
    t`\(I_2 = \frac{50 \times 2400}{240} = 500\) A.`, { unit: 'A' }),
  part('c', t`Calculate the RMS current in the primary coil.`, 2,
    t`10.9 A`,
    t`\(I_1 = \frac{P}{V_1} = \frac{120\,000}{11\,000} = 10.9\) A (or \(\frac{500}{45.8}\)). 1 mark for the total power or the ratio, 1 mark for the value.`, { unit: 'A' }),
  part('d', t`The iron core of a real transformer is made from thin, insulated sheets (laminations) rather than a solid block. Explain why.`, 2,
    t`The changing flux induces EMFs in the core itself, driving eddy currents that heat it. Laminations break up the paths of these currents, making them much smaller, so less energy is lost as heat.`,
    t`1 mark for eddy currents induced in the core by the changing flux, 1 mark for laminations reducing them (and the heat loss).`),
  part('e', t`Explain why a transformer that steps voltage down must have thicker wire in its secondary coil than in its primary coil.`, 1,
    t`The secondary carries a much larger current (500 A compared with 10.9 A); thicker wire has less resistance, reducing \(I^2R\) heating.`,
    t`The link between the larger current and heating in the wire is required.`),
])

S.q(EL, 'advanced', t`A solar farm generates 5.0 MW. It is connected to the grid by transmission lines with a total resistance of 8.0 Ω. The farm’s engineers compare transmitting at 22 kV with transmitting at 66 kV.`, [
  part('a', t`Calculate the current in the lines when transmitting at 22 kV.`, 1,
    t`227 A`,
    t`\(I = \frac{5.0 \times 10^6}{22 \times 10^3} = 227\) A.`, { unit: 'A' }),
  part('b', t`Calculate the power lost in the lines at 22 kV, as a percentage of the power generated.`, 2,
    t`8.3% (4.13 × 10⁵ W)`,
    t`\(P_{\text{loss}} = 227^2 \times 8.0 = 4.13 \times 10^5\) W, which is \(\frac{4.13 \times 10^5}{5.0 \times 10^6} = 8.3\%\). 1 mark for the loss, 1 mark for the percentage.`, { unit: '%' }),
  part('c', t`Calculate the power lost in the lines when transmitting at 66 kV.`, 2,
    t`4.59 × 10⁴ W`,
    t`\(I = \frac{5.0 \times 10^6}{66 \times 10^3} = 75.8\) A and \(P_{\text{loss}} = 75.8^2 \times 8.0 = 4.59 \times 10^4\) W (0.92%). 1 mark for the current, 1 mark for the loss.`, { unit: 'W' }),
  part('d', t`Explain why tripling the transmission voltage reduces the power loss by a factor of nine.`, 1,
    t`For a fixed power, tripling \(V\) makes the current a third as large, and \(P_{\text{loss}} = I^2R\) depends on the square of the current: \(\left(\frac{1}{3}\right)^2 = \frac{1}{9}\).`,
    t`The square dependence on current is the key idea.`),
  part('e', t`Calculate the voltage drop along the lines at 22 kV.`, 1,
    t`1.8 × 10³ V`,
    t`\(V_{\text{drop}} = IR = 227 \times 8.0 = 1.8 \times 10^3\) V.`, { unit: 'V' }),
  part('f', t`Solar panels produce DC. Name the device needed before the output can be fed through a transformer, and explain why it is needed.`, 1,
    t`An inverter: it converts DC to AC, and a transformer works only with AC, which gives a changing flux.`,
    t`Naming the inverter and giving the reason earns the mark.`),
])

const iv = { kind: 'function_graph', xMin: -2, xMax: 3, yMin: 0, yMax: 10, xStep: 0.5, yStep: 1, xLabel: 'V (V)', yLabel: 'I (μA)', width: 360, grid: true,
  curves: [{ points: [[-2, 0], [-1.2, 0], ...curve(x => 4 * (1 - Math.exp(-2.6 * (x + 1.2))), -1.2, 3, 40).slice(1)] }], caption: 'Figure 8' }
S.q(LM, 'advanced', t`A photocell is connected in a circuit with a variable voltage supply. Monochromatic light falls on the metal surface of the photocell, which has a work function of 2.1 eV. Figure 8 shows how the photocurrent varies with the voltage of the collecting electrode.`, [
  part('a', t`Use Figure 8 to determine the maximum kinetic energy of the photoelectrons, in joules.`, 1,
    t`1.9 × 10⁻¹⁹ J`,
    t`The stopping voltage is 1.2 V, so \(E_{k\,\text{max}} = qV_0 = 1.60 \times 10^{-19} \times 1.2 = 1.92 \times 10^{-19}\) J (1.2 eV).`, { unit: 'J' }),
  part('b', t`Calculate the wavelength of the light.`, 2,
    t`376 nm`,
    t`\(hf = \phi + E_{k\,\text{max}} = 2.1 + 1.2 = 3.3\) eV, so \(\lambda = \frac{hc}{E} = \frac{4.14 \times 10^{-15} \times 3.00 \times 10^8}{3.3} = 3.76 \times 10^{-7}\) m. 1 mark for the photon energy, 1 mark for the wavelength.`, { unit: 'nm' }),
  part('c', t`Calculate the number of photoelectrons reaching the collecting electrode each second when the current has reached its maximum value.`, 1,
    t`2.5 × 10¹³`,
    t`\(n = \frac{I}{e} = \frac{4.0 \times 10^{-6}}{1.60 \times 10^{-19}} = 2.5 \times 10^{13}\) per second.`),
  part('d', t`The intensity of the light is doubled, with its frequency unchanged. On Figure 8, sketch the new graph.`, 2,
    t`The same stopping voltage (−1.2 V), with a maximum current of 8.0 μA.`,
    t`1 mark for the unchanged stopping voltage (the photon energy is unchanged); 1 mark for the doubled maximum current (twice as many photons each second).`),
  part('e', t`Explain why the current is zero when the voltage is more negative than −1.2 V.`, 1,
    t`The retarding electric field does more work on each photoelectron than its maximum kinetic energy, so none reach the collector.`,
    t`Even the fastest photoelectrons (1.2 eV) are turned back.`),
], { diagram: iv })

S.q(LM, 'proficient', t`A red laser of wavelength 650 nm illuminates two narrow slits. On a screen 1.50 m away, the bright bands are 2.60 mm apart.`, [
  part('a', t`Calculate the separation of the slits.`, 2,
    t`0.375 mm`,
    t`\(d = \frac{\lambda L}{\Delta x} = \frac{650 \times 10^{-9} \times 1.50}{2.60 \times 10^{-3}} = 3.75 \times 10^{-4}\) m. 1 mark for rearranging, 1 mark for the value.`, { unit: 'm' }),
  part('b', t`Explain why the centre of the pattern is always a bright band.`, 1,
    t`Points on the centre line are the same distance from both slits, so the path difference is zero and the waves arrive in phase (constructive interference).`,
    t`Zero path difference is the key idea.`),
  part('c', t`One slit is covered. Describe how the pattern on the screen changes.`, 2,
    t`The narrow, equally spaced interference bands disappear; a single-slit diffraction pattern remains — a broad, bright central band with much fainter bands either side — and it is less bright overall.`,
    t`1 mark for the loss of the two-slit interference bands, 1 mark for the broad central diffraction maximum.`),
  part('d', t`The laser is replaced by white light. Describe the pattern with both slits open.`, 1,
    t`A white central band, with coloured bands either side (blue on the inner edge, red on the outer), which soon merge.`,
    t`Each wavelength makes bands of a different spacing, so they overlap except at the centre, where all colours have zero path difference.`),
])

S.q(LM, 'advanced', t`Muons are produced by cosmic rays 15.0 km above Earth’s surface and travel straight down at \(0.995c\). In their own frame of reference, half of any group of muons decay every 1.56 μs.`, [
  part('a', t`Calculate the Lorentz factor for the muons.`, 1,
    t`10.0`,
    t`\(\gamma = \frac{1}{\sqrt{1 - 0.995^2}} = 10.0\).`),
  part('b', t`Calculate the time the muons take to reach the ground, according to an observer on Earth.`, 1,
    t`50.3 μs`,
    t`\(t = \frac{15\,000}{0.995 \times 3.00 \times 10^8} = 5.03 \times 10^{-5}\) s.`, { unit: 'μs' }),
  part('c', t`Calculate the distance from the muons’ production point to the ground, as measured in the muons’ frame of reference.`, 2,
    t`1.50 km`,
    t`The 15.0 km is a proper length (measured at rest relative to Earth), so the muons measure a contracted length \(L = \frac{L_0}{\gamma} = \frac{15.0}{10.0} = 1.50\) km. 1 mark for identifying the proper length, 1 mark for the value.`, { unit: 'km' }),
  part('d', t`Calculate the fraction of the muons that reach the ground without decaying.`, 2,
    t`About 0.11 (11%)`,
    t`In the muons’ frame the trip takes \(\frac{50.3}{10.0} = 5.02\) μs \(= \frac{5.02}{1.56} = 3.2\) half-lives, so the fraction remaining is \(\left(\frac{1}{2}\right)^{3.2} = 0.11\). (Without relativity, 32 half-lives would leave only \(2 \times 10^{-10}\) — which is why detecting muons at ground level is evidence for special relativity.) 1 mark for the number of half-lives, 1 mark for the fraction.`),
])

S.q(LM, 'advanced', t`An electron and a positron (the electron’s antiparticle, with the same mass) are at rest when they annihilate, producing two photons of equal energy.`, [
  part('a', t`Calculate the energy of each photon, in MeV.`, 2,
    t`0.512 MeV`,
    t`Each photon carries the rest energy of one particle: \(E = mc^2 = 9.11 \times 10^{-31} \times (3.00 \times 10^8)^2 = 8.20 \times 10^{-14}\) J \(= 0.512\) MeV. 1 mark for \(E = mc^2\), 1 mark for the value in MeV.`, { unit: 'MeV' }),
  part('b', t`Calculate the wavelength of each photon.`, 1,
    t`2.43 × 10⁻¹² m`,
    t`\(\lambda = \frac{hc}{E} = \frac{6.63 \times 10^{-34} \times 3.00 \times 10^8}{8.20 \times 10^{-14}} = 2.43 \times 10^{-12}\) m.`, { unit: 'm' }),
  part('c', t`Calculate the magnitude of the momentum of each photon.`, 1,
    t`2.73 × 10⁻²² kg m s⁻¹`,
    t`\(p = \frac{h}{\lambda} = \frac{6.63 \times 10^{-34}}{2.43 \times 10^{-12}} = 2.73 \times 10^{-22}\) kg m s⁻¹.`, { unit: 'kg m s⁻¹' }),
  part('d', t`Explain why the annihilation must produce two photons travelling in opposite directions, rather than a single photon.`, 1,
    t`The total momentum before is zero, so the total momentum after must be zero; a single photon always carries momentum, but two equal photons moving in opposite directions have zero total momentum.`,
    t`Conservation of momentum is the key idea.`),
])

const coil = { kind: 'data_table', title: 'Table 1', columns: ['Drop height h (m)', 'Speed at the coil v (m s⁻¹)', 'Peak EMF (mV)'],
  rows: [['0.05', '0.99', '35'], ['0.10', '1.40', '48'], ['0.20', '', '71'], ['0.30', '2.43', '84'], ['0.40', '2.80', '99']] }
S.q(IN, 'advanced', t`Students investigate how the peak EMF induced in a coil depends on the speed of a magnet passing through it. They drop a bar magnet from rest from different heights \(h\) above the coil and record the peak EMF on a data logger. They calculate the speed of the magnet as it reaches the coil using \(v = \sqrt{2gh}\). Their results are shown in Table 1.`, [
  part('a', t`Identify the independent variable, the dependent variable and one controlled variable.`, 2,
    t`Independent: the drop height (and hence the speed of the magnet). Dependent: the peak EMF. Controlled: e.g. the magnet used, the number of turns on the coil, or the orientation of the magnet.`,
    t`1 mark for the independent and dependent variables, 1 mark for a valid controlled variable.`),
  part('b', t`Calculate the missing value of \(v\).`, 1,
    t`1.98 m s⁻¹`,
    t`\(v = \sqrt{2 \times 9.81 \times 0.20} = 1.98\) m s⁻¹.`, { unit: 'm s⁻¹' }),
  part('c', t`On the axes below, plot the peak EMF against \(v\) and draw a line of best fit.`, 3,
    t`Five points close to a straight line through (or very near) the origin, reaching about 99 mV at 2.8 m s⁻¹.`,
    t`Marks: 1 for correctly plotted points (including the calculated point); 1 for a straight line of best fit; 1 for sensible use of the grid.`,
    { diagram: axes({ xMin: 0, xMax: 3.5, yMin: 0, yMax: 140, xStep: 0.5, yStep: 20, xLabel: 'v (m s⁻¹)', yLabel: 'peak EMF (mV)', width: 360 }) }),
  part('d', t`Use your line to predict the peak EMF when the magnet is dropped from 0.60 m.`, 2,
    t`About 120 mV (accept 115–125 mV)`,
    t`\(v = \sqrt{2 \times 9.81 \times 0.60} = 3.43\) m s⁻¹; from the line (gradient about 35 mV per m s⁻¹), the peak EMF is about 120 mV. 1 mark for the speed, 1 mark for the prediction from the graph.`, { unit: 'mV' }),
  part('e', t`Explain, using Faraday’s law, why the peak EMF increases with the speed of the magnet.`, 1,
    t`A faster magnet changes the flux through the coil in less time, so the rate of change of flux — and hence the induced EMF — is greater.`,
    t`Faraday’s law: \(\varepsilon = -N\frac{\Delta\Phi_B}{\Delta t}\).`),
  part('f', t`The data logger measures the EMF to the nearest 1 mV. Suggest one reason why the results still show scatter about the line.`, 1,
    t`Random variation in how the magnet is released — for example slight differences in its drop height or orientation, or it brushing the side of the coil.`,
    t`Any plausible source of random error in the procedure earns the mark.`),
], { diagram: coil })

export const ITEMS = S.items
