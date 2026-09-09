'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { TOPICS } from '@/lib/curriculum'
import RedeemParentCode from '@/components/home/RedeemParentCode'

export interface SessionSummary {
  id: string
  topic: string
  completed_at: string | null
  correct_count: number
  total_questions: number
}

type Tab = 'overview' | 'topics' | 'history'

export default function StudentDashboardTabs({
  firstName,
  gradeLabel,
  xpTotal,
  streakDays,
  hasParent,
  sessions,
}: {
  firstName: string
  gradeLabel?: string
  xpTotal: number
  streakDays: number
  hasParent: boolean
  sessions: SessionSummary[]
}) {
  const [tab, setTab] = useState<Tab>('overview')

  const topicStats = useMemo(() => {
    const byTopic = new Map<string, { correct: number; total: number }>()
    for (const s of sessions) {
      const entry = byTopic.get(s.topic) ?? { correct: 0, total: 0 }
      entry.correct += s.correct_count
      entry.total += s.total_questions
      byTopic.set(s.topic, entry)
    }
    return Array.from(byTopic.entries())
      .map(([topic, { correct, total }]) => ({
        topic,
        label: TOPICS.find(t => t.slug === topic)?.label ?? topic,
        pct: total > 0 ? Math.round((correct / total) * 100) : 0,
        total,
      }))
      .sort((a, b) => b.total - a.total)
  }, [sessions])

  return (
    <div className="max-w-sm w-full mx-auto">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Welcome back, {firstName}</h1>
      <p className="text-gray-500 mb-6">{gradeLabel ?? 'Ready to practise?'}</p>

      <div className="inline-flex rounded-xl border border-gray-100 p-1 mb-6">
        {(['overview', 'topics', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-brand-600 text-white' : 'text-gray-500'}`}
          >
            {t === 'overview' ? 'Overview' : t === 'topics' ? 'By topic' : 'History'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="card text-center py-4">
              <p className="text-2xl font-medium text-brand-600">{xpTotal}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total XP</p>
            </div>
            <div className="card text-center py-4">
              <p className="text-2xl font-medium text-amber-400">{streakDays}</p>
              <p className="text-xs text-gray-400 mt-0.5">Day streak</p>
            </div>
          </div>

          <Link href="/practice" className="btn-primary w-full text-center block mb-6">
            Continue practising
          </Link>

          {!hasParent && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
                Got a code from your parent?
              </p>
              <RedeemParentCode />
            </div>
          )}
        </div>
      )}

      {tab === 'topics' && (
        <div className="card">
          {topicStats.length === 0 ? (
            <p className="text-sm text-gray-500">
              Complete a practice session to see your accuracy by topic.
            </p>
          ) : (
            topicStats.map(t => (
              <div key={t.topic} className="flex items-center gap-3 mb-3 last:mb-0">
                <span className="text-xs min-w-[120px] text-gray-600 truncate">{t.label}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-brand-400" style={{ width: `${t.pct}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-400 w-8 text-right">{t.pct}%</span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="flex flex-col gap-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-500">No practice sessions yet.</p>
          ) : (
            sessions.slice(0, 10).map(s => (
              <div key={s.id} className="card flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{TOPICS.find(t => t.slug === s.topic)?.label ?? s.topic}</p>
                  <p className="text-xs text-gray-400">
                    {s.completed_at ? new Date(s.completed_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '—'}
                  </p>
                </div>
                <p className="text-sm font-medium text-brand-600">
                  {s.correct_count}/{s.total_questions}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
