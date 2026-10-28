'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

const PAGE = 20
const CATEGORIES = ['general', 'announcement', 'lost-found', 'hackathon', 'project-help']
const SELECT =
  'id, content, category, created_at, author_id, audience, audience_year, audience_branch, profiles!author_id(full_name), likes(user_id), comments(id)'

const ordinal = (n: number) => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`)

type Tab = 'general' | 'year' | 'branch'
type Audience = 'all' | 'year' | 'branch'

type Post = {
  id: string
  content: string
  category: string
  created_at: string
  author_id: string
  audience: Audience
  audience_year: number | null
  audience_branch: string | null
  profiles: { full_name: string | null } | null
  likes: { user_id: string }[]
  comments: { id: string }[]
}

type Comment = { id: string; content: string; profiles: { full_name: string | null } | null }
type Notice = { id: string; title: string; body: string | null; pinned: boolean }
type Me = { name: string; usn: string; branch: string; semester: number | null; year: number | null; avatarUrl: string; isAdmin: boolean }

function Comments({ postId, userId, onAdded }: { postId: string; userId: string; onAdded: () => void }) {
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
    const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: userId, content: text.trim() })
    if (error) return
    setText('')
    await load()
    onAdded()
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
        <input className="flex-1 p-2 rounded-lg bg-gray-800 text-sm" placeholder="Write a comment..." value={text} onChange={(e) => setText(e.target.value)} />
        <button className="px-3 rounded-lg bg-indigo-600 text-sm">Send</button>
      </form>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [me, setMe] = useState<Me>({ name: '', usn: '', branch: '', semester: null, year: null, avatarUrl: '', isAdmin: false })
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<Tab>('general')
  const [cat, setCat] = useState('all')
  const [posts, setPosts] = useState<Post[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [notices, setNotices] = useState<Notice[]>([])
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [audience, setAudience] = useState<Audience>('all')
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [feedError, setFeedError] = useState('')
  const [newCount, setNewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const lastPost = useRef(0)

  const fetchPosts = useCallback(
    async (offset: number): Promise<{ rows: Post[]; error: { message: string } | null }> => {
      let q = supabase.from('posts').select(SELECT)
      if (tab === 'general') {
        q = q.eq('audience', 'all')
      } else if (tab === 'year') {
        if (!me.year) return { rows: [], error: null }
        q = q.eq('audience', 'year').eq('audience_year', me.year)
      } else {
        if (!me.branch) return { rows: [], error: null }
        q = q.eq('audience', 'branch').eq('audience_branch', me.branch)
      }
      if (cat !== 'all') q = q.eq('category', cat)
      const { data, error } = await q.order('created_at', { ascending: false }).range(offset, offset + PAGE - 1)
      return { rows: (data ?? []) as unknown as Post[], error }
    },
    [tab, cat, me.year, me.branch]
  )

  const reload = useCallback(async () => {
    const { rows, error } = await fetchPosts(0)
    if (error) {
      setFeedError(error.message)
      return
    }
    setFeedError('')
    setPosts(rows)
    setHasMore(rows.length === PAGE)
    setNewCount(0)
  }, [fetchPosts])

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      const uid = data.user.id
      setUserId(uid)

      let prof: Record<string, unknown> | null = null
      const full = await supabase
        .from('profiles')
        .select('full_name, usn, department, year, semester, avatar_url, is_admin')
        .eq('id', uid)
        .single()
      if (full.error) {
        const basic = await supabase.from('profiles').select('full_name, usn, department, year, avatar_url, is_admin').eq('id', uid).single()
        prof = basic.data as Record<string, unknown> | null
      } else {
        prof = full.data as Record<string, unknown> | null
      }
      const sem = (prof?.semester as number) ?? null
      const yr = (prof?.year as number) ?? (sem ? Math.ceil(sem / 2) : null)
      setMe({
        name: (prof?.full_name as string) || (data.user.email ?? '').split('@')[0] || 'Student',
        usn: (prof?.usn as string) || '',
        branch: ((prof?.department as string) || '').toUpperCase(),
        semester: sem,
        year: yr,
        avatarUrl: (prof?.avatar_url as string) || '',
        isAdmin: !!prof?.is_admin,
      })

      const n = await supabase
        .from('announcements')
        .select('id, title, body, pinned')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3)
      if (!n.error) setNotices((n.data ?? []) as Notice[])

      setReady(true)
      setLoading(false)
    }
    init()
  }, [router])

  useEffect(() => {
    if (ready) reload()
  }, [ready, reload])

  // live "new posts" button instead of reloading the whole feed
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('new-posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        const author = (payload.new as { author_id?: string }).author_id
        if (author !== userId) setNewCount((c) => c + 1)
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function loadMore() {
    setLoadingMore(true)
    const { rows, error } = await fetchPosts(posts.length)
    setLoadingMore(false)
    if (error) {
      setFeedError(error.message)
      return
    }
    setPosts((prev) => {
      const seen = new Set(prev.map((p) => p.id))
      return [...prev, ...rows.filter((r) => !seen.has(r.id))]
    })
    setHasMore(rows.length === PAGE)
  }

  async function addPost(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !userId) return
    if (Date.now() - lastPost.current < 15000) {
      setFeedError('Please wait a few seconds before posting again.')
      return
    }
    if (audience === 'year' && !me.year) {
      setFeedError('Set your semester on the Me tab to post to your year.')
      return
    }
    if (audience === 'branch' && !me.branch) {
      setFeedError('Set your branch on the Me tab to post to your branch.')
      return
    }
    const { error } = await supabase.from('posts').insert({
      author_id: userId,
      content: content.trim(),
      category,
      audience,
      audience_year: audience === 'year' ? me.year : null,
      audience_branch: audience === 'branch' ? me.branch : null,
    })
    if (error) {
      setFeedError(error.message)
      return
    }
    lastPost.current = Date.now()
    setContent('')
    setFeedError('')
    const target: Tab = audience === 'all' ? 'general' : audience
    setCat('all')
    if (target === tab && cat === 'all') await reload()
    else setTab(target)
  }

  async function toggleLike(post: Post) {
    if (!userId) return
    const liked = post.likes.some((l) => l.user_id === userId)
    setPosts((ps) =>
      ps.map((p) =>
        p.id === post.id
          ? { ...p, likes: liked ? p.likes.filter((l) => l.user_id !== userId) : [...p.likes, { user_id: userId }] }
          : p
      )
    )
    const { error } = liked
      ? await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', userId)
      : await supabase.from('likes').insert({ post_id: post.id, user_id: userId })
    if (error) {
      setFeedError(error.message)
      await reload()
    }
  }

  async function removePost(id: string) {
    if (!confirm('Delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) {
      setFeedError(error.message)
      return
    }
    setPosts((ps) => ps.filter((p) => p.id !== id))
  }

  function bumpComment(postId: string) {
    setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, { id: 'new-' + Date.now() }] } : p)))
  }

  if (loading) {
    return <main className="min-h-screen bg-gray-950 text-gray-400 p-8">Loading...</main>
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'year', label: me.year ? `My year (${ordinal(me.year)})` : 'My year' },
    { id: 'branch', label: me.branch ? `My branch (${me.branch})` : 'My branch' },
  ]

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gradient-to-r from-indigo-950 via-slate-900 to-gray-950 border-b border-indigo-900/40 px-4 pt-3 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icon-192.png" alt="Off Campus Logo" className="w-10 h-10 rounded-xl shadow-md border border-indigo-500/30 object-cover" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">Off Campus</h1>
              <p className="text-[11px] text-indigo-300 font-medium tracking-wide mt-1">East West Institute of Technology</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live
          </span>
        </div>

        <div className="mt-4 bg-gradient-to-br from-indigo-900/40 to-slate-900/80 rounded-2xl p-4 border border-indigo-500/20 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Student Portal</p>
              <h2 className="text-lg font-bold text-white mt-0.5 truncate">Hello, {me.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-300">
                <span className="font-mono bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-700/40">USN: {me.usn || 'Not set'}</span>
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
              {me.avatarUrl ? <img src={me.avatarUrl} alt={me.name} className="w-full h-full object-cover" /> : me.name.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* feed tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t.id ? 'bg-indigo-600' : 'bg-gray-900 text-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* post box */}
        <form onSubmit={addPost} className="bg-gray-900 p-4 rounded-2xl space-y-3">
          <textarea
            className="w-full p-3 rounded-lg bg-gray-800 resize-none"
            rows={3}
            placeholder="Share something with your campus..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex gap-2">
            <select className="flex-1 p-2 rounded-lg bg-gray-800 text-sm" value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>
              <option value="all">Everyone</option>
              <option value="year">{me.year ? `My year only (${ordinal(me.year)})` : 'My year (set semester first)'}</option>
              <option value="branch">{me.branch ? `My branch only (${me.branch})` : 'My branch (set branch first)'}</option>
            </select>
            <select className="flex-1 p-2 rounded-lg bg-gray-800 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button className="px-5 rounded-lg bg-indigo-600 font-semibold">Post</button>
          </div>
        </form>

        {/* category filter */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${cat === c ? 'bg-indigo-600' : 'bg-gray-900 text-gray-300'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* official announcements */}
        {tab === 'general' && cat === 'all' &&
          notices.map((n) => (
            <div key={n.id} className="rounded-2xl bg-gray-900 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">{n.pinned ? '📌 Official announcement' : 'Announcement'}</p>
              <p className="mt-1 font-semibold">{n.title}</p>
              {n.body && <p className="mt-1 whitespace-pre-wrap text-sm text-gray-300">{n.body}</p>}
            </div>
          ))}

        {newCount > 0 && (
          <button onClick={reload} className="w-full rounded-full bg-indigo-600 p-2 text-sm font-semibold">
            ↑ {newCount} new post{newCount > 1 ? 's' : ''}
          </button>
        )}

        {feedError && <p className="text-sm text-red-400 bg-red-950 p-3 rounded-lg">Problem: {feedError}</p>}

        {tab === 'year' && !me.year && (
          <p className="rounded-xl bg-yellow-950 p-3 text-sm text-yellow-300">Set your semester on the Me tab to see your year&apos;s feed.</p>
        )}
        {tab === 'branch' && !me.branch && (
          <p className="rounded-xl bg-yellow-950 p-3 text-sm text-yellow-300">Set your branch on the Me tab to see your branch feed.</p>
        )}

        {posts.length === 0 && !feedError && !(tab === 'year' && !me.year) && !(tab === 'branch' && !me.branch) && (
          <p className="text-center text-gray-500 py-8">No posts here yet. Be the first to post!</p>
        )}

        {posts.map((post) => {
          const liked = post.likes.some((l) => l.user_id === userId)
          const canDelete = me.isAdmin || post.author_id === userId
          return (
            <article key={post.id} className="bg-gray-900 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="font-semibold">{post.profiles?.full_name ?? 'Student'}</span>
                <span className="flex items-center gap-1.5">
                  {post.audience === 'year' && post.audience_year && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300">{ordinal(post.audience_year)} year</span>
                  )}
                  {post.audience === 'branch' && post.audience_branch && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300">{post.audience_branch}</span>
                  )}
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-900 text-indigo-200">{post.category}</span>
                </span>
              </div>
              <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(post.created_at).toLocaleString()}</p>
              <div className="flex gap-4 mt-3 text-sm">
                <button onClick={() => toggleLike(post)} className={liked ? 'text-pink-400' : 'text-gray-400'}>
                  {liked ? '♥' : '♡'} {post.likes.length}
                </button>
                <button onClick={() => setOpenComments(openComments === post.id ? null : post.id)} className="text-gray-400">
                  💬 {post.comments.length}
                </button>
                {canDelete && (
                  <button onClick={() => removePost(post.id)} className="ml-auto text-gray-400">
                    Delete
                  </button>
                )}
              </div>
              {openComments === post.id && userId && <Comments postId={post.id} userId={userId} onAdded={() => bumpComment(post.id)} />}
            </article>
          )
        })}

        {hasMore && (
          <button onClick={loadMore} disabled={loadingMore} className="w-full rounded-xl bg-gray-900 p-3 text-sm font-semibold text-gray-300 disabled:opacity-50">
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        )}
      </div>
    </main>
  )
}