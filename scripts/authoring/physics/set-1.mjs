// VCE Physics Unit 3 & 4 — Practice exam 1 (the free sample).
// Section A: 20 multiple choice. Section B: 15 questions, 100 marks.
// Every value is computed in checks/set1.py.
import { t, AOS, part, makeSet, axes, curve } from './phys.mjs'
import { drawing } from './draw.mjs'

const { MO, FI, EL, LM, IN } = AOS
const S = makeSet(1)

// ════════════════ Section A ════════════════

S.mc(MO, 'developing', t`A book rests on a horizontal table. According to Newton’s third law, the force that pairs with the gravitational force of Earth on the book is`,
  ['the normal force of the table on the book', 'the gravitational force of the book on Earth', 'the normal force of the book on the table', 'the weight of the table'], 'B',
  t`Newton’s third-law pairs act on two different objects and are the same type of force: “Earth pulls the book” pairs with “the book pulls Earth”. The normal force of the table on the book balances the book’s weight, but that is Newton’s first law (both forces act on the book), not a third-law pair — the most common error on this idea.`)

S.mc(MO, 'proficient', t`A ball is kicked from level ground with a speed of 20.0 m s⁻¹ at 30.0° above the horizontal. Ignoring air resistance, the ball is in the air for`,
  ['1.02 s', '1.77 s', '2.04 s', '3.53 s'], 'C',
  t`The vertical component is \(20.0\sin(30.0^\circ) = 10.0\) m s⁻¹. The time to the top is \(\frac{10.0}{9.81} = 1.02\) s and the flight is symmetrical, so the total time is 2.04 s. 1.02 s stops at the highest point; 3.53 s (and half of it, 1.77 s) uses the horizontal component \(20.0\cos(30.0^\circ)\).`)

S.mc(MO, 'proficient', t`A curve on a racetrack has a radius of 80.0 m and is banked at 12.0° to the horizontal. The speed at which a car can take the curve with no sideways friction is closest to`,
  ['4.12 m s⁻¹', '12.9 m s⁻¹', '28.0 m s⁻¹', '60.8 m s⁻¹'], 'B',
  t`With no friction, the horizontal component of the normal force provides the centripetal force: \(\tan(\theta) = \frac{v^2}{rg}\), so \(v = \sqrt{rg\tan(12.0^\circ)} = \sqrt{80.0 \times 9.81 \times 0.2126} = 12.9\) m s⁻¹. 28.0 m s⁻¹ leaves out \(\tan(\theta)\), 60.8 m s⁻¹ divides by it, and 4.12 m s⁻¹ leaves out \(g\).`)

S.mc(MO, 'proficient', t`A 2.0 kg trolley moving at 3.0 m s⁻¹ collides with a stationary 1.0 kg trolley. The trolleys stick together. The kinetic energy lost in the collision is`,
  ['0 J', '3.0 J', '6.0 J', '9.0 J'], 'B',
  t`Momentum is conserved: \(2.0 \times 3.0 = 3.0v\), so \(v = 2.0\) m s⁻¹. Kinetic energy before is \(\frac{1}{2}(2.0)(3.0)^2 = 9.0\) J and after is \(\frac{1}{2}(3.0)(2.0)^2 = 6.0\) J, so 3.0 J is transformed (to heat and sound). The collision is inelastic, so 0 J is wrong.`)

S.mc(MO, 'proficient', t`A spring with spring constant 200 N m⁻¹ is compressed by 0.10 m and used to launch a 0.050 kg ball along a smooth horizontal surface. The speed of the ball as it leaves the spring is`,
  ['4.47 m s⁻¹', '6.32 m s⁻¹', '8.94 m s⁻¹', '20.0 m s⁻¹'], 'B',
  t`The elastic potential energy becomes kinetic energy: \(\frac{1}{2}kx^2 = \frac{1}{2}mv^2\), so \(v = x\sqrt{\frac{k}{m}} = 0.10\sqrt{4000} = 6.32\) m s⁻¹. 4.47 m s⁻¹ and 8.94 m s⁻¹ drop the \(\frac{1}{2}\) from only one side; 20.0 m s⁻¹ uses \(x\) instead of \(x^2\).`)

S.mc(FI, 'proficient', t`A satellite orbits at an altitude of \(6.37 \times 10^6\) m above Earth’s surface. The strength of Earth’s gravitational field at the satellite is closest to`,
  ['2.45 N kg⁻¹', '4.91 N kg⁻¹', '9.81 N kg⁻¹', '19.6 N kg⁻¹'], 'A',
  t`The altitude equals Earth’s radius, so the satellite is \(2R_E\) from Earth’s centre. \(g = \frac{GM_E}{(2R_E)^2}\), a quarter of the surface value: \(\frac{9.81}{4} = 2.45\) N kg⁻¹. 4.91 N kg⁻¹ uses the inverse (not inverse-square) law.`)

S.mc(FI, 'proficient', t`A charge \(+Q\) and a charge \(+4Q\) are fixed 3.0 m apart. At a point P on the line between them, the electric field is zero. The distance of P from the \(+4Q\) charge is`,
  ['0.75 m', '1.0 m', '1.5 m', '2.0 m'], 'D',
  t`At P the fields are equal in magnitude: \(\frac{kQ}{x^2} = \frac{k(4Q)}{(3.0 - x)^2}\), where \(x\) is the distance from \(+Q\). Then \(3.0 - x = 2x\), so \(x = 1.0\) m, and P is 2.0 m from the \(+4Q\) charge. The null point is closer to the smaller charge. 1.0 m is the distance from \(+Q\).`)

S.mc(FI, 'proficient', t`An electron moves to the right across the page through a uniform magnetic field directed into the page. As it enters the field, the magnetic force on the electron is directed`,
  ['into the page', 'out of the page', 'towards the top of the page', 'towards the bottom of the page'], 'D',
  t`For a positive charge moving right in a field into the page, the right-hand rule gives a force towards the top of the page. The electron is negative, so the force is reversed: towards the bottom of the page. The force is always perpendicular to both \(v\) and \(B\), so it cannot be into or out of the page.`)

S.mc(FI, 'developing', t`Which one of the following statements about gravitational, electric and magnetic fields is correct?`,
  ['Electric field lines begin on positive charges and end on negative charges.', 'Gravitational forces can be attractive or repulsive.', 'An isolated magnetic pole produces a radial magnetic field.', 'A stationary charged particle in a uniform magnetic field experiences a force perpendicular to the field.'], 'A',
  t`Gravitational forces are only attractive; magnetic poles always come in pairs (no monopoles have been observed); and a magnetic field exerts no force on a stationary charge (\(F = qvB\) with \(v = 0\)).`)

S.mc(EL, 'proficient', t`An ideal transformer has 1200 turns on its primary coil and 60 turns on its secondary coil. The primary is connected to a 240 V RMS supply. The peak voltage across the secondary is closest to`,
  ['8.49 V', '12.0 V', '17.0 V', '339 V'], 'C',
  t`\(V_2 = 240 \times \frac{60}{1200} = 12.0\) V RMS, and \(V_{\text{peak}} = \sqrt{2} \times 12.0 = 17.0\) V. 12.0 V is the RMS value; 339 V is the primary peak.`)

S.mc(EL, 'proficient', t`The rate at which the coil of an AC generator rotates is doubled. The magnetic field and the coil are unchanged. Which one of the following gives the effect on the output?`,
  ['unchanged | doubled', 'doubled | unchanged', 'halved | doubled', 'doubled | doubled'], 'D',
  t`Doubling the rotation rate halves the time for each change of flux, so the peak EMF (\(\varepsilon = -N\frac{\Delta\Phi_B}{\Delta t}\)) doubles, and the number of cycles each second — the frequency — also doubles.`,
  { headers: ['Peak EMF', 'Frequency of the output'] })

S.mc(EL, 'proficient', t`A power station transmits 50 kW at 5000 V through transmission lines with a total resistance of 4.0 Ω. The power lost in the lines is`,
  ['40 W', '400 W', '4.0 kW', '6.25 MW'], 'B',
  t`\(I = \frac{P}{V} = \frac{50\,000}{5000} = 10\) A and \(P_{\text{loss}} = I^2R = 100 \times 4.0 = 400\) W. 6.25 MW uses \(\frac{V^2}{R}\) with the transmission voltage, which is not the voltage across the lines; 40 W is the voltage drop \(IR\) mistaken for a power.`)

S.mc(EL, 'developing', t`In a DC motor, the split-ring commutator`,
  ['reverses the direction of the current in the coil every half-turn, so the coil keeps turning in the same direction', 'keeps the current in the coil flowing in the same direction at all times', 'increases the magnetic field whenever the coil is parallel to it', 'stops the coil at the position where the net force on it is zero'], 'A',
  t`Without the commutator, the forces on the coil would reverse the rotation each half-turn and the coil would oscillate to rest. Reversing the current every half-turn keeps the torque in the same rotational direction.`)

S.mc(LM, 'proficient', t`Light of wavelength 600 nm passes through two slits 0.40 mm apart and falls on a screen 2.0 m away. The distance between adjacent bright bands on the screen is`,
  ['0.30 mm', '1.5 mm', '3.0 mm', '6.0 mm'], 'C',
  t`\(\Delta x = \frac{\lambda L}{d} = \frac{600 \times 10^{-9} \times 2.0}{0.40 \times 10^{-3}} = 3.0 \times 10^{-3}\) m. Converting the slit separation from millimetres is the usual source of error.`)

S.mc(LM, 'proficient', t`In a photoelectric experiment, the intensity of the light is increased while its frequency is kept constant (and above the threshold frequency). Which one of the following gives the effect?`,
  ['unchanged | increases', 'increases | increases', 'increases | unchanged', 'unchanged | unchanged'], 'A',
  t`Each photon still has energy \(hf\), so the maximum kinetic energy \(hf - \phi\) is unchanged. A more intense beam delivers more photons each second, so more photoelectrons are emitted and the photocurrent increases. The wave model wrongly predicts that the kinetic energy would increase with intensity.`,
  { headers: ['Maximum kinetic energy of photoelectrons', 'Photocurrent'] })

S.mc(LM, 'proficient', t`An electron is accelerated from rest through a potential difference of 150 V. Its de Broglie wavelength is closest to`,
  ['4.01 × 10⁻²⁰ m', '7.09 × 10⁻¹¹ m', '1.00 × 10⁻¹⁰ m', '8.28 × 10⁻⁹ m'], 'C',
  t`\(E_k = qV\), so \(p = \sqrt{2m_eE_k} = \sqrt{2 \times 9.11 \times 10^{-31} \times 1.60 \times 10^{-19} \times 150}\) and \(\lambda = \frac{h}{p} = 1.00 \times 10^{-10}\) m. 4.01 × 10⁻²⁰ m uses 150 J instead of 150 eV; 8.28 × 10⁻⁹ m treats the electron as a photon (\(\lambda = \frac{hc}{E}\)).`)

S.mc(LM, 'proficient', t`The energy levels of hydrogen are \(E_n = -\frac{13.6}{n^2}\) eV. The wavelength of the photon emitted when an electron moves from the \(n = 3\) level to the \(n = 1\) level is closest to`,
  ['91.3 nm', '97.4 nm', '103 nm', '122 nm'], 'C',
  t`\(\Delta E = 13.6\left(1 - \frac{1}{9}\right) = 12.09\) eV and \(\lambda = \frac{hc}{\Delta E} = \frac{4.14 \times 10^{-15} \times 3.00 \times 10^8}{12.09} = 1.03 \times 10^{-7}\) m. 122 nm is the \(n = 2 \to 1\) line, 97.4 nm the \(n = 4 \to 1\) line and 91.3 nm the ionisation energy (13.6 eV).`)

S.mc(LM, 'proficient', t`Muons have a lifetime of 2.2 μs in their own frame of reference. For muons travelling at \(0.98c\), the lifetime measured by an observer on Earth is closest to`,
  ['0.44 μs', '2.2 μs', '5.0 μs', '11 μs'], 'D',
  t`\(\gamma = \frac{1}{\sqrt{1 - 0.98^2}} = 5.03\), and the dilated time is \(t = t_0\gamma = 2.2 \times 5.03 = 11\) μs. 0.44 μs divides by \(\gamma\); 5.0 is \(\gamma\) itself.`)

S.mc(LM, 'developing', t`Which one of the following is one of Einstein’s two postulates of special relativity?`,
  ['The laws of physics are different in frames of reference moving at different constant velocities.', 'Time passes at the same rate for all observers.', 'The speed of light depends on the speed of its source.', 'The speed of light in a vacuum is the same for all observers in inertial frames of reference.'], 'D',
  t`The two postulates are that the laws of physics are the same in all inertial frames, and that the speed of light in a vacuum is the same for all inertial observers. A contradicts the first; B is the Newtonian assumption that relativity overturns.`)

S.mc(IN, 'developing', t`A student measures the period of a swinging pendulum by timing 10 complete oscillations and dividing by 10, rather than timing a single oscillation. The main reason for this is to`,
  ['reduce the effect of the uncertainty in starting and stopping the stopwatch on the period', 'remove any systematic error from the stopwatch', 'increase the precision of the length measurement', 'allow for the period changing during the first few swings'], 'A',
  t`The reaction-time uncertainty (about ±0.2 s) applies once to the whole timing, so dividing by 10 reduces its effect on the period tenfold. A systematic error (for example, a stopwatch that runs slow) is not removed by repetition.`)

// ════════════════ Section B ════════════════

const pulley = drawing(320, 170)
pulley.rect(20, 70, 220, 10, { fill: 'light' }).line(32, 80, 32, 158).line(228, 80, 228, 158)
  .block(95, 40, 60, 30, '3.0 kg').line(155, 55, 250, 55).line(240, 70, 250, 66).pulley(250, 66, 11)
  .line(261, 66, 261, 108).block(246, 108, 30, 26, '1.0 kg').ground(10, 310, 158)
S.q(MO, 'proficient', t`A 3.0 kg block on a horizontal table is connected by a light string passing over a pulley to a 1.0 kg block that hangs freely, as shown in Figure 1. The system is released from rest. Ignore friction and the mass of the pulley.`, [
  part('a', t`Show that the magnitude of the acceleration of the blocks is 2.45 m s⁻².`, 2,
    t`\(a = \dfrac{F_{\text{net}}}{m} = \dfrac{1.0 \times 9.81}{3.0 + 1.0} = 2.45\) m s⁻²`,
    t`Treat the blocks as one system: the only unbalanced external force is the weight of the hanging block, \(1.0 \times 9.81 = 9.81\) N, acting on the total mass of 4.0 kg. 1 mark for identifying the net force, 1 mark for dividing by the total mass.`),
  part('b', t`Calculate the tension in the string.`, 2,
    t`7.36 N`,
    t`The tension is the only horizontal force on the 3.0 kg block: \(T = ma = 3.0 \times 2.4525 = 7.36\) N. (Check with the hanging block: \(9.81 - T = 1.0 \times 2.4525\).) 1 mark for the method, 1 mark for the answer. Common error: taking the tension to be the weight of the hanging block, 9.81 N.`, { unit: 'N' }),
  part('c', t`Explain why the tension in the string is less than the weight of the hanging block.`, 1,
    t`The hanging block accelerates downwards, so the net force on it is downwards: its weight must be larger than the upward tension.`,
    t`If the tension equalled the weight, the net force on the hanging block would be zero and it would not accelerate.`),
], { diagram: pulley.done('Figure 1') })

const wall = drawing(340, 132)
wall.ground(10, 330, 100).rect(280, 76, 10, 24, { fill: 'mid' }).dot(30, 100, 3)
  .arrow(30, 100, 30 + 60 * Math.cos((35 * Math.PI) / 180), 100 - 60 * Math.sin((35 * Math.PI) / 180))
  .text(88, 50, '18.0 m s⁻¹', { anchor: 'start' }).angle(30, 100, 26, 0, 35, '35°')
  .dim(30, 114, 280, 114, '25.0 m', { offset: 10 }).text(296, 90, '2.40 m', { anchor: 'start', size: 8.5 })
S.q(MO, 'proficient', t`A soccer ball is kicked from ground level with a speed of 18.0 m s⁻¹ at 35.0° above the horizontal, towards a wall 2.40 m high that is 25.0 m away, as shown in Figure 2. Ignore air resistance and the size of the ball.`, [
  part('a', t`Calculate the horizontal and vertical components of the ball’s initial velocity.`, 1,
    t`Horizontal 14.7 m s⁻¹; vertical 10.3 m s⁻¹`,
    t`\(18.0\cos(35.0^\circ) = 14.74\) m s⁻¹ and \(18.0\sin(35.0^\circ) = 10.32\) m s⁻¹.`),
  part('b', t`Determine whether the ball passes over the wall. Show your working.`, 3,
    t`It reaches the wall after 1.70 s at a height of 3.40 m, so it clears the 2.40 m wall by about 1.0 m.`,
    t`Horizontal motion is uniform: \(t = \frac{25.0}{14.74} = 1.696\) s. Vertically, \(s = ut + \frac{1}{2}at^2 = 10.32 \times 1.696 - \frac{1}{2} \times 9.81 \times 1.696^2 = 3.40\) m. Marks: 1 for the time to reach the wall; 1 for the height; 1 for the comparison and conclusion. Common error: using the full 18.0 m s⁻¹ as the horizontal speed.`),
  part('c', t`Calculate the maximum height reached by the ball.`, 2,
    t`5.43 m`,
    t`At the highest point the vertical velocity is zero: \(v^2 = u^2 + 2as\) gives \(0 = 10.32^2 - 2 \times 9.81 \times s\), so \(s = 5.43\) m. 1 mark for the method, 1 mark for the answer.`, { unit: 'm' }),
  part('d', t`State the ball’s speed at its highest point.`, 1,
    t`14.7 m s⁻¹`,
    t`Only the vertical component is zero at the top; the horizontal component is unchanged throughout the flight.`, { unit: 'm s⁻¹' }),
], { diagram: wall.done('Figure 2') })

const loop = drawing(230, 154)
loop.circle(115, 82, 62, { w: 1.6 }).rect(103, 22, 24, 11, { fill: 'mid' }).arrow(100, 14, 72, 14).text(86, 10, 'v', { italic: true })
  .line(115, 82, 158.8, 125.8, { dash: true }).text(152, 100, '8.0 m', { size: 8.5 }).dot(115, 82, 1.8).ground(20, 210, 144)
S.q(MO, 'proficient', t`A roller-coaster car of mass 400 kg travels around a vertical circular loop of radius 8.0 m, as shown in Figure 3. At the top of the loop the car is upside down and moving at 12 m s⁻¹.`, [
  part('a', t`Calculate the magnitude and direction of the net force on the car at the top of the loop.`, 2,
    t`7200 N, directed down (towards the centre of the loop)`,
    t`\(F_{\text{net}} = \frac{mv^2}{r} = \frac{400 \times 12^2}{8.0} = 7200\) N, towards the centre, which is vertically down at the top. 1 mark for the magnitude, 1 mark for the direction.`),
  part('b', t`Calculate the magnitude of the normal force exerted on the car by the track at the top of the loop.`, 2,
    t`3276 N (about 3.3 × 10³ N), downwards`,
    t`At the top both the weight and the normal force act downwards: \(N + mg = \frac{mv^2}{r}\), so \(N = 7200 - 400 \times 9.81 = 3276\) N. 1 mark for the force equation, 1 mark for the answer. Common error: subtracting the weight the other way, as if the car were at the bottom.`, { unit: 'N' }),
  part('c', t`Calculate the minimum speed at which the car can travel over the top of the loop without losing contact with the track.`, 2,
    t`8.86 m s⁻¹`,
    t`At the minimum speed the normal force is zero and gravity alone provides the centripetal force: \(mg = \frac{mv^2}{r}\), so \(v = \sqrt{gr} = \sqrt{9.81 \times 8.0} = 8.86\) m s⁻¹. 1 mark for setting \(N = 0\), 1 mark for the value.`, { unit: 'm s⁻¹' }),
], { diagram: loop.done('Figure 3') })

S.q(MO, 'proficient', t`In a crash test, a 1200 kg car travelling at 15 m s⁻¹ hits a rigid barrier and comes to rest in 0.080 s.`, [
  part('a', t`Calculate the magnitude of the impulse on the car.`, 2,
    t`1.8 × 10⁴ N s`,
    t`Impulse \(= m\Delta v = 1200 \times (0 - 15) = -18\,000\) N s; its magnitude is 18 000 N s, directed opposite to the car’s initial motion. 1 mark for the change in momentum, 1 mark for the value.`, { unit: 'N s' }),
  part('b', t`Calculate the magnitude of the average force exerted on the car by the barrier.`, 1,
    t`2.25 × 10⁵ N`,
    t`\(F = \frac{m\Delta v}{\Delta t} = \frac{18\,000}{0.080} = 225\,000\) N.`, { unit: 'N' }),
  part('c', t`Car designers build crumple zones into the front of cars. Using physics principles, explain how a crumple zone reduces the average force on the occupants in a collision.`, 2,
    t`The change in momentum (impulse) is fixed by the collision; by crumpling, the car takes longer to stop, and since \(F\Delta t = m\Delta v\), a longer time means a smaller average force.`,
    t`1 mark for recognising that the impulse (change in momentum) is the same either way, 1 mark for linking the increased stopping time to the reduced force. Answers that say the crumple zone “absorbs the force” do not earn the second mark without the time argument.`),
])

S.q(FI, 'advanced', t`A navigation satellite moves in a circular orbit around Earth with a period of 12.0 hours.`, [
  part('a', t`Show that the radius of the satellite’s orbit is approximately \(2.66 \times 10^7\) m.`, 3,
    t`\(r = \sqrt[3]{\dfrac{GM_ET^2}{4\pi^2}} = 2.66 \times 10^7\) m`,
    t`Gravity provides the centripetal force: \(\frac{GM_Em}{r^2} = \frac{4\pi^2 mr}{T^2}\), so \(r^3 = \frac{GM_ET^2}{4\pi^2} = \frac{6.67 \times 10^{-11} \times 5.97 \times 10^{24} \times (43\,200)^2}{4\pi^2}\), giving \(r = 2.66 \times 10^7\) m. Marks: 1 for equating gravitational and centripetal force; 1 for the period in seconds (43 200 s); 1 for the substitution. Common error: using the period in hours.`),
  part('b', t`Calculate the orbital speed of the satellite.`, 2,
    t`3.87 × 10³ m s⁻¹`,
    t`\(v = \frac{2\pi r}{T} = \frac{2\pi \times 2.66 \times 10^7}{43\,200} = 3.87 \times 10^3\) m s⁻¹ (equivalently \(\sqrt{\frac{GM_E}{r}}\)). 1 mark for the method, 1 mark for the value.`, { unit: 'm s⁻¹' }),
  part('c', t`An astronaut on a space station in orbit feels weightless. Explain why, even though Earth’s gravitational field at the station is not zero.`, 2,
    t`The astronaut and the station are both in free fall, accelerating towards Earth at the same rate, so the station exerts no normal force on the astronaut.`,
    t`The sensation of weight comes from a normal (contact) force. In orbit the only force on both the astronaut and the station is gravity, so they accelerate together and nothing pushes on the astronaut: apparent weightlessness. 1 mark for “both in free fall with the same acceleration”, 1 mark for “no normal force”.`),
])

const plates = drawing(270, 110)
plates.plates(40, 28, 160, 52, '−', '+').dot(120, 36, 2.6).text(128, 42, 'e⁻', { anchor: 'start', size: 8.5 }).dim(222, 28, 222, 80, '2.0 cm', { offset: -18 })
S.q(FI, 'proficient', t`Two parallel metal plates 2.0 cm apart are connected to a 500 V supply, as shown in Figure 4. An electron is released from rest close to the negative plate.`, [
  part('a', t`Calculate the magnitude of the electric field between the plates.`, 1,
    t`2.5 × 10⁴ V m⁻¹`,
    t`\(E = \frac{V}{d} = \frac{500}{0.020} = 25\,000\) V m⁻¹ (equivalently N C⁻¹).`, { unit: 'V m⁻¹' }),
  part('b', t`Calculate the magnitude of the electric force on the electron.`, 1,
    t`4.0 × 10⁻¹⁵ N`,
    t`\(F = qE = 1.60 \times 10^{-19} \times 25\,000 = 4.0 \times 10^{-15}\) N.`, { unit: 'N' }),
  part('c', t`Calculate the speed of the electron when it reaches the positive plate.`, 3,
    t`1.33 × 10⁷ m s⁻¹`,
    t`The work done by the field becomes kinetic energy: \(\frac{1}{2}mv^2 = qV\), so \(v = \sqrt{\frac{2qV}{m}} = \sqrt{\frac{2 \times 1.60 \times 10^{-19} \times 500}{9.11 \times 10^{-31}}} = 1.33 \times 10^7\) m s⁻¹. Marks: 1 for \(qV = \frac{1}{2}mv^2\); 1 for the substitution; 1 for the answer. (Relativistic effects are negligible at this speed.)`, { unit: 'm s⁻¹' }),
], { diagram: plates.done('Figure 4') })

const spec = drawing(300, 180)
spec.rect(80, 18, 200, 152, { fill: 'light', noStroke: true }).line(80, 18, 80, 170, { dash: true })
  .text(200, 165, 'region of uniform magnetic field', { size: 8.5 })
  .line(12, 150, 80, 150, { arrow: 'end', w: 1.2 }).text(14, 142, 'ions', { anchor: 'start', size: 8.5 })
  .arc(80, 90, 60, -90, 90, { arrow: 'end' }).rect(56, 24, 18, 12, { fill: 'dark' }).text(52, 33, 'detector', { anchor: 'end', size: 8.5 })
  .text(95, 63, 'r', { italic: true }).line(80, 90, 122.4, 47.6, { dash: true })
S.q(FI, 'advanced', t`In a mass spectrometer, singly charged positive ions (charge \(+1.60 \times 10^{-19}\) C) enter a uniform magnetic field of strength 0.50 T at a speed of \(2.0 \times 10^5\) m s⁻¹. They travel in a semicircle and strike a detector, as shown in Figure 5.`, [
  part('a', t`State the direction of the magnetic field in the region shown in Figure 5.`, 1,
    t`Into the page`,
    t`The ions move right as they enter and are pushed towards the top of the page (towards the centre of their circle). For a positive charge, the right-hand rule then gives a field into the page.`),
  part('b', t`The radius of the ions’ path is 8.3 cm. Calculate the mass of one ion.`, 2,
    t`3.32 × 10⁻²⁶ kg`,
    t`\(r = \frac{mv}{qB}\), so \(m = \frac{qBr}{v} = \frac{1.60 \times 10^{-19} \times 0.50 \times 0.083}{2.0 \times 10^5} = 3.32 \times 10^{-26}\) kg (about 20 atomic mass units — neon-20). 1 mark for rearranging, 1 mark for the value with the radius in metres.`, { unit: 'kg' }),
  part('c', t`Explain why the magnetic field does not change the speed of the ions.`, 2,
    t`The magnetic force is always perpendicular to the velocity, so it does no work on the ions and their kinetic energy (and speed) stays constant.`,
    t`1 mark for “force perpendicular to velocity”, 1 mark for “no work done, so kinetic energy is unchanged”.`),
  part('d', t`Ions of a heavier isotope, with the same charge and speed, are also in the beam. Describe how their path differs.`, 1,
    t`They follow a semicircle of larger radius and strike the detector further from the entry point.`,
    t`\(r = \frac{mv}{qB}\) is proportional to the mass.`),
], { diagram: spec.done('Figure 5') })

const motor = drawing(300, 175)
motor.magnet(15, 40, 40, 90, 'N').magnet(245, 40, 40, 90, 'S').fieldLines(58, 42, 184, 86, 'right', 4)
  .poly([[95, 45], [205, 45], [205, 125], [95, 125]], { closed: true, w: 1.8 }).text(92, 42, 'J', { anchor: 'end', bold: true }).text(208, 42, 'K', { anchor: 'start', bold: true })
  .text(208, 136, 'L', { anchor: 'start', bold: true }).text(92, 136, 'M', { anchor: 'end', bold: true })
  .arrow(135, 45, 165, 45, { w: 1.4 }).line(150, 25, 150, 170, { dash: true, grey: true }).text(156, 165, 'axis of rotation', { anchor: 'start', size: 8 })
S.q(EL, 'proficient', t`Figure 6 shows the coil of a simple DC motor between the poles of a magnet. The square coil JKLM has 50 turns and sides of length 4.0 cm, and lies in the plane of the page in a uniform magnetic field of 0.20 T directed from N to S. The coil can rotate about the axis shown. A current of 1.5 A flows through the coil in the direction J → K → L → M.`, [
  part('a', t`Calculate the magnitude of the magnetic force on side KL.`, 2,
    t`0.60 N`,
    t`\(F = nIlB = 50 \times 1.5 \times 0.040 \times 0.20 = 0.60\) N. 1 mark for the substitution with \(n = 50\) and \(l\) in metres, 1 mark for the value. Common error: leaving out the number of turns.`, { unit: 'N' }),
  part('b', t`State the magnitude of the magnetic force on side JK, and explain your answer.`, 2,
    t`Zero: the current in JK is parallel to the magnetic field.`,
    t`The magnetic force on a conductor depends on the component of the field perpendicular to the current; JK runs from left to right, the same direction as the field. 1 mark for zero, 1 mark for the reason.`),
  part('c', t`State whether side KL begins to move into or out of the page, and explain how this makes the coil rotate.`, 2,
    t`Out of the page. Side MJ is pushed into the page, so the two forces form a couple that turns the coil about its axis.`,
    t`In KL the current flows down the page and the field points right; the right-hand rule gives a force out of the page. The current in MJ is in the opposite direction, so its force is into the page. Equal and opposite forces on opposite sides of the axis produce a turning effect even though the net force on the coil is zero. 1 mark for the direction, 1 mark for the explanation.`),
  part('d', t`Explain the role of the split-ring commutator in keeping the coil rotating in one direction.`, 2,
    t`Every half-turn it reverses the current in the coil, so the forces on the sides reverse at the right moment and keep turning the coil the same way.`,
    t`Once the plane of the coil passes perpendicular to the field, the side that was pushed out of the page is on the other side of the axis; without reversing the current, the forces would turn the coil back. 1 mark for “reverses the current each half-turn”, 1 mark for linking this to continuous rotation in one direction.`),
], { diagram: motor.done('Figure 6') })

S.q(EL, 'advanced', t`A simple AC generator has a coil of 100 turns and area 0.010 m². It rotates at 50 revolutions per second in a uniform magnetic field of 0.30 T. At time \(t = 0\) the plane of the coil is perpendicular to the magnetic field.`, [
  part('a', t`Calculate the maximum magnetic flux through the coil.`, 1,
    t`3.0 × 10⁻³ Wb`,
    t`\(\Phi_B = B_\perp A = 0.30 \times 0.010 = 3.0 \times 10^{-3}\) Wb, when the plane of the coil is perpendicular to the field.`, { unit: 'Wb' }),
  part('b', t`Calculate the average EMF induced in the coil during the first quarter-turn.`, 2,
    t`60 V`,
    t`In a quarter-turn (\(\frac{1}{4} \times \frac{1}{50} = 0.0050\) s) the flux falls from \(3.0 \times 10^{-3}\) Wb to zero: \(\varepsilon = N\frac{\Delta\Phi_B}{\Delta t} = 100 \times \frac{3.0 \times 10^{-3}}{0.0050} = 60\) V. 1 mark for the time of a quarter-turn, 1 mark for the EMF.`, { unit: 'V' }),
  part('c', t`The peak EMF is 94 V. On the axes below, sketch the EMF produced by the generator for the first two revolutions, starting at \(t = 0\). Label the peak values.`, 3,
    t`A sine curve starting at zero, with peaks of ±94 V and a period of 20 ms (two complete cycles by 40 ms).`,
    t`At \(t = 0\) the flux is a maximum but is changing at the slowest rate, so the EMF is zero and the graph is a sine (not cosine) curve. Marks: 1 for the sine shape starting at zero; 1 for the period of 20 ms; 1 for peaks of ±94 V.`,
    { diagram: axes({ xMin: 0, xMax: 42, yMin: -120, yMax: 120, xStep: 5, yStep: 20, xLabel: 't (ms)', yLabel: 'EMF (V)', width: 380 }) }),
  part('d', t`The slip rings of the generator are replaced by a split-ring commutator. Describe how the output changes.`, 2,
    t`The output becomes DC: every negative half-cycle is inverted, giving a fluctuating EMF that is always in one direction, with the same peak and 10 ms between peaks.`,
    t`1 mark for “DC / one direction (rectified)”, 1 mark for keeping the peak value and the correct timing. Common error: describing a steady, constant DC voltage.`),
])

const grid = drawing(360, 110)
grid.circle(28, 55, 15, { fill: 'white' }).text(28, 59, 'G', { bold: true }).text(28, 88, '690 V', { size: 8 })
  .line(43, 55, 70, 55).rect(70, 32, 48, 46, { fill: 'white' }).text(94, 52, 'T₁', { bold: true }).text(94, 66, '1 : 20', { size: 8 })
  .resistor(118, 40, 250, 40, '2.5 Ω').resistor(118, 70, 250, 70, '2.5 Ω').text(184, 100, 'transmission lines', { size: 8.5 })
  .rect(250, 32, 48, 46, { fill: 'white' }).text(274, 52, 'T₂', { bold: true }).text(274, 66, 'step-down', { size: 7.5 })
  .line(298, 55, 312, 55).rect(312, 38, 42, 34, { fill: 'light' }).text(333, 59, 'town', { size: 8.5 })
S.q(EL, 'advanced', t`A wind farm generator produces 400 kW of power at 690 V RMS. A step-up transformer T₁ with a turns ratio of 1 : 20 raises the voltage for transmission along lines with a total resistance of 5.0 Ω to a step-down transformer T₂ in a nearby town, as shown in Figure 7. Treat the transformers as ideal.`, [
  part('a', t`Calculate the RMS current in the transmission lines.`, 2,
    t`29.0 A`,
    t`The transmission voltage is \(690 \times 20 = 13\,800\) V, so \(I = \frac{P}{V} = \frac{400\,000}{13\,800} = 29.0\) A. 1 mark for the stepped-up voltage, 1 mark for the current.`, { unit: 'A' }),
  part('b', t`Calculate the power lost in the transmission lines.`, 2,
    t`4.20 × 10³ W`,
    t`\(P_{\text{loss}} = I^2R = 29.0^2 \times 5.0 = 4.20 \times 10^3\) W — about 1% of the power generated. 1 mark for the formula with the line current, 1 mark for the value.`, { unit: 'W' }),
  part('c', t`Calculate the voltage at the input of T₂.`, 1,
    t`1.37 × 10⁴ V (13 655 V)`,
    t`\(V_{\text{drop}} = IR = 29.0 \times 5.0 = 145\) V, so \(13\,800 - 145 = 13\,655\) V.`, { unit: 'V' }),
  part('d', t`Without the transformers, the 400 kW would be sent at 690 V along the same lines. Use a calculation to explain why this would not work.`, 3,
    t`The current would be 580 A, giving a loss of \(I^2R = 1.68 \times 10^6\) W — more than the 400 kW generated — so no useful power could reach the town.`,
    t`\(I = \frac{400\,000}{690} = 580\) A, \(P_{\text{loss}} = 580^2 \times 5.0 = 1.68 \times 10^6\) W (equivalently, the voltage drop \(IR = 2900\) V exceeds the 690 V supplied). Marks: 1 for the current; 1 for the loss; 1 for the conclusion that stepping up the voltage (reducing the current) is essential.`),
], { diagram: grid.done('Figure 7') })

const slits = drawing(330, 125)
slits.rect(8, 55, 44, 20, { fill: 'dark' }).text(30, 90, 'laser', { size: 8.5 }).line(52, 65, 110, 65, { arrow: 'end' })
  .slits(112, 12, 118, [59, 71], 2.5).text(112, 8, 'double slit', { size: 8 })
  .line(292, 12, 292, 118, { w: 2.2 }).text(300, 16, 'screen', { anchor: 'start', size: 8 })
  .dim(112, 108, 292, 108, '2.0 m', { offset: -8 })
S.q(LM, 'proficient', t`Green laser light of wavelength 532 nm passes through two narrow slits 0.25 mm apart. An interference pattern of bright and dark bands forms on a screen 2.0 m away, as shown in Figure 8.`, [
  part('a', t`Calculate the distance between adjacent bright bands on the screen.`, 2,
    t`4.3 × 10⁻³ m (4.26 mm)`,
    t`\(\Delta x = \frac{\lambda L}{d} = \frac{532 \times 10^{-9} \times 2.0}{0.25 \times 10^{-3}} = 4.26 \times 10^{-3}\) m. 1 mark for the substitution with consistent units, 1 mark for the value.`, { unit: 'm' }),
  part('b', t`Calculate the path difference between the light from the two slits at the third dark band from the centre of the pattern.`, 2,
    t`1.33 × 10⁻⁶ m`,
    t`Dark bands have a path difference of \(\left(n + \frac{1}{2}\right)\lambda\); the first is at \(\frac{1}{2}\lambda\), so the third is at \(\frac{5}{2}\lambda = 2.5 \times 532 \times 10^{-9} = 1.33 \times 10^{-6}\) m. 1 mark for \(2.5\lambda\), 1 mark for the value. Common error: using \(3.5\lambda\) (counting the central band as dark).`, { unit: 'm' }),
  part('c', t`Explain how this pattern provides evidence for the wave model of light.`, 2,
    t`Bright and dark bands can only be explained by waves from the two slits superposing: in phase (constructive interference) at bright bands and half a wavelength out of phase (destructive interference) at dark bands. A particle model predicts two bright strips.`,
    t`1 mark for linking the bands to constructive and destructive interference, 1 mark for noting that particles would not cancel to produce dark bands.`),
  part('d', t`The green laser is replaced by a red laser. State the effect on the pattern.`, 1,
    t`The bands spread further apart.`,
    t`Red light has a longer wavelength, and \(\Delta x\) is proportional to \(\lambda\).`),
], { diagram: slits.done('Figure 8') })

const peFit = x => 4.14 * x / 10 - 2.277  // Ek (eV) against f in units of 10^14 Hz
S.q(LM, 'advanced', t`In a photoelectric experiment, light of different frequencies falls on a metal surface and the maximum kinetic energy of the emitted photoelectrons is measured. The results are shown in Figure 9.`, [
  part('a', t`State the threshold frequency of the metal.`, 1,
    t`5.5 × 10¹⁴ Hz`,
    t`The horizontal intercept: below this frequency no photoelectrons are emitted.`, { unit: 'Hz' }),
  part('b', t`Calculate the work function of the metal, in electronvolts.`, 2,
    t`2.28 eV`,
    t`\(\phi = hf_0 = 4.14 \times 10^{-15} \times 5.5 \times 10^{14} = 2.28\) eV (the magnitude of the vertical intercept if the line is extended). 1 mark for \(\phi = hf_0\), 1 mark for the value.`, { unit: 'eV' }),
  part('c', t`State what the gradient of the graph represents.`, 1,
    t`Planck’s constant, \(h\) (about 4.1 × 10⁻¹⁵ eV s)`,
    t`\(E_{k\,\text{max}} = hf - \phi\) is a straight line of gradient \(h\).`),
  part('d', t`Calculate the maximum speed of the photoelectrons when the light has a frequency of \(7.5 \times 10^{14}\) Hz.`, 2,
    t`5.4 × 10⁵ m s⁻¹`,
    t`\(E_{k\,\text{max}} = 4.14 \times 10^{-15} \times 7.5 \times 10^{14} - 2.28 = 0.828\) eV \(= 1.32 \times 10^{-19}\) J, so \(v = \sqrt{\frac{2E_k}{m_e}} = 5.4 \times 10^5\) m s⁻¹. 1 mark for the kinetic energy in joules, 1 mark for the speed.`, { unit: 'm s⁻¹' }),
  part('e', t`Very bright light of frequency \(4.0 \times 10^{14}\) Hz shines on the metal. Explain why no photoelectrons are emitted.`, 1,
    t`Each photon has energy \(hf = 1.66\) eV, less than the 2.28 eV work function; one photon interacts with one electron, so brightness (more photons) does not help.`,
    t`The key idea is the one-photon-one-electron interaction: the energy of an individual photon, not the intensity, decides whether an electron can escape.`),
], { diagram: { kind: 'function_graph', xMin: 0, xMax: 10.5, yMin: -0.5, yMax: 2.5, xStep: 1, yStep: 0.5, xLabel: 'f (× 10¹⁴ Hz)', yLabel: 'Ek max (eV)', width: 330, grid: true, curves: [{ points: curve(peFit, 5.5, 10, 20) }], points: [{ x: 10, y: 1.863 }], labels: [{ x: 10, y: 1.863, text: '(10.0, 1.86)', at: 'nw' }], caption: 'Figure 9' } })

S.q(LM, 'proficient', t`In the Davisson–Germer experiment, electrons accelerated from rest through 54 V were diffracted by a nickel crystal.`, [
  part('a', t`Show that the de Broglie wavelength of the electrons is \(1.67 \times 10^{-10}\) m.`, 2,
    t`\(\lambda = \dfrac{h}{\sqrt{2m_eqV}} = 1.67 \times 10^{-10}\) m`,
    t`\(E_k = qV = 1.60 \times 10^{-19} \times 54 = 8.64 \times 10^{-18}\) J; \(p = \sqrt{2m_eE_k} = 3.97 \times 10^{-24}\) kg m s⁻¹; \(\lambda = \frac{h}{p} = 1.67 \times 10^{-10}\) m. 1 mark for the momentum, 1 mark for the wavelength.`),
  part('b', t`X-rays produce the same diffraction pattern with the same crystal. Calculate the energy of one X-ray photon, in keV.`, 2,
    t`7.4 keV`,
    t`The same pattern requires the same wavelength: \(E = \frac{hc}{\lambda} = \frac{4.14 \times 10^{-15} \times 3.00 \times 10^8}{1.67 \times 10^{-10}} = 7.43 \times 10^3\) eV. 1 mark for equal wavelengths, 1 mark for the energy.`, { unit: 'keV' }),
  part('c', t`Explain why an electron and a photon with the same wavelength produce the same diffraction pattern.`, 1,
    t`Diffraction depends only on the wavelength compared with the spacing of the atoms; equal wavelengths spread by the same amount.`,
    t`This is the evidence that electrons have a wave-like nature, with wavelength \(\lambda = \frac{h}{p}\).`),
])

S.q(LM, 'advanced', t`A spacecraft travels at a constant speed of \(0.90c\) from Earth to a star that is 12 light-years from Earth, as measured by observers on Earth.`, [
  part('a', t`Calculate the time taken for the journey according to observers on Earth.`, 1,
    t`13.3 years`,
    t`\(t = \frac{12\ \text{ly}}{0.90c} = 13.3\) years.`, { unit: 'years' }),
  part('b', t`Calculate the time taken for the journey according to the crew.`, 2,
    t`5.81 years`,
    t`\(\gamma = \frac{1}{\sqrt{1 - 0.90^2}} = 2.29\). The crew’s clock is present at both events, so it measures the proper time: \(t_0 = \frac{t}{\gamma} = \frac{13.3}{2.29} = 5.81\) years. 1 mark for \(\gamma\), 1 mark for the time.`, { unit: 'years' }),
  part('c', t`Calculate the distance between Earth and the star as measured by the crew.`, 2,
    t`5.23 light-years`,
    t`The proper length (12 ly) is measured in the Earth–star frame; the crew measure a contracted length \(L = \frac{L_0}{\gamma} = \frac{12}{2.29} = 5.23\) ly. (Check: \(\frac{5.23}{0.90} = 5.81\) years.) 1 mark for identifying the proper length, 1 mark for the value.`, { unit: 'light-years' }),
  part('d', t`Explain which observers measure the proper time for the journey.`, 1,
    t`The crew: the departure from Earth and the arrival at the star happen at the same place in the spacecraft’s frame.`,
    t`Proper time is measured by a clock present at both events.`),
])

const balAxes = axes({ xMin: 0, xMax: 3.0, yMin: 0, yMax: 35, xStep: 0.5, yStep: 5, xLabel: 'I (A)', yLabel: 'F (mN)', width: 380 })
S.q(IN, 'advanced', t`Students investigate the force on a current-carrying wire. A straight horizontal wire of length 5.0 cm runs between the poles of a magnet that sits on an electronic balance. When a current flows, the balance reading changes, and the students convert the change in mass \(\Delta m\) to a force \(F = \Delta m \times g\). Their results are shown in Table 1.`, [
  part('a', t`Identify the independent variable, the dependent variable and one variable that must be controlled.`, 2,
    t`Independent: current \(I\). Dependent: force \(F\) (the balance reading). Controlled: e.g. the length of wire in the field, the magnet (field strength), or keeping the wire perpendicular to the field.`,
    t`1 mark for the independent and dependent variables, 1 mark for a valid controlled variable.`),
  part('b', t`Calculate the missing value of \(F\), in mN.`, 1,
    t`11.8 mN`,
    t`\(F = 1.20 \times 10^{-3} \times 9.81 = 1.18 \times 10^{-2}\) N.`, { unit: 'mN' }),
  part('c', t`On the axes below, plot \(F\) against \(I\) and draw a line of best fit.`, 3,
    t`Five points lying close to a straight line through (or very near) the origin, rising to about 30 mN at 2.5 A.`,
    t`Marks: 1 for correctly plotted points; 1 for a single straight line of best fit (not joined dot to dot); 1 for the line passing close to the origin, as \(F = nIlB\) predicts.`,
    { diagram: balAxes }),
  part('d', t`Use the gradient of your line to calculate the strength of the magnetic field.`, 2,
    t`About 0.24 T (gradient ≈ 0.012 N A⁻¹)`,
    t`Gradient \(= \frac{\Delta F}{\Delta I} \approx \frac{0.0299}{2.50} = 0.0120\) N A⁻¹ \(= lB\) (with \(n = 1\)), so \(B = \frac{0.0120}{0.050} = 0.24\) T. Accept 0.23–0.25 T from a sensible gradient. 1 mark for the gradient with units, 1 mark for \(B\).`),
  part('e', t`The students suspect the magnet’s poles do not cover the full 5.0 cm of wire. State the type of error this would introduce and its effect on their value of \(B\).`, 2,
    t`A systematic error: the effective length is less than 5.0 cm, so dividing by 5.0 cm gives a value of \(B\) that is too small.`,
    t`1 mark for “systematic”, 1 mark for the direction of the effect (underestimate of \(B\)). Repeating the trials would not reduce it.`),
], { diagram: { kind: 'data_table', title: 'Table 1', columns: ['I (A)', 'Δm (g)', 'F (mN)'], rows: [['0.50', '0.62', '6.08'], ['1.00', '1.20', ''], ['1.50', '1.85', '18.15'], ['2.00', '2.43', '23.84'], ['2.50', '3.05', '29.92']] } })

export const ITEMS = S.items
