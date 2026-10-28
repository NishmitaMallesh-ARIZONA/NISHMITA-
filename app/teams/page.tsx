'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'



type Person = {
  id: string
  full_name: string | null
  department: string | null
  year: number | null
  bio: string | null
  skills: string[] | null
  looking_for: string | null
}

type Req = {
  id: string
  from_user: string
  to_user: string
  status: string
  sender: { full_name: string | null } | null
  receiver: { full_name: string | null } | null
}

const tokens = (s: string | null) =>
  (s ?? '')
    .toLowerCase()
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

const norm = (s: string | null) => (s ?? '').trim().toUpperCase()

function score(me: Person, other: Person) {
  const myNeeds = tokens(me.looking_for)
  const theirNeeds = tokens(other.looking_for)
  const mySkills = (me.skills ?? []).map((s) => s.toLowerCase())
  const theirSkills = (other.skills ?? []).map((s) => s.toLowerCase())
  const a = myNeeds.length ? myNeeds.filter((n) => theirSkills.includes(n)).length / myNeeds.length : 0
  const b = theirNeeds.length ? theirNeeds.filter((n) => mySkills.includes(n)).length / theirNeeds.length : 0
  return Math.round(a * 60 + b * 40)
}

function why(me: Person, other: Person) {
  const mySkills = (me.skills ?? []).map((s) => s.toLowerCase())
  const theirSkills = (other.skills ?? []).map((s) => s.toLowerCase())
  return {
    theyHelp: tokens(me.looking_for).filter((n) => theirSkills.includes(n)),
    iHelp: tokens(other.looking_for).filter((n) => mySkills.includes(n)),
  }
}

export default function TeamsPage() {
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    setSupabase(createClient())
  }, [])
  const router = useRouter()
  const [me, setMe] = useState<Person | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [reqs, setReqs] = useState<Req[]>([])
  const [contacts, setContacts] = useState<Record<string, string>>({})
  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!supabase) return
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      router.push('/login')
      return
    }
    const uid = auth.user.id

    const { data: all } = await supabase
      .from('profiles')
      .select('id, full_name, department, year, bio, skills, looking_for')
    const list = (all ?? []) as Person[]
    setMe(list.find((p) => p.id === uid) ?? null)
    setPeople(list.filter((p) => p.id !== uid))

    const { data: r } = await supabase
      .from('team_requests')
      .select('id, from_user, to_user, status, sender:profiles!from_user(full_name), receiver:profiles!to_user(full_name)')
    const rs = (r ?? []) as unknown as Req[]
    setReqs(rs)

    const otherIds = rs
      .filter((x) => x.status === 'accepted')
      .map((x) => (x.from_user === uid ? x.to_user : x.from_user))
    if (otherIds.length) {
      const { data: c } = await supabase.from('contacts').select('user_id, handle').in('user_id', otherIds)
      const map: Record<string, string> = {}
      ;(c ?? []).forEach((row: { user_id: string; handle: string | null }) => {
        if (row.handle) map[row.user_id] = row.handle
      })
      setContacts(map)
    }
    setLoading(false)
  }, [router, supabase])

  useEffect(() => {
    load()
  }, [load])

  async function connect(toId: string) {
    if (!me || !supabase) return
    setMsg('')
    const { error } = await supabase
      .from('team_requests')
      .insert({ from_user: me.id, to_user: toId, message: "Hi! I think we'd make a great team." })
    if (error) {
      setMsg(error.message)
      return
    }
    await load()
  }

  async function answer(id: string, status: 'accepted' | 'declined') {
    if (!supabase) return
    await supabase.from('team_requests').update({ status }).eq('id', id)
    await load()
  }

  if (loading) return <main className="min-h-screen p-8 text-gray-400">Loading...</main>

  const myId = me?.id
  const myDept = norm(me?.department ?? null)
  const incoming = reqs.filter((r) => r.to_user === myId && r.status === 'pending')
  const team = reqs.filter((r) => r.status === 'accepted')
  const touched = new Set(reqs.flatMap((r) => [r.from_user, r.to_user]))
  const q = query.trim().toLowerCase()
  const depts = Array.from(new Set(people.map((p) => norm(p.department)).filter(Boolean))).sort()
  const isCross = (p: Person) => !!myDept && !!norm(p.department) && norm(p.department) !== myDept

  const ranked = me
    ? people
        .filter((p) => !touched.has(p.id))
        .filter(
          (p) =>
            !q ||
            (p.full_name ?? '').toLowerCase().includes(q) ||
            (p.department ?? '').toLowerCase().includes(q) ||
            (p.skills ?? []).some((s) => s.toLowerCase().includes(q))
        )
        .filter((p) => {
          if (deptFilter === 'All') return true
          if (deptFilter === 'Cross-branch') return isCross(p)
          return norm(p.department) === deptFilter
        })
        .map((p) => ({ p, s: score(me, p) }))
        .sort((a, b) => b.s - a.s)
    : []

  const crossCount = ranked.filter((x) => isCross(x.p)).length
  const needsProfile = !me || ((me.skills ?? []).length === 0 && tokens(me.looking_for).length === 0)

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 border-b border-gray-800 bg-gray-900 px-4 py-3">
        <h1 className="text-xl font-bold">🤝 Find teammates</h1>
        <p className="text-xs">Across every branch</p>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        {needsProfile && (
          <p className="rounded-xl bg-yellow-950 p-3 text-sm text-yellow-300">
            Add your branch, skills and what you are looking for on the Me tab to get match scores.
          </p>
        )}
        {msg && <p className="text-sm text-red-400">{msg}</p>}

        {incoming.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-bold">Requests for you</h2>
            {incoming.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-gray-900 p-3">
                <span>{r.sender?.full_name ?? 'Student'} wants to team up</span>
                <span className="flex gap-2">
                  <button onClick={() => answer(r.id, 'accepted')} className="rounded-lg bg-green-600 px-3 py-1 text-sm">
                    Accept
                  </button>
                  <button onClick={() => answer(r.id, 'declined')} className="rounded-lg bg-gray-700 px-3 py-1 text-sm">
                    Decline
                  </button>
                </span>
              </div>
            ))}
          </section>
        )}

        {team.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-bold">Your teammates</h2>
            {team.map((r) => {
              const otherId = r.from_user === myId ? r.to_user : r.from_user
              const name = r.from_user === myId ? r.receiver?.full_name : r.sender?.full_name
              return (
                <div key={r.id} className="rounded-xl bg-gray-900 p-3">
                  <p className="font-semibold">{name ?? 'Student'}</p>
                  <p className="text-sm text-green-400">
                    {contacts[otherId] ? `📞 ${contacts[otherId]}` : 'No contact shared yet'}
                  </p>
                </div>
              )
            })}
          </section>
        )}

        <section className="space-y-3">
          <h2 className="font-bold">Suggested for you</h2>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {['All', 'Cross-branch', ...depts].map((d) => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold ${
                  deptFilter === d ? 'bg-indigo-600' : 'bg-gray-900 text-gray-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {ranked.length > 0 && (
            <p className="text-xs text-gray-400">
              {crossCount} of {ranked.length} suggestions are from a different branch than yours
            </p>
          )}

          <input
            className="w-full rounded-lg bg-gray-900 p-3 text-sm"
            placeholder="Search by name, branch or skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {ranked.length === 0 && <p className="py-4 text-center text-gray-500">No one to suggest yet.</p>}

          {ranked.map(({ p, s }) => {
            const w = me ? why(me, p) : { theyHelp: [], iHelp: [] }
            return (
              <div key={p.id} className="rounded-2xl bg-gray-900 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{p.full_name ?? 'Student'}</p>
                    <p className="text-xs text-gray-400">
                      {norm(p.department)} {p.year ? `· Year ${p.year}` : ''}
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-900 px-3 py-1 text-sm font-bold text-indigo-200">{s}% match</span>
                </div>
                {isCross(p) && (
                  <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                    Cross-branch
                  </span>
                )}
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-800">
                  <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${s}%` }} />
                </div>
                {p.bio && <p className="mt-2 text-sm text-gray-300">{p.bio}</p>}
                {(w.theyHelp.length > 0 || w.iHelp.length > 0) && (
                  <div className="mt-2 space-y-1 text-xs text-gray-300">
                    {w.theyHelp.length > 0 && <p>✅ They can help you with: {w.theyHelp.join(', ')}</p>}
                    {w.iHelp.length > 0 && <p>🔁 You can help them with: {w.iHelp.join(', ')}</p>}
                  </div>
                )}
                               <p className="mt-2 text-xs font-semibold text-gray-400">Skills</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(p.skills ?? []).map((sk) => (
                    <span key={sk} className="rounded-full bg-gray-800 px-2 py-1 text-xs">
                      {sk}
                    </span>
                  ))}
                </div>
                {p.looking_for && (
                  <>
                    <p className="mt-2 text-xs font-semibold text-gray-400">Looking for</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tokens(p.looking_for).map((t) => (
                        <span key={t} className="rounded-full bg-indigo-900 px-2 py-1 text-xs text-indigo-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                <button onClick={() => connect(p.id)} className="mt-3 w-full rounded-lg bg-indigo-600 p-2 text-sm font-semibold">
                  Connect
                </button>
              </div>
            )
          })}
        </section>
      </div>
    </main>
  )
}