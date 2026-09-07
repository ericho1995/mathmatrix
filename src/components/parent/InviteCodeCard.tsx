'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function InviteCodeCard({ parentId }: { parentId: string }) {
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const newCode = generateCode()

    const { error: insertError } = await supabase
      .from('parent_invites')
      .insert({ code: newCode, parent_id: parentId })

    setLoading(false)

    if (insertError) {
      setError('Could not generate a code — try again.')
      return
    }
    setCode(newCode)
  }

  return (
    <div className="card text-center py-10">
      <p className="text-gray-500 text-sm mb-5 max-w-xs mx-auto">
        No students linked yet. Generate a one-time invite code and share it
        with your child — they can enter it on their homepage to link their
        progress to your dashboard.
      </p>

      {code ? (
        <div>
          <p className="text-3xl font-medium tracking-[0.3em] text-brand-600 mb-2">{code}</p>
          <p className="text-xs text-gray-400 mb-5">Expires in 7 days</p>
          <button onClick={generate} disabled={loading} className="btn-secondary text-sm">
            Generate a new code
          </button>
        </div>
      ) : (
        <button onClick={generate} disabled={loading} className="btn-primary">
          {loading ? 'Generating...' : 'Generate invite code'}
        </button>
      )}
      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
    </div>
  )
}
