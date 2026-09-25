import { Document, Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles, BRAND_BLUE } from './theme'
import { Watermark, PageFooter } from './Brand'
import { firstQuestionNumbers } from './resolveExam'
import type { ResolvedExam } from './resolveExam'
import { PreviewEndPage } from './PreviewPages'
import type { PreviewInfo } from './preview'
import { RichText } from './math/MathText'
import { hasMath } from '@/lib/text/mathPlain'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function AnswerKeyDocument({ resolved, preview }: { resolved: ResolvedExam; preview?: PreviewInfo }) {
  const { exam, sections } = resolved
  const sectionStart = firstQuestionNumbers(sections)

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Watermark />
        <Text style={{ fontSize: 10, fontWeight: 700, color: BRAND_BLUE, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          {preview ? 'PrepNest — Answer Key (free preview)' : 'PrepNest — Answer Key'}
        </Text>
        <Text style={pdfStyles.coverTitle}>{exam.title} — Answers &amp; Explanations</Text>
        <Text style={pdfStyles.coverSubtitle}>
          {preview
            ? `Answers to the ${preview.shown} questions in the free preview.`
            : 'For a parent, tutor, or the student to mark the exam paper against.'}
        </Text>
        {sections.map((s, si) => s.questions.length === 0 ? null : (
          <View key={si}>
            <Text style={pdfStyles.sectionHeader}>{s.section.title}</Text>
            {s.questions.map((q, qi) => {
              const questionNumber = sectionStart[si] + qi + 1

              // A VCE extended response is marked per part, so the key has to
              // show where each mark is earned rather than a single answer.
              if (q.format === 'extended_response') {
                const total = q.parts.reduce((sum, p) => sum + p.marks, 0)
                const renderPart = (part: (typeof q.parts)[number], pi: number) =>
                      hasMath(part.expected_answer) || hasMath(part.explanation) ? (
                        // Typeset answers get a hanging label so a displayed
                        // formula lines up under the answer, not the letter.
                        <View key={pi} style={{ marginTop: 6, flexDirection: 'row' }} wrap={false}>
                          <Text style={[pdfStyles.answerKeyNum, { width: 24 }]}>{part.label ? `${part.label}.` : ''}</Text>
                          <View style={{ flex: 1 }}>
                            <RichText text={part.expected_answer} style={{ fontSize: 10 }} />
                            <Text style={{ fontSize: 8, color: '#777', marginTop: 1, marginBottom: 1 }}>[{part.marks} {part.marks === 1 ? 'mark' : 'marks'}]</Text>
                            <RichText text={part.explanation} style={pdfStyles.explanation} />
                          </View>
                        </View>
                      ) : (
                        <View key={pi} style={{ marginTop: 4 }}>
                          <Text>
                            <Text style={pdfStyles.answerKeyNum}>{part.label}. </Text>
                            {`${part.expected_answer}  [${part.marks} ${part.marks === 1 ? 'mark' : 'marks'}]`}
                          </Text>
                          <Text style={pdfStyles.explanation}>{part.explanation}</Text>
                        </View>
                      )
                return (
                  <View key={q.id} style={pdfStyles.answerKeyRow}>
                    {/* The heading travels with the first part, so it is never
                        left alone at the foot of a page. */}
                    <View wrap={false}>
                      <Text>
                        <Text style={pdfStyles.answerKeyNum}>{questionNumber}. </Text>
                        {`(${total} ${total === 1 ? 'mark' : 'marks'} in total)`}
                      </Text>
                      {q.parts.slice(0, 1).map(renderPart)}
                    </View>
                    {q.parts.slice(1).map((part, pi) => renderPart(part, pi + 1))}
                  </View>
                )
              }

              if (q.format === 'long_form' || q.format === 'short_answer') {
                const answerLabel = q.format === 'long_form'
                  ? 'See explanation below — this question is not auto-marked.'
                  : `Answer: ${q.expected_answer}`
                return (
                  <View key={q.id} style={pdfStyles.answerKeyRow} wrap={false}>
                    <Text><Text style={pdfStyles.answerKeyNum}>{questionNumber}. </Text>{answerLabel}</Text>
                    <RichText text={q.explanation} style={pdfStyles.explanation} />
                  </View>
                )
              }

              const letter = OPTION_LETTERS[q.correct_index ?? 0]
              const raw = (q.options ?? [])[q.correct_index ?? 0] ?? ''
              // A table option prints as "header: cell; header: cell".
              const headers = q.option_headers
              const option = headers?.length ? raw.split(' | ').map((c, ci) => `${headers[ci] ?? ''}: ${c}`).join('; ') : raw
              return (
                <View key={q.id} style={pdfStyles.answerKeyRow} wrap={false}>
                  {hasMath(option) ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={pdfStyles.answerKeyNum}>{questionNumber}. </Text>
                      <Text style={{ fontSize: 10 }}>{letter}.  </Text>
                      <RichText text={option} style={{ fontSize: 10, flex: 1 }} />
                    </View>
                  ) : (
                    <Text><Text style={pdfStyles.answerKeyNum}>{questionNumber}. </Text>{letter}. {option}</Text>
                  )}
                  <RichText text={q.explanation} style={pdfStyles.explanation} />
                </View>
              )
            })}
          </View>
        ))}
        <PageFooter examTitle={preview ? `${exam.title} — Answers · Free preview` : `${exam.title} — Answers`} />
      </Page>
      {preview ? <PreviewEndPage info={preview} examTitle={exam.title} kind="answers" /> : null}
    </Document>
  )
}
