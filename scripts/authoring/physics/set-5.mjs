// VCE Physics Unit 3 & 4 — Practice exam 5.
// Section A: 20 multiple choice. Section B: 15 questions, 100 marks.
// Every value is computed in checks/set5.py.
import { t, AOS, part, makeSet, axes, curve } from './phys.mjs'
import { drawing, traced } from './draw.mjs'

const { MO, FI, EL, LM, IN } = AOS
const S = makeSet(5)
const rad = d => (d * Math.PI) / 180

// ════════════════ Section A ════════════════

S.mc(MO, 'proficient', t`Two blocks, of mass 2.0 kg and 3.0 kg, are in contact on a smooth horizontal surface. A horizontal force of 20 N pushes the 2.0 kg block, which pushes the 3.0 kg block. The magnitude of the force that the 2.0 kg block exerts on the 3.0 kg block is`,
  ['4.0 N', '8.0 N', '12 N', '20 N'], 'C',
  t`Both blocks accelerate together at \(a = \frac{20}{5.0} = 4.0\) m s⁻². The only horizontal force on the 3.0 kg block is the contact force, so it is \(3.0 \times 4.0 = 12\) N. 8.0 N is the net force on the 2.0 kg block; 4.0 is the acceleration.`)

S.mc(MO, 'proficient', t`A 2.0 kg object moving at 5.0 m s⁻¹ is acted on by a net force of 10 N in its direction of motion while it moves a further 3.0 m. Its final speed is closest to`,
  ['5.00 m s⁻¹', '5.48 m s⁻¹', '6.32 m s⁻¹', '7.42 m s⁻¹'], 'D',
  t`The work done by the net force, \(10 \times 3.0 = 30\) J, adds to the initial kinetic energy of \(\frac{1}{2}(2.0)(5.0)^2 = 25\) J: \(\frac{1}{2}(2.0)v^2 = 55\), so \(v = 7.42\) m s⁻¹. 5.48 m s⁻¹ ignores the initial kinetic energy.`)

S.mc(MO, 'developing', t`A car travels around a roundabout of radius 12 m at a constant speed of 6.0 m s⁻¹. The time it takes to complete one full circle is closest to`,
  ['12.6 s', '18.8 s', '25.1 s', '75.4 s'], 'A',
  t`\(T = \frac{2\pi r}{v} = \frac{2\pi \times 12}{6.0} = 12.6\) s. 75.4 s multiplies the circumference by the speed.`)

S.mc(MO, 'proficient', t`A spring hangs vertically. When a 0.20 kg mass is attached, the spring stretches by 5.0 cm. The spring constant is closest to`,
  ['0.098 N m⁻¹', '4.0 N m⁻¹', '39 N m⁻¹', '392 N m⁻¹'], 'C',
  t`At equilibrium \(kx = mg\): \(k = \frac{0.20 \times 9.81}{0.050} = 39\) N m⁻¹. 392 N m⁻¹ uses 5.0 mm; 4.0 N m⁻¹ leaves out \(g\).`)

S.mc(MO, 'developing', t`In a collision, a car’s airbag reduces the risk of injury to the driver mainly because it`,
  ['reduces the driver’s change in momentum', 'reduces the impulse on the driver', 'increases the impulse on the driver', 'increases the time over which the driver’s momentum changes, reducing the average force'], 'D',
  t`The driver’s change in momentum (the impulse) is the same with or without the airbag. Because \(F\Delta t = m\Delta v\), spreading that change over a longer time reduces the average force.`)

S.mc(FI, 'proficient', t`The gravitational force between two masses is \(F\). Both masses are doubled and the distance between them is halved. The new gravitational force is`,
  [t`\(2F\)`, t`\(4F\)`, t`\(8F\)`, t`\(16F\)`], 'D',
  t`\(F = \frac{Gm_1m_2}{r^2}\): doubling both masses multiplies \(F\) by 4, and halving \(r\) multiplies it by another 4, giving \(16F\).`)

S.mc(FI, 'developing', t`Two equal positive point charges are fixed a short distance apart. At the point exactly midway between them, the electric field is`,
  ['zero', 'directed towards the left-hand charge', 'twice the field of one charge alone', 'perpendicular to the line joining the charges'], 'A',
  t`At the midpoint the two fields are equal in magnitude and point in opposite directions (each away from its own positive charge), so they cancel. This is a null point.`)

S.mc(FI, 'proficient', t`An electron moves in a circle in a uniform magnetic field. If its speed is doubled, the radius of its path`,
  ['halves', 'doubles', 'becomes four times as large', 'is unchanged'], 'B',
  t`\(r = \frac{mv}{qB}\), so the radius is directly proportional to the speed.`)

S.mc(FI, 'proficient', t`A satellite in a circular orbit of radius \(r\) around Earth has orbital speed \(v\). A satellite in a circular orbit of radius \(4r\) has orbital speed`,
  [t`\(4v\)`, t`\(2v\)`, t`\(\frac{v}{2}\)`, t`\(\frac{v}{4}\)`], 'C',
  t`\(\frac{GMm}{r^2} = \frac{mv^2}{r}\) gives \(v = \sqrt{\frac{GM}{r}}\), so four times the radius gives half the speed. Satellites further out move more slowly.`)

S.mc(EL, 'proficient', t`The coil of an AC generator rotates in a magnetic field. Which one of the following changes would not increase the peak EMF produced?`,
  ['increasing the resistance of the circuit connected to the generator', 'increasing the number of turns on the coil', 'using a stronger magnetic field', 'rotating the coil faster'], 'A',
  t`The EMF is \(\varepsilon = -N\frac{\Delta\Phi_B}{\Delta t}\): more turns, a stronger field (larger flux) and faster rotation (less time) all increase it. The external resistance affects the current, not the induced EMF.`)

S.mc(EL, 'proficient', t`An ideal transformer has 480 turns on its primary coil and 24 turns on its secondary coil. The primary is connected to 240 V AC. The secondary voltage is`,
  ['6.0 V', '12 V', '24 V', '4800 V'], 'B',
  t`\(V_2 = V_1\frac{N_2}{N_1} = 240 \times \frac{24}{480} = 12\) V. 4800 V inverts the ratio.`)

S.mc(EL, 'proficient', t`A 2.0 kW appliance is supplied at 240 V through a cable with a total resistance of 0.50 Ω. The power lost in the cable is closest to`,
  ['4.17 W', '8.33 W', '34.7 W', '1.15 × 10⁵ W'], 'C',
  t`\(I = \frac{2000}{240} = 8.33\) A and \(P_{\text{loss}} = I^2R = 8.33^2 \times 0.50 = 34.7\) W. 4.17 is the voltage drop in volts; \(1.15 \times 10^5\) W wrongly uses \(\frac{V^2}{R}\) with the supply voltage.`)

S.mc(EL, 'developing', t`The slip rings of an AC generator are replaced by a split-ring commutator. The output of the generator`,
  ['doubles in frequency', 'doubles in peak voltage', 'becomes a steady, constant voltage', 'always has the same polarity, although it still varies in size'], 'D',
  t`The commutator reverses the connections every half-turn, so the negative half-cycles are flipped: the output is DC that fluctuates between zero and the peak. The peak value is unchanged.`)

S.mc(LM, 'proficient', t`A laser pointer emits 5.0 mW of light of wavelength 650 nm. The number of photons it emits each second is closest to`,
  ['1.6 × 10¹⁵', '1.6 × 10¹⁶', '3.3 × 10¹⁶', '1.6 × 10¹⁹'], 'B',
  t`Each photon carries \(E = \frac{hc}{\lambda} = \frac{6.63 \times 10^{-34} \times 3.00 \times 10^8}{650 \times 10^{-9}} = 3.06 \times 10^{-19}\) J, so \(n = \frac{5.0 \times 10^{-3}}{3.06 \times 10^{-19}} = 1.6 \times 10^{16}\) per second.`)

S.mc(LM, 'proficient', t`A metal has a work function of 2.3 eV. The longest wavelength of light that can release photoelectrons from it is closest to`,
  ['270 nm', '400 nm', '540 nm', '1080 nm'], 'C',
  t`At the threshold \(hf_0 = \phi\): \(\lambda_0 = \frac{hc}{\phi} = \frac{4.14 \times 10^{-15} \times 3.00 \times 10^8}{2.3} = 5.4 \times 10^{-7}\) m. Longer wavelengths have photons with too little energy.`)

S.mc(LM, 'developing', t`In the photoelectric effect, the maximum kinetic energy of the emitted photoelectrons depends on`,
  ['the intensity of the light only', 'the frequency of the light and the work function of the metal', 'the intensity and the frequency of the light', 'the voltage across the photocell only'], 'B',
  t`\(E_{k\,\text{max}} = hf - \phi\). The intensity changes the number of photoelectrons, not their maximum energy; the voltage across the cell affects how many reach the collector, not the energy with which they are emitted.`)

S.mc(LM, 'advanced', t`A proton (mass \(1.67 \times 10^{-27}\) kg) travels at \(0.80c\). Its kinetic energy is closest to`,
  ['4.8 × 10⁻¹¹ J', '1.0 × 10⁻¹⁰ J', '1.5 × 10⁻¹⁰ J', '2.5 × 10⁻¹⁰ J'], 'B',
  t`\(\gamma = \frac{1}{\sqrt{1 - 0.80^2}} = 1.67\) and \(E_k = (\gamma - 1)mc^2 = 0.667 \times 1.50 \times 10^{-10} = 1.0 \times 10^{-10}\) J. \(4.8 \times 10^{-11}\) J is the classical \(\frac{1}{2}mv^2\); \(1.5 \times 10^{-10}\) J is the rest energy and \(2.5 \times 10^{-10}\) J the total energy.`)

S.mc(LM, 'developing', t`Light passes through a narrow gap. The light spreads out (diffracts) most noticeably when`,
  ['the width of the gap is similar to the wavelength of the light', 'the width of the gap is much larger than the wavelength', 'the light is very bright', 'the light is white rather than a single colour'], 'A',
  t`The amount of diffraction depends on \(\frac{\lambda}{w}\); it is significant when the gap width is comparable to (or smaller than) the wavelength.`)

S.mc(LM, 'proficient', t`An electron and a proton travel at the same speed (much less than \(c\)). Compared with the proton’s de Broglie wavelength, the electron’s de Broglie wavelength is`,
  ['about 1840 times shorter', 'the same', 'about 43 times longer', 'about 1840 times longer'], 'D',
  t`\(\lambda = \frac{h}{mv}\): at the same speed, the wavelength is inversely proportional to the mass, and \(\frac{m_p}{m_e} \approx 1840\). 43 is the square root of this ratio, which would apply at equal kinetic energies.`)

S.mc(IN, 'developing', t`A student measures a length using a ruler marked in millimetres. The uncertainty usually assigned to a single reading is`,
  ['±0.5 mm', '±1 mm', '±2 mm', '±5 mm'], 'A',
  t`The usual convention is half the smallest division of the scale: ±0.5 mm. (If both ends of the object must be read, the uncertainties of the two readings combine.)`)

// ════════════════ Section B ════════════════

// Ski slope: 25°, base from (30, 120).
const TH = rad(25)
const sk = (s, n = 0) => [30 + s * Math.cos(TH) - n * Math.sin(TH), 120 - s * Math.sin(TH) - n * Math.cos(TH)]
const ski = drawing(260, 132)
ski.incline(30, 120, 200, 25, { label: '25°' })
  .poly([sk(100), sk(130), sk(130, 22), sk(100, 22)], { closed: true, fill: 'mid' }).text(...sk(115, 30), '60 kg', { size: 8.5 })
  .arrow(...sk(95, 11), ...sk(60, 11)).text(...sk(70, 22), 'motion', { size: 8 })
S.q(MO, 'proficient', t`A skier of total mass 60 kg slides from rest down a straight slope inclined at 25° to the horizontal, as shown in Figure 1. A constant friction force of 120 N acts on the skier. Ignore air resistance.`, [
  part('a', t`Calculate the magnitude of the net force on the skier down the slope.`, 2,
    t`129 N`,
    t`The weight component down the slope is \(mg\sin(25^\circ) = 60 \times 9.81 \times 0.423 = 249\) N; friction acts up the slope, so \(F_{\text{net}} = 249 - 120 = 129\) N. 1 mark for the weight component, 1 mark for the net force.`, { unit: 'N' }),
  part('b', t`Calculate the acceleration of the skier.`, 1,
    t`2.15 m s⁻²`,
    t`\(a = \frac{128.8}{60} = 2.15\) m s⁻² down the slope.`, { unit: 'm s⁻²' }),
  part('c', t`Calculate the speed of the skier after sliding 50 m down the slope.`, 2,
    t`14.6 m s⁻¹`,
    t`\(v^2 = u^2 + 2as = 0 + 2 \times 2.15 \times 50\), so \(v = 14.6\) m s⁻¹. 1 mark for the equation, 1 mark for the value.`, { unit: 'm s⁻¹' }),
  part('d', t`Calculate the energy transformed to heat by friction over the 50 m.`, 1,
    t`6.0 × 10³ J`,
    t`The work done against friction: \(W = Fs = 120 \times 50 = 6000\) J.`, { unit: 'J' }),
], { diagram: ski.done('Figure 1') })

// Ramp jump: 5 px per metre; ramp lip at (90, 90).
const ux5 = 25 * Math.cos(rad(20)), uy5 = 25 * Math.sin(rad(20))
const jump = drawing(340, 146)
jump.ground(10, 330, 130).poly([[35, 130], [35, 110], [90, 90], [90, 130]], { closed: true, fill: 'light' }).rect(240, 90, 90, 40, { fill: 'light' })
  .path(traced(tt => 90 - 5 * (uy5 * tt - 4.905 * tt * tt), 0, 1.7432, s => 90 + 5 * ux5 * s, v => v, 40))
  .line(90, 90, 128, 90, { dash: true, grey: true }).angle(90, 90, 24, 0, 20).text(124, 101, '20°', { anchor: 'start', size: 8.5, italic: true }).dot(90, 90, 2.6)
  .arrow(90, 90, 90 + 32 * Math.cos(rad(20)), 90 - 32 * Math.sin(rad(20))).text(86, 74, '25.0 m s⁻¹', { anchor: 'end', size: 8.5 })
  .dim(90, 118, 240, 118, '30.0 m', { offset: -6 }).text(285, 108, 'landing', { size: 8 }).text(285, 118, 'platform', { size: 8 })
S.q(MO, 'advanced', t`A stunt rider leaves the end of a ramp inclined at 20° to the horizontal with a speed of 25.0 m s⁻¹. A landing platform at the same height as the end of the ramp begins 30.0 m away, as shown in Figure 2. Ignore air resistance and treat the rider and motorbike as a particle.`, [
  part('a', t`Calculate the horizontal and vertical components of the rider’s initial velocity.`, 1,
    t`Horizontal 23.5 m s⁻¹; vertical 8.55 m s⁻¹`,
    t`\(25.0\cos(20^\circ) = 23.5\) m s⁻¹ and \(25.0\sin(20^\circ) = 8.55\) m s⁻¹.`),
  part('b', t`Calculate the time the rider spends in the air before landing at the height of the platform.`, 2,
    t`1.74 s`,
    t`The flight is symmetrical: time to the top \(= \frac{8.55}{9.81} = 0.872\) s, so the total time is \(2 \times 0.872 = 1.74\) s. 1 mark for the method, 1 mark for the time.`, { unit: 's' }),
  part('c', t`Determine whether the rider lands on the platform. Show your working.`, 2,
    t`Yes: the horizontal distance is 40.9 m, which is more than the 30.0 m gap.`,
    t`\(x = 23.5 \times 1.74 = 40.9\) m. 1 mark for the distance, 1 mark for the comparison and conclusion.`),
  part('d', t`Calculate the maximum height of the rider above the end of the ramp.`, 1,
    t`3.73 m`,
    t`\(h = \frac{u_y^2}{2g} = \frac{8.55^2}{2 \times 9.81} = 3.73\) m.`, { unit: 'm' }),
  part('e', t`Calculate the minimum launch speed at 20° needed to just reach the platform.`, 1,
    t`21.4 m s⁻¹`,
    t`The range on level ground is \(\frac{2u_xu_y}{g} = \frac{u^2\sin(40^\circ)}{g}\); setting this equal to 30.0 m gives \(u = \sqrt{\frac{30.0 \times 9.81}{\sin(40^\circ)}} = 21.4\) m s⁻¹.`, { unit: 'm s⁻¹' }),
], { diagram: jump.done('Figure 2') })

const vc = drawing(220, 160)
vc.circle(100, 92, 64, { dash: true }).dot(100, 92, 2).line(100, 92, 100, 34, { w: 1.1 }).circle(100, 28, 6, { fill: 'mid' })
  .arrow(92, 14, 58, 14).text(75, 8, 'v', { italic: true }).text(106, 66, '0.80 m', { anchor: 'start', size: 8.5 }).text(100, 150, 'P', { bold: true }).dot(100, 156, 1.6)
S.q(MO, 'advanced', t`A 0.20 kg ball on a light string 0.80 m long is swung in a vertical circle, as shown in Figure 3. At the top of the circle the ball’s speed is 4.0 m s⁻¹. Ignore air resistance.`, [
  part('a', t`Calculate the tension in the string when the ball is at the top of the circle.`, 2,
    t`2.04 N`,
    t`At the top, the tension and the weight both point down, towards the centre: \(T + mg = \frac{mv^2}{r}\), so \(T = \frac{0.20 \times 4.0^2}{0.80} - 0.20 \times 9.81 = 4.00 - 1.96 = 2.04\) N. 1 mark for the force equation, 1 mark for the value.`, { unit: 'N' }),
  part('b', t`Calculate the speed of the ball at the lowest point, P.`, 2,
    t`6.88 m s⁻¹`,
    t`The ball falls 1.60 m (the diameter): \(\frac{1}{2}mv^2 = \frac{1}{2}m(4.0)^2 + mg(1.60)\), so \(v^2 = 16 + 31.4 = 47.4\) and \(v = 6.88\) m s⁻¹. 1 mark for the energy equation with the height of 1.60 m, 1 mark for the value.`, { unit: 'm s⁻¹' }),
  part('c', t`Calculate the tension in the string at P.`, 1,
    t`13.8 N`,
    t`At the bottom, \(T - mg = \frac{mv^2}{r}\), so \(T = \frac{0.20 \times 47.4}{0.80} + 1.96 = 11.85 + 1.96 = 13.8\) N.`, { unit: 'N' }),
], { diagram: vc.done('Figure 3') })

const bump = drawing(290, 96)
bump.ground(10, 280, 80).wall(250, 30, 80, 1).spring(250, 60, 190, 60, 7, 6).rect(130, 46, 60, 30, { fill: 'light' }).text(160, 65, '0.50 kg', { size: 8.5 })
  .circle(143, 78, 3, { fill: 'dark' }).circle(177, 78, 3, { fill: 'dark' }).arrow(118, 36, 160, 36).text(128, 30, '2.0 m s⁻¹', { size: 8.5 })
S.q(MO, 'proficient', t`A 0.50 kg trolley moving at 2.0 m s⁻¹ runs into a spring bumper of spring constant 200 N m⁻¹, as shown in Figure 4. The trolley compresses the spring, comes momentarily to rest and then moves back at 2.0 m s⁻¹. Ignore friction.`, [
  part('a', t`Calculate the maximum compression of the spring.`, 2,
    t`0.10 m`,
    t`All the kinetic energy becomes elastic potential energy: \(\frac{1}{2}(0.50)(2.0)^2 = \frac{1}{2}(200)x^2\), so \(1.0 = 100x^2\) and \(x = 0.10\) m. 1 mark for the energy equation, 1 mark for the value.`, { unit: 'm' }),
  part('b', t`Calculate the maximum force exerted by the spring on the trolley.`, 1,
    t`20 N`,
    t`\(F = kx = 200 \times 0.10 = 20\) N.`, { unit: 'N' }),
  part('c', t`Calculate the magnitude of the impulse the spring gives the trolley during the whole interaction.`, 2,
    t`2.0 N s`,
    t`\(\Delta p = 0.50 \times (-2.0 - 2.0) = -2.0\) N s: magnitude 2.0 N s, directed away from the spring. 1 mark for including the reversal of direction, 1 mark for the value. Common error: 0 N s, from treating the speeds as equal momenta.`, { unit: 'N s' }),
  part('d', t`State whether the interaction is elastic, and give a reason.`, 1,
    t`Elastic: the trolley leaves with the same speed, so its kinetic energy is unchanged (all the stored elastic energy is returned).`,
    t`Kinetic energy is conserved overall.`),
], { diagram: bump.done('Figure 4') })

S.q(FI, 'proficient', t`The International Space Station (ISS) orbits Earth at an altitude of 420 km.`, [
  part('a', t`Calculate the radius of the ISS’s orbit.`, 1,
    t`6.79 × 10⁶ m`,
    t`\(r = R_E + h = 6.37 \times 10^6 + 0.42 \times 10^6 = 6.79 \times 10^6\) m.`, { unit: 'm' }),
  part('b', t`Calculate the orbital speed of the ISS.`, 2,
    t`7.66 × 10³ m s⁻¹`,
    t`\(v = \sqrt{\frac{GM_E}{r}} = \sqrt{\frac{6.67 \times 10^{-11} \times 5.98 \times 10^{24}}{6.79 \times 10^6}} = 7.66 \times 10^3\) m s⁻¹. 1 mark for the relationship, 1 mark for the value. Common error: using the altitude as the radius.`, { unit: 'm s⁻¹' }),
  part('c', t`Calculate the period of the ISS’s orbit, in minutes.`, 2,
    t`92.8 minutes`,
    t`\(T = \frac{2\pi r}{v} = \frac{2\pi \times 6.79 \times 10^6}{7.66 \times 10^3} = 5.57 \times 10^3\) s \(= 92.8\) min. 1 mark for the period in seconds, 1 mark for minutes.`, { unit: 'minutes' }),
  part('d', t`Calculate the strength of Earth’s gravitational field at the ISS.`, 1,
    t`8.65 N kg⁻¹`,
    t`\(g = \frac{GM_E}{r^2} = 8.65\) N kg⁻¹ — about 88% of its value at Earth’s surface.`, { unit: 'N kg⁻¹' }),
  part('e', t`The ISS occasionally fires its engines to raise its orbit. Suggest why this is necessary.`, 1,
    t`The thin upper atmosphere exerts a small drag force that removes energy, so the orbit gradually decays to a lower radius.`,
    t`Air resistance (drag) is the key idea.`),
])

const oil = drawing(300, 110)
oil.plates(60, 26, 170, 60, '+', '−').circle(145, 56, 4, { fill: 'mid' }).text(156, 60, 'oil drop', { anchor: 'start', size: 8.5 })
  .dim(262, 26, 262, 86, '1.20 cm', { offset: -20 }).text(145, 104, 'potential difference 785 V', { size: 8.5 })
S.q(FI, 'advanced', t`In a version of Millikan’s experiment, a charged oil drop of mass \(3.20 \times 10^{-15}\) kg is held stationary between two horizontal plates 1.20 cm apart when the potential difference between them is 785 V, as shown in Figure 5.`, [
  part('a', t`Calculate the strength of the electric field between the plates.`, 1,
    t`6.54 × 10⁴ V m⁻¹`,
    t`\(E = \frac{V}{d} = \frac{785}{0.0120} = 6.54 \times 10^4\) V m⁻¹.`, { unit: 'V m⁻¹' }),
  part('b', t`Calculate the magnitude of the charge on the drop.`, 2,
    t`4.80 × 10⁻¹⁹ C`,
    t`The drop is stationary, so the electric force balances the weight: \(qE = mg\), \(q = \frac{3.20 \times 10^{-15} \times 9.81}{6.54 \times 10^4} = 4.80 \times 10^{-19}\) C. 1 mark for balancing the forces, 1 mark for the value.`, { unit: 'C' }),
  part('c', t`State the sign of the charge on the drop, and the number of excess (or missing) electrons.`, 1,
    t`Negative; three excess electrons`,
    t`The electric force must be upwards, towards the positive top plate, so the charge is negative: \(\frac{4.80 \times 10^{-19}}{1.60 \times 10^{-19}} = 3\) electrons.`),
  part('d', t`The drop captures one more electron. Calculate the magnitude and direction of its acceleration immediately afterwards.`, 2,
    t`3.27 m s⁻², upwards`,
    t`The charge becomes \(6.40 \times 10^{-19}\) C, so the electric force is \(6.40 \times 10^{-19} \times 6.54 \times 10^4 = 4.19 \times 10^{-14}\) N up, against a weight of \(3.14 \times 10^{-14}\) N: net \(1.05 \times 10^{-14}\) N up, and \(a = \frac{1.05 \times 10^{-14}}{3.20 \times 10^{-15}} = 3.27\) m s⁻². 1 mark for the net force, 1 mark for the acceleration with its direction.`),
], { diagram: oil.done('Figure 5') })

S.q(FI, 'proficient', t`Gravitational, electric and magnetic fields can be described using field models.`, [
  part('a', t`Describe one similarity and one difference between the gravitational field of a point mass and the electric field of a point charge.`, 2,
    t`Similarity: both are radial and follow an inverse-square law with distance. Difference: gravitational forces are only attractive, whereas electric forces can be attractive or repulsive (charges can be positive or negative).`,
    t`1 mark for a valid similarity, 1 mark for a valid difference.`),
  part('b', t`Two protons (mass \(1.67 \times 10^{-27}\) kg) are a distance \(r\) apart. Calculate the ratio of the electric force between them to the gravitational force between them.`, 2,
    t`1.24 × 10³⁶`,
    t`Both forces depend on \(\frac{1}{r^2}\), so \(r\) cancels: \(\frac{F_E}{F_G} = \frac{ke^2}{Gm_p^2} = \frac{8.99 \times 10^9 \times (1.60 \times 10^{-19})^2}{6.67 \times 10^{-11} \times (1.67 \times 10^{-27})^2} = 1.24 \times 10^{36}\). 1 mark for the ratio expression, 1 mark for the value.`),
  part('c', t`Given your answer to part b, explain why gravity rather than the electric force dominates the motion of planets.`, 1,
    t`Planets are electrically neutral overall — positive and negative charges almost exactly cancel — whereas mass is always positive and adds up, so the gravitational forces between very large masses are enormous.`,
    t`The key idea is that charge cancels but mass does not.`),
  part('d', t`Magnetic field lines always form closed loops. State what this suggests about magnetic poles.`, 1,
    t`Magnetic poles always come in north–south pairs: no isolated magnetic pole (monopole) has been observed.`,
    t`Field lines leave a north pole and return to a south pole, unlike electric field lines, which begin and end on separate charges.`),
])

const emfg = { kind: 'function_graph', xMin: 0, xMax: 50, yMin: -40, yMax: 40, xStep: 5, yStep: 10, xLabel: 't (ms)', yLabel: 'EMF (V)', width: 360, grid: true,
  curves: [{ points: curve(x => 36 * Math.sin((2 * Math.PI * x) / 25), 0, 50, 160) }], caption: 'Figure 6' }
S.q(EL, 'proficient', t`Figure 6 shows the EMF produced by an AC generator with slip rings.`, [
  part('a', t`State the frequency of the output.`, 1,
    t`40 Hz`,
    t`The period is 25 ms, so \(f = \frac{1}{0.025} = 40\) Hz.`, { unit: 'Hz' }),
  part('b', t`Calculate the RMS value of the EMF.`, 1,
    t`25.5 V`,
    t`\(V_{\text{RMS}} = \frac{36}{\sqrt{2}} = 25.5\) V.`, { unit: 'V' }),
  part('c', t`The generator is connected to a 12 Ω lamp. Calculate the average power delivered to the lamp. Ignore the resistance of the generator’s coil.`, 2,
    t`54 W`,
    t`\(P = \frac{V_{\text{RMS}}^2}{R} = \frac{25.5^2}{12} = 54\) W. 1 mark for using the RMS value, 1 mark for the answer.`, { unit: 'W' }),
  part('d', t`The slip rings are replaced by a split-ring commutator. On the axes below, sketch the new output from \(t = 0\) to \(t = 50\) ms.`, 2,
    t`A “rectified” sine: the same humps of peak 36 V every 12.5 ms, all above the axis (zero at 0, 12.5, 25, 37.5 and 50 ms).`,
    t`1 mark for all the output having the same polarity; 1 mark for the unchanged peak and timing.`,
    { diagram: axes({ xMin: 0, xMax: 50, yMin: -40, yMax: 40, xStep: 5, yStep: 10, xLabel: 't (ms)', yLabel: 'EMF (V)', width: 360 }) }),
  part('e', t`State the orientation of the plane of the coil, relative to the magnetic field, at \(t = 0\).`, 1,
    t`Perpendicular to the magnetic field`,
    t`The EMF is zero, so the flux is a maximum (and momentarily not changing).`),
  part('f', t`Describe the role of the brushes in the generator.`, 1,
    t`They are fixed carbon contacts that rub on the rotating rings, connecting the turning coil to the external circuit.`,
    t`A description of the sliding electrical contact earns the mark.`),
], { diagram: emfg })

const pipe = drawing(220, 160)
pipe.line(90, 8, 90, 152, { w: 2 }).line(130, 8, 130, 152, { w: 2 }).rect(99, 46, 22, 20, { fill: 'mid' }).text(110, 60, 'N', { size: 9, bold: true })
  .rect(99, 66, 22, 20, { fill: 'light' }).text(110, 80, 'S', { size: 9, bold: true }).arrow(156, 56, 156, 106).text(162, 84, 'falls', { anchor: 'start', size: 8.5 })
  .text(64, 130, 'copper', { anchor: 'end', size: 8.5 }).text(64, 140, 'pipe', { anchor: 'end', size: 8.5 }).line(66, 134, 88, 134, { grey: true })
S.q(EL, 'advanced', t`A strong bar magnet is dropped down a long vertical copper pipe, as shown in Figure 7. It falls much more slowly than an identical magnet dropped outside the pipe. Copper is not magnetic.`, [
  part('a', t`Use Faraday’s and Lenz’s laws to explain why the magnet falls slowly.`, 3,
    t`As the magnet falls, the magnetic flux through each ring of the pipe below it increases and through each ring above it decreases. These changes induce EMFs and circulating (eddy) currents in the copper. By Lenz’s law, the currents produce magnetic fields that oppose the change — repelling the magnet from below and attracting it from above — so they exert an upward force that slows its fall.`,
    t`Marks: 1 for the changing flux through the pipe; 1 for induced EMFs and currents in the copper; 1 for Lenz’s law giving an opposing (upward) force.`),
  part('b', t`Describe the energy transformations as the magnet falls through the pipe at a constant speed.`, 1,
    t`Gravitational potential energy is transformed into electrical energy in the eddy currents, and then into heat in the copper; the kinetic energy stays constant.`,
    t`All the energy lost ends up as heat in the pipe.`),
  part('c', t`A second copper pipe has a narrow slit cut along its full length. Explain why the magnet falls faster through this pipe.`, 2,
    t`The slit breaks the circular paths around the pipe, so the large circulating currents cannot flow; the induced currents, and the opposing magnetic force, are much smaller.`,
    t`1 mark for the slit interrupting the current loops, 1 mark for the smaller opposing force.`),
  part('d', t`State what would happen if the copper pipe were replaced with a plastic pipe of the same size. Give a reason.`, 1,
    t`The magnet would fall freely, because plastic is an insulator: no induced currents can flow.`,
    t`An EMF may be induced, but without a current there is no opposing force.`),
], { diagram: pipe.done('Figure 7') })

S.q(EL, 'advanced', t`A hydroelectric power station generates 20 MW at 11 kV. A transformer steps this up to 220 kV for transmission along lines with a total resistance of 25 Ω. Treat the transformers as ideal.`, [
  part('a', t`Calculate the current in the transmission lines.`, 1,
    t`90.9 A`,
    t`\(I = \frac{20 \times 10^6}{220 \times 10^3} = 90.9\) A.`, { unit: 'A' }),
  part('b', t`Calculate the power lost in the lines.`, 2,
    t`2.07 × 10⁵ W`,
    t`\(P_{\text{loss}} = I^2R = 90.9^2 \times 25 = 2.07 \times 10^5\) W. 1 mark for the method, 1 mark for the value.`, { unit: 'W' }),
  part('c', t`Calculate the voltage at the end of the lines.`, 2,
    t`2.18 × 10⁵ V (217.7 kV)`,
    t`\(V_{\text{drop}} = IR = 90.9 \times 25 = 2.27 \times 10^3\) V, so \(220\,000 - 2270 = 2.18 \times 10^5\) V. 1 mark for the voltage drop, 1 mark for the answer.`, { unit: 'V' }),
  part('d', t`Calculate the percentage of the generated power that reaches the end of the lines.`, 1,
    t`99.0%`,
    t`\(\frac{20 \times 10^6 - 2.07 \times 10^5}{20 \times 10^6} = 0.990\).`, { unit: '%' }),
  part('e', t`An engineer suggests either replacing the lines with cables of half the resistance, or doubling the transmission voltage to 440 kV. Compare the effect of each change on the power loss.`, 2,
    t`Halving the resistance halves the loss (to about \(1.0 \times 10^5\) W). Doubling the voltage halves the current, which quarters the loss (to about \(5.2 \times 10^4\) W), so it is the more effective change.`,
    t`1 mark for each correct effect, with the comparison.`),
])

S.q(LM, 'proficient', t`Sunlight delivers about 1000 W to each square metre of a solar panel. Take the average wavelength of the photons to be 550 nm.`, [
  part('a', t`Calculate the number of photons striking one square metre of the panel each second.`, 2,
    t`2.8 × 10²¹`,
    t`\(E = \frac{hc}{\lambda} = \frac{6.63 \times 10^{-34} \times 3.00 \times 10^8}{550 \times 10^{-9}} = 3.62 \times 10^{-19}\) J per photon, so \(n = \frac{1000}{3.62 \times 10^{-19}} = 2.8 \times 10^{21}\) per second. 1 mark for the photon energy, 1 mark for the number.`),
  part('b', t`Calculate the momentum of one of these photons.`, 1,
    t`1.21 × 10⁻²⁷ kg m s⁻¹`,
    t`\(p = \frac{h}{\lambda} = \frac{6.63 \times 10^{-34}}{550 \times 10^{-9}} = 1.21 \times 10^{-27}\) kg m s⁻¹.`, { unit: 'kg m s⁻¹' }),
  part('c', t`The panel absorbs all the photons that strike it. Calculate the force the sunlight exerts on one square metre of the panel.`, 2,
    t`3.3 × 10⁻⁶ N`,
    t`Each second the panel absorbs the momentum of \(2.8 \times 10^{21}\) photons: \(F = \frac{\Delta p}{\Delta t} = 2.77 \times 10^{21} \times 1.21 \times 10^{-27} = 3.3 \times 10^{-6}\) N. 1 mark for the rate of change of momentum, 1 mark for the value.`, { unit: 'N' }),
  part('d', t`Photons have no mass. Explain how they can exert a force.`, 1,
    t`Photons carry momentum (\(p = \frac{h}{\lambda}\)); when they are absorbed their momentum is transferred to the panel, and a rate of change of momentum is a force.`,
    t`Linking photon momentum to force (rate of change of momentum) earns the mark.`),
])

// Mercury energy levels, spaced schematically (the three middle levels are too
// close together to draw to scale), as VCAA does.
const hg = drawing(270, 166)
hg.levels(80, 190, [
  { y: 14, right: '0 eV (ionised)', dash: true },
  { y: 42, right: '−3.70 eV' },
  { y: 68, right: '−4.94 eV' },
  { y: 92, right: '−5.51 eV' },
  { y: 116, right: '−5.73 eV' },
  { y: 156, left: 'ground state', right: '−10.40 eV' },
])
S.q(LM, 'proficient', t`Figure 8 shows some of the energy levels of a mercury atom. Mercury vapour is used in fluorescent lamps.`, [
  part('a', t`An atom in the −5.51 eV level returns directly to the ground state. Calculate the wavelength of the emitted photon, and state the region of the spectrum in which it lies.`, 2,
    t`254 nm, ultraviolet`,
    t`\(\Delta E = 10.40 - 5.51 = 4.89\) eV, so \(\lambda = \frac{hc}{E} = \frac{4.14 \times 10^{-15} \times 3.00 \times 10^8}{4.89} = 2.54 \times 10^{-7}\) m — ultraviolet (shorter than about 400 nm). 1 mark for the wavelength, 1 mark for the region.`, { unit: 'nm' }),
  part('b', t`An atom in the −4.94 eV level returns to the ground state by way of the −5.51 eV level. Calculate the energy of each photon emitted.`, 1,
    t`0.57 eV and 4.89 eV`,
    t`\(-4.94 - (-5.51) = 0.57\) eV (infrared, about 2180 nm), then 4.89 eV.`),
  part('c', t`The inside of a fluorescent tube is coated with a material that glows with visible light when struck by the ultraviolet photons from mercury. Explain how the coating produces visible light.`, 2,
    t`Atoms of the coating absorb the high-energy UV photons and are excited to high energy levels. They return to the ground state in several smaller steps through intermediate levels, emitting lower-energy (longer-wavelength) photons, some in the visible range.`,
    t`1 mark for absorption of UV raising atoms to excited levels, 1 mark for de-excitation in smaller steps producing visible photons.`),
  part('d', t`A photon of energy 5.00 eV passes through mercury vapour in the ground state. Explain why it is not absorbed.`, 1,
    t`5.00 eV does not match the energy difference between the ground state and any higher level (4.67, 4.89, 5.46, 6.70 eV), and a photon must be absorbed whole.`,
    t`A photon is absorbed only if its energy exactly equals the energy of a transition.`),
], { diagram: hg.done('Figure 8 (not to scale)') })

S.q(LM, 'advanced', t`In the Large Hadron Collider, protons travel around a ring 27 km in circumference. Each proton has a total energy of 6.5 TeV (\(6.5 \times 10^{12}\) eV). The rest energy of a proton is 938 MeV.`, [
  part('a', t`Calculate the Lorentz factor, \(\gamma\), of the protons.`, 1,
    t`6.93 × 10³`,
    t`\(E_{\text{total}} = \gamma mc^2\), so \(\gamma = \frac{6.5 \times 10^{12}}{938 \times 10^6} = 6.93 \times 10^3\).`),
  part('b', t`Calculate the time the protons take to travel once around the ring, as measured in the laboratory. Assume their speed is equal to \(c\) to three significant figures.`, 1,
    t`9.00 × 10⁻⁵ s`,
    t`\(t = \frac{27 \times 10^3}{3.00 \times 10^8} = 9.00 \times 10^{-5}\) s.`, { unit: 's' }),
  part('c', t`Calculate the time for one lap in the protons’ frame of reference.`, 2,
    t`1.30 × 10⁻⁸ s`,
    t`The protons’ clock is present at the start and end of the lap, so it measures proper time: \(t_0 = \frac{t}{\gamma} = \frac{9.00 \times 10^{-5}}{6930} = 1.30 \times 10^{-8}\) s. 1 mark for identifying the proper time, 1 mark for the value.`, { unit: 's' }),
  part('d', t`Calculate the circumference of the ring as measured in the protons’ frame of reference.`, 2,
    t`3.9 m`,
    t`The 27 km is a proper length (the ring is at rest in the laboratory), so the protons measure \(L = \frac{L_0}{\gamma} = \frac{27 \times 10^3}{6930} = 3.9\) m. 1 mark for identifying the proper length, 1 mark for the value.`, { unit: 'm' }),
])

S.q(LM, 'proficient', t`Electrons accelerated from rest through 150 V pass through two very narrow slits \(1.0 \times 10^{-7}\) m apart. An interference pattern builds up on a detector 1.0 m beyond the slits.`, [
  part('a', t`Show that the de Broglie wavelength of the electrons is about \(1.0 \times 10^{-10}\) m.`, 2,
    t`\(\lambda = \dfrac{h}{\sqrt{2m_eqV}} = \dfrac{6.63 \times 10^{-34}}{\sqrt{2 \times 9.11 \times 10^{-31} \times 1.60 \times 10^{-19} \times 150}} = 1.0 \times 10^{-10}\) m`,
    t`\(E_k = qV = 2.40 \times 10^{-17}\) J and \(p = \sqrt{2m_eE_k} = 6.61 \times 10^{-24}\) kg m s⁻¹, so \(\lambda = \frac{h}{p} = 1.0 \times 10^{-10}\) m. 1 mark for the momentum, 1 mark for the wavelength.`),
  part('b', t`Calculate the spacing of the bright bands in the pattern.`, 2,
    t`1.0 × 10⁻³ m (1.0 mm)`,
    t`\(\Delta x = \frac{\lambda L}{d} = \frac{1.0 \times 10^{-10} \times 1.0}{1.0 \times 10^{-7}} = 1.0 \times 10^{-3}\) m. 1 mark for the substitution, 1 mark for the value.`, { unit: 'm' }),
  part('c', t`The accelerating voltage is increased to 600 V. State the effect on the spacing of the bands.`, 1,
    t`It halves (to about 0.5 mm).`,
    t`\(\lambda \propto \frac{1}{\sqrt{V}}\): four times the voltage halves the wavelength, and \(\Delta x \propto \lambda\).`),
  part('d', t`Explain what the formation of this pattern shows about electrons.`, 1,
    t`Electrons show wave behaviour: interference is a wave property, so electrons have a wavelength, \(\lambda = \frac{h}{p}\) (wave–particle duality).`,
    t`Linking interference to the wave nature of matter earns the mark.`),
])

const led = { kind: 'data_table', title: 'Table 1', columns: ['LED colour', 'λ (nm)', '1/λ (× 10⁶ m⁻¹)', 'threshold voltage V (V)'],
  rows: [['infrared', '940', '1.064', '1.29'], ['red', '660', '1.515', '1.85'], ['yellow', '590', '', '2.08'], ['green', '525', '1.905', '2.33'], ['blue', '470', '2.128', '2.61']] }
S.q(IN, 'advanced', t`Students estimate Planck’s constant using light-emitting diodes (LEDs). For each LED they slowly increase the voltage until the LED just begins to glow, and record this threshold voltage \(V\). They assume that the energy an electron gains, \(eV\), equals the energy of one emitted photon, \(\frac{hc}{\lambda}\). Their results are shown in Table 1.`, [
  part('a', t`Calculate the missing value of \(\frac{1}{\lambda}\) for the yellow LED.`, 1,
    t`1.695 × 10⁶ m⁻¹`,
    t`\(\frac{1}{590 \times 10^{-9}} = 1.695 \times 10^6\) m⁻¹.`),
  part('b', t`On the axes below, plot \(V\) against \(\frac{1}{\lambda}\) and draw a line of best fit.`, 3,
    t`Five points close to a straight line passing near the origin, from about (1.06, 1.29) to (2.13, 2.61).`,
    t`Marks: 1 for correctly plotted points (including the calculated point); 1 for a straight line of best fit; 1 for a line close to the origin, as \(V = \frac{hc}{e} \times \frac{1}{\lambda}\) predicts.`,
    { diagram: axes({ xMin: 0, xMax: 2.5, yMin: 0, yMax: 3.0, xStep: 0.5, yStep: 0.5, xLabel: '1/λ (× 10⁶ m⁻¹)', yLabel: 'V (V)', width: 360 }) }),
  part('c', t`Determine the gradient of your line, including its unit.`, 2,
    t`About 1.24 × 10⁻⁶ V m (accept 1.20–1.28 × 10⁻⁶ V m)`,
    t`For example, \(\frac{2.61 - 1.29}{(2.128 - 1.064) \times 10^6} = 1.24 \times 10^{-6}\) V m. 1 mark for a value from the line (not from two data points unless they lie on it), 1 mark for the unit.`),
  part('d', t`Use the gradient to calculate an experimental value of Planck’s constant.`, 2,
    t`About 6.6 × 10⁻³⁴ J s`,
    t`\(eV = \frac{hc}{\lambda}\) gives \(V = \frac{hc}{e} \cdot \frac{1}{\lambda}\), so the gradient is \(\frac{hc}{e}\) and \(h = \frac{\text{gradient} \times e}{c} = \frac{1.24 \times 10^{-6} \times 1.60 \times 10^{-19}}{3.00 \times 10^8} = 6.6 \times 10^{-34}\) J s. 1 mark for relating the gradient to \(\frac{hc}{e}\), 1 mark for the value.`, { unit: 'J s' }),
  part('e', t`Deciding exactly when an LED “just begins to glow” is difficult. Identify the type of error this introduces and suggest one improvement to the method.`, 2,
    t`Mostly systematic (the eye detects the glow only after it starts, so readings tend to be too high), with some random variation. Improvement: use a light sensor, or perform the measurements in a darkened room, or repeat and average each reading.`,
    t`1 mark for identifying the error with a reason, 1 mark for a suitable improvement.`),
], { diagram: led })

export const ITEMS = S.items
