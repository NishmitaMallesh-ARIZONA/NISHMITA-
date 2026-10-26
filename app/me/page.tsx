'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Role = 'student' | 'faculty' | 'admin'

const BRANCH_OPTIONS = [
  { code: 'CSE', label: 'CSE - Computer Science & Engineering' },
  { code: 'AIDS', label: 'AI/DS - Artificial Intelligence & Data Science' },
  { code: 'AIML', label: 'AI/ML - Artificial Intelligence & Machine Learning' },
  { code: 'CSE-AIML', label: 'CSE-AIML - Computer Science & Engineering (AI & ML)' },
  { code: 'CSE-IOT', label: 'CSE-IOT - Computer Science & Engineering (IoT)' },
  { code: 'ISE', label: 'ISE - Information Science & Engineering' },
  { code: 'ECE', label: 'ECE - Electronics & Communication Engineering' },
  { code: 'ECSE', label: 'ECSE - Electronics & Computer Science Engineering' },
  { code: 'EEE', label: 'EEE - Electrical & Electronics Engineering' },
  { code: 'ME', label: 'ME - Mechanical Engineering' },
  { code: 'CV', label: 'CV - Civil Engineering' }
]

const DEMO_SEARCH_DATA = [
  { name: 'Aarav Mehta', type: 'Student', detail: 'CSE · 4th Sem' },
  { name: 'Sana Khan', type: 'Student', detail: 'AIML · 2nd Sem' },
  { name: 'Rohan Das', type: 'Student', detail: 'ECE · 6th Sem' },
  { name: 'EWIT Coding Club', type: 'Club', detail: 'Campus Technical Society' },
  { name: 'Robotics & IoT Forum', type: 'Club', detail: 'Hardware & Systems' }
]

export default function MePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showSkillPicker, setShowSkillPicker] = useState(false)
  const [showLookingPicker, setShowLookingPicker] = useState(false)

  // Search Bar Live State
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Custom typed skill states
  const [customSkillInput, setCustomSkillInput] = useState('')
  const [customLookingInput, setCustomLookingInput] = useState('')

  // WhatsApp-Style Cropper States
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [cropBox, setCropBox] = useState({ x: 30, y: 30, size: 200 })
  const [isDraggingBox, setIsDraggingBox] = useState(false)
  const dragAnchorRef = useRef({ x: 0, y: 0 })
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Profile Data State
  const [profile, setProfile] = useState({
    name: 'Nishmita Mallesh',
    role: 'student' as Role,
    branchCode: 'CSE',
    branchFull: 'CSE - Computer Science & Engineering',
    course: 'B.E.',
    interest: 'Web & Mobile Systems',
    year: '1st Year',
    semester: '1st Sem',
    college: 'East West Institute of Technology',
    usn: '26CS159T',
    city: 'Bengaluru',
    email: 'nishmitamallesh@gmail.com',
    phone: '+91 98765 43210',
    showEmailPublicly: false,
    showPhonePublicly: false,
    karma: 15,
    connections: 18,
    eventsCount: 2,
    teamsCount: 1,
    level: 1,
    about: 'First year engineering student building campus community web apps and mobile interfaces.',
    avatarUrl: '',
    openTo: ['Joining teams', 'Hackathons', 'Peer study'],
    skills: ['Python', 'Web Development', 'C Programming'],
    lookingFor: ['UI/UX Design', 'React', 'Backend (Node/SQL)']
  })

  // Edit Form Temporary State
  const [formData, setFormData] = useState(profile)

  const handleOpenEdit = () => {
    setFormData({ ...profile })
    setIsEditing(false)
    setTimeout(() => setIsEditing(true), 10)
  }

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setProfile({ ...formData })
    setIsEditing(false)
  }

  // Working Logout Handler
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of Off Campus?')) {
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      router.push('/')
    }
  }

  // File Select -> Trigger WhatsApp Crop
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setRawImageSrc(url)
      setCropBox({ x: 30, y: 30, size: 200 })
      setIsCropping(true)
    }
  }

  // WhatsApp-Style Box Drag
  const startDragBox = (clientX: number, clientY: number) => {
    setIsDraggingBox(true)
    dragAnchorRef.current = {
      x: clientX - cropBox.x,
      y: clientY - cropBox.y
    }
  }

  const moveDragBox = (clientX: number, clientY: number) => {
    if (!isDraggingBox || !imgRef.current) return
    const container = imgRef.current.parentElement
    if (!container) return

    const maxW = container.clientWidth - cropBox.size
    const maxH = container.clientHeight - cropBox.size

    const newX = Math.max(0, Math.min(maxW, clientX - dragAnchorRef.current.x))
    const newY = Math.max(0, Math.min(maxH, clientY - dragAnchorRef.current.y))

    setCropBox((prev) => ({ ...prev, x: newX, y: newY }))
  }

  const applyCrop = () => {
    if (!imgRef.current) return

    const img = imgRef.current
    const canvas = document.createElement('canvas')
    const size = 320
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    if (ctx) {
      const scaleX = img.naturalWidth / img.clientWidth
      const scaleY = img.naturalHeight / img.clientHeight

      ctx.drawImage(
        img,
        cropBox.x * scaleX,
        cropBox.y * scaleY,
        cropBox.size * scaleX,
        cropBox.size * scaleY,
        0,
        0,
        size,
        size
      )

      const croppedUrl = canvas.toDataURL('image/jpeg', 0.95)
      setProfile((prev) => ({ ...prev, avatarUrl: croppedUrl }))
      setFormData((prev) => ({ ...prev, avatarUrl: croppedUrl }))
    }
    setIsCropping(false)
    setRawImageSrc(null)
  }

  // Skill toggles
  const toggleSkill = (skill: string) => {
    const exists = formData.skills.includes(skill)
    setFormData({
      ...formData,
      skills: exists ? formData.skills.filter((s) => s !== skill) : [...formData.skills, skill]
    })
  }

  const toggleLooking = (skill: string) => {
    const exists = formData.lookingFor.includes(skill)
    setFormData({
      ...formData,
      lookingFor: exists ? formData.lookingFor.filter((s) => s !== skill) : [...formData.lookingFor, skill]
    })
  }

  const handleAddCustomSkill = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    const trimmed = customSkillInput.trim()
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({ ...formData, skills: [...formData.skills, trimmed] })
      setCustomSkillInput('')
    }
  }

  const handleAddCustomLooking = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    const trimmed = customLookingInput.trim()
    if (trimmed && !formData.lookingFor.includes(trimmed)) {
      setFormData({ ...formData, lookingFor: [...formData.lookingFor, trimmed] })
      setCustomLookingInput('')
    }
  }

  const allPresetSkills = [
    'Python', 'Java', 'C Programming', 'Web Development', 'React', 'Next.js',
    'UI/UX Design', 'Backend (Node/SQL)', 'Machine Learning', 'Data Analysis',
    'IoT', 'Arduino', 'Embedded Systems', 'PCB Design', 'Presentation', 'App Development'
  ]

  // Filter Search Results
  const filteredSearchResults = searchQuery.trim()
    ? DEMO_SEARCH_DATA.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.detail.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const rawLeaderboard = [
    { name: 'Aarav Mehta', karma: 42 },
    { name: profile.name, karma: profile.karma },
    { name: 'Sana Khan', karma: 10 },
    { name: 'Rohan Das', karma: 0 },
    { name: 'Meera Iyer', karma: 0 }
  ]
  const topContributors = rawLeaderboard.sort((a, b) => b.karma - a.karma)

  return (
    <div className="min-h-screen bg-[#F4F5FB] text-slate-900 pb-32">
      {/* Top Header with Functional Search & Prominent Working Logout */}
      <div className="sticky top-0 z-30 bg-[#2B0E68] px-4 py-3 shadow-md">
        <div className="flex items-center justify-between gap-3">
          {/* Working Search Bar */}
          <div className="relative flex-1">
            <div className="bg-white/15 rounded-full px-3.5 py-1.5 flex items-center gap-2 border border-white/20 text-white text-xs">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search students, clubs..."
                value={searchQuery}
                onFocus={() => setIsSearching(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder:text-white/60 focus:outline-none w-full text-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-white/70 text-xs">✕</button>
              )}
            </div>

            {/* Live Search Popup Overlay */}
            {isSearching && searchQuery.trim().length > 0 && (
              <div className="absolute top-11 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-40">
                <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50">
                  <span>Search Matches</span>
                  <button onClick={() => setIsSearching(false)} className="text-slate-400 hover:text-slate-700">Close</button>
                </div>
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {filteredSearchResults.length > 0 ? (
                    filteredSearchResults.map((res, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          alert(`Selected ${res.name} (${res.detail})`)
                          setIsSearching(false)
                        }}
                        className="p-3 hover:bg-purple-50 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{res.name}</p>
                          <p className="text-[10px] text-slate-500">{res.detail}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] font-bold">
                          {res.type}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No matching student or club found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Functional Logout Button */}
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
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="relative h-28 bg-gradient-to-r from-[#4A1D96] via-[#5B21B6] to-[#7C3AED] p-4 flex justify-between items-start">
            <div className="w-24 h-24 rounded-full bg-white/5 absolute -bottom-6 -left-6 pointer-events-none"></div>

            <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Verified Student
            </span>

            {/* Camera Upload Trigger */}
            <label className="w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>
          </div>

          <div className="px-5 pt-0 pb-5">
            {/* Prominent Profile Photo */}
            <div className="relative -mt-16 mb-3 inline-block">
              <div className="w-28 h-28 rounded-full bg-[#B89CF7] border-4 border-white flex items-center justify-center text-[#2E1065] text-4xl font-black shadow-lg overflow-hidden bg-cover bg-center">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <div className="absolute top-1 right-0 transform translate-x-2 bg-[#F59E0B] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow border-2 border-white">
                Level {profile.level}
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {profile.name}
            </h2>

            {/* Academic Badges */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-2.5">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Course & Branch</span>
                <span className="text-xs font-black text-slate-900 block mt-0.5">
                  {profile.course} - {profile.branchCode}
                </span>
              </div>
              <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-2.5">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Semester & Year</span>
                <span className="text-xs font-black text-slate-900 block mt-0.5">
                  {profile.semester} ({profile.year})
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">USN ID</span>
                <span className="text-xs font-mono font-black text-indigo-900 block mt-0.5">{profile.usn}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Institution</span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">{profile.college}</span>
              </div>
            </div>

            {/* Contact Row */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-3 px-1">
              <span>{profile.city}, India</span>
              <button
                onClick={() =>
                  alert(
                    `Contact Information:\nEmail: ${
                      profile.showEmailPublicly ? profile.email : 'Protected (Shared only with accepted teammates)'
                    }\nPhone: ${
                      profile.showPhonePublicly ? profile.phone : 'Protected (Shared only with accepted teammates)'
                    }\nUSN: ${profile.usn}`
                  )
                }
                className="text-[#6D28D9] font-bold hover:underline"
              >
                View Contact info
              </button>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                onClick={handleOpenEdit}
                className="py-2.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-98 text-white text-xs font-bold rounded-2xl shadow-sm transition-all text-center"
              >
                Edit profile
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: profile.name, url: window.location.href })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Profile link copied to clipboard!')
                  }
                }}
                className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-2xl shadow-sm transition-all text-center"
              >
                Share profile
              </button>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-slate-100 text-center">
              <div>
                <div className="text-base font-extrabold text-slate-900">{profile.karma}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">Karma</div>
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900">{profile.connections}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">Connections</div>
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900">{profile.eventsCount}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">Events</div>
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900">{profile.teamsCount}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">Teams</div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills I Have Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Skills I have</h3>
            <span className="text-[11px] text-[#6D28D9] font-bold">{profile.skills.length} skills</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span key={skill} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Skills I'm Looking For Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Skills I'm looking for</h3>
              <p className="text-[10px] text-slate-500">Teammate matching & hackathons</p>
            </div>
            <span className="text-[11px] text-[#6D28D9] font-bold">{profile.lookingFor.length} wanted</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.lookingFor.map((skill) => (
              <span key={skill} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* About Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">About</h3>
            <button onClick={handleOpenEdit} className="text-slate-400 hover:text-slate-700">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{profile.about}</p>
        </div>

        {/* Top Contributors Leaderboard */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏅</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top contributors</h3>
              <p className="text-[11px] text-slate-400">Campus karma leaderboard</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {topContributors.map((c, index) => {
              const rank = index + 1
              return (
                <div key={c.name} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black w-5 text-center ${
                      rank === 1 ? 'text-amber-500 font-extrabold text-sm' :
                      rank === 2 ? 'text-indigo-600 font-bold' :
                      rank === 3 ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {rank}.
                    </span>
                    <span className={`text-xs font-semibold ${
                      c.name === profile.name ? 'text-[#7C3AED] font-black' : 'text-slate-800'
                    }`}>
                      {c.name} {c.name === profile.name && '(You)'}
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

        {/* Event Pass Button */}
        <Link
          href="/tickets"
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 hover:opacity-95"
        >
          🎟️ View My Event Pass (QR)
        </Link>
      </div>

      {/* WHATSAPP-STYLE DRAG-BOX CROPPER MODAL (NO ZOOM SLIDERS) */}
      {isCropping && rawImageSrc && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 select-none">
          <div className="flex items-center justify-between text-white py-2">
            <button
              onClick={() => {
                setIsCropping(false)
                setRawImageSrc(null)
              }}
              className="text-sm font-semibold text-slate-300"
            >
              Cancel
            </button>
            <h3 className="text-sm font-bold">Crop Profile Photo</h3>
            <button
              onClick={applyCrop}
              className="text-sm font-bold bg-[#7C3AED] text-white px-4 py-1.5 rounded-full"
            >
              Done
            </button>
          </div>

          {/* WhatsApp Viewport with Drag Box */}
          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden touch-none"
            onMouseMove={(e) => moveDragBox(e.clientX, e.clientY)}
            onMouseUp={() => setIsDraggingBox(false)}
            onTouchMove={(e) => {
              if (e.touches[0]) moveDragBox(e.touches[0].clientX, e.touches[0].clientY)
            }}
            onTouchEnd={() => setIsDraggingBox(false)}
          >
            <div className="relative inline-block max-w-[90vw] max-h-[70vh]">
              <img
                ref={imgRef}
                src={rawImageSrc}
                alt="Upload to crop"
                className="max-w-full max-h-[70vh] object-contain pointer-events-none"
              />

              {/* Square WhatsApp Crop Box with Rule of Thirds Grid */}
              <div
                style={{
                  top: `${cropBox.y}px`,
                  left: `${cropBox.x}px`,
                  width: `${cropBox.size}px`,
                  height: `${cropBox.size}px`
                }}
                onMouseDown={(e) => startDragBox(e.clientX, e.clientY)}
                onTouchStart={(e) => {
                  if (e.touches[0]) startDragBox(e.touches[0].clientX, e.touches[0].clientY)
                }}
                className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] cursor-move grid grid-cols-3 grid-rows-3"
              >
                <div className="border-r border-b border-white/40"></div>
                <div className="border-r border-b border-white/40"></div>
                <div className="border-b border-white/40"></div>
                <div className="border-r border-b border-white/40"></div>
                <div className="border-r border-b border-white/40"></div>
                <div className="border-b border-white/40"></div>
                <div className="border-r border-white/40"></div>
                <div className="border-r border-white/40"></div>
                <div></div>

                {/* WhatsApp Corner Brackets */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#7C3AED]"></span>
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#7C3AED]"></span>
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#7C3AED]"></span>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#7C3AED]"></span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 pb-2">
            Drag the square box to choose your avatar frame
          </p>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-3xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Profile</h3>
                <p className="text-[10px] text-slate-400">Make changes and tap save</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  className="px-3.5 py-1.5 bg-[#7C3AED] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Form */}
            <form id="edit-profile-form" onSubmit={handleSaveProfile} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Photo Upload in Edit Sheet */}
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-purple-100 border-2 border-purple-300 overflow-hidden flex items-center justify-center font-bold text-[#7C3AED] text-xl">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    formData.name.charAt(0)
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-[#7C3AED] cursor-pointer hover:underline block">
                    Change profile photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                  </label>
                  <p className="text-[10px] text-slate-400">Square WhatsApp crop enabled</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#7C3AED]"
                  required
                />
              </div>

              {/* Locked Role */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">Account Type / Role</label>
                  <span className="text-[10px] text-amber-600 font-semibold">🔒 Verified by College</span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-bold flex items-center justify-between cursor-not-allowed">
                  <span>Student Member</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase font-extrabold">Verified</span>
                </div>
              </div>

              {/* USN */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">USN</label>
                <input
                  type="text"
                  value={formData.usn}
                  onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#7C3AED]"
                  required
                />
              </div>

              {/* Comprehensive Engineering Branches */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Course & Engineering Branch</label>
                <select
                  value={formData.branchCode}
                  onChange={(e) => {
                    const selected = BRANCH_OPTIONS.find((b) => b.code === e.target.value)
                    setFormData({
                      ...formData,
                      branchCode: e.target.value,
                      branchFull: selected ? selected.label : e.target.value
                    })
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#7C3AED]"
                >
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester & Year */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#7C3AED]"
                  >
                    {['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'].map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#7C3AED]"
                  >
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">About Bio</label>
                <textarea
                  rows={2}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {/* DEDICATED PRIVATE & PUBLIC CONTACT EDITING */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Contact Information Settings</h4>
                
                {/* Email Field & Visibility */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">Email Address</label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showEmailPublicly}
                        onChange={(e) => setFormData({ ...formData, showEmailPublicly: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#7C3AED] rounded"
                      />
                      <span className="text-[10px] text-slate-500 font-semibold">Make Public</span>
                    </label>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Phone Field & Visibility */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">Phone Number</label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showPhonePublicly}
                        onChange={(e) => setFormData({ ...formData, showPhonePublicly: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#7C3AED] rounded"
                      />
                      <span className="text-[10px] text-slate-500 font-semibold">Make Public</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Unchecked items are protected and revealed only to teammates you accept.
                  </p>
                </div>
              </div>

              {/* Skills I Have */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800">
                    Skills I have ({formData.skills.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSkillPicker(!showSkillPicker)}
                    className="text-[10px] font-bold text-[#7C3AED] hover:underline"
                  >
                    {showSkillPicker ? 'Hide presets' : '+ Browse presets'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type custom skill..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomSkill(e)
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#7C3AED]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="px-3.5 py-1.5 bg-[#7C3AED] text-white text-xs font-bold rounded-xl active:scale-95"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="text-xs text-[#6D28D9] hover:text-red-600"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {showSkillPicker && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {allPresetSkills.map((sk) => {
                      const sel = formData.skills.includes(sk)
                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => toggleSkill(sk)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                            sel
                              ? 'bg-[#7C3AED] text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-[#6D28D9] hover:bg-purple-50'
                          }`}
                        >
                          {sel ? `✓ ${sk}` : `+ ${sk}`}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Skills I'm Looking For */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800">
                    Skills I'm looking for ({formData.lookingFor.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLookingPicker(!showLookingPicker)}
                    className="text-[10px] font-bold text-[#7C3AED] hover:underline"
                  >
                    {showLookingPicker ? 'Hide presets' : '+ Browse presets'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type teammate skill needed..."
                    value={customLookingInput}
                    onChange={(e) => setCustomLookingInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomLooking(e)
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#7C3AED]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomLooking}
                    className="px-3.5 py-1.5 bg-[#7C3AED] text-white text-xs font-bold rounded-xl active:scale-95"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.lookingFor.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => toggleLooking(skill)}
                        className="text-xs text-[#7C3AED] hover:text-red-600"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {showLookingPicker && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {allPresetSkills.map((sk) => {
                      const sel = formData.lookingFor.includes(sk)
                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => toggleLooking(sk)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                            sel
                              ? 'bg-[#7C3AED] text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-[#7C3AED] hover:bg-purple-50'
                          }`}
                        >
                          {sel ? `✓ ${sk}` : `+ ${sk}`}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </form>

            {/* Bottom Save Profile Button */}
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-3xl">
              <button
                type="submit"
                form="edit-profile-form"
                className="w-full py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black tracking-wide shadow-lg shadow-purple-500/30 transition-all active:scale-98"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}