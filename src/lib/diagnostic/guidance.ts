import type { SubjectSlug, YearLevel } from '../../types'

// ─────────────────────────────────────────────────────────────────────────────
// What a parent can do about each area of a report.
//
// Written for a parent who is not a teacher and may not remember the maths:
// what the area covers in plain words, and three things to do at home that
// need no teaching — cooking, shopping, reading together, asking the child to
// explain. VCE guidance assumes the student works independently and the
// parent's job is structure and asking good questions.
//
// House style: "practice" for noun and verb.
// ─────────────────────────────────────────────────────────────────────────────

export interface Guidance {
  covers: string
  tips: [string, string, string]
}

type Band = 'primary' | 'secondary' | 'vce'
type Entry = Partial<Record<Band, Guidance>>

const PRIMARY = new Set<YearLevel>(['grade_3', 'grade_4', 'grade_5', 'grade_6'])
const VCE = new Set<YearLevel>(['year_11', 'year_12'])
const bandOf = (year: YearLevel): Band => (PRIMARY.has(year) ? 'primary' : VCE.has(year) ? 'vce' : 'secondary')

const VCE_HABITS = {
  explain: 'Ask them to talk you through one worked solution a week. You do not need to follow the maths: if they can explain each step out loud, they understand it; where they stall is the gap.',
  timed: 'Set short timed blocks of multiple-choice questions on this area — 10 questions in 15 minutes — and have them mark their own work against the answer key straight away.',
}

const GUIDE: Record<string, Entry> = {
  // ─── Maths ────────────────────────────────────────────────────────────────
  number_operations: {
    primary: {
      covers: 'Place value, adding, subtracting, multiplying and dividing, fractions, decimals and money.',
      tips: [
        'At the shops, ask them to estimate the total before you reach the checkout, then check it together.',
        'Use cooking to talk about fractions: half a cup, a quarter of the pizza, doubling a recipe.',
        'Five minutes of times tables a day, out loud in the car or at breakfast, does more than an hour once a week.',
      ],
    },
    secondary: {
      covers: 'Integers and negative numbers, fractions, decimals and percentages, ratios and rates, powers and roots.',
      tips: [
        'Ask them to work out discounts and GST when you shop: "30% off $45 — what do we pay?"',
        'Talk through rates in everyday life: price per kilogram, kilometres per hour, cost per month of a phone plan.',
        'When they get a question wrong, ask them to find the step where it went wrong before checking the answer.',
      ],
    },
  },
  number_patterns: {
    primary: {
      covers: 'Spotting and continuing patterns, the rule behind a pattern, number sentences with a missing number, and order of operations.',
      tips: [
        'Play "what’s my rule?": you say 3, 7, 11 and they find the rule and the next number. Then swap roles.',
        'Write a number sentence with a gap — 6 × ☐ = 42 — and ask them to explain how they found it.',
        'Look for patterns in house numbers, calendars and tiles, and ask what comes next and why.',
      ],
    },
  },
  algebra_equations: {
    secondary: {
      covers: 'Writing and simplifying expressions, solving equations, linear graphs, and using formulas.',
      tips: [
        'Ask them to turn a real situation into a formula: a taxi costs $4 plus $2.50 a kilometre — what is the cost for k kilometres?',
        'For each equation they solve, have them substitute the answer back in to check it. Making this a habit catches most errors.',
        'If a step is shaky, go back one year level: confident equation solving rests on confident arithmetic with negatives and fractions.',
      ],
    },
  },
  geometry_measurement: {
    primary: {
      covers: 'Length, mass, capacity, time, area and perimeter, angles, 2D shapes and 3D objects, maps and position.',
      tips: [
        'Hand over the measuring: a tape measure for the furniture, the kitchen scales for baking, a jug for capacity.',
        'Ask them to read the time on an analogue clock through the day, and to work out how long until dinner.',
        'Draw a rough plan of a room together and work out its perimeter and area in metres.',
      ],
    },
    secondary: {
      covers: 'Area, surface area and volume, angles and geometric reasoning, Pythagoras and trigonometry, transformations and scale.',
      tips: [
        'Work out real areas and volumes: paint for a wall, soil for a garden bed, water in a fish tank.',
        'Ask them to sketch every geometry problem before solving it and label what they know. Most errors come from skipping the sketch.',
        'Keep a one-page list of formulas they use, written in their own hand, and cover it to test recall once a week.',
      ],
    },
  },
  statistics_probability: {
    primary: {
      covers: 'Reading tables and graphs, collecting data, and the language of chance — likely, unlikely, certain, impossible.',
      tips: [
        'Look at graphs in the news or sports results together and ask what they show, and what they don’t.',
        'Run a small survey at home — favourite fruit, how we get to school — and have them draw the graph.',
        'Play games with dice or spinners and ask before each roll how likely each outcome is.',
      ],
    },
    secondary: {
      covers: 'Mean, median, mode and range, reading and choosing data displays, sampling, and calculating probabilities.',
      tips: [
        'Use their own data — screen time, sport scores, test results — to find the mean and median and talk about which is fairer.',
        'When they see a graph in the news, ask whether it could be misleading and why.',
        'For probability, have them list all the outcomes first (a table or a tree) before calculating anything.',
      ],
    },
  },

  // ─── English (Language Conventions) ───────────────────────────────────────
  spelling: {
    primary: {
      covers: 'Spelling common and less common words correctly, including word families, prefixes and suffixes.',
      tips: [
        'Use look, say, cover, write, check on ten words a week drawn from their own writing, not a random list.',
        'Group words by pattern (-tion, -ight, -ough) so they learn the rule, not just the word.',
        'Read together every day: children who read widely spell better because they have seen the words.',
      ],
    },
    secondary: {
      covers: 'Spelling subject words and less common words, and using word origins, prefixes and suffixes to spell them.',
      tips: [
        'Keep a list of words they misspell in their own schoolwork and test those, not generic lists.',
        'Talk about where words come from — "bio" means life, "graph" means write — so they can spell words they have never seen.',
        'Ask them to proofread one piece of their writing aloud, slowly. Most spelling slips are caught when read out.',
      ],
    },
  },
  grammar: {
    primary: {
      covers: 'Using words correctly in sentences — verb tenses, pronouns, joining words and sentence structure.',
      tips: [
        'When they speak or write a sentence that doesn’t sound right, ask them to say it again rather than correcting it for them.',
        'Read aloud together: hearing well-made sentences is how grammar becomes natural.',
        'Play a game of joining two short sentences with "because", "although" or "when".',
      ],
    },
    secondary: {
      covers: 'Sentence structure, clauses, verb agreement and tense, and choosing the right word form in formal writing.',
      tips: [
        'Have them read a paragraph of their writing aloud and fix any sentence they stumble over.',
        'Ask them to combine three short sentences into one well-built sentence, then explain the choice of joining word.',
        'Talk about the difference between how we speak and formal writing — "could of" versus "could have".',
      ],
    },
  },
  punctuation: {
    primary: {
      covers: 'Capital letters, full stops, question marks, commas, apostrophes and speech marks.',
      tips: [
        'When reading together, pause on punctuation and ask what it tells the reader to do.',
        'Write a short message to a family member together and check every capital letter and full stop.',
        'Focus on apostrophes for owning (the dog’s bowl) versus shortening (it’s) — the most common confusion.',
      ],
    },
    secondary: {
      covers: 'Commas in complex sentences, apostrophes, colons and semicolons, and punctuating quotations and dialogue.',
      tips: [
        'Have them punctuate a paragraph you have copied without any punctuation, then compare with the original.',
        'Pick one mark a week — the semicolon, the colon — and ask them to use it correctly three times in their writing.',
        'Read their writing aloud exactly as punctuated; run-on sentences become obvious.',
      ],
    },
  },
  vocabulary: {
    primary: {
      covers: 'Knowing what words mean, synonyms and opposites, and choosing the best word for a sentence.',
      tips: [
        'Introduce a "word of the day" at dinner and try to use it in conversation.',
        'When they meet a new word while reading, ask them to guess its meaning from the sentence before looking it up.',
        'Play synonym chains: big, large, huge, enormous — who can go furthest?',
      ],
    },
    secondary: {
      covers: 'Precise and academic vocabulary, word meanings in context, and how prefixes and roots build meaning.',
      tips: [
        'Encourage reading beyond school texts — news articles, long-form journalism, novels — and talk about them.',
        'Ask them to replace a vague word in their writing ("good", "bad", "a lot") with a precise one.',
        'Break unfamiliar words into parts: "inter-", "-ology", "trans-" and guess the meaning together.',
      ],
    },
  },

  // ─── Reading ──────────────────────────────────────────────────────────────
  finding: {
    primary: {
      covers: 'Finding facts and details stated in a text, and locating information quickly.',
      tips: [
        'After reading together, ask a "who, what, where, when" question and have them point to the answer in the text.',
        'Use non-fiction — a recipe, a timetable, a brochure — and ask them to find a specific detail.',
        'Encourage them to look back at the text to check answers rather than answering from memory.',
      ],
    },
    secondary: {
      covers: 'Locating and connecting information across a text, including tables, diagrams and long passages.',
      tips: [
        'Ask them to skim a news article and tell you in one sentence what it says, then find the evidence.',
        'Practice reading the questions before the text, so they know what they are looking for.',
        'Use timetables, data tables and instructions at home and have them find and combine two pieces of information.',
      ],
    },
  },
  inferring: {
    primary: {
      covers: 'Working out what the text suggests but doesn’t say — how characters feel, why things happen, what might happen next.',
      tips: [
        'While reading a story, stop and ask "how do you think she feels? What tells you that?"',
        'Watch a short scene of a film with no sound and talk about what the characters are thinking.',
        'Ask "why?" questions about stories and expect an answer with a clue from the text.',
      ],
    },
    secondary: {
      covers: 'Drawing conclusions, reading between the lines, and supporting an interpretation with evidence.',
      tips: [
        'When they give an opinion about a text, ask "what in the text makes you think that?"',
        'Discuss news stories and opinion pieces: what is the writer suggesting without saying it directly?',
        'Practice the habit of quoting a short phrase as evidence for every inference.',
      ],
    },
  },
  word_meaning: {
    primary: {
      covers: 'Working out what a word or phrase means from the sentence and text around it.',
      tips: [
        'When you meet an unusual word reading together, cover the dictionary and guess from the sentence first.',
        'Talk about phrases that don’t mean what they say — "over the moon", "a piece of cake".',
        'Read a wide range of books together, a little above their level.',
      ],
    },
    secondary: {
      covers: 'Interpreting vocabulary, figurative language and phrases in context.',
      tips: [
        'Ask them to explain what an unusual word means in the sentence, then check with a dictionary.',
        'Look at figurative language in songs or speeches and talk about what it means and why it was chosen.',
        'Encourage wider reading: vocabulary in context comes from meeting words often.',
      ],
    },
  },
  purpose: {
    primary: {
      covers: 'Why a text was written, who it is for, how it is organised, and the choices the writer made.',
      tips: [
        'For each text you see — an ad, a letter, a story — ask "why was this written, and who is it for?"',
        'Point out headings, captions and bold words and ask what job they do.',
        'Compare two texts on the same topic, such as a story and a fact sheet, and talk about the difference.',
      ],
    },
    secondary: {
      covers: 'The writer’s purpose, audience and techniques, text structure, and the effect of language choices.',
      tips: [
        'With advertisements and opinion pieces, ask: what does the writer want me to think, and how are they trying to get me there?',
        'Name a technique together — rhetorical question, repetition, imagery — and find it in something you read.',
        'Ask "why did the writer begin (or end) this way?" about articles and stories.',
      ],
    },
  },

  // ─── Science ──────────────────────────────────────────────────────────────
  life_science: {
    primary: {
      covers: 'Living things, their features, life cycles, habitats and how they depend on each other.',
      tips: [
        'Grow something from seed together and record its growth with measurements and drawings.',
        'Watch a nature documentary and ask how each animal is suited to where it lives.',
        'Visit a park or beach and sort the living things you find into groups.',
      ],
    },
    secondary: {
      covers: 'Cells, body systems, classification, ecosystems, genetics and evolution.',
      tips: [
        'Ask them to explain a body system — digestion, circulation — as if you were the student.',
        'Draw a food web for your local area together and talk about what happens if one species disappears.',
        'Relate science to health news: vaccines, nutrition, inherited conditions.',
      ],
    },
  },
  physical_science: {
    primary: {
      covers: 'Forces, energy, light, heat, sound, electricity and how materials behave.',
      tips: [
        'Do small kitchen experiments — what dissolves, what floats, what melts first — and predict before testing.',
        'Talk about forces on the playground: pushes, pulls, friction on the slide.',
        'Ask how everyday things work: how does the fridge stay cold? Why does the torch need batteries?',
      ],
    },
    secondary: {
      covers: 'Forces and motion, energy transfer, electricity, waves, and the properties and reactions of substances.',
      tips: [
        'Ask them to predict, then explain, everyday events: why do we skid on wet roads? Why does metal feel cold?',
        'Use the electricity bill to talk about energy use and power ratings.',
        'Have them write the steps of an experiment — the question, what changes, what stays the same — for something simple at home.',
      ],
    },
  },
  earth_space: {
    primary: {
      covers: 'Day and night, the seasons, the solar system, weather, and how the Earth’s surface changes.',
      tips: [
        'Track the Moon for a month and draw its shape each night.',
        'Check the weather forecast together and compare it with what actually happens.',
        'Look at rocks, soil and erosion on walks and talk about how they formed.',
      ],
    },
    secondary: {
      covers: 'The solar system and universe, Earth’s resources, the rock cycle, plate tectonics, and climate.',
      tips: [
        'Discuss natural events in the news — earthquakes, floods, bushfires — and their causes.',
        'Watch a short space documentary and have them explain one idea back to you.',
        'Talk about where everyday resources come from: water, electricity, metals.',
      ],
    },
  },

  // ─── VCE ──────────────────────────────────────────────────────────────────
  chem_atomic_structure: {
    vce: {
      covers: 'Atomic structure, the periodic table, bonding, and the properties of materials that follow from them.',
      tips: [
        'Have them build a one-page summary of bonding types with an example of each, then explain it to you.',
        VCE_HABITS.timed,
        'Ask them to link every property they learn (melting point, conductivity) back to the bonding that causes it.',
      ],
    },
  },
  chem_reactions: {
    vce: {
      covers: 'Chemical reactions, equations, the mole and stoichiometry, acids and bases, and redox.',
      tips: [
        'Make balancing equations and mole calculations a ten-minute daily habit — fluency here underpins the rest of the course.',
        VCE_HABITS.explain,
        'Ask them to write units at every step of every calculation; most lost marks are unit errors.',
      ],
    },
  },
  phys_mechanics: {
    vce: {
      covers: 'Motion, forces, Newton’s laws, momentum and energy.',
      tips: [
        'Insist on a labelled diagram with forces drawn for every mechanics question.',
        VCE_HABITS.explain,
        'Relate questions to real motion — car braking, sport — and ask them to estimate the answer before calculating.',
      ],
    },
  },
  phys_electricity: {
    vce: {
      covers: 'Circuits, current, voltage, resistance and power.',
      tips: [
        'Have them redraw every circuit neatly before analysing it, marking current directions.',
        VCE_HABITS.timed,
        'Use household appliances to talk about power, energy and cost.',
      ],
    },
  },
  phys_motion: {
    vce: {
      covers: 'Motion in two dimensions: projectiles, circular motion, momentum, energy and Newton’s laws.',
      tips: [
        'Make "draw it first" the rule: a diagram with components resolved for every projectile and circular-motion question.',
        VCE_HABITS.explain,
        VCE_HABITS.timed,
      ],
    },
  },
  phys_fields: {
    vce: {
      covers: 'Gravitational, electric and magnetic fields and the forces they produce.',
      tips: [
        'Ask them to compare the three fields side by side in a table — source, direction, formula — from memory.',
        'Check they use the formula sheet efficiently: they should know where every field formula is without searching.',
        VCE_HABITS.timed,
      ],
    },
  },
  phys_electrical_power: {
    vce: {
      covers: 'Generators, alternating current, transformers and transmitting electricity.',
      tips: [
        'Have them explain how a generator works using a labelled sketch, step by step.',
        VCE_HABITS.explain,
        'Practice transmission-loss questions until the steps are automatic; they appear on most exams.',
      ],
    },
  },
  phys_light_matter: {
    vce: {
      covers: 'Light as a wave and a particle, the photoelectric effect, and special relativity.',
      tips: [
        'Ask them to explain which experiments support the wave model and which the particle model — a common extended-response question.',
        VCE_HABITS.explain,
        VCE_HABITS.timed,
      ],
    },
  },
  phys_investigation: {
    vce: {
      covers: 'Planning investigations, variables, uncertainty, and analysing and evaluating data.',
      tips: [
        'For any experiment they describe, ask them to name the independent, dependent and controlled variables.',
        'Have them practice drawing a line of best fit and finding a gradient with units.',
        'Ask them to critique a method: what would make it more accurate, more precise, more valid?',
      ],
    },
  },
  mm_functions: {
    vce: {
      covers: 'Functions and their graphs, transformations, domains and ranges, and inverse functions.',
      tips: [
        'Ask them to sketch graphs by hand first, then check with technology — not the other way round.',
        VCE_HABITS.explain,
        VCE_HABITS.timed,
      ],
    },
  },
  mm_algebra: {
    vce: {
      covers: 'Algebraic manipulation, solving equations including exponential and logarithmic, and simultaneous equations.',
      tips: [
        'A daily ten minutes of technology-free algebra builds the speed Examination 1 demands.',
        'Have them check every solution by substitution until it becomes habit.',
        VCE_HABITS.explain,
      ],
    },
  },
  mm_calculus: {
    vce: {
      covers: 'Differentiation and integration, rates of change, tangents, and areas under curves.',
      tips: [
        'Keep a summary sheet of derivative and integral rules and test recall weekly without notes.',
        VCE_HABITS.explain,
        VCE_HABITS.timed,
      ],
    },
  },
  mm_probability: {
    vce: {
      covers: 'Discrete and continuous random variables, binomial and normal distributions, and statistical inference.',
      tips: [
        'Have them identify the distribution and define the random variable in words before any calculation.',
        'Check that they can use their CAS calculator for distributions quickly and accurately.',
        VCE_HABITS.timed,
      ],
    },
  },
  gm_data_analysis: {
    vce: {
      covers: 'Displaying and describing data, regression, association, and time series.',
      tips: [
        'Ask them to write one-sentence interpretations of correlation and regression results — these are worth easy marks.',
        'Check they can use their calculator’s statistics functions without hesitation.',
        VCE_HABITS.timed,
      ],
    },
  },
  gm_financial: {
    vce: {
      covers: 'Recursion and financial modelling: interest, loans, annuities and depreciation.',
      tips: [
        'Use real examples — your mortgage, a car loan, a savings account — and ask them to model it with the finance solver.',
        'Have them write each recurrence relation in words before using it.',
        VCE_HABITS.timed,
      ],
    },
  },
  gm_matrices: {
    vce: {
      covers: 'Matrix arithmetic, transition matrices and their applications.',
      tips: [
        'Ask them to explain what each row and column of a matrix represents before calculating.',
        VCE_HABITS.explain,
        VCE_HABITS.timed,
      ],
    },
  },
  gm_networks: {
    vce: {
      covers: 'Graphs and networks: shortest paths, spanning trees, flow and scheduling.',
      tips: [
        'Have them redraw networks neatly and label every step of each algorithm.',
        VCE_HABITS.explain,
        VCE_HABITS.timed,
      ],
    },
  },
  sm_complex_numbers: {
    vce: {
      covers: 'Complex numbers in Cartesian and polar form, the complex plane, and solving polynomial equations.',
      tips: [
        'Ask them to sketch every complex-number problem on an Argand diagram first.',
        VCE_HABITS.explain,
        VCE_HABITS.timed,
      ],
    },
  },
  sm_vectors: {
    vce: {
      covers: 'Vectors in two and three dimensions, scalar products, lines and planes, and vector calculus.',
      tips: [
        'Have them draw a diagram for every vector question, however rough.',
        VCE_HABITS.explain,
        VCE_HABITS.timed,
      ],
    },
  },
  sm_proof: {
    vce: {
      covers: 'Logic and proof: direct proof, contradiction, contrapositive and induction.',
      tips: [
        'Ask them to explain the structure of each proof type in their own words, with one example each.',
        'Have them write proofs in full sentences and check every line follows from the last.',
        VCE_HABITS.explain,
      ],
    },
  },
  sm_functions: {
    vce: {
      covers: 'Functions and graphs, including rational functions, asymptotes and reciprocal functions.',
      tips: [
        'Ask them to sketch by hand, labelling asymptotes and intercepts, before checking on CAS.',
        VCE_HABITS.explain,
        VCE_HABITS.timed,
      ],
    },
  },
  sm_calculus: {
    vce: {
      covers: 'Differentiation and integration techniques, differential equations, kinematics and related rates.',
      tips: [
        'Keep a technique list — substitution, partial fractions, implicit differentiation — and do one of each weekly.',
        VCE_HABITS.explain,
        VCE_HABITS.timed,
      ],
    },
  },
  sm_statistics: {
    vce: {
      covers: 'Linear combinations of random variables, sample means, confidence intervals and hypothesis testing.',
      tips: [
        'Have them state the hypotheses and conclusion in words for every test — marks are lost on wording.',
        'Check their calculator use for confidence intervals and p-values is quick and accurate.',
        VCE_HABITS.timed,
      ],
    },
  },
}

const GENERIC: Guidance = {
  covers: 'The questions in this part of the test.',
  tips: [
    'Ask them to explain how they answered one of these questions; where the explanation stops is the gap.',
    'Work through a practice paper’s questions on this area a few at a time, marking as you go.',
    'Re-test in a few weeks to see how it has moved.',
  ],
}

/** What an area covers and three ways to help at home. */
export function guidanceFor(_subject: SubjectSlug, year: YearLevel, area: string): Guidance {
  const entry = GUIDE[area]
  if (!entry) return GENERIC
  const band = bandOf(year)
  return entry[band] ?? entry.secondary ?? entry.primary ?? entry.vce ?? GENERIC
}

/** Whether a real entry exists (tests use this to catch areas without guidance). */
export const hasGuidance = (area: string) => area in GUIDE
