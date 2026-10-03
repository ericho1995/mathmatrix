'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import { Sparkles } from 'lucide-react'

/**
 * Asks the server for the next weak-areas paper, then reloads the report with
 * the new paper in view. The server decides everything — the allowance, the
 * questions — so this only shows what it says.
 */
export default function GeneratePaperButton({ resultId, label, disabled }: { resultId: string; label: string; disabled?: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/diagnostic/${resultId}/papers`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? `Something went wrong (${res.status}).`)
      router.push(`/diagnostic/report/${resultId}?paper=${data.paperId}#paper-${data.paperId}` as Route)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <button type="button" className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" onClick={generate} disabled={disabled || busy}>
        <Sparkles className="w-4 h-4" aria-hidden />
        {busy ? 'Building the paper…' : label}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600 mt-3 max-w-prose">
          {error}
        </p>
      )}
    </div>
  )
}
