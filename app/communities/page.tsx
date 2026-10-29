'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

type Community = {
  id: string
  name: string
  description: string | null
  icon: string | null
}

export default function CommunitiesPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)
  const [list, setList] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    setSupabase(createClient())
  }, [])

  const load = useCallback(async () => {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('id, name, description, icon')
        .order('name', { ascending: true })

      if (error) {
        setErrorMsg(error.message)
      } else {
        setList((data ?? []) as Community[])
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    async function init() {
      if (!supabase) return
      try {
        const { data } = await supabase.auth.getUser()
        if (!data?.user) {
          router.push('/login')
          return
        }
        await load()
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router, load, supabase])

  if (loading) {
    return <main className="min-h-screen bg-gray-950 p-8 text-gray-400">Loading communities...</main>
  }

  return (
    <main className="min-h-screen bg-gray-950 pb-24 text-white">
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/80 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-bold">👥 Communities</h1>
        <p className="text-xs text-gray-400">Explore campus clubs and student guilds</p>
      </header>

      <div className="mx-auto max-w-xl space-y-3 p-4">
        {errorMsg && (
          <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300 border border-red-800">
            {errorMsg}
          </p>
        )}

        {list.length === 0 && !errorMsg ? (
          <p className="py-12 text-center text-gray-500">No communities found.</p>
        ) : (
          list.map((c) => (
            <Link
              key={c.id}
              href={`/communities/${c.id}`}
              className="block rounded-2xl border border-gray-800 bg-gray-900 p-4 transition hover:border-gray-700 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 text-2xl">
                  {c.icon || '👥'}
                </span>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-white">{c.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
                </div>
                <span className="text-xs font-semibold text-indigo-400">View →</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}
