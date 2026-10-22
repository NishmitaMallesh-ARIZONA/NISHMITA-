'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

const SPOTS = [
  { name: 'Library', icon: '📚' },
  { name: 'Canteen', icon: '🍜' },
  { name: 'Computer Lab', icon: '💻' },
  { name: 'Sports Ground', icon: '⚽' },
  { name: 'Auditorium', icon: '🎤' },
]
const LEVELS = ['Quiet', 'Moderate', 'Packed']
const COLORS = ['bg-green-500', 'bg-yellow-500', 'bg-red-500']

type Report = { spot: string; level: number }

export default function PulsePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [note, setNote] = useState('')

  const load = useCallback(async () => {
    const since = new Date(Date.now() - 45 * 60 * 1000).toISOString()
    const { data } = await supabase.from('pulse_reports').select('spot, level').gte('created_at', since)
    setReports((data ?? []) as Report[])
  }, [])

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUserId(data.user.id)
      await load()
    }
    init()
    const t = setInterval(load, 20000)
    return () => clearInterval(t)
  }, [router, load])

  async function report(spot: string, level: number) {
    if (!userId) return
    const { error } = await supabase.from('pulse_reports').insert({ spot, level, user_id: userId })
    setNote(error ? error.message : `Thanks! ${spot} reported as ${LEVELS[level - 1]} ✓`)
    await load()
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 border-b border-gray-800 bg-gray-900 px-4 py-3">
        <h1 className="text-xl font-bold">📡 Campus Pulse</h1>
        <p className="text-xs text-gray-400">Live crowd levels from students, last 45 minutes</p>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        {note && <p className="text-sm text-green-400">{note}</p>}
        {SPOTS.map((s) => {
          const mine = reports.filter((r) => r.spot === s.name)
          const avg = mine.length ? mine.reduce((a, r) => a + r.level, 0) / mine.length : 0
          const idx = avg ? Math.min(2, Math.max(0, Math.round(avg) - 1)) : -1
          return (
            <div key={s.name} className="rounded-2xl bg-gray-900 p-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">
                  {s.icon} {s.name}
                </p>
                <p className="text-sm text-gray-300">
                  {idx >= 0 ? `${LEVELS[idx]} · ${mine.length} report${mine.length > 1 ? 's' : ''}` : 'No reports yet'}
                </p>
              </div>
              <div className="mt-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`h-2 flex-1 rounded-full ${idx >= i ? COLORS[idx] : 'bg-gray-800'}`} />
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                {LEVELS.map((l, i) => (
                  <button key={l} onClick={() => report(s.name, i + 1)} className="flex-1 rounded-lg bg-gray-800 p-2 text-xs">
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}