import { Document, Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles, BRAND_BLUE } from './theme'
import { Watermark, PageFooter } from './Brand'
import type { ResolvedExam } from './resolveExam'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function AnswerKeyDocument({ resolved }: { resolved: ResolvedExam }) {
  const { exam, sections } = resolved
  let questionNumber = 0

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Watermark />
        <Text style={{ fontSize: 10, fontWeight: 700, color: BRAND_BLUE, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          PrepNest — Answer Key
        </Text>
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
        <PageFooter examTitle={`${exam.title} — Answers`} />
      </Page>
    </Document>
  )
}
