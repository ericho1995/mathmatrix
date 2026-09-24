// VCE Physics Unit 3 & 4 — Practice exam 2.
// Section A: 20 multiple choice. Section B: 15 questions, 100 marks.
// Every value is computed in checks/set2.py.
import { t, AOS, part, makeSet, axes } from './phys.mjs'
import { drawing, traced } from './draw.mjs'

const { MO, FI, EL, LM, IN } = AOS
const S = makeSet(2)
const rad = d => (d * Math.PI) / 180

// ════════════════ Section A ════════════════

S.mc(MO, 'proficient', t`A 60 kg person stands on bathroom scales in a lift that is accelerating upwards at 1.5 m s⁻². The reading on the scales is closest to`,
  ['90 N', '499 N', '589 N', '679 N'], 'D',
  t`The scales read the normal force. With the acceleration upwards, \(N - mg = ma\), so \(N = m(g + a) = 60 \times 11.31 = 679\) N. 499 N is the reading when accelerating downwards and 589 N is the person’s weight.`)

S.mc(MO, 'proficient', t`A ball rolls off a horizontal table 1.25 m high at 3.0 m s⁻¹. Ignoring air resistance, the speed of the ball just before it hits the floor is closest to`,
  ['3.0 m s⁻¹', '4.95 m s⁻¹', '5.79 m s⁻¹', '7.95 m s⁻¹'], 'C',
  t`The fall takes \(t = \sqrt{\frac{2 \times 1.25}{9.81}} = 0.505\) s, so \(v_y = 9.81 \times 0.505 = 4.95\) m s⁻¹. The horizontal velocity is still 3.0 m s⁻¹, so \(v = \sqrt{3.0^2 + 4.95^2} = 5.79\) m s⁻¹. 7.95 m s⁻¹ adds the components as numbers instead of as vectors.`)

S.mc(MO, 'proficient', t`A car drives over the top of a hump in the road. The top of the hump is part of a vertical circle of radius 20 m. The maximum speed at which the car stays in contact with the road at the top is closest to`,
  ['4.47 m s⁻¹', '14.0 m s⁻¹', '19.8 m s⁻¹', '196 m s⁻¹'], 'B',
  t`At the maximum speed the normal force is zero and gravity alone provides the centripetal force: \(mg = \frac{mv^2}{r}\), so \(v = \sqrt{gr} = \sqrt{9.81 \times 20} = 14.0\) m s⁻¹. 196 is \(v^2\).`)

S.mc(MO, 'proficient', t`A 4.0 kg rifle, initially at rest, fires a 0.020 kg bullet horizontally at 400 m s⁻¹. The recoil speed of the rifle is`,
  ['0.020 m s⁻¹', '0.50 m s⁻¹', '2.0 m s⁻¹', '8.0 m s⁻¹'], 'C',
  t`The total momentum stays zero: \(0.020 \times 400 = 4.0v\), so \(v = 2.0\) m s⁻¹, opposite to the bullet. 8.0 is the bullet’s momentum in kg m s⁻¹.`)

S.mc(MO, 'developing', t`A spring that obeys Hooke’s law stretches by 0.15 m when a force of 30 N is applied to it. The elastic potential energy stored in the spring is`,
  ['2.25 J', '4.50 J', '30.0 J', '200 J'], 'A',
  t`\(k = \frac{30}{0.15} = 200\) N m⁻¹ and \(E_s = \frac{1}{2}kx^2 = \frac{1}{2} \times 200 \times 0.15^2 = 2.25\) J — the area under the force–extension graph. 4.50 J forgets the \(\frac{1}{2}\); 200 is the spring constant.`)

S.mc(FI, 'proficient', t`Planet X has twice the mass of Earth and twice the radius of Earth. The gravitational field strength at the surface of planet X is closest to`,
  ['2.45 N kg⁻¹', '4.91 N kg⁻¹', '9.81 N kg⁻¹', '19.6 N kg⁻¹'], 'B',
  t`\(g = \frac{GM}{r^2}\): doubling \(M\) doubles \(g\) and doubling \(r\) quarters it, so \(g = 9.81 \times \frac{2}{4} = 4.91\) N kg⁻¹.`)

S.mc(FI, 'proficient', t`A graph shows the gravitational force on a spacecraft against its distance from the centre of Earth. The area under the graph between two distances is equal to the`,
  ['average gravitational field strength between the two distances', 'impulse on the spacecraft', 'power needed to move the spacecraft', 'change in gravitational potential energy of the spacecraft'], 'D',
  t`Force × distance is work, so the area under a force–distance graph is the work done against gravity, which is the change in gravitational potential energy. (The area under a field–distance graph gives the energy change per kilogram.)`)

S.mc(FI, 'proficient', t`Two point charges exert an electric force of magnitude \(F\) on each other. One charge is doubled and the distance between the charges is halved. The new force has magnitude`,
  [t`\(F\)`, t`\(2F\)`, t`\(4F\)`, t`\(8F\)`], 'D',
  t`\(F = \frac{kq_1q_2}{r^2}\): doubling a charge doubles the force and halving the distance multiplies it by 4, giving \(8F\).`)

const wire = drawing(160, 100)
wire.circle(80, 50, 9, { fill: 'white', w: 1.2 }).dot(80, 50, 2.2).text(80, 76, 'wire (current out of the page)', { size: 8 })
  .dot(140, 50, 2).text(140, 42, 'P', { bold: true })
S.mc(FI, 'proficient', t`A long straight wire carries a current directly out of the page, as shown below. The direction of the magnetic field at point P is`,
  ['towards the top of the page', 'towards the bottom of the page', 'to the right', 'into the page'], 'A',
  t`By the right-hand grip rule (thumb along the current, out of the page), the field lines circle the wire anticlockwise as seen here. At a point to the right of the wire, anticlockwise is towards the top of the page. The field is always tangent to a circle around the wire, never radial and never along the current.`,
  { diagram: wire.done() })

S.mc(EL, 'proficient', t`A flat loop of area 0.050 m² is in a uniform magnetic field of 0.40 T. The plane of the loop is at 30° to the direction of the field. The magnetic flux through the loop is`,
  ['0.010 Wb', '0.017 Wb', '0.020 Wb', '8.0 Wb'], 'A',
  t`Only the field component perpendicular to the loop passes through it: \(B_\perp = 0.40\sin(30^\circ) = 0.20\) T, so \(\Phi_B = B_\perp A = 0.20 \times 0.050 = 0.010\) Wb. 0.017 Wb uses \(\cos(30^\circ)\); 0.020 Wb assumes the field is perpendicular to the loop.`)

S.mc(EL, 'proficient', t`The north pole of a bar magnet is pushed towards one end of a coil connected to a meter. Which one of the following describes the magnetic pole induced at that end of the coil and the force it exerts on the magnet?`,
  ['south | attractive', 'north | repulsive', 'north | attractive', 'south | repulsive'], 'B',
  t`By Lenz’s law the induced current opposes the change that produced it — here the increasing flux as the magnet approaches. The coil’s near end becomes a north pole, which repels the approaching north pole, so work must be done to push the magnet in. That work becomes the electrical energy.`,
  { headers: ['Pole at the near end of the coil', 'Force on the magnet'] })

S.mc(EL, 'proficient', t`An ideal transformer steps 240 V down to 12 V. The current in the secondary coil is 2.0 A. The current in the primary coil is`,
  ['0.10 A', '2.0 A', '24 A', '40 A'], 'A',
  t`An ideal transformer transfers power without loss: \(V_1I_1 = V_2I_2\), so \(I_1 = \frac{12 \times 2.0}{240} = 0.10\) A. Stepping the voltage down steps the current up, so the primary current is the smaller one; 40 A inverts the ratio.`)

S.mc(EL, 'proficient', t`An AC supply has an RMS voltage of 15.0 V. The peak-to-peak voltage of the supply is closest to`,
  ['10.6 V', '21.2 V', '30.0 V', '42.4 V'], 'D',
  t`\(V_{\text{peak}} = \sqrt{2} \times 15.0 = 21.2\) V, and the peak-to-peak voltage runs from \(+21.2\) V to \(-21.2\) V: 42.4 V. 21.2 V is the peak only.`)

S.mc(LM, 'developing', t`Light passes through a single narrow slit and a diffraction pattern forms on a screen. Which one of the following changes would increase the spreading of the light?`,
  ['using blue light instead of red light', 'increasing the intensity of the light', 'decreasing the width of the slit', 'increasing the width of the slit'], 'C',
  t`The amount of diffraction depends on the ratio \(\frac{\lambda}{w}\) of wavelength to gap width. Decreasing \(w\) increases the ratio. Blue light has a shorter wavelength, so it spreads less; intensity does not change the pattern’s shape.`)

S.mc(LM, 'proficient', t`Light of wavelength 250 nm falls on a metal with a work function of 2.30 eV. The stopping voltage for the emitted photoelectrons is closest to`,
  ['2.30 V', '2.67 V', '4.97 V', '7.27 V'], 'B',
  t`\(E = \frac{hc}{\lambda} = \frac{4.14 \times 10^{-15} \times 3.00 \times 10^8}{250 \times 10^{-9}} = 4.97\) eV, so \(E_{k\,\text{max}} = 4.97 - 2.30 = 2.67\) eV and the stopping voltage is 2.67 V. 7.27 V adds the work function instead of subtracting it.`)

S.mc(LM, 'proficient', t`The momentum of a photon of wavelength 500 nm is closest to`,
  ['4.42 × 10⁻³⁶ kg m s⁻¹', '1.33 × 10⁻²⁷ kg m s⁻¹', '1.99 × 10⁻²⁵ kg m s⁻¹', '3.98 × 10⁻¹⁹ kg m s⁻¹'], 'B',
  t`\(p = \frac{h}{\lambda} = \frac{6.63 \times 10^{-34}}{500 \times 10^{-9}} = 1.33 \times 10^{-27}\) kg m s⁻¹. \(3.98 \times 10^{-19}\) is the photon’s energy in joules, not its momentum.`)

S.mc(LM, 'developing', t`White light passes through a container of cool hydrogen gas and then through a prism. The spectrum observed is`,
  ['a continuous spectrum with no gaps', 'bright lines on a dark background', 'bright lines at every visible wavelength', 'a continuous spectrum crossed by dark lines at the wavelengths that hydrogen emits'], 'D',
  t`The hydrogen atoms absorb only photons whose energies exactly match the gaps between their energy levels — the same gaps that produce hydrogen’s emission lines. Those wavelengths are missing, giving an absorption spectrum. Bright lines on a dark background is the emission spectrum of hot gas.`)

S.mc(LM, 'proficient', t`A spacecraft is 100 m long when measured at rest. It passes an observer at \(0.60c\). The length of the spacecraft measured by the observer is`,
  ['60 m', '64 m', '80 m', '125 m'], 'C',
  t`\(\gamma = \frac{1}{\sqrt{1 - 0.60^2}} = 1.25\) and \(L = \frac{L_0}{\gamma} = \frac{100}{1.25} = 80\) m. Moving objects are contracted along the direction of motion, never lengthened, so 125 m is wrong.`)

S.mc(LM, 'proficient', t`The Sun emits energy at a rate of \(3.8 \times 10^{26}\) W. The mass the Sun loses each second as a result is closest to`,
  ['4.2 × 10⁹ kg', '1.3 × 10¹⁸ kg', '3.8 × 10²⁶ kg', '3.4 × 10⁴³ kg'], 'A',
  t`Each second the Sun emits \(3.8 \times 10^{26}\) J, and \(\Delta m = \frac{E}{c^2} = \frac{3.8 \times 10^{26}}{(3.00 \times 10^8)^2} = 4.2 \times 10^9\) kg. \(1.3 \times 10^{18}\) divides by \(c\) instead of \(c^2\).`)

S.mc(IN, 'developing', t`A student takes several measurements of the same quantity. The results are very close to one another, but all are well below the accepted value. The measurements are best described as`,
  ['accurate and precise', 'accurate but not precise', 'precise but not accurate', 'neither accurate nor precise'], 'C',
  t`Precision is how closely repeated measurements agree with each other; accuracy is how close they are to the true value. Results that cluster tightly away from the accepted value are precise but not accurate, which usually points to a systematic error.`)

// ════════════════ Section B ════════════════

// Incline: 20°, base from (30, 138).
const inc = drawing(300, 150)
const X0 = 30, Y0 = 138, TH = rad(20)
const on = (s, n = 0) => [X0 + s * Math.cos(TH) - n * Math.sin(TH), Y0 - s * Math.sin(TH) - n * Math.cos(TH)]
inc.incline(X0, Y0, 240, 20, { label: '20°' })
  .poly([on(105), on(145), on(145, 26), on(105, 26)], { closed: true, fill: 'light' }).text(...on(125, 13).map((v, i) => v + (i ? 3 : 0)), '5.0 kg', { size: 8.5 })
  .arrow(...on(145, 13), ...on(195, 13)).text(...on(200, 26), 'F = 30 N', { size: 8.5 })
S.q(MO, 'proficient', t`A 5.0 kg box is pulled up a ramp inclined at 20° to the horizontal by a force of 30 N acting parallel to the ramp, as shown in Figure 1. A constant friction force of 8.0 N acts on the box while it moves.`, [
  part('a', t`Calculate the magnitude of the component of the box’s weight that acts down the ramp.`, 1,
    t`16.8 N`,
    t`\(mg\sin(20^\circ) = 5.0 \times 9.81 \times 0.342 = 16.8\) N.`, { unit: 'N' }),
  part('b', t`Calculate the magnitude of the acceleration of the box up the ramp.`, 2,
    t`1.04 m s⁻²`,
    t`Both the weight component and friction act down the ramp while the box moves up: \(F_{\text{net}} = 30 - 16.8 - 8.0 = 5.22\) N and \(a = \frac{5.22}{5.0} = 1.04\) m s⁻². 1 mark for the net force, 1 mark for the acceleration. Common error: leaving out the weight component.`, { unit: 'm s⁻²' }),
  part('c', t`Calculate the magnitude of the normal force on the box.`, 1,
    t`46.1 N`,
    t`Perpendicular to the ramp the forces balance: \(N = mg\cos(20^\circ) = 5.0 \times 9.81 \times 0.940 = 46.1\) N.`, { unit: 'N' }),
  part('d', t`The 30 N force is suddenly removed while the box is still moving up the ramp. Calculate the magnitude of the box’s acceleration immediately afterwards, and state its direction.`, 2,
    t`4.96 m s⁻², down the ramp`,
    t`The box is still moving up, so friction still acts down the ramp: \(a = \frac{16.8 + 8.0}{5.0} = 4.96\) m s⁻², directed down the ramp (the box slows down). 1 mark for including friction in the same direction as the weight component, 1 mark for the value with its direction.`),
], { diagram: inc.done('Figure 1') })

// Building projectile: 4 px per metre.
const bld = drawing(340, 160)
const ux2 = 15 * Math.cos(rad(40)), uy2 = 15 * Math.sin(rad(40))
bld.ground(10, 330, 140).rect(20, 60, 40, 80, { fill: 'light' }).dot(60, 60, 2.6)
  .arrow(60, 60, 60 + 46 * Math.cos(rad(40)), 60 - 46 * Math.sin(rad(40))).text(100, 24, '15.0 m s⁻¹', { anchor: 'start', size: 8.5 }).angle(60, 60, 22, 0, 40, '40°')
  .path(traced(tt => 60 - 4 * (uy2 * tt - 4.905 * tt * tt), 0, 3.2286, s => 60 + 4 * ux2 * s, v => v, 40))
  .dim(75, 64, 75, 140, '20.0 m', { offset: -20 })
S.q(MO, 'proficient', t`A ball is thrown from the edge of the flat roof of a building 20.0 m high with a speed of 15.0 m s⁻¹ at 40.0° above the horizontal, as shown in Figure 2. It lands on the level ground below. Ignore air resistance.`, [
  part('a', t`Calculate the time taken for the ball to reach its highest point.`, 1,
    t`0.983 s`,
    t`\(u_y = 15.0\sin(40.0^\circ) = 9.64\) m s⁻¹ and at the top \(v_y = 0\): \(t = \frac{9.64}{9.81} = 0.983\) s.`, { unit: 's' }),
  part('b', t`Calculate the maximum height of the ball above the ground.`, 2,
    t`24.7 m`,
    t`Rise above the roof: \(s = \frac{u_y^2}{2g} = \frac{9.64^2}{2 \times 9.81} = 4.74\) m, so the height above the ground is \(20.0 + 4.74 = 24.7\) m. 1 mark for the rise, 1 mark for adding the height of the building.`, { unit: 'm' }),
  part('c', t`Show that the ball is in the air for approximately 3.23 s.`, 2,
    t`Solving \(-20.0 = 9.64t - 4.905t^2\) gives \(t = 3.23\) s.`,
    t`Taking up as positive, the displacement is \(-20.0\) m: \(-20.0 = 9.64t - \frac{1}{2}(9.81)t^2\). The positive root of \(4.905t^2 - 9.64t - 20.0 = 0\) is \(t = \frac{9.64 + \sqrt{9.64^2 + 4 \times 4.905 \times 20.0}}{9.81} = 3.23\) s. (Or: 0.983 s up, then a fall of 24.7 m from rest taking 2.25 s.) 1 mark for the equation with the correct sign of displacement, 1 mark for solving it.`),
  part('d', t`Calculate the horizontal distance from the base of the building to where the ball lands.`, 1,
    t`37.1 m`,
    t`\(u_x = 15.0\cos(40.0^\circ) = 11.49\) m s⁻¹ is constant, so \(x = 11.49 \times 3.23 = 37.1\) m.`, { unit: 'm' }),
  part('e', t`Explain how air resistance would change the horizontal distance travelled.`, 1,
    t`The distance would be smaller: air resistance opposes the motion, reducing the horizontal velocity (and the maximum height and time of flight).`,
    t`Air resistance acts opposite to the velocity, so the horizontal component decreases throughout the flight.`),
], { diagram: bld.done('Figure 2') })

// Conical pendulum: pivot (110, 16), 1.2 m drawn as 120 px, 30° to the vertical.
const cone = drawing(230, 150)
const bx = 110 + 120 * Math.sin(rad(30)), by = 16 + 120 * Math.cos(rad(30))
cone.ceiling(70, 150, 16).line(110, 16, bx, by, { w: 1.1 }).line(110, 16, 110, by, { dash: true, grey: true })
  .poly(Array.from({ length: 49 }, (_, i) => [110 + 60 * Math.cos((i * Math.PI) / 24), by + 13 * Math.sin((i * Math.PI) / 24)]), { dash: true })
  .circle(bx, by, 7, { fill: 'mid' }).angle(110, 16, 26, -90, -60, '30°').text(154, 62, '1.20 m', { anchor: 'start', size: 8.5 })
S.q(MO, 'proficient', t`A 0.50 kg ball on a light string of length 1.20 m moves in a horizontal circle at constant speed. The string makes an angle of 30° with the vertical, as shown in Figure 3.`, [
  part('a', t`Calculate the tension in the string.`, 2,
    t`5.66 N`,
    t`The ball does not accelerate vertically, so the vertical component of the tension balances the weight: \(T\cos(30^\circ) = mg\), \(T = \frac{0.50 \times 9.81}{0.866} = 5.66\) N. 1 mark for the vertical balance, 1 mark for the value.`, { unit: 'N' }),
  part('b', t`Calculate the speed of the ball.`, 3,
    t`1.84 m s⁻¹`,
    t`The radius of the circle is \(r = 1.20\sin(30^\circ) = 0.60\) m. The horizontal component of the tension is the centripetal force: \(\tan(30^\circ) = \frac{v^2}{rg}\), so \(v = \sqrt{0.60 \times 9.81 \times \tan(30^\circ)} = 1.84\) m s⁻¹. Marks: 1 for the radius; 1 for the force relationship; 1 for the speed. Common error: using the string length (1.20 m) as the radius.`, { unit: 'm s⁻¹' }),
], { diagram: cone.done('Figure 3') })

S.q(MO, 'advanced', t`On a frictionless track, trolley P (mass 2.0 kg) moving east at 4.0 m s⁻¹ collides head-on with trolley Q (mass 3.0 kg) moving west at 1.0 m s⁻¹. After the collision, P moves west at 1.0 m s⁻¹.`, [
  part('a', t`Calculate the velocity of Q after the collision.`, 2,
    t`2.33 m s⁻¹ east`,
    t`Taking east as positive: momentum before \(= 2.0 \times 4.0 + 3.0 \times (-1.0) = 5.0\) kg m s⁻¹. After: \(2.0 \times (-1.0) + 3.0v = 5.0\), so \(v = +2.33\) m s⁻¹, i.e. 2.33 m s⁻¹ east. 1 mark for applying conservation of momentum with signs, 1 mark for the speed and direction.`),
  part('b', t`Determine whether the collision is elastic. Justify your answer with calculations.`, 3,
    t`Not elastic: the kinetic energy falls from 17.5 J to 9.17 J.`,
    t`Before: \(\frac{1}{2}(2.0)(4.0)^2 + \frac{1}{2}(3.0)(1.0)^2 = 16 + 1.5 = 17.5\) J. After: \(\frac{1}{2}(2.0)(1.0)^2 + \frac{1}{2}(3.0)(2.33)^2 = 1.0 + 8.17 = 9.17\) J. Kinetic energy is not conserved (8.3 J is transformed to heat, sound and deformation), so the collision is inelastic. 1 mark for each kinetic energy, 1 mark for the conclusion.`),
  part('c', t`Calculate the magnitude and direction of the impulse on trolley P.`, 1,
    t`10 N s, west`,
    t`\(\Delta p = 2.0 \times (-1.0 - 4.0) = -10\) N s: 10 N s west. By Newton’s third law, the impulse on Q is 10 N s east.`),
])

S.q(FI, 'proficient', t`Mars has a mass of \(6.42 \times 10^{23}\) kg and a radius of \(3.39 \times 10^6\) m. Its moon Phobos moves in an approximately circular orbit of radius \(9.38 \times 10^6\) m.`, [
  part('a', t`Calculate the gravitational field strength at the surface of Mars.`, 2,
    t`3.73 N kg⁻¹`,
    t`\(g = \frac{GM}{r^2} = \frac{6.67 \times 10^{-11} \times 6.42 \times 10^{23}}{(3.39 \times 10^6)^2} = 3.73\) N kg⁻¹. 1 mark for the substitution, 1 mark for the value.`, { unit: 'N kg⁻¹' }),
  part('b', t`Calculate the orbital period of Phobos, in hours.`, 3,
    t`7.66 hours`,
    t`\(\frac{GMm}{r^2} = \frac{4\pi^2mr}{T^2}\), so \(T = 2\pi\sqrt{\frac{r^3}{GM}} = 2\pi\sqrt{\frac{(9.38 \times 10^6)^3}{6.67 \times 10^{-11} \times 6.42 \times 10^{23}}} = 2.76 \times 10^4\) s \(= 7.66\) h. Marks: 1 for equating the forces; 1 for the period in seconds; 1 for converting to hours.`, { unit: 'hours' }),
  part('c', t`Phobos moves at constant speed, even though a net force acts on it. Explain why.`, 1,
    t`The gravitational force is always perpendicular to Phobos’s velocity, so it changes only the direction of motion and does no work.`,
    t`A force perpendicular to the velocity changes direction, not speed (no work is done, so the kinetic energy is constant).`),
])

// Electron beam between plates: 30 px per cm.
const beam = drawing(300, 116)
beam.plates(80, 30, 150, 60, '+', '−').arrow(18, 60, 74, 60).text(20, 54, 'e⁻', { anchor: 'start', size: 8.5 })
  .path(traced(x => 60 - 0.5 * 1.7563e15 * ((x / 3e7) ** 2) * 3000, 0, 0.05, x => 80 + 3000 * x, y => y, 30))
  .dim(80, 13, 230, 13, '5.0 cm', { offset: -5 }).dim(262, 30, 262, 90, '2.0 cm', { offset: -20 })
  .text(20, 76, '3.0 × 10⁷ m s⁻¹', { anchor: 'start', size: 8 })
S.q(FI, 'advanced', t`An electron travelling horizontally at \(3.0 \times 10^7\) m s⁻¹ enters the region midway between two parallel plates, as shown in Figure 4. The plates are 5.0 cm long and 2.0 cm apart, with a potential difference of 200 V between them.`, [
  part('a', t`Calculate the magnitude of the electric field between the plates.`, 1,
    t`1.0 × 10⁴ V m⁻¹`,
    t`\(E = \frac{V}{d} = \frac{200}{0.020} = 1.0 \times 10^4\) V m⁻¹.`, { unit: 'V m⁻¹' }),
  part('b', t`Calculate the magnitude of the acceleration of the electron between the plates.`, 2,
    t`1.76 × 10¹⁵ m s⁻²`,
    t`\(a = \frac{qE}{m} = \frac{1.60 \times 10^{-19} \times 1.0 \times 10^4}{9.11 \times 10^{-31}} = 1.76 \times 10^{15}\) m s⁻². 1 mark for \(F = qE\) with Newton’s second law, 1 mark for the value.`, { unit: 'm s⁻²' }),
  part('c', t`Calculate the vertical distance the electron has moved when it leaves the plates.`, 2,
    t`2.4 × 10⁻³ m (2.4 mm), towards the positive plate`,
    t`The horizontal velocity is unchanged, so the time between the plates is \(\frac{0.050}{3.0 \times 10^7} = 1.67 \times 10^{-9}\) s. Vertically, from rest: \(s = \frac{1}{2}at^2 = \frac{1}{2} \times 1.76 \times 10^{15} \times (1.67 \times 10^{-9})^2 = 2.4 \times 10^{-3}\) m — less than the 10 mm to the plate, so it emerges. 1 mark for the time, 1 mark for the displacement.`, { unit: 'm' }),
  part('d', t`Explain why the gravitational force on the electron can be ignored in this situation.`, 1,
    t`The gravitational force (\(mg \approx 8.9 \times 10^{-30}\) N) is about \(10^{14}\) times smaller than the electric force (\(1.6 \times 10^{-15}\) N).`,
    t`A comparison of the two forces with values (or orders of magnitude) is needed for the mark.`),
], { diagram: beam.done('Figure 4') })

const cyc = drawing(220, 150)
cyc.rect(20, 10, 180, 130, { fill: 'light', noStroke: true }).rect(20, 10, 180, 130, { dash: true, fill: 'none' })
  .arc(110, 75, 50, 60, -270, { arrow: 'end' }).circle(110, 125, 6, { fill: 'white' }).text(110, 128, '+', { size: 9, bold: true })
  .dot(110, 75, 1.6).line(110, 75, 145.4, 39.6, { dash: true }).text(122, 52, 'r', { italic: true })
S.q(FI, 'proficient', t`A proton (mass \(1.67 \times 10^{-27}\) kg, charge \(+1.60 \times 10^{-19}\) C) moves clockwise at constant speed in a circle of radius 0.40 m in a uniform magnetic field of 0.25 T, as shown in Figure 5. The field is perpendicular to the page.`, [
  part('a', t`State whether the magnetic field is directed into or out of the page.`, 1,
    t`Out of the page`,
    t`At the bottom of the circle the proton moves to the left and the force points up, towards the centre. For a positive charge, the right-hand rule gives a field out of the page.`),
  part('b', t`Calculate the speed of the proton.`, 2,
    t`9.58 × 10⁶ m s⁻¹`,
    t`\(r = \frac{mv}{qB}\), so \(v = \frac{qBr}{m} = \frac{1.60 \times 10^{-19} \times 0.25 \times 0.40}{1.67 \times 10^{-27}} = 9.58 \times 10^6\) m s⁻¹. 1 mark for rearranging, 1 mark for the value.`, { unit: 'm s⁻¹' }),
  part('c', t`Calculate the time the proton takes to complete one revolution.`, 2,
    t`2.62 × 10⁻⁷ s`,
    t`\(T = \frac{2\pi r}{v} = \frac{2\pi \times 0.40}{9.58 \times 10^6} = 2.62 \times 10^{-7}\) s. (Equivalently \(T = \frac{2\pi m}{qB}\), which does not depend on the speed.) 1 mark for the method, 1 mark for the value.`, { unit: 's' }),
  part('d', t`An alpha particle (charge \(+2e\), mass four times that of a proton) enters the same field at the same speed. Determine the radius of its path.`, 1,
    t`0.80 m`,
    t`\(r = \frac{mv}{qB}\): four times the mass and twice the charge doubles the radius, to 0.80 m.`, { unit: 'm' }),
], { diagram: cyc.done('Figure 5') })

// Loop entering a field: 4 px per cm.
const loopB = drawing(330, 138)
loopB.rect(150, 22, 120, 100, { fill: 'none', dash: true }).fieldIn(150, 22, 120, 100, 20)
  .poly([[60, 52], [100, 52], [100, 92], [60, 92]], { closed: true, w: 1.6 }).arrow(106, 72, 136, 72).sym(121, 66, 'v')
  .dim(60, 104, 100, 104, '10 cm', { offset: 10 }).dim(150, 12, 270, 12, '30 cm', { offset: -4 })
S.q(EL, 'advanced', t`A square coil of 20 turns with sides of 10 cm is pulled to the right at a constant 0.50 m s⁻¹. It passes through a region 30 cm wide in which there is a uniform magnetic field of 0.40 T directed into the page, as shown in Figure 6. The resistance of the coil is 2.0 Ω.`, [
  part('a', t`Calculate the change in magnetic flux through the coil as it moves from completely outside the field to completely inside it.`, 1,
    t`4.0 × 10⁻³ Wb`,
    t`\(\Delta\Phi_B = B\Delta A = 0.40 \times (0.10)^2 = 4.0 \times 10^{-3}\) Wb.`, { unit: 'Wb' }),
  part('b', t`Calculate the magnitude of the EMF induced in the coil while it is entering the field.`, 2,
    t`0.40 V`,
    t`Entering takes \(\frac{0.10}{0.50} = 0.20\) s, so \(\varepsilon = N\frac{\Delta\Phi_B}{\Delta t} = 20 \times \frac{4.0 \times 10^{-3}}{0.20} = 0.40\) V. 1 mark for the time, 1 mark for the EMF.`, { unit: 'V' }),
  part('c', t`State the direction of the induced current in the coil (clockwise or anticlockwise) as it enters the field, and explain your answer.`, 2,
    t`Anticlockwise. The flux into the page is increasing, so the induced current produces a field out of the page inside the coil to oppose the change (Lenz’s law).`,
    t`1 mark for anticlockwise, 1 mark for the Lenz’s law reasoning. Answers that only say “it opposes the magnet/field” without referring to the change in flux do not earn the second mark.`),
  part('d', t`Calculate the current in the coil while it is entering the field.`, 1,
    t`0.20 A`,
    t`\(I = \frac{\varepsilon}{R} = \frac{0.40}{2.0} = 0.20\) A.`, { unit: 'A' }),
  part('e', t`On the axes below, sketch the EMF induced in the coil from the moment it starts to enter the field (\(t = 0\)) until it has completely left the field. Take anticlockwise as positive.`, 2,
    t`+0.40 V from 0 to 0.20 s; zero from 0.20 s to 0.60 s (the flux is constant while the coil is wholly inside); −0.40 V from 0.60 s to 0.80 s.`,
    t`1 mark for the three stages with correct times; 1 mark for the EMF reversing sign (with the same magnitude) as the coil leaves. Common error: drawing an EMF while the coil is wholly inside the field.`,
    { diagram: axes({ xMin: 0, xMax: 0.9, yMin: -0.6, yMax: 0.6, xStep: 0.1, yStep: 0.2, xLabel: 't (s)', yLabel: 'EMF (V)', width: 360 }) }),
], { diagram: loopB.done('Figure 6') })

S.q(EL, 'proficient', t`A phone charger contains an ideal transformer that converts the 240 V RMS mains supply to 6.0 V RMS. When charging, the charger delivers 1.5 A RMS to the phone.`, [
  part('a', t`Calculate the ratio of the number of turns on the primary coil to the number on the secondary coil.`, 1,
    t`40 : 1`,
    t`\(\frac{N_1}{N_2} = \frac{V_1}{V_2} = \frac{240}{6.0} = 40\).`),
  part('b', t`Calculate the RMS current in the primary coil.`, 2,
    t`0.0375 A`,
    t`\(P = V_2I_2 = 6.0 \times 1.5 = 9.0\) W, and in an ideal transformer \(I_1 = \frac{9.0}{240} = 0.0375\) A. 1 mark for equating powers (or using the turns ratio), 1 mark for the value.`, { unit: 'A' }),
  part('c', t`Calculate the peak voltage across the secondary coil.`, 1,
    t`8.49 V`,
    t`\(V_{\text{peak}} = \sqrt{2} \times 6.0 = 8.49\) V.`, { unit: 'V' }),
  part('d', t`Explain why the transformer would not work if it were connected to a 240 V DC supply.`, 2,
    t`A steady DC current produces a constant magnetic flux in the core, so there is no changing flux through the secondary coil and no EMF is induced in it.`,
    t`1 mark for “constant current gives constant flux”, 1 mark for linking “no change in flux” to “no induced EMF” (Faraday’s law).`),
  part('e', t`The charger becomes warm in use. Describe one way in which energy is lost in a real transformer.`, 1,
    t`Heating of the coils by their resistance (\(I^2R\) losses), or eddy currents induced in the iron core.`,
    t`Any one real loss mechanism, with its cause, earns the mark.`),
])

const farm = drawing(340, 96)
farm.rect(14, 22, 34, 50, { fill: 'white' }).text(31, 51, 'G', { bold: true }).text(31, 86, '240 V', { size: 8 })
  .resistor(48, 30, 290, 30, '0.20 Ω', { len: 30 }).resistor(48, 64, 290, 64, '0.20 Ω', { len: 30 })
  .rect(290, 20, 42, 54, { fill: 'light' }).text(311, 50, 'house', { size: 8.5 })
  .text(169, 86, 'cables (0.40 Ω in total)', { size: 8.5 })
S.q(EL, 'advanced', t`A generator on a farm produces 12.0 kW at 240 V RMS. The power is carried to a farmhouse along cables with a total resistance of 0.40 Ω, as shown in Figure 7.`, [
  part('a', t`Calculate the current in the cables.`, 1,
    t`50 A`,
    t`\(I = \frac{P}{V} = \frac{12\,000}{240} = 50\) A.`, { unit: 'A' }),
  part('b', t`Calculate the voltage available at the farmhouse.`, 2,
    t`220 V`,
    t`\(V_{\text{drop}} = IR = 50 \times 0.40 = 20\) V, so \(240 - 20 = 220\) V reaches the house. 1 mark for the voltage drop, 1 mark for the answer.`, { unit: 'V' }),
  part('c', t`Calculate the power lost in the cables as a percentage of the power generated.`, 2,
    t`8.3%`,
    t`\(P_{\text{loss}} = I^2R = 50^2 \times 0.40 = 1000\) W, which is \(\frac{1000}{12\,000} = 8.3\%\). 1 mark for the loss, 1 mark for the percentage.`, { unit: '%' }),
  part('d', t`The farmer installs a 1 : 10 step-up transformer at the generator and a 10 : 1 step-down transformer at the house. Calculate the new power loss in the cables. Treat the transformers as ideal.`, 2,
    t`10 W`,
    t`The cables now carry 2400 V, so \(I = \frac{12\,000}{2400} = 5.0\) A and \(P_{\text{loss}} = 5.0^2 \times 0.40 = 10\) W — one-hundredth of the loss. 1 mark for the new current, 1 mark for the loss.`, { unit: 'W' }),
  part('e', t`Explain why electricity grids use AC rather than DC for long-distance distribution.`, 1,
    t`AC can be stepped up and down with transformers, which need a changing current; high-voltage, low-current transmission minimises \(I^2R\) losses.`,
    t`The link between AC and transformers is required for the mark.`),
], { diagram: farm.done('Figure 7') })

S.q(LM, 'proficient', t`In a photoelectric experiment, light of wavelength 400 nm falls on a potassium surface. The stopping voltage is measured to be 0.95 V.`, [
  part('a', t`Calculate the energy of one photon of this light, in electronvolts.`, 1,
    t`3.11 eV`,
    t`\(E = \frac{hc}{\lambda} = \frac{4.14 \times 10^{-15} \times 3.00 \times 10^8}{400 \times 10^{-9}} = 3.11\) eV.`, { unit: 'eV' }),
  part('b', t`Calculate the work function of potassium.`, 2,
    t`2.16 eV`,
    t`The stopping voltage gives the maximum kinetic energy: \(E_{k\,\text{max}} = 0.95\) eV. \(\phi = hf - E_{k\,\text{max}} = 3.11 - 0.95 = 2.16\) eV. 1 mark for \(E_{k\,\text{max}} = qV_0\), 1 mark for the value.`, { unit: 'eV' }),
  part('c', t`Calculate the threshold frequency of potassium.`, 2,
    t`5.2 × 10¹⁴ Hz`,
    t`\(f_0 = \frac{\phi}{h} = \frac{2.155}{4.14 \times 10^{-15}} = 5.2 \times 10^{14}\) Hz. 1 mark for the method, 1 mark for the value.`, { unit: 'Hz' }),
  part('d', t`Explain why the existence of a threshold frequency cannot be explained by the wave model of light.`, 2,
    t`In the wave model, energy arrives continuously, so light of any frequency should eventually release electrons if it is bright enough or shines for long enough. Experiments show no electrons at all below \(f_0\), however intense the light.`,
    t`1 mark for the wave-model prediction (any frequency works given enough intensity or time), 1 mark for the contradiction with observation. Explaining the photon model alone earns at most 1 mark.`),
])

// Energy levels: y = 15 + 14 × (−E).
const ey = E => 15 + 14 * -E
const lev = drawing(260, 172)
lev.levels(70, 180, [
  { y: ey(0), left: '', right: '0 eV', dash: true },
  { y: ey(-1.6), left: 'n = 4', right: '−1.6 eV' },
  { y: ey(-3.7), left: 'n = 3', right: '−3.7 eV' },
  { y: ey(-5.5), left: 'n = 2', right: '−5.5 eV' },
  { y: ey(-10.4), left: 'n = 1', right: '−10.4 eV' },
])
S.q(LM, 'advanced', t`Figure 8 shows the four lowest energy levels of an atom.`, [
  part('a', t`Atoms are excited to the \(n = 4\) level. Determine the number of different photon energies that can be emitted as they return to the ground state.`, 1,
    t`6`,
    t`Every pair of levels gives one transition: 4→3, 4→2, 4→1, 3→2, 3→1, 2→1.`),
  part('b', t`Calculate the longest wavelength of light emitted in these transitions.`, 2,
    t`690 nm (the n = 3 → 2 transition, 1.8 eV)`,
    t`The longest wavelength comes from the smallest energy gap, \(-3.7 - (-5.5) = 1.8\) eV: \(\lambda = \frac{hc}{E} = \frac{4.14 \times 10^{-15} \times 3.00 \times 10^8}{1.8} = 6.9 \times 10^{-7}\) m. 1 mark for identifying the smallest gap, 1 mark for the wavelength.`, { unit: 'nm' }),
  part('c', t`An electron with 6.0 eV of kinetic energy collides with an atom in the ground state. State the possible kinetic energies of the electron after the collision, and explain.`, 2,
    t`6.0 eV or 1.1 eV`,
    t`The atom can take exactly 4.9 eV (to reach \(n = 2\)), leaving the electron 1.1 eV; the next excitation needs 6.7 eV, which is more than the electron has. If the atom is not excited, the collision is elastic and the electron keeps 6.0 eV. 1 mark for each energy with its reason.`),
  part('d', t`A beam of 6.0 eV photons passes through a gas of these atoms in the ground state. Explain why the photons are not absorbed.`, 1,
    t`A photon is absorbed only if its whole energy exactly matches a gap between levels; 6.0 eV matches none (4.9, 6.7, 8.8 eV).`,
    t`Unlike an electron, a photon cannot give up part of its energy.`),
], { diagram: lev.done('Figure 8') })

S.q(LM, 'proficient', t`In an electron microscope, electrons are accelerated from rest through a potential difference of 5.0 kV.`, [
  part('a', t`Calculate the momentum of the electrons.`, 2,
    t`3.82 × 10⁻²³ kg m s⁻¹`,
    t`\(E_k = qV = 1.60 \times 10^{-19} \times 5000 = 8.0 \times 10^{-16}\) J, and \(p = \sqrt{2m_eE_k} = \sqrt{2 \times 9.11 \times 10^{-31} \times 8.0 \times 10^{-16}} = 3.82 \times 10^{-23}\) kg m s⁻¹. 1 mark for the kinetic energy, 1 mark for the momentum.`, { unit: 'kg m s⁻¹' }),
  part('b', t`Calculate the de Broglie wavelength of the electrons.`, 1,
    t`1.74 × 10⁻¹¹ m`,
    t`\(\lambda = \frac{h}{p} = \frac{6.63 \times 10^{-34}}{3.82 \times 10^{-23}} = 1.74 \times 10^{-11}\) m.`, { unit: 'm' }),
  part('c', t`Explain why an electron microscope can show much finer detail than a light microscope.`, 2,
    t`The electrons’ wavelength (about \(10^{-11}\) m) is far smaller than that of visible light (about \(5 \times 10^{-7}\) m), so they diffract much less around small features and can resolve much smaller details.`,
    t`1 mark for comparing the wavelengths, 1 mark for linking a smaller wavelength to less diffraction (better resolution).`),
  part('d', t`The accelerating voltage is increased to 20 kV. State the factor by which the de Broglie wavelength changes.`, 1,
    t`It halves.`,
    t`\(\lambda = \frac{h}{\sqrt{2m_eqV}} \propto \frac{1}{\sqrt{V}}\); four times the voltage gives half the wavelength (\(8.7 \times 10^{-12}\) m).`),
])

S.q(LM, 'advanced', t`In a particle accelerator, electrons reach a speed of \(0.99c\).`, [
  part('a', t`Calculate the Lorentz factor, \(\gamma\), for these electrons.`, 1,
    t`7.09`,
    t`\(\gamma = \frac{1}{\sqrt{1 - 0.99^2}} = 7.09\).`),
  part('b', t`Calculate the total energy of one electron.`, 2,
    t`5.81 × 10⁻¹³ J`,
    t`\(E_{\text{total}} = \gamma mc^2 = 7.09 \times 9.11 \times 10^{-31} \times (3.00 \times 10^8)^2 = 5.81 \times 10^{-13}\) J. 1 mark for the rest energy (\(8.20 \times 10^{-14}\) J), 1 mark for the total.`, { unit: 'J' }),
  part('c', t`Calculate the kinetic energy of one electron, in MeV.`, 2,
    t`3.12 MeV`,
    t`\(E_k = (\gamma - 1)mc^2 = 6.09 \times 8.20 \times 10^{-14} = 4.99 \times 10^{-13}\) J \(= \frac{4.99 \times 10^{-13}}{1.60 \times 10^{-19}} = 3.12 \times 10^6\) eV. 1 mark for the kinetic energy in joules, 1 mark for the conversion. Common error: using \(\frac{1}{2}mv^2\), which gives only 0.25 MeV.`, { unit: 'MeV' }),
  part('d', t`Explain why the electrons can never reach the speed of light, however much energy the accelerator supplies.`, 1,
    t`As \(v \to c\), \(\gamma \to \infty\), so the kinetic energy needed, \((\gamma - 1)mc^2\), becomes infinite.`,
    t`Each increase in energy produces a smaller and smaller increase in speed.`),
])

const stopper = { kind: 'data_table', title: 'Table 1', columns: ['Hanging mass (g)', 'F (N)', 'Time for 20 revolutions (s)', 'v (m s⁻¹)', 'v² (m² s⁻²)'],
  rows: [['50', '0.491', '20.2', '3.11', '9.7'], ['100', '0.981', '14.1', '4.46', '19.9'], ['150', '1.47', '11.6', '', ''], ['200', '1.96', '10.1', '6.22', '38.7'], ['250', '2.45', '8.9', '7.06', '49.8']] }
S.q(IN, 'advanced', t`Students investigate circular motion by whirling a rubber stopper on a string in a horizontal circle of radius 0.50 m. The string passes through a vertical tube and holds a hanging mass, whose weight provides the tension \(F\) in the string. For each hanging mass, the students adjust the speed until the radius stays at 0.50 m and time 20 revolutions. Their results are shown in Table 1.`, [
  part('a', t`Identify the independent variable, the dependent variable and one controlled variable in this investigation.`, 2,
    t`Independent: the tension \(F\) (hanging mass). Dependent: the speed \(v\) (time for 20 revolutions). Controlled: the radius, or the mass of the stopper.`,
    t`1 mark for the independent and dependent variables, 1 mark for a valid controlled variable.`),
  part('b', t`Calculate the missing values of \(v\) and \(v^2\) for the 150 g hanging mass.`, 2,
    t`v = 5.42 m s⁻¹; v² = 29.3 m² s⁻²`,
    t`\(v = \frac{20 \times 2\pi r}{t} = \frac{20 \times 2\pi \times 0.50}{11.6} = 5.42\) m s⁻¹ and \(v^2 = 29.3\) m² s⁻². 1 mark for each value.`),
  part('c', t`On the axes below, plot \(F\) against \(v^2\) and draw a line of best fit.`, 3,
    t`Five points close to a straight line through (or very near) the origin, reaching about 2.45 N at 50 m² s⁻².`,
    t`Marks: 1 for correctly plotted points (including the calculated point); 1 for a straight line of best fit; 1 for sensible scales and use of most of the grid.`,
    { diagram: axes({ xMin: 0, xMax: 60, yMin: 0, yMax: 3.0, xStep: 10, yStep: 0.5, xLabel: 'v² (m² s⁻²)', yLabel: 'F (N)', width: 380 }) }),
  part('d', t`Use the gradient of your line to calculate the mass of the rubber stopper.`, 2,
    t`About 0.025 kg (gradient ≈ 0.049 kg m⁻¹)`,
    t`\(F = \frac{mv^2}{r}\), so the gradient is \(\frac{m}{r}\): about \(\frac{2.45}{49.8} = 0.049\) kg m⁻¹, and \(m = 0.049 \times 0.50 = 0.025\) kg. Accept 0.023–0.027 kg. 1 mark for the gradient, 1 mark for the mass.`, { unit: 'kg' }),
  part('e', t`The string rubs against the top of the tube as the stopper moves. State whether this introduces a random or a systematic error, and give a reason.`, 1,
    t`Systematic: friction acts in the same way on every trial, so the tension on the stopper is consistently different from the hanging weight.`,
    t`The error shifts every result in the same direction, so repeating the trials would not reduce it.`),
], { diagram: stopper })

export const ITEMS = S.items
