import { Font, StyleSheet } from '@react-pdf/renderer'

// Standard PDF fonts (Helvetica etc.) use WinAnsiEncoding, which only maps a
// handful of non-ASCII codepoints. Maths/science content uses characters
// (minus sign U+2212, root, pi, Greek letters, arrows, etc.) that would
// silently truncate to the wrong glyph with zero width under that encoding.
// DejaVu Sans has broad Unicode coverage, so register it and use it for all
// PDF text instead of the 'Helvetica' standard font.
Font.register({
  family: 'DejaVuSans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf', fontWeight: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf', fontWeight: 'bold' },
  ],
})

export const BRAND_BLUE = '#185FA5'
export const BRAND_BLUE_DARK = '#0C447C'
export const BRAND_TEAL = '#0F6E56'

export const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'DejaVuSans', color: '#1a1a1a' },
  coverTitle: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  coverSubtitle: { fontSize: 12, color: '#555', marginBottom: 16 },
  coverInstructions: { fontSize: 10, color: '#333', lineHeight: 1.5, marginBottom: 4 },

  // Branded front cover (ExamPaperDocument's first page)
  coverPage: { padding: 0, fontFamily: 'DejaVuSans', color: '#1a1a1a' },
  watermark: {
    position: 'absolute',
    top: '42%',
    left: -120,
    width: 840,
    textAlign: 'center',
    fontSize: 90,
    fontWeight: 700,
    color: BRAND_BLUE,
    opacity: 0.06,
    transform: 'rotate(-28deg)',
  },
  coverBand: { backgroundColor: BRAND_BLUE_DARK, paddingVertical: 28, paddingHorizontal: 40 },
  coverWordmark: { fontSize: 22, fontWeight: 700, color: '#ffffff', letterSpacing: 0.5 },
  coverWordmarkAccent: { color: '#85B7EB' },
  coverTagline: { fontSize: 9, color: '#B5D4F4', marginTop: 3, textTransform: 'uppercase', letterSpacing: 1 },
  coverBody: { paddingHorizontal: 40, paddingTop: 48 },
  coverEyebrow: { fontSize: 9, color: BRAND_BLUE, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontWeight: 700 },
  coverExamTitle: { fontSize: 26, fontWeight: 700, marginBottom: 6, lineHeight: 1.25 },
  coverMetaRow: { fontSize: 11, color: '#555', marginBottom: 28 },
  coverTimingBox: { borderLeft: `2pt solid ${BRAND_TEAL}`, paddingLeft: 12, marginBottom: 28 },
  coverTimingRow: { fontSize: 11, color: '#333', marginBottom: 3 },
  coverTimingTotal: { fontSize: 11, fontWeight: 700, color: '#1a1a1a', marginTop: 3 },
  coverDivider: { borderBottom: '1pt solid #e5e5e5', marginBottom: 20 },
  coverSectionsLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 10, fontWeight: 700 },
  coverSectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  coverSectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: BRAND_TEAL, marginRight: 8 },
  coverSectionText: { fontSize: 11, color: '#333' },
  coverInstructionsBox: { backgroundColor: '#f5f8fc', borderRadius: 4, padding: 14, marginTop: 24 },
  coverInstructionsTitle: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 6, fontWeight: 700 },

  footer: {
    position: 'absolute',
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#aaa',
    borderTop: '0.5pt solid #eee',
    paddingTop: 6,
  },

  // Plain NAPLAN-style running header, leading each section's content page(s):
  // subject + year level (+ calculator status, for split exams), all-caps.
  runningHeader: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#555', marginTop: 10, marginBottom: 2 },
  sectionHeader: { fontSize: 14, fontWeight: 700, marginTop: 4, marginBottom: 4, borderBottom: '1pt solid #333', paddingBottom: 4 },
  sectionMeta: { fontSize: 9, color: '#666', marginBottom: 12 },
  stimulusBox: { backgroundColor: '#f5f5f5', padding: 10, marginBottom: 10, borderRadius: 2 },
  stimulusTitle: { fontSize: 9, textTransform: 'uppercase', color: '#888', marginBottom: 4 },
  stimulusBody: { fontSize: 10, lineHeight: 1.5 },
  questionRow: { marginBottom: 14 },
  questionText: { fontSize: 11, marginBottom: 6 },
  // Horizontal multiple-choice option boxes (real NAPLAN convention) — a
  // wrapping row of bordered boxes instead of a stacked vertical list.
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginLeft: 12, marginTop: 2 },
  optionBox: { width: '48%', border: '0.75pt solid #333', borderRadius: 3, paddingVertical: 6, paddingHorizontal: 8, marginBottom: 8 },
  optionBoxText: { fontSize: 10, lineHeight: 1.3 },
  // Short-answer blank. flexGrow: 1 only matters inside shortAnswerRow (lets the
  // line fill the space left over by a currency/unit label); standalone usage
  // (long_form's stacked lines) is unaffected since those sit in a column
  // container that already stretches children to full width.
  answerLine: { borderBottom: '0.5pt solid #999', height: 18, flexGrow: 1 },
  shortAnswerRow: { flexDirection: 'row', alignItems: 'flex-end' },
  shortAnswerUnit: { fontSize: 11, color: '#1a1a1a', marginHorizontal: 4, marginBottom: 2 },
  answerKeyRow: { marginBottom: 8, fontSize: 10 },
  answerKeyNum: { fontWeight: 700 },
  explanation: { fontSize: 9, color: '#555', marginTop: 2 },
})
