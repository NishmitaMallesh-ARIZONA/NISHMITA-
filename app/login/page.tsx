'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const COLLEGE_DOMAIN = '@ewit.edu.in' // <-- change this

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')

    if (!email.trim().toLowerCase().endsWith(COLLEGE_DOMAIN)) {
      setMsg(`Please use your college email (${COLLEGE_DOMAIN})`)
      return
    }

    setLoading(true)
    const result =
      mode === 'signup'
        ? await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { data: { full_name: fullName } },
          })
        : await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
    setLoading(false)

    if (result.error) {
      setMsg(result.error.message)
      return
    }
    router.push('/')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-gray-900 p-6 rounded-2xl space-y-4 text-white"
      >
        <h1 className="text-2xl font-bold">CampusCircle</h1>
        <p className="text-sm text-gray-400">
          {mode === 'login' ? 'Welcome back' : 'Join your college community'}
        </p>

        {mode === 'signup' && (
          <input
            className="w-full p-3 rounded-lg bg-gray-800"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}
        <input
          className="w-full p-3 rounded-lg bg-gray-800"
          type="email"
          placeholder={`College email (${COLLEGE_DOMAIN})`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-3 rounded-lg bg-gray-800"
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {msg && <p className="text-sm text-red-400">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 rounded-lg bg-indigo-600 font-semibold disabled:opacity-50"
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="w-full text-sm text-gray-400"
        >
          {mode === 'login'
            ? 'New here? Create an account'
            : 'Already have an account? Log in'}
        </button>
      </form>
    </main>
  )
}
