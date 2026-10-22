'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

type Ticket = {
  event_id: string
  attended: boolean | null
  events: { title: string; event_date: string; venue: string | null } | null
}

export default function TicketsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [origin, setOrigin] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      setOrigin(window.location.origin)
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUserId(data.user.id)
      const { data: t } = await supabase
        .from('event_rsvps')
        .select('event_id, attended, events(title, event_date, venue)')
        .eq('user_id', data.user.id)
      setTickets((t ?? []) as unknown as Ticket[])
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) return <main className="min-h-screen p-8 text-gray-400">Loading...</main>

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 border-b border-gray-800 bg-gray-900 px-4 py-3">
        <h1 className="text-xl font-bold">🎟️ My tickets</h1>
      </header>
      <div className="mx-auto max-w-xl space-y-4 p-4">
        {tickets.length === 0 && <p className="py-8 text-center text-gray-500">RSVP to an event to get a ticket.</p>}
        {tickets.map((t) => (
          <div key={t.event_id} className="rounded-2xl bg-gray-900 p-4 text-center">
            <h2 className="text-lg font-bold">{t.events?.title}</h2>
            <p className="text-sm text-gray-400">
              {t.events ? new Date(t.events.event_date).toLocaleString() : ''}
              {t.events?.venue ? ` · ${t.events.venue}` : ''}
            </p>
            <div className="mt-3 inline-block rounded-xl bg-white p-3">
              <QRCodeSVG value={`${origin}/checkin?e=${t.event_id}&u=${userId}`} size={160} />
            </div>
            <p className={`mt-2 text-sm font-semibold ${t.attended ? 'text-green-400' : 'text-gray-400'}`}>
              {t.attended ? '✅ Checked in' : 'Show this QR at the entrance'}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}