'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'


function CheckIn() {
  const params = useSearchParams()
  const router = useRouter()
  const eventId = params.get('e')
  const attendeeId = params.get('u')
  const [state, setState] = useState<'working' | 'ok' | 'bad'>('working')
  const [info, setInfo] = useState('')
  const[supabase, setSupabase] = useState<any>(null)
  useEffect(() => {
    setSupabase(createClient())
  }, [])
  useEffect(() => {
    async function run() {
      if (!supabase) return
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      if (!eventId || !attendeeId) {
        setState('bad')
        setInfo('Invalid ticket.')
        return
      }
      const { data: ev } = await supabase.from('events').select('title, created_by').eq('id', eventId).single()
      if (!ev) {
        setState('bad')
        setInfo('Event not found.')
        return
      }
      if (ev.created_by !== data.user.id) {
        setState('bad')
        setInfo(`Only the organiser of "${ev.title}" can check people in.`)
        return
      }
      const { data: who } = await supabase.from('profiles').select('full_name').eq('id', attendeeId).single()
      const { data: updated, error } = await supabase
        .from('event_rsvps')
        .update({ attended: true })
        .eq('event_id', eventId)
        .eq('user_id', attendeeId)
        .select()
      if (error || !updated || updated.length === 0) {
        setState('bad')
        setInfo('No RSVP found for this student.')
        return
      }
      setState('ok')
      setInfo(`${who?.full_name ?? 'Student'} is checked in to ${ev.title}`)
    }
    run()
  }, [eventId, attendeeId, router,supabase])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-center text-white">
      <div>
        <p className="text-6xl">{state === 'working' ? '⏳' : state === 'ok' ? '✅' : '⚠️'}</p>
        <p className="mt-4 text-xl font-semibold">{state === 'working' ? 'Checking ticket...' : info}</p>
      </div>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen p-8 text-gray-400">Loading...</main>}>
      <CheckIn />
    </Suspense>
  )
}