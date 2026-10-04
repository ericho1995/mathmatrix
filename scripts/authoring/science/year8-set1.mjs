// Year 8 Science, set 1: 36 questions built around investigations, data and
// real situations rather than recall, 12 per strand, tagged to the Australian
// Curriculum v9 content descriptions:
//   AC9S8U01 cells · AC9S8U02 organ systems · AC9S8U03 plate tectonics
//   AC9S8U04 rock cycle · AC9S8U05 energy · AC9S8U06 elements, compounds,
//   mixtures · AC9S8U07 physical and chemical change
//
//   node scripts/authoring/append-mc.mjs scripts/authoring/science/year8-set1.mjs year_8 BANK_SCIENCE_Y8_SET1
//
// The correct option is written first; append-mc spreads the answer letters.

export const HEADER = `Year 8 Science, set 1 (scripts/authoring/science/year8-set1.mjs):
investigations, data and real situations across all three strands.`

const heartRate = {
  kind: 'line_graph',
  title: "Mia's heart rate",
  xLabels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  series: [{ label: 'Heart rate', values: [72, 72, 110, 140, 148, 150, 118, 96, 84, 78, 74] }],
  yMin: 60,
  yMax: 160,
  yStep: 20,
  xLabel: 'Time (minutes)',
  yLabel: 'Beats per minute',
}

const seaFloor = {
  kind: 'data_table',
  title: 'Age of sea-floor rock near an ocean ridge',
  columns: ['Distance from the ridge (km)', 'Age of the rock (million years)'],
  rows: [
    [0, 0],
    [50, 2],
    [100, 4],
    [150, 6],
  ],
}

const bounce = {
  kind: 'data_table',
  title: 'A ball dropped from 100 cm',
  columns: ['Bounce', 'Highest point reached (cm)'],
  rows: [
    ['Dropped from', 100],
    ['1st bounce', 80],
    ['2nd bounce', 64],
    ['3rd bounce', 51],
  ],
  rowHeader: true,
}

const RAW = [
  // ─── Life science: cells (AC9S8U01) ────────────────────────────────────────
  {
    topic: 'life_science',
    d: 'proficient',
    code: 'AC9S8U01',
    diagram: {
      kind: 'data_table',
      title: 'What a student saw in three cells',
      columns: ['Cell', 'Cell wall', 'Chloroplasts', 'Large central vacuole'],
      rows: [
        ['P', 'Yes', 'Yes', 'Yes'],
        ['Q', 'No', 'No', 'No'],
        ['R', 'Yes', 'No', 'Yes'],
      ],
      rowHeader: true,
    },
    q: 'A student looked at three different cells under a microscope and recorded what they saw.\nWhich cell is most likely to come from a leaf?',
    options: ['Cell P', 'Cell Q', 'Cell R', 'Cells P and R are equally likely'],
    e: 'Leaf cells make food by photosynthesis, so they contain chloroplasts. Only cell P has chloroplasts. Cell R is a plant cell (it has a cell wall and a large vacuole) but has no chloroplasts, so it probably comes from a part of the plant that gets no light, such as a root. Cell Q has none of these structures, so it is an animal cell.',
  },
  {
    topic: 'life_science',
    d: 'advanced',
    code: 'AC9S8U01',
    q: 'A student looks at onion skin cells under a microscope. The cells have cell walls and large vacuoles but no chloroplasts.\nThe student concludes that the cells cannot be plant cells.\nWhy is this conclusion wrong?',
    options: [
      'Plant cells that grow without light, such as the cells of an onion bulb, often have no chloroplasts.',
      'Chloroplasts are too small to be seen with a light microscope.',
      'Animal cells also have cell walls, so cell walls tell you nothing.',
      'Chloroplasts are destroyed when a slide is stained.',
    ],
    e: 'Only plant cells that carry out photosynthesis need chloroplasts. An onion bulb grows underground in the dark, so its cells have none, yet the cell walls and large vacuole show they are plant cells. Chloroplasts can be seen with a light microscope, and animal cells do not have cell walls.',
  },
  {
    topic: 'life_science',
    d: 'developing',
    code: 'AC9S8U01',
    q: 'The muscle cells in the heart contract about 100 000 times a day and need a constant supply of energy.\nWhich structure would you expect to find in large numbers in heart muscle cells?',
    options: ['Mitochondria', 'Chloroplasts', 'Large vacuoles', 'Cell walls'],
    e: 'Mitochondria carry out cellular respiration, which releases energy from glucose. Cells that use a lot of energy, such as heart muscle cells, contain many mitochondria. Animal cells have no chloroplasts or cell walls.',
  },
  {
    topic: 'life_science',
    d: 'proficient',
    code: 'AC9S8U01',
    q: 'A light microscope has an eyepiece lens that magnifies 10 times and an objective lens that magnifies 40 times.\nWhat is the total magnification?',
    options: ['400 times', '30 times', '50 times', '4000 times'],
    e: 'Total magnification = eyepiece magnification × objective magnification = 10 × 40 = 400 times.',
  },
  {
    topic: 'life_science',
    d: 'advanced',
    code: 'AC9S8U01',
    q: 'In a photo taken through a microscope at a magnification of 400 times, a cheek cell is 20 mm long.\nWhat is the actual length of the cell?',
    options: ['0.05 mm', '0.5 mm', '5 mm', '8000 mm'],
    e: 'Actual size = image size ÷ magnification = 20 mm ÷ 400 = 0.05 mm (that is 50 micrometres).',
  },
  {
    topic: 'life_science',
    d: 'proficient',
    code: 'AC9S8U01',
    q: 'In the 1800s, scientists who studied plants and animals under microscopes put forward cell theory.\nWhich statement is part of cell theory?',
    options: [
      'All living things are made of one or more cells.',
      'All cells contain chloroplasts.',
      'Cells can form from non-living materials such as mud.',
      'Only animals are made of cells.',
    ],
    e: 'Cell theory states that all living things are made of cells, that the cell is the basic unit of life, and that new cells come only from existing cells. Animal cells have no chloroplasts, and cells do not form from non-living matter.',
  },
  // ─── Life science: organ systems (AC9S8U02) ────────────────────────────────
  {
    topic: 'life_science',
    d: 'proficient',
    code: 'AC9S8U02',
    diagram: heartRate,
    q: "The graph shows Mia's heart rate before, during and after a run. She ran from minute 2 to minute 6.\nWhich explanation best fits the change in her heart rate between minute 2 and minute 4?",
    options: [
      'Her working muscles need more oxygen and glucose, so the heart pumps blood faster.',
      'Her heart muscle is getting tired, so it beats faster to rest.',
      'Running makes her blood thicker, so it must be pushed harder.',
      'Her lungs stop working while she runs, so the heart takes over.',
    ],
    e: 'Muscles release energy by respiration, which uses oxygen and glucose carried by the blood. During exercise the muscles need more of both, so the heart beats faster to deliver more blood.',
  },
  {
    topic: 'life_science',
    d: 'advanced',
    code: 'AC9S8U02',
    diagram: heartRate,
    q: "The graph shows Mia's heart rate before, during and after a run. She stopped running at minute 6.\nWhy is her heart rate still above 72 beats per minute at minute 8?",
    options: [
      'Her muscles still need extra oxygen to recover after the run.',
      'Her heart has been damaged by the run.',
      'Her heart rate stays at its highest until she sleeps.',
      'Her blood has run out of oxygen completely.',
    ],
    e: 'After hard exercise the body keeps taking in extra oxygen for a few minutes to recover (to break down waste such as lactic acid and restore energy stores), so the heart rate falls gradually rather than straight back to its resting rate.',
  },
  {
    topic: 'life_science',
    d: 'developing',
    code: 'AC9S8U02',
    q: 'The inside wall of the small intestine is covered in millions of tiny finger-like folds called villi.\nHow do villi help the digestive system?',
    options: [
      'They give a much larger surface area for absorbing nutrients into the blood.',
      'They squeeze food along the intestine.',
      'They make acid to break down food.',
      'They stop bacteria from entering the body.',
    ],
    e: 'Villi greatly increase the surface area of the small intestine, and each has a rich blood supply, so digested nutrients can be absorbed into the blood quickly. Muscles in the gut wall move food along, and acid is made in the stomach.',
  },
  {
    topic: 'life_science',
    d: 'proficient',
    code: 'AC9S8U02',
    q: 'A celery stalk is stood in water coloured with blue dye. A few hours later, thin blue lines run up the stalk and into the leaves.\nWhich tissue carried the coloured water?',
    options: ['Xylem', 'Phloem', 'Epidermis', 'Root hairs'],
    e: 'Xylem tissue carries water and dissolved minerals from the roots up to the leaves, so the dye travels up through the xylem. Phloem carries sugars made in the leaves to other parts of the plant.',
  },
  {
    topic: 'life_science',
    d: 'advanced',
    code: 'AC9S8U02',
    q: 'A student wants to find out whether light affects how much water a plant loses through its leaves.\nWhich set-up is a fair test?',
    options: [
      'Two plants of the same type and size, given the same water, one kept in light and one in the dark, both weighed after 24 hours',
      'One plant kept in light for a day, then the same plant kept in the dark for a day with less water',
      'A large plant kept in light and a small plant kept in the dark, both weighed after 24 hours',
      'Two plants of different types, both kept in light, one watered more than the other',
    ],
    e: 'In a fair test only the variable being tested (light) is changed. The type of plant, its size, the water it gets and the time must all stay the same, so any difference in water loss can be put down to the light.',
  },
  {
    topic: 'life_science',
    d: 'proficient',
    code: 'AC9S8U02',
    q: 'The air sacs (alveoli) in the lungs have walls that are only one cell thick, and each is wrapped in tiny blood vessels.\nWhy is this structure important?',
    options: [
      'Oxygen and carbon dioxide only have a very short distance to move between the air and the blood.',
      'The thin walls let the lungs stretch further than any other organ.',
      'The blood vessels keep the alveoli warm.',
      'The thin walls stop dust from entering the blood.',
    ],
    e: 'Gases move between the air in the alveoli and the blood by diffusion. A wall one cell thick, with blood vessels right against it, makes the distance very short, so gas exchange is fast.',
  },
  // ─── Earth and space: plate tectonics (AC9S8U03) ───────────────────────────
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S8U03',
    q: 'Along the Mid-Atlantic Ridge, two tectonic plates are moving apart and magma rises to fill the gap, forming new sea floor.\nWhat type of plate boundary is this?',
    options: ['Divergent', 'Convergent', 'Transform', 'Subduction'],
    e: 'At a divergent boundary plates move apart and magma rises to form new crust. At a convergent boundary plates move together, and at a transform boundary they slide past each other.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S8U03',
    q: 'The Himalayas, the highest mountains on Earth, are still rising by a few millimetres every year.\nWhat is the best explanation?',
    options: [
      'The Indian Plate is still pushing into the Eurasian Plate, crumpling and lifting the rock.',
      'Volcanoes are erupting under the mountains and adding lava to the top.',
      'The mountains are growing because new rock forms at a mid-ocean ridge beneath them.',
      'Snow building up on the peaks adds to their height.',
    ],
    e: 'The Himalayas lie on a convergent boundary. The Indian Plate is still moving north into the Eurasian Plate, and the collision folds and pushes the rock upwards. There is no mid-ocean ridge or volcanic activity beneath them.',
  },
  {
    topic: 'earth_space',
    d: 'advanced',
    code: 'AC9S8U03',
    q: 'Mesosaurus was a small reptile that lived in fresh water about 280 million years ago. Its fossils are found in southern Africa and in South America, but nowhere else.\nHow do these fossils support the theory of plate tectonics?',
    options: [
      'Africa and South America were once joined, so Mesosaurus could live across both.',
      'Mesosaurus swam across the Atlantic Ocean between the two continents.',
      'The fossils were carried across the ocean by ocean currents.',
      'Mesosaurus must have evolved separately on each continent.',
    ],
    e: 'A small freshwater reptile could not cross a salty ocean thousands of kilometres wide. Its fossils on both continents are evidence that Africa and South America were once joined and have since moved apart.',
  },
  {
    topic: 'earth_space',
    d: 'advanced',
    code: 'AC9S8U03',
    diagram: seaFloor,
    q: 'Scientists measured the age of rock on the sea floor at different distances from an ocean ridge.\nWhat do the results suggest?',
    options: [
      'New sea floor forms at the ridge and moves away from it over time.',
      'The sea floor is the same age everywhere.',
      'The oldest sea floor is found at the ridge.',
      'The sea floor is sinking back into the ridge.',
    ],
    e: 'The rock is youngest at the ridge (0 million years) and gets steadily older further away. That is what happens if new crust forms at the ridge and the plates carry it away on both sides, which is called sea-floor spreading.',
  },
  {
    topic: 'earth_space',
    d: 'advanced',
    code: 'AC9S8U03',
    diagram: seaFloor,
    q: 'The table shows the age of sea-floor rock at different distances from an ocean ridge.\nAbout how far does the sea floor move away from the ridge each year?',
    options: ['2.5 cm', '25 cm', '2.5 m', '25 km'],
    e: 'The rock moves 50 km in 2 million years, which is 25 km every million years. 25 km = 2 500 000 cm, and 2 500 000 cm ÷ 1 000 000 years = 2.5 cm a year, about as fast as fingernails grow.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S8U03',
    q: 'Australia has no active volcanoes on the mainland and far fewer large earthquakes than New Zealand.\nWhat is the best explanation?',
    options: [
      'Australia is near the middle of a tectonic plate, while New Zealand sits on the boundary between two plates.',
      'Australia is too dry for volcanoes to form.',
      'Australia is on a divergent boundary, where earthquakes cannot happen.',
      'New Zealand is much closer to the South Pole.',
    ],
    e: 'Most volcanoes and large earthquakes happen at plate boundaries, where plates collide, separate or slide past each other. Mainland Australia sits well inside the Indo-Australian Plate, while New Zealand lies on the boundary between the Indo-Australian and Pacific Plates.',
  },
  // ─── Earth and space: the rock cycle (AC9S8U04) ────────────────────────────
  {
    topic: 'earth_space',
    d: 'developing',
    code: 'AC9S8U04',
    q: 'Sandstone is made of grains of sand that have been pressed and cemented together, and it sometimes contains fossils.\nWhat type of rock is sandstone?',
    options: ['Sedimentary', 'Igneous', 'Metamorphic', 'Volcanic'],
    e: 'Sedimentary rock forms when layers of sediment, such as sand, are buried, compacted and cemented together. Fossils are usually found in sedimentary rock because living things are buried in the sediment.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S8U04',
    q: 'Granite has crystals large enough to see easily. Basalt has crystals too small to see without a microscope. Both formed when melted rock cooled.\nWhat explains the difference in crystal size?',
    options: [
      'Granite cooled slowly deep underground, while basalt cooled quickly at or near the surface.',
      'Granite cooled quickly at the surface, while basalt cooled slowly underground.',
      'Granite is much older than basalt, so its crystals have had longer to grow since it cooled.',
      'Basalt was crushed into small crystals by the weight of rock above it.',
    ],
    e: 'Crystals grow while melted rock cools. Deep underground, magma cools slowly over thousands of years, so large crystals form (granite). Lava at the surface cools in days or weeks, leaving only tiny crystals (basalt). Crystals stop growing once the rock is solid.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S8U04',
    q: 'Limestone buried deep underground is heated and squeezed for millions of years, but it does not melt.\nWhich rock forms?',
    options: ['Marble', 'Granite', 'Sandstone', 'Basalt'],
    e: 'When rock is changed by heat and pressure without melting, a metamorphic rock forms. Limestone becomes marble. Granite and basalt are igneous rocks, and sandstone is sedimentary.',
  },
  {
    topic: 'earth_space',
    d: 'advanced',
    code: 'AC9S8U04',
    q: 'A cliff shows three layers of sedimentary rock. The bottom layer contains fossil sea shells, the middle layer contains fossil ferns, and the top layer has no fossils. The layers have not been tipped over.\nWhat can you conclude?',
    options: [
      'The area was once under the sea, and later became land where ferns grew.',
      'The area was once land with ferns, and later the sea covered it.',
      'Sea creatures and ferns lived in the area at the same time.',
      'The top layer is the oldest because it has no fossils.',
    ],
    e: 'Sedimentary layers are laid down one on top of another, so the bottom layer is the oldest. Sea shells in the bottom layer show the area was first under the sea; ferns in the middle layer show it later became land.',
  },
  {
    topic: 'earth_space',
    d: 'proficient',
    code: 'AC9S8U04',
    q: 'Granite is often used for kitchen benchtops.\nWhich property of granite, which comes from the way it formed, makes it a good choice?',
    options: [
      'It is very hard, because its crystals grew tightly interlocked as magma cooled.',
      'It is soft and easy to carve, because it is made of cemented sand grains.',
      'It soaks up spills, because it is full of tiny air holes from escaping gas.',
      'It splits easily into thin flat sheets, because it formed under pressure.',
    ],
    e: 'Granite is an igneous rock whose crystals grew tightly interlocked as the magma slowly cooled. That makes it hard and resistant to scratching and wear. Soft, cemented grains describe sandstone; splitting into sheets describes slate.',
  },
  {
    topic: 'earth_space',
    d: 'advanced',
    code: 'AC9S8U04',
    q: 'Most rock-cycle processes take thousands or millions of years.\nWhich process can happen in hours or days?',
    options: [
      'Lava from an eruption cooling into basalt',
      'Sand being buried and cemented into sandstone',
      'Limestone being changed into marble',
      'A mountain range being weathered and eroded flat',
    ],
    e: 'Lava at the surface cools and hardens into basalt within hours to weeks. Burial and cementing of sediment, metamorphism and the erosion of mountains all take thousands to millions of years.',
  },
  // ─── Physical science: energy (AC9S8U05) ───────────────────────────────────
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S8U05',
    q: 'A roller-coaster car is pulled to the top of the first hill and then released.\nAs it rolls down the hill, which energy change takes place?',
    options: [
      'Gravitational potential energy changes into kinetic energy.',
      'Kinetic energy changes into gravitational potential energy.',
      'Chemical energy changes into electrical energy.',
      'Sound energy changes into kinetic energy.',
    ],
    e: 'At the top of the hill the car has a lot of gravitational potential energy because of its height. As it rolls down it loses height and speeds up, so potential energy is transformed into kinetic (movement) energy.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S8U05',
    q: 'An old-style light globe uses 60 joules of electrical energy every second. Only 6 joules of it becomes light; the rest becomes heat.\nWhat percentage of the energy becomes light?',
    options: ['10%', '6%', '54%', '90%'],
    e: '6 ÷ 60 = 0.1, which is 10%. The other 54 joules (90%) become heat, which is why these globes are so inefficient compared with LED globes.',
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S8U05',
    diagram: bounce,
    q: 'A ball is dropped from a height of 100 cm. The table shows how high it reaches after each bounce.\nWhy does each bounce reach a lower height?',
    options: [
      'At each bounce some energy is transformed into sound and heat, so less is left to lift the ball.',
      'Energy is destroyed each time the ball hits the ground.',
      'Gravity pulls harder on the ball after each bounce.',
      'The ball gains mass from the ground at each bounce.',
    ],
    e: 'Energy cannot be created or destroyed, but it can be transformed. When the ball hits the ground, some of its energy becomes sound and heat (in the ball and the ground), so less is changed back into gravitational potential energy and it rises less high.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S8U05',
    diagram: bounce,
    q: 'A ball is dropped from a height of 100 cm. The table shows how high it reaches after each bounce.\nAbout what percentage of its previous height does the ball reach on each bounce?',
    options: ['About 80%', 'About 20%', 'About 50%', 'About 64%'],
    e: '80 ÷ 100 = 0.8, 64 ÷ 80 = 0.8 and 51 ÷ 64 ≈ 0.8, so each bounce reaches about 80% of the height before it.',
  },
  // ─── Physical science: elements, compounds and mixtures (AC9S8U06) ─────────
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S8U06',
    q: 'Which of these is a compound?',
    options: ['Water (H₂O)', 'Oxygen gas (O₂)', 'Salt water', 'Iron (Fe)'],
    e: 'A compound is a pure substance made of two or more different elements chemically joined. Water is hydrogen and oxygen joined together. Oxygen gas and iron are elements, and salt water is a mixture of salt and water.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S8U06',
    q: 'Air is made mostly of nitrogen and oxygen, with smaller amounts of other gases.\nWhich observation shows that air is a mixture rather than a compound?',
    options: [
      'The amounts of the gases in air vary from place to place, and they can be separated by cooling the air.',
      'Air is invisible and has no smell.',
      'Air is needed for things to burn.',
      'Air takes up space and has mass.',
    ],
    e: 'In a compound the elements are always joined in fixed proportions and can only be separated by a chemical reaction. The make-up of air varies (for example, the amount of water vapour), and its gases can be separated by physical means such as cooling them until they liquefy, so air is a mixture.',
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S8U06',
    q: 'In a model of a substance, every particle is made of one carbon atom joined to two oxygen atoms, and all of the particles are identical.\nHow should this substance be classified?',
    options: ['A pure compound', 'An element', 'A mixture of elements', 'A mixture of compounds'],
    e: 'Each particle contains two different elements chemically joined, so it is a compound (this one is carbon dioxide). Because every particle is the same, the substance is pure rather than a mixture.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S8U06',
    q: 'Along some coasts, sea water is let into shallow ponds and left in the sun. When the water has evaporated, salt is left behind and collected.\nWhat does this show about sea water?',
    options: [
      'It is a mixture, because the salt can be separated from the water by a physical process.',
      'It is an element, because it is found in nature.',
      'It is a compound, because it contains salt.',
      'It is a pure substance, because it looks clear.',
    ],
    e: 'Evaporation is a physical process: no new substance is made. Because the salt can be separated from the water this way, sea water is a mixture, not a compound or a pure substance.',
  },
  // ─── Physical science: physical and chemical change (AC9S8U07) ─────────────
  {
    topic: 'physical_science',
    d: 'developing',
    code: 'AC9S8U07',
    q: 'Which of these is a chemical change?',
    options: ['A cake baking in an oven', 'Ice melting on a bench', 'Sugar dissolving in tea', 'Water boiling in a kettle'],
    e: 'In a chemical change new substances are made. Baking makes new substances (the cake cannot be turned back into raw batter). Melting, dissolving and boiling are physical changes: the substance is the same, only its state or mixing has changed.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S8U07',
    diagram: {
      kind: 'data_table',
      title: 'Mixing two clear solutions',
      columns: ['Observation', 'Before mixing', 'After mixing'],
      rows: [
        ['Colour', 'Colourless', 'Yellow'],
        ['Temperature', '22 °C', '22 °C'],
        ['Solid present', 'No', 'Yes, a yellow solid'],
      ],
      rowHeader: true,
    },
    q: 'A student mixed two clear, colourless solutions in a test tube and recorded what they observed.\nWhat is the best evidence that a chemical reaction took place?',
    options: [
      'A new solid formed and the colour changed.',
      'The temperature stayed at 22 °C.',
      'Both solutions were clear before they were mixed.',
      'The liquids mixed together easily.',
    ],
    e: 'A new solid forming (a precipitate) and a change of colour are signs that a new substance has been made, which means a chemical reaction happened. An unchanged temperature does not show a reaction.',
  },
  {
    topic: 'physical_science',
    d: 'advanced',
    code: 'AC9S8U07',
    q: 'A student adds citric acid powder to a solution of bicarbonate of soda. Bubbles of gas form and the temperature of the mixture drops from 21 °C to 15 °C.\nWhich conclusion is best supported?',
    options: [
      'A chemical reaction took place that took in heat energy from its surroundings.',
      'A chemical reaction took place that gave out heat energy to its surroundings.',
      'Only a physical change took place, because the temperature went down.',
      'No reaction took place, because reactions always make things hotter.',
    ],
    e: 'The bubbles show a new substance (carbon dioxide gas) was made, so a chemical reaction happened. The mixture got colder, so the reaction took in heat energy from its surroundings. Some reactions give out heat and some take it in.',
  },
  {
    topic: 'physical_science',
    d: 'proficient',
    code: 'AC9S8U07',
    q: 'A disposable hand warmer heats up when its packet is opened, as iron powder inside reacts with oxygen from the air.\nWhich statement is correct?',
    options: [
      'Chemical energy is transformed into heat energy, so the reaction releases heat.',
      'Heat energy is transformed into chemical energy, so the reaction takes in heat.',
      'No new substance forms, so this is a physical change.',
      'The iron is melting, which is why the packet gets warm.',
    ],
    e: 'The iron reacts with oxygen to form a new substance (iron oxide, like rust), so this is a chemical change. The reaction releases stored chemical energy as heat, which is what warms your hands.',
  },
]

export const ITEMS = RAW.map(i => ({ correct: 0, ...i }))
