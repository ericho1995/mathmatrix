'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RequestStatus } from '@/lib/paperRequests'

/** Moves a family's paper request along: start it, then mark it done. */
export default function RequestStatusButtons({ id, status }: { id: string; status: RequestStatus }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function set(next: RequestStatus) {
    setBusy(true)
    setError(null)
    const res = await fetch(`/api/admin/paper-requests/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setError(data.error ?? 'Could not update')
    router.refresh()
  }
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span className="inline-flex gap-2">
        {status === 'new' && (
          <button type="button" className="btn-secondary py-1.5 px-3 text-xs" onClick={() => set('in_progress')} disabled={busy}>
            Start
          </button>
        )}
        {status !== 'done' && (
          <button type="button" className="btn-primary py-1.5 px-3 text-xs" onClick={() => set('done')} disabled={busy}>
            {busy ? 'Saving…' : 'Mark done'}
          </button>
        )}
        {status === 'done' && (
          <button type="button" className="btn-secondary py-1.5 px-3 text-xs" onClick={() => set('in_progress')} disabled={busy}>
            Reopen
          </button>
        )}
      </span>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  )
}
