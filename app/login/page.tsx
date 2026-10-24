'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const APP_NAME = 'Off Campus'
const COLLEGE_DOMAIN = '@ewit.edu.in'
const USN_PATTERN = /^[0-9A-Z]{6,12}$/

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [fullName, setFullName] = useState('')
  const [usn, setUsn] = useState('')
  const [email, setEmail] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    const id = identifier.trim()
    let loginEmail = ''

    if (id.includes('@')) {
      loginEmail = id.toLowerCase()
      if (!loginEmail.endsWith(COLLEGE_DOMAIN)) {
        setMsg(`Please use your college email (${COLLEGE_DOMAIN}) or your USN`)
        return
      }
    } else {
      const u = id.toUpperCase()
      if (!USN_PATTERN.test(u)) {
        setMsg('Enter a valid USN, for example 26CS159T')
        return
      }
      const { data, error } = await supabase.rpc('email_for_usn', { p_usn: u })
      if (error) {
        setMsg('Could not look up the USN. Try your college email instead.')
        return
      }
      if (!data) {
        setMsg('Wrong USN or password')
        return
      }
      loginEmail = data as string
    }

    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password })
    if (error) {
      setMsg('Wrong USN/email or password')
      return
    }
    router.push('/')
  }

  async function handleSignup() {
    const u = usn.trim().toUpperCase()
    const e = email.trim().toLowerCase()

    if (!e.endsWith(COLLEGE_DOMAIN)) {
      setMsg(`Please use your college email (${COLLEGE_DOMAIN})`)
      return
    }
    if (!USN_PATTERN.test(u)) {
      setMsg('Enter a valid USN, for example 26CS159T')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: e,
      password,
      options: { data: { full_name: fullName.trim(), usn: u } },
    })
    if (error) {
      if (error.message.toLowerCase().includes('database error')) {
        setMsg('Could not create the account. That USN may already be registered.')
      } else {
        setMsg(error.message)
      }
      return
    }
    if (!data.session) {
      setMsg('Account created. Check your college email to confirm, then log in.')
      return
    }
    router.push('/')
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setMsg('')
    setLoading(true)
    if (mode === 'login') await handleLogin()
    else await handleSignup()
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-gray-900 p-6 text-white">
        <h1 className="text-center text-2xl font-bold">{APP_NAME}</h1>
        <p className="text-center text-xs text-gray-400">
          {mode === 'login' ? 'Log in with your USN or college email' : 'Join the verified EWIT network'}
        </p>

        {mode === 'signup' ? (
          <>
            <input
              className="w-full rounded-lg bg-gray-800 p-3 text-sm"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <input
              className="w-full rounded-lg bg-gray-800 p-3 text-sm uppercase placeholder:normal-case"
              placeholder="USN (e.g. 26CS159T)"
              value={usn}
              onChange={(e) => setUsn(e.target.value)}
              maxLength={12}
              required
            />
            <input
              className="w-full rounded-lg bg-gray-800 p-3 text-sm"
              type="email"
              placeholder={`College email (${COLLEGE_DOMAIN})`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </>
        ) : (
          <div>
            <label className="mb-1 block text-xs text-gray-400">USN or college email</label>
            <input
              className="w-full rounded-lg bg-gray-800 p-3 text-sm"
              placeholder="e.g. 26CS159T or name@ewit.edu.in"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoCapitalize="none"
              required
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-gray-400">Password</label>
          <input
            className="w-full rounded-lg bg-gray-800 p-3 text-sm"
            type="password"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        {msg && <p className="text-center text-xs text-red-400">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 p-3 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? 'Verifying...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setMsg('')
          }}
          className="w-full text-center text-xs text-gray-400"
        >
          {mode === 'login' ? 'New here? Register with your USN' : 'Already have an account? Log in'}
        </button>
      </form>
    </main>
  )
}