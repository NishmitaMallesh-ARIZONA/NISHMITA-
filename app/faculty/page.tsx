'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'


const STATUS = {
  available: { label: 'Available in cabin', cls: 'bg-green-100 text-green-800' },
  in_class: { label: 'In class', cls: 'bg-blue-100 text-blue-800' },
  in_meeting: { label: 'In a meeting', cls: 'bg-yellow-100 text-yellow-800' },
  away: { label: 'Away', cls: 'bg-gray-200 text-gray-700' },
  on_leave: { label: 'On leave', cls: 'bg-red-100 text-red-800' },
} as const
type StatusKey = keyof typeof STATUS

const DURATIONS = [
  { label: '30 minutes', min: 30 },
  { label: '1 hour', min: 60 },
  { label: '2 hours', min: 120 },
  { label: '4 hours', min: 240 },
]

type Faculty = { id: string; full_name: string | null; department: string | null }
type FStatus = { faculty_id: string; status: StatusKey; until: string | null; cabin: string | null; office_hours: string | null; topics: string | null; updated_at: string | null }
type IncomingReq = { id: string; reason: string; preferred_time: string | null; status: string; reply: string | null; profiles: { full_name: string | null; usn: string | null; department: string | null } | null }
type MyReq = { id: string; reason: string; status: string; reply: string | null; profiles: { full_name: string | null } | null }

function ago(iso: string | null, now: number) {
  if (!iso) return ''
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000))
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  return `${Math.floor(m / 60)} h ago`
}

export default function FacultyPage() {
    const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    setSupabase(createClient())
  }, [])
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState('student')
  const [list, setList] = useState<Faculty[]>([])
  const [statuses, setStatuses] = useState<Record<string, FStatus>>({})
  const [incoming, setIncoming] = useState<IncomingReq[]>([])
  const [mine, setMine] = useState<MyReq[]>([])
  const [replies, setReplies] = useState<Record<string, string>>({})
  const [now, setNow] = useState<number>(0)
  useEffect(() => {
  setNow(Date.now())
}, [])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const [askFor, setAskFor] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [pref, setPref] = useState('')

  const [fStatus, setFStatus] = useState<StatusKey>('available')
  const [fMinutes, setFMinutes] = useState(60)
  const [fCabin, setFCabin] = useState('')
  const [fHours, setFHours] = useState('')
  const [fTopics, setFTopics] = useState('')

  const load = useCallback(async (uid: string, r: string) => {
    if (!supabase) return
    const [f, s, m] = await Promise.all([
      supabase.from('profiles').select('id, full_name, department').eq('role', 'faculty').order('full_name'),
      supabase.from('faculty_status').select('faculty_id, status, until, cabin, office_hours, topics, updated_at'),
      supabase.from('meeting_requests').select('id, reason, status, reply, profiles!faculty_id(full_name)').eq('student_id', uid).order('created_at', { ascending: false }).limit(10),
    ])
    setList((f.data ?? []) as Faculty[])
    const map: Record<string, FStatus> = {}
    ;((s.data ?? []) as FStatus[]).forEach((x) => (map[x.faculty_id] = x))
    setStatuses(map)
    setMine((m.data ?? []) as unknown as MyReq[])
    if (r === 'faculty') {
      const inc = await supabase
        .from('meeting_requests')
        .select('id, reason, preferred_time, status, reply, profiles!student_id(full_name, usn, department)')
        .eq('faculty_id', uid)
        .order('created_at', { ascending: false })
        .limit(20)
      setIncoming((inc.data ?? []) as unknown as IncomingReq[])
      const own = map[uid]
      if (own) {
        setFStatus(own.status)
        setFCabin(own.cabin ?? '')
        setFHours(own.office_hours ?? '')
        setFTopics(own.topics ?? '')
      }
    }
    setNow(Date.now())
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined
    async function init() {
        if (!supabase) return
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      const uid = data.user.id
      setUserId(uid)
      const { data: p } = await supabase.from('profiles').select('role').eq('id', uid).single()
      const r = (p?.role as string) ?? 'student'
      setRole(r)
      await load(uid, r)
      setLoading(false)
      timer = setInterval(() => load(uid, r), 30000)
    }
    init()
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [router, load, supabase])

  async function saveStatus(e: React.FormEvent) {
    if (!supabase) return
    e.preventDefault()
    if (!userId) return
    const until = new Date(Date.now() + fMinutes * 60000).toISOString()
    const { error } = await supabase.from('faculty_status').upsert({
      faculty_id: userId,
      status: fStatus,
      until,
      cabin: fCabin.trim(),
      office_hours: fHours.trim(),
      topics: fTopics.trim(),
      updated_at: new Date().toISOString(),
    })
    setMsg(error ? error.message : 'Status updated. Students will see it now.')
    await load(userId, role)
  }

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !askFor) return
    const { error } = await supabase.from('meeting_requests').insert({
      student_id: userId,
      faculty_id: askFor,
      reason: reason.trim(),
      preferred_time: pref.trim(),
    })
    setMsg(error ? error.message : 'Meeting request sent.')
    if (!error) {
      setAskFor(null)
      setReason('')
      setPref('')
    }
    await load(userId, role)
  }

  async function answer(id: string, status: 'accepted' | 'declined') {
    if (!userId) return
    const { error } = await supabase.from('meeting_requests').update({ status, reply: (replies[id] ?? '').trim() || null }).eq('id', id)
    setMsg(error ? error.message : 'Reply sent.')
    await load(userId, role)
  }

  if (loading) return <main className="min-h-screen p-8 text-gray-400">Loading...</main>

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 px-4 py-3">
        <h1 className="text-xl font-bold">🎓 Faculty Connect</h1>
        <p className="text-xs">Check if a faculty member is available before you walk to their cabin.</p>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        {msg && <p className="rounded-lg bg-gray-900 p-3 text-sm text-gray-300">{msg}</p>}

        {role === 'faculty' && (
          <>
            <form onSubmit={saveStatus} className="space-y-3 rounded-2xl bg-gray-900 p-4">
              <h2 className="font-bold">My status</h2>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS) as StatusKey[]).map((k) => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => setFStatus(k)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${fStatus === k ? 'bg-indigo-600 text-[#fff]' : 'bg-gray-800 text-gray-300'}`}
                  >
                    {STATUS[k].label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                Valid for
                <select className="flex-1 rounded-lg bg-gray-800 p-2 text-sm" value={fMinutes} onChange={(e) => setFMinutes(Number(e.target.value))}>
                  {DURATIONS.map((d) => (
                    <option key={d.min} value={d.min}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>
              <input className="w-full rounded-lg bg-gray-800 p-3 text-sm" placeholder="Cabin or room" value={fCabin} onChange={(e) => setFCabin(e.target.value)} />
              <input className="w-full rounded-lg bg-gray-800 p-3 text-sm" placeholder="Office hours (e.g. Mon to Wed, 2 to 4 PM)" value={fHours} onChange={(e) => setFHours(e.target.value)} />
              <input className="w-full rounded-lg bg-gray-800 p-3 text-sm" placeholder="Topics (projects, mentoring...)" value={fTopics} onChange={(e) => setFTopics(e.target.value)} />
              <button className="w-full rounded-lg bg-indigo-600 p-3 text-sm font-semibold text-[#fff]">Update status</button>
              <p className="text-xs text-gray-400">The status expires by itself, so students never see an old &quot;Available&quot;.</p>
            </form>

            <section className="space-y-2">
              <h2 className="font-bold">Meeting requests for me</h2>
              {incoming.length === 0 && <p className="text-sm text-gray-500">No requests yet.</p>}
              {incoming.map((r) => (
                <div key={r.id} className="rounded-xl bg-gray-900 p-3">
                  <p className="text-sm font-semibold">
                    {r.profiles?.full_name ?? 'Student'} <span className="text-xs text-gray-400">{r.profiles?.usn} · {r.profiles?.department}</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-300">{r.reason}</p>
                  {r.preferred_time && <p className="text-xs text-gray-400">Preferred: {r.preferred_time}</p>}
                  {r.status === 'pending' ? (
                    <div className="mt-2 space-y-2">
                      <input className="w-full rounded-lg bg-gray-800 p-2 text-sm" placeholder="Reply (time, place...)" value={replies[r.id] ?? ''} onChange={(e) => setReplies({ ...replies, [r.id]: e.target.value })} />
                      <div className="flex gap-2">
                        <button onClick={() => answer(r.id, 'accepted')} className="flex-1 rounded-lg bg-green-600 p-2 text-sm font-semibold text-[#fff]">
                          Accept
                        </button>
                        <button onClick={() => answer(r.id, 'declined')} className="flex-1 rounded-lg bg-gray-700 p-2 text-sm font-semibold">
                          Decline
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs font-semibold text-gray-400">
                      {r.status}
                      {r.reply ? `: ${r.reply}` : ''}
                    </p>
                  )}
                </div>
              ))}
            </section>
          </>
        )}

        <section className="space-y-3">
          <h2 className="font-bold">Faculty</h2>
          {list.length === 0 && <p className="text-sm text-gray-500">No faculty accounts yet.</p>}
          {list.map((f) => {
            const s = statuses[f.id]
            const live = s && (!s.until || new Date(s.until).getTime() > now)
            const meta = live ? STATUS[s.status] : { label: 'Not updated', cls: 'bg-gray-200 text-gray-700' }
            return (
              <article key={f.id} className="rounded-2xl bg-gray-900 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold">{f.full_name}</h3>
                    <p className="text-xs text-gray-400">{f.department}</p>
                  </div>
                  <span className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${meta.cls}`}>{meta.label}</span>
                </div>
                {s && (
                  <div className="mt-2 space-y-0.5 text-sm text-gray-300">
                    {s.cabin && <p>📍 {s.cabin}</p>}
                    {s.office_hours && <p>🕒 {s.office_hours}</p>}
                    {s.topics && <p>💬 {s.topics}</p>}
                    <p className="text-xs text-gray-500">
                      {live ? `Updated ${ago(s.updated_at, now)}` : `Last updated ${ago(s.updated_at, now)}. Status has expired.`}
                    </p>
                  </div>
                )}
                {role !== 'faculty' && (
                  <>
                    <button onClick={() => setAskFor(askFor === f.id ? null : f.id)} className="mt-3 w-full rounded-lg bg-indigo-600 p-2 text-sm font-semibold text-[#fff]">
                      {askFor === f.id ? 'Cancel' : 'Request a meeting'}
                    </button>
                    {askFor === f.id && (
                      <form onSubmit={sendRequest} className="mt-3 space-y-2">
                        <textarea className="w-full resize-none rounded-lg bg-gray-800 p-2 text-sm" rows={2} placeholder="What do you want to discuss?" value={reason} onChange={(e) => setReason(e.target.value)} required />
                        <input className="w-full rounded-lg bg-gray-800 p-2 text-sm" placeholder="Preferred time (optional)" value={pref} onChange={(e) => setPref(e.target.value)} />
                        <button className="w-full rounded-lg bg-green-600 p-2 text-sm font-semibold text-[#fff]">Send request</button>
                      </form>
                    )}
                  </>
                )}
              </article>
            )
          })}
        </section>

        {mine.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-bold">My requests</h2>
            {mine.map((r) => (
              <div key={r.id} className="rounded-xl bg-gray-900 p-3 text-sm">
                <p className="font-semibold">{r.profiles?.full_name ?? 'Faculty'}</p>
                <p className="text-gray-300">{r.reason}</p>
                <p className="text-xs font-semibold text-gray-400">
                  {r.status}
                  {r.reply ? `: ${r.reply}` : ''}
                </p>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}