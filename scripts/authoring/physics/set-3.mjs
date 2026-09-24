// VCE Physics Unit 3 & 4 — Practice exam 3.
// Section A: 20 multiple choice. Section B: 15 questions, 100 marks.
// Every value is computed in checks/set3.py.
import { t, AOS, part, makeSet, axes, curve } from './phys.mjs'
import { drawing, traced } from './draw.mjs'

const { MO, FI, EL, LM, IN } = AOS
const S = makeSet(3)
const rad = d => (d * Math.PI) / 180

// ════════════════ Section A ════════════════

S.mc(MO, 'developing', t`A 1500 kg car accelerates along a level road at 2.0 m s⁻². The driving force on the car is 4500 N. The total resistive force acting on the car is`,
  ['1500 N', '3000 N', '4500 N', '7500 N'], 'A',
  t`\(F_{\text{net}} = ma = 1500 \times 2.0 = 3000\) N, and \(F_{\text{net}} = 4500 - F_{\text{resistive}}\), so the resistive force is 1500 N. 3000 N is the net force.`)

S.mc(MO, 'developing', t`A ball is thrown at an angle above the horizontal. Ignoring air resistance, which one of the following is true at the highest point of its path?`,
  ['The velocity of the ball is zero.', 'The acceleration of the ball is zero.', 'The net force on the ball is zero.', 'The acceleration of the ball is 9.81 m s⁻² downwards.'], 'D',
  t`Only gravity acts throughout the flight, so the acceleration is 9.81 m s⁻² downwards everywhere, including at the top. At the top only the vertical velocity is zero; the horizontal velocity remains.`)

S.mc(MO, 'proficient', t`A 70 kg rock climber climbs a vertical height of 12 m in 20 s. The average power used to increase the climber’s gravitational potential energy is closest to`,
  ['412 W', '824 W', '8.24 kW', '16.5 kW'], 'A',
  t`\(P = \frac{mg\Delta h}{t} = \frac{70 \times 9.81 \times 12}{20} = 412\) W. 8.24 kW is the energy (8240 J) mistaken for a power; 16.5 kW multiplies by the time instead of dividing.`)

const ft = { kind: 'function_graph', xMin: 0, xMax: 60, yMin: 0, yMax: 500, xStep: 10, yStep: 100, xLabel: 't (ms)', yLabel: 'F (N)', width: 260, grid: true, curves: [{ points: [[0, 0], [25, 400], [50, 0]] }] }
S.mc(MO, 'proficient', t`A 0.20 kg ball at rest is struck by a bat. The graph shows the force on the ball during the impact. The speed of the ball as it leaves the bat is closest to`,
  ['2.5 m s⁻¹', '10 m s⁻¹', '50 m s⁻¹', '100 m s⁻¹'], 'C',
  t`The impulse is the area under the force–time graph: \(\frac{1}{2} \times 400 \times 0.050 = 10\) N s. Then \(v = \frac{\Delta p}{m} = \frac{10}{0.20} = 50\) m s⁻¹. 100 m s⁻¹ uses the full rectangle instead of the triangle; 10 is the impulse, not the speed.`,
  { diagram: ft })

S.mc(MO, 'proficient', t`A 1200 kg car travels around a flat, unbanked curve of radius 50 m at a constant speed of 15 m s⁻¹. The magnitude of the sideways friction force on the car’s tyres is`,
  ['4.5 N', '360 N', '2700 N', '5400 N'], 'D',
  t`Friction provides the centripetal force: \(F = \frac{mv^2}{r} = \frac{1200 \times 15^2}{50} = 5400\) N. 4.5 is the centripetal acceleration in m s⁻², and 360 N uses \(v\) instead of \(v^2\).`)

S.mc(FI, 'developing', t`A geostationary satellite stays above the same point on Earth’s surface. To do this, the satellite must`,
  ['orbit above the poles', 'orbit above the equator with a period of 24 hours', 'be beyond the reach of Earth’s gravity', 'travel faster than a satellite in a low orbit'], 'B',
  t`To stay above one point, the satellite must turn with Earth: a period of 24 hours, in the equatorial plane, moving in the direction Earth rotates. Its large orbital radius means it travels more slowly than satellites in low orbits (\(v = \sqrt{\frac{GM}{r}}\)), and gravity still provides its centripetal force.`)

S.mc(FI, 'proficient', t`An alpha particle (charge \(+2e\)) is accelerated from rest through a potential difference of 1000 V. The kinetic energy it gains is`,
  ['8.0 × 10⁻¹⁷ J', '1.6 × 10⁻¹⁶ J', '3.2 × 10⁻¹⁶ J', '6.4 × 10⁻¹⁶ J'], 'C',
  t`\(W = qV = 2 \times 1.60 \times 10^{-19} \times 1000 = 3.2 \times 10^{-16}\) J (2000 eV). \(1.6 \times 10^{-16}\) J uses a single electronic charge.`)

S.mc(FI, 'proficient', t`A straight wire 25 cm long carries a current of 3.0 A at right angles to a uniform magnetic field of 0.40 T. The magnitude of the magnetic force on the wire is`,
  ['0.030 N', '0.30 N', '3.0 N', '30 N'], 'B',
  t`\(F = IlB = 3.0 \times 0.25 \times 0.40 = 0.30\) N. 30 N uses the length in centimetres.`)

S.mc(FI, 'developing', t`The magnetic field inside a long, current-carrying solenoid, well away from its ends, is`,
  ['zero', 'directed radially outwards from the axis', 'uniform and parallel to the axis of the solenoid', 'strongest next to the wires and zero along the axis'], 'C',
  t`Inside a long solenoid the fields of the individual turns combine to give a strong, uniform field parallel to the axis — like the field between the poles of a bar magnet. Its direction is given by the right-hand grip rule.`)

S.mc(EL, 'proficient', t`The magnetic flux through each turn of a 50-turn coil falls uniformly from 0.020 Wb to zero in 0.010 s. The magnitude of the average EMF induced in the coil is`,
  ['1.0 V', '2.0 V', '100 V', '200 V'], 'C',
  t`\(\varepsilon = N\frac{\Delta\Phi_B}{\Delta t} = 50 \times \frac{0.020}{0.010} = 100\) V. 2.0 V is the EMF in a single turn.`)

S.mc(EL, 'proficient', t`The coil of a simple AC generator rotates at a constant rate in a uniform magnetic field. The EMF induced in the coil is zero at the instant the plane of the coil is`,
  ['perpendicular to the magnetic field', 'parallel to the magnetic field', 'at 45° to the magnetic field', 'at any angle — the EMF is never zero'], 'A',
  t`When the plane of the coil is perpendicular to the field, the flux through it is a maximum but momentarily not changing, so the induced EMF is zero. The EMF is greatest when the plane is parallel to the field, where the flux is zero but changing fastest.`)

S.mc(EL, 'proficient', t`An ideal transformer is to step 240 V up to 6000 V. The primary coil has 200 turns. The number of turns needed on the secondary coil is`,
  ['8', '25', '5000', '12 000'], 'C',
  t`\(\frac{N_2}{N_1} = \frac{V_2}{V_1} = \frac{6000}{240} = 25\), so \(N_2 = 25 \times 200 = 5000\). 8 inverts the ratio; 25 is the ratio itself.`)

S.mc(EL, 'proficient', t`A power station transmits a fixed power along the same transmission lines. If the transmission voltage is doubled, the power lost in the lines becomes`,
  ['four times as large', 'twice as large', 'half as large', 'one-quarter as large'], 'D',
  t`For fixed power, \(I = \frac{P}{V}\) halves, and \(P_{\text{loss}} = I^2R\) falls by a factor of \(2^2 = 4\).`)

S.mc(LM, 'proficient', t`In a double-slit experiment, adjacent bright bands on a screen are 4.0 mm apart. The slit separation is doubled, with nothing else changed. The new separation of the bright bands is`,
  ['2.0 mm', '4.0 mm', '8.0 mm', '16 mm'], 'A',
  t`\(\Delta x = \frac{\lambda L}{d}\), so doubling \(d\) halves the spacing, to 2.0 mm.`)

S.mc(LM, 'developing', t`Light shining on a metal surface emits photoelectrons. Which one of the following would increase the maximum kinetic energy of the photoelectrons?`,
  ['increasing the intensity of the light', 'increasing the frequency of the light', 'using a metal with a larger work function', 'illuminating a larger area of the metal'], 'B',
  t`\(E_{k\,\text{max}} = hf - \phi\): each photon then carries more energy. Intensity and area change only the number of photons (and so the number of photoelectrons); a larger work function reduces \(E_{k\,\text{max}}\).`)

S.mc(LM, 'proficient', t`Electrons are accelerated in an electron diffraction tube and pass through a thin graphite film, producing rings on a screen. The accelerating voltage is then increased. The rings become`,
  ['larger, because the de Broglie wavelength of the electrons increases', 'larger, because the momentum of the electrons increases', 'unchanged, because diffraction depends only on the graphite', 'smaller, because the de Broglie wavelength of the electrons decreases'], 'D',
  t`A larger accelerating voltage gives the electrons more momentum, so \(\lambda = \frac{h}{p}\) decreases. Shorter waves diffract through smaller angles, so the rings shrink.`)

S.mc(LM, 'proficient', t`The three lowest energy levels of hydrogen are −13.6 eV, −3.4 eV and −1.5 eV. Hydrogen atoms in the ground state are exposed to photons of several energies. Which one of these photons can be absorbed?`,
  ['10.2 eV', '11.0 eV', '1.9 eV', '5.0 eV'], 'A',
  t`A photon is absorbed only if its energy exactly equals the gap between the ground state and a higher level: \(-3.4 - (-13.6) = 10.2\) eV (or 12.1 eV). 1.9 eV matches the \(n = 2 \to 3\) gap, but these atoms are in the ground state.`)

S.mc(LM, 'proficient', t`A clock on a spacecraft travelling at \(0.80c\) relative to Earth records a time interval of 1.00 hour. The same interval measured by an observer on Earth is`,
  ['0.600 hours', '1.67 hours', '2.00 hours', '2.78 hours'], 'B',
  t`\(\gamma = \frac{1}{\sqrt{1 - 0.80^2}} = 1.67\). The spacecraft clock measures the proper time, so the Earth observer measures \(t = t_0\gamma = 1.67\) hours. 0.600 hours divides by \(\gamma\); 2.78 hours multiplies by \(\gamma^2\).`)

S.mc(LM, 'developing', t`The significance of the null result of the Michelson–Morley experiment is that it`,
  ['proved that light behaves as a particle', 'measured the speed of Earth through the aether', 'showed that light slows down in moving materials', 'gave evidence that there is no aether, consistent with light having the same speed for all observers'], 'D',
  t`The experiment looked for a change in the speed of light caused by Earth moving through the proposed aether and found none. Einstein’s postulate that the speed of light is the same in all inertial frames removed the need for an aether.`)

S.mc(IN, 'developing', t`A student uses a light gate to measure the speed of a trolley. The best way to reduce the effect of random errors on the result is to`,
  ['calibrate the light gate against a known standard', 'repeat the measurement several times and average the results', 'use a different student to release the trolley', 'change the range of the independent variable'], 'B',
  t`Random errors scatter results both above and below the true value, so averaging repeated measurements reduces their effect. Calibration addresses systematic errors, which repetition cannot remove.`)

// ════════════════ Section B ════════════════

const tow = drawing(330, 90)
tow.ground(10, 320, 70).rect(40, 30, 110, 34, { fill: 'light' }).text(95, 51, 'car 1200 kg', { size: 8.5 })
  .circle(65, 64, 6, { fill: 'dark' }).circle(125, 64, 6, { fill: 'dark' }).line(150, 50, 190, 50, { w: 2 })
  .rect(190, 36, 80, 28, { fill: 'white' }).text(230, 54, 'trailer 400 kg', { size: 8.5 }).circle(230, 64, 6, { fill: 'dark' })
  .arrow(95, 20, 145, 20).text(120, 14, 'direction of motion', { size: 8 })
S.q(MO, 'proficient', t`A car of mass 1200 kg tows a trailer of mass 400 kg along a level road using a light, rigid tow bar, as shown in Figure 1. The driving force on the car is 3200 N. Resistive forces of 300 N act on the car and 100 N on the trailer.`, [
  part('a', t`Calculate the acceleration of the car and trailer.`, 2,
    t`1.75 m s⁻²`,
    t`Treat the car and trailer as one system: \(a = \frac{3200 - 300 - 100}{1200 + 400} = \frac{2800}{1600} = 1.75\) m s⁻². 1 mark for the net force on the system, 1 mark for the value.`, { unit: 'm s⁻²' }),
  part('b', t`Calculate the magnitude of the force that the tow bar exerts on the trailer.`, 2,
    t`800 N`,
    t`For the trailer alone: \(T - 100 = 400 \times 1.75\), so \(T = 800\) N. 1 mark for the trailer’s force equation, 1 mark for the value. Common error: forgetting the trailer’s own resistive force (answer 700 N).`, { unit: 'N' }),
  part('c', t`State the magnitude and direction of the force that the trailer exerts on the car through the tow bar, and name the law that gives this.`, 1,
    t`800 N, backwards (opposite to the motion); Newton’s third law.`,
    t`The tow bar forces on the car and on the trailer are an action–reaction pair: equal in size, opposite in direction.`),
], { diagram: tow.done('Figure 1') })

// Basketball: 36 px per metre, floor at y = 150.
const PX = 36, FL = 150, bx0 = 64
const ux3 = 7.2 * Math.cos(rad(52)), uy3 = 7.2 * Math.sin(rad(52))
const ball = drawing(312, 188)
ball.ground(10, 302, FL).dot(bx0, FL - 2.1 * PX, 3)
  .arrow(bx0, FL - 2.1 * PX, bx0 + 34 * Math.cos(rad(52)), FL - 2.1 * PX - 34 * Math.sin(rad(52))).text(bx0 - 4, 50, '7.20 m s⁻¹', { anchor: 'end', size: 8.5 }).angle(bx0, FL - 2.1 * PX, 18, 0, 52, '52°')
  .path(traced(tt => FL - PX * (2.1 + uy3 * tt - 4.905 * tt * tt), 0, 0.9475, s => bx0 + PX * ux3 * s, v => v, 40))
  .line(bx0 + 4.2 * PX - 8, FL - 3.05 * PX, bx0 + 4.2 * PX + 8, FL - 3.05 * PX, { w: 2.4 }).line(bx0 + 4.2 * PX + 10, FL - 3.05 * PX - 30, bx0 + 4.2 * PX + 10, FL - 3.05 * PX + 8, { w: 2 })
  .line(bx0 + 4.2 * PX + 10, FL - 3.05 * PX - 6, bx0 + 4.2 * PX + 22, FL - 3.05 * PX - 6).line(bx0 + 4.2 * PX + 22, FL - 3.05 * PX - 6, bx0 + 4.2 * PX + 22, FL, { w: 1.6 })
  .dim(46, FL - 2.1 * PX, 46, FL, '2.10 m', { offset: 16 }).dim(274, FL - 3.05 * PX, 274, FL, '3.05 m', { offset: -18 })
  .dim(bx0, 168, bx0 + 4.2 * PX, 168, '4.20 m', { offset: 10 })
S.q(MO, 'advanced', t`A basketball is released 2.10 m above the floor with a speed of 7.20 m s⁻¹ at 52.0° above the horizontal, as shown in Figure 2. The centre of the hoop is 3.05 m above the floor and 4.20 m horizontally from the release point. Ignore air resistance and treat the ball as a particle.`, [
  part('a', t`Calculate the time the ball takes to travel 4.20 m horizontally.`, 2,
    t`0.947 s`,
    t`\(u_x = 7.20\cos(52.0^\circ) = 4.43\) m s⁻¹ is constant, so \(t = \frac{4.20}{4.43} = 0.947\) s. 1 mark for the horizontal component, 1 mark for the time.`, { unit: 's' }),
  part('b', t`The ball goes through the hoop if its centre is within 0.10 m of the height of the hoop’s centre at that moment. Determine whether the ball goes through the hoop.`, 3,
    t`Yes: the ball is 3.07 m above the floor, 0.02 m above the centre of the hoop.`,
    t`\(u_y = 7.20\sin(52.0^\circ) = 5.67\) m s⁻¹; vertical displacement \(= 5.67 \times 0.947 - \frac{1}{2} \times 9.81 \times 0.947^2 = 0.97\) m, so the height is \(2.10 + 0.97 = 3.07\) m. Marks: 1 for the vertical component; 1 for the displacement; 1 for the height with the conclusion.`),
  part('c', t`State whether the ball is rising or falling as it reaches the hoop, and justify your answer with a calculation.`, 1,
    t`Falling: \(v_y = 5.67 - 9.81 \times 0.947 = -3.62\) m s⁻¹ (downwards).`,
    t`Alternatively, the time to the highest point is \(\frac{5.67}{9.81} = 0.58\) s, which is before 0.947 s.`),
  part('d', t`Calculate the speed of the ball as it reaches the hoop.`, 1,
    t`5.72 m s⁻¹`,
    t`\(v = \sqrt{4.43^2 + 3.62^2} = 5.72\) m s⁻¹.`, { unit: 'm s⁻¹' }),
], { diagram: ball.done('Figure 2') })

const pend = drawing(300, 150)
pend.ceiling(150, 250, 14).line(175, 14, 175, 94).line(225, 14, 225, 94).rect(170, 94, 60, 30, { fill: 'light' }).text(200, 113, '2.00 kg', { size: 8.5 })
  .line(175, 14, 198, 60, { dash: true, grey: true }).line(225, 14, 248, 60, { dash: true, grey: true }).rect(193, 60, 60, 30, { fill: 'none', dash: true })
  .line(232, 94, 272, 94, { dash: true, grey: true }).dot(60, 109, 2.6).arrow(64, 109, 120, 109).text(80, 100, 'bullet', { size: 8.5 }).dim(268, 94, 268, 60, 'h', { offset: 10, italic: true })
S.q(MO, 'advanced', t`A ballistic pendulum is used to measure the speed of a bullet. A 10.0 g bullet is fired horizontally into a 2.00 kg wooden block hanging from light strings, as shown in Figure 3. The bullet stays in the block, and the block rises through a vertical height \(h = 5.00\) cm.`, [
  part('a', t`Calculate the speed of the block and bullet immediately after the collision.`, 2,
    t`0.990 m s⁻¹`,
    t`As the block swings up, its kinetic energy becomes gravitational potential energy: \(\frac{1}{2}mv^2 = mgh\), so \(v = \sqrt{2gh} = \sqrt{2 \times 9.81 \times 0.0500} = 0.990\) m s⁻¹. 1 mark for the energy equation, 1 mark for the value.`, { unit: 'm s⁻¹' }),
  part('b', t`Calculate the speed of the bullet before it hit the block.`, 2,
    t`199 m s⁻¹`,
    t`Momentum is conserved in the collision: \(0.0100u = 2.010 \times 0.990\), so \(u = 199\) m s⁻¹. 1 mark for conservation of momentum with the combined mass, 1 mark for the value.`, { unit: 'm s⁻¹' }),
  part('c', t`Calculate the percentage of the bullet’s kinetic energy that is transformed into other forms in the collision.`, 2,
    t`99.5%`,
    t`Before: \(\frac{1}{2}(0.0100)(199)^2 = 198\) J. After: \(\frac{1}{2}(2.010)(0.990)^2 = 0.986\) J. So \(\frac{198 - 0.986}{198} = 99.5\%\) becomes heat, sound and deformation. 1 mark for both kinetic energies, 1 mark for the percentage. Note that energy conservation cannot be applied across the collision itself.`, { unit: '%' }),
], { diagram: pend.done('Figure 3') })

// Spring launcher and hill: floor at y = 70; hill 0.60 m drawn as 50 px.
const hill = drawing(340, 80)
const hx = x => (x < 150 ? 70 : x > 290 ? 70 : 70 - 25 * (1 - Math.cos(((x - 150) / 140) * 2 * Math.PI)))
hill.wall(20, 30, 70, -1).poly(Array.from({ length: 81 }, (_, i) => { const x = 20 + (i * 280) / 80; return [x, hx(x)] }), { w: 1.3 })
  .spring(20, 59, 66, 59, 6, 5).block(66, 48, 34, 22, '2.0 kg', { size: 8 }).line(220, 20, 306, 20, { dash: true, grey: true })
  .dim(306, 20, 306, 70, '0.60 m', { offset: -18 })
S.q(MO, 'proficient', t`A spring with a spring constant of 800 N m⁻¹ is compressed by 0.20 m and used to launch a 2.0 kg cart along a track. The track then rises over a hill 0.60 m high, as shown in Figure 4. Ignore friction and air resistance.`, [
  part('a', t`Calculate the elastic potential energy stored in the compressed spring.`, 1,
    t`16 J`,
    t`\(E_s = \frac{1}{2}kx^2 = \frac{1}{2} \times 800 \times 0.20^2 = 16\) J.`, { unit: 'J' }),
  part('b', t`Calculate the speed of the cart as it leaves the spring.`, 1,
    t`4.0 m s⁻¹`,
    t`\(\frac{1}{2}mv^2 = 16\), so \(v = \sqrt{\frac{2 \times 16}{2.0}} = 4.0\) m s⁻¹.`, { unit: 'm s⁻¹' }),
  part('c', t`Calculate the speed of the cart at the top of the hill.`, 2,
    t`2.06 m s⁻¹`,
    t`\(E_k = 16 - mgh = 16 - 2.0 \times 9.81 \times 0.60 = 4.23\) J, so \(v = \sqrt{\frac{2 \times 4.23}{2.0}} = 2.06\) m s⁻¹. 1 mark for the energy remaining, 1 mark for the speed.`, { unit: 'm s⁻¹' }),
  part('d', t`Calculate the height of the highest hill the cart could get over.`, 1,
    t`0.82 m`,
    t`All 16 J becomes gravitational potential energy: \(h = \frac{16}{2.0 \times 9.81} = 0.82\) m (strictly, just under this, so that the cart is still moving at the top).`, { unit: 'm' }),
  part('e', t`Describe the energy transformations from the moment the cart is released until it reaches the top of the hill.`, 1,
    t`Elastic potential energy → kinetic energy (as the spring extends) → partly gravitational potential energy as the cart climbs, with the rest remaining as kinetic energy.`,
    t`All three forms, in order, are needed for the mark.`),
], { diagram: hill.done('Figure 4') })

const GM = 6.67e-11 * 5.98e24
const gr = x => GM / (x * 1e6) ** 2
S.q(FI, 'advanced', t`Figure 5 shows how the strength of Earth’s gravitational field varies with distance \(r\) from Earth’s centre, from Earth’s surface (\(r = 6.37 \times 10^6\) m) outwards. A 500 kg satellite is to be lifted from Earth’s surface to a height where \(r = 1.274 \times 10^7\) m (twice Earth’s radius).`, [
  part('a', t`Use Figure 5 to state the gravitational field strength at \(r = 1.274 \times 10^7\) m.`, 1,
    t`About 2.5 N kg⁻¹ (exactly 2.46 N kg⁻¹)`,
    t`Read from the graph; it is a quarter of the surface value, since the distance from the centre has doubled.`, { unit: 'N kg⁻¹' }),
  part('b', t`Use Figure 5 to estimate the increase in gravitational potential energy of the satellite as it is lifted from the surface to \(r = 1.274 \times 10^7\) m.`, 3,
    t`About 1.6 × 10¹⁰ J (accept 1.4 × 10¹⁰ – 1.8 × 10¹⁰ J)`,
    t`The shaded area under the field–distance graph is the energy per kilogram: about 63 grid squares, each worth \(0.5 \times 10^6 \times 1 = 5 \times 10^5\) J kg⁻¹, giving about \(3.1 \times 10^7\) J kg⁻¹. For 500 kg: \(\Delta E \approx 500 \times 3.1 \times 10^7 = 1.6 \times 10^{10}\) J. Marks: 1 for using the area under the graph; 1 for a reasonable area in J kg⁻¹; 1 for multiplying by the mass.`, { unit: 'J' }),
  part('c', t`A student calculates the energy as \(mg\Delta h\) with \(g = 9.81\) N kg⁻¹ and obtains \(3.1 \times 10^{10}\) J. Explain why this overestimates the energy needed.`, 1,
    t`\(g\) decreases as the satellite rises (inverse-square law), so using the surface value of 9.81 N kg⁻¹ throughout overestimates the force and the work done.`,
    t`The field is not uniform over such large distances.`),
  part('d', t`Calculate the speed the satellite would need to orbit at \(r = 1.274 \times 10^7\) m.`, 2,
    t`5.60 × 10³ m s⁻¹`,
    t`\(v = \sqrt{\frac{GM_E}{r}} = \sqrt{\frac{6.67 \times 10^{-11} \times 5.98 \times 10^{24}}{1.274 \times 10^7}} = 5.60 \times 10^3\) m s⁻¹. 1 mark for the relationship, 1 mark for the value.`, { unit: 'm s⁻¹' }),
], { diagram: { kind: 'function_graph', xMin: 6, xMax: 14, yMin: 0, yMax: 10, xStep: 0.5, yStep: 1, xLabel: 'r (× 10⁶ m)', yLabel: 'g (N kg⁻¹)', width: 380, grid: true, curves: [{ points: curve(gr, 6.37, 14, 60) }], regions: [{ points: [...curve(gr, 6.37, 12.74, 40), [12.74, 0], [6.37, 0]] }], caption: 'Figure 5' } })

const pc = drawing(300, 86)
pc.charge(50, 40, '+', 10, '+4.0 μC').charge(250, 40, '−', 10, '−2.0 μC').line(60, 40, 240, 40, { dash: true, grey: true }).dot(150, 40, 2.4).text(150, 32, 'M', { bold: true })
  .dim(50, 66, 250, 66, '0.30 m', { offset: 10 })
S.q(FI, 'proficient', t`A charge of \(+4.0\) μC and a charge of \(-2.0\) μC are fixed 0.30 m apart, as shown in Figure 6. Point M is midway between them.`, [
  part('a', t`Calculate the magnitude of the electric force between the charges, and state whether it is attractive or repulsive.`, 2,
    t`0.80 N, attractive`,
    t`\(F = \frac{kq_1q_2}{r^2} = \frac{8.99 \times 10^9 \times 4.0 \times 10^{-6} \times 2.0 \times 10^{-6}}{0.30^2} = 0.80\) N; unlike charges attract. 1 mark for the magnitude, 1 mark for “attractive”.`, { unit: 'N' }),
  part('b', t`Calculate the magnitude and direction of the electric field at M.`, 3,
    t`2.4 × 10⁶ N C⁻¹, directed towards the −2.0 μC charge`,
    t`From the \(+4.0\) μC charge: \(\frac{8.99 \times 10^9 \times 4.0 \times 10^{-6}}{0.15^2} = 1.60 \times 10^6\) N C⁻¹, pointing away from it (to the right). From the \(-2.0\) μC charge: \(0.80 \times 10^6\) N C⁻¹, pointing towards it (also to the right). The fields add: \(2.4 \times 10^6\) N C⁻¹ to the right. Marks: 1 for each field; 1 for adding them with the correct direction. Common error: subtracting the fields.`),
  part('c', t`An electron is placed at M. State the direction of the electric force on it.`, 1,
    t`Towards the +4.0 μC charge (to the left)`,
    t`A negative charge experiences a force opposite to the field direction.`),
], { diagram: pc.done('Figure 6') })

const vs = drawing(300, 110)
vs.plates(80, 22, 150, 64, '+', '−').fieldIn(84, 24, 142, 20, 20).fieldIn(84, 64, 142, 20, 20).arrow(14, 54, 76, 54).text(16, 48, 'electron beam', { anchor: 'start', size: 8 })
  .line(80, 54, 230, 54, { dash: true }).arrow(230, 54, 262, 54, { dash: true })
S.q(FI, 'advanced', t`A velocity selector lets through only charged particles of one speed. Electrons travel between two parallel plates that produce a uniform electric field of \(2.0 \times 10^4\) V m⁻¹, with a uniform magnetic field of 0.050 T directed into the page, as shown in Figure 7. Electrons of one particular speed pass straight through undeflected.`, [
  part('a', t`Show that the electrons that pass through undeflected have a speed of \(4.0 \times 10^5\) m s⁻¹.`, 2,
    t`\(qE = qvB\), so \(v = \frac{E}{B} = \frac{2.0 \times 10^4}{0.050} = 4.0 \times 10^5\) m s⁻¹.`,
    t`The electric and magnetic forces must be equal and opposite. 1 mark for equating the forces, 1 mark for the substitution.`),
  part('b', t`Electrons moving faster than \(4.0 \times 10^5\) m s⁻¹ are deflected. State whether they are deflected towards the top or the bottom of the page, and explain.`, 2,
    t`Towards the bottom of the page. The electric force (\(qE\)) is unchanged, but the magnetic force (\(qvB\)) is larger for faster electrons, and for an electron moving right in a field into the page it points down.`,
    t`The electric force on an electron points towards the positive (top) plate. For the magnetic force: a positive charge moving right in a field into the page is pushed up, so an electron is pushed down. 1 mark for the direction, 1 mark for the explanation.`),
  part('c', t`The electric field is switched off. Calculate the radius of the path of the \(4.0 \times 10^5\) m s⁻¹ electrons in the magnetic field.`, 2,
    t`4.6 × 10⁻⁵ m`,
    t`\(r = \frac{mv}{qB} = \frac{9.11 \times 10^{-31} \times 4.0 \times 10^5}{1.60 \times 10^{-19} \times 0.050} = 4.6 \times 10^{-5}\) m. 1 mark for the substitution, 1 mark for the value.`, { unit: 'm' }),
], { diagram: vs.done('Figure 7') })

S.q(EL, 'advanced', t`Figure 8 shows how the magnetic flux through each turn of a 200-turn coil changes with time.`, [
  part('a', t`Calculate the magnitude of the EMF induced in the coil between \(t = 0\) and \(t = 20\) ms.`, 2,
    t`40 V`,
    t`\(\varepsilon = N\frac{\Delta\Phi_B}{\Delta t} = 200 \times \frac{4.0 \times 10^{-3}}{0.020} = 40\) V. 1 mark for the substitution with the flux in webers and time in seconds, 1 mark for the value.`, { unit: 'V' }),
  part('b', t`State the EMF induced between \(t = 20\) ms and \(t = 40\) ms, and explain.`, 1,
    t`Zero: the flux is not changing.`,
    t`An EMF is induced only by a change in flux, not by a large flux.`),
  part('c', t`Calculate the magnitude of the EMF induced between \(t = 40\) ms and \(t = 50\) ms.`, 2,
    t`80 V`,
    t`The same change in flux happens in half the time: \(200 \times \frac{4.0 \times 10^{-3}}{0.010} = 80\) V. 1 mark for the method, 1 mark for the value.`, { unit: 'V' }),
  part('d', t`On the axes below, sketch the EMF induced in the coil from \(t = 0\) to \(t = 60\) ms. Take the EMF between 0 and 20 ms as positive.`, 2,
    t`+40 V from 0 to 20 ms; 0 from 20 to 40 ms; −80 V from 40 to 50 ms; 0 from 50 to 60 ms.`,
    t`1 mark for the correct values in each interval; 1 mark for the EMF reversing sign when the flux decreases (Lenz’s law).`,
    { diagram: axes({ xMin: 0, xMax: 60, yMin: -100, yMax: 100, xStep: 10, yStep: 20, xLabel: 't (ms)', yLabel: 'EMF (V)', width: 360 }) }),
  part('e', t`Explain, with reference to Lenz’s law, why the EMF between 40 ms and 50 ms has the opposite sign to the EMF between 0 and 20 ms.`, 1,
    t`The induced current always opposes the change in flux: when the flux increases the induced field opposes the increase, and when it decreases the induced field is in the other direction, supporting the flux — so the EMF reverses.`,
    t`The change in flux has reversed sign, so the induced EMF must too.`),
], { diagram: { kind: 'function_graph', xMin: 0, xMax: 60, yMin: 0, yMax: 5, xStep: 10, yStep: 1, xLabel: 't (ms)', yLabel: 'Φ (mWb)', width: 340, grid: true, curves: [{ points: [[0, 0], [20, 4], [40, 4], [50, 0], [60, 0]] }], caption: 'Figure 8' } })

S.q(EL, 'proficient', t`An alternator produces a sinusoidal EMF with a peak value of 325 V and a frequency of 50 Hz. It is connected to a heater of resistance 100 Ω.`, [
  part('a', t`Calculate the RMS voltage across the heater.`, 1,
    t`230 V`,
    t`\(V_{\text{RMS}} = \frac{325}{\sqrt{2}} = 230\) V.`, { unit: 'V' }),
  part('b', t`Calculate the RMS current in the heater.`, 1,
    t`2.30 A`,
    t`\(I_{\text{RMS}} = \frac{230}{100} = 2.30\) A.`, { unit: 'A' }),
  part('c', t`Calculate the average power delivered to the heater.`, 2,
    t`528 W`,
    t`\(P = V_{\text{RMS}}I_{\text{RMS}} = 230 \times 2.30 = 528\) W. 1 mark for using RMS values, 1 mark for the value. Common error: using peak values, giving 1056 W.`, { unit: 'W' }),
  part('d', t`State the maximum instantaneous power delivered to the heater.`, 1,
    t`1.06 × 10³ W`,
    t`At the peaks \(P = \frac{V_{\text{peak}}^2}{R} = \frac{325^2}{100} = 1056\) W — twice the average power.`, { unit: 'W' }),
  part('e', t`The alternator’s rotation rate is halved. State the new peak EMF and the new period of the output.`, 2,
    t`Peak 163 V; period 0.040 s`,
    t`Halving the rotation rate halves the rate of change of flux, so the peak EMF halves to 163 V; the frequency halves to 25 Hz, so the period doubles from 0.020 s to 0.040 s. 1 mark for each.`),
])

S.q(EL, 'advanced', t`A power station delivers 60 MW to a transmission line at 330 kV. The line has a total resistance of 12 Ω. At a substation near a town, an ideal transformer steps the voltage down to about 22 kV.`, [
  part('a', t`Calculate the current in the transmission line.`, 1,
    t`182 A`,
    t`\(I = \frac{P}{V} = \frac{60 \times 10^6}{330 \times 10^3} = 182\) A.`, { unit: 'A' }),
  part('b', t`Calculate the power lost in the transmission line.`, 2,
    t`3.97 × 10⁵ W`,
    t`\(P_{\text{loss}} = I^2R = 182^2 \times 12 = 3.97 \times 10^5\) W. 1 mark for the method, 1 mark for the value.`, { unit: 'W' }),
  part('c', t`Express this loss as a percentage of the power delivered to the line.`, 1,
    t`0.66%`,
    t`\(\frac{3.97 \times 10^5}{60 \times 10^6} = 0.66\%\).`, { unit: '%' }),
  part('d', t`The transformer at the substation has a turns ratio of 15 : 1. Calculate the voltage it supplies to the town, allowing for the voltage drop along the line.`, 3,
    t`2.19 × 10⁴ V (21.9 kV)`,
    t`\(V_{\text{drop}} = IR = 182 \times 12 = 2.18 \times 10^3\) V, so the substation receives \(330\,000 - 2180 = 327\,800\) V, and the output is \(\frac{327\,800}{15} = 2.19 \times 10^4\) V. Marks: 1 for the voltage drop; 1 for the voltage at the substation; 1 for applying the turns ratio.`, { unit: 'V' }),
  part('e', t`Suggest one reason why electricity is not transmitted at even higher voltages to reduce the losses further.`, 1,
    t`Higher voltages need larger insulators, taller towers and more expensive transformers, and increase the risk of arcing (corona discharge).`,
    t`Any one practical limitation earns the mark.`),
])

const pe = { kind: 'function_graph', xMin: 0, xMax: 10, yMin: 0, yMax: 2.5, xStep: 1, yStep: 0.5, xLabel: 'f (× 10¹⁴ Hz)', yLabel: 'V₀ (V)', width: 340, grid: true,
  curves: [{ points: [[4.4, 0], [10, 2.318]] }, { points: [[6.0, 0], [10, 1.656]], dashed: true }],
  labels: [{ x: 8.6, y: 1.9, text: 'metal A', at: 'nw' }, { x: 9.0, y: 1.0, text: 'metal B', at: 'se' }], caption: 'Figure 9' }
S.q(LM, 'proficient', t`Figure 9 shows the stopping voltage \(V_0\) against the frequency \(f\) of the light for two metals, A and B, in a photoelectric experiment.`, [
  part('a', t`Explain why the two lines are parallel.`, 1,
    t`Both gradients equal \(\frac{h}{e}\), which is the same for all metals.`,
    t`\(eV_0 = hf - \phi\), so \(V_0 = \frac{h}{e}f - \frac{\phi}{e}\): the gradient does not depend on the metal; only the intercept (the work function) does.`),
  part('b', t`The threshold frequency of metal B is \(6.0 \times 10^{14}\) Hz. Calculate its work function, in eV.`, 2,
    t`2.48 eV`,
    t`\(\phi = hf_0 = 4.14 \times 10^{-15} \times 6.0 \times 10^{14} = 2.48\) eV. 1 mark for the method, 1 mark for the value.`, { unit: 'eV' }),
  part('c', t`Calculate the stopping voltage for metal B when the frequency of the light is \(8.0 \times 10^{14}\) Hz.`, 2,
    t`0.83 V`,
    t`\(E_{k\,\text{max}} = 4.14 \times 10^{-15} \times 8.0 \times 10^{14} - 2.48 = 0.83\) eV, so \(V_0 = 0.83\) V. 1 mark for the kinetic energy, 1 mark for converting to volts.`, { unit: 'V' }),
  part('d', t`Light of the same frequency falls on both metals. State which metal emits photoelectrons with the greater maximum kinetic energy, and explain.`, 1,
    t`Metal A: its work function is smaller, so more of each photon’s energy remains as kinetic energy.`,
    t`Its threshold frequency (4.4 × 10¹⁴ Hz) is lower than B’s.`),
], { diagram: pe })

S.q(LM, 'proficient', t`In a double-slit experiment with monochromatic light, point P on the screen is the centre of the second dark band from the central bright band. The path difference from the two slits to P is 900 nm.`, [
  part('a', t`Calculate the wavelength of the light.`, 2,
    t`600 nm`,
    t`The second dark band has a path difference of \(1.5\lambda\) (the first is at \(0.5\lambda\)): \(\lambda = \frac{900}{1.5} = 600\) nm. 1 mark for \(1.5\lambda\), 1 mark for the value.`, { unit: 'nm' }),
  part('b', t`The light is made so dim that only one photon at a time passes through the apparatus. A sensitive detector records where each photon arrives. Describe what the detector records over a long time.`, 2,
    t`Each photon arrives at a single point, apparently at random; as the number of photons grows, the points build up the same pattern of bright and dark bands.`,
    t`1 mark for single localised arrivals, 1 mark for the interference pattern emerging over time.`),
  part('c', t`Explain what the observations in part b show about the nature of light.`, 2,
    t`Light shows both particle and wave behaviour: it is detected as individual photons (particles), but the probability of where each arrives follows a wave interference pattern.`,
    t`1 mark for the particle evidence, 1 mark for the wave evidence (wave–particle duality).`),
])

S.q(LM, 'advanced', t`In a fusion reaction, a deuterium nucleus and a tritium nucleus combine to form a helium-4 nucleus and a neutron. The masses are: deuterium \(3.3436 \times 10^{-27}\) kg, tritium \(5.0074 \times 10^{-27}\) kg, helium-4 \(6.6447 \times 10^{-27}\) kg and neutron \(1.6749 \times 10^{-27}\) kg.`, [
  part('a', t`Calculate the decrease in mass in one reaction.`, 2,
    t`3.14 × 10⁻²⁹ kg`,
    t`\((3.3436 + 5.0074) - (6.6447 + 1.6749) = 8.3510 - 8.3196 = 0.0314 \times 10^{-27}\) kg. 1 mark for the totals, 1 mark for the difference.`, { unit: 'kg' }),
  part('b', t`Calculate the energy released in one reaction, in MeV.`, 2,
    t`17.7 MeV`,
    t`\(E = \Delta mc^2 = 3.14 \times 10^{-29} \times (3.00 \times 10^8)^2 = 2.83 \times 10^{-12}\) J \(= \frac{2.83 \times 10^{-12}}{1.60 \times 10^{-19}} = 1.77 \times 10^7\) eV. 1 mark for the energy in joules, 1 mark for the conversion.`, { unit: 'MeV' }),
  part('c', t`A fusion power station produces 1.0 GW. Calculate the number of these reactions needed each second.`, 1,
    t`3.5 × 10²⁰`,
    t`\(\frac{1.0 \times 10^9}{2.83 \times 10^{-12}} = 3.5 \times 10^{20}\) reactions per second.`),
  part('d', t`Explain where the energy released in the reaction comes from.`, 1,
    t`From rest energy: the products have less mass than the reactants, and the missing mass is transformed into kinetic energy (\(E = mc^2\)).`,
    t`Mass and energy are equivalent; the total energy (including rest energy) is conserved.`),
])

S.q(LM, 'proficient', t`An electron and a neutron (mass \(1.675 \times 10^{-27}\) kg) each have a de Broglie wavelength of 0.15 nm.`, [
  part('a', t`Calculate the momentum of each particle.`, 1,
    t`4.42 × 10⁻²⁴ kg m s⁻¹ (the same for both)`,
    t`\(p = \frac{h}{\lambda} = \frac{6.63 \times 10^{-34}}{0.15 \times 10^{-9}} = 4.42 \times 10^{-24}\) kg m s⁻¹. The same wavelength means the same momentum, whatever the mass.`, { unit: 'kg m s⁻¹' }),
  part('b', t`Calculate the kinetic energy of the electron, in eV.`, 2,
    t`67 eV`,
    t`\(E_k = \frac{p^2}{2m} = \frac{(4.42 \times 10^{-24})^2}{2 \times 9.11 \times 10^{-31}} = 1.07 \times 10^{-17}\) J \(= 67\) eV. 1 mark for the kinetic energy in joules, 1 mark for eV.`, { unit: 'eV' }),
  part('c', t`Calculate the kinetic energy of the neutron, in eV.`, 2,
    t`0.036 eV`,
    t`\(E_k = \frac{(4.42 \times 10^{-24})^2}{2 \times 1.675 \times 10^{-27}} = 5.83 \times 10^{-21}\) J \(= 0.036\) eV — much less, because the neutron is about 1840 times as massive. 1 mark for the method, 1 mark for the value.`, { unit: 'eV' }),
  part('d', t`Explain why both particles would produce a diffraction pattern when directed at a crystal with atoms 0.2 nm apart.`, 1,
    t`Their wavelength (0.15 nm) is comparable to the atomic spacing, so they diffract significantly.`,
    t`Significant diffraction needs \(\frac{\lambda}{w}\) close to 1.`),
])

const ramp = { kind: 'data_table', title: 'Table 1', columns: ['h (m)', 'v (m s⁻¹)', 'v² (m² s⁻²)'],
  rows: [['0.10', '1.31', '1.72'], ['0.20', '1.89', '3.57'], ['0.30', '2.31', ''], ['0.40', '2.66', '7.08'], ['0.50', '2.98', '8.88']] }
S.q(IN, 'advanced', t`Students release a trolley from rest at different heights \(h\) on a ramp and use a light gate to measure its speed \(v\) at the bottom. Their results are shown in Table 1.`, [
  part('a', t`Write a hypothesis for this investigation.`, 1,
    t`If the release height increases, then the speed at the bottom increases, with \(v^2\) directly proportional to \(h\) (from \(mgh = \frac{1}{2}mv^2\)).`,
    t`A testable relationship between the independent and dependent variables is required.`),
  part('b', t`Explain why the students plot \(v^2\) against \(h\) rather than \(v\) against \(h\).`, 1,
    t`Energy conservation predicts \(v^2 = 2gh\), so \(v^2\) against \(h\) should be a straight line through the origin, whose gradient is easy to find.`,
    t`Linearising the data makes it easy to test the relationship and extract a constant.`),
  part('c', t`Calculate the missing value of \(v^2\).`, 1,
    t`5.34 m² s⁻²`,
    t`\(2.31^2 = 5.34\).`, { unit: 'm² s⁻²' }),
  part('d', t`On the axes below, plot \(v^2\) against \(h\) and draw a line of best fit.`, 3,
    t`Five points close to a straight line passing near the origin, reaching about 8.9 m² s⁻² at 0.50 m.`,
    t`Marks: 1 for correctly plotted points; 1 for a straight line of best fit; 1 for a line close to the origin.`,
    { diagram: axes({ xMin: 0, xMax: 0.6, yMin: 0, yMax: 10, xStep: 0.1, yStep: 1, xLabel: 'h (m)', yLabel: 'v² (m² s⁻²)', width: 360 }) }),
  part('e', t`Use the gradient of your line to calculate an experimental value for \(g\).`, 2,
    t`About 8.9 m s⁻² (gradient ≈ 17.8 m s⁻²)`,
    t`\(v^2 = 2gh\), so the gradient is \(2g\): about \(\frac{8.88}{0.50} = 17.8\) m s⁻², giving \(g = 8.9\) m s⁻². Accept 8.6–9.2 m s⁻². 1 mark for the gradient, 1 mark for halving it.`, { unit: 'm s⁻²' }),
  part('f', t`The experimental value is lower than 9.81 m s⁻². Suggest a cause and state whether it is a random or a systematic error.`, 2,
    t`Friction and air resistance transform some energy to heat, so the trolley is always slower than predicted — a systematic error.`,
    t`1 mark for a plausible physical cause, 1 mark for identifying it as systematic (it lowers every result).`),
], { diagram: ramp })

export const ITEMS = S.items
