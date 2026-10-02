import type { Metadata } from 'next'
import DiagnosticResults from '@/components/diagnostic/DiagnosticResults'

export const metadata: Metadata = {
  title: 'Diagnostic results — PrepNest',
  robots: { index: false, follow: false },
}

/** A result straight after the test, from this browser's storage. */
export default function DiagnosticResultsPage() {
  return <DiagnosticResults />
}
