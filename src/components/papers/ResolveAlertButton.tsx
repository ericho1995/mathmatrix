'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/** Marks a question-bank alert handled once new questions are in the bank. */
export default function ResolveAlertButton({ id }: { id: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function resolve() {
    setBusy(true)
    setError(null)
    const res = await fetch(`/api/admin/bank-alerts/${id}/resolve`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setError(data.error ?? 'Could not update')
    router.refresh()
  }
  return (
    <span className="inline-flex flex-col items-end">
      <button type="button" className="btn-secondary py-1.5 px-3 text-xs" onClick={resolve} disabled={busy}>
        {busy ? 'Saving…' : 'Mark as added'}
      </button>
      {error && <span className="text-xs text-red-600 mt-1">{error}</span>}
    </span>
  )
}
