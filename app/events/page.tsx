'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Event = {
  id: string
  title: string
  description: string | null
  location: string | null
  venue: string | null
  club: string | null
  event_date: string | null
  rsvpd?: boolean
}

export default function EventsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        router.push('/login')
        return
      }
      const uid = authData.user.id
      setUserId(uid)

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      const { data: rsvpData } = await supabase
        .from('event_rsvps')
        .select('event_id')
        .eq('user_id', uid)

      const rsvpSet = new Set((rsvpData ?? []).map((r) => r.event_id))

      const formatted = ((eventsData ?? []) as Event[]).map((e) => ({
        ...e,
        rsvpd: rsvpSet.has(e.id),
      }))

      setEvents(formatted)
      setLoading(false)
    }

    loadEvents()
  }, [router, supabase])

  async function toggleRsvp(eventId: string, currentRsvp: boolean) {
    if (!userId) return

    if (currentRsvp) {
      await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)

      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, rsvpd: false } : e))
      )
    } else {
      await supabase.from('event_rsvps').insert({
        event_id: eventId,
        user_id: userId,
        status: 'attending',
      })

      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, rsvpd: true } : e))
      )
    }
  }

  if (loading) {
    return <main className="min-h-screen p-8 text-gray-400">Loading events...</main>
  }

  return (
    <main className="min-h-screen bg-gray-950 pb-24 text-white">
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/80 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-bold">Upcoming Events 📅</h1>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        {events.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No events scheduled right now.</p>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-white">{ev.title}</h2>
                  {ev.club && (
                    <span className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                      {ev.club}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => toggleRsvp(ev.id, !!ev.rsvpd)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                    ev.rsvpd
                      ? 'bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600/30'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {ev.rsvpd ? 'RSVP’d ✓' : 'RSVP'}
                </button>
              </div>

              {ev.description && (
                <p className="text-sm text-gray-300 leading-relaxed">{ev.description}</p>
              )}

              <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-800 text-xs text-gray-400">
                {(ev.venue || ev.location) && (
                  <span>📍 {ev.venue || ev.location}</span>
                )}
                {ev.event_date && (
                  <span>
                    🕒 {new Date(ev.event_date).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}