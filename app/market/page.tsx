'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'



type Listing = {
  id: string
  seller_id: string
  title: string
  kind: string
  price: number
  department: string | null
  contact: string | null
  sold: boolean
  profiles: { full_name: string | null } | null
}

const KINDS = ['book', 'notes', 'gadget', 'other']

export default function MarketPage() {
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    setSupabase(createClient())
  }, [])
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [items, setItems] = useState<Listing[]>([])
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('book')
  const [price, setPrice] = useState('')
  const [department, setDepartment] = useState('')
  const [contact, setContact] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('listings')
      .select('id, seller_id, title, kind, price, department, contact, sold, profiles!seller_id(full_name)')
      .order('created_at', { ascending: false })
    if (error) setMsg(error.message)
    setItems((data ?? []) as unknown as Listing[])
  }, [supabase])

  useEffect(() => {
    async function init() {
      if (!supabase) return
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUserId(data.user.id)
      await load()
      setLoading(false)
    }
    init()
  }, [router, load, supabase])

  async function add(e: React.FormEvent) {
    if (!supabase) return
    e.preventDefault()
    if (!userId) return
    if (!supabase) return
    setMsg('')
    const { error } = await supabase.from('listings').insert({
      seller_id: userId,
      title: title.trim(),
      kind,
      price: price ? Number(price) : 0,
      department: department.trim(),
      contact: contact.trim(),
    })
    if (error) {
      setMsg(error.message)
      return
    }
    setTitle('')
    setPrice('')
    setDepartment('')
    setContact('')
    setShowForm(false)
    await load()
  }

  async function toggleSold(item: Listing) {
    await supabase.from('listings').update({ sold: !item.sold }).eq('id', item.id)
    await load()
  }

  async function remove(item: Listing) {
    await supabase.from('listings').delete().eq('id', item.id)
    await load()
  }

  if (loading) return <main className="min-h-screen p-8 text-gray-400">Loading...</main>

  const shown = items.filter((i) => filter === 'all' || i.kind === filter)

  return (
    <main className="min-h-screen bg-gray-950">
      <header className="sticky top-0 px-4 py-3">
        <h1 className="text-xl font-bold">📚 Campus Market</h1>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {['all', ...KINDS].map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`whitespace-nowrap rounded-full px-4 py-1 text-sm font-semibold ${
                filter === k ? 'bg-indigo-600' : 'bg-gray-900 text-gray-300'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <button onClick={() => setShowForm(!showForm)} className="w-full rounded-xl bg-indigo-600 p-3 font-semibold">
          {showForm ? 'Cancel' : '+ Sell or share something'}
        </button>

        {showForm && (
          <form onSubmit={add} className="space-y-3 rounded-2xl bg-gray-900 p-4">
            <input className="w-full rounded-lg bg-gray-800 p-3" placeholder="What are you listing?" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div className="flex gap-2">
              <select className="flex-1 rounded-lg bg-gray-800 p-3 text-sm" value={kind} onChange={(e) => setKind(e.target.value)}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <input className="w-28 rounded-lg bg-gray-800 p-3" type="number" min="0" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <input className="w-full rounded-lg bg-gray-800 p-3" placeholder="Department (optional)" value={department} onChange={(e) => setDepartment(e.target.value)} />
            <input className="w-full rounded-lg bg-gray-800 p-3" placeholder="How buyers reach you (WhatsApp or Instagram)" value={contact} onChange={(e) => setContact(e.target.value)} required />
            {msg && <p className="text-sm text-red-400">{msg}</p>}
            <button className="w-full rounded-lg bg-indigo-600 p-3 font-semibold">Publish</button>
          </form>
        )}

        {shown.length === 0 && <p className="py-8 text-center text-gray-500">Nothing here yet.</p>}

        {shown.map((i) => (
          <article key={i.id} className="rounded-2xl bg-gray-900 p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className={`font-bold ${i.sold ? 'line-through opacity-50' : ''}`}>{i.title}</h2>
              <span className="whitespace-nowrap rounded-full bg-indigo-900 px-2 py-1 text-xs text-indigo-200">{i.kind}</span>
            </div>
            <p className="mt-1 text-lg font-bold text-green-400">{i.price > 0 ? `Rs ${i.price}` : 'Free'}</p>
            <p className="text-sm text-gray-400">
              {i.profiles?.full_name ?? 'Student'}
              {i.department ? ` · ${i.department}` : ''}
            </p>
            {!i.sold && i.contact && <p className="mt-1 text-sm text-gray-300">📞 {i.contact}</p>}
            {i.sold && <p className="mt-1 text-sm font-semibold text-gray-500">Sold</p>}
            {i.seller_id === userId && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => toggleSold(i)} className="flex-1 rounded-lg bg-gray-700 p-2 text-sm">
                  {i.sold ? 'Mark available' : 'Mark sold'}
                </button>
                <button onClick={() => remove(i)} className="rounded-lg bg-gray-700 px-4 text-sm">
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}