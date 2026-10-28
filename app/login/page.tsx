'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const APP_NAME = 'Off Campus'
const COLLEGE_DOMAIN = '@ewit.edu.in'
const USN_PATTERN = /^[0-9A-Z]{6,12}$/

function EyeIcon({ off }: { off: boolean }) {
  return off ? (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 5.09A9.77 9.77 0 0112 5c4.48 0 8.27 2.94 9.54 7a9.97 9.97 0 01-2.26 3.75M6.61 6.61A9.97 9.97 0 002.46 12c1.27 4.06 5.06 7 9.54 7a9.8 9.8 0 004.39-1.04" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.46 12C3.73 7.94 7.52 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-5.06 7-9.54 7S3.73 16.06 2.46 12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [fullName, setFullName] = useState('')
  const [usn, setUsn] = useState('')
  const [email, setEmail] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
        <div className="flex flex-col items-center gap-2">
          <img
            src="/icon-192.png"
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
            className="h-14 w-14 rounded-2xl object-cover shadow-md"
          />
          <h1 className="text-center text-2xl font-bold">{APP_NAME}</h1>
          <p className="text-center text-xs text-gray-400">
            {mode === 'login' ? 'Log in with your USN or college email' : 'Join the verified EWIT network'}
          </p>
        </div>

        {mode === 'signup' ? (
          <>
            <input
              className="w-full rounded-lg bg-gray-800 p-3 text-sm"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
            />
            <input
              className="w-full rounded-lg bg-gray-800 p-3 text-sm uppercase placeholder:normal-case"
              placeholder="USN (e.g. 26CS159T)"
              value={usn}
              onChange={(e) => setUsn(e.target.value)}
              maxLength={12}
              autoCapitalize="characters"
              required
            />
            <input
              className="w-full rounded-lg bg-gray-800 p-3 text-sm"
              type="email"
              placeholder={`College email (${COLLEGE_DOMAIN})`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
              autoComplete="username"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="password" className="mb-1 block text-xs text-gray-400">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              className="w-full rounded-lg bg-gray-800 p-3 pr-12 text-sm"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400"
            >
              <EyeIcon off={showPassword} />
            </button>
          </div>
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
            setShowPassword(false)
          }}
          className="w-full text-center text-xs text-gray-400"
        >
          {mode === 'login' ? 'New here? Register with your USN' : 'Already have an account? Log in'}
        </button>
      </form>
    </main>
  )
}