import { Document, Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './theme'
import { Watermark, PageFooter } from './Brand'
import type { ResolvedExam, ResolvedQuestion } from './resolveExam'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

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
      ) : (
        (question.options ?? []).map((opt, i) => (
          <View key={i} style={pdfStyles.optionRow}>
            <View style={pdfStyles.optionBubble} />
            <Text style={pdfStyles.optionText}>{OPTION_LETTERS[i]}. {opt}</Text>
          </View>
        ))
      )}
    </View>
  )
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
