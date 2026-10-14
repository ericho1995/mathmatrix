// VCE Physics Unit 3 & 4 — Practice exam 8.
// Section A: 20 multiple choice. Section B: 15 questions, 100 marks.
// Every value is computed in checks/set8.py.
import { t, AOS, part, makeSet, axes, curve } from './phys.mjs'
import { drawing } from './draw.mjs'

const { MO, FI, EL, LM, IN } = AOS
const S = makeSet(8)
const rad = d => (d * Math.PI) / 180

// ════════════════ Section A ════════════════

S.mc(MO, 'developing', t`A 5.0 kg crate rests without moving on a ramp inclined at 30° to the horizontal. The magnitude of the friction force acting on the crate is closest to`,
  ['0 N', '24.5 N', '42.5 N', '49.1 N'], 'B',
  t`The crate is in equilibrium, so friction balances the component of its weight down the slope: \(F_f = mg\sin(30^\circ) = 5.0 \times 9.81 \times 0.50 = 24.5\) N. 42.5 N is \(mg\cos(30^\circ)\), the size of the normal force; 49.1 N is the whole weight.`)

S.mc(MO, 'developing', t`Ball X is thrown horizontally from the top of a cliff at the same instant that an identical ball Y is dropped from rest from the same height. Ignoring air resistance, which one of the following statements is correct?`,
  ['Ball Y lands first.', 'Ball X lands first, because it has the greater speed.', 'Both balls land at the same time, with the same speed.', 'Both balls land at the same time, and ball X lands with the greater speed.'], 'D',
  t`Both balls start with zero vertical velocity and have the same vertical acceleration, \(g\), so they take the same time to fall. Ball X also keeps its horizontal velocity, so its speed on landing is greater.`)

S.mc(MO, 'proficient', t`A 1500 kg car accelerates uniformly from rest to 18 m s⁻¹ in 9.0 s along a level road. Ignoring friction and air resistance, the average power delivered to the car is closest to`,
  ['3.0 kW', '27 kW', '54 kW', '243 kW'], 'B',
  t`The work done equals the gain in kinetic energy, \(\frac{1}{2}(1500)(18)^2 = 2.43 \times 10^5\) J, so \(P = \frac{2.43 \times 10^5}{9.0} = 2.7 \times 10^4\) W. 54 kW leaves out the \(\frac{1}{2}\); 243 kW is the kinetic energy in kilojoules, not divided by the time; 3.0 kW mistakes the driving force (3000 N) for a power.`)

S.mc(MO, 'proficient', t`A ball moving at speed \(u\) collides head-on and elastically with an identical ball at rest. Immediately after the collision,`,
  [t`the first ball is at rest and the second ball moves at speed \(u\)`, t`the two balls move together at speed \(\frac{u}{2}\)`, t`the first ball rebounds at speed \(u\) and the second ball stays at rest`, t`the first ball rebounds at speed \(\frac{u}{2}\) and the second ball moves forwards at speed \(\frac{u}{2}\)`], 'A',
  t`Momentum: \(mu = mv_1 + mv_2\); kinetic energy: \(\frac{1}{2}mu^2 = \frac{1}{2}mv_1^2 + \frac{1}{2}mv_2^2\). Only \(v_1 = 0\) and \(v_2 = u\) satisfy both. Moving off together conserves momentum but loses half the kinetic energy, so that collision would be inelastic; the last two options do not conserve momentum.`)

S.mc(MO, 'proficient', t`A 0.30 kg puck on a frictionless horizontal air table is attached to a string and moves in a horizontal circle of radius 0.60 m, completing 1.5 revolutions each second. The tension in the string is closest to`,
  ['0.41 N', '2.9 N', '3.2 N', '16 N'], 'D',
  t`\(v = 2\pi rf = 2\pi \times 0.60 \times 1.5 = 5.65\) m s⁻¹, and the tension provides the centripetal force: \(T = \frac{mv^2}{r} = \frac{0.30 \times 5.65^2}{0.60} = 16\) N. 0.41 N leaves out the \(2\pi\) (\(v = rf\)); 3.2 N divides the circumference by the frequency instead of multiplying; 2.9 N is the weight of the puck, which the table supports.`)

S.mc(FI, 'developing', t`Astronauts on board a space station in a circular orbit around Earth feel weightless because`,
  ['they and the station are both in free fall, with the same acceleration towards Earth', 'there is no gravitational field at the altitude of the station', 'the Moon’s gravitational pull cancels Earth’s pull on them', 'the station moves too fast for gravity to act on it'], 'A',
  t`At the station’s altitude, Earth’s field is still about 90% of its surface value. Gravity gives the astronauts and the station the same centripetal acceleration, so the floor does not need to push on the astronauts: the normal force, which they feel as their weight, is zero.`)

S.mc(FI, 'proficient', t`Two parallel plates are connected to a power supply that keeps a constant potential difference between them. The plates are moved apart until their separation is doubled. The electric force on a charged particle between the plates is now`,
  ['unchanged', 'halved', 'quartered', 'doubled'], 'B',
  t`\(E = \frac{V}{d}\): with \(V\) fixed, doubling \(d\) halves the field, and \(F = qE\) halves with it. The field between parallel plates is uniform, so it does not follow an inverse-square law (quartered), and it does depend on the separation (unchanged).`)

S.mc(FI, 'proficient', t`A proton and an electron enter the same uniform magnetic field with the same velocity, perpendicular to the field. Which one of the following compares the proton with the electron?`,
  ['the same | smaller', 'larger | larger', 'the same | larger', 'smaller | the same'], 'C',
  t`\(F = qvB\): the charges have the same magnitude and the speeds are equal, so the forces are the same size (in opposite directions). \(r = \frac{mv}{qB}\), and the proton’s mass is about 1830 times the electron’s, so the radius of its path is about 1830 times larger.`,
  { headers: ['Magnitude of the magnetic force on the proton', 'Radius of the proton’s circular path'] })

S.mc(FI, 'advanced', t`An electron moves vertically downwards through a region where a uniform magnetic field points horizontally towards the north. The direction of the magnetic force on the electron is towards the`,
  ['north', 'south', 'east', 'west'], 'D',
  t`For a positive charge moving down with the field towards the north, the right-hand rule gives a force towards the east. The electron’s charge is negative, so the force on it is towards the west. A force towards the north or south is impossible: the magnetic force is always perpendicular to the field.`)

S.mc(EL, 'proficient', t`An ideal transformer connected to the 240 V RMS mains supplies a 12 V, 36 W lamp, which operates normally. The RMS current in the primary coil is closest to`,
  ['0.15 A', '0.21 A', '3.0 A', '60 A'], 'A',
  t`An ideal transformer’s input power equals its output power: \(I_p = \frac{36}{240} = 0.15\) A. 3.0 A is the current in the secondary coil; 0.21 A is the peak primary current; 60 A inverts the turns ratio.`)

S.mc(EL, 'proficient', t`A flat coil of 50 turns, each of area 20 cm², is in a uniform magnetic field of 0.40 T. The field makes an angle of 30° with the plane of the coil. The coil is pulled completely out of the field in 0.10 s. The average EMF induced in the coil is closest to`,
  ['4.0 × 10⁻³ V', '0.20 V', '0.35 V', '0.40 V'], 'B',
  t`Only the component of the field perpendicular to the plane of the coil contributes to the flux: \(B_\perp = 0.40\sin(30^\circ) = 0.20\) T, so \(\Phi_B = 0.20 \times 20 \times 10^{-4} = 4.0 \times 10^{-4}\) Wb per turn and \(\varepsilon = N\frac{\Delta\Phi_B}{\Delta t} = 50 \times \frac{4.0 \times 10^{-4}}{0.10} = 0.20\) V. 0.35 V uses \(\cos(30^\circ)\); 0.40 V ignores the angle; \(4.0 \times 10^{-3}\) V leaves out the 50 turns.`)

S.mc(EL, 'developing', t`Electricity is generated and distributed as alternating current (AC) mainly because`,
  ['AC causes less heating in the lines than a direct current of the same RMS value', 'AC travels along transmission lines faster than direct current', 'transformers need a changing current to step voltages up and down', 'AC can be stored in batteries, but direct current cannot'], 'C',
  t`A transformer works by electromagnetic induction, which needs a changing flux in its core and so a changing (alternating) current. Stepping the voltage up for transmission reduces the current and the \(I^2R\) loss. AC heats a resistance exactly as much as a direct current equal to its RMS value.`)

S.mc(EL, 'proficient', t`The coil of an AC generator is turned at half its previous rate. The magnetic field and the coil are unchanged. Which one of the following gives the effect on the output?`,
  ['unchanged | halved', 'unchanged | doubled', 'halved | halved', 'halved | doubled'], 'D',
  t`Each change of flux now takes twice as long, so the rate of change of flux, and with it the peak EMF, halves. Each revolution takes twice as long, so the period doubles (the frequency halves).`,
  { headers: ['Peak EMF', 'Period of the output'] })

S.mc(LM, 'proficient', t`The threshold frequency of a metal is 5.5 × 10¹⁴ Hz. Light of frequency 8.0 × 10¹⁴ Hz falls on the metal. The stopping voltage for the emitted photoelectrons is closest to`,
  ['1.04 V', '2.28 V', '3.31 V', '5.59 V'], 'A',
  t`\(E_{k\,\text{max}} = h(f - f_0) = 4.14 \times 10^{-15} \times 2.5 \times 10^{14} = 1.04\) eV, so \(V_0 = 1.04\) V. 3.31 V is \(hf\), ignoring the work function; 2.28 V is the work function itself; 5.59 V adds the work function instead of subtracting it.`)

S.mc(LM, 'advanced', t`Light shines on a photocell. Its frequency is increased, staying above the threshold frequency, while the intensity of the light (the energy arriving each second) is kept constant. Which one of the following gives the effect?`,
  ['increases | increases', 'increases | decreases', 'increases | unchanged', 'unchanged | decreases'], 'B',
  t`\(E_{k\,\text{max}} = hf - \phi\) increases with the frequency. Each photon now carries more energy, \(hf\), so the same energy each second is delivered by fewer photons; with one photoelectron for each photon absorbed, fewer photoelectrons are emitted each second.`,
  { headers: ['Maximum kinetic energy of the photoelectrons', 'Number of photoelectrons emitted each second'] })

S.mc(LM, 'advanced', t`Hydrogen atoms have energy levels of −13.6 eV (\(n = 1\)), −3.40 eV (\(n = 2\)), −1.51 eV (\(n = 3\)) and −0.85 eV (\(n = 4\)). Electrons with 12.5 eV of kinetic energy collide with hydrogen atoms in the ground state. Which one of the following photon energies could not then be emitted by the atoms?`,
  ['0.66 eV', '1.89 eV', '10.2 eV', '12.09 eV'], 'A',
  t`A colliding electron can give an atom part of its energy, so it can excite atoms to \(n = 2\) (10.2 eV) or \(n = 3\) (12.09 eV), but not to \(n = 4\), which needs 12.75 eV. Atoms in \(n = 3\) and \(n = 2\) can emit 12.09 eV (\(3 \to 1\)), 1.89 eV (\(3 \to 2\)) and 10.2 eV (\(2 \to 1\)). 0.66 eV is the \(4 \to 3\) transition, which needs atoms in \(n = 4\).`)

S.mc(LM, 'developing', t`In a double-slit experiment, the light is made so dim that only one photon at a time passes through the apparatus. A sensitive detector records where each photon arrives. After a very long time, the pattern recorded is`,
  ['two bright bands, one behind each slit', 'a random scatter of dots with no pattern', 'an interference pattern of bright and dark bands, built up from individual dots', 'a single bright band with no dark bands'], 'C',
  t`Each photon arrives at a single point (particle behaviour), but where photons are likely to arrive follows the wave interference pattern, so bright and dark bands build up over time. This is wave–particle duality.`)

S.mc(LM, 'proficient', t`An astronaut travels at a constant high speed from Earth to a space station that is at rest relative to Earth. Which one of the following identifies who measures the proper time for the journey and who measures the proper length of the journey?`,
  ['Earth observer | Earth observer', 'Earth observer | astronaut', 'astronaut | Earth observer', 'astronaut | astronaut'], 'C',
  t`Proper time is measured by a clock that is present at both events (leaving Earth and arriving at the station): the astronaut’s clock. Proper length is measured in the frame in which the distance is at rest: Earth and the station are at rest relative to the Earth observer.`,
  { headers: ['Proper time', 'Proper length'] })

S.mc(LM, 'advanced', t`An electron (rest energy 0.511 MeV) is accelerated from rest through a potential difference of 1.50 MV. The Lorentz factor, \(\gamma\), of the electron is closest to`,
  ['0.341', '1.50', '2.94', '3.94'], 'D',
  t`The electron gains 1.50 MeV of kinetic energy, so its total energy is \(\gamma mc^2 = 0.511 + 1.50 = 2.011\) MeV and \(\gamma = \frac{2.011}{0.511} = 3.94\). 2.94 is \(\gamma - 1\) (the kinetic energy divided by the rest energy); 0.341 inverts that ratio.`)

S.mc(IN, 'developing', t`Students investigate how the stopping voltage of a photocell depends on the frequency of the light shining on it. Which one of the following is a controlled variable in this investigation?`,
  ['the stopping voltage', 'the frequency of the light', 'the metal of the photocell’s cathode', 'the reading on the ammeter'], 'C',
  t`The frequency is the independent variable and the stopping voltage the dependent variable; the ammeter is used to find when the current reaches zero. The cathode metal (its work function) must stay the same, or the stopping voltage would change for another reason.`)

// ════════════════ Section B ════════════════

S.q(MO, 'proficient', t`An astronaut on a spacewalk has drifted 15 m away from the airlock of a space station. She is at rest relative to the station, and her total mass, including her suit and equipment, is 120 kg.`, [
  part('a', t`She throws a 3.0 kg tool bag directly away from the station at 2.0 m s⁻¹, relative to the station. Calculate the speed at which she then moves towards the station.`, 2,
    t`0.051 m s⁻¹ (accept 0.050 m s⁻¹)`,
    t`The total momentum stays zero: \(3.0 \times 2.0 = 117v\), so \(v = 0.051\) m s⁻¹. After the throw her mass is \(120 - 3.0 = 117\) kg; using 120 kg gives 0.050 m s⁻¹, which is also accepted. 1 mark for conservation of momentum, 1 mark for the value.`, { unit: 'm s⁻¹' }),
  part('b', t`Calculate the time she takes to reach the airlock.`, 1,
    t`293 s (300 s from 0.050 m s⁻¹)`,
    t`\(t = \frac{15}{0.0513} = 293\) s.`, { unit: 's' }),
  part('c', t`Instead of throwing the bag, she could have used a hand-held gas thruster that ejects 0.025 kg of gas each second at 40 m s⁻¹ relative to her. Calculate the magnitude of the force that the gas exerts on her.`, 2,
    t`1.0 N`,
    t`Each second the thruster gives 0.025 kg of gas a momentum of \(0.025 \times 40 = 1.0\) kg m s⁻¹, so the force on the gas is \(F = \frac{\Delta p}{\Delta t} = 1.0\) N, and the gas pushes back on her with 1.0 N. 1 mark for the rate of change of momentum, 1 mark for the value.`, { unit: 'N' }),
  part('d', t`Use Newton’s third law to explain why the thruster must point away from the station to move her towards it.`, 1,
    t`The thruster pushes the gas away from the station; the gas pushes back on the thruster (and so on her) with a force of equal size in the opposite direction, towards the station.`,
    t`The force pair (thruster on gas, gas on thruster) is the key idea.`),
])

// Front view of the banked aircraft: wings through (150, 75) at 25°.
const W = rad(25)
const plane = drawing(300, 150)
plane.line(150, 75, 282, 75, { dash: true, grey: true })
  .line(150 - 120 * Math.cos(W), 75 + 120 * Math.sin(W), 150 + 120 * Math.cos(W), 75 - 120 * Math.sin(W), { w: 2.6 })
  .line(150 - 13 * Math.sin(W), 75 - 13 * Math.cos(W), 150 - 32 * Math.sin(W), 75 - 32 * Math.cos(W), { w: 2.6 })
  .circle(150, 75, 13, { fill: 'mid', w: 1.2 }).angle(150, 75, 62, 0, 25, '25°')
  .arrow(132, 22, 28, 22).text(80, 15, 'towards the centre of the circle', { size: 8 })
S.q(MO, 'proficient', t`A light aircraft of mass 1200 kg flies in a horizontal circle at a constant speed of 60 m s⁻¹, with its wings banked at 25° to the horizontal. Figure 1 shows a front view. The lift force on the aircraft acts perpendicular to its wings, and the thrust of the engine balances the drag along its path.`, [
  part('a', t`Show that the magnitude of the lift force is about 1.3 × 10⁴ N.`, 2,
    t`\(L\cos(25^\circ) = mg\), so \(L = \dfrac{1200 \times 9.81}{\cos(25^\circ)} = 1.30 \times 10^4\) N`,
    t`There is no vertical acceleration, so the vertical component of the lift balances the weight: \(L\cos(25^\circ) = mg = 1.18 \times 10^4\) N, giving \(L = \frac{1.18 \times 10^4}{0.906} = 1.30 \times 10^4\) N. 1 mark for the vertical balance, 1 mark for the substitution leading to the given value.`),
  part('b', t`Calculate the radius of the circle.`, 2,
    t`787 m`,
    t`The horizontal component of the lift provides the centripetal force: \(L\sin(25^\circ) = \frac{mv^2}{r}\). Dividing by the vertical equation gives \(\tan(25^\circ) = \frac{v^2}{rg}\), so \(r = \frac{60^2}{9.81 \times \tan(25^\circ)} = 787\) m. 1 mark for the horizontal equation, 1 mark for the value.`, { unit: 'm' }),
  part('c', t`Calculate the time the aircraft takes to complete one circle.`, 1,
    t`82.4 s`,
    t`\(T = \frac{2\pi r}{v} = \frac{2\pi \times 787}{60} = 82.4\) s.`, { unit: 's' }),
  part('d', t`Calculate the magnitude of the force that the seat exerts on the 70 kg pilot during the turn.`, 1,
    t`758 N`,
    t`The pilot has the same acceleration as the aircraft, so the seat pushes on the pilot just as the lift pushes on the aircraft: \(N = \frac{mg}{\cos(25^\circ)} = \frac{70 \times 9.81}{0.906} = 758\) N, about 1.10 times the pilot’s weight (687 N). This is why the pilot feels heavier in the turn.`, { unit: 'N' }),
], { diagram: plane.done('Figure 1') })

// Bungee jumper at the instant the cord becomes taut (not to scale).
const bj = drawing(220, 150)
bj.rect(14, 14, 100, 12, { fill: 'light' }).text(52, 23, 'bridge', { size: 8 })
  .line(100, 26, 100, 118, { w: 1.4 }).circle(100, 125, 7, { fill: 'mid' }).text(94, 74, 'cord', { anchor: 'end', size: 8.5 })
  .line(116, 26, 140, 26, { dash: true, grey: true }).line(108, 118, 140, 118, { dash: true, grey: true })
  .dim(132, 26, 132, 118, '15 m', { offset: -14 })
S.q(MO, 'advanced', t`A 60 kg bungee jumper steps off a high bridge. Her bungee cord has an unstretched length of 15 m and obeys Hooke’s law with a spring constant of 120 N m⁻¹. Figure 2 shows her at the instant the cord becomes taut. Ignore air resistance and the mass of the cord, and treat the jumper as a point mass.`, [
  part('a', t`Calculate the jumper’s speed at the instant the cord becomes taut.`, 2,
    t`17.2 m s⁻¹`,
    t`She falls freely for 15 m: \(v = \sqrt{2gh} = \sqrt{2 \times 9.81 \times 15} = 17.2\) m s⁻¹. 1 mark for the method (energy, or \(v^2 = u^2 + 2as\)), 1 mark for the value.`, { unit: 'm s⁻¹' }),
  part('b', t`Show that the maximum extension of the cord is about 18 m.`, 2,
    t`At the lowest point she is momentarily at rest, so \(mg(15 + x) = \frac{1}{2}kx^2\): \(588.6(15 + x) = 60x^2\), which gives \(x = 18.0\) m.`,
    t`All the gravitational potential energy lost over the whole fall, \(15 + x\), is stored as elastic potential energy. The quadratic \(60x^2 - 588.6x - 8829 = 0\) has the positive solution \(x = 18.0\) m. 1 mark for the energy equation with the full drop of \(15 + x\), 1 mark for solving it. Common error: using only the 15 m free fall, \(mg \times 15 = \frac{1}{2}kx^2\), which gives 12.1 m.`),
  part('c', t`Calculate the extension of the cord when the jumper’s speed is greatest, and explain your reasoning.`, 2,
    t`4.9 m: her speed is greatest where the net force on her is zero, \(kx = mg\), so \(x = \frac{588.6}{120} = 4.9\) m.`,
    t`While the cord’s force is less than her weight the net force is downwards and she keeps speeding up; beyond \(kx = mg\) the net force is upwards and she slows down. 1 mark for identifying zero net force (zero acceleration) at the greatest speed, 1 mark for the extension.`, { lines: 6 }),
], { diagram: bj.done('Figure 2 (not to scale)') })

const bow = x => 900 * x - 600 * x * x
S.q(MO, 'advanced', t`Figure 3 shows how the force needed to draw back the string of an archery bow varies with the draw distance. The bow does not obey Hooke’s law.`, [
  part('a', t`Use Figure 3 to estimate the energy stored in the bow when it is drawn back 0.50 m.`, 2,
    t`About 88 J (accept 84–92 J)`,
    t`The energy stored is the work done: the area under the force–distance graph. Each grid square represents \(0.05 \times 50 = 2.5\) J, and there are about 35 squares under the curve, so \(E \approx 35 \times 2.5 = 88\) J. 1 mark for using the area under the graph, 1 mark for a value in the range. Common error: \(\frac{1}{2}Fx = \frac{1}{2} \times 300 \times 0.50 = 75\) J, which treats the graph as a straight line.`, { unit: 'J' }),
  part('b', t`When the string is released from a draw of 0.50 m, 80% of the stored energy becomes kinetic energy of a 28 g arrow. Show that the arrow leaves the bow at about 70 m s⁻¹.`, 2,
    t`\(\frac{1}{2}(0.028)v^2 = 0.80 \times 88 = 70\) J, so \(v = \sqrt{\dfrac{2 \times 70}{0.028}} = 71\) m s⁻¹, about 70 m s⁻¹.`,
    t`1 mark for 80% of the stored energy as kinetic energy, 1 mark for the speed with the mass in kilograms.`),
  part('c', t`The archer aims horizontally at the centre of a target 30.0 m away, at the same height as the arrow’s launch point. Taking the launch speed to be 70 m s⁻¹, calculate how far below the centre of the target the arrow strikes it. Ignore air resistance.`, 2,
    t`0.90 m`,
    t`Horizontally, \(t = \frac{30.0}{70} = 0.429\) s. Vertically, starting with no vertical velocity, \(y = \frac{1}{2}gt^2 = \frac{1}{2} \times 9.81 \times 0.429^2 = 0.90\) m. 1 mark for the time of flight, 1 mark for the distance.`, { unit: 'm' }),
], { diagram: { kind: 'function_graph', xMin: 0, xMax: 0.5, yMin: 0, yMax: 300, xStep: 0.05, yStep: 50, xLabel: 'draw distance (m)', yLabel: 'F (N)', width: 360, grid: true,
  curves: [{ points: curve(bow, 0, 0.5, 60) }], caption: 'Figure 3' } })

S.q(FI, 'proficient', t`An exoplanet has 4.0 times the mass of Earth and 1.5 times Earth’s radius.`, [
  part('a', t`Show that the gravitational field strength at the surface of the exoplanet is about 17 N kg⁻¹.`, 2,
    t`\(g = \dfrac{G(4.0M_E)}{(1.5R_E)^2} = \dfrac{6.67 \times 10^{-11} \times 2.388 \times 10^{25}}{(9.555 \times 10^6)^2} = 17.4\) N kg⁻¹ (or \(9.81 \times \frac{4.0}{1.5^2} = 17.4\) N kg⁻¹)`,
    t`1 mark for scaling both the mass and the radius (\(\frac{4.0}{2.25} = 1.78\) times Earth’s value), 1 mark for the value. Common error: \(\frac{4.0}{1.5} \times 9.81 = 26\) N kg⁻¹, which forgets to square the radius.`),
  part('b', t`A 250 kg lander hovers just above the surface of the exoplanet. Calculate the upward thrust of its engine.`, 1,
    t`4.4 × 10³ N (accept 4.3 × 10³ N from 17 N kg⁻¹)`,
    t`Hovering means zero acceleration, so the thrust equals the weight: \(F = mg = 250 \times 17.4 = 4.4 \times 10^3\) N.`, { unit: 'N' }),
  part('c', t`A satellite orbits the exoplanet at an altitude equal to the exoplanet’s radius. Calculate its orbital period, in hours.`, 3,
    t`3.65 h`,
    t`The orbital radius is \(2 \times 1.5R_E = 1.911 \times 10^7\) m. From \(\frac{GMm}{r^2} = \frac{4\pi^2mr}{T^2}\), \(T = 2\pi\sqrt{\frac{r^3}{GM}} = 2\pi\sqrt{\frac{(1.911 \times 10^7)^3}{6.67 \times 10^{-11} \times 2.388 \times 10^{25}}} = 1.32 \times 10^4\) s \(= 3.65\) h. Marks: 1 for the orbital radius (twice the planet’s radius); 1 for the period in seconds; 1 for the conversion to hours. Common error: using the altitude as the radius, which gives 1.29 h.`, { unit: 'h' }),
])

// Charged spheres: thread 150 px from (130, 14) at 12°; A is 70 px (6.0 cm) to the left of B.
const T12 = rad(12), bx = 130 + 150 * Math.sin(T12), by = 14 + 150 * Math.cos(T12), ax = bx - 70
const sph = drawing(260, 200)
sph.ceiling(96, 166, 14).line(130, 14, 130, 170, { dash: true, grey: true }).line(130, 14, bx, by, { w: 1.1 }).angle(130, 14, 92, -90, -78, '12°')
  .circle(bx, by, 7, { fill: 'light', w: 1.1 }).text(bx + 12, by + 4, 'B', { anchor: 'start', bold: true })
  .line(ax, by + 7, ax, 186, { w: 2 }).rect(ax - 15, 186, 30, 5, { fill: 'dark' }).circle(ax, by, 7, { fill: 'light', w: 1.1 }).text(ax - 12, by + 4, 'A', { anchor: 'end', bold: true })
  .line(bx, by + 8, bx, 182, { dash: true, grey: true }).dim(ax, 178, bx, 178, '6.0 cm')
S.q(FI, 'proficient', t`Two small, identical spheres carry equal positive charges. Sphere A is fixed on an insulating stand. Sphere B, of mass 2.0 g, hangs from a light insulating thread. B is repelled by A and comes to rest with the thread at 12° to the vertical, when the centres of the spheres are 6.0 cm apart on the same horizontal line, as shown in Figure 4.`, [
  part('a', t`Show that the magnitude of the electric force on sphere B is about 4.2 × 10⁻³ N.`, 2,
    t`Vertically \(T\cos(12^\circ) = mg\) and horizontally \(T\sin(12^\circ) = F\), so \(F = mg\tan(12^\circ) = 2.0 \times 10^{-3} \times 9.81 \times 0.213 = 4.17 \times 10^{-3}\) N.`,
    t`B is in equilibrium under its weight, the tension in the thread and the horizontal electric force. 1 mark for resolving the tension (or drawing a closed force triangle), 1 mark for the substitution with the mass in kilograms.`),
  part('b', t`Calculate the magnitude of the charge on each sphere.`, 2,
    t`4.1 × 10⁻⁸ C`,
    t`\(F = \frac{kq^2}{r^2}\), so \(q = r\sqrt{\frac{F}{k}} = 0.060 \times \sqrt{\frac{4.17 \times 10^{-3}}{8.99 \times 10^9}} = 4.1 \times 10^{-8}\) C. 1 mark for Coulomb’s law with \(q^2\) and \(r\) in metres, 1 mark for the value.`, { unit: 'C' }),
  part('c', t`Calculate the strength of the electric field produced by sphere A at the centre of sphere B.`, 1,
    t`1.0 × 10⁵ N C⁻¹`,
    t`\(E = \frac{F}{q} = \frac{4.17 \times 10^{-3}}{4.09 \times 10^{-8}} = 1.0 \times 10^5\) N C⁻¹ (equivalently \(\frac{kq}{r^2}\)), directed away from A.`, { unit: 'N C⁻¹' }),
  part('d', t`The charge on sphere A is doubled, while the charge on sphere B is unchanged. Compare the magnitudes of the electric force that A exerts on B and the electric force that B exerts on A.`, 1,
    t`They are equal in magnitude (and opposite in direction).`,
    t`The two forces are a Newton’s third-law pair, whatever the sizes of the two charges; \(F = \frac{kq_1q_2}{r^2}\) is symmetrical in the charges.`),
], { diagram: sph.done('Figure 4') })

// Cyclotron, top view: dees about (150, 95), gap 8 px. The protons move clockwise.
const cyc = drawing(300, 215)
cyc.arc(146, 95, 78, 90, 270).line(146, 17, 146, 173, { w: 1.2 }).arc(154, 95, 78, -90, 90).line(154, 17, 154, 173, { w: 1.2 })
{
  const R = [8, 16, 24, 32, 40, 48, 56]
  cyc.dot(150, 87, 2).line(150, 87, 154, 87, { w: 0.9 })
  R.forEach((r, i) => {
    if (i % 2 === 0) {
      cyc.arc(154, 95, r, 90, -90, i === 4 ? { arrow: 'end' } : {})
      cyc.line(154, 95 + r, 146, 95 + r + 8, { w: 0.9 })
    } else {
      cyc.arc(146, 95, r, 270, 90)
      cyc.line(146, 95 - r, 154, 95 - r - 8, { w: 0.9 })
    }
  })
  // Last turn in the left dee (radius 64), leaving at 150°.
  const px = 146 + 64 * Math.cos(rad(150)), py = 95 - 64 * Math.sin(rad(150))
  cyc.arc(146, 95, 64, 270, 150).arrow(px, py, px + 55 * 0.5, py - 55 * Math.sqrt(3) / 2, { w: 1 }).text(px + 23, 12, 'exit', { anchor: 'end', size: 8.5 })
}
cyc.text(150, 11, 'gap', { size: 8.5 }).text(62, 98, 'dee', { anchor: 'end', size: 8.5 }).text(238, 98, 'dee', { anchor: 'start', size: 8.5 })
  .line(107, 162.5, 107, 200).line(193, 162.5, 193, 200).meter(107, 200, 193, 200, '~').text(204, 203, 'alternating voltage', { anchor: 'start', size: 8 })
S.q(FI, 'advanced', t`In a cyclotron, protons (mass 1.67 × 10⁻²⁷ kg, charge +1.60 × 10⁻¹⁹ C) move inside two hollow, D-shaped metal electrodes (dees) in a uniform magnetic field of 1.2 T, perpendicular to the dees. An alternating voltage across the gap between the dees accelerates the protons each time they cross it, so they spiral outwards, as shown in Figure 5. Figure 5 is a top view, and the direction of the magnetic field is not shown. Ignore relativistic effects.`, [
  part('a', t`The protons travel clockwise in Figure 5. State whether the magnetic field points into or out of the page.`, 1,
    t`Out of the page`,
    t`At the top of each semicircle a proton moves to the right, and the force on it must point down, towards the centre. For a positive charge, the right-hand rule then gives a field out of the page.`),
  part('b', t`Show that the time a proton takes to travel around one semicircle inside a dee does not depend on its speed.`, 2,
    t`\(qvB = \frac{mv^2}{r}\) gives \(r = \frac{mv}{qB}\), so \(t = \frac{\pi r}{v} = \frac{\pi m}{qB}\), which does not contain \(v\).`,
    t`A faster proton travels around a larger semicircle, in proportion to its speed. 1 mark for \(r = \frac{mv}{qB}\), 1 mark for \(t = \frac{\pi r}{v}\) leading to \(\frac{\pi m}{qB}\).`),
  part('c', t`Calculate the frequency of the alternating voltage needed to stay in step with the protons.`, 1,
    t`1.83 × 10⁷ Hz (18.3 MHz)`,
    t`The voltage must reverse once each semicircle, so one cycle lasts two semicircles: \(T = \frac{2\pi m}{qB} = \frac{2\pi \times 1.67 \times 10^{-27}}{1.60 \times 10^{-19} \times 1.2} = 5.47 \times 10^{-8}\) s and \(f = \frac{1}{T} = 1.83 \times 10^7\) Hz.`, { unit: 'Hz' }),
  part('d', t`The protons leave the cyclotron when the radius of their path reaches 0.40 m. Calculate their speed as they leave.`, 2,
    t`4.6 × 10⁷ m s⁻¹`,
    t`\(v = \frac{qBr}{m} = \frac{1.60 \times 10^{-19} \times 1.2 \times 0.40}{1.67 \times 10^{-27}} = 4.6 \times 10^7\) m s⁻¹ (about 0.15c, so ignoring relativity is reasonable). 1 mark for the relationship, 1 mark for the value.`, { unit: 'm s⁻¹' }),
  part('e', t`Explain why the protons gain kinetic energy only while they cross the gap, and not while they move inside the dees.`, 1,
    t`Inside the dees only the magnetic force acts, and it is always perpendicular to the velocity, so it does no work. In the gap the electric field does work \(qV\) on the protons.`,
    t`The key idea is that a force perpendicular to the motion does no work.`),
], { diagram: cyc.done('Figure 5 (top view)') })

S.q(EL, 'proficient', t`An electric bicycle has a DC motor in the hub of its rear wheel. Model it as a simple DC motor with a single coil of 40 turns in a magnetic field of 0.80 T. Each side of the coil that lies across the field is 5.0 cm long.`, [
  part('a', t`The current in the coil is 6.0 A. Calculate the magnitude of the magnetic force on one side of the coil that is perpendicular to the field.`, 2,
    t`9.6 N`,
    t`\(F = nIlB = 40 \times 6.0 \times 0.050 \times 0.80 = 9.6\) N. 1 mark for including the 40 turns and the length in metres, 1 mark for the value.`, { unit: 'N' }),
  part('b', t`When the rider brakes, the motor is switched to work as a generator: its coil, turned by the wheel, charges the battery (regenerative braking). Use Lenz’s law to explain why this slows the bicycle.`, 2,
    t`The flux through the turning coil changes, so an EMF is induced and a current flows. By Lenz’s law the induced current opposes the change that produces it — the rotation — so the magnetic forces on the sides of the coil act against its motion and slow the wheel.`,
    t`1 mark for the changing flux inducing an EMF and current, 1 mark for the induced current producing forces that oppose the rotation (Lenz’s law).`),
  part('c', t`The rider and bicycle, of total mass 95 kg, slow from 8.0 m s⁻¹ to 3.0 m s⁻¹ on level ground using regenerative braking alone, and 60% of the kinetic energy lost is stored in the battery. Calculate the energy stored.`, 2,
    t`1.57 × 10³ J`,
    t`\(\Delta E_k = \frac{1}{2}(95)(8.0^2 - 3.0^2) = 2.61 \times 10^3\) J, and \(0.60 \times 2.61 \times 10^3 = 1.57 \times 10^3\) J. 1 mark for the loss of kinetic energy, 1 mark for the energy stored. Common error: \(\frac{1}{2}m(8.0 - 3.0)^2\), which subtracts the speeds before squaring.`, { unit: 'J' }),
  part('d', t`Explain why regenerative braking becomes ineffective as the bicycle comes to a stop, so ordinary brakes are still needed.`, 1,
    t`The induced EMF depends on the rate of change of flux, which falls as the wheel slows; at low speed the EMF, the current and so the braking force are small, and they are zero when the wheel stops.`,
    t`Linking the braking force to the speed of rotation earns the mark.`),
])

const fieldBt = { kind: 'function_graph', xMin: 0, xMax: 80, yMin: -5, yMax: 5, xStep: 20, yStep: 1, xLabel: 't (μs)', yLabel: 'B (mT)', width: 360, grid: true,
  curves: [{ points: [[0, 4], [20, -4], [40, 4], [60, -4], [80, 4]] }], caption: 'Figure 6' }
S.q(EL, 'advanced', t`In an induction cooktop, an alternating current in a flat coil under a glass-ceramic top produces a changing magnetic field through the base of a steel saucepan. Model the base of the saucepan as a single conducting loop of area 0.020 m². Figure 6 shows the magnetic field through the base, perpendicular to it.`, [
  part('a', t`State the frequency of the changing field.`, 1,
    t`2.5 × 10⁴ Hz (25 kHz)`,
    t`One cycle takes 40 μs: \(f = \frac{1}{40 \times 10^{-6}} = 2.5 \times 10^4\) Hz.`, { unit: 'Hz' }),
  part('b', t`Calculate the maximum magnetic flux through the base.`, 1,
    t`8.0 × 10⁻⁵ Wb`,
    t`\(\Phi_B = BA = 4.0 \times 10^{-3} \times 0.020 = 8.0 \times 10^{-5}\) Wb.`, { unit: 'Wb' }),
  part('c', t`Calculate the magnitude of the EMF induced around the base between \(t = 0\) and \(t = 20\) μs.`, 2,
    t`8.0 V`,
    t`The flux changes from \(+8.0 \times 10^{-5}\) Wb to \(-8.0 \times 10^{-5}\) Wb: \(\varepsilon = \frac{\Delta\Phi_B}{\Delta t} = \frac{1.6 \times 10^{-4}}{20 \times 10^{-6}} = 8.0\) V. 1 mark for the change in flux of \(1.6 \times 10^{-4}\) Wb (the field reverses), 1 mark for the EMF. Common error: 4.0 V, from using only the maximum flux.`, { unit: 'V' }),
  part('d', t`On the axes below, sketch the EMF induced around the base from \(t = 0\) to \(t = 80\) μs.`, 2,
    t`A square wave: +8.0 V from 0 to 20 μs, −8.0 V from 20 to 40 μs, +8.0 V from 40 to 60 μs and −8.0 V from 60 to 80 μs (the inverted pattern is also accepted).`,
    t`The EMF is proportional to the gradient of the flux–time graph, which is constant along each straight section and reverses every 20 μs. With \(\varepsilon = -N\frac{\Delta\Phi_B}{\Delta t}\) the EMF is positive while the field decreases and negative while it increases. 1 mark for constant sections of magnitude 8.0 V, 1 mark for the reversal every 20 μs.`,
    { diagram: axes({ xMin: 0, xMax: 80, yMin: -10, yMax: 10, xStep: 10, yStep: 2, xLabel: 't (μs)', yLabel: 'EMF (V)', width: 360 }) }),
  part('e', t`The same changing field passes through the glass-ceramic top and the base of the saucepan. Explain why the saucepan heats up but the glass-ceramic top does not.`, 2,
    t`An EMF is induced in both. The steel base is a conductor, so the EMF drives large eddy currents around it, and these heat it (\(P = I^2R\)). The glass-ceramic is an insulator, so no current flows in it and no heat is produced in it; it is warmed only by contact with the hot saucepan.`,
    t`1 mark for eddy currents in the conducting base heating it, 1 mark for no current in the insulating glass-ceramic.`),
], { diagram: fieldBt })

// Distribution: zone substation → 11 kV line → pole transformer → low-voltage cable → houses.
const grid = drawing(380, 92)
grid.rect(6, 34, 66, 30, { fill: 'light' }).text(39, 53, 'T1', { bold: true }).text(39, 26, 'zone substation', { size: 8 }).text(39, 78, '66 kV : 11 kV', { size: 8 })
  .line(72, 42, 186, 42).line(72, 56, 186, 56).text(129, 36, '11 kV line', { size: 8 }).text(129, 70, 'total resistance 6.0 Ω', { size: 8 })
  .rect(186, 34, 58, 30, { fill: 'light' }).text(215, 53, 'T2', { bold: true }).text(215, 26, 'pole transformer', { size: 8 }).text(215, 78, '11 000 : 240', { size: 8 })
  .line(244, 42, 320, 42).line(244, 56, 320, 56).text(282, 36, 'low-voltage cable', { size: 8 }).text(282, 70, 'total 0.040 Ω', { size: 8 })
  .poly([[320, 64], [320, 42], [333, 30], [346, 42], [346, 64]], { closed: true, fill: 'light' })
  .poly([[348, 64], [348, 42], [361, 30], [374, 42], [374, 64]], { closed: true, fill: 'light' }).text(347, 78, 'houses', { size: 8 })
const vtab = { kind: 'data_table', title: 'Table 1', columns: ['Point', 'RMS voltage (V)'],
  rows: [['output of T1', '11 000'], ['input of T2', ''], ['output of T2', ''], ['at the houses', '']] }
S.q(EL, 'advanced', t`A transformer T1 at a zone substation supplies 110 kW at 11.0 kV (RMS) to an 11 kV line with a total resistance of 6.0 Ω. At the end of the line, a pole transformer T2 with a turns ratio of 11 000 : 240 steps the voltage down. A low-voltage cable with a total resistance of 0.040 Ω carries the power from T2 to a street of houses, as shown in Figure 7. Treat T2 as ideal.`, [
  part('a', t`Calculate the current in the 11 kV line.`, 1,
    t`10.0 A`,
    t`\(I = \frac{P}{V} = \frac{110 \times 10^3}{11.0 \times 10^3} = 10.0\) A.`, { unit: 'A' }),
  part('b', t`Calculate the voltage at the input of T2 and the voltage at the output of T2, and write them in Table 1.`, 2,
    t`Input of T2: 10 940 V; output of T2: 239 V (238.7 V)`,
    t`The voltage drop along the line is \(IR = 10.0 \times 6.0 = 60\) V, so the input of T2 is \(11\,000 - 60 = 10\,940\) V, and the output is \(10\,940 \times \frac{240}{11\,000} = 238.7\) V. 1 mark for each voltage. Common error: \(11\,000 \times \frac{240}{11\,000} = 240\) V, which ignores the drop along the line.`,
    { diagram: vtab, lines: 5 }),
  part('c', t`Calculate the current in the low-voltage cable.`, 1,
    t`458 A`,
    t`For an ideal transformer \(V_pI_p = V_sI_s\), so \(I_s = 10.0 \times \frac{11\,000}{240} = 458\) A.`, { unit: 'A' }),
  part('d', t`Calculate the voltage at the houses, and write it in Table 1.`, 1,
    t`220 V`,
    t`\(238.7 - 458 \times 0.040 = 238.7 - 18.3 = 220\) V.`, { unit: 'V' }),
  part('e', t`Calculate the power lost in the low-voltage cable.`, 1,
    t`8.4 × 10³ W`,
    t`\(P = I^2R = 458^2 \times 0.040 = 8.4 \times 10^3\) W.`, { unit: 'W' }),
  part('f', t`The power lost in the 11 kV line is 600 W. Explain why the low-voltage cable loses far more power, even though its resistance is 150 times smaller.`, 2,
    t`The power lost is \(I^2R\). The current in the low-voltage cable is 45.8 times the current in the 11 kV line, so \(I^2\) is about 2100 times larger, which far outweighs the 150 times smaller resistance: the loss is about 14 times larger. This is why power is carried at high voltage (and low current) for as much of the distance as possible.`,
    t`1 mark for \(P = I^2R\) with the much larger current, 1 mark for comparing the squared current ratio with the resistance ratio.`),
], { diagram: grid.done('Figure 7') })

// Microwave double slit: barrier at x = 120 (slits 34 px apart), detector line at x = 270.
const mw = drawing(320, 140)
mw.rect(10, 52, 40, 26, { fill: 'light' }).poly([[50, 58], [64, 50], [64, 80], [50, 72]], { closed: true, fill: 'light' }).text(37, 94, 'transmitter', { size: 8 })
  .slits(120, 10, 120, [48, 82], 4).dim(110, 48, 110, 82, '15 cm', { offset: 16, size: 8.5 })
  .line(270, 10, 270, 112, { dash: true }).rect(264, 58, 12, 12, { fill: 'mid' }).text(280, 67, 'detector', { anchor: 'start', size: 8 })
  .dim(120, 120, 270, 120, '1.50 m', { offset: -6, size: 8.5 })
S.q(LM, 'proficient', t`A microwave transmitter emits microwaves of wavelength 2.8 cm towards a metal barrier containing two narrow slits 15 cm apart. A detector moved along a line parallel to the barrier, 1.50 m beyond it, records a pattern of maxima and minima, as shown in Figure 8.`, [
  part('a', t`The detector is at the second minimum from the central maximum. Calculate the path difference from the two slits to the detector.`, 1,
    t`4.2 cm`,
    t`The second minimum has a path difference of \(1\frac{1}{2}\lambda = 1.5 \times 2.8 = 4.2\) cm.`, { unit: 'cm' }),
  part('b', t`Calculate the distance between adjacent maxima along the detector’s line.`, 2,
    t`0.28 m`,
    t`\(\Delta x = \frac{\lambda L}{d} = \frac{0.028 \times 1.50}{0.15} = 0.28\) m. 1 mark for the substitution in consistent units, 1 mark for the value.`, { unit: 'm' }),
  part('c', t`Calculate the energy of one microwave photon, in electronvolts.`, 1,
    t`4.4 × 10⁻⁵ eV`,
    t`\(E = \frac{hc}{\lambda} = \frac{4.14 \times 10^{-15} \times 3.00 \times 10^8}{0.028} = 4.4 \times 10^{-5}\) eV.`, { unit: 'eV' }),
  part('d', t`A clean zinc plate (work function 4.3 eV) is placed in an intense microwave beam. Explain why no photoelectrons are emitted, however intense the beam.`, 2,
    t`Each photoelectron is released by absorbing a single photon, and each microwave photon has only about \(4 \times 10^{-5}\) eV, far less than the 4.3 eV work function. A more intense beam delivers more photons each second, but it does not increase the energy of each photon, so no electron can escape.`,
    t`1 mark for one photon per electron with a photon energy below the work function, 1 mark for intensity changing the number of photons, not their energy.`),
], { diagram: mw.done('Figure 8') })

S.q(LM, 'proficient', t`A small spacecraft carries a thin sail that reflects all the light falling on it. A laser on Earth directs a beam of power 50 kW and wavelength 1064 nm perpendicular to the sail. All the light reaches the sail and is reflected straight back.`, [
  part('a', t`Calculate the momentum of one photon in the beam.`, 1,
    t`6.23 × 10⁻²⁸ kg m s⁻¹`,
    t`\(p = \frac{h}{\lambda} = \frac{6.63 \times 10^{-34}}{1064 \times 10^{-9}} = 6.23 \times 10^{-28}\) kg m s⁻¹.`, { unit: 'kg m s⁻¹' }),
  part('b', t`Calculate the number of photons striking the sail each second.`, 2,
    t`2.67 × 10²³`,
    t`\(E = \frac{hc}{\lambda} = \frac{6.63 \times 10^{-34} \times 3.00 \times 10^8}{1064 \times 10^{-9}} = 1.87 \times 10^{-19}\) J per photon, so \(n = \frac{50 \times 10^3}{1.87 \times 10^{-19}} = 2.67 \times 10^{23}\) each second. 1 mark for the photon energy in joules, 1 mark for the number.`),
  part('c', t`Show that the force exerted by the beam on the sail is about 3.3 × 10⁻⁴ N.`, 2,
    t`Each reflected photon’s momentum reverses, a change of \(2p\): \(F = n \times 2p = 2.67 \times 10^{23} \times 2 \times 6.23 \times 10^{-28} = 3.3 \times 10^{-4}\) N.`,
    t`1 mark for a change in momentum of \(2p\) per photon, 1 mark for the force as the rate of change of momentum. (Equivalently \(F = \frac{2P}{c} = \frac{2 \times 50 \times 10^3}{3.00 \times 10^8}\).)`),
  part('d', t`Explain why the force would be only half as large if the sail absorbed the light instead of reflecting it.`, 1,
    t`An absorbed photon’s momentum changes from \(p\) to zero, a change of \(p\); a reflected photon’s changes from \(p\) to \(-p\), a change of \(2p\). The force is the rate of change of momentum, so it halves.`,
    t`Comparing the change in momentum of each photon earns the mark.`),
])

// Michelson–Morley interferometer: beam splitter at (130, 83).
const mm = drawing(270, 172)
mm.rect(8, 74, 34, 18, { fill: 'light' }).text(28, 106, 'light source', { size: 8 })
  .arrow(42, 83, 118, 83, { w: 1 }).line(120, 93, 140, 73, { w: 2.2 }).line(130, 83, 230, 83, { w: 1 }).line(232, 68, 232, 98, { w: 3 }).text(238, 86, 'mirror', { anchor: 'start', size: 8 })
  .line(130, 83, 130, 22, { w: 1 }).line(114, 20, 146, 20, { w: 3 }).text(152, 23, 'mirror', { anchor: 'start', size: 8 })
  .arrow(130, 83, 130, 142, { w: 1 }).rect(116, 144, 28, 14, { fill: 'mid' }).text(150, 155, 'detector (fringes)', { anchor: 'start', size: 8 })
  .text(186, 77, 'arm 1', { size: 8 }).text(124, 52, 'arm 2', { anchor: 'end', size: 8 }).text(146, 104, 'half-silvered mirror', { anchor: 'start', size: 8 })
S.q(LM, 'proficient', t`In 1887 Michelson and Morley used an interferometer, shown in Figure 9, to try to detect Earth’s motion through the ‘aether’, a medium that light was then thought to need. Light from one source is split into two beams that travel along perpendicular arms, are reflected, and recombine to form an interference pattern.`, [
  part('a', t`Describe what Michelson and Morley expected to observe as they rotated the apparatus, and why.`, 2,
    t`They expected the interference fringes to shift. If light travelled at a fixed speed relative to the aether, Earth’s motion through the aether would make the speed of light relative to the apparatus depend on direction, so the travel times along the two arms would differ; rotating the apparatus would change this difference and move the fringes.`,
    t`1 mark for the expected fringe shift, 1 mark for the reason (the speed of light relative to the apparatus depending on its direction of travel).`),
  part('b', t`State what they observed, and what this result suggests about the speed of light.`, 1,
    t`No fringe shift (a null result): the speed of light is the same in every direction, whatever Earth’s motion, so there is no detectable aether.`,
    t`Both the null result and its meaning are needed for the mark.`),
  part('c', t`An identical interferometer is set up inside a spacecraft moving at \(0.60c\) relative to Earth. State what its crew would observe when they rotate it, and give a reason based on Einstein’s postulates.`, 1,
    t`No fringe shift. The laws of physics are the same in all inertial frames of reference, and the speed of light in a vacuum is the same for all observers.`,
    t`Either postulate, correctly applied, earns the mark.`),
  part('d', t`Each arm of this interferometer is 1.20 m long, measured in the spacecraft. Calculate the length of an arm aligned with the spacecraft’s motion, as measured by an observer on Earth.`, 2,
    t`0.96 m`,
    t`\(\gamma = \frac{1}{\sqrt{1 - 0.60^2}} = 1.25\). The 1.20 m is the proper length (measured at rest relative to the arm), so \(L = \frac{L_0}{\gamma} = \frac{1.20}{1.25} = 0.96\) m. 1 mark for \(\gamma\), 1 mark for the contracted length. Common error: \(1.20 \times 1.25 = 1.50\) m.`, { unit: 'm' }),
], { diagram: mm.done('Figure 9') })

const ring = V => 50 / Math.sqrt(V)
S.q(LM, 'advanced', t`In an electron diffraction tube, electrons accelerated from rest through a potential difference \(V\) pass through a thin layer of graphite and form rings on a fluorescent screen. Figure 10 shows how the radius \(r\) of one ring varies with \(V\).`, [
  part('a', t`Calculate the de Broglie wavelength of the electrons when \(V = 4.0\) kV.`, 2,
    t`1.94 × 10⁻¹¹ m`,
    t`\(p = \sqrt{2m_eqV} = \sqrt{2 \times 9.11 \times 10^{-31} \times 1.60 \times 10^{-19} \times 4000} = 3.41 \times 10^{-23}\) kg m s⁻¹ and \(\lambda = \frac{h}{p} = \frac{6.63 \times 10^{-34}}{3.41 \times 10^{-23}} = 1.94 \times 10^{-11}\) m. 1 mark for the momentum, 1 mark for the wavelength. Common error: \(\lambda = \frac{hc}{E}\), which treats the electron as a photon.`, { unit: 'm' }),
  part('b', t`Use Figure 10 to determine the radius of the ring when \(V = 4.0\) kV. Hence predict the accelerating voltage that would make the radius 12.5 mm.`, 2,
    t`25 mm; 16 kV`,
    t`The radius is proportional to the wavelength, and \(\lambda = \frac{h}{\sqrt{2m_eqV}} \propto \frac{1}{\sqrt{V}}\). Halving the radius from 25 mm needs half the wavelength, so four times the voltage: 16 kV. 1 mark for reading 25 mm, 1 mark for 16 kV with the reasoning. Common error: 8.0 kV, from assuming \(r \propto \frac{1}{V}\).`),
  part('c', t`Explain why the radius of the ring decreases as the accelerating voltage increases.`, 2,
    t`A larger voltage gives the electrons more kinetic energy and momentum, so their de Broglie wavelength, \(\lambda = \frac{h}{p}\), is shorter. The spacing of the carbon atoms in the graphite is fixed, and the amount of diffraction depends on \(\frac{\lambda}{d}\), so a shorter wavelength is diffracted through smaller angles, giving smaller rings.`,
    t`1 mark for a higher voltage giving a greater momentum and shorter wavelength, 1 mark for less diffraction (a smaller angle) with the fixed atomic spacing.`),
], { diagram: { kind: 'function_graph', xMin: 0, xMax: 10, yMin: 0, yMax: 40, xStep: 1, yStep: 5, xLabel: 'V (kV)', yLabel: 'r (mm)', width: 340, grid: true,
  curves: [{ points: curve(ring, 2, 10, 60) }], points: [2, 4, 6, 8, 10].map(V => ({ x: V, y: ring(V) })), caption: 'Figure 10' } })

const springTab = { kind: 'data_table', title: 'Table 2', columns: ['Mass (g)', 'Load F (N)', 'Extension x (cm)'],
  rows: [['100', '0.981', '2.5'], ['200', '1.96', '4.8'], ['300', '', '7.4'], ['400', '3.92', '9.9'], ['500', '4.91', '12.2']] }
S.q(IN, 'advanced', t`Students investigate how the extension of a spring depends on the load hung from it, so that they can use the spring in a homemade spring balance. They hang slotted masses from the spring and measure its extension \(x\) with a metre ruler. Their results are shown in Table 2.`, [
  part('a', t`Identify the independent variable and the dependent variable in this investigation, and one variable that must be controlled.`, 2,
    t`Independent: the load (the weight of the hanging masses). Dependent: the extension of the spring. Controlled: for example, the same spring throughout, or measuring every extension from the same reference point.`,
    t`1 mark for both the independent and dependent variables, 1 mark for a valid controlled variable.`),
  part('b', t`Calculate the missing load in Table 2.`, 1,
    t`2.94 N`,
    t`\(F = mg = 0.300 \times 9.81 = 2.94\) N.`, { unit: 'N' }),
  part('c', t`On the axes below, plot the load \(F\) against the extension \(x\), and draw a line of best fit.`, 3,
    t`Five points close to a straight line through the origin, from (2.5, 0.98) to (12.2, 4.91).`,
    t`Marks: 1 for correctly plotted points (including the calculated value); 1 for a straight line of best fit; 1 for a line through (or very close to) the origin, as Hooke’s law predicts.`,
    { diagram: axes({ xMin: 0, xMax: 14, yMin: 0, yMax: 6, xStep: 1, yStep: 0.5, xLabel: 'x (cm)', yLabel: 'F (N)', width: 360 }) }),
  part('d', t`Determine the gradient of your line, including its unit, and hence the spring constant in N m⁻¹.`, 2,
    t`About 0.40 N cm⁻¹, so \(k \approx 40\) N m⁻¹ (accept 38–42 N m⁻¹)`,
    t`For example, the line passes through (0, 0) and (12.5, 5.0): gradient \(= \frac{5.0}{12.5} = 0.40\) N cm⁻¹ \(= 40\) N m⁻¹. The gradient of \(F\) against \(x\) is the spring constant, since \(F = kx\). 1 mark for a gradient taken from the line with its unit, 1 mark for \(k\) in N m⁻¹.`),
  part('e', t`Use your graph to determine the elastic potential energy stored in the spring when its extension is 10.0 cm.`, 1,
    t`0.20 J`,
    t`The area under the line up to 10.0 cm: \(\frac{1}{2} \times 0.100 \times 4.0 = 0.20\) J (or \(\frac{1}{2}kx^2 = \frac{1}{2} \times 40 \times 0.100^2\)).`, { unit: 'J' }),
  part('f', t`Another group’s ruler was positioned so that every extension they recorded was 0.5 cm too large. State the type of error this is, and its effect on the spring constant they determined.`, 1,
    t`A systematic error. It shifts every point 0.5 cm along the \(x\)-axis, so their line does not pass through the origin, but its gradient, and so the spring constant, is unaffected.`,
    t`Both the type of error and its (lack of) effect on the gradient are needed for the mark.`),
], { diagram: springTab })

export const ITEMS = S.items
