'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, Trash2 } from 'lucide-react'

/** Print the report, or delete the result (the owner only; RLS enforces it). */
export default function ReportActions({ resultId, canDelete }: { resultId: string; canDelete: boolean }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function remove() {
    setBusy(true)
    setError(null)
    const res = await fetch(`/api/diagnostic/${resultId}`, { method: 'DELETE' }).catch(() => null)
    if (!res?.ok) {
      setBusy(false)
      setError('The result could not be deleted. Please try again.')
      return
    }
    router.push('/parent')
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button type="button" className="btn-secondary text-sm py-2 inline-flex items-center gap-1.5" onClick={() => window.print()}>
        <Printer className="w-4 h-4" aria-hidden />
        Print
      </button>
      {canDelete &&
        (confirming ? (
          <span className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Delete this result for good?</span>
            <button type="button" className="text-red-600 font-medium" onClick={remove} disabled={busy}>
              {busy ? 'Deleting…' : 'Delete'}
            </button>
            <button type="button" className="text-gray-500" onClick={() => setConfirming(false)}>
              Keep it
            </button>
          </span>
        ) : (
          <button type="button" className="text-sm text-gray-400 hover:text-red-600 inline-flex items-center gap-1.5 px-2 py-2" onClick={() => setConfirming(true)}>
            <Trash2 className="w-4 h-4" aria-hidden />
            Delete
          </button>
        ))}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
