// Grade 6 Science, set 2 part B: 52 physical science and 26 Earth and space
// questions built around investigations, data and real situations rather than
// recall, tagged to the Australian Curriculum v9:
//   AC9S6U03 electrical circuits, energy transfer, renewable electricity
//   AC9S6U04 reversible and irreversible changes, changes of state
//   AC9S6U02 Earth and the planets moving around the Sun (day and night,
//            seasons, day length), with the Moon's phases
//   AC9S6I01–I05 inquiry: questions, fair tests, measuring, data, evaluating
//   AC9S6H01–H02 science as a human endeavour (space, resources)
//   AC9S5U03 light (revisited from Year 5: reflection, refraction, seeing)
// Part A (life science; earthquakes, volcanoes and extreme weather) is a
// separate file. Circuits and other apparatus are drawn with the physics
// drawing helpers.
//
//   node scripts/authoring/append-mc.mjs scripts/authoring/science/grade6-set2b.mjs grade_6 BANK_SCIENCE_G6_SET2B
//
// The correct option is written first; append-mc spreads the answer letters.
import { drawing } from '../physics/draw.mjs'

export const HEADER = `Grade 6 Science, set 2 part B (scripts/authoring/science/grade6-set2b.mjs):
circuits, changes of state, light, forces and Earth in space, with inquiry skills.`

// ─── Drawings ────────────────────────────────────────────────────────────────

/** A closed switch on a horizontal wire: the lever lies flat across the gap. */
const switchClosed = (d, x1, y, x2) => {
  const mx = (x1 + x2) / 2
  return d.line(x1, y, x2, y).dot(mx - 10, y, 1.8).dot(mx + 10, y, 1.8)
}

const openSwitchCircuit = (() => {
  const d = drawing(230, 128)
  d.cell(30, 28, 200, 28, 'battery')
    .line(30, 28, 30, 100).line(200, 28, 200, 100)
    .switchOpen(30, 100, 115).lamp(115, 100, 200, 100)
    .text(72, 120, 'switch', { size: 8.5 }).text(157, 120, 'globe', { size: 8.5 })
  return d.done()
})()

const fourCircuits = (() => {
  const d = drawing(440, 132)
  ;['P', 'Q', 'R', 'S'].forEach((name, k) => {
    const ox = 10 + k * 110
    d.cell(ox, 30, ox + 90, 30, 'battery').line(ox + 90, 30, ox + 90, 95)
    if (name === 'R') d.line(ox, 30, ox, 55).line(ox, 68, ox, 95)
    else d.line(ox, 30, ox, 95)
    if (name === 'Q') d.switchOpen(ox, 95, ox + 45).lamp(ox + 45, 95, ox + 90, 95)
    else if (name === 'S') {
      d.line(ox, 95, ox + 10, 95).rect(ox + 10, 90, 28, 10, { fill: 'light' }).line(ox + 38, 95, ox + 45, 95)
        .lamp(ox + 45, 95, ox + 90, 95).text(ox + 24, 84, 'plastic', { size: 7.5 })
    } else d.lamp(ox, 95, ox + 90, 95)
    d.text(ox + 45, 124, `Circuit ${name}`, { size: 9, bold: true })
  })
  return d.done()
})()

const twoSwitchMotor = (() => {
  const d = drawing(260, 128)
  d.cell(30, 28, 230, 28, 'battery').line(30, 28, 30, 100).line(230, 28, 230, 100)
    .switchOpen(30, 100, 100)
  switchClosed(d, 100, 100, 165)
  d.meter(165, 100, 230, 100, 'M')
    .text(65, 120, 'A (door)', { size: 8.5 }).text(132, 120, 'B (start button)', { size: 8.5 })
    .text(198, 120, 'motor', { size: 8.5 })
  return d.done()
})()

const twoGlobeLoop = (() => {
  const d = drawing(240, 128)
  d.cell(30, 28, 210, 28, 'battery').line(30, 28, 30, 100).line(210, 28, 210, 100)
    .lamp(30, 100, 120, 100).lamp(120, 100, 210, 100)
    .text(75, 120, 'globe X', { size: 8.5 }).text(165, 120, 'globe Y', { size: 8.5 })
  return d.done()
})()

const conductorTester = (() => {
  const d = drawing(270, 126)
  d.cell(30, 28, 210, 28, 'battery').line(30, 28, 30, 100).lamp(210, 28, 210, 100)
    .text(224, 67, 'globe', { size: 8.5, anchor: 'start' })
    .line(30, 100, 95, 100).dot(95, 100, 2.6).dot(150, 100, 2.6).line(150, 100, 210, 100)
    .text(95, 116, 'clip X', { size: 8.5 }).text(150, 116, 'clip Y', { size: 8.5 })
    .text(122.5, 94, 'gap', { size: 8 })
  return d.done()
})()

const mirrorRay = (() => {
  const d = drawing(260, 140)
  const tan40 = Math.tan((40 * Math.PI) / 180)
  d.ground(40, 220, 120).line(40, 119, 220, 119, { w: 2.2 })
    .text(226, 123, 'mirror', { size: 8.5, anchor: 'start' })
    .line(130, 119, 130, 22, { dash: true })
    .arrow(130 - 80 * tan40, 119 - 80, 130, 119)
    .text(62, 28, 'light from a torch', { size: 8 })
    .angle(130, 119, 26, 90, 130, '40°')
  return d.done()
})()

const solarStill = (() => {
  const d = drawing(300, 146)
  d.line(10, 50, 90, 50, { w: 1.2 }).line(210, 50, 290, 50, { w: 1.2 })
    .poly([[90, 50], [110, 122], [190, 122], [210, 50]], { w: 1.2 })
    .rect(130, 96, 40, 26, { fill: 'white' }).text(150, 113, 'cup', { size: 8.5 })
    .poly([[78, 47], [150, 83], [222, 47]], { w: 1.4 })
    .circle(150, 76, 6, { fill: 'dark' }).text(150, 64, 'stone', { size: 8 })
    .circle(112, 68, 1.6, { fill: 'black' }).circle(126, 75, 1.6, { fill: 'black' })
    .circle(174, 75, 1.6, { fill: 'black' }).circle(188, 68, 1.6, { fill: 'black' })
    .circle(150, 90, 1.6, { fill: 'black' })
    .text(250, 38, 'plastic sheet', { size: 8 }).line(240, 42, 214, 51)
    .text(150, 138, 'wet sand in a hole', { size: 8 })
    .circle(40, 22, 10, { fill: 'light' }).text(58, 25, 'Sun', { size: 8.5, anchor: 'start' })
  return d.done()
})()

const dayNight = (() => {
  const d = drawing(280, 150)
  const cx = 170, cy = 72, r = 52
  for (const y of [38, 72, 106]) d.arrow(12, y, 76, y, { w: 1 })
  d.text(44, 24, 'sunlight', { size: 8.5 })
  const half = []
  for (let a = -90; a <= 90; a += 10) half.push([cx + r * Math.cos((a * Math.PI) / 180), cy - r * Math.sin((a * Math.PI) / 180)])
  d.poly(half, { closed: true, fill: 'mid' }).circle(cx, cy, r)
  d.dot(140, 58, 2.6).text(140, 50, 'A', { size: 9, bold: true })
  d.dot(200, 88, 2.6).text(200, 80, 'B', { size: 9, bold: true })
  d.text(140, 140, 'day', { size: 8.5 }).text(200, 140, 'night', { size: 8.5 })
  return d.done()
})()

const tiltedOrbit = (() => {
  const d = drawing(400, 150)
  const sx = 200, sy = 72
  const ring = []
  for (let a = 0; a < 360; a += 10) ring.push([sx + 140 * Math.cos((a * Math.PI) / 180), sy + 42 * Math.sin((a * Math.PI) / 180)])
  d.poly(ring, { closed: true, dash: true })
  d.circle(sx, sy, 22, { fill: 'light' }).text(sx, sy + 3, 'Sun', { size: 9 })
  const tilt = (23.5 * Math.PI) / 180
  const earth = (cx, label, nightSide) => {
    const half = []
    for (let a = -90; a <= 90; a += 10) {
      const t = (a * Math.PI) / 180
      half.push([cx + nightSide * 18 * Math.cos(t), sy - 18 * Math.sin(t)])
    }
    d.circle(cx, sy, 18, { fill: 'white' }).poly(half, { closed: true, fill: 'light' }).circle(cx, sy, 18)
    const ax = 28 * Math.sin(tilt), ay = 28 * Math.cos(tilt)
    const ex = 17 * Math.cos(tilt), ey = 17 * Math.sin(tilt)
    d.line(cx - ax, sy + ay, cx + ax, sy - ay, { w: 1.2 })
      .line(cx - ex, sy - ey, cx + ex, sy + ey, { dash: true })
      .text(cx + ax + 4, sy - ay - 3, 'N', { size: 8.5, bold: true })
      .text(cx - ax - 4, sy + ay + 10, 'S', { size: 8.5, bold: true })
      .text(cx, 143, label, { size: 9, bold: true })
  }
  earth(60, 'Position P', -1)
  earth(340, 'Position Q', 1)
  return d.done()
})()

// ─── Shared data displays ────────────────────────────────────────────────────

const conductorResults = {
  kind: 'data_table',
  title: "Results from Ella's circuit tester",
  columns: ['Object', 'Material', 'Did the globe light?'],
  rows: [
    ['Wire', 'Copper', 'Yes'],
    ['Ruler', 'Plastic', 'No'],
    ['Eraser', 'Rubber', 'No'],
    ['Pencil lead', 'Graphite', 'Yes, dimly'],
    ['Marble', 'Glass', 'No'],
    ['Foil', 'Aluminium', 'Yes'],
  ],
  rowHeader: true,
}

const batteryTrials = {
  kind: 'data_table',
  title: 'How long each battery kept the torch shining',
  columns: ['Brand', 'Trial 1 (hours)', 'Trial 2 (hours)', 'Trial 3 (hours)'],
  rows: [
    ['Brand A', 9, 11, 10],
    ['Brand B', 14, 6, 13],
  ],
  rowHeader: true,
}

const solarMonths = {
  kind: 'bar_chart',
  title: "Electricity made by the school's solar panels",
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [{ label: '', values: [620, 560, 480, 390, 310, 250, 270, 350, 440, 530, 600, 660] }],
  yMax: 700,
  yStep: 100,
  yLabel: 'Electricity (kWh)',
}

const meltingIce = {
  kind: 'line_graph',
  title: 'Heating a beaker of crushed ice',
  xLabels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  series: [{ label: 'Temperature', values: [-10, -4, 0, 0, 0, 0, 0, 8, 16, 24, 32] }],
  yMin: -10,
  yMax: 40,
  yStep: 10,
  xLabel: 'Time (minutes)',
  yLabel: 'Temperature (°C)',
}

const evaporationDishes = {
  kind: 'bar_chart',
  title: 'Water evaporated in three days (each started with 200 mL)',
  categories: ['Narrow glass', 'Mug', 'Bowl', 'Baking tray'],
  series: [{ label: '', values: [10, 25, 60, 120] }],
  yMax: 140,
  yStep: 20,
  yLabel: 'Water evaporated (mL)',
}

const rustingNails = {
  kind: 'data_table',
  title: 'Iron nails after one week',
  columns: ['Tube', 'What the nail was kept in', 'Rust after one week'],
  rows: [
    ['1', 'Dry air (no water)', 'None'],
    ['2', 'Boiled water with oil on top (no air)', 'None'],
    ['3', 'Tap water and air', 'Some'],
    ['4', 'Salt water and air', 'A lot'],
  ],
  rowHeader: true,
}

const sugarCube = {
  kind: 'bar_chart',
  title: 'Time for a sugar cube to dissolve',
  categories: ['10 °C', '25 °C', '40 °C', '60 °C'],
  series: [{ label: '', values: [180, 120, 80, 40] }],
  yMax: 200,
  yStep: 20,
  xLabel: 'Temperature of the water',
  yLabel: 'Time (seconds)',
}

const flagpoleShadow = {
  kind: 'line_graph',
  title: "Length of the flagpole's shadow",
  xLabels: ['8 am', '9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm', '3 pm', '4 pm'],
  series: [{ label: 'Shadow', values: [12, 8, 5, 4, 3, 4, 5, 8, 12] }],
  yMin: 0,
  yMax: 14,
  yStep: 2,
  xLabel: 'Time of day',
  yLabel: 'Length (m)',
}

const rampSurfaces = {
  kind: 'bar_chart',
  title: 'How far the toy car rolled after leaving the ramp',
  categories: ['Tiles', 'Carpet', 'Sandpaper', 'Bubble wrap'],
  series: [{ label: '', values: [240, 110, 60, 150] }],
  yMax: 260,
  yStep: 20,
  yLabel: 'Distance (cm)',
}

const planets = {
  kind: 'data_table',
  title: 'The four planets closest to the Sun',
  columns: ['Planet', 'Average distance from the Sun (million km)', 'Time to orbit the Sun once (Earth days)'],
  rows: [
    ['Mercury', 58, 88],
    ['Venus', 108, 225],
    ['Earth', 150, 365],
    ['Mars', 228, 687],
  ],
  rowHeader: true,
}

const dayLength = {
  kind: 'line_graph',
  title: 'Hours of daylight in the middle of each month',
  xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    { label: 'Hobart', values: [15, 13.8, 12.4, 11, 9.8, 9, 9.3, 10.4, 11.8, 13.2, 14.5, 15.3] },
    { label: 'Darwin', values: [12.6, 12.4, 12.1, 11.8, 11.5, 11.4, 11.4, 11.6, 12, 12.3, 12.6, 12.7], dashed: true },
  ],
  yMin: 8,
  yMax: 16,
  yStep: 1,
  xLabel: 'Month',
  yLabel: 'Hours of daylight',
}

const RAW = [
  // ─── Physical science: electrical circuits (AC9S6U03) ──────────────────────
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6U03',
    diagram: openSwitchCircuit,
    q: 'Jack builds the circuit shown below, but the globe does not light up.\nWhat should he do to make the globe light?',
    options: [
      'Close the switch so the circuit is a complete loop',
      'Add a second globe next to the first one',
      'Turn the battery around the other way',
      'Use shorter wires between the parts',
    ],
    e: 'The switch is open, which leaves a gap in the circuit, so electricity cannot flow. Closing the switch completes the loop and the globe lights. Turning the battery around or changing the wires does not close the gap.',
  },
  {
    topic: 'physical_science',
    d: 'foundation',
    code: 'AC9S6U03',
    diagram: fourCircuits,
    q: 'Each circuit below has a battery and a globe.\nWhich circuit will make the globe light up?',
    options: ['Circuit P', 'Circuit Q', 'Circuit R', 'Circuit S'],
    e: 'Electricity only flows around a complete, unbroken loop, and only circuit P has one. Circuit Q has an open switch, circuit R has a break in the wire, and circuit S has a piece of plastic in the loop, which is an insulator.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6U03',
    diagram: conductorTester,
    q: 'Ella made the tester below to find out which materials let electricity flow. She places each object across the gap between clip X and clip Y.\nWhich object will make the globe light up?',
    options: ['A steel paper clip', 'A rubber band', 'A wooden pop stick', 'A plastic drinking straw'],
    e: 'Steel is a metal, and metals are good conductors, so the paper clip closes the gap and completes the circuit. Rubber, wood and plastic are insulators: they do not let electricity flow, so the globe stays off.',
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S6I05',
    diagram: conductorResults,
    q: 'Ella tested six objects with her circuit tester. The table shows her results.\nWhich result shows that the claim “only metals conduct electricity” is wrong?',
    options: [
      'The pencil lead (graphite) made the globe light dimly.',
      'The copper wire made the globe light.',
      'The plastic ruler did not make the globe light.',
      'The glass marble did not make the globe light.',
    ],
    e: 'Graphite is not a metal, yet it let enough electricity through to light the globe dimly, so metals are not the only conductors. The copper and aluminium results agree with the claim, and the plastic and glass results only show that those materials are insulators.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6U03',
    diagram: conductorResults,
    q: "Ella's table shows which objects made the globe light in her circuit tester.\nWhich material in the table is the best choice for the outside cover of a power plug?",
    options: ['Plastic', 'Aluminium', 'Copper', 'Graphite'],
    e: 'A plug cover must stop electricity reaching your hand, so it must be an insulator. Plastic did not light the globe, so it is an insulator. Aluminium, copper and graphite all conducted electricity in the test.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6U03',
    diagram: twoSwitchMotor,
    q: 'A washing machine should only run when its door is shut and the start button is pressed. The circuit below models this with two switches in one loop.\nSwitch A (the door) is open and switch B (the start button) is closed. What happens?',
    options: [
      'The motor stays off until switch A is closed too.',
      'The motor runs, because switch B is closed.',
      'The motor runs slowly, because only one switch is closed.',
      'The motor runs until switch B is opened again.',
    ],
    e: 'Both switches are in the same single loop, so electricity can only flow when every switch in the loop is closed. While the door switch is open there is a gap, so the motor cannot run. This keeps people safe if the door is open.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6U03',
    diagram: twoGlobeLoop,
    q: 'Mei builds the circuit below. Globe X and globe Y are in one loop, and both are lit.\nMei unscrews globe X. What happens to globe Y?',
    options: [
      'It goes out, because the loop is now broken.',
      'It gets brighter, because it gets all the electricity.',
      'It stays exactly as bright as before.',
      'It gets dimmer but stays on.',
    ],
    e: 'In a single loop (a series circuit) there is only one path for electricity. Removing globe X leaves a gap in that path, so no electricity can reach globe Y and it goes out too.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6I04',
    diagram: {
      kind: 'bar_chart',
      title: 'Brightness of one globe as more globes are added',
      categories: ['1 globe', '2 globes', '3 globes', '4 globes'],
      series: [{ label: '', values: [240, 70, 30, 15] }],
      yMax: 260,
      yStep: 20,
      xLabel: 'Number of globes in the single loop',
      yLabel: 'Light meter reading (lux)',
    },
    q: 'Arjun added identical globes, one at a time, to a circuit with one battery and a single loop. Each time, he measured how bright one globe was.\nWhich statement describes his results?',
    options: [
      'The more globes in the loop, the dimmer each globe was.',
      'The more globes in the loop, the brighter each globe was.',
      'Adding more globes made no difference to the brightness.',
      'Each extra globe made the globe exactly half as bright.',
    ],
    e: 'Each time a globe was added, the reading fell, from 240 lux to 70, 30 and then 15 lux. The energy from one battery is shared between more globes, so each one is dimmer. The readings do not halve exactly each time.',
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S6I02',
    diagram: {
      kind: 'data_table',
      title: "Priya's fruit battery test",
      columns: ['Fruit', 'Metal strips', 'Gap between strips (cm)', 'Meter reading (volts)'],
      rows: [
        ['Lemon', 'Copper and zinc', 2, 0.9],
        ['Orange', 'Copper and zinc', 2, 0.8],
        ['Potato', 'Copper and zinc', 5, 0.6],
        ['Apple', 'Copper and iron', 2, 0.4],
      ],
      rowHeader: true,
    },
    q: 'Priya pushed two metal strips into different fruits to find out which makes the best battery. Her teacher says the test was not fair.\nBesides the fruit, which two things changed?',
    options: [
      'The gap between the strips and the metals used',
      'The fruit and the reading on the meter',
      'The reading on the meter and the metals used',
      'The gap between the strips and the reading on the meter',
    ],
    e: 'In a fair test only the variable being tested (the fruit) should change. The potato had its strips 5 cm apart instead of 2 cm, and the apple used copper and iron instead of copper and zinc. The meter reading is what Priya measured, so it is meant to change.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6I03',
    diagram: batteryTrials,
    q: 'Wei tested how long two brands of battery kept a torch shining. He tested each brand three times.\nWhy is it better to test each brand three times rather than once?',
    options: [
      'One result could be unusual, so repeating shows whether the results are reliable.',
      'Batteries last longer each time they are tested.',
      'Testing three times makes the torch shine more brightly.',
      'Repeating the test means nothing else has to be kept the same.',
    ],
    e: "Repeating a test shows whether a result is typical. Brand B's second trial (6 hours) is very different from its other two trials, so a single test could have given a misleading answer.",
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S6I05',
    diagram: batteryTrials,
    q: 'The table shows how long each brand of battery kept a torch shining. Wei concludes that Brand B batteries always last longer than Brand A batteries.\nWhy is this conclusion not supported?',
    options: [
      'In trial 2, Brand B lasted only 6 hours, less than every Brand A trial.',
      'Brand B lasted longer than Brand A in every one of the trials.',
      'Brand A lasted for more hours in total than Brand B.',
      'Each brand was tested three times instead of only once.',
    ],
    e: 'Over the three trials Brand B lasted 33 hours in total and Brand A 30 hours, so B did a little better overall. But B lasted only 6 hours in trial 2, less than any Brand A trial, so B does not “always” last longer.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6U03',
    q: 'When you switch on a torch, energy is transferred and transformed.\nWhich order of energy changes is correct?',
    options: [
      'Chemical energy in the battery, then electrical energy in the wires, then light and heat from the globe',
      'Light energy in the battery, then electrical energy in the wires, then chemical energy in the globe',
      'Electrical energy in the battery, then heat energy in the wires, then sound energy from the globe',
      'Heat energy in the battery, then light energy in the wires, then electrical energy from the globe',
    ],
    e: 'A battery stores chemical energy. When the circuit is complete it is transformed into electrical energy, which is carried through the wires to the globe. The globe transforms it into light, with some heat.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6U03',
    q: 'An old-style globe and an LED globe give out the same amount of light. After an hour, the old-style globe is too hot to touch, but the LED globe is only warm.\nWhat does this tell you?',
    options: [
      'The old-style globe turns more of its electrical energy into heat, so it wastes more energy.',
      'The LED globe turns more of its electrical energy into heat, so it wastes more energy.',
      'The old-style globe is giving out much more light energy than the LED globe.',
      'Both globes must be using exactly the same amount of electrical energy.',
    ],
    e: 'Both globes give out the same light, but the old-style globe also gives out much more heat. That heat is wasted energy, so the old globe needs more electrical energy to make the same light. This is why LED globes are cheaper to run.',
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S6I04',
    diagram: {
      kind: 'venn',
      sets: ['Conducts electricity', 'Attracted to a magnet'],
      values: { A: 7, AB: 5, B: 0, none: 8 },
      universe: 'Objects tested by Class 6R',
    },
    q: 'Class 6R tested 20 objects with a circuit tester and a magnet. The Venn diagram shows how many objects fit each group.\nWhich conclusion do the results support?',
    options: [
      'Every object that was attracted to the magnet also conducted electricity.',
      'Every object that conducted electricity was attracted to the magnet.',
      'Most of the objects tested were attracted to the magnet.',
      'None of the objects tested conducted electricity.',
    ],
    e: 'There are 0 objects in the magnet circle outside the overlap, so all 5 magnetic objects also conducted electricity. The reverse is not true: 7 conductors (such as copper or aluminium) were not attracted to the magnet. Only 5 of the 20 objects were magnetic.',
  },
  {
    topic: 'physical_science',
    d: 'foundation',
    code: 'AC9S6U03',
    q: 'The plastic coating on a heater’s power cord has worn away, and the copper wire inside is showing.\nWhy is this dangerous?',
    options: [
      'The plastic was an insulator, and touching the bare copper could give someone an electric shock.',
      'Copper is an insulator, so the heater will stop working and overheat.',
      'Without the plastic, the electricity will leak out of the wire as light.',
      'The copper will turn into plastic when the heater gets hot.',
    ],
    e: 'Copper is a good conductor, which is why it is used inside the cord. The plastic coating is an insulator that keeps the electricity inside the wire. With the copper bare, electricity could flow through anyone who touches it.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6U03',
    diagram: solarMonths,
    q: 'A school in Victoria has solar panels on its roof. The graph shows how much electricity they made each month.\nWhat is the best explanation for the low amounts in June and July?',
    options: [
      'In winter the days are shorter and the Sun is lower in the sky.',
      'The panels get tired after working hard all summer.',
      'In winter the Sun is much further away from Earth.',
      'Solar panels only work when the weather is hot.',
    ],
    e: 'In winter the Southern Hemisphere is tilted away from the Sun, so the days are shorter and sunlight arrives at a low angle. The panels receive less light energy, so they make less electricity. Panels need light, not heat, and Earth is actually closest to the Sun in early January.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6U03',
    diagram: {
      kind: 'pie_chart',
      title: "Where one state's electricity came from last year",
      sectors: [
        { label: 'Coal', value: 50, shade: 4 },
        { label: 'Gas', value: 10, shade: 3 },
        { label: 'Wind', value: 20, shade: 2 },
        { label: 'Solar', value: 15, shade: 1 },
        { label: 'Hydro', value: 5, shade: 0 },
      ],
      showPercent: true,
    },
    q: "The pie chart shows where one state's electricity came from last year.\nWhat percentage came from renewable sources?",
    options: ['40%', '35%', '50%', '60%'],
    e: 'Wind, solar and hydro are renewable sources: 20 + 15 + 5 = 40, so 40% of the electricity was renewable. Coal and gas are fossil fuels, which are non-renewable, and they make up the other 60%.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6U03',
    q: 'At a hydro-electric power station in the Snowy Mountains, water from a dam rushes down a pipe and spins a turbine. The turbine turns a generator.\nWhich energy change happens in the generator?',
    options: [
      'Movement energy is changed into electrical energy.',
      'Electrical energy is changed into movement energy.',
      'Chemical energy is changed into heat energy.',
      'Light energy is changed into electrical energy.',
    ],
    e: 'The moving water turns the turbine, and the generator changes that movement (kinetic) energy into electrical energy. An electric motor does the opposite: it changes electrical energy into movement.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6I04',
    diagram: {
      kind: 'line_graph',
      title: 'Electricity made by a small wind turbine',
      xLabels: ['0', '10', '20', '30', '40'],
      series: [{ label: 'Electricity', values: [0, 50, 400, 1100, 1500] }],
      yMin: 0,
      yMax: 1600,
      yStep: 200,
      xLabel: 'Wind speed (km/h)',
      yLabel: 'Electricity made (watts)',
    },
    q: 'A farmer recorded how much electricity her small wind turbine made at different wind speeds.\nWhich statement does the graph support?',
    options: [
      'The faster the wind, the more electricity the turbine made.',
      'The turbine made the same amount of electricity at every wind speed.',
      'The turbine made electricity even when there was no wind at all.',
      'Doubling the wind speed from 10 to 20 km/h exactly doubled the electricity.',
    ],
    e: 'The line rises all the way across the graph, so a faster wind gave more electricity. At 0 km/h the turbine made nothing. From 10 to 20 km/h the electricity rose from 50 to 400 watts, which is eight times as much, not double.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6I01',
    q: 'Which of these questions could be answered by doing a fair test in the classroom?',
    options: [
      'Does the number of batteries in a circuit change how loud a buzzer is?',
      'Why do people prefer bright lights in their kitchens?',
      'Who invented the very first battery?',
      'Are buzzers more beautiful to listen to than bells?',
    ],
    e: 'A question for a fair test names something you can change (the number of batteries) and something you can measure (how loud the buzzer is). The other questions are about opinions or history, which a fair test cannot answer.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6I04',
    q: 'Mia measured the temperature of a mug of hot chocolate every 2 minutes for 20 minutes as it cooled down.\nWhich type of graph would best show how the temperature changed over time?',
    options: ['A line graph', 'A pie chart', 'A Venn diagram', 'A picture graph'],
    e: 'A line graph shows how one measurement changes over time, so the drop in temperature can be seen at a glance. A pie chart shows parts of a whole, and a Venn diagram sorts things into groups.',
  },
  // ─── Physical science: changes of state and other changes (AC9S6U04) ──────
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S6U04',
    diagram: meltingIce,
    q: 'Mila heated a beaker of crushed ice and measured its temperature every minute.\nWhy did the temperature stay at 0 °C from minute 2 to minute 6?',
    options: [
      'The heat energy was being used to melt the ice.',
      'The heater was switched off during that time.',
      'The thermometer cannot show temperatures above 0 °C.',
      'The ice was losing heat to the air as fast as it gained it.',
    ],
    e: 'While ice is melting, the energy it takes in is used to change solid into liquid instead of raising the temperature. Once all the ice had melted (after minute 6), the temperature of the water started to rise again.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6I04',
    diagram: meltingIce,
    q: 'The graph shows the temperature of crushed ice as Mila heated it.\nAfter how many minutes had all of the ice melted?',
    options: ['6 minutes', '2 minutes', '4 minutes', '10 minutes'],
    e: 'The flat part of the graph at 0 °C shows the ice melting. It ends at 6 minutes, when the temperature starts to climb, because all the ice has become water. At 2 minutes the melting was only starting.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6U04',
    diagram: {
      kind: 'line_graph',
      title: 'Cooling melted stearic acid',
      xLabels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      series: [{ label: 'Temperature', values: [85, 77, 71, 69, 69, 69, 69, 69, 63, 57, 52] }],
      yMin: 40,
      yMax: 90,
      yStep: 5,
      xLabel: 'Time (minutes)',
      yLabel: 'Temperature (°C)',
    },
    q: 'Stearic acid is a substance used to make candles. Hamish melted some and let it cool, measuring its temperature every minute.\nAt what temperature does stearic acid freeze (turn solid)?',
    options: ['69 °C', '0 °C', '52 °C', '85 °C'],
    e: 'A substance stays at the same temperature while it changes state. The flat part of the graph at 69 °C is where the liquid was turning solid. Not every substance freezes at 0 °C: that is the freezing point of water.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6I04',
    diagram: evaporationDishes,
    q: 'Sofia put 200 mL of water in each of four containers and left them on the same windowsill for three days. The graph shows how much water evaporated from each one.\nWhich conclusion do her results support?',
    options: [
      'The larger the surface of the water, the faster it evaporates.',
      'The deeper the water, the faster it evaporates.',
      'Water evaporates at the same speed from any container.',
      'Water only evaporates from containers that are made of metal.',
    ],
    e: 'In the baking tray the water was spread out thinly, so it had the largest surface open to the air, and it lost the most (120 mL). Water evaporates from its surface, so a larger surface means faster evaporation. The deep water in the narrow glass lost only 10 mL.',
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S6U04',
    diagram: {
      kind: 'data_table',
      title: 'Weather on four days',
      columns: ['Day', 'Temperature (°C)', 'Wind', 'How damp the air is'],
      rows: [
        ['Monday', 18, 'Still', 'Very damp'],
        ['Tuesday', 30, 'Windy', 'Dry'],
        ['Wednesday', 30, 'Still', 'Very damp'],
        ['Thursday', 15, 'Windy', 'Dry'],
      ],
      rowHeader: true,
    },
    q: "Ravi's family hangs washing on the line. The table shows the weather on four days.\nOn which day would the washing dry fastest?",
    options: ['Tuesday', 'Monday', 'Wednesday', 'Thursday'],
    e: 'Water evaporates fastest when it is warm, when wind carries the water vapour away, and when the air is dry. Tuesday has all three. Wednesday is just as warm, but the air is still and damp, which slows evaporation.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6U04',
    q: 'On a hot day, Leilani takes a can of drink out of the fridge. A few minutes later, the outside of the can is covered in drops of water.\nWhere did the water come from?',
    options: [
      'Water vapour in the air cooled on the cold can and condensed.',
      'The drink leaked out through tiny holes in the can.',
      'The cold metal of the can melted into water.',
      'The can sweated, the way people do on a hot day.',
    ],
    e: 'Air contains water vapour, an invisible gas. When the vapour touches the cold can it cools and condenses into drops of liquid water. The drink cannot pass through the metal, and the drops do not even taste sweet.',
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S6U04',
    q: 'When a kettle boils, a white cloud appears a few centimetres above the spout. Right at the spout there is a small clear gap.\nWhat is the white cloud made of?',
    options: [
      'Tiny drops of liquid water that formed when the steam cooled',
      'Steam, which is water vapour that has not changed yet',
      'Smoke from the hot metal element inside the kettle',
      'Air that has been heated until it turns white',
    ],
    e: 'Steam (water vapour) is an invisible gas, which is why the gap right at the spout looks clear. As the vapour mixes with cooler air it condenses into tiny drops of liquid water, and those drops are what we see as a white cloud.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6U04',
    diagram: {
      kind: 'venn',
      sets: ['Reversible change', 'Needs heating'],
      values: { A: 'freezing', AB: 'melting', B: 'baking', none: 'rusting' },
    },
    q: 'Four changes have been sorted into the Venn diagram below.\nWhere should “frying an egg” go?',
    options: [
      'In the same region as “baking”',
      'In the same region as “melting”',
      'In the same region as “freezing”',
      'In the same region as “rusting”',
    ],
    e: 'Frying an egg needs heat, and it cannot be reversed: the cooked egg can never become raw again because new substances have formed. That matches baking, which is inside “Needs heating” but outside “Reversible change”.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6U04',
    q: 'When a candle burns, several changes happen at the same time.\nWhich of these changes is irreversible?',
    options: [
      'Wax vapour burning in the flame to make carbon dioxide and water vapour',
      'Solid wax near the wick melting into a pool of liquid wax',
      'Liquid wax running down the side and turning solid again',
      'The whole candle going soft on a warm windowsill',
    ],
    e: 'Burning makes new substances (carbon dioxide and water vapour) that cannot be turned back into wax, so it is irreversible. Melting and turning solid again are changes of state: the wax is still wax, so those changes are reversible.',
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S6I04',
    diagram: rustingNails,
    q: 'Noah put an iron nail in each of four test tubes and checked them after a week.\nWhich conclusion do his results best support?',
    options: [
      'Iron needs both water and air to rust, and salt makes it rust faster.',
      'Iron needs only air to rust, and salt stops it rusting.',
      'Iron needs only water to rust, and air slows it down.',
      'Iron rusts at the same rate whatever it is kept in.',
    ],
    e: 'The nail in dry air (air but no water) and the nail in water with no air did not rust. Rust formed only when the nail had both water and air, in tubes 3 and 4, and the salty tube had the most rust, so salt speeds rusting up.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6U04',
    diagram: rustingNails,
    q: "Noah's results for four iron nails are shown in the table.\nBased on his results, which steel bike is likely to rust fastest?",
    options: [
      'A bike left outside at a beach house, in salty sea spray',
      'A bike stored in a dry garage all year round',
      'A bike left outside in a dry desert town',
      'A bike kept indoors with its chain kept oiled',
    ],
    e: "Noah's nail rusted most in salt water with air. A bike by the sea is wet with salty spray and open to the air, so it will rust fastest. Dry places, and oil that keeps water off the metal, slow rusting down.",
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6U04',
    q: 'Kai stirs a spoonful of salt into a glass of warm water until he can no longer see it. He wants to get the salt back.\nWhat should he do?',
    options: [
      'Leave the glass in a warm place until the water evaporates',
      'Pour the salty water through a paper filter',
      'Put the glass of salty water in the freezer',
      'Stir the water faster until the salt comes back',
    ],
    e: 'Dissolved salt is spread through the water in pieces far too small for filter paper to catch. When the water evaporates, the salt is left behind in the glass, which shows that dissolving is a reversible change.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6I04',
    diagram: sugarCube,
    q: 'Isaac timed how long a sugar cube took to dissolve in water at four temperatures. He stirred each glass in the same way.\nWhat do his results show?',
    options: [
      'The warmer the water, the faster the sugar dissolved.',
      'The warmer the water, the slower the sugar dissolved.',
      'The temperature made no difference to how fast it dissolved.',
      'Sugar only dissolved in water warmer than 25 °C.',
    ],
    e: 'The bars get shorter as the water gets warmer: 180 seconds at 10 °C but only 40 seconds at 60 °C. A shorter time means faster dissolving. Taller bars here mean slower, not faster.',
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S6I04',
    diagram: sugarCube,
    q: 'The graph shows how long a sugar cube took to dissolve in water at four temperatures.\nAbout how long would a sugar cube take to dissolve in water at 50 °C?',
    options: ['About 60 seconds', 'About 30 seconds', 'About 100 seconds', 'About 120 seconds'],
    e: '50 °C is halfway between 40 °C (80 seconds) and 60 °C (40 seconds), so the time should be about halfway between those values: about 60 seconds. Warmer water would not make the sugar take longer than at 40 °C.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6U04',
    diagram: {
      kind: 'data_table',
      title: 'Melting points',
      columns: ['Substance', 'Melting point (°C)'],
      rows: [
        ['Ice', 0],
        ['Chocolate', 34],
        ['Candle wax', 60],
        ['Aluminium', 660],
      ],
      rowHeader: true,
    },
    q: 'On a hot day, the inside of a closed car parked in the sun can reach 70 °C. A room in a house is 25 °C.\nWhich substances in the table would be solid in the room but melt in the car?',
    options: [
      'Chocolate and candle wax',
      'Ice and chocolate',
      'Candle wax and aluminium',
      'Chocolate only',
    ],
    e: 'A substance melts when it gets hotter than its melting point. Chocolate (34 °C) and candle wax (60 °C) are solid at 25 °C but melt at 70 °C. Ice would already have melted in the room, and aluminium needs 660 °C.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6I03',
    diagram: { kind: 'measure', instrument: 'jug', max: 500, step: 50, level: 350, unit: 'mL', labelEvery: 100 },
    q: 'Jo poured 500 mL of water into a measuring jug and left it on a sunny windowsill. After a week the jug looked like this.\nHow much water had evaporated?',
    options: ['150 mL', '50 mL', '350 mL', '500 mL'],
    e: 'The jug now reads 350 mL. 500 − 350 = 150, so 150 mL of water evaporated into the air as water vapour. 350 mL is the water left in the jug, not the amount that evaporated.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6U04',
    diagram: solarStill,
    q: 'A survival guide shows how to make a solar still, drawn below. The Sun warms the wet sand, and drops of clean water collect on the plastic and drip into the cup.\nWhich changes of state happen in the solar still?',
    options: [
      'Water evaporates from the sand, then condenses on the plastic.',
      'Water condenses in the sand, then evaporates on the plastic.',
      'Water melts in the sand, then freezes on the plastic.',
      'Water freezes in the sand, then melts on the plastic.',
    ],
    e: 'The Sun’s energy makes water in the sand evaporate into water vapour. When the vapour touches the cooler plastic it condenses into drops, which run down to the lowest point under the stone and drip into the cup.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6U04',
    q: 'Amara adds bicarbonate of soda to vinegar in a bottle. It fizzes, and a balloon stretched over the top of the bottle blows up.\nWhat does this show?',
    options: [
      'A new substance, a gas, was made, so the change is irreversible.',
      'The vinegar evaporated, so the change is reversible.',
      'The bicarbonate of soda melted, so the change is reversible.',
      'Air from the room was sucked into the balloon, so nothing changed.',
    ],
    e: 'The bubbles are carbon dioxide, a new gas made when the two substances react. New substances cannot easily be turned back into bicarbonate of soda and vinegar, so this is an irreversible change.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6U04',
    q: 'Hana heats sugar in a pan. First it melts into a clear liquid. If she keeps heating it, it turns brown and smells of caramel.\nWhich observation shows that a new substance has formed?',
    options: [
      'It turns brown and gives off a new smell.',
      'It changes from a solid into a liquid.',
      'It spreads out to take the shape of the pan.',
      'It gets hotter the longer it is heated.',
    ],
    e: 'Melting is only a change of state: the clear liquid would set as sugar again. A change of colour and a new smell are signs that new substances have formed, so browning sugar into caramel is irreversible.',
  },
  {
    topic: 'physical_science',
    d: 'foundation',
    code: 'AC9S6U04',
    q: 'Tom melts chocolate in a bowl, pours it into a star-shaped mould and puts it in the fridge. It sets into a chocolate star.\nWhat kind of change is this?',
    options: [
      'Reversible, because it is still chocolate and could be melted again',
      'Irreversible, because the chocolate has become a new substance',
      'Irreversible, because a new shape means it is no longer chocolate',
      'Reversible, because the chocolate turned into a gas and back',
    ],
    e: 'Melting and setting are changes of state. The chocolate is the same substance the whole time, so it can be melted and set again: the change is reversible. A new shape does not mean a new substance.',
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S6U04',
    q: 'A glass bottle is filled to the top with water, sealed and put in the freezer. The next day the bottle has cracked.\nWhat is the best explanation?',
    options: [
      'Water takes up more space when it freezes into ice.',
      'Water shrinks when it freezes and pulls the glass inwards.',
      'The cold makes the glass melt and become weak.',
      'Ice is heavier than water, so it pushes out the bottom.',
    ],
    e: 'Unlike most substances, water expands when it freezes, taking up about one tenth more space. A full, sealed bottle has no room for this, so the ice pushes outwards and cracks the glass. This is also why ice floats on water.',
  },
  {
    topic: 'physical_science',
    d: 'foundation',
    code: 'AC9S6U04',
    q: 'After a morning of rain there is a large puddle on the netball court. By the afternoon, the sun has been out and the puddle has gone.\nWhere did the water go?',
    options: [
      'It evaporated into the air as water vapour.',
      'It was destroyed by the heat of the Sun.',
      'It turned into part of the court surface.',
      'It froze into ice and was blown away.',
    ],
    e: 'The Sun’s heat made the water evaporate: it changed from liquid water into water vapour, an invisible gas that mixed into the air. Water is not destroyed; it can condense again later as clouds or dew.',
  },
  // ─── Physical science: light (AC9S5U03, revisited) and forces ─────────────
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6I04',
    diagram: flagpoleShadow,
    q: "Lachlan measured the length of the school flagpole's shadow every hour on a sunny day.\nWhy was the shadow shortest at about 12 pm?",
    options: [
      'The Sun was at its highest in the sky.',
      'The Sun was at its furthest from Earth.',
      'The Sun was at its lowest in the sky.',
      'The flagpole had shrunk in the cool morning.',
    ],
    e: 'A shadow forms where an object blocks light. Around midday the Sun is highest, so its light comes steeply from above and the shadow is short. Early and late in the day the Sun is low, so the shadows are long.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6I04',
    diagram: {
      kind: 'line_graph',
      title: "Height of the puppet's shadow on the wall",
      xLabels: ['10', '20', '30', '40'],
      series: [{ label: 'Shadow', values: [60, 35, 27, 23] }],
      yMin: 0,
      yMax: 70,
      yStep: 10,
      xLabel: 'Distance from the torch to the puppet (cm)',
      yLabel: 'Height of shadow (cm)',
    },
    q: 'Chloe made a shadow puppet show. She moved the torch further from the puppet, and each time she measured the height of the shadow on the wall.\nWhich statement describes her results?',
    options: [
      'The further the torch was from the puppet, the smaller the shadow was.',
      'The further the torch was from the puppet, the bigger the shadow was.',
      'The shadow stayed the same size wherever the torch was.',
      'The shadow got bigger at first and then got smaller.',
    ],
    e: 'The line slopes down: the shadow was 60 cm tall with the torch 10 cm away but only 23 cm with it 40 cm away. A torch close to the puppet blocks light over a wide angle, so the shadow is large.',
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S5U03',
    diagram: mirrorRay,
    q: 'A ray of light from a torch hits a flat mirror, as shown below. The angle between the ray and the dashed line is 40°.\nWhen the light reflects, what will the angle be between the reflected ray and the dashed line?',
    options: ['40°', '50°', '80°', '140°'],
    e: 'Light reflects from a flat mirror at the same angle as it arrives, measured from the dashed line (the normal). So the reflected ray leaves at 40° on the other side of the dashed line. 50° is the angle between the ray and the mirror surface.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S5U03',
    q: 'Ari stands a pencil in a glass of water. Looking from the side, the pencil seems to bend where it goes into the water.\nWhat causes this?',
    options: [
      'Light changes direction as it passes from the water into the air.',
      'The water softens the pencil so that it bends.',
      'The glass reflects all of the light back into the water.',
      'The water absorbs all of the light from the pencil.',
    ],
    e: 'This is refraction. Light bends when it passes from one material into another, such as from water into air, so the part of the pencil under the water seems to be in a different place. The pencil itself is still straight.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6I04',
    diagram: {
      kind: 'data_table',
      title: 'Light passing through materials (no material: 1000 lux)',
      columns: ['Material', 'Light meter reading (lux)'],
      rows: [
        ['Clear plastic', 950],
        ['Baking paper', 450],
        ['Cardboard', 0],
        ['Aluminium foil', 0],
      ],
      rowHeader: true,
    },
    q: 'Fatima shone a torch through different materials and used a light meter to measure how much light came through.\nWhich material would be best for a window blind that lets some light in but stops people seeing into the room?',
    options: ['Baking paper', 'Clear plastic', 'Cardboard', 'Aluminium foil'],
    e: 'Baking paper let some light through (450 lux) but not all of it, so it is translucent: the room stays bright but nobody can see in clearly. Clear plastic is transparent, so people could see in. Cardboard and foil are opaque and block all the light.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S5U03',
    q: 'Jayden can read his book in a lit room, but he cannot see it at all in a room with no light.\nHow does he see the book?',
    options: [
      'Light from a light source bounces off the book and into his eyes.',
      'Light shines out of his eyes and lands on the book.',
      'The book gives out its own light, but only when the room is lit.',
      'His eyes can see in total darkness once they get used to it.',
    ],
    e: 'We see objects that are not light sources because light from a source, such as a lamp or the Sun, reflects off them and enters our eyes. With no light at all, nothing reflects into his eyes, so he sees nothing.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6I04',
    diagram: rampSurfaces,
    q: 'Oliver let a toy car roll down a ramp onto different surfaces and measured how far it went before it stopped.\nWhich surface caused the most friction?',
    options: ['Sandpaper', 'Tiles', 'Carpet', 'Bubble wrap'],
    e: 'Friction slows a moving object down. The car stopped soonest on sandpaper (60 cm), so sandpaper caused the most friction. The tiles let the car roll furthest, so they caused the least friction.',
  },
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S6I02',
    diagram: rampSurfaces,
    q: "Oliver's graph shows how far a toy car rolled on four surfaces after leaving a ramp.\nWhich of these would have made his test unfair?",
    options: [
      'Letting the car go from higher up the ramp for the carpet test',
      'Using the same toy car for every surface',
      'Letting go of the car without pushing it each time',
      'Measuring every distance with the same tape measure',
    ],
    e: 'In a fair test only the surface should change. Starting higher up would give the car more speed on the carpet, so its distance could no longer be put down to the surface alone. The other choices all keep the test fair.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S6I04',
    diagram: {
      kind: 'bar_chart',
      title: 'Average time for each parachute to fall 3 m',
      categories: ['10 cm', '20 cm', '30 cm', '40 cm'],
      series: [{ label: '', values: [1.2, 1.8, 2.6, 3.4] }],
      yMax: 4,
      yStep: 0.5,
      xLabel: 'Width of the parachute canopy',
      yLabel: 'Time (seconds)',
    },
    q: 'Zara dropped paper parachutes with different canopy widths from a height of 3 m and timed their fall.\nWhich explanation best fits her results?',
    options: [
      'A wider canopy pushes against more air, so air resistance slows it more.',
      'A wider canopy is pulled down harder by gravity, so it falls faster.',
      'A narrow canopy has no air resistance acting on it at all.',
      'A wider canopy has less mass, so it floats in the air.',
    ],
    e: 'The wider the canopy, the longer the fall took: 1.2 seconds for 10 cm but 3.4 seconds for 40 cm. A wider canopy has to push more air out of the way, so the upward push of air resistance is bigger and it falls more slowly.',
  },
  // ─── Earth and space: planets, Earth's movement and the Moon (AC9S6U02) ───
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S6I04',
    diagram: planets,
    q: 'The table shows the four planets closest to the Sun.\nWhich pattern does the table show?',
    options: [
      'The further a planet is from the Sun, the longer it takes to orbit the Sun.',
      'The further a planet is from the Sun, the faster it completes an orbit.',
      'Every one of these planets takes one Earth year to orbit the Sun.',
      'The planets are spaced at equal distances out from the Sun.',
    ],
    e: 'Going down the table, both columns increase: Mercury is closest and orbits in 88 days, while Mars is furthest and takes 687 days. A planet further out has a longer path to travel and moves more slowly.',
  },
  {
    topic: 'earth_space',
    d: 'advanced',
    code: 'AC9S6U02',
    diagram: planets,
    q: 'A “year” on a planet is the time it takes to orbit the Sun once. The table shows that a year on Mars is 687 Earth days.\nAbout how many Mars years old is a student who is 13 Earth years old?',
    options: ['About 7', 'About 13', 'About 24', 'About 3'],
    e: '13 × 365 = 4,745, so 13 Earth years is about 4,745 days. Each Mars year is 687 days, and 4,745 ÷ 687 is about 6.9, so the student is about 7 Mars years old. A Mars year is longer, so you are younger in Mars years, not older.',
  },
  {
    topic: 'earth_space',
    d: 'advanced',
    code: 'AC9S6U02',
    diagram: {
      kind: 'data_table',
      title: 'Average surface temperature of four planets',
      columns: ['Planet', 'Distance from the Sun (million km)', 'Average surface temperature (°C)'],
      rows: [
        ['Mercury', 58, 167],
        ['Venus', 108, 464],
        ['Earth', 150, 15],
        ['Mars', 228, '−65'],
      ],
      rowHeader: true,
    },
    q: 'The table shows that Venus is almost twice as far from the Sun as Mercury, yet Venus is the hottest planet.\nWhat is the best explanation?',
    options: [
      'Venus has a very thick atmosphere that traps heat.',
      'Venus is actually closer to the Sun than Mercury.',
      'Venus spins much faster, so it heats up by rubbing.',
      'Venus has no atmosphere, so nothing protects it.',
    ],
    e: 'Venus is wrapped in a very thick atmosphere, mostly carbon dioxide, which traps heat like a blanket. Mercury has almost no atmosphere, so much of its heat escapes into space, even though it is closer to the Sun.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S6U02',
    q: 'Jupiter is about 11 times as wide as Earth. In a class model of the planets, Earth is a bead 1 cm wide.\nAbout how wide should the model of Jupiter be?',
    options: ['11 cm', '1 cm', '2 cm', '110 cm'],
    e: 'In a scale model every size is multiplied by the same amount. Jupiter is 11 times as wide as Earth, so 11 × 1 = 11, and the model of Jupiter should be about 11 cm wide, about the size of a grapefruit.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S6U02',
    diagram: {
      kind: 'venn',
      sets: ['Rocky planet', 'Has at least one moon'],
      values: { A: 2, AB: 2, B: 4, none: 0 },
      universe: 'The 8 planets',
    },
    q: 'The Venn diagram sorts the eight planets of the solar system.\nWhich statement does the Venn diagram support?',
    options: [
      'Every planet that is not rocky has at least one moon.',
      'Every rocky planet has at least one moon.',
      'Most of the planets in the solar system are rocky.',
      'Two of the planets are not rocky and have no moons.',
    ],
    e: 'The 4 non-rocky planets (Jupiter, Saturn, Uranus and Neptune) are all in the moon circle, and the outside region is 0. Only 2 of the 4 rocky planets (Earth and Mars) have moons; Mercury and Venus have none.',
  },
  {
    topic: 'earth_space',
    d: 'developing',
    code: 'AC9S6U02',
    q: 'Earth travels around the Sun at about 30 kilometres every second.\nWhat keeps Earth moving in its orbit instead of flying off into space?',
    options: [
      "The Sun's gravity pulling on Earth",
      "Earth's magnetism pulling it towards the Sun",
      'The Moon pushing Earth along its path',
      'Solar wind blowing Earth around the Sun',
    ],
    e: "The Sun's gravity pulls on Earth all the time. Earth is moving sideways very fast, and the pull of gravity keeps bending its path into an orbit. The same force keeps every planet orbiting the Sun.",
  },
  {
    topic: 'earth_space',
    d: 'foundation',
    code: 'AC9S6U02',
    q: 'At night we see thousands of stars as tiny points of light, but in the day the Sun looks large and very bright.\nWhy?',
    options: [
      'The Sun is a star that is much closer to Earth than any other star.',
      'The Sun is the biggest and brightest star in the whole universe.',
      'The Sun is a planet, while the stars are much bigger objects.',
      'The other stars only give out light at night-time.',
    ],
    e: 'The Sun is a star, a huge ball of hot glowing gas, just like the stars at night. It is so much closer to us than any other star that it looks large and bright. Many stars are actually bigger and brighter than the Sun.',
  },
  {
    topic: 'earth_space',
    d: 'developing',
    code: 'AC9S6U02',
    diagram: dayNight,
    q: 'The diagram below shows sunlight falling on Earth. Town A is in daylight and town B is in darkness.\nWhy will town B be in daylight about 12 hours from now?',
    options: [
      'Earth spins on its axis once every 24 hours.',
      'The Sun travels around Earth once every 24 hours.',
      'Earth travels around the Sun once every 24 hours.',
      'The Moon moves out of the way of the sunlight.',
    ],
    e: 'Earth spins (rotates) on its axis once every 24 hours. The half facing the Sun has day and the other half has night, so as Earth turns, town B is carried around into the sunlight. Earth takes a whole year, not a day, to travel around the Sun.',
  },
  {
    topic: 'earth_space',
    d: 'developing',
    code: 'AC9S6U02',
    q: 'In Brisbane, the Sun rises in the east in the morning and sets in the west in the evening.\nWhat makes the Sun seem to move across the sky like this?',
    options: [
      'Earth spinning towards the east',
      'The Sun travelling around Earth each day',
      'Earth spinning towards the west',
      'Earth travelling around the Sun each day',
    ],
    e: 'Earth spins from west to east. As it turns, places on Earth turn towards the Sun on the eastern side (sunrise) and away from it on the western side (sunset). The Sun only seems to move; it is Earth that is turning.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S6U02',
    q: 'In June, when it is 9 am in Sydney, it is only 7 am in Perth.\nWhy are Perth’s clocks behind Sydney’s?',
    options: [
      'Earth spins towards the east, so the Sun rises in Sydney before it rises in Perth.',
      'Perth is further from the Sun than Sydney, so its sunlight arrives later.',
      'The Sun rises in the west, so Perth sees it first and sets its clocks earlier.',
      'Perth is in a different season from Sydney, so its days are shorter.',
    ],
    e: 'Sydney is about 3,300 km east of Perth. As Earth spins eastwards, Sydney turns to face the Sun first, so its day starts earlier and its clocks are set ahead. In June there is no daylight saving, so the difference is 2 hours.',
  },
  {
    topic: 'earth_space',
    d: 'advanced',
    code: 'AC9S6U02',
    diagram: dayLength,
    q: 'The graph shows the hours of daylight in Hobart and in Darwin through the year.\nWhy does the day length change much more in Hobart than in Darwin?',
    options: [
      'Hobart is much further from the equator, so the tilt of Earth’s axis affects it more.',
      'Hobart is closer to the Sun than Darwin, so it gets more sunlight in summer.',
      'Darwin is in a different time zone, so its clocks hide the changes.',
      'Darwin has more cloudy days, so its days seem to be the same length.',
    ],
    e: 'Because Earth’s axis is tilted, places far from the equator get long days in summer and short days in winter. Hobart (about 43° south) is much further from the equator than Darwin (about 12° south), where days stay close to 12 hours long all year.',
  },
  {
    topic: 'earth_space',
    d: 'developing',
    code: 'AC9S6I04',
    diagram: dayLength,
    q: 'The graph shows the hours of daylight in Hobart and Darwin through the year.\nIn which month does Hobart have its shortest days?',
    options: ['June', 'January', 'September', 'December'],
    e: "Hobart's line is lowest in June, at about 9 hours of daylight. June is winter in Australia, when the Southern Hemisphere is tilted away from the Sun. December and January have the longest days.",
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S6U02',
    diagram: tiltedOrbit,
    q: 'The diagram below shows Earth at two positions in its orbit. Earth’s axis always tilts the same way in space.\nAt which position is it summer in Australia?',
    options: [
      'Position Q, because the Southern Hemisphere is tilted towards the Sun',
      'Position P, because the Southern Hemisphere is tilted towards the Sun',
      'Position P, because the North Pole is tilted towards the Sun',
      'Neither, because both positions are the same distance from the Sun',
    ],
    e: 'Australia is in the Southern Hemisphere. At position Q the South Pole end of the axis leans towards the Sun, so Australia gets more direct sunlight and longer days: summer. At position P the North Pole leans towards the Sun, so it is summer in the north and winter in Australia.',
  },
  {
    topic: 'earth_space',
    d: 'advanced',
    code: 'AC9S6U02',
    q: 'Earth’s orbit is not quite a circle. Earth is closest to the Sun in early January and furthest from it in early July.\nWhy does this show that distance from the Sun is not the cause of the seasons?',
    options: [
      'January is summer in Australia but winter in the Northern Hemisphere, at the same distance from the Sun.',
      'January is summer everywhere on Earth, because Earth is closest to the Sun then.',
      'In July Earth is so far from the Sun that no sunlight reaches it at all.',
      'The distance changes every day, so the seasons would change every day.',
    ],
    e: 'If distance caused the seasons, the whole Earth would have summer at the same time, in January. Instead, January is summer in the Southern Hemisphere and winter in the Northern Hemisphere. The tilt of Earth’s axis, not its distance from the Sun, causes the seasons.',
  },
  {
    topic: 'earth_space',
    d: 'developing',
    code: 'AC9S6U02',
    q: 'At midday in Melbourne, the Sun is in the northern part of the sky.\nWhich way does a flagpole’s shadow point at midday?',
    options: ['South', 'North', 'East', 'West'],
    e: 'A shadow points directly away from the light source. In southern Australia the midday Sun is in the northern sky, so shadows point south. In the morning the Sun is in the east and shadows point west.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S6U02',
    diagram: {
      kind: 'data_table',
      title: "Kiara's Moon diary",
      columns: ['Date', "How much of the Moon's face was lit"],
      rows: [
        ['3 March', 'None (new moon)'],
        ['10 March', 'Half'],
        ['17 March', 'All of it (full moon)'],
        ['24 March', 'Half'],
      ],
      rowHeader: true,
    },
    q: 'Kiara looked at the Moon once a week and recorded how much of it was lit.\nAbout how long after 17 March will the next full moon be?',
    options: ['About 4 weeks', 'About 2 weeks', 'About 1 week', 'About 8 weeks'],
    e: 'The Moon goes from full moon to new moon and back to full moon in about 29½ days, roughly 4 weeks. Kiara’s diary shows 2 weeks from new moon to full moon, but a whole cycle takes twice as long.',
  },
  {
    topic: 'earth_space',
    d: 'foundation',
    code: 'AC9S6U02',
    q: 'The full moon can be bright enough to cast shadows at night.\nWhere does the Moon’s light come from?',
    options: [
      'Sunlight bouncing off the Moon',
      'The Moon makes its own light, like the Sun',
      'Light from streetlights on Earth bouncing off the Moon',
      'Starlight shining straight through the Moon',
    ],
    e: 'The Moon does not make its own light. It reflects light from the Sun, the same way a ball shines in a torch beam. Streetlights are far too dim to light up the Moon.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S6U02',
    q: 'Over about a month, the Moon seems to change shape from a thin crescent to a full circle and back again.\nWhat causes these phases?',
    options: [
      'As the Moon orbits Earth, we see different amounts of its sunlit half.',
      "Earth's shadow covers a different part of the Moon each night.",
      'Clouds high in the sky block out different parts of the Moon.',
      'The Moon really changes its shape as it spins around.',
    ],
    e: 'The Sun always lights up half of the Moon. As the Moon travels around Earth, we see more or less of that lit half, which gives the phases. Earth’s shadow only falls on the Moon during a lunar eclipse.',
  },
  // ─── Earth and space: resources and space exploration ─────────────────────
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S6H02',
    diagram: {
      kind: 'pie_chart',
      title: "Water use in the Nguyen family's home",
      sectors: [
        { label: 'Shower', value: 35, shade: 4 },
        { label: 'Toilet', value: 20, shade: 3 },
        { label: 'Laundry', value: 20, shade: 2 },
        { label: 'Garden', value: 15, shade: 1 },
        { label: 'Kitchen', value: 10, shade: 0 },
      ],
      showPercent: true,
    },
    q: 'The Nguyen family wants to use less water.\nBased on the pie chart, which change is likely to save the most water?',
    options: [
      'Taking shorter showers',
      'Using less water in the kitchen',
      'Watering the garden a little less',
      'Doing the laundry at night instead',
    ],
    e: 'Showers use the largest share of the family’s water (35%), so cutting shower time will save the most. The kitchen uses only 10%. Doing the laundry at night uses just as much water as doing it in the day.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S6I04',
    diagram: {
      kind: 'bar_chart',
      title: 'Water that drained through each soil in 5 minutes',
      categories: ['Sandy soil', 'Clay soil', 'Potting mix'],
      series: [{ label: '', values: [80, 20, 45] }],
      yMax: 100,
      yStep: 10,
      yLabel: 'Water drained (mL)',
    },
    q: 'Amira poured 100 mL of water onto three soil samples and measured how much water drained through each one.\nWhich soil held on to the most water?',
    options: ['Clay soil', 'Sandy soil', 'Potting mix', 'They all held the same amount'],
    e: 'The water that did not drain through stayed in the soil. Clay let only 20 mL through, so it held 100 − 20 = 80 mL, the most. Sandy soil held only 100 − 80 = 20 mL. A tall bar here means the soil held less water.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S6H02',
    diagram: {
      kind: 'bar_chart',
      title: 'Average rainfall in Perth',
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [{ label: '', values: [15, 10, 20, 40, 90, 125, 145, 120, 80, 40, 25, 10] }],
      yMax: 160,
      yStep: 20,
      yLabel: 'Rainfall (mm)',
    },
    q: 'The Patel family in Perth use a rainwater tank to water their garden.\nIn which months is the tank most likely to run low?',
    options: ['December to February', 'June to August', 'March to May', 'September to November'],
    e: 'Very little rain falls in Perth in summer (about 10 to 15 mm a month), so the tank is barely refilled. Summer is also when the garden needs the most water. Most of Perth’s rain falls in winter, from June to August.',
  },
  {
    topic: 'earth_space',
    d: 'advanced',
    code: 'AC9S6H02',
    q: 'Farmers pump groundwater from deep underground. Rain slowly soaks down through the soil and rock to refill it.\nWhen does groundwater stop being a renewable resource?',
    options: [
      'When it is pumped out faster than rain can refill it',
      'When it is used to water crops instead of being drunk',
      'When it is stored in a tank before it is used',
      'When it is pumped up at night instead of in the day',
    ],
    e: 'A renewable resource is replaced naturally as fast as we use it. If groundwater is pumped out faster than rain can soak down to replace it, the supply runs down and, for people, is used up like a non-renewable resource.',
  },
  {
    topic: 'earth_space',
    d: 'developing',
    code: 'AC9S6H02',
    q: 'Coal, oil and metal ores are non-renewable resources.\nWhich action best helps to conserve a non-renewable resource?',
    options: [
      'Recycling aluminium cans, so less new metal ore has to be mined',
      'Planting a new tree for every tree that is cut down for timber',
      'Using electricity from wind turbines instead of solar panels',
      'Collecting rainwater in a tank to water the garden',
    ],
    e: 'Metal ores are non-renewable: once they are mined, they are gone. Recycling cans means less ore has to be dug up. Trees, wind, sunlight and rainwater are all renewable resources.',
  },
  {
    topic: 'earth_space',
    d: 'advanced',
    code: 'AC9S6H01',
    q: 'In July 1969, radio dishes at Honeysuckle Creek and Parkes in Australia helped send TV pictures of the first Moon walk to the world. NASA also had dishes in the USA and Spain.\nWhy were dishes needed in different parts of the world?',
    options: [
      'As Earth spins, the Moon is only in the sky for part of each day at any one place.',
      'Australia is a lot closer to the Moon than the USA or Spain are.',
      'The Moon can only be seen from countries in the Southern Hemisphere.',
      'Each dish could only work for a few minutes before it overheated.',
    ],
    e: 'Earth spins once a day, so the Moon rises and sets at every place, just as the Sun does. With dishes spread around the world, at least one could always see the Moon. During the Moon walk, the Moon was high in the sky over Australia.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S6U02',
    q: 'The International Space Station travels once around Earth about every 90 minutes.\nAbout how many sunrises do the astronauts on board see in 24 hours?',
    options: ['16', '1', '24', '90'],
    e: 'There are 24 × 60 = 1,440 minutes in a day, and 1,440 ÷ 90 = 16. Each time the station goes around Earth it moves from Earth’s night side into sunlight once, so the astronauts see about 16 sunrises a day.',
  },
  {
    topic: 'earth_space',
    d: 'foundation',
    code: 'AC9S6H02',
    q: 'Satellites orbiting Earth are used every day by people in Australia.\nWhich of these depends on satellites?',
    options: [
      'A map app that shows where you are',
      'A torch that runs on batteries',
      'A bicycle bell that rings when pressed',
      'A kitchen scale for weighing flour',
    ],
    e: 'Map apps find your position using signals from satellites (the Global Positioning System, or GPS). Satellites are also used for weather forecasts and for sending TV and phone signals. A torch, a bell and a scale work without them.',
  },
]

export const ITEMS = RAW.map(i => ({ correct: 0, ...i }))
