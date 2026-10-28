'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'



const BRANCHES = [
  { code: 'AI&DS', name: 'AI and Data Science' },
  { code: 'AIML', name: 'AI and Machine Learning' },
  { code: 'CSE', name: 'Computer Science' },
  { code: 'CSE-AIML', name: 'CSE (AI and ML)' },
  { code: 'CSE-IOT', name: 'CSE (IoT)' },
  { code: 'ECS', name: 'Electronics and Computer Science' },
  { code: 'ECE', name: 'Electronics and Communication' },
  { code: 'EEE', name: 'Electrical and Electronics' },
  { code: 'ISE', name: 'Information Science' },
  { code: 'CIVIL', name: 'Civil' },
  { code: 'ME', name: 'Mechanical' },
]

const KINDS = [
  { v: 'all', label: 'All' },
  { v: 'pyq', label: 'Question papers' },
  { v: 'notes', label: 'Notes' },
  { v: 'journal', label: 'Journals' },
]

const ICON: Record<string, string> = { pyq: '📝', notes: '📘', journal: '🔬' }

type Resource = {
  id: string
  title: string
  kind: string
  branch: string
  semester: number | null
  url: string
  note: string | null
  uploaded_by: string | null
}

export default function LibraryPage() {
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    setSupabase(createClient())
  }, [])
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [items, setItems] = useState<Resource[]>([])
  const [kind, setKind] = useState('all')
  const [branch, setBranch] = useState('all')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [fKind, setFKind] = useState('notes')
  const [fBranch, setFBranch] = useState('ALL')
  const [semester, setSemester] = useState('')
  const [url, setUrl] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('resources')
      .select('id, title, kind, branch, semester, url, note, uploaded_by')
      .order('created_at', { ascending: false })
    if (error) setMsg(error.message)
    setItems((data ?? []) as Resource[])
  }, [])

  useEffect(() => {
    async function init() {
      if (!supabase) return
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
  }, [router, load, supabase])

  async function share(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    if (!supabase) return
    setMsg('')
    const link = url.trim()
    if (!link.startsWith('http')) {
      setMsg('Paste a full link starting with http')
      return
    }
    const { error } = await supabase.from('resources').insert({
      title: title.trim(),
      kind: fKind,
      branch: fBranch,
      semester: semester ? Number(semester) : null,
      url: link,
      note: 'Shared by a student',
      uploaded_by: userId,
    })
    if (error) {
      setMsg(error.message)
      return
    }
    setTitle('')
    setUrl('')
    setSemester('')
    setShowForm(false)
    await load()
  }

  async function remove(id: string) {
    await supabase.from('resources').delete().eq('id', id)
    await load()
  }

  if (loading) return <main className="min-h-screen p-8 text-gray-400">Loading...</main>

  const q = query.trim().toLowerCase()
  const shown = items
    .filter((r) => kind === 'all' || r.kind === kind)
    .filter((r) => branch === 'all' || r.branch === branch || r.branch === 'ALL')
    .filter((r) => !q || r.title.toLowerCase().includes(q))

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 border-b border-gray-800 bg-gray-900 px-4 py-3">
        <h1 className="text-xl font-bold">📚 Library</h1>
        <p className="text-xs">Notes, question papers and journals for every branch</p>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        <input
          className="w-full rounded-lg bg-gray-900 p-3 text-sm"
          placeholder="Search resources..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex gap-2 overflow-x-auto">
          {KINDS.map((k) => (
            <button
              key={k.v}
              onClick={() => setKind(k.v)}
              className={`whitespace-nowrap rounded-full px-4 py-1 text-sm font-semibold ${
                kind === k.v ? 'bg-indigo-600' : 'bg-gray-900 text-gray-300'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <select className="w-full rounded-lg bg-gray-900 p-3 text-sm" value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="all">All branches</option>
          {BRANCHES.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>

        <button onClick={() => setShowForm(!showForm)} className="w-full rounded-xl bg-indigo-600 p-3 font-semibold">
          {showForm ? 'Cancel' : '+ Share a resource link'}
        </button>

        {showForm && (
          <form onSubmit={share} className="space-y-3 rounded-2xl bg-gray-900 p-4">
            <input className="w-full rounded-lg bg-gray-800 p-3" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div className="flex gap-2">
              <select className="flex-1 rounded-lg bg-gray-800 p-3 text-sm" value={fKind} onChange={(e) => setFKind(e.target.value)}>
                <option value="notes">Notes</option>
                <option value="pyq">Question paper</option>
                <option value="journal">Journal</option>
              </select>
              <select className="w-28 rounded-lg bg-gray-800 p-3 text-sm" value={semester} onChange={(e) => setSemester(e.target.value)}>
                <option value="">Sem</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>
            <select className="w-full rounded-lg bg-gray-800 p-3 text-sm" value={fBranch} onChange={(e) => setFBranch(e.target.value)}>
              <option value="ALL">All branches</option>
              {BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
            <input className="w-full rounded-lg bg-gray-800 p-3" placeholder="Link (Google Drive, website, PDF...)" value={url} onChange={(e) => setUrl(e.target.value)} required />
            {msg && <p className="text-sm text-red-400">{msg}</p>}
            <button className="w-full rounded-lg bg-indigo-600 p-3 font-semibold">Share</button>
          </form>
        )}

        {!showForm && msg && <p className="text-sm text-red-400">{msg}</p>}
        {shown.length === 0 && <p className="py-8 text-center text-gray-500">Nothing found. Try another filter.</p>}

        {shown.map((r) => (
          <article key={r.id} className="rounded-2xl bg-gray-900 p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-bold">
                {ICON[r.kind] ?? '📄'} {r.title}
              </h2>
              <span className="whitespace-nowrap rounded-full bg-indigo-900 px-2 py-1 text-xs text-indigo-200">
                {r.branch === 'ALL' ? 'All branches' : r.branch}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {r.semester ? `Semester ${r.semester}` : 'Any semester'}
              {r.note ? ` · ${r.note}` : ''}
            </p>
            <div className="mt-3 flex gap-2">
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-indigo-600 p-2 text-center text-sm font-semibold"
              >
                {r.url.endsWith('.pdf') ? 'View PDF' : 'Open link'}
              </a>
              {r.uploaded_by && r.uploaded_by === userId && (
                <button onClick={() => remove(r.id)} className="rounded-lg bg-gray-700 px-4 text-sm">
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}