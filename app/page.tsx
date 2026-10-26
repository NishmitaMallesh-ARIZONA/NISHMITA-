'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

const CATEGORIES = ['general', 'announcement', 'lost-found', 'hackathon', 'project-help']

const ordinal = (n: number) => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`)

type Post = {
  id: string
  content: string
  category: string
  created_at: string
  author_id: string
  profiles: { full_name: string | null } | null
  likes: { user_id: string }[]
  comments: { id: string }[]
}

type Comment = {
  id: string
  content: string
  profiles: { full_name: string | null } | null
}

type Me = {
  name: string
  usn: string
  branch: string
  semester: number | null
  avatarUrl: string
}

function Comments({ postId, userId, onChange }: { postId: string; userId: string; onChange: () => void }) {
  const [items, setItems] = useState<Comment[]>([])
  const [text, setText] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('id, content, profiles!user_id(full_name)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    setItems((data ?? []) as unknown as Comment[])
  }, [postId])

  useEffect(() => {
    load()
  }, [load])

  async function addComment(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await supabase.from('comments').insert({ post_id: postId, user_id: userId, content: text.trim() })
    setText('')
    await load()
    onChange()
  }

  return (
    <div className="mt-3 space-y-2 border-t border-gray-800 pt-3">
      {items.map((c) => (
        <p key={c.id} className="text-sm">
          <span className="font-semibold text-indigo-300">{c.profiles?.full_name ?? 'Student'}</span>{' '}
          <span className="text-gray-300">{c.content}</span>
        </p>
      ))}
      <form onSubmit={addComment} className="flex gap-2">
        <input
          className="flex-1 p-2 rounded-lg bg-gray-800 text-sm"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="px-3 rounded-lg bg-indigo-600 text-sm">Send</button>
      </form>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [me, setMe] = useState<Me>({ name: '', usn: '', branch: '', semester: null, avatarUrl: '' })
  const [posts, setPosts] = useState<Post[]>([])
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedError, setFeedError] = useState('')

  const loadPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, content, category, created_at, author_id, profiles!author_id(full_name), likes(user_id), comments(id)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) {
      console.error(error)
      setFeedError(error.message)
      return
    }
    setFeedError('')
    setPosts((data ?? []) as unknown as Post[])
  }, [])

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      const uid = data.user.id
      setUserId(uid)

      // load this account's own profile (name, USN, branch, semester, photo)
      let prof: Record<string, unknown> | null = null
      const full = await supabase
        .from('profiles')
        .select('full_name, usn, department, semester, avatar_url')
        .eq('id', uid)
        .single()
      if (full.error) {
        const basic = await supabase
          .from('profiles')
          .select('full_name, usn, department, avatar_url')
          .eq('id', uid)
          .single()
        prof = basic.data as Record<string, unknown> | null
      } else {
        prof = full.data as Record<string, unknown> | null
      }

      setMe({
        name: (prof?.full_name as string) || (data.user.email ?? '').split('@')[0] || 'Student',
        usn: (prof?.usn as string) || '',
        branch: (prof?.department as string) || '',
        semester: (prof?.semester as number) ?? null,
        avatarUrl: (prof?.avatar_url as string) || '',
      })

      await loadPosts()
      setLoading(false)
    }
    init()
  }, [router, loadPosts])

  useEffect(() => {
    const channel = supabase
      .channel('live-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => loadPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => loadPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => loadPosts())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadPosts])

  async function addPost(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !userId) return
    const { error } = await supabase.from('posts').insert({ author_id: userId, content: content.trim(), category })
    if (error) {
      setFeedError(error.message)
      return
    }
    setContent('')
    await loadPosts()
  }

  async function toggleLike(post: Post) {
    if (!userId) return
    const liked = post.likes.some((l) => l.user_id === userId)
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', userId)
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: userId })
    }
    await loadPosts()
  }

  if (loading) {
    return <main className="min-h-screen bg-gray-950 text-gray-400 p-8">Loading...</main>
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gradient-to-r from-indigo-950 via-slate-900 to-gray-950 border-b border-indigo-900/40 px-4 pt-3 pb-4">
        {/* Top branding row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="Off Campus Logo"
              className="w-10 h-10 rounded-xl shadow-md border border-indigo-500/30 object-cover"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">Off Campus</h1>
              <p className="text-[11px] text-indigo-300 font-medium tracking-wide mt-1">
                East West Institute of Technology
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live
          </span>
        </div>

        {/* Student profile card: this account's own details */}
        <div className="mt-4 bg-gradient-to-br from-indigo-900/40 to-slate-900/80 rounded-2xl p-4 border border-indigo-500/20 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Student Portal</p>
              <h2 className="text-lg font-bold text-white mt-0.5 truncate">Hello, {me.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-300">
                <span className="font-mono bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-700/40">
                  USN: {me.usn || 'Not set'}
                </span>
                <span className="text-gray-400">•</span>
                <span>{me.branch ? `Dept of ${me.branch}` : 'Branch not set'}</span>
                {me.semester && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>{ordinal(me.semester)} Sem</span>
                  </>
                )}
              </div>
            </div>

            <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-lg shadow-inner border-2 border-indigo-300/30 overflow-hidden">
              {me.avatarUrl ? (
                <img src={me.avatarUrl} alt={me.name} className="w-full h-full object-cover" />
              ) : (
                me.name.charAt(0).toUpperCase() || 'U'
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        <form onSubmit={addPost} className="bg-gray-900 p-4 rounded-2xl space-y-3">
          <textarea
            className="w-full p-3 rounded-lg bg-gray-800 resize-none"
            rows={3}
            placeholder="Share something with your campus..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              className="flex-1 p-2 rounded-lg bg-gray-800 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button className="px-5 rounded-lg bg-indigo-600 font-semibold">Post</button>
          </div>
        </form>

        {feedError && <p className="text-sm text-red-400 bg-red-950 p-3 rounded-lg">Problem: {feedError}</p>}

        {posts.length === 0 && !feedError && (
          <p className="text-center text-gray-500 py-8">No posts yet. Be the first to post!</p>
        )}

        {posts.map((post) => {
          const liked = post.likes.some((l) => l.user_id === userId)
          return (
            <article key={post.id} className="bg-gray-900 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{post.profiles?.full_name ?? 'Student'}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-900 text-indigo-200">{post.category}</span>
              </div>
              <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(post.created_at).toLocaleString()}</p>
              <div className="flex gap-4 mt-3 text-sm">
                <button onClick={() => toggleLike(post)} className={liked ? 'text-pink-400' : 'text-gray-400'}>
                  {liked ? '♥' : '♡'} {post.likes.length}
                </button>
                <button
                  onClick={() => setOpenComments(openComments === post.id ? null : post.id)}
                  className="text-gray-400"
                >
                  💬 {post.comments.length}
                </button>
              </div>
              {openComments === post.id && userId && (
                <Comments postId={post.id} userId={userId} onChange={loadPosts} />
              )}
            </article>
          )
        })}
      </div>
    </main>
  )
}