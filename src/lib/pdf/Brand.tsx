import { Text, View } from '@react-pdf/renderer'
import { pdfStyles } from './theme'

/** Faint diagonal brand mark repeated behind page content. */
export function Watermark() {
  return <Text style={pdfStyles.watermark} fixed>PrepNest</Text>
}

/** Small recurring footer with page numbers, fixed across every page of a document. */
export function PageFooter({ examTitle }: { examTitle: string }) {
  return (
    <View style={pdfStyles.footer} fixed>
      <Text>PrepNest &middot; {examTitle}</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  )
}
