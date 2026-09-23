import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './theme'
import { Watermark, PageFooter } from './Brand'
import { SUBJECTS, SELECTIVE_SUBJECTS } from '@/lib/curriculum'
import { firstQuestionNumbers } from './resolveExam'
import type { ResolvedExam, ResolvedQuestion } from './resolveExam'
import type { PracticeExam, PracticeExamSection } from '@/lib/questions/exams'
import { DiagramView, OptionDiagrams } from './diagrams'
import { READING_TEXTS } from '@/lib/questions/magazines'
import { paperMinutes } from '@/lib/exams/paperTime'
import { PreviewCoverBanner, PreviewEndPage } from './PreviewPages'
import type { PreviewInfo } from './preview'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * Render-time-only, best-effort extraction of a unit/currency symbol to print
 * alongside a short_answer question's blank line (e.g. `$______` or
 * `______ m`), matching real NAPLAN's unit-aware blanks. Never invents a unit
 * that isn't actually present in `expectedAnswer` — an unrecognized shape
 * falls back to a plain blank (the pre-existing behavior). Purely a display
 * helper: `expected_answer` itself and grading (`matchShortAnswer`) are
 * untouched.
 */
function extractAnswerUnit(expectedAnswer: string): { prefix?: string; suffix?: string } {
  const trimmed = expectedAnswer.trim()
  const currencyMatch = trimmed.match(/^([$€£])\s?[\d,.]/)
  if (currencyMatch) return { prefix: currencyMatch[1] }
  // A number followed by a unit: words ("beads", "degrees"), metric units with
  // powers ("cm²", "m³"), compound units ("km/h", "L/100 km"), or a bare symbol
  // ("°", "%"). Real papers print these on the answer line.
  const unitMatch = trimmed.match(/^[−-]?[\d,.]+\s*((?:[a-zA-Z]{1,15}(?:[²³]|\/[a-zA-Z0-9 ]{1,8})?)|°C?|%)$/)
  if (unitMatch) return { suffix: unitMatch[1] }
  return {}
}

/** How many ruled lines of working a part earns. VCAA scales the writing space
 * to the marks, so a 1-mark "state the value" gets a line and a 4-mark
 * derivation gets room to actually derive it. */
function workingLinesFor(marks: number): number {
  return Math.min(10, Math.max(2, marks * 2))
}

function QuestionBlock({ question, number }: { question: ResolvedQuestion; number: number }) {
  // VCE extended response: one scenario, then lettered parts with their own
  // marks. Rendered as its own branch because nothing else in the paper has
  // sub-parts, and `wrap` is left on — a 13-mark question with its working
  // space is taller than a page and must be allowed to break.
  if (question.format === 'extended_response') {
    const total = question.parts.reduce((sum, p) => sum + p.marks, 0)
    return (
      <View style={pdfStyles.questionRow}>
        {/* The heading, stem and diagram stay together: a stem stranded at the
            foot of a page with its network or table overleaf is unreadable. */}
        <View wrap={false}>
          <View style={pdfStyles.questionHeaderRow}>
            <Text style={pdfStyles.questionText}>Question {number}</Text>
            <Text style={pdfStyles.questionMarks}>({total} {total === 1 ? 'mark' : 'marks'})</Text>
          </View>
          <Text style={pdfStyles.questionText}>{question.question_text}</Text>
          {question.diagram ? <DiagramView diagram={question.diagram} /> : null}
        </View>
        {question.parts.map((part, i) => (
          <View key={i} wrap={false}>
            <View style={pdfStyles.partRow}>
              <Text style={pdfStyles.partLabel}>{part.label}.</Text>
              <Text style={pdfStyles.partPrompt}>{part.prompt}</Text>
              <Text style={pdfStyles.partMarks}>{part.marks} {part.marks === 1 ? 'mark' : 'marks'}</Text>
            </View>
            {Array.from({ length: workingLinesFor(part.marks) }).map((_, l) => (
              <View key={l} style={pdfStyles.partWorkingLine} />
            ))}
          </View>
        ))}
      </View>
    )
  }

  return (
    <View style={pdfStyles.questionRow} wrap={false}>
      <Text style={pdfStyles.questionText}>{number}. {question.question_text}</Text>
      {question.diagram ? <DiagramView diagram={question.diagram} /> : null}
      {question.format === 'long_form' ? (
        <>
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
        </>
      ) : question.format === 'short_answer' ? (
        (() => {
          const { prefix, suffix } = extractAnswerUnit(question.expected_answer)
          // Box width tracks how much the student actually needs to write —
          // a one-digit answer and "$793.50" shouldn't get the same box —
          // generously sized so it reads as a real writing space, not a slot.
          const core = question.expected_answer.replace(/^[$€£]\s?/, '').trim()
          const boxWidth = Math.min(220, Math.max(80, core.length * 15 + 40))
          // Indent to roughly where the question's wording starts (after
          // "N. "), not flush with the number, so the box reads as part of
          // the sentence rather than a new column under the numbering.
          const indent = String(number).length >= 2 ? 26 : 20
          return (
            <View style={[pdfStyles.shortAnswerRow, { marginLeft: indent }]}>
              {prefix ? <Text style={pdfStyles.shortAnswerUnit}>{prefix}</Text> : null}
              <View style={[pdfStyles.answerBox, { width: boxWidth, flexGrow: 0 }]} />
              {suffix ? <Text style={pdfStyles.shortAnswerUnit}>{suffix}</Text> : null}
            </View>
          )
        })()
      ) : 'option_diagrams' in question && question.option_diagrams?.length ? (
        <OptionDiagrams diagrams={question.option_diagrams} captions={question.options ?? []} />
      ) : (
        <View style={pdfStyles.optionsWrap}>
          {(question.options ?? []).map((opt, i) => (
            <View key={i} style={pdfStyles.optionBox}>
              <Text style={pdfStyles.optionBoxText}>{OPTION_LETTERS[i]}. {opt}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

/** Plain NAPLAN-style running header for a section's content page(s):
 * subject + year level, all-caps, plus calculator status when the section
 * sets one (split exams). Section title/time stay below it — this app's
 * per-section time display is a useful deviation from real NAPLAN's
 * cover-only timing, kept deliberately (see design doc). */
function RunningHeader({ exam, section }: { exam: PracticeExam; section: PracticeExamSection }) {
  const subjectLabel = ([...SUBJECTS, ...SELECTIVE_SUBJECTS].find(s => s.slug === exam.subject)?.label ?? exam.subject).toUpperCase()
  const yearLabel = exam.yearLevel.replace('_', ' ').toUpperCase()
  const calcNote = section.calculator_allowed === true
    ? ' (CALCULATOR ALLOWED)'
    : section.calculator_allowed === false
      ? ' (NON-CALCULATOR)'
      : ''
  return <Text style={pdfStyles.runningHeader}>{yearLabel} {subjectLabel}{calcNote}</Text>
}

/**
 * The line that opens each part of a Reading paper, in the words the real
 * booklet uses: which text, where to find it, and which questions it covers.
 * Returns null for every other kind of paper.
 */
function readingInstruction(exam: PracticeExam, s: ResolvedExam['sections'][number], first: number) {
  if (exam.subject !== 'reading' || !s.questions.length) return null
  const range = s.questions.length === 1 ? `question ${first}` : `questions ${first} to ${first + s.questions.length - 1}`
  const text = s.questions[0].stimulus_id ? READING_TEXTS.get(s.questions[0].stimulus_id) : undefined
  if (exam.magazine_id && text) {
    return (
      <Text style={pdfStyles.readingInstruction}>
        Read <Text style={pdfStyles.readingInstructionTitle}>{text.title}</Text> on page {text.page} of the magazine and answer {range}.
      </Text>
    )
  }
  const passage = s.questions[0].stimulus
  if (passage) {
    return (
      <Text style={pdfStyles.readingInstruction}>
        Read <Text style={pdfStyles.readingInstructionTitle}>{passage.title}</Text> and answer {range}.
      </Text>
    )
  }
  return <Text style={pdfStyles.readingInstruction}>Read each short text and answer {range}.</Text>
}

export function ExamPaperDocument({ resolved, preview }: { resolved: ResolvedExam; preview?: PreviewInfo }) {
  const { exam, sections } = resolved
  const sectionStart = firstQuestionNumbers(sections)
  const totalMinutes = paperMinutes({ total_minutes: exam.total_minutes, sections: sections.map(s => s.section) })
  const usesMagazine = Boolean(exam.magazine_id)
  const footerTitle = preview ? `${exam.title} · Free preview` : exam.title

  return (
    <Document>
      <Page size="A4" style={pdfStyles.coverPage}>
        <View style={pdfStyles.coverBand}>
          <Text style={pdfStyles.coverWordmark}>Prep<Text style={pdfStyles.coverWordmarkAccent}>Nest</Text></Text>
          <Text style={pdfStyles.coverTagline}>Curriculum-aligned practice exams</Text>
        </View>
        <Watermark />
        <View style={pdfStyles.coverBody}>
          <Text style={pdfStyles.coverEyebrow}>{usesMagazine ? 'Question paper' : 'Exam paper'}</Text>
          <Text style={pdfStyles.coverExamTitle}>{exam.title}</Text>
          {preview ? <PreviewCoverBanner info={preview} /> : null}
          {usesMagazine ? (
            <View style={pdfStyles.coverNeedBox}>
              <Text style={pdfStyles.coverNeedTitle}>You will need</Text>
              <Text style={pdfStyles.coverNeedText}>The Reading Magazine for this paper (a separate PDF). Print it too, or open it on a screen beside you.</Text>
            </View>
          ) : null}
          {exam.reading_minutes ? (
            <View style={pdfStyles.coverTimingBox}>
              <Text style={pdfStyles.coverTimingRow}>Reading time: {exam.reading_minutes} minutes (no writing)</Text>
              <Text style={pdfStyles.coverTimingRow}>Writing time: {totalMinutes} minutes</Text>
              <Text style={pdfStyles.coverTimingTotal}>Total time: {exam.reading_minutes + totalMinutes} minutes</Text>
            </View>
          ) : (
            <Text style={pdfStyles.coverMetaRow}>Total time: {totalMinutes} minutes</Text>
          )}
          <View style={pdfStyles.coverDivider} />
          <Text style={pdfStyles.coverSectionsLabel}>Sections in this paper</Text>
          {sections.map((s, i) => (
            <View key={i} style={pdfStyles.coverSectionRow}>
              <View style={pdfStyles.coverSectionDot} />
              <Text style={pdfStyles.coverSectionText}>
                {s.section.title}
                {s.section.time_minutes > 0 ? ` — ${s.section.time_minutes} min` : ''}
                {s.section.calculator_allowed !== undefined ? (s.section.calculator_allowed ? ' (calculator allowed)' : ' (no calculator)') : ''}
              </Text>
            </View>
          ))}
          <View style={pdfStyles.coverInstructionsBox}>
            <Text style={pdfStyles.coverInstructionsTitle}>Instructions</Text>
            <Text style={pdfStyles.coverInstructions}>
              {exam.reading_minutes ? 'You are not permitted to write during reading time — you may only read the paper and plan your approach. ' : ''}
              {usesMagazine ? 'Each part of this paper tells you which text in the magazine to read and the page it is on. Read the text first, then answer its questions. You may look back at the magazine as often as you like. ' : ''}
              Answer every question you can. Write your working in the space provided for long-answer questions.
              Marking guidance and full explanations are provided in the separate answer key.
            </Text>
          </View>
        </View>
        <PageFooter examTitle={footerTitle} />
      </Page>

      {/* A preview keeps every section so the cover describes the whole paper,
          but only lays out the sections it has questions from. */}
      {sections.map((s, si) => s.questions.length === 0 ? null : (
        <Page key={si} size="A4" style={pdfStyles.page}>
          <Watermark />
          <RunningHeader exam={exam} section={s.section} />
          {readingInstruction(exam, s, sectionStart[si] + 1) ?? (
            <>
              <Text style={pdfStyles.sectionHeader}>{s.section.title}</Text>
              <Text style={pdfStyles.sectionMeta}>
                {s.section.time_minutes} minutes
                {s.section.calculator_allowed !== undefined ? (s.section.calculator_allowed ? ' • Calculator allowed' : ' • No calculator') : ''}
              </Text>
            </>
          )}
          {(() => {
            const rendered: JSX.Element[] = []
            let lastStimulusId: string | undefined
            let questionNumber = sectionStart[si]
            for (const q of s.questions) {
              questionNumber++
              // A magazine paper's texts are in the magazine, not the paper.
              if (!usesMagazine && q.stimulus && q.stimulus.id !== lastStimulusId) {
                // Short passages are kept whole on one page; long ones must be
                // allowed to break, because wrap={false} on content taller than
                // a page silently clips the overflow rather than continuing it.
                const fitsOnOnePage = q.stimulus.body.length < 1200
                rendered.push(
                  <View key={`stim-${q.stimulus.id}`} style={pdfStyles.stimulusBox} wrap={!fitsOnOnePage}>
                    <Text style={pdfStyles.stimulusTitle}>{q.stimulus.title}</Text>
                    <Text style={pdfStyles.stimulusBody}>{q.stimulus.body}</Text>
                  </View>
                )
                lastStimulusId = q.stimulus.id
              }
              rendered.push(<QuestionBlock key={q.id} question={q} number={questionNumber} />)
            }
            return rendered
          })()}
          <PageFooter examTitle={footerTitle} />
        </Page>
      ))}
      {preview ? <PreviewEndPage info={preview} examTitle={exam.title} kind="paper" /> : null}
    </Document>
  )
}
