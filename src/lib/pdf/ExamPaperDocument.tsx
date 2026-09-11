import { Document, Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './theme'
import { Watermark, PageFooter } from './Brand'
import { SUBJECTS, SELECTIVE_SUBJECTS } from '@/lib/curriculum'
import type { ResolvedExam, ResolvedQuestion } from './resolveExam'
import type { PracticeExam, PracticeExamSection } from '@/lib/questions/exams'

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
  const unitMatch = trimmed.match(/^-?[\d,.]+\s+([a-zA-Z]{1,15})$/)
  if (unitMatch) return { suffix: unitMatch[1] }
  return {}
}

function QuestionBlock({ question, number }: { question: ResolvedQuestion; number: number }) {
  return (
    <View style={pdfStyles.questionRow} wrap={false}>
      <Text style={pdfStyles.questionText}>{number}. {question.question_text}</Text>
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
          return (
            <View style={pdfStyles.shortAnswerRow}>
              {prefix ? <Text style={pdfStyles.shortAnswerUnit}>{prefix}</Text> : null}
              <View style={pdfStyles.answerLine} />
              {suffix ? <Text style={pdfStyles.shortAnswerUnit}>{suffix}</Text> : null}
            </View>
          )
        })()
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

export function ExamPaperDocument({ resolved }: { resolved: ResolvedExam }) {
  const { exam, sections } = resolved
  let questionNumber = 0
  const totalMinutes = sections.reduce((sum, s) => sum + s.section.time_minutes, 0)

  return (
    <Document>
      <Page size="A4" style={pdfStyles.coverPage}>
        <View style={pdfStyles.coverBand}>
          <Text style={pdfStyles.coverWordmark}>Prep<Text style={pdfStyles.coverWordmarkAccent}>Nest</Text></Text>
          <Text style={pdfStyles.coverTagline}>Curriculum-aligned practice exams</Text>
        </View>
        <Watermark />
        <View style={pdfStyles.coverBody}>
          <Text style={pdfStyles.coverEyebrow}>Exam paper</Text>
          <Text style={pdfStyles.coverExamTitle}>{exam.title}</Text>
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
                {s.section.title} — {s.section.time_minutes} min
                {s.section.calculator_allowed !== undefined ? (s.section.calculator_allowed ? ' (calculator allowed)' : ' (no calculator)') : ''}
              </Text>
            </View>
          ))}
          <View style={pdfStyles.coverInstructionsBox}>
            <Text style={pdfStyles.coverInstructionsTitle}>Instructions</Text>
            <Text style={pdfStyles.coverInstructions}>
              {exam.reading_minutes ? 'You are not permitted to write during reading time — you may only read the paper and plan your approach. ' : ''}
              Answer every question you can. Write your working in the space provided for long-answer questions.
              Marking guidance and full explanations are provided in the separate answer key.
            </Text>
          </View>
        </View>
        <PageFooter examTitle={exam.title} />
      </Page>

      {sections.map((s, si) => (
        <Page key={si} size="A4" style={pdfStyles.page}>
          <Watermark />
          <RunningHeader exam={exam} section={s.section} />
          <Text style={pdfStyles.sectionHeader}>{s.section.title}</Text>
          <Text style={pdfStyles.sectionMeta}>
            {s.section.time_minutes} minutes
            {s.section.calculator_allowed !== undefined ? (s.section.calculator_allowed ? ' • Calculator allowed' : ' • No calculator') : ''}
          </Text>
          {(() => {
            const rendered: JSX.Element[] = []
            let lastStimulusId: string | undefined
            for (const q of s.questions) {
              questionNumber++
              if (q.stimulus && q.stimulus.id !== lastStimulusId) {
                rendered.push(
                  <View key={`stim-${q.stimulus.id}`} style={pdfStyles.stimulusBox} wrap={false}>
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
          <PageFooter examTitle={exam.title} />
        </Page>
      ))}
    </Document>
  )
}
