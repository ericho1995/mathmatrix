import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QUESTION_BANK } from '../../src/lib/questions/bank.ts'
import { PRACTICE_EXAMS } from '../../src/lib/questions/exams.ts'
import { offeredTests, testSpec } from '../../src/lib/diagnostic/blueprint.ts'
import { selectTest, selectReading } from '../../src/lib/diagnostic/select.ts'
import { buildReport } from '../../src/lib/diagnostic/score.ts'
import { classify } from '../../src/lib/diagnostic/areas.ts'
import { composeTailoredExam, weakAreas } from '../../src/lib/diagnostic/tailor.ts'
import { isViable, lowAreas, monthWindow, newQuestions, paperExamId, PAPERS_PER_MONTH } from '../../src/lib/diagnostic/weakPapers.ts'
import { paperOpen, paperRights } from '../../src/lib/diagnostic/access.ts'

const byId = new Map(QUESTION_BANK.map(q => [q.id, q]))
const CATALOGUE = new Set(PRACTICE_EXAMS.flatMap(e => e.sections.flatMap(s => s.question_ids)))
const wrongAnswer = q => (q.format === 'short_answer' ? 'zzz' : (q.correct_index + 1) % q.options.length)
const rightAnswer = q => (q.format === 'short_answer' ? q.expected_answer : q.correct_index)

/** A result where the first area asked went badly and the rest well. */
function simulate(o, seed) {
  const ids =
    o.subject === 'reading'
      ? selectReading(QUESTION_BANK, o.year, seed)
      : selectTest(QUESTION_BANK, testSpec(QUESTION_BANK, o.year, o.subject), seed)
  const weakArea = classify(byId.get(ids[0])).area.id
  const responses = ids.map(id => {
    const q = byId.get(id)
    return { id, a: classify(q).area.id === weakArea ? wrongAnswer(q) : rightAnswer(q) }
  })
  return { ids, weakArea, report: buildReport(byId, o.year, o.subject, responses) }
}

const ids = exam => exam.sections.flatMap(s => s.question_ids)

/** Papers 1..n for one result, each told what the earlier ones used — as the server does. */
function series(report, n) {
  const used = new Set()
  const papers = []
  for (let seq = 1; seq <= n; seq++) {
    const exam = composeTailoredExam(QUESTION_BANK, { resultId: 'r1', report, childName: 'Mia' }, { weakOnly: true, seq, used, allowed: CATALOGUE, id: `p${seq}` })
    papers.push(exam)
    for (const id of ids(exam)) used.add(id)
  }
  return papers
}

for (const o of offeredTests(QUESTION_BANK)) {
  test(`weak-areas papers for ${o.year} ${o.subject}`, () => {
    const { ids: asked, weakArea, report } = simulate(o, 21)
    const weak = new Set(weakAreas(report).areas.map(a => a.id))
    assert.ok(weak.has(weakArea), `${weakArea} is not treated as weak`)
    const [first, second] = series(report, 2)

    assert.match(first.title, /Mia’s weak areas, paper 1/)
    assert.equal(first.id, 'p1')
    assert.equal(first.weakOnly, true)
    const diagnostic = new Set(asked)
    for (const exam of [first, second]) {
      for (const id of ids(exam)) {
        const q = byId.get(id)
        // Every question practises a weak area — none from a strength.
        assert.ok(weak.has(classify(q).area.id), `${exam.id}: ${id} is in ${classify(q).area.id}, not a weak area`)
        // New questions are catalogue questions; only second chance repeats the diagnostic.
        if (!diagnostic.has(id)) assert.ok(CATALOGUE.has(id), `${id} is not in a catalogue paper`)
      }
      for (const f of exam.focus) assert.ok(weak.has(f.area), `focus on ${f.area}`)
      assert.equal(new Set(ids(exam)).size, ids(exam).length, 'no question twice')
    }
    // The second paper repeats nothing from the first.
    const one = new Set(ids(first))
    const repeated = ids(second).filter(id => one.has(id))
    assert.deepEqual(repeated, [], `paper 2 repeats ${repeated.length} questions of paper 1`)
    // Different seeds, different papers, unless the second is empty.
    if (ids(second).length) assert.notDeepEqual(ids(second), ids(first))
  })
}

test('the first weak-areas paper is a full paper wherever the test is offered', () => {
  const thin = []
  for (const o of offeredTests(QUESTION_BANK)) {
    const exam = series(simulate(o, 21).report, 1)[0]
    if (!isViable(exam)) thin.push(`${o.year} ${o.subject}: ${newQuestions(exam)}`)
  }
  assert.deepEqual(thin, [])
})

test('an early-sign area is never a weakness; no weakness falls back to the lowest two', () => {
  const area = (id, level, confidence) => ({ id, label: id, level, confidence })
  const r = { areas: [area('a', 'focus', 'early'), area('b', 'developing', 'likely'), area('c', 'strength', 'clear')] }
  assert.deepEqual(weakAreas(r).areas.map(a => a.id), ['b'])
  const none = { areas: [area('a', 'focus', 'early'), area('b', 'strength', 'clear'), area('c', 'strength', 'clear')] }
  const w = weakAreas(none)
  assert.equal(w.fallback, true)
  assert.deepEqual(w.areas.map(a => a.id), ['a', 'b'])
})

test('papers keep coming until the area runs dry, and the alert fires before it does', () => {
  // Grade 3 punctuation is a small pool: it must be reported low within a few papers.
  const o = { year: 'grade_3', subject: 'english' }
  const asked = selectTest(QUESTION_BANK, testSpec(QUESTION_BANK, o.year, o.subject), 21)
  const responses = asked.map(id => {
    const q = byId.get(id)
    return { id, a: classify(q).area.id === 'punctuation' ? wrongAnswer(q) : rightAnswer(q) }
  })
  const report = buildReport(byId, o.year, o.subject, responses)
  const bank = QUESTION_BANK.filter(q => CATALOGUE.has(q.id))
  const used = new Set()
  const exam = composeTailoredExam(QUESTION_BANK, { resultId: 'r', report, childName: null }, { weakOnly: true, seq: 1, used, allowed: CATALOGUE })
  const low = lowAreas(bank, report, exam, used)
  assert.ok(low.some(l => l.area === 'punctuation'), 'punctuation not reported low')
  for (const l of low) assert.ok(l.remaining >= 0)
})

test('monthly window is the Melbourne calendar month', () => {
  // 30 Sep 2026 15:00 UTC is 1 Oct 01:00 in Melbourne (AEST, +10 — daylight saving starts 4 Oct).
  const w = monthWindow(new Date('2026-09-30T15:00:00Z'))
  assert.equal(w.start.toISOString(), '2026-09-30T14:00:00.000Z')
  // 1 Nov is in daylight saving (+11).
  assert.equal(w.resets.toISOString(), '2026-10-31T13:00:00.000Z')
  // December rolls into January.
  const dec = monthWindow(new Date('2026-12-15T00:00:00Z'))
  assert.equal(dec.resets.toISOString(), '2026-12-31T13:00:00.000Z')
})

test('rights: plan capped, VCE per paper, admin free, nothing without a plan', () => {
  const none = { admin: false, plan: null, legacyYears: new Set(), papers: new Set() }
  assert.deepEqual(paperRights('grade_5', none), { kind: 'locked' })
  assert.deepEqual(paperRights('grade_5', { ...none, plan: { status: 'active' } }), { kind: 'allowance', limit: PAPERS_PER_MONTH })
  assert.deepEqual(paperRights('year_12', none), { kind: 'per_paper' })
  assert.deepEqual(paperRights('year_12', { ...none, plan: { status: 'active' } }), { kind: 'per_paper' })
  assert.deepEqual(paperRights('year_12', { ...none, admin: true }), { kind: 'allowance', limit: null })
  assert.deepEqual(paperRights('grade_5', { ...none, legacyYears: new Set(['grade_5']) }), { kind: 'allowance', limit: PAPERS_PER_MONTH })

  assert.equal(paperOpen({ id: 'x', year: 'year_12' }, none), false)
  assert.equal(paperOpen({ id: 'x', year: 'year_12' }, { ...none, papers: new Set([paperExamId('x')]) }), true)
  assert.equal(paperOpen({ id: 'y', year: 'year_12' }, { ...none, papers: new Set([paperExamId('x')]) }), false)
  assert.equal(paperOpen({ id: 'x', year: 'grade_5' }, { ...none, plan: { status: 'active' } }), true)
})

test('the cover and section notes describe a weak-areas paper', async () => {
  const { tailoredCoverNote } = await import('../../src/lib/diagnostic/paper.ts')
  const { report } = simulate({ year: 'grade_5', subject: 'math' }, 21)
  const [exam] = series(report, 1)
  assert.match(tailoredCoverNote(exam, 'Mia').join(' '), /every question practices an area still to work on/)

  // A result with no firm weakness: the lowest two areas, labelled as such everywhere.
  const area = (id, label, level, confidence) => ({ id, label, level, confidence, secure: 3, evidence: 4, skills: [] })
  const soft = { ...report, areas: report.areas.map(a => area(a.id, a.label, a.level === 'strength' ? 'strength' : 'focus', 'early')) }
  const fallback = composeTailoredExam(QUESTION_BANK, { resultId: 'f', report: soft, childName: 'Mia' }, { weakOnly: true, seq: 1, allowed: CATALOGUE })
  assert.equal(fallback.fallback, true)
  assert.match(tailoredCoverNote(fallback, 'Mia').join(' '), /found no weak area/)
  const notes = fallback.sections.flatMap(s => s.instructions ?? []).filter(l => l.startsWith('Question'))
  assert.ok(notes.length > 0)
  for (const l of notes) assert.match(l, /\(one of the lowest areas\)\.$/)
})

test('generated papers do not lean on one answer letter', () => {
  // The bank warns above 40% in a group of eight or more. Reading is exempt —
  // its questions come with whole texts — and so are pools too small to swap in.
  const over = []
  for (const o of offeredTests(QUESTION_BANK)) {
    if (o.subject === 'reading') continue
    for (const exam of series(simulate(o, 21).report, 2)) {
      const diagnostic = new Set(simulate(o, 21).ids)
      const counts = [0, 0, 0, 0, 0]
      let mc = 0
      for (const id of ids(exam)) {
        const q = byId.get(id)
        if (diagnostic.has(id) || typeof q.correct_index !== 'number') continue
        counts[q.correct_index]++
        mc++
      }
      if (mc >= 8 && Math.max(...counts) / mc > 0.4) over.push(`${o.year} ${o.subject} ${exam.id}: ${counts.join('/')}`)
    }
  }
  assert.ok(over.length <= 2, over.join('\n'))
})
