import { Document, Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './theme'
import type { ResolvedExam } from './resolveExam'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function AnswerKeyDocument({ resolved }: { resolved: ResolvedExam }) {
  const { exam, sections } = resolved
  let questionNumber = 0

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.coverTitle}>{exam.title} — Answers &amp; Explanations</Text>
        <Text style={pdfStyles.coverSubtitle}>For a parent, tutor, or the student to mark the exam paper against.</Text>
        {sections.map((s, si) => (
          <View key={si}>
            <Text style={pdfStyles.sectionHeader}>{s.section.title}</Text>
            {s.questions.map(q => {
              questionNumber++
              const answerLabel = q.format === 'long_form'
                ? 'See explanation below — this question is not auto-marked.'
                : `${OPTION_LETTERS[q.correct_index ?? 0]}. ${(q.options ?? [])[q.correct_index ?? 0] ?? ''}`
              return (
                <View key={q.id} style={pdfStyles.answerKeyRow} wrap={false}>
                  <Text><Text style={pdfStyles.answerKeyNum}>{questionNumber}. </Text>{answerLabel}</Text>
                  <Text style={pdfStyles.explanation}>{q.explanation}</Text>
                </View>
              )
            })}
          </View>
        ))}
      </Page>
    </Document>
  )
}
