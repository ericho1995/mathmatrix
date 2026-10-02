import type { SubjectSlug, TopicSlug, YearLevel } from '../../types'
import type { AreaDef, BankQuestion, Classified } from './types.ts'
import { TOPICS } from '../curriculum.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Which area of the report a question belongs to, and which skill it tests.
//
// Maths, Science and the VCE subjects report by curriculum topic — the bank's
// own tagging. English and Reading do not: the bank files all of Language
// Conventions under two topics (grammar & punctuation, vocabulary) and all of
// Reading under one, which tells a parent nothing. Those are classified from
// the question itself into the areas NAPLAN reports on.
//
// Skills are classified from the question too. The curriculum codes were
// checked first and are applied too loosely to name skills from — one English
// code covers both spelling and capital letters. The rules below read the
// question's diagram (a clock is Time, a spinner is Chance) and then its
// wording; the first rule that matches wins, so specific rules come first.
// `node scripts/diagnostic-audit.mjs` prints samples of every skill for review.
// ─────────────────────────────────────────────────────────────────────────────

const TOPIC_SUBJECT = new Map<string, SubjectSlug>(TOPICS.map(t => [t.slug, t.subject]))
const TOPIC_LABEL = new Map<string, string>(TOPICS.map(t => [t.slug, t.label]))

export function subjectOfTopic(topic: TopicSlug): SubjectSlug {
  const subject = TOPIC_SUBJECT.get(topic)
  if (!subject) throw new Error(`Unknown topic: ${topic}`)
  return subject
}

const topicArea = (slug: string): AreaDef => ({ id: slug, label: TOPIC_LABEL.get(slug) ?? slug })

const ENGLISH_AREAS: AreaDef[] = [
  { id: 'spelling', label: 'Spelling' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'punctuation', label: 'Punctuation' },
  { id: 'vocabulary', label: 'Vocabulary' },
]

const READING_AREAS: AreaDef[] = [
  { id: 'finding', label: 'Finding information' },
  { id: 'inferring', label: 'Inferring' },
  { id: 'word_meaning', label: 'Word meaning' },
  { id: 'purpose', label: 'Purpose & how it’s written' },
]

const PRIMARY = new Set<YearLevel>(['grade_3', 'grade_4', 'grade_5', 'grade_6'])

/** The areas a report on this subject and year can show, in report order. */
export function areasFor(subject: SubjectSlug, year: YearLevel): AreaDef[] {
  if (subject === 'math') {
    const middle = PRIMARY.has(year) ? 'number_patterns' : 'algebra_equations'
    return ['number_operations', middle, 'geometry_measurement', 'statistics_probability'].map(topicArea)
  }
  if (subject === 'english') return ENGLISH_AREAS
  if (subject === 'reading') return READING_AREAS
  return TOPICS.filter(t => t.subject === subject).map(t => topicArea(t.slug))
}

// ─── Rules ──────────────────────────────────────────────────────────────────

interface Rule {
  skill: string
  /** Matches when the question's diagram is one of these kinds. */
  diagrams?: readonly string[]
  /** Matches when the question text matches. */
  re?: RegExp
  /** Any other condition. */
  when?: (q: BankQuestion) => boolean
}

const CHARTS = ['bar_chart', 'line_graph', 'pie_chart', 'pictograph', 'dot_plot', 'stem_leaf', 'box_plot', 'data_table']

function matches(rule: Rule, q: BankQuestion, text: string): boolean {
  if (rule.diagrams && q.diagram && rule.diagrams.includes(q.diagram.kind)) return true
  if (rule.re && rule.re.test(text)) return true
  if (rule.when && rule.when(q)) return true
  return false
}

function firstSkill(rules: readonly Rule[], q: BankQuestion, fallback: string): string {
  const text = q.question_text
  for (const rule of rules) if (matches(rule, q, text)) return rule.skill
  return fallback
}

// Superscripts other than those in area and volume units (cm², m³).
const POWER = /(?<!m)[²³⁴⁵⁶⁷⁸⁹⁰¹⁻]|\^/

const NUMBER_RULES: Rule[] = [
  { skill: 'Percentages', re: /%|\bper ?cent/i },
  {
    skill: 'Powers & roots',
    re: /\bpowers?\b|\bind(?:ex|ices)\b|squared|cubed|square root|cube root|√|scientific notation|standard form|×\s?10(?=[⁰¹²³⁴⁵⁶⁷⁸⁹⁻^])|irrational|\brational\b|\bsurds?\b|(\d)\s*×\s*\1\s*×\s*\1/i,
    when: q => POWER.test(q.question_text),
  },
  {
    skill: 'Fractions',
    diagrams: ['fraction_model'],
    re: /fraction|numerator|denominator|\bhal(?:f|ves)\b|\bquarters?\b|\bthirds?\b|\bfifths?\b|\beighths?\b|\btenths? of\b|\d+\s*\/\s*\d+|[½¼¾⅓⅔⅛⅜⅝⅞]|mixed number/i,
  },
  {
    skill: 'Money',
    diagrams: ['money', 'price_tags'],
    re: /\$|\bcents?\b|\bchange\b|\bcosts?\b|\bprices?\b|\bpaid\b|\bpays?\b|\bspen[dt]|\bearns?|\bbudget|\bsav(?:e|es|ed|ings)\b|\bdollars?\b|\bcoins?\b|\bworth\b/i,
  },
  { skill: 'Ratios & rates', re: /\bratios?\b|\brates?\b|per hour|km\/h|\bspeed|\bscale\b|proportion|recipe|for every|\bper (?:minute|second|day|week|kilogram|kg|litre)\b/i },
  { skill: 'Negative numbers', re: /negative|integer|below zero|temperature|\bminus\b|(?:^|[\s(])[−-]\d/i },
  { skill: 'Estimating & rounding', re: /\bround|estimat|nearest|approximately|about how many|significant figure/i },
  { skill: 'Order of operations', re: /\d\s*[+−-]\s*\d+\s*[×÷]|\d\s*[×÷]\s*\d+\s*[+−-]|\(\s*\d+\s*[+−-]\s*\d+\s*\)\s*[×÷]/ },
  { skill: 'Decimals', re: /decimal|\btenths?\b|hundredths?|thousandths?|\d\.\d/i },
  { skill: 'Factors & multiples', re: /\bfactors?\b|\bmultiples?\b|\bprime\b|square numbers?|divisible|\beven\b|\bodd\b|common (?:factor|multiple)/i },
  {
    skill: 'Division',
    re: /÷|divid|\bshares?\b|\bshared\b|equally|left over|remainder|can be filled|how many (?:groups|boxes|bags|teams|cartons|tents|buses|packs|rows|tables|trips|glasses|bottles)/i,
  },
  { skill: 'Multiplication', diagrams: ['array'], re: /×|multipl|\btimes\b|\bproduct\b|groups of|rows of|\beach\b|can \d+ \w+ (?:carry|hold)/i },
  {
    skill: 'Place value & ordering',
    diagrams: ['place_value', 'number_line'],
    re: /place value|\bdigits?\b|value of the|\bthousands?\b|\bhundreds?\b|largest|smallest|greatest|heaviest|lightest|longest|shortest|tallest|fastest|slowest|\border\b|expanded|numeral|in words|written as|closest to|between/i,
  },
  { skill: 'Addition & subtraction', re: /\+|−|\badd|subtract|\bsum\b|difference|more than|fewer|less than|altogether|\btotal\b|\bleft\b|how (?:many|much) more/i },
]

const PATTERN_RULES: Rule[] = [
  { skill: 'Order of operations', re: /\([^)]*[+−×÷-][^)]*\)|\d\s*[+−-]\s*\d+\s*[×÷]|\d\s*[×÷]\s*\d+\s*[+−-]/ },
  { skill: 'Number sentences', diagrams: ['balance'], re: /balance|missing|unknown|thinks? of a number|number sentence|\btrue\b|same value|=/i },
]

const ALGEBRA_RULES: Rule[] = [
  {
    skill: 'Simultaneous equations',
    re: /simultaneous|cost the same|charge the same|same amount|break even|tickets .{0,40}took|two numbers add/i,
  },
  { skill: 'Rearranging formulas', re: /the subject\b/i },
  { skill: 'Expanding & simplifying', re: /expand|factoris|simplif|(?:equal|the same) (?:to|as) \(|like terms/i },
  { skill: 'Exponential growth & decay', re: /doubles|halves|bacteria|population|[ᵗⁿ]|growth|decay|depreciat|compound/i },
  { skill: 'Quadratics', re: /quadratic|parabola|turning point|[a-ln-z]²|\)²|[a-z]\^2/i },
  { skill: 'Substitution', re: /\b(?:when|if)\s+[a-z]\s*=|substitut/i },
  { skill: 'Graphs of real situations', diagrams: ['line_graph'] },
  {
    skill: 'Linear relationships',
    diagrams: ['coordinate_plane', 'function_graph'],
    re: /gradient|\bslope|intercept|straight line|\blinear\b|the line\b|y\s*=|per (?:km|kilometre|hour|minute|week|day)\b|flagfall|call-out|for each|plus \d+ cents|\b[A-Z]\s*=\s*[\d.]+\s*[+−-]|\b[A-Z]\s*=\s*[\d.]+[a-z]|\bfees?\b|\bcharges?\b|steady rate|same rate/i,
  },
  { skill: 'Rates & proportion', re: /proportional|\bspeed|km\/h|\brates?\b/i },
  { skill: 'Inequalities', re: /inequalit|[<>≤≥]|first be (?:more|less)/i },
  { skill: 'Index laws', re: /\bind(?:ex|ices)\b|\bpowers?\b|exponent|[²³⁴⁵⁶⁷⁸⁹]/i },
  {
    skill: 'Solving equations',
    diagrams: ['balance'],
    re: /\bsolve|solution|equation|value of [a-z]\b|what is [a-z]\b|find [a-z]\b|thinks of a number|consecutive|perimeter|balance/i,
  },
  { skill: 'Expressions', re: /expression|evaluate/i },
  { skill: 'Patterns & sequences', diagrams: ['tile_pattern'], re: /pattern|sequence|\bterm\b|\brule\b|how many sticks/i },
  { skill: 'Formulas & modelling', re: /formula|\bmodel|represents?/i },
]

const MEASUREMENT_RULES: Rule[] = [
  { skill: 'Measuring & units', re: /°C|temperature|thermometer/i },
  {
    skill: 'Time',
    diagrams: ['clock', 'calendar'],
    re: /\btime\b|clock|o['’]?clock|\bminutes?\b|\bhours?\b|\b\d{1,2}(?::\d\d)?\s?(?:am|pm)\b|\b\d{1,2}:\d\d\b|24-hour|timetable|calendar|leaves at|arrives at|starts at|finishes at|duration|\bnoon\b|midnight|\bdate\b|\bdays? (?:after|before|later|earlier)\b/i,
  },
  {
    skill: 'Pythagoras & trigonometry',
    re: /pythagoras|hypotenuse|\bsin\b|\bcos\b|\btan\b|\bsine\b|cosine|trigonometr|diagonal|third side|exact height|longest (?:straight )?rod|how (?:high|far) up the wall|makes a right-angled triangle|angle .{0,40}ground is closest/i,
  },
  { skill: 'Similarity & congruence', re: /\bsimilar\b|congruen|scale factor|enlarge/i },
  { skill: 'Surface area & volume', re: /surface area/i },
  {
    skill: 'Area & perimeter',
    re: /\barea\b|perimeter|circumference|curved edge|semicircle|fenc(?:e|ing)|carpet|enclose|\bwheel\b|[cmk]?m²|square (?:units|centimetres|metres|kilometres)|distance around|how many squares|squares does/i,
  },
  { skill: 'Volume & capacity', re: /volume|capacity|[cm]?m³|litres?\b|\bmL\b|\d\s?L\b|how many cubes|\bwater\b|bathtub|\bjug\b/i },
  { skill: 'Angles', re: /\bangles?\b|degrees|°|protractor|\bacute\b|obtuse|reflex|right angle|bearing|parallel|straight line|value of [a-z]\b/i },
  { skill: 'Symmetry & transformations', re: /reflect|rotat|\bturns?\b|\bflip|translat|transformation|\bslide|\bmoved?\b|symmetr|mirror/i },
  { skill: 'Scale drawings', re: /scale of 1|scale 1 ?:|to a scale|drawn to scale/i },
  { skill: 'Maps & position', diagrams: ['grid_map'], re: /\bmaps?\b|\bnorth|\bsouth|\beast\b|\bwest\b|grid reference|coordinates?|direction|compass|in which square|\bplan\b/i },
  { skill: '3D objects', diagrams: ['net', 'solid'], re: /prism|pyramid|cylinder|\bcones?\b|sphere|\bcubes?\b|cuboid|\bfaces?\b|\bedges?\b|vertices|\bnets?\b|3D|three-dimensional/i },
  {
    skill: '2D shapes',
    diagrams: ['simple_shape'],
    re: /triangle|quadrilateral|polygon|parallel|perpendicular|rhombus|trapezium|\bkite\b|parallelogram|pentagon|hexagon|octagon|circle|radius|diameter|\bshapes?\b|\bsides?\b/i,
  },
  {
    skill: 'Measuring & units',
    diagrams: ['measure', 'balance'],
    re: /\bkg\b|kilogram|\bgrams?\b|\bmass\b|heav|weigh|\bcm\b|\bmm\b|\bkm\b|metres?|centimetres?|millimetres?|length|\blong\b|\btall\b|height|width|convert|\bunits?\b|ruler/i,
  },
]

const STATISTICS_RULES: Rule[] = [
  {
    skill: 'Chance & probability',
    diagrams: ['spinner', 'venn'],
    re: /chance|probab|likely|certain|impossible|random|spinner|\bdice\b|\bdie\b|\bcoins?\b|counters?|marbles?|\bbag\b|expect|outcomes?|\bodds\b/i,
  },
  { skill: 'Mean, median & mode', re: /\bmean\b|median|\bmode\b|\brange\b|average|most common|quartile|outlier|interquartile|standard deviation/i },
  {
    skill: 'Displaying data',
    when: q => Boolean('option_diagrams' in q && q.option_diagrams?.length),
    re: /which (?:graph|chart|plot|table|column graph|dot plot|display)|best (?:way|type) to (?:display|show)|most suitable/i,
  },
  { skill: 'Collecting data', re: /statistical question|best question|survey|collect|\bsample\b|census/i },
  { skill: 'Reading graphs & data', diagrams: CHARTS, re: /graph|chart|table|plot|tally|\bdata\b|\bkey\b|pictograph|column/i },
]

const MATH_RULES: Record<string, { rules: Rule[]; fallback: string }> = {
  number_operations: { rules: NUMBER_RULES, fallback: 'Word problems' },
  number_patterns: { rules: PATTERN_RULES, fallback: 'Patterns & rules' },
  algebra_equations: { rules: ALGEBRA_RULES, fallback: 'Algebra word problems' },
  geometry_measurement: { rules: MEASUREMENT_RULES, fallback: 'Measurement problems' },
  statistics_probability: { rules: STATISTICS_RULES, fallback: 'Working with data' },
}

const SPELLING = /\bspel(?:t|led|ling|l)\b|misspel/i
const PUNCTUATION =
  /punctuat|apostrophe|\bcommas?\b|capital letters?|\bcapitals?\b|question mark|full stop|exclamation mark|quotation mark|speech mark|inverted comma|\bcolon\b|semi-?colon|\bdash(?:es)?\b|hyphen|brackets|parenthes/i
const VOCABULARY = /means? the same|synonym|antonym|opposite|prefix|suffix|meaning|closest in meaning|root word|word root/i

function englishArea(q: BankQuestion): AreaDef {
  const text = q.question_text
  if (SPELLING.test(text)) return ENGLISH_AREAS[0]
  if (PUNCTUATION.test(text)) return ENGLISH_AREAS[2]
  if (q.topic === 'vocabulary' || VOCABULARY.test(text)) return ENGLISH_AREAS[3]
  return ENGLISH_AREAS[1]
}

// Word meaning is vocabulary in context — what a word means here. "What does
// the writer mean by …" asks for an interpretation, which is inferring.
const WORD_MEANING = [
  /the (?:word|term)\s+["“‘'][^"”’']{1,30}["”’'].{0,40}\bmeans?\b/i,
  /what (?:does|do) the (?:word|term)\b.{0,40}\bmean\b/i,
  // A quoted word or short phrase: What does “hover” mean?
  /[Ww]hat does ["“‘'][\w-]+(?: [\w-]+){0,2}["”’'] mean\b/,
  // An unquoted lower-case word: What does proportion mean here? (Not "What does Ava mean".)
  /[Ww]hat does [a-z][\w-]* mean (?:here|in this)/,
  /closest in meaning|meaning of the word|best replaces?|could replace the word|another word for|synonym/i,
]
const PURPOSE =
  /purpose|main idea|mainly about|mostly about|aimed at|audience|why (?:did|does|has|have|do) the (?:writer|author|poet|narrator)|the (?:writer|author|poet)(?:['’]s)? (?:uses?|includes?|wants|wrote|begins|ends|compares|describes|chose|purpose|opinion|view)|text type|type of text|organised|heading|sub-?heading|\btitle\b|structure|persua(?:de|sive)|convince|\bmood\b|\btone\b|technique|literary|language feature|device|point of view|\bnarrat(?:ive|ion)\b|written to|genre|\bstyle\b|layout|caption|\bbold\b|italics|dot points|bullet|this text is|best describes (?:the|this) (?:text|article|story)|comparison|simile|metaphor|personification|alliteration|imagery|rhetorical|repetition|fragments|described as|as if it were|contribute|the effect of|(?:opening|closing|first|last) (?:line|sentence)|uses the words?|\blesson\b|\bmoral\b|message|\btheme/i
const INFERRING =
  /infer|suggest|conclude|most likely|probably|what can you tell|you can tell|we can tell|tells (?:you|us|the reader)|\bthis (?:detail |sentence |line |exaggeration |description |comparison )?shows?\b|shows? (?:that|about)|\bfeel|\bfelt|feeling|impl(?:y|ies)|might happen|why do you think|reveal|\bthis means\b|meant by|what does .{0,80}\bmean\b|best describes/i

function readingArea(q: BankQuestion): AreaDef {
  const text = q.question_text
  if (WORD_MEANING.some(re => re.test(text))) return READING_AREAS[2]
  if (PURPOSE.test(text)) return READING_AREAS[3]
  if (INFERRING.test(text)) return READING_AREAS[1]
  return READING_AREAS[0]
}

/** The area and skill a question counts towards in a diagnostic report. */
export function classify(q: BankQuestion): Classified {
  const subject = subjectOfTopic(q.topic)
  if (subject === 'english') {
    const area = englishArea(q)
    return { area, skill: area.label }
  }
  if (subject === 'reading') {
    const area = readingArea(q)
    return { area, skill: area.label }
  }
  const area = topicArea(q.topic)
  const math = subject === 'math' ? MATH_RULES[q.topic] : undefined
  return { area, skill: math ? firstSkill(math.rules, q, math.fallback) : area.label }
}
