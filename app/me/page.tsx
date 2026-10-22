'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

type Row = { id: string; full_name: string | null; karma: number }

function badge(karma: number) {
  if (karma >= 250) return '🏆 Campus Legend'
  if (karma >= 100) return '⭐ Campus Star'
  if (karma >= 30) return '🚀 Rising Member'
  return '🌱 Newcomer'
}

export default function MePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [contact, setContact] = useState('')
  const [karma, setKarma] = useState(0)
  const [board, setBoard] = useState<Row[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      const uid = data.user.id
      setUserId(uid)

      const { data: p } = await supabase
        .from('profiles')
        .select('full_name, department, year, bio, skills, looking_for')
        .eq('id', uid)
        .single()
      if (p) {
        setFullName(p.full_name ?? '')
        setDepartment(p.department ?? '')
        setYear(p.year ? String(p.year) : '')
        setBio(p.bio ?? '')
        setSkills((p.skills ?? []).join(', '))
        setLookingFor(p.looking_for ?? '')
      }

      const { data: c } = await supabase.from('contacts').select('handle').eq('user_id', uid).maybeSingle()
      setContact(c?.handle ?? '')

      const { data: lb } = await supabase
        .from('leaderboard')
        .select('id, full_name, karma')
        .order('karma', { ascending: false })
        .limit(5)
      const rows = ((lb ?? []) as Row[]).map((r) => ({ ...r, karma: Number(r.karma) }))
      setBoard(rows)

      const { data: mine } = await supabase.from('leaderboard').select('karma').eq('id', uid).maybeSingle()
      setKarma(Number(mine?.karma ?? 0))
      setLoading(false)
    }
    init()
  }, [router])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setMsg('')
    const skillArr = skills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        department: department.trim(),
        year: year ? Number(year) : null,
        bio: bio.trim(),
        skills: skillArr,
        looking_for: lookingFor.trim().toLowerCase(),
      })
      .eq('id', userId)
    if (error) {
      setMsg(error.message)
      return
    }
    await supabase.from('contacts').upsert({ user_id: userId, handle: contact.trim() })
    setMsg('Saved ✓')
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <main className="min-h-screen p-8 text-gray-400">Loading...</main>

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3">
        <h1 className="text-xl font-bold">My profile</h1>
        <button onClick={logout} className="text-sm text-gray-400">
          Log out
        </button>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
          <p className="text-sm opacity-80">Campus Karma</p>
          <p className="text-4xl font-bold">{karma}</p>
          <p className="mt-1 font-semibold">{badge(karma)}</p>
          <p className="mt-1 text-xs opacity-80">Post +10 · Comment +3 · Like received +2 · RSVP +5</p>
        </div>

        <Link href="/tickets" className="block rounded-xl bg-gray-900 p-4 text-center font-semibold text-indigo-300">
          🎟️ My event tickets (QR)
        </Link>

        <form onSubmit={save} className="space-y-3 rounded-2xl bg-gray-900 p-4">
          <input className="w-full rounded-lg bg-gray-800 p-3" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <div className="flex gap-2">
            <input className="flex-1 rounded-lg bg-gray-800 p-3" placeholder="Department (e.g. CSE)" value={department} onChange={(e) => setDepartment(e.target.value)} />
            <input className="w-24 rounded-lg bg-gray-800 p-3" type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <textarea className="w-full resize-none rounded-lg bg-gray-800 p-3" rows={2} placeholder="Short bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <input className="w-full rounded-lg bg-gray-800 p-3" placeholder="My skills, comma separated (react, python, ui design)" value={skills} onChange={(e) => setSkills(e.target.value)} />
          <input className="w-full rounded-lg bg-gray-800 p-3" placeholder="Looking for (backend, machine learning)" value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} />
          <input className="w-full rounded-lg bg-gray-800 p-3" placeholder="Private contact (WhatsApp / Instagram). Shown only to accepted teammates" value={contact} onChange={(e) => setContact(e.target.value)} />
          {msg && <p className="text-sm text-green-400">{msg}</p>}
          <button className="w-full rounded-lg bg-indigo-600 p-3 font-semibold">Save profile</button>
        </form>

        <div className="rounded-2xl bg-gray-900 p-4">
          <h2 className="mb-2 font-bold">🏅 Top contributors</h2>
          {board.map((r, i) => (
            <div key={r.id} className="flex justify-between border-b border-gray-800 py-2 text-sm last:border-0">
              <span>
                {i + 1}. {r.full_name ?? 'Student'}
              </span>
              <span className="text-indigo-300">{r.karma}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}