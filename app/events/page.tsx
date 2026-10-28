'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'


type EventItem = {
  id: string
  title: string
  description: string | null
  event_date: string
  venue: string | null
  club: string | null
  created_by: string | null
  event_rsvps: { user_id: string }[]
}

type MyReq = {
  id: string
  title: string
  event_date: string
  status: string
  admin_note: string | null
}

export default function EventsPage() {
  const [supabase,setSupabase] = useState<any>(null)
  useEffect(() => {
    setSupabase(createClient())
  }, [])
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [canPublish, setCanPublish] = useState(false)
  const [events, setEvents] = useState<EventItem[]>([])
  const [myRequests, setMyRequests] = useState<MyReq[]>([])
  const [showPast, setShowPast] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [venue, setVenue] = useState('')
  const [club, setClub] = useState('')
  const [size, setSize] = useState('')
  const [msg, setMsg] = useState('')

  const loadEvents = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase
      .from('events')
      .select('id, title, description, event_date, venue, club, created_by, event_rsvps(user_id)')
      .order('event_date', { ascending: true })
    setEvents((data ?? []) as unknown as EventItem[])
  }, [])

  const loadRequests = useCallback(async (uid: string) => {
    if (!supabase) return
    const { data } = await supabase
      .from('event_requests')
      .select('id, title, event_date, status, admin_note')
      .eq('requester_id', uid)
      .order('created_at', { ascending: false })
      .limit(10)
    setMyRequests((data ?? []) as MyReq[])
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
      const { data: p } = await supabase.from('profiles').select('is_admin, role').eq('id', uid).single()
      const admin = !!p?.is_admin
      setIsAdmin(admin)
      setCanPublish(admin || p?.role === 'organiser')
      await Promise.all([loadEvents(), loadRequests(uid)])
      setLoading(false)
    }
    init()
  }, [router, loadEvents, loadRequests])

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setMsg('')
    const when = new Date(eventDate).toISOString()

    if (canPublish) {
      const { error } = await supabase.from('events').insert({
        title: title.trim(),
        description: description.trim(),
        event_date: when,
        venue: venue.trim(),
        club: club.trim(),
      })
      if (error) {
        setMsg(error.message)
        return
      }
      setMsg('Event published.')
      await loadEvents()
    } else {
      const { error } = await supabase.from('event_requests').insert({
        requester_id: userId,
        title: title.trim(),
        description: description.trim(),
        event_date: when,
        venue: venue.trim(),
        club: club.trim(),
        expected_size: size ? Number(size) : null,
      })
      if (error) {
        setMsg(error.message)
        return
      }
      setMsg('Request sent. An admin will review it and you will see the result below.')
      await loadRequests(userId)
    }
    setTitle('')
    setDescription('')
    setEventDate('')
    setVenue('')
    setClub('')
    setSize('')
    setShowForm(false)
  }

  async function toggleRsvp(ev: EventItem) {
    if (!userId) return
    const going = ev.event_rsvps.some((r) => r.user_id === userId)
    if (going) {
      await supabase.from('event_rsvps').delete().eq('event_id', ev.id).eq('user_id', userId)
    } else {
      await supabase.from('event_rsvps').insert({ event_id: ev.id, user_id: userId })
    }
    await loadEvents()
  }

  if (loading) return <main className="min-h-screen p-8 text-gray-400">Loading...</main>

  const cutoff = Date.now() - 3 * 60 * 60 * 1000
  const upcoming = events.filter((e) => new Date(e.event_date).getTime() >= cutoff)
  const past = events.filter((e) => new Date(e.event_date).getTime() < cutoff).reverse()
  const shown = showPast ? [...upcoming, ...past] : upcoming

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold">Events</h1>
        {isAdmin && (
          <Link href="/admin" className="text-sm font-semibold">
            Admin panel
          </Link>
        )}
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        <button onClick={() => setShowForm(!showForm)} className="w-full rounded-xl bg-indigo-600 p-3 font-semibold text-[#fff]">
          {showForm ? 'Cancel' : canPublish ? '+ Create event' : '+ Request an event'}
        </button>

        {!canPublish && !showForm && (
          <p className="text-xs text-gray-400">
            Only admins and club organisers publish events. Send a request and an admin will review it.
          </p>
        )}

        {msg && <p className="rounded-lg bg-gray-900 p-3 text-sm text-gray-300">{msg}</p>}

        {showForm && (
          <form onSubmit={submitForm} className="space-y-3 rounded-2xl bg-gray-900 p-4">
            <input className="w-full rounded-lg bg-gray-800 p-3 text-sm" placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea className="w-full resize-none rounded-lg bg-gray-800 p-3 text-sm" rows={3} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input className="w-full rounded-lg bg-gray-800 p-3 text-sm" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
            <input className="w-full rounded-lg bg-gray-800 p-3 text-sm" placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
            <input className="w-full rounded-lg bg-gray-800 p-3 text-sm" placeholder="Club / Department" value={club} onChange={(e) => setClub(e.target.value)} />
            {!canPublish && (
              <input className="w-full rounded-lg bg-gray-800 p-3 text-sm" type="number" min="1" placeholder="Expected number of people" value={size} onChange={(e) => setSize(e.target.value)} />
            )}
            <button className="w-full rounded-lg bg-indigo-600 p-3 text-sm font-semibold text-[#fff]">
              {canPublish ? 'Publish event' : 'Send request'}
            </button>
          </form>
        )}

        {myRequests.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-bold">My event requests</h2>
            {myRequests.map((r) => (
              <div key={r.id} className="rounded-xl bg-gray-900 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{r.title}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
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
                <p className="text-xs text-gray-400">{new Date(r.event_date).toLocaleString()}</p>
                {r.admin_note && <p className="mt-1 text-xs text-gray-400">Admin note: {r.admin_note}</p>}
              </div>
            ))}
          </section>
        )}

        {shown.length === 0 && <p className="py-8 text-center text-gray-500">No upcoming events yet.</p>}

        {shown.map((ev) => {
          const going = ev.event_rsvps.some((r) => r.user_id === userId)
          const isPast = new Date(ev.event_date).getTime() < cutoff
          return (
            <article key={ev.id} className={`rounded-2xl bg-gray-900 p-4 ${isPast ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold">{ev.title}</h2>
                {ev.club && (
                  <span className="whitespace-nowrap rounded-full bg-indigo-900 px-2 py-1 text-xs text-indigo-200">{ev.club}</span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-400">
                📅 {new Date(ev.event_date).toLocaleString()}
                {ev.venue ? `  ·  📍 ${ev.venue}` : ''}
              </p>
              {ev.description && <p className="mt-2 whitespace-pre-wrap text-gray-200">{ev.description}</p>}
              {ev.created_by === userId && (
                <p className="mt-2 text-xs font-semibold text-indigo-400">
                  You are the organiser. Scan students&apos; QR tickets with your phone camera to check them in.
                </p>
              )}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-sm text-gray-400">{ev.event_rsvps.length} going</span>
                {!isPast && (
                  <div className="flex items-center gap-2">
                    {going && (
                      <Link href="/tickets" className="rounded-lg bg-gray-700 px-3 py-2 text-sm font-semibold">
                        🎟️ Ticket
                      </Link>
                    )}
                    <button
                      onClick={() => toggleRsvp(ev)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold text-[#fff] ${going ? 'bg-green-600' : 'bg-indigo-600'}`}
                    >
                      {going ? '✓ Going' : 'RSVP'}
                    </button>
                  </div>
                )}
              </div>
              {going && !isPast && <p className="mt-1 text-right text-[10px] text-gray-500">Tap Going to cancel</p>}
            </article>
          )
        })}

        {past.length > 0 && (
          <button onClick={() => setShowPast(!showPast)} className="w-full text-center text-sm text-gray-400">
            {showPast ? 'Hide past events' : `Show past events (${past.length})`}
          </button>
        )}
      </div>
    </main>
  )
}