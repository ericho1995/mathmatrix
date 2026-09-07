'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RedeemParentCode() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: rpcError } = await supabase.rpc('redeem_parent_invite', {
      invite_code: code.trim().toUpperCase(),
    })

    setLoading(false)

    if (rpcError || !data) {
      setError('That code didn’t work — check it and try again.')
      return
    }

    setSuccess(true)
    router.refresh()
  }

  if (success) {
    return <p className="text-sm text-teal-600">Linked! Your parent can now see your progress.</p>
  }

  return (
    <div>
      <form onSubmit={handleRedeem} className="flex gap-2">
        <input
          className="input"
          placeholder="Parent invite code"
          value={code}
          onChange={e => setCode(e.target.value)}
          maxLength={12}
          required
        />
        <button type="submit" disabled={loading} className="btn-secondary text-sm whitespace-nowrap">
          {loading ? 'Linking...' : 'Link'}
        </button>
      </form>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
