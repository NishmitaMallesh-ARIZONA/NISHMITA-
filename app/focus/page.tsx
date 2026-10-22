'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

type Peer = { name: string; focusing: boolean }

export default function FocusPage() {
  const router = useRouter()
  const chRef = useRef<RealtimeChannel | null>(null)
  const nameRef = useRef('Student')
  const [length, setLength] = useState(25)
  const [left, setLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [peers, setPeers] = useState<Peer[]>([])
  const [done, setDone] = useState(0)

  useEffect(() => {
    let active = true
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).single()
      nameRef.current = p?.full_name ?? 'Student'
      if (!active) return
      const ch = supabase.channel('focus-room', { config: { presence: { key: data.user.id } } })
      ch.on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState() as unknown as Record<string, Peer[]>
        setPeers(Object.values(state).flat())
      })
      ch.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await ch.track({ name: nameRef.current, focusing: false })
      })
      chRef.current = ch
    }
    init()
    return () => {
      active = false
      if (chRef.current) supabase.removeChannel(chRef.current)
    }
  }, [router])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setLeft((l) => (l <= 1 ? 0 : l - 1)), 1000)
    return () => clearInterval(t)
  }, [running])

  useEffect(() => {
    if (running && left === 0) {
      setRunning(false)
      setDone((d) => d + 1)
      chRef.current?.track({ name: nameRef.current, focusing: false })
    }
  }, [left, running])

  function start() {
    if (left === 0) setLeft(length * 60)
    setRunning(true)
    chRef.current?.track({ name: nameRef.current, focusing: true })
  }

  function pause() {
    setRunning(false)
    chRef.current?.track({ name: nameRef.current, focusing: false })
  }

  function preset(mins: number) {
    pause()
    setLength(mins)
    setLeft(mins * 60)
  }

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  const progress = 1 - left / (length * 60)
  const R = 90
  const C = 2 * Math.PI * R
  const focusing = peers.filter((p) => p.focusing)

  return (
    <main className="min-h-screen bg-gray-950">
      <header className="sticky top-0 px-4 py-3">
        <h1 className="text-xl font-bold">⏱️ Focus Room</h1>
        <p className="text-xs">Study together, live</p>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4 text-center">
        <div className="rounded-2xl bg-gray-900 p-6">
          <div className="relative mx-auto h-56 w-56">
            <svg viewBox="0 0 200 200" className="h-56 w-56 -rotate-90">
              <circle cx="100" cy="100" r={R} fill="none" stroke="#e0e7ff" strokeWidth="12" />
              <circle
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold">
              {mm}:{ss}
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {[15, 25, 45].map((m) => (
              <button
                key={m}
                onClick={() => preset(m)}
                className={`rounded-full px-4 py-1 text-sm font-semibold ${length === m ? 'bg-indigo-600' : 'bg-gray-800 text-gray-300'}`}
              >
                {m} min
              </button>
            ))}
          </div>

          <button onClick={running ? pause : start} className="mt-4 w-full rounded-xl bg-indigo-600 p-3 text-lg font-semibold">
            {running ? 'Pause' : 'Start focusing'}
          </button>
          {done > 0 && <p className="mt-3 text-sm font-semibold text-green-400">🎉 {done} session{done > 1 ? 's' : ''} completed</p>}
        </div>

        <div className="rounded-2xl bg-gray-900 p-4 text-left">
          <p className="font-bold">
            🔥 {focusing.length} student{focusing.length === 1 ? '' : 's'} focusing right now
          </p>
          <p className="text-xs text-gray-500">{peers.length} in the room</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {focusing.map((p, i) => (
              <span key={i} className="rounded-full bg-indigo-900 px-3 py-1 text-xs text-indigo-200">
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}