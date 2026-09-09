import { StyleSheet } from '@react-pdf/renderer'

export const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', color: '#1a1a1a' },
  coverTitle: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  coverSubtitle: { fontSize: 12, color: '#555', marginBottom: 16 },
  coverInstructions: { fontSize: 10, color: '#333', lineHeight: 1.5, marginBottom: 4 },
  sectionHeader: { fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 4, borderBottom: '1pt solid #333', paddingBottom: 4 },
  sectionMeta: { fontSize: 9, color: '#666', marginBottom: 12 },
  stimulusBox: { backgroundColor: '#f5f5f5', padding: 10, marginBottom: 10, borderRadius: 2 },
  stimulusTitle: { fontSize: 9, textTransform: 'uppercase', color: '#888', marginBottom: 4 },
  stimulusBody: { fontSize: 10, lineHeight: 1.5 },
  questionRow: { marginBottom: 14 },
  questionText: { fontSize: 11, marginBottom: 6 },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3, marginLeft: 12 },
  optionBubble: { width: 10, height: 10, borderRadius: 5, border: '1pt solid #333', marginRight: 6 },
  optionText: { fontSize: 10 },
  answerLine: { borderBottom: '0.5pt solid #999', height: 18 },
  answerKeyRow: { marginBottom: 8, fontSize: 10 },
  answerKeyNum: { fontWeight: 700 },
  explanation: { fontSize: 9, color: '#555', marginTop: 2 },
})
