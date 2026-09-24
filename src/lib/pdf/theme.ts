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
    // Italic faces, for the reading magazine: bylines, sign-offs, quotations.
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Oblique.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-BoldOblique.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

// Monospaced face for pseudocode listings (VCAA prints algorithms this way).
Font.register({
  family: 'DejaVuSansMono',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSansMono.ttf', fontWeight: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSansMono-Bold.ttf', fontWeight: 'bold' },
  ],
})

// react-pdf hyphenates long words by default ("play-ing cards"). Test papers
// never break words, so wrap only between them.
Font.registerHyphenationCallback(word => [word])

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
  // The instructions box at the head of a VCE section.
  sectionInstructions: { borderLeft: `2pt solid ${BRAND_BLUE}`, paddingLeft: 10, paddingVertical: 4, marginBottom: 16 },
  sectionInstructionsTitle: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#555', marginBottom: 4 },
  sectionInstructionsText: { fontSize: 9.5, color: '#333', lineHeight: 1.35 },
  // Final-answer box with its unit (VCAA Physics calculations).
  answerBoxRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 6, marginBottom: 2 },
  finalAnswerBox: { width: 130, height: 22, border: '0.9pt solid #333' },
  finalAnswerUnit: { fontSize: 10.5, marginLeft: 6, minWidth: 40 },
  // Formula sheet: a boxed grid, as VCAA prints it.
  formulaTitle: { fontSize: 14, fontWeight: 700, textAlign: 'center', marginBottom: 10 },
  formulaSectionTitle: { fontSize: 10.5, fontWeight: 700, backgroundColor: '#eef2f7', paddingVertical: 3, paddingHorizontal: 6, border: '0.75pt solid #333', borderBottom: 'none' },
  formulaTable: { border: '0.75pt solid #333', marginBottom: 12 },
  formulaRow: { flexDirection: 'row', borderTop: '0.5pt solid #999', minHeight: 20 },
  formulaLabel: { width: 104, fontSize: 8.5, color: '#333', paddingVertical: 4, paddingHorizontal: 5, borderRight: '0.5pt solid #999' },
  formulaCell: { flex: 1, paddingVertical: 4, paddingHorizontal: 6, justifyContent: 'center' },
  // Reading papers open each part with "Read <title> on page 3 of the
  // magazine and answer questions 7 to 12", as the real booklet does.
  readingInstruction: { fontSize: 12, marginTop: 6, marginBottom: 14, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#eef6f3', borderLeft: `3pt solid ${BRAND_TEAL}`, lineHeight: 1.4 },
  readingInstructionTitle: { fontWeight: 700, fontStyle: 'italic' },
  coverNeedBox: { borderLeft: `2pt solid ${BRAND_TEAL}`, paddingLeft: 12, marginTop: 8, marginBottom: 20 },
  coverNeedTitle: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: BRAND_TEAL, fontWeight: 700, marginBottom: 3 },
  coverNeedText: { fontSize: 11, color: '#333', lineHeight: 1.45 },
  stimulusBox: { backgroundColor: '#f5f5f5', padding: 10, marginBottom: 10, borderRadius: 2 },
  stimulusTitle: { fontSize: 9, textTransform: 'uppercase', color: '#888', marginBottom: 4 },
  stimulusBody: { fontSize: 10, lineHeight: 1.5 },
  questionRow: { marginBottom: 14 },
  questionText: { fontSize: 11, marginBottom: 6 },
  // Per-question graphic (e.g. bar chart) — Phase 2 of the visual-format design.
  diagramBox: { marginLeft: 12, marginBottom: 8, alignItems: 'center' },
  diagramTitle: { fontSize: 9, color: '#666', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Title above a function graph. Not uppercased like diagramTitle, because
  // these are maths expressions — "y = f(x)" must not become "Y = F(X)".
  graphTitle: { fontSize: 9, color: '#444', marginBottom: 4 },
  // Data tables (General Mathematics leans on these in every area of study).
  // Laid out with Views, not SVG, so long cell text wraps.
  tableBox: { marginLeft: 12, marginBottom: 8, alignItems: 'flex-start' },
  tableGrid: { borderTop: '0.75pt solid #333', borderLeft: '0.75pt solid #333', minWidth: 240, maxWidth: 460 },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#f0f2f5' },
  tableRow: { flexDirection: 'row' },
  tableCell: { fontSize: 8, paddingVertical: 3, paddingHorizontal: 4, borderRight: '0.75pt solid #333', borderBottom: '0.75pt solid #333', textAlign: 'center' },
  tableHeaderCell: { fontWeight: 700 },
  diagramLabelsRow: { flexDirection: 'row', width: 420, marginTop: 2, flexWrap: 'wrap' },
  diagramLabel: { fontSize: 8, color: '#333', textAlign: 'center' },
  // Caption under a diagram (marked points, axis label) — not uppercased like
  // diagramTitle, since these often contain units/values that read oddly in caps.
  diagramCaption: { fontSize: 8, color: '#666', marginTop: 3 },
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
  // Bordered answer box for short_answer questions (real NAPLAN convention —
  // a clearly boxed area, not just an underline) — sized to fit a short
  // number/word/phrase, not a full-width blank.
  answerBox: { border: '0.75pt solid #333', borderRadius: 2, height: 26, width: 110, marginTop: 2 },
  shortAnswerRow: { flexDirection: 'row', alignItems: 'center' },
  // VCE extended response: a shared stem, then lettered parts each carrying
  // their own marks, printed right-aligned the way VCAA papers do it.
  questionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 },
  questionMarks: { fontSize: 10, color: '#444' },
  partRow: { flexDirection: 'row', marginTop: 8, marginBottom: 2 },
  // minWidth, not width: VCE sub-part labels such as "e.iii" are wider than a
  // single letter and would otherwise wrap onto a second line.
  partLabel: { fontSize: 11, minWidth: 22, paddingRight: 4 },
  partPrompt: { fontSize: 11, flex: 1, paddingRight: 8 },
  partMarks: { fontSize: 10, color: '#444', width: 52, textAlign: 'right' },
  partWorkingLine: { borderBottom: '0.5pt solid #bbb', height: 16, marginLeft: 22 },
  shortAnswerUnit: { fontSize: 11, color: '#1a1a1a', marginHorizontal: 4, marginBottom: 2 },
  answerKeyRow: { marginBottom: 8, fontSize: 10 },
  answerKeyNum: { fontWeight: 700 },
  explanation: { fontSize: 9, color: '#555', marginTop: 2 },
})
