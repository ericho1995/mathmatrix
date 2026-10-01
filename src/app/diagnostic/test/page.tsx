import type { Metadata } from 'next'
import DiagnosticRunner from '@/components/diagnostic/DiagnosticRunner'

export const metadata: Metadata = {
  title: 'Diagnostic test — PrepNest',
  robots: { index: false, follow: false },
}

/** The test itself. Everything it needs is in this browser's storage, put there by /diagnostic. */
export default function DiagnosticTestPage() {
  return <DiagnosticRunner />
}
