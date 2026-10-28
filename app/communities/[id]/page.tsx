'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'


type Community = { id: string; name: string; description: string | null; about: string | null; icon: string | null; faculty_coordinator: string | null }
type Member = { user_id: string; role: string; profiles: { full_name: string | null; department: string | null } | null }
type Achievement = { id: string; title: string; detail: string | null; achieved_on: string | null }
type CPost = { id: string; content: string; created_at: string; profiles: { full_name: string | null } | null }

const ROLE_LABEL: Record<string, string> = { lead: 'Lead', 'co-lead': 'Co-lead', member: 'Member' }

function CommunityDetail() {
    const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    setSupabase(createClient())
  }, [])
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [c, setC] = useState<Community | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [ach, setAch] = useState<Achievement[]>([])
  const [posts, setPosts] = useState<CPost[]>([])
  const [text, setText] = useState('')
  const [aTitle, setATitle] = useState('')
  const [aDetail, setADetail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!supabase) return
    const [cr, mr, ar, pr] = await Promise.all([
      supabase.from('communities').select('id, name, description, about, icon, faculty_coordinator').eq('id', id).single(),
      supabase.from('community_members').select('user_id, role, profiles(full_name, department)').eq('community_id', id),
      supabase.from('community_achievements').select('id, title, detail, achieved_on').eq('community_id', id).order('achieved_on', { ascending: false }),
      supabase.from('community_posts').select('id, content, created_at, profiles!author_id(full_name)').eq('community_id', id).order('created_at', { ascending: false }).limit(30),
    ])
    setC((cr.data ?? null) as Community | null)
    setMembers((mr.data ?? []) as unknown as Member[])
    setAch((ar.data ?? []) as Achievement[])
    setPosts((pr.data ?? []) as unknown as CPost[])
  }, [id])

  useEffect(() => {
    async function init() {
        if (!supabase) return
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUserId(data.user.id)
      const { data: p } = await supabase.from('profiles').select('is_admin').eq('id', data.user.id).single()
      setIsAdmin(!!p?.is_admin)
      await load()
      setLoading(false)
    }
    init()
  }, [router, load, supabase])

  const mine = members.find((m) => m.user_id === userId)
  const joined = !!mine
  const canManage = isAdmin || mine?.role === 'lead' || mine?.role === 'co-lead'
  const leaders = members.filter((m) => m.role === 'lead' || m.role === 'co-lead')

  async function toggleJoin() {
    if (!userId) return
    const { error } = joined
      ? await supabase.from('community_members').delete().eq('community_id', id).eq('user_id', userId)
      : await supabase.from('community_members').insert({ community_id: id, user_id: userId, role: 'member' })
    setMsg(error ? error.message : '')
    await load()
  }

  async function addPost(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !text.trim()) return
    const { error } = await supabase.from('community_posts').insert({ community_id: id, author_id: userId, content: text.trim() })
    setMsg(error ? error.message : '')
    if (!error) setText('')
    await load()
  }

  async function addAchievement(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('community_achievements').insert({ community_id: id, title: aTitle.trim(), detail: aDetail.trim() })
    setMsg(error ? error.message : '')
    if (!error) {
      setATitle('')
      setADetail('')
    }
    await load()
  }

  async function removeAchievement(aid: string) {
    await supabase.from('community_achievements').delete().eq('id', aid)
    await load()
  }

  if (loading) return <main className="min-h-screen p-8 text-gray-400">Loading...</main>
  if (!c) return <main className="min-h-screen p-8 text-gray-400">Community not found.</main>

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 px-4 py-3">
        <Link href="/communities" className="text-xs">
          ← All communities
        </Link>
        <h1 className="text-xl font-bold">
          {c.icon} {c.name}
        </h1>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        <section className="rounded-2xl bg-gray-900 p-4">
          <p className="text-sm text-gray-300">{c.about || c.description}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">{members.length}</p>
              <p className="text-xs text-gray-400">Members</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{leaders.length}</p>
              <p className="text-xs text-gray-400">Leaders</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{ach.length}</p>
              <p className="text-xs text-gray-400">Achievements</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Faculty coordinator: {c.faculty_coordinator || 'To be announced'}</p>
          <button onClick={toggleJoin} className={`mt-3 w-full rounded-lg p-3 font-semibold ${joined ? 'bg-gray-700' : 'bg-indigo-600 text-[#fff]'}`}>
            {joined ? 'Joined · tap to leave' : 'Join this community'}
          </button>
        </section>

        {msg && <p className="text-sm text-red-400">{msg}</p>}

        <section className="rounded-2xl bg-gray-900 p-4">
          <h2 className="font-bold">Who runs it</h2>
          {leaders.length === 0 && <p className="mt-1 text-sm text-gray-500">No leaders assigned yet.</p>}
          {leaders.map((m) => (
            <p key={m.user_id} className="mt-1 text-sm">
              <span className="font-semibold">{m.profiles?.full_name ?? 'Student'}</span>{' '}
              <span className="rounded-full bg-indigo-900 px-2 py-0.5 text-xs text-indigo-200">{ROLE_LABEL[m.role]}</span>{' '}
              <span className="text-xs text-gray-400">{m.profiles?.department}</span>
            </p>
          ))}
        </section>

        <section className="space-y-2 rounded-2xl bg-gray-900 p-4">
          <h2 className="font-bold">🏆 Achievements</h2>
          {ach.length === 0 && <p className="text-sm text-gray-500">No achievements added yet.</p>}
          {ach.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-2 border-l-2 border-indigo-500 pl-3">
              <div>
                <p className="text-sm font-semibold">{a.title}</p>
                {a.detail && <p className="text-xs text-gray-400">{a.detail}</p>}
                {a.achieved_on && <p className="text-xs text-gray-500">{new Date(a.achieved_on).toLocaleDateString()}</p>}
              </div>
              {canManage && (
                <button onClick={() => removeAchievement(a.id)} className="text-xs text-gray-400">
                  Delete
                </button>
              )}
            </div>
          ))}
          {canManage && (
            <form onSubmit={addAchievement} className="space-y-2 pt-2">
              <input className="w-full rounded-lg bg-gray-800 p-2 text-sm" placeholder="Achievement title" value={aTitle} onChange={(e) => setATitle(e.target.value)} required />
              <input className="w-full rounded-lg bg-gray-800 p-2 text-sm" placeholder="Details (optional)" value={aDetail} onChange={(e) => setADetail(e.target.value)} />
              <button className="w-full rounded-lg bg-indigo-600 p-2 text-sm font-semibold text-[#fff]">Add achievement</button>
            </form>
          )}
        </section>

        <section className="space-y-2 rounded-2xl bg-gray-900 p-4">
          <h2 className="font-bold">Members ({members.length})</h2>
          <div className="flex flex-wrap gap-2">
            {members.slice(0, 40).map((m) => (
              <span key={m.user_id} className="rounded-full bg-gray-800 px-3 py-1 text-xs">
                {m.profiles?.full_name ?? 'Student'}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-2 rounded-2xl bg-gray-900 p-4">
          <h2 className="font-bold">Community wall</h2>
          {joined ? (
            <form onSubmit={addPost} className="flex gap-2">
              <input className="flex-1 rounded-lg bg-gray-800 p-2 text-sm" placeholder="Post to this community..." value={text} onChange={(e) => setText(e.target.value)} />
              <button className="rounded-lg bg-indigo-600 px-3 text-sm text-[#fff]">Post</button>
            </form>
          ) : (
            <p className="text-sm text-gray-400">Join this community to post.</p>
          )}
          {posts.length === 0 && <p className="text-sm text-gray-500">No posts yet.</p>}
          {posts.map((p) => (
            <p key={p.id} className="text-sm">
              <span className="font-semibold text-indigo-400">{p.profiles?.full_name ?? 'Student'}</span>{' '}
              <span className="text-gray-300">{p.content}</span>
            </p>
          ))}
        </section>
      </div>
    </main>
  )
}
export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading community...</div>}>
      <CommunityDetail />
    </Suspense>
  )
}