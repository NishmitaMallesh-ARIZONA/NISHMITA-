'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

type Community = {
  id: string
  name: string
  description: string | null
  icon: string | null
  community_members: { user_id: string }[]
}

type CPost = {
  id: string
  content: string
  created_at: string
  profiles: { full_name: string | null } | null
}

export default function CommunitiesPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [list, setList] = useState<Community[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [posts, setPosts] = useState<CPost[]>([])
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('communities')
      .select('id, name, description, icon, community_members(user_id)')
      .order('name')
    setList((data ?? []) as unknown as Community[])
  }, [])

  const loadPosts = useCallback(async (id: string) => {
    const { data } = await supabase
      .from('community_posts')
      .select('id, content, created_at, profiles!author_id(full_name)')
      .eq('community_id', id)
      .order('created_at', { ascending: false })
    setPosts((data ?? []) as unknown as CPost[])
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

  async function toggleJoin(c: Community) {
    if (!userId) return
    const joined = c.community_members.some((m) => m.user_id === userId)
    if (joined) {
      await supabase.from('community_members').delete().eq('community_id', c.id).eq('user_id', userId)
    } else {
      await supabase.from('community_members').insert({ community_id: c.id, user_id: userId })
    }
    await load()
  }

  async function openWall(id: string) {
    if (openId === id) {
      setOpenId(null)
      return
    }
    setOpenId(id)
    setMsg('')
    await loadPosts(id)
  }

  async function addPost(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !openId || !text.trim()) return
    const { error } = await supabase
      .from('community_posts')
      .insert({ community_id: openId, author_id: userId, content: text.trim() })
    if (error) {
      setMsg(error.message)
      return
    }
    setText('')
    await loadPosts(openId)
  }

  if (loading) return <main className="min-h-screen p-8 text-gray-400">Loading...</main>

  return (
    <main className="min-h-screen bg-gray-950">
      <header className="sticky top-0 px-4 py-3">
        <h1 className="text-xl font-bold">👥 Communities</h1>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        {list.map((c) => {
          const joined = c.community_members.some((m) => m.user_id === userId)
          return (
            <article key={c.id} className="rounded-2xl bg-gray-900 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-bold">
                    {c.icon} {c.name}
                  </h2>
                  <p className="text-sm text-gray-400">{c.description}</p>
                  <p className="text-xs text-gray-500">{c.community_members.length} members</p>
                </div>
                <button
                  onClick={() => toggleJoin(c)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${joined ? 'bg-gray-700' : 'bg-indigo-600'}`}
                >
                  {joined ? 'Joined' : 'Join'}
                </button>
              </div>
              <button onClick={() => openWall(c.id)} className="mt-3 text-sm font-semibold text-indigo-400">
                {openId === c.id ? 'Hide wall' : 'Open wall'}
              </button>

              {openId === c.id && (
                <div className="mt-3 space-y-2 border-t border-gray-800 pt-3">
                  {joined ? (
                    <form onSubmit={addPost} className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg bg-gray-800 p-2 text-sm"
                        placeholder="Post to this community..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                      />
                      <button className="rounded-lg bg-indigo-600 px-3 text-sm">Post</button>
                    </form>
                  ) : (
                    <p className="text-sm text-gray-400">Join this community to post.</p>
                  )}
                  {msg && <p className="text-sm text-red-400">{msg}</p>}
                  {posts.length === 0 && <p className="text-sm text-gray-500">No posts yet.</p>}
                  {posts.map((p) => (
                    <p key={p.id} className="text-sm">
                      <span className="font-semibold text-indigo-400">{p.profiles?.full_name ?? 'Student'}</span>{' '}
                      <span className="text-gray-300">{p.content}</span>
                    </p>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </main>
  )
}