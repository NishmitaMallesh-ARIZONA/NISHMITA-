'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

const COLLEGE = 'East West Institute of Technology'
const CITY = 'Bengaluru'
const COURSE = 'B.E.'

const BRANCH_OPTIONS = [
  { code: 'CSE', label: 'CSE - Computer Science & Engineering' },
  { code: 'AI&DS', label: 'AI/DS - Artificial Intelligence & Data Science' },
  { code: 'AIML', label: 'AI/ML - Artificial Intelligence & Machine Learning' },
  { code: 'CSE-AIML', label: 'CSE-AIML - Computer Science & Engineering (AI & ML)' },
  { code: 'CSE-IOT', label: 'CSE-IOT - Computer Science & Engineering (IoT)' },
  { code: 'ISE', label: 'ISE - Information Science & Engineering' },
  { code: 'ECE', label: 'ECE - Electronics & Communication Engineering' },
  { code: 'ECS', label: 'ECS - Electronics & Computer Science Engineering' },
  { code: 'EEE', label: 'EEE - Electrical & Electronics Engineering' },
  { code: 'ME', label: 'ME - Mechanical Engineering' },
  { code: 'CIVIL', label: 'CIVIL - Civil Engineering' },
]

const PRESET_SKILLS = [
  'python', 'java', 'c programming', 'web development', 'react', 'next.js', 'app development',
  'ui design', 'backend', 'sql', 'machine learning', 'data analysis',
  'iot', 'sensors', 'arduino', 'embedded systems', 'circuit design', 'pcb design',
  'power systems', 'matlab', 'cad', '3d printing', 'structural analysis', 'surveying',
  'video editing', 'presentation',
]

const ACRONYMS: Record<string, string> = {
  ui: 'UI', iot: 'IoT', pcb: 'PCB', cad: 'CAD', sql: 'SQL', matlab: 'MATLAB', '3d': '3D', c: 'C', 'next.js': 'Next.js',
}

function pretty(s: string) {
  return s
    .split(' ')
    .map((w) => ACRONYMS[w] ?? w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const ordinal = (n: number) => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`)
const yearFromSem = (sem: number) => Math.ceil(sem / 2)
const levelFor = (k: number) => (k >= 250 ? 4 : k >= 100 ? 3 : k >= 30 ? 2 : 1)

type ProfileData = {
  name: string
  branchCode: string
  semester: number | null
  usn: string
  about: string
  avatarUrl: string
  skills: string[]
  lookingFor: string[]
  contact: string
  contactPublic: boolean
  contactEmail: string
  emailPublic: boolean
  isAdmin: boolean
}

const EMPTY: ProfileData = {
  name: '', branchCode: '', semester: null, usn: '', about: '', avatarUrl: '',
  skills: [], lookingFor: [], contact: '', contactPublic: false, contactEmail: '', emailPublic: false, isAdmin: false,
}

type Row = { id: string; full_name: string | null; karma: number }
type SearchRes = { key: string; name: string; type: 'Student' | 'Club'; detail: string; contact: string }
type ContactRow = { user_id: string; handle: string | null; email: string | null }

function SkillEditor({
  title, placeholder, selected, onChange,
}: {
  title: string
  placeholder: string
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [custom, setCustom] = useState('')
  const [open, setOpen] = useState(false)

  function toggle(s: string) {
    onChange(selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s])
  }

  function add(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault()
    const v = custom.trim().toLowerCase()
    if (v && !selected.includes(v)) onChange([...selected, v])
    setCustom('')
  }

  return (
    <div className="pt-2 border-t border-slate-100 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-800">
          {title} ({selected.length})
        </label>
        <button type="button" onClick={() => setOpen(!open)} className="text-[10px] font-bold text-[#7C3AED] hover:underline">
          {open ? 'Hide presets' : '+ Browse presets'}
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add(e)
          }}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#7C3AED]"
        />
        <button type="button" onClick={add} className="px-3.5 py-1.5 bg-[#7C3AED] text-[#fff] text-xs font-bold rounded-xl active:scale-95">
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {selected.map((skill) => (
          <span key={skill} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
            {pretty(skill)}
            <button type="button" onClick={() => toggle(skill)} className="text-xs text-[#6D28D9] hover:text-red-600">
              ✕
            </button>
          </span>
        ))}
      </div>

      {open && (
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {PRESET_SKILLS.map((sk) => {
            const sel = selected.includes(sk)
            return (
              <button
                key={sk}
                type="button"
                onClick={() => toggle(sk)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                  sel ? 'bg-[#7C3AED] text-[#fff] shadow-sm' : 'bg-white border border-slate-200 text-[#6D28D9] hover:bg-purple-50'
                }`}
              >
                {sel ? `✓ ${pretty(sk)}` : `+ ${pretty(sk)}`}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function MePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [profile, setProfile] = useState<ProfileData>(EMPTY)
  const [formData, setFormData] = useState<ProfileData>(EMPTY)
  const [stats, setStats] = useState({ karma: 0, connections: 0, events: 0, communities: 0 })
  const [board, setBoard] = useState<Row[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchRes[]>([])

  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [cropBox, setCropBox] = useState({ x: 20, y: 20, size: 200 })
  const [zoomScale, setZoomScale] = useState(1)
  const [isDraggingBox, setIsDraggingBox] = useState(false)
  const dragAnchorRef = useRef({ x: 0, y: 0 })
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    async function init() {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        router.push('/login')
        return
      }
      const uid = auth.user.id
      const authEmail = auth.user.email ?? ''
      setUserId(uid)
      setLoginEmail(authEmail)

      const { data: p, error } = await supabase
        .from('profiles')
        .select('full_name, department, year, semester, bio, skills, looking_for, usn, avatar_url, is_admin')
        .eq('id', uid)
        .single()
      if (error || !p) {
        setLoadError(error?.message ?? 'Profile not found')
        setLoading(false)
        return
      }

      const [contactRes, lbRes, mineRes, connRes, evRes, comRes] = await Promise.all([
        supabase.from('contacts').select('handle, handle_public, email, email_public').eq('user_id', uid).maybeSingle(),
        supabase.from('leaderboard').select('id, full_name, karma').order('karma', { ascending: false }).limit(5),
        supabase.from('leaderboard').select('karma').eq('id', uid).maybeSingle(),
        supabase.from('team_requests').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
        supabase.from('event_rsvps').select('event_id', { count: 'exact', head: true }).eq('user_id', uid),
        supabase.from('community_members').select('community_id', { count: 'exact', head: true }).eq('user_id', uid),
      ])

      const c = contactRes.data
      const sem: number | null = p.semester ?? (p.year ? p.year * 2 - 1 : null)
      const code = (p.department ?? '').toString().trim().toUpperCase()
      const loaded: ProfileData = {
        name: p.full_name ?? authEmail.split('@')[0],
        branchCode: BRANCH_OPTIONS.find((b) => b.code === code)?.code ?? '',
        semester: sem,
        usn: p.usn ?? '',
        about: p.bio ?? '',
        avatarUrl: p.avatar_url ?? '',
        skills: (p.skills ?? []) as string[],
        lookingFor: ((p.looking_for ?? '') as string).split(',').map((s) => s.trim()).filter(Boolean),
        contact: c?.handle ?? '',
        contactPublic: !!c?.handle_public,
        contactEmail: c?.email ?? authEmail,
        emailPublic: !!c?.email_public,
        isAdmin: !!p.is_admin,
      }
      setProfile(loaded)
      setFormData(loaded)
      setBoard(((lbRes.data ?? []) as Row[]).map((r) => ({ ...r, karma: Number(r.karma) })))
      setStats({
        karma: Number(mineRes.data?.karma ?? 0),
        connections: connRes.count ?? 0,
        events: evRes.count ?? 0,
        communities: comRes.count ?? 0,
      })
      setLoading(false)
    }
    init()
  }, [router])

  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      const [people, clubs] = await Promise.all([
        supabase.from('profiles').select('id, full_name, department, year').ilike('full_name', `%${q}%`).limit(6),
        supabase.from('communities').select('id, name, description').ilike('name', `%${q}%`).limit(4),
      ])

      // contact details: public items for everyone, everything for accepted teammates (enforced by the database)
      const peopleRows = (people.data ?? []) as { id: string; full_name: string | null; department: string | null; year: number | null }[]
      const contactMap: Record<string, string> = {}
      if (peopleRows.length) {
        const ids = peopleRows.map((r) => r.id)
        const [pub, mine] = await Promise.all([
          supabase.from('public_contacts').select('user_id, handle, email').in('user_id', ids),
          supabase.from('contacts').select('user_id, handle, email').in('user_id', ids),
        ])
        const addRows = (rows: ContactRow[]) =>
          rows.forEach((r) => {
            const parts = [r.email, r.handle].filter(Boolean)
            if (parts.length) contactMap[r.user_id] = parts.join(' · ')
          })
        addRows((pub.data ?? []) as ContactRow[])
        addRows((mine.data ?? []) as ContactRow[])
      }

      const out: SearchRes[] = []
      peopleRows.forEach((r) =>
        out.push({
          key: 'p' + r.id,
          name: r.full_name ?? 'Student',
          type: 'Student',
          detail: `${r.department ?? ''}${r.year ? ` · ${ordinal(r.year)} Year` : ''}`,
          contact: contactMap[r.id] ?? '',
        })
      )
      ;((clubs.data ?? []) as { id: string; name: string; description: string | null }[]).forEach((r) =>
        out.push({ key: 'c' + r.id, name: r.name, type: 'Club', detail: r.description ?? 'Community', contact: '' })
      )
      setResults(out)
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  async function handleSaveProfile(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!userId) return
    setSaving(true)
    setSaveMsg('')
    const sem = formData.semester
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.name.trim(),
        department: formData.branchCode || null,
        semester: sem,
        year: sem ? yearFromSem(sem) : null,
        bio: formData.about.trim(),
        skills: formData.skills,
        looking_for: formData.lookingFor.join(', '),
      })
      .eq('id', userId)
    if (error) {
      setSaveMsg(error.message)
      setSaving(false)
      return
    }
    const { error: cErr } = await supabase.from('contacts').upsert({
      user_id: userId,
      handle: formData.contact.trim(),
      handle_public: formData.contactPublic,
      email: formData.contactEmail.trim(),
      email_public: formData.emailPublic,
    })
    if (cErr) {
      setSaveMsg('Profile saved, but contact settings failed: ' + cErr.message)
      setSaving(false)
      return
    }
    setProfile({ ...formData })
    setSaving(false)
    setIsEditing(false)
  }

  function handleOpenEdit() {
    setFormData({ ...profile })
    setSaveMsg('')
    setIsEditing(true)
  }

  async function handleLogout() {
    if (!confirm('Are you sure you want to log out of Off Campus?')) return
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setRawImageSrc(reader.result as string)
      setCropBox({ x: 20, y: 20, size: 200 })
      setZoomScale(1)
      setIsCropping(true)
    }
    reader.readAsDataURL(file)
  }

  function startDragBox(clientX: number, clientY: number) {
    setIsDraggingBox(true)
    dragAnchorRef.current = { x: clientX - cropBox.x, y: clientY - cropBox.y }
  }

  function moveDragBox(clientX: number, clientY: number) {
    if (!isDraggingBox || !imgRef.current) return
    const container = imgRef.current.parentElement
    if (!container) return
    const maxW = container.clientWidth - cropBox.size
    const maxH = container.clientHeight - cropBox.size
    const newX = Math.max(0, Math.min(maxW, clientX - dragAnchorRef.current.x))
    const newY = Math.max(0, Math.min(maxH, clientY - dragAnchorRef.current.y))
    setCropBox((prev) => ({ ...prev, x: newX, y: newY }))
  }

  function adjustCropBoxSize(delta: number) {
    if (!imgRef.current) return
    const container = imgRef.current.parentElement
    if (!container) return
    const maxAllowed = Math.min(container.clientWidth, container.clientHeight)
    const newSize = Math.max(100, Math.min(maxAllowed, cropBox.size + delta))
    const adjustedX = Math.min(cropBox.x, Math.max(0, container.clientWidth - newSize))
    const adjustedY = Math.min(cropBox.y, Math.max(0, container.clientHeight - newSize))
    setCropBox({ size: newSize, x: adjustedX, y: adjustedY })
  }

  async function applyCrop() {
    const img = imgRef.current
    if (!img || !userId) return
    const cw = img.clientWidth
    const ch = img.clientHeight
    const z = zoomScale
    const sx = ((cropBox.x - cw / 2) / z + cw / 2) * (img.naturalWidth / cw)
    const sy = ((cropBox.y - ch / 2) / z + ch / 2) * (img.naturalHeight / ch)
    const sw = (cropBox.size / z) * (img.naturalWidth / cw)
    const sh = (cropBox.size / z) * (img.naturalHeight / ch)

    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 256, 256)
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 256, 256)
    const url = canvas.toDataURL('image/jpeg', 0.8)

    const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId)
    if (!error) {
      setProfile((p) => ({ ...p, avatarUrl: url }))
      setFormData((f) => ({ ...f, avatarUrl: url }))
    }
    setIsCropping(false)
    setRawImageSrc(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5FB] flex items-center justify-center text-slate-500 text-xs font-semibold">
        Loading campus profile...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F4F5FB] flex items-center justify-center p-6 text-center text-xs text-red-600">
        Could not load your profile: {loadError}
      </div>
    )
  }

  const level = levelFor(stats.karma)

  return (
    <div className="min-h-screen bg-[#F4F5FB] text-slate-900 pb-32">
      {/* Top header */}
      <div className="sticky top-0 z-30 bg-[#2B0E68] px-4 py-3 shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <div className="bg-white/15 rounded-full px-3.5 py-1.5 flex items-center gap-2 border border-white/20 text-xs">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search students, clubs..."
                value={searchQuery}
                onFocus={() => setIsSearching(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', color: '#fff' }}
                className="bg-transparent placeholder:text-white/60 focus:outline-none w-full text-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-white/70 text-xs">
                  ✕
                </button>
              )}
            </div>

            {isSearching && searchQuery.trim().length > 1 && (
              <div className="absolute top-11 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-40">
                <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50">
                  <span>Search matches</span>
                  <button onClick={() => setIsSearching(false)} className="text-slate-400 hover:text-slate-700">
                    Close
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {results.length > 0 ? (
                    results.map((res) => (
                      <div key={res.key} className="p-3 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900">{res.name}</p>
                          <p className="text-[10px] text-slate-500">{res.detail}</p>
                          {res.contact && <p className="text-[10px] text-emerald-700 font-semibold break-all">📞 {res.contact}</p>}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] font-bold flex-shrink-0">{res.type}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">No matching student or club found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex-shrink-0 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-3.5 pt-3 space-y-3.5">
        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="relative h-28 bg-gradient-to-r from-[#4A1D96] via-[#5B21B6] to-[#7C3AED] p-4 flex justify-between items-start">
            <div className="w-24 h-24 rounded-full bg-white/5 absolute -bottom-6 -left-6 pointer-events-none"></div>
            <span className="bg-white/20 backdrop-blur-md text-[#fff] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {profile.isAdmin ? 'Admin' : 'Verified Student'}
            </span>
            <label className="w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>
          </div>

          <div className="px-5 pt-0 pb-5">
            <div className="relative -mt-16 mb-3 inline-block">
              <div className="w-28 h-28 rounded-full bg-[#B89CF7] border-4 border-white flex items-center justify-center text-[#2E1065] text-4xl font-black shadow-lg overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute top-1 right-0 transform translate-x-2 bg-[#F59E0B] text-[#fff] text-[11px] font-black px-2.5 py-0.5 rounded-full shadow border-2 border-white">
                Level {level}
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{profile.name}</h2>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-2.5">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Course & Branch</span>
                <span className="text-xs font-black text-slate-900 block mt-0.5">
                  {COURSE} - {profile.branchCode || 'Not set'}
                </span>
              </div>
              <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-2.5">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Semester & Year</span>
                <span className="text-xs font-black text-slate-900 block mt-0.5">
                  {profile.semester ? `${ordinal(profile.semester)} Sem (${ordinal(yearFromSem(profile.semester))} Year)` : 'Not set'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">USN ID</span>
                <span className="text-xs font-mono font-black text-indigo-900 block mt-0.5">{profile.usn || 'Not set'}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Institution</span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">{COLLEGE}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-3 px-1">
              <span>{CITY}, India</span>
              <button
                onClick={() =>
                  alert(
                    `Your contact information\n\nEmail: ${profile.contactEmail || loginEmail} (${profile.emailPublic ? 'public to all students' : 'private'})\nPhone / handle: ${profile.contact || 'Not added'} (${profile.contactPublic ? 'public to all students' : 'private'})\nUSN: ${profile.usn || 'Not set'}\n\nPrivate items are shown only to students whose teammate request you accept.`
                  )
                }
                className="text-[#6D28D9] font-bold hover:underline"
              >
                View Contact info
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button onClick={handleOpenEdit} className="py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-[#fff] text-xs font-bold rounded-2xl shadow-sm transition-all text-center">
                Edit profile
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: profile.name, url: window.location.origin })
                  } else {
                    navigator.clipboard.writeText(window.location.origin)
                    alert('App link copied to clipboard!')
                  }
                }}
                className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-2xl shadow-sm transition-all text-center"
              >
                Share app
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-slate-100 text-center">
              {[
                ['Karma', stats.karma],
                ['Connections', stats.connections],
                ['Events', stats.events],
                ['Communities', stats.communities],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <div className="text-base font-extrabold text-slate-900">{value}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills I have */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Skills I have</h3>
            <span className="text-[11px] text-[#6D28D9] font-bold">{profile.skills.length} skills</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.length === 0 && <p className="text-xs text-slate-400">No skills added yet. Tap Edit profile.</p>}
            {profile.skills.map((skill) => (
              <span key={skill} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
                {pretty(skill)}
              </span>
            ))}
          </div>
        </div>

        {/* Skills I'm looking for */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Skills I&apos;m looking for</h3>
              <p className="text-[10px] text-slate-500">Teammate matching & hackathons</p>
            </div>
            <span className="text-[11px] text-[#6D28D9] font-bold">{profile.lookingFor.length} wanted</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.lookingFor.length === 0 && <p className="text-xs text-slate-400">Nothing added yet. Tap Edit profile.</p>}
            {profile.lookingFor.map((skill) => (
              <span key={skill} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                {pretty(skill)}
              </span>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">About</h3>
            <button onClick={handleOpenEdit} className="text-slate-400 hover:text-slate-700 text-xs">
              Edit
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{profile.about || 'Add a line about what you like building.'}</p>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏅</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top contributors</h3>
              <p className="text-[11px] text-slate-400">Campus karma leaderboard</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {board.length === 0 && <p className="py-2 text-xs text-slate-400">No points yet. Post, comment or RSVP to start.</p>}
            {board.map((c, index) => {
              const rank = index + 1
              const me = c.id === userId
              return (
                <div key={c.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-black w-5 text-center ${
                        rank === 1 ? 'text-amber-500 text-sm' : rank === 2 ? 'text-indigo-600' : rank === 3 ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {rank}.
                    </span>
                    <span className={`text-xs font-semibold ${me ? 'text-[#7C3AED] font-black' : 'text-slate-800'}`}>
                      {c.full_name ?? 'Student'} {me && '(You)'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {c.karma}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <Link
          href="/tickets"
          style={{ color: '#fff' }}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-xs font-bold shadow-md flex items-center justify-center gap-2 hover:opacity-95"
        >
          🎟️ View My Event Pass (QR)
        </Link>
      </div>

      {/* Cropper */}
      {isCropping && rawImageSrc && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 select-none">
          <div className="flex items-center justify-between py-2 border-b border-slate-800" style={{ color: '#fff' }}>
            <button
              onClick={() => {
                setIsCropping(false)
                setRawImageSrc(null)
              }}
              className="text-sm font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <h3 className="text-sm font-bold">Crop & Scale Avatar</h3>
            <button onClick={applyCrop} className="text-sm font-bold bg-[#7C3AED] text-[#fff] px-4 py-1.5 rounded-full hover:bg-[#6D28D9]">
              Done
            </button>
          </div>

          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden touch-none my-2"
            onMouseMove={(e) => moveDragBox(e.clientX, e.clientY)}
            onMouseUp={() => setIsDraggingBox(false)}
            onTouchMove={(e) => {
              if (e.touches[0]) moveDragBox(e.touches[0].clientX, e.touches[0].clientY)
            }}
            onTouchEnd={() => setIsDraggingBox(false)}
          >
            <div className="relative inline-block max-w-[90vw] max-h-[60vh]">
              <img
                ref={imgRef}
                src={rawImageSrc}
                alt="Upload to crop"
                style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
                className="max-w-full max-h-[60vh] object-contain pointer-events-none transition-transform duration-75"
              />
              <div
                style={{ top: `${cropBox.y}px`, left: `${cropBox.x}px`, width: `${cropBox.size}px`, height: `${cropBox.size}px` }}
                onMouseDown={(e) => startDragBox(e.clientX, e.clientY)}
                onTouchStart={(e) => {
                  if (e.touches[0]) startDragBox(e.touches[0].clientX, e.touches[0].clientY)
                }}
                className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move grid grid-cols-3 grid-rows-3"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className={`${i % 3 !== 2 ? 'border-r' : ''} ${i < 6 ? 'border-b' : ''} border-white/40`}></div>
                ))}
                <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-[#7C3AED]"></span>
                <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-[#7C3AED]"></span>
                <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-[#7C3AED]"></span>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-[#7C3AED]"></span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3" style={{ color: '#fff' }}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-semibold w-12">Zoom</span>
              <button type="button" onClick={() => setZoomScale((prev) => Math.max(0.6, prev - 0.1))} className="w-7 h-7 bg-slate-800 rounded-lg text-base font-bold flex items-center justify-center hover:bg-slate-700">
                -
              </button>
              <input type="range" min="0.6" max="3" step="0.05" value={zoomScale} onChange={(e) => setZoomScale(parseFloat(e.target.value))} className="flex-1 accent-[#7C3AED]" />
              <button type="button" onClick={() => setZoomScale((prev) => Math.min(3, prev + 0.1))} className="w-7 h-7 bg-slate-800 rounded-lg text-base font-bold flex items-center justify-center hover:bg-slate-700">
                +
              </button>
              <span className="font-mono text-slate-400 w-10 text-right">{Math.round(zoomScale * 100)}%</span>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-slate-800 pt-2 text-xs">
              <span className="text-slate-400 font-semibold">Crop Box Frame</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => adjustCropBoxSize(-25)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-[11px]">
                  Minimize
                </button>
                <button type="button" onClick={() => adjustCropBoxSize(25)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-[11px]">
                  Maximize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit profile modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-3xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Profile</h3>
                <p className="text-[10px] text-slate-400">Make changes and tap save</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-2 py-1">
                  Cancel
                </button>
                <button type="button" onClick={() => handleSaveProfile()} disabled={saving} className="px-3.5 py-1.5 bg-[#7C3AED] text-[#fff] text-xs font-bold rounded-xl shadow-sm disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <form id="edit-profile-form" onSubmit={handleSaveProfile} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-purple-100 border-2 border-purple-300 overflow-hidden flex items-center justify-center font-bold text-[#7C3AED] text-xl">
                  {formData.avatarUrl ? <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : formData.name.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <label className="text-xs font-bold text-[#7C3AED] cursor-pointer hover:underline block">
                    Change profile photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                  </label>
                  <p className="text-[10px] text-slate-400">Zoom & resizable crop frame enabled</p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#7C3AED]" required />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">Account type</label>
                  <span className="text-[10px] text-amber-600 font-semibold">🔒 Set by the college</span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-bold">
                  {profile.isAdmin ? 'Admin' : 'Student Member'}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">USN</label>
                  <span className="text-[10px] text-amber-600 font-semibold">🔒 Cannot be changed</span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-600">{profile.usn || 'Not set'}</div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Course & Engineering Branch</label>
                <select value={formData.branchCode} onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#7C3AED]">
                  <option value="">Select your branch</option>
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Semester {formData.semester ? `(${ordinal(yearFromSem(formData.semester))} Year)` : ''}
                </label>
                <select
                  value={formData.semester ?? ''}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="">Select semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      {ordinal(s)} Sem
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">About Bio</label>
                <textarea rows={2} value={formData.about} onChange={(e) => setFormData({ ...formData, about: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED]" />
              </div>

              {/* Contact information settings */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Contact Information Settings</h4>
                <p className="text-[10px] text-slate-500">
                  Private by default. Students whose teammate