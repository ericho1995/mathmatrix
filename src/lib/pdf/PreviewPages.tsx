import { Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer'
import { pdfStyles, BRAND_BLUE, BRAND_BLUE_DARK } from './theme'
import { Watermark, PageFooter } from './Brand'
import type { LockedQuestion, PreviewInfo } from './preview'

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
  lockBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: BRAND_BLUE_DARK, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 16 },
  lockTitle: { fontSize: 10, fontWeight: 700, color: '#FFFFFF', letterSpacing: 1.2, textTransform: 'uppercase' },
  lockText: { fontSize: 9.5, color: '#DBEAFE' },
  lockedQ: { flexDirection: 'row', marginBottom: 20 },
  lockedNum: { width: 26, fontSize: 11, fontWeight: 700, color: '#9CA3AF' },
  lockedBody: { flex: 1 },
  bar: { height: 8, borderRadius: 4, backgroundColor: '#E5E7EB', marginBottom: 7 },
  box: { height: 70, borderRadius: 6, backgroundColor: '#F1F3F6', marginTop: 2, marginBottom: 10 },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  optionDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB', marginRight: 8 },
  answerBox: { width: 140, height: 22, borderRadius: 4, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 4 },
  line: { height: 1, backgroundColor: '#E5E7EB', marginTop: 16 },
})

/** The box on a preview's cover that says it is a preview, before anyone prints it. */
export function PreviewCoverBanner({ info }: { info: PreviewInfo }) {
  return (
    <View style={s.coverBanner}>
      <Text style={s.coverBannerTitle}>Preview</Text>
      <Text style={s.coverBannerText}>
        This file has the first {info.shown} of the {info.total} questions in this paper. The rest is locked: it comes
        with a PrepNest plan, or with the paper itself for VCE.
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
  const url = info.url ?? `${SITE}/practice/exams/${info.examId}`
  return (
    <Page size="A4" style={pdfStyles.page}>
      <Watermark />
      <Text style={s.eyebrow}>Preview</Text>
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
      <PageFooter examTitle={`${examTitle} · Preview`} />
    </Page>
  )
}

/** Bar widths for a locked question's outline, the same every time for the same number. */
const widths = (n: number, count: number) => Array.from({ length: count }, (_, i) => [100, 94, 86, 97, 72, 90][(n * 7 + i * 3) % 6])

function LockedBlock({ q }: { q: LockedQuestion }) {
  return (
    <View style={s.lockedQ} wrap={false}>
      <Text style={s.lockedNum}>{q.n}.</Text>
      <View style={s.lockedBody}>
        {widths(q.n, q.kind === 'written' ? 3 : 2).map((w, i) => (
          <View key={i} style={[s.bar, { width: `${w}%` }]} />
        ))}
        {q.diagram ? <View style={s.box} /> : null}
        {q.kind === 'choice'
          ? Array.from({ length: q.size }, (_, i) => (
              <View key={i} style={s.optionRow}>
                <View style={s.optionDot} />
                <View style={[s.bar, { width: `${widths(q.n + i, 1)[0] / 2}%`, marginBottom: 0 }]} />
              </View>
            ))
          : q.kind === 'text'
            ? <View style={s.answerBox} />
            : Array.from({ length: q.size }, (_, i) => <View key={i} style={s.line} />)}
      </View>
    </View>
  )
}

/**
 * The locked half of a preview: every remaining question as an outline (its
 * number, grey bars where its words would be, its options or answer lines),
 * under a banner on every page saying how to unlock it. None of the paper's
 * words are in it. The on-site viewer blurs these pages and lays the way to
 * unlock them over the top; it finds them by the banner's "Locked" heading.
 */
export function LockedPages({ info, examTitle }: { info: PreviewInfo; examTitle: string }) {
  if (!info.locked.length) return null
  const first = info.locked[0].n
  const last = info.locked[info.locked.length - 1].n
  return (
    <Page size="A4" style={pdfStyles.page} wrap>
      <Watermark />
      <View style={s.lockBanner} fixed>
        <Text style={s.lockTitle}>Locked</Text>
        <Text style={s.lockText}>
          {first === last ? `Question ${first}` : `The rest of the paper`} comes with a PrepNest plan · prepnest.com.au/pricing
        </Text>
      </View>
      {info.locked.map(q => (
        <LockedBlock key={`${q.n}-${q.kind}-${q.size}`} q={q} />
      ))}
      <Text style={s.lead}>{`${plural(info.locked.length, 'question', 'questions')} locked, up to question ${last}.`}</Text>
      <PageFooter examTitle={`${examTitle} · Preview`} />
    </Page>
  )
}
