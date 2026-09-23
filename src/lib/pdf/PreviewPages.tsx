import { Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer'
import { pdfStyles, BRAND_BLUE, BRAND_BLUE_DARK } from './theme'
import { Watermark, PageFooter } from './Brand'
import type { PreviewInfo } from './preview'

const SITE = 'https://prepnest.com.au'

const s = StyleSheet.create({
  coverBanner: { borderWidth: 1, borderColor: BRAND_BLUE, borderRadius: 6, backgroundColor: '#E6F1FB', padding: 12, marginTop: 4, marginBottom: 16 },
  coverBannerTitle: { fontSize: 10, fontWeight: 700, color: BRAND_BLUE, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  coverBannerText: { fontSize: 10, color: '#1F2937', lineHeight: 1.45 },
  eyebrow: { fontSize: 9, color: BRAND_BLUE, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 10 },
  lead: { fontSize: 11, color: '#374151', lineHeight: 1.5, marginBottom: 18 },
  table: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, marginBottom: 20 },
  row: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingVertical: 7, paddingHorizontal: 10 },
  headRow: { flexDirection: 'row', backgroundColor: '#F3F6FA', paddingVertical: 7, paddingHorizontal: 10 },
  headCell: { fontSize: 9, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: 0.8 },
  cellTitle: { flex: 1, fontSize: 10, color: '#111827' },
  cellNum: { width: 80, fontSize: 10, color: '#374151', textAlign: 'right' },
  listTitle: { fontSize: 11, fontWeight: 700, color: '#111827', marginBottom: 6 },
  bullet: { fontSize: 10.5, color: '#374151', lineHeight: 1.5, marginBottom: 3 },
  cta: { backgroundColor: BRAND_BLUE_DARK, borderRadius: 8, padding: 18, marginTop: 22 },
  ctaText: { fontSize: 11, color: '#DBEAFE', marginBottom: 6 },
  ctaLink: { fontSize: 13, color: '#FFFFFF', fontWeight: 700, textDecoration: 'none' },
})

/** The box on a preview's cover that says it is a preview, before anyone prints it. */
export function PreviewCoverBanner({ info }: { info: PreviewInfo }) {
  return (
    <View style={s.coverBanner}>
      <Text style={s.coverBannerTitle}>Free preview</Text>
      <Text style={s.coverBannerText}>
        This file has the first {info.shown} of the {info.total} questions in this paper. The last page lists what the rest
        of the paper contains and where to get it.
      </Text>
    </View>
  )
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/**
 * The last page of a preview paper or preview answer key: what the full paper
 * still holds, what comes with it, and the address to get it. It is the only
 * page of a preview that sells, so it says what is missing in concrete numbers
 * rather than in adjectives.
 */
export function PreviewEndPage({ info, examTitle, kind }: { info: PreviewInfo; examTitle: string; kind: 'paper' | 'answers' }) {
  const url = `${SITE}/practice/exams/${info.examId}`
  return (
    <Page size="A4" style={pdfStyles.page}>
      <Watermark />
      <Text style={s.eyebrow}>Free preview</Text>
      <Text style={s.title}>{kind === 'paper' ? 'That’s the end of the preview' : 'That’s the end of the preview answers'}</Text>
      <Text style={s.lead}>
        {kind === 'paper'
          ? `You’ve seen the first ${info.shown} of the ${info.total} questions in ${examTitle}. The full paper is worth ${plural(info.totalMarks, 'mark', 'marks')}.`
          : `These are the answers to the ${info.shown} preview questions. The full answer key covers all ${info.total} questions in ${examTitle}, with the working behind every mark.`}
      </Text>

      <View style={s.table}>
        <View style={s.headRow}>
          <Text style={[s.headCell, { flex: 1 }]}>Still to come</Text>
          <Text style={[s.headCell, { width: 80, textAlign: 'right' }]}>Questions</Text>
          <Text style={[s.headCell, { width: 80, textAlign: 'right' }]}>Marks</Text>
        </View>
        {info.rest.map((r, i) => (
          <View key={i} style={s.row}>
            <Text style={s.cellTitle}>{r.title}</Text>
            <Text style={s.cellNum}>{r.questions}</Text>
            <Text style={s.cellNum}>{r.marks}</Text>
          </View>
        ))}
      </View>

      <Text style={s.listTitle}>The full paper comes with</Text>
      <Text style={s.bullet}>•  Every question, printed exactly like the ones in this preview</Text>
      <Text style={s.bullet}>•  The complete answer key, with the working behind every mark</Text>
      <Text style={s.bullet}>•  A topic report after marking, showing what to practice next</Text>

      <View style={s.cta}>
        <Text style={s.ctaText}>Get the full paper at</Text>
        <Link src={url} style={s.ctaLink}>
          {url.replace('https://', '')}
        </Link>
      </View>
      <PageFooter examTitle={`${examTitle} · Free preview`} />
    </Page>
  )
}
