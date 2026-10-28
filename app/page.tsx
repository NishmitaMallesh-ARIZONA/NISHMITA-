'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Post {
  id: string
  author: string
  tag: string
  content: string
  timestamp: string
  likes: number
  comments: number
  userLiked?: boolean
}

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    author: 'Sana Khan',
    tag: 'general',
    content: 'Nishanth, are the notes for basic electronics uploaded on the library portal?',
    timestamp: '23/10/2026, 07:57:32',
    likes: 0,
    comments: 0
  },
  {
    id: '2',
    author: 'Aarav Mehta',
    tag: 'hackathon',
    content: 'Hackathon team forming! Need one backend and one UI designer for YUKTI 2026. Reply here.',
    timestamp: '22/10/2026, 22:16:18',
    likes: 1,
    comments: 2
  },
  {
    id: '3',
    author: 'Rohan Das',
    tag: 'events',
    content: 'Reminder: Project exhibition prep session starts today at 3 PM in Seminar Hall 2.',
    timestamp: '22/10/2026, 14:10:05',
    likes: 4,
    comments: 1
  }
]

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState({
    name: 'Nishmita Mallesh',
    usn: '26CS159T',
    dept: 'Dept of CSE',
    branchCode: 'CSE',
    year: '1st',
    email: ''
  })

  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS)
  const [postContent, setPostContent] = useState('')
  const [selectedAudience, setSelectedAudience] = useState('Everyone')
  const [selectedTag, setSelectedTag] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const email = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('demo_user_email') : '') || ''

        if (email) {
          const savedData = typeof window !== 'undefined' ? localStorage.getItem(`off_campus_profile_${email}`) : null
          if (savedData) {
            const parsed = JSON.parse(savedData)
            setCurrentUser({
              name: parsed.name || 'Student Member',
              usn: parsed.usn || '26CS159T',
              dept: parsed.branchCode ? `Dept of ${parsed.branchCode}` : 'Dept of CSE',
              branchCode: parsed.branchCode || 'CSE',
              year: parsed.year ? parsed.year.split(' ')[0] : '1st',
              email: email
            })
          } else {
            const derivedName = user?.user_metadata?.full_name || 
              email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
            const derivedUSN = user?.user_metadata?.usn || email.split('@')[0].toUpperCase().slice(0, 10)

            setCurrentUser({
              name: derivedName || 'Nishmita Mallesh',
              usn: derivedUSN || '26CS159T',
              dept: 'Dept of CSE',
              branchCode: 'CSE',
              year: '1st',
              email: email
            })
          }
        }
      } catch (err) {
        console.error('Session load error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postContent.trim()) return

    setSubmitting(true)
    const now = new Date()
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}, ${now.toLocaleTimeString('en-GB')}`

    const newPost: Post = {
      id: Date.now().toString(),
      author: currentUser.name,
      tag: selectedTag,
      content: postContent.trim(),
      timestamp: formattedDate,
      likes: 0,
      comments: 0
    }

    setPosts([newPost, ...posts])
    setPostContent('')
    setSubmitting(false)
  }

  const handleToggleLike = (id: string) => {
    setPosts(posts.map((p) => {
      if (p.id === id) {
        const liked = p.userLiked
        return {
          ...p,
          likes: liked ? p.likes - 1 : p.likes + 1,
          userLiked: !liked
        }
      }
      return p
    }))
  }

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F4F5FB] flex items-center justify-center text-slate-500 text-xs font-semibold">
        Loading feed...
      </main>
    )
  }

  const filteredPosts = activeFilter === 'all' 
    ? posts 
    : posts.filter((p) => p.tag.toLowerCase() === activeFilter.toLowerCase())

  return (
    <main className="min-h-screen bg-[#F4F5FB] text-slate-900 pb-28">
      {/* 1. TOP HEADER BRANDING */}
      <header className="bg-gradient-to-r from-[#2B0E68] via-[#3B158A] to-[#4C1D95] text-white px-4 pt-3.5 pb-4 shadow-md sticky top-0 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/icon-192.png"
              alt="Off Campus Logo"
              className="w-9 h-9 rounded-xl shadow-md border border-white/20 object-cover bg-white/10"
            />
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">
                Off Campus
              </h1>
              <p className="text-[11px] text-purple-200 font-medium tracking-wide mt-1">
                East West Institute of Technology
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live
          </span>
        </div>
      </header>

      <div className="max-w-md mx-auto px-3.5 pt-3 space-y-3.5">
        {/* Quick Filter Pill Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            My year ({currentUser.year})
          </button>
          <button
            onClick={() => setActiveFilter(currentUser.branchCode.toLowerCase())}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
              activeFilter === currentUser.branchCode.toLowerCase()
                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            My branch ({currentUser.branchCode})
          </button>
        </div>

        {/* 2. SHARE SOMETHING / POST CREATION BOX */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
          <form onSubmit={handleAddPost} className="space-y-3">
            <textarea
              rows={3}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share something with your campus..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#7C3AED] resize-none"
            />

            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Audience Dropdown */}
                <select
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="Everyone">Everyone</option>
                  <option value="My Year">My Year ({currentUser.year})</option>
                  <option value="My Branch">My Branch ({currentUser.branchCode})</option>
                </select>

                {/* Tag Dropdown */}
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="general">general</option>
                  <option value="hackathon">hackathon</option>
                  <option value="project-help">project-help</option>
                  <option value="lost-found">lost-found</option>
                  <option value="events">events</option>
                </select>
              </div>

              {/* Post Button */}
              <button
                type="submit"
                disabled={submitting || !postContent.trim()}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-purple-300 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
              >
                Post
              </button>
            </div>
          </form>

          {/* Quick Tag Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-100 mt-3 scrollbar-none">
            {['general', 'lost-found', 'hackathon', 'project-help', 'events'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSelectedTag(tag)
                  setActiveFilter(tag)
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all whitespace-nowrap ${
                  selectedTag === tag
                    ? 'bg-purple-50 text-[#7C3AED] border-purple-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 3. STUDENT PORTAL IDENTITY CARD (BELOW POST BOX) */}
        <div className="bg-gradient-to-br from-[#2B0E68] via-[#3B158A] to-[#4C1D95] rounded-3xl p-4 border border-purple-300/20 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                STUDENT PORTAL
              </p>
              <h2 className="text-base font-extrabold text-white mt-0.5">
                Hello, {currentUser.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-purple-200 font-medium flex-wrap">
                <span className="font-mono bg-purple-950/70 px-2 py-0.5 rounded border border-purple-400/20">
                  {currentUser.usn}
                </span>
                <span>•</span>
                <span>{currentUser.dept}</span>
                <span>•</span>
                <span>EWIT</span>
              </div>
            </div>

            {/* Logo Badge */}
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border-2 border-purple-300/40 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src="/icon-192.png"
                alt="EWIT Badge"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* 4. POSTS FEED LIST */}
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-[#7C3AED] font-black text-xs">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {post.author}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {post.timestamp}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7C3AED] border border-purple-100">
                  {post.tag}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                {post.content}
              </p>

              <div className="flex items-center justify-between pt-1 text-slate-500 text-xs border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 font-semibold transition-colors active:scale-95 ${
                      post.userLiked ? 'text-rose-500' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 ${post.userLiked ? 'fill-current text-rose-500' : 'fill-none stroke-current'}`}
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{post.likes}</span>
                  </button>

                  <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>{post.comments}</span>
                  </div>
                </div>

                {post.author === currentUser.name && (
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}