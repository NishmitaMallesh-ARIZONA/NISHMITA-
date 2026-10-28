'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Tab = 'overview' | 'requests' | 'moderate' | 'notices' | 'people'

type EventReq = {
  id: string
  title: string
  description: string | null
  event_date: string
  venue: string | null
  club: string | null
  expected_size: number | null
  status: string
  admin_note: string | null
  profiles: { full_name: string | null; usn: string | null } | null
}
type PostRow = { id: string; content: string; category: string; profiles: { full_name: string | null } | null }
type ListingRow = { id: string; title: string; kind: string; profiles: { full_name: string | null } | null }
type Notice = { id: string; title: string; body: string | null; pinned: boolean }

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'requests', label: 'Event requests' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'notices', label: 'Announcements' },
  { id: 'people', label: 'People' },
]

export default function AdminPage() {
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [note, setNote] = useState('')

  const [stats, setStats] = useState<[string, number][]>([])
  const [requests, setRequests] = useState<EventReq[]>([])
  const [posts, setPosts] = useState<PostRow[]>([])
  const [listings, setListings] = useState<ListingRow[]>([])
  const [notices, setNotices] = useState<Notice[]>([])

  const [nTitle, setNTitle] = useState('')
  const [nBody, setNBody] = useState('')
  const [nPinned, setNPinned] = useState(true)
  const [roleUsn, setRoleUsn] = useState('')
  const [roleValue, setRoleValue] = useState('organiser')

  const loadStats = useCallback(async () => {
    const head = { count: 'exact' as const, head: true }
    const [u, po, co, li, ev, rs, ci, tm, ls, rc] = await Promise.all([
      supabase.from('profiles').select('id', head),
      supabase.from('posts').select('id', head),
      supabase.from('comments').select('id', head),
      supabase.from('likes').select('post_id', head),
      supabase.from('events').select('id', head),
      supabase.from('event_rsvps').select('event_id', head),
      supabase.from('event_rsvps').select('event_id', head).eq('attended', true),
      supabase.from('team_requests').select('id', head).eq('status', 'accepted'),
      supabase.from('listings').select('id', head),
      supabase.from('resources').select('id', head),
    ])
    setStats([
      ['Students', u.count ?? 0],
      ['Posts', po.count ?? 0],
      ['Comments', co.count ?? 0],
      ['Likes', li.count ?? 0],
      ['Events', ev.count ?? 0],
      ['RSVPs', rs.count ?? 0],
      ['Check-ins', ci.count ?? 0],
      ['Teams formed', tm.count ?? 0],
      ['Market items', ls.count ?? 0],
      ['Library files', rc.count ?? 0],
    ])
  }, [])

  const loadRequests = useCallback(async () => {
    const { data } = await supabase
      .from('event_requests')
      .select('id, title, description, event_date, venue, club, expected_size, status, admin_note, profiles!requester_id(full_name, usn)')
      .order('created_at', { ascending: false })
      .limit(30)
    setRequests((data ?? []) as unknown as EventReq[])
  }, [])

  const loadModeration = useCallback(async () => {
    const [p, l] = await Promise.all([
      supabase.from('posts').select('id, content, category, profiles!author_id(full_name)').order('created_at', { ascending: false }).limit(20),
      supabase.from('listings').select('id, title, kind, profiles!seller_id(full_name)').order('created_at', { ascending: false }).limit(20),
    ])
    setPosts((p.data ?? []) as unknown as PostRow[])
    setListings((l.data ?? []) as unknown as ListingRow[])
  }, [])

  const loadNotices = useCallback(async () => {
    const { data } = await supabase
      .from('announcements')
      .select('id, title, body, pinned')
      .order('created_at', { ascending: false })
      .limit(20)
    setNotices((data ?? []) as Notice[])
  }, [])

  useEffect(() => {
    async function init() {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        router.push('/login')
        return
      }
      setUserId(auth.user.id)
      const { data: p } = await supabase.from('profiles').select('is_admin').eq('id', auth.user.id).single()
      if (!p?.is_admin) {
        setLoading(false)
        return
      }
      setIsAdmin(true)
      await Promise.all([loadStats(), loadRequests(), loadModeration(), loadNotices()])
      setLoading(false)
    }
    init()
  }, [router, loadStats, loadRequests, loadModeration, loadNotices])

  async function approve(id: string) {
    setNote('')
    const { error } = await supabase.rpc('approve_event_request', { req_id: id })
    setNote(error ? error.message : 'Approved. The event is now live.')
    await Promise.all([loadRequests(), loadStats()])
  }

  async function reject(id: string) {
    const reason = window.prompt('Reason for rejecting (the student will see this):') ?? ''
    const { error } = await supabase.from('event_requests').update({ status: 'rejected', admin_note: reason.trim() }).eq('id', id)
    setNote(error ? error.message : 'Request rejected.')
    await loadRequests()
  }

  async function removePost(id: string) {
    if (!confirm('Delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    setNote(error ? error.message : 'Post deleted.')
    await Promise.all([loadModeration(), loadStats()])
  }

  async function removeListing(id: string) {
    if (!confirm('Delete this listing?')) return
    const { error } = await supabase.from('listings').delete().eq('id', id)
    setNote(error ? error.message : 'Listing deleted.')
    await Promise.all([loadModeration(), loadStats()])
  }

  async function addNotice(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    const { error } = await supabase
      .from('announcements')
      .insert({ title: nTitle.trim(), body: nBody.trim(), pinned: nPinned, created_by: userId })
    if (error) {
      setNote(error.message)
      return
    }
    setNTitle('')
    setNBody('')
    setNote('Announcement published.')
    await loadNotices()
  }

  async function removeNotice(id: string) {
    await supabase.from('announcements').delete().eq('id', id)
    await loadNotices()
  }

  async function changeRole(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.rpc('set_user_role', { p_usn: roleUsn, p_role: roleValue })
    setNote(error ? error.message : `Role updated: ${roleUsn.toUpperCase()} is now ${roleValue}.`)
    if (!error) setRoleUsn('')
  }

  if (loading) return <main className="min-h-screen p-8 text-gray-400">Loading...</main>

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-center text-gray-400">
        This page is for admins only.
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 px-4 py-3">
        <h1 className="text-xl font-bold">Admin panel</h1>
        <p className="text-xs">Off Campus</p>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id)
                setNote('')
              }}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold ${
                tab === t.id ? 'bg-indigo-600 text-[#fff]' : 'bg-gray-900 text-gray-300'
              }`}
            >
              {t.label}
              {t.id === 'requests' && requests.filter((r) => r.status === 'pending').length > 0
                ? ` (${requests.filter((r) => r.status === 'pending').length})`
                : ''}
            </button>
          ))}
        </div>

        {note && <p className="rounded-lg bg-gray-900 p-3 text-sm text-gray-300">{note}</p>}

        {tab === 'overview' && (
          <div className="grid grid-cols-2 gap-3">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-gray-900 p-4">
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-3">
            {requests.length === 0 && <p className="py-8 text-center text-gray-500">No event requests yet.</p>}
            {requests.map((r) => (
              <article key={r.id} className="rounded-2xl bg-gray-900 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold">{r.title}</h2>
                  <span
                    className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${
                      r.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : r.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  By {r.profiles?.full_name ?? 'Student'} ({r.profiles?.usn ?? 'no USN'}) · {new Date(r.event_date).toLocaleString()}
                  {r.venue ? ` · ${r.venue}` : ''}
                  {r.club ? ` · ${r.club}` : ''}
                  {r.expected_size ? ` · about ${r.expected_size} people` : ''}
                </p>
                {r.description && <p className="mt-2 text-sm text-gray-300">{r.description}</p>}
                {r.admin_note && <p className="mt-2 text-xs text-gray-400">Admin note: {r.admin_note}</p>}
                {r.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => approve(r.id)} className="flex-1 rounded-lg bg-green-600 p-2 text-sm font-semibold text-[#fff]">
                      Approve
                    </button>
                    <button onClick={() => reject(r.id)} className="flex-1 rounded-lg bg-gray-700 p-2 text-sm font-semibold">
                      Reject
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {tab === 'moderate' && (
          <div className="space-y-5">
            <section className="space-y-2">
              <h2 className="font-bold">Latest posts</h2>
              {posts.length === 0 && <p className="text-sm text-gray-500">No posts.</p>}
              {posts.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-3 rounded-xl bg-gray-900 p-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">
                      {p.profiles?.full_name ?? 'Student'} · {p.category}
                    </p>
                    <p className="break-words text-sm">{p.content}</p>
                  </div>
                  <button onClick={() => removePost(p.id)} className="flex-shrink-0 rounded-lg bg-gray-700 px-3 py-1 text-xs font-semibold">
                    Delete
                  </button>
                </div>
              ))}
            </section>
            <section className="space-y-2">
              <h2 className="font-bold">Latest market listings</h2>
              {listings.length === 0 && <p className="text-sm text-gray-500">No listings.</p>}
              {listings.map((l) => (
                <div key={l.id} className="flex items-start justify-between gap-3 rounded-xl bg-gray-900 p-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">
                      {l.profiles?.full_name ?? 'Student'} · {l.kind}
                    </p>
                    <p className="break-words text-sm">{l.title}</p>
                  </div>
                  <button onClick={() => removeListing(l.id)} className="flex-shrink-0 rounded-lg bg-gray-700 px-3 py-1 text-xs font-semibold">
                    Delete
                  </button>
                </div>
              ))}
            </section>
          </div>
        )}

        {tab === 'notices' && (
          <div className="space-y-4">
            <form onSubmit={addNotice} className="space-y-3 rounded-2xl bg-gray-900 p-4">
              <input className="w-full rounded-lg bg-gray-800 p-3 text-sm" placeholder="Title" value={nTitle} onChange={(e) => setNTitle(e.target.value)} required />
              <textarea className="w-full resize-none rounded-lg bg-gray-800 p-3 text-sm" rows={3} placeholder="Details (optional)" value={nBody} onChange={(e) => setNBody(e.target.value)} />
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={nPinned} onChange={(e) => setNPinned(e.target.checked)} />
                Pin to the top
              </label>
              <button className="w-full rounded-lg bg-indigo-600 p-3 text-sm font-semibold text-[#fff]">Publish announcement</button>
            </form>
            {notices.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 rounded-xl bg-gray-900 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {n.pinned ? '📌 ' : ''}
                    {n.title}
                  </p>
                  {n.body && <p className="break-words text-xs text-gray-400">{n.body}</p>}
                </div>
                <button onClick={() => removeNotice(n.id)} className="flex-shrink-0 rounded-lg bg-gray-700 px-3 py-1 text-xs font-semibold">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'people' && (
          <form onSubmit={changeRole} className="space-y-3 rounded-2xl bg-gray-900 p-4">
            <h2 className="font-bold">Change a student&apos;s role</h2>
            <p className="text-xs text-gray-400">
              Organisers can publish events directly. Faculty accounts get faculty tools later. Admin is set separately.
            </p>
            <input className="w-full rounded-lg bg-gray-800 p-3 text-sm uppercase placeholder:normal-case" placeholder="Student USN (e.g. 26EC012T)" value={roleUsn} onChange={(e) => setRoleUsn(e.target.value)} maxLength={12} required />
            <select className="w-full rounded-lg bg-gray-800 p-3 text-sm" value={roleValue} onChange={(e) => setRoleValue(e.target.value)}>
              <option value="organiser">Organiser (club lead)</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student (remove special role)</option>
            </select>
            <button className="w-full rounded-lg bg-indigo-600 p-3 text-sm font-semibold text-[#fff]">Update role</button>
          </form>
        )}
      </div>
    </main>
  )
}