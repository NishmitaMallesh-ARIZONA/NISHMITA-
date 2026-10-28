'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'


type Subject = { id: string; name: string; target: number }
type Entry = { id: string; subject_id: string; status: 'attended' | 'missed'; created_at: string }

function plan(attended: number, held: number, target: number) {
  if (held === 0) return { pct: 0, tone: 'none', msg: 'Tap Attended or Missed after each class to start.' }
  const t = target / 100
  const pct = (attended / held) * 100
  if (pct >= target) {
    const canMiss = Math.floor(attended / t - held + 1e-9)
    return {
      pct,
      tone: 'good',
      msg:
        canMiss > 0
          ? `You can miss ${canMiss} more class${canMiss > 1 ? 'es' : ''} and stay at ${target}% or above.`
          : 'Right on target. Try not to miss the next class.',
    }
  }
  const need = Math.ceil((t * held - attended) / (1 - t) - 1e-9)
  return {
    pct,
    tone: pct >= target - 10 ? 'warn' : 'bad',
    msg: `Attend the next ${need} class${need > 1 ? 'es' : ''} in a row to reach ${target}%.`,
  }
}

const TONE: Record<string, { text: string; bar: string }> = {
  good: { text: 'text-green-400', bar: 'bg-green-500' },
  warn: { text: 'text-yellow-300', bar: 'bg-yellow-500' },
  bad: { text: 'text-red-400', bar: 'bg-red-500' },
  none: { text: 'text-gray-400', bar: 'bg-gray-500' },
}

export default function AttendancePage() {
    const [supabase, setSupabase] = useState<any>(null)

    useEffect(() => {
        setSupabase(createClient())
    }, [])
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [name, setName] = useState('')
  const [target, setTarget] = useState(85)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [s, e] = await Promise.all([
      supabase.from('att_subjects').select('id, name, target').order('created_at', { ascending: true }),
      supabase.from('att_entries').select('id, subject_id, status, created_at').order('created_at', { ascending: false }),
    ])
    if (s.error) setMsg(s.error.message)
    setSubjects((s.data ?? []) as Subject[])
    setEntries((e.data ?? []) as Entry[])
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
      setLoading(false)
    }
    init()
  }, [router, load])

  async function addSubject(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !name.trim()) return
    const { error } = await supabase.from('att_subjects').insert({ user_id: userId, name: name.trim(), target })
    if (error) {
      setMsg(error.message)
      return
    }
    setName('')
    setMsg('')
    await load()
  }

  async function mark(subjectId: string, status: 'attended' | 'missed') {
    if (!userId) return
    const { error } = await supabase.from('att_entries').insert({ subject_id: subjectId, user_id: userId, status })
    if (error) setMsg(error.message)
    await load()
  }

  async function undo(subjectId: string) {
    const last = entries.find((x) => x.subject_id === subjectId)
    if (!last) return
    await supabase.from('att_entries').delete().eq('id', last.id)
    await load()
  }

  async function changeTarget(id: string, t: number) {
    await supabase.from('att_subjects').update({ target: t }).eq('id', id)
    await load()
  }

  async function removeSubject(id: string) {
    if (!confirm('Delete this subject and its history?')) return
    await supabase.from('att_subjects').delete().eq('id', id)
    await load()
  }

  if (loading) return <main className="min-h-screen p-8 text-gray-400">Loading...</main>

  const totalAttended = entries.filter((x) => x.status === 'attended').length
  const totalHeld = entries.length
  const overall = totalHeld ? (totalAttended / totalHeld) * 100 : 0

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 px-4 py-3">
        <h1 className="text-xl font-bold">📊 My Attendance</h1>
        <p className="text-xs">Private to you. Nobody else, not even admins, can see this page&apos;s data.</p>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        <div className="rounded-2xl bg-gray-900 p-4">
          <p className="text-xs text-gray-400">Overall</p>
          <p className="text-4xl font-bold">{totalHeld ? `${overall.toFixed(1)}%` : '--'}</p>
          <p className="text-xs text-gray-400">
            {totalAttended} attended out of {totalHeld} classes counted
          </p>
        </div>

        <p className="rounded-lg bg-yellow-950 p-3 text-xs text-yellow-300">
          Personal estimate based on what you enter. It is not the official record, so always check the college portal.
        </p>

        <form onSubmit={addSubject} className="space-y-3 rounded-2xl bg-gray-900 p-4">
          <h2 className="font-bold">Add a subject</h2>
          <input className="w-full rounded-lg bg-gray-800 p-3 text-sm" placeholder="e.g. Engineering Maths" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="flex gap-2">
            <label className="flex flex-1 items-center gap-2 text-sm text-gray-300">
              Target
              <select className="flex-1 rounded-lg bg-gray-800 p-2 text-sm" value={target} onChange={(e) => setTarget(Number(e.target.value))}>
                {[60, 65, 70, 75, 80, 85, 90, 95].map((t) => (
                  <option key={t} value={t}>
                    {t}%
                  </option>
                ))}
              </select>
            </label>
            <button className="rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-[#fff]">Add</button>
          </div>
        </form>

        {msg && <p className="text-sm text-red-400">{msg}</p>}
        {subjects.length === 0 && <p className="py-6 text-center text-gray-500">Add your subjects to start tracking.</p>}

        {subjects.map((s) => {
          const list = entries.filter((x) => x.subject_id === s.id)
          const attended = list.filter((x) => x.status === 'attended').length
          const p = plan(attended, list.length, s.target)
          const tone = TONE[p.tone]
          return (
            <article key={s.id} className="rounded-2xl bg-gray-900 p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold">{s.name}</h2>
                <p className={`text-2xl font-bold ${tone.text}`}>{list.length ? `${p.pct.toFixed(1)}%` : '--'}</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-800">
                <div className={`h-2 rounded-full ${tone.bar}`} style={{ width: `${Math.min(100, p.pct)}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {attended} attended of {list.length} held · target {s.target}%
              </p>
              <p className={`mt-1 text-sm font-semibold ${tone.text}`}>{p.msg}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => mark(s.id, 'attended')} className="flex-1 rounded-lg bg-green-600 p-2 text-sm font-semibold text-[#fff]">
                  ✓ Attended
                </button>
                <button onClick={() => mark(s.id, 'missed')} className="flex-1 rounded-lg bg-red-600 p-2 text-sm font-semibold text-[#fff]">
                  ✗ Missed
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                <button onClick={() => undo(s.id)}>Undo last</button>
                <select className="rounded bg-gray-800 p-1" value={s.target} onChange={(e) => changeTarget(s.id, Number(e.target.value))}>
                  {[60, 65, 70, 75, 80, 85, 90, 95].map((t) => (
                    <option key={t} value={t}>
                      Target {t}%
                    </option>
                  ))}
                </select>
                <button onClick={() => removeSubject(s.id)}>Delete</button>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  ) 
}