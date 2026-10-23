'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

const BRANCHES = [
  { code: 'AI&DS', name: 'Artificial Intelligence and Data Science' },
  { code: 'AIML', name: 'Artificial Intelligence and Machine Learning' },
  { code: 'CSE', name: 'Computer Science and Engineering' },
  { code: 'CSE-AIML', name: 'CSE (AI and ML)' },
  { code: 'CSE-IOT', name: 'CSE (Internet of Things)' },
  { code: 'ECS', name: 'Electronics and Computer Science Engineering' },
  { code: 'ECE', name: 'Electronics and Communication Engineering' },
  { code: 'EEE', name: 'Electrical and Electronics Engineering' },
  { code: 'ISE', name: 'Information Science and Engineering' },
  { code: 'CIVIL', name: 'Civil Engineering' },
  { code: 'ME', name: 'Mechanical Engineering' },
]

const SUGGESTED = [
  'python', 'java', 'c programming', 'web development', 'react', 'app development',
  'ui design', 'backend', 'sql', 'machine learning', 'data analysis',
  'iot', 'sensors', 'arduino', 'embedded systems', 'circuit design', 'pcb design',
  'power systems', 'matlab', 'cad', '3d printing', 'structural analysis', 'surveying',
  'video editing', 'presentation',
]

type Row = { id: string; full_name: string | null; karma: number }

function badge(karma: number) {
  if (karma >= 250) return '🏆 Campus Legend'
  if (karma >= 100) return '⭐ Campus Star'
  if (karma >= 30) return '🚀 Rising Member'
  return '🌱 Newcomer'
}

function SkillPicker({
  label,
  help,
  selected,
  setSelected,
}: {
  label: string
  help: string
  selected: string[]
  setSelected: (v: string[]) => void
}) {
  const [custom, setCustom] = useState('')
  const all = Array.from(new Set([...SUGGESTED, ...selected]))

  function toggle(s: string) {
    setSelected(selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s])
  }

  function addCustom() {
    const v = custom.trim().toLowerCase()
    if (v && !selected.includes(v)) setSelected([...selected, v])
    setCustom('')
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-gray-400">{help}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {all.map((s) => {
          const on = selected.includes(s)
          return (
            <button
              type="button"
              key={s}
              onClick={() => toggle(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${on ? 'bg-indigo-600' : 'bg-gray-800 text-gray-300'}`}
            >
              {on ? '✓ ' : ''}
              {s}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg bg-gray-800 p-2 text-sm"
          placeholder="Not listed? Type a skill and tap Add"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCustom()
            }
          }}
        />
        <button type="button" onClick={addCustom} className="rounded-lg bg-gray-700 px-3 text-sm font-semibold">
          Add
        </button>
      </div>
    </div>
  )
}

export default function MePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [branch, setBranch] = useState('')
  const [year, setYear] = useState('')
  const [bio, setBio] = useState('')
  const [skillsHave, setSkillsHave] = useState<string[]>([])
  const [skillsNeed, setSkillsNeed] = useState<string[]>([])
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
        const code = (p.department ?? '').toString().trim().toUpperCase()
        setBranch(BRANCHES.find((b) => b.code === code)?.code ?? '')
        setYear(p.year ? String(p.year) : '')
        setBio(p.bio ?? '')
        setSkillsHave((p.skills ?? []).map((s: string) => s.toLowerCase()))
        setSkillsNeed(
          (p.looking_for ?? '')
            .split(',')
            .map((s: string) => s.trim().toLowerCase())
            .filter(Boolean)
        )
      }

      const { data: c } = await supabase.from('contacts').select('handle').eq('user_id', uid).maybeSingle()
      setContact(c?.handle ?? '')

      const { data: lb } = await supabase
        .from('leaderboard')
        .select('id, full_name, karma')
        .order('karma', { ascending: false })
        .limit(5)
      setBoard(((lb ?? []) as Row[]).map((r) => ({ ...r, karma: Number(r.karma) })))

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
    if (!branch) {
      setMsg('Please choose your branch.')
      return
    }
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        department: branch,
        year: year ? Number(year) : null,
        bio: bio.trim(),
        skills: skillsHave,
        looking_for: skillsNeed.join(', '),
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

        <form onSubmit={save} className="space-y-4 rounded-2xl bg-gray-900 p-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold">Full name</label>
            <input className="w-full rounded-lg bg-gray-800 p-3" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-semibold">Branch</label>
              <select className="w-full rounded-lg bg-gray-800 p-3 text-sm" value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="">Select your branch</option>
                {BRANCHES.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28 space-y-1">
              <label className="text-sm font-semibold">Year</label>
              <select className="w-full rounded-lg bg-gray-800 p-3 text-sm" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Year</option>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">About me</label>
            <textarea className="w-full resize-none rounded-lg bg-gray-800 p-3" rows={2} placeholder="One line about what you like building" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <SkillPicker
            label="Skills I have"
            help="Tap everything you can do. These are what other students will see."
            selected={skillsHave}
            setSelected={setSkillsHave}
          />

          <SkillPicker
            label="Skills I'm looking for"
            help="What do you need from a teammate? Matches are ranked by this."
            selected={skillsNeed}
            setSelected={setSkillsNeed}
          />

          <div className="space-y-1">
            <label className="text-sm font-semibold">Private contact</label>
            <p className="text-xs text-gray-400">Shown only to teammates whose request you accept.</p>
            <input className="w-full rounded-lg bg-gray-800 p-3" placeholder="WhatsApp number or Instagram handle" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>

          {msg && <p className={`text-sm ${msg.startsWith('Saved') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
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