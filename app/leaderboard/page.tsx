'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'




type Row = { id: string; full_name: string | null; karma: number; department: string | null }
type Branch = { department: string; members: number; total: number; avg_karma: number }
type Tab = 'week' | 'all' | 'branch'

const BADGES = [
  { min: 250, label: '🏆 Campus Legend' },
  { min: 100, label: '⭐ Campus Star' },
  { min: 30, label: '🚀 Rising Member' },
  { min: 0, label: '🌱 Newcomer' },
]
const badgeFor = (k: number) => BADGES.find((b) => k >= b.min)!
const nextBadge = (k: number) => [...BADGES].reverse().find((b) => b.min > k)

export default function LeaderboardPage() {
    const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    setSupabase(createClient())
  }, [])
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('week')
  const [week, setWeek] = useState<Row[]>([])
  const [all, setAll] = useState<Row[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
        if (!supabase) return
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push('/login')
        return
      }
      setUserId(data.user.id)
      const [w, a, b] = await Promise.all([
        supabase.from('leaderboard_week').select('id, full_name, karma, department').order('karma', { ascending: false }).limit(100),
        supabase.from('leaderboard').select('id, full_name, karma, department').order('karma', { ascending: false }).limit(100),
        supabase.from('branch_challenge').select('department, members, total, avg_karma').order('avg_karma', { ascending: false }),
      ])
      const fix = (rows: Row[]) => rows.map((r) => ({ ...r, karma: Number(r.karma) }))
      setWeek(fix((w.data ?? []) as Row[]))
      setAll(fix((a.data ?? []) as Row[]))
      setBranches(((b.data ?? []) as Branch[]).map((x) => ({ ...x, avg_karma: Number(x.avg_karma) })))
      setLoading(false)
    }
    init()
  }, [router, supabase])

  if (loading) return <main className="min-h-screen p-8 text-gray-400">Loading...</main>

  const rows = tab === 'week' ? week : all
  const myIndex = rows.findIndex((r) => r.id === userId)
  const mine = myIndex >= 0 ? rows[myIndex] : null
  const nb = mine ? nextBadge(all.find((r) => r.id === userId)?.karma ?? 0) : undefined
  const myAll = all.find((r) => r.id === userId)?.karma ?? 0

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 px-4 py-3">
        <h1 className="text-xl font-bold">🏅 Leaderboard</h1>
        <p className="text-xs">Resets every week, so everyone has a chance to win.</p>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        <div className="rounded-2xl bg-gray-900 p-4">
          <p className="text-sm text-gray-400">Your badge</p>
          <p className="text-xl font-bold">{badgeFor(myAll).label}</p>
          <p className="text-xs text-gray-400">{myAll} points in total</p>
          {nextBadge(myAll) ? (
            <>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-800">
                <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, (myAll / nextBadge(myAll)!.min) * 100)}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {nextBadge(myAll)!.min - myAll} more points to {nextBadge(myAll)!.label}
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs text-green-400">You reached the top badge.</p>
          )}
        </div>

        <div className="flex gap-2">
          {([['week', 'This week'], ['all', 'All time'], ['branch', 'Branch vs Branch']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex-1 rounded-full px-3 py-1.5 text-sm font-semibold ${tab === id ? 'bg-indigo-600 text-[#fff]' : 'bg-gray-900 text-gray-300'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab !== 'branch' && (
          <div className="rounded-2xl bg-gray-900 p-2">
            {rows.slice(0, 10).map((r, i) => (
              <div key={r.id} className={`flex items-center justify-between rounded-xl p-3 ${r.id === userId ? 'bg-indigo-900' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                  <div>
                    <p className="text-sm font-semibold">
                      {r.full_name ?? 'Student'} {r.id === userId && '(You)'}
                    </p>
                    <p className="text-xs text-gray-400">{r.department}</p>
                  </div>
                </div>
                <span className="rounded-full bg-gray-800 px-3 py-1 text-sm font-bold">{r.karma}</span>
              </div>
            ))}
            {mine && myIndex >= 10 && (
              <p className="p-3 text-center text-sm text-gray-400">
                You are #{myIndex + 1} with {mine.karma} points. Keep going!
              </p>
            )}
            {rows.length === 0 && <p className="p-4 text-center text-sm text-gray-500">No points yet. Post, comment or attend an event to start.</p>}
          </div>
        )}

        {tab === 'branch' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Average points per student this week, so small branches compete fairly with big ones.</p>
            {branches.map((b, i) => (
              <div key={b.department} className="flex items-center justify-between rounded-2xl bg-gray-900 p-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold">{i === 0 ? '🏆' : `${i + 1}.`}</span>
                  <div>
                    <p className="font-semibold">{b.department}</p>
                    <p className="text-xs text-gray-400">
                      {b.members} students · {b.total} total points
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-gray-800 px-3 py-1 text-sm font-bold">{b.avg_karma}</span>
              </div>
            ))}
            {branches.length === 0 && <p className="p-4 text-center text-sm text-gray-500">No data yet.</p>}
          </div>
        )}
        {!nb && null}
      </div>
    </main>
  )
}