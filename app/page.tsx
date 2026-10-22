'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

const CATEGORIES = ['general', 'announcement', 'lost-found', 'hackathon', 'project-help']

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
      setUserId(data.user.id)
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
    const { error } = await supabase
      .from('posts')
      .insert({ author_id: userId, content: content.trim(), category })
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

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <main className="min-h-screen bg-gray-950 text-gray-400 p-8">Loading...</main>
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">CampusCircle</h1>
          <span className="text-sm text-white font-semibold">Feed</span>
          <Link href="/events" className="text-sm text-indigo-300">
            Events
          </Link>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-white">
          Log out
        </button>
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

        {feedError && (
          <p className="text-sm text-red-400 bg-red-950 p-3 rounded-lg">
            Problem: {feedError}
          </p>
        )}

        {posts.length === 0 && !feedError && (
          <p className="text-center text-gray-500 py-8">No posts yet. Be the first to post!</p>
        )}

        {posts.map((post) => {
          const liked = post.likes.some((l) => l.user_id === userId)
          return (
            <article key={post.id} className="bg-gray-900 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{post.profiles?.full_name ?? 'Student'}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-900 text-indigo-200">
                  {post.category}
                </span>
              </div>
              <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(post.created_at).toLocaleString()}
              </p>
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

