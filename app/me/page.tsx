'use client'

import { useState } from 'react'
import Link from 'next/link'

type Role = 'student' | 'faculty' | 'admin'

const BRANCH_OPTIONS = [
  { code: 'CSE', label: 'CSE - Computer Science & Engineering' },
  { code: 'ISE', label: 'ISE - Information Science & Engineering' },
  { code: 'ECE', label: 'ECE - Electronics & Communication Engineering' },
  { code: 'AIML', label: 'AIML - Artificial Intelligence & Machine Learning' },
  { code: 'ME', label: 'ME - Mechanical Engineering' },
  { code: 'CV', label: 'CV - Civil Engineering' }
]

export default function MePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showSkillPicker, setShowSkillPicker] = useState(false)
  const [showLookingPicker, setShowLookingPicker] = useState(false)

  // Custom typed input states
  const [customSkillInput, setCustomSkillInput] = useState('')
  const [customLookingInput, setCustomLookingInput] = useState('')

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
    showEmailPublicly: true,
    karma: 15, // Reduced realistic karma
    connections: 18, // Reduced
    eventsCount: 2, // Reduced
    teamsCount: 1, // Reduced
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
    setIsEditing(true)
  }

  // Save changes directly to profile
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setProfile({ ...formData })
    setIsEditing(false)
  }

  // Toggle skills
  const toggleSkill = (skill: string) => {
    const exists = formData.skills.includes(skill)
    setFormData({
      ...formData,
      skills: exists
        ? formData.skills.filter((s) => s !== skill)
        : [...formData.skills, skill]
    })
  }

  const toggleLooking = (skill: string) => {
    const exists = formData.lookingFor.includes(skill)
    setFormData({
      ...formData,
      lookingFor: exists
        ? formData.lookingFor.filter((s) => s !== skill)
        : [...formData.lookingFor, skill]
    })
  }

  // Add custom skills
  const handleAddCustomSkill = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    const trimmed = customSkillInput.trim()
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, trimmed]
      })
      setCustomSkillInput('')
    }
  }

  const handleAddCustomLooking = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    const trimmed = customLookingInput.trim()
    if (trimmed && !formData.lookingFor.includes(trimmed)) {
      setFormData({
        ...formData,
        lookingFor: [...formData.lookingFor, trimmed]
      })
      setCustomLookingInput('')
    }
  }

  const allPresetSkills = [
    'Python', 'Java', 'C Programming', 'Web Development', 'React', 'Next.js',
    'UI/UX Design', 'Backend (Node/SQL)', 'Machine Learning', 'Data Analysis',
    'IoT', 'Arduino', 'Embedded Systems', 'PCB Design', 'Presentation', 'App Development'
  ]

  // Leaderboard with user correctly ranked by karma
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
      {/* Top Bar */}
      <div className="bg-[#2B0E68] px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-black text-xs border border-white/20">
            OC
          </div>
          <div className="flex-1 bg-white/15 rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/10 text-white/70 text-xs">
            <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-white/60">Search students, clubs</span>
          </div>
        </div>

        <button className="text-white/80 hover:text-white p-1 ml-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>

      <div className="max-w-md mx-auto px-3.5 pt-3 space-y-3.5">
        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {/* Header Cover */}
          <div className="relative h-28 bg-gradient-to-r from-[#4A1D96] via-[#5B21B6] to-[#7C3AED] p-4 flex justify-between items-start">
            <div className="w-24 h-24 rounded-full bg-white/5 absolute -bottom-6 -left-6 pointer-events-none"></div>

            <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Verified Student
            </span>

            <label className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const url = URL.createObjectURL(file)
                    setProfile({ ...profile, avatarUrl: url })
                    setFormData({ ...formData, avatarUrl: url })
                  }
                }}
              />
            </label>
          </div>

          {/* Profile Identity Body */}
          <div className="px-5 pt-0 pb-5">
            <div className="relative -mt-12 mb-3 inline-block">
              <div className="w-20 h-20 rounded-full bg-[#B89CF7] border-4 border-white flex items-center justify-center text-[#2E1065] text-2xl font-black shadow-md overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <div className="absolute top-0 right-0 transform translate-x-2 bg-[#F59E0B] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow border-2 border-white">
                Level {profile.level}
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {profile.name}
            </h2>

            {/* HIGHLIGHTED ACADEMIC BADGE GRID: Displays B.E. - CSE */}
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
                onClick={() => alert(`Email: ${profile.showEmailPublicly ? profile.email : 'Protected (Visible only to teammates)'}\nUSN: ${profile.usn}\nCollege: ${profile.college}`)}
                className="text-[#6D28D9] font-bold hover:underline"
              >
                {profile.showEmailPublicly ? profile.email : 'View Contact info'}
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

            {/* Stats Row (Reduced, realistic counts) */}
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
            <span className="text-[11px] text-[#6D28D9] font-bold">
              {profile.skills.length} skills
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Skills I'm Looking For Card (PURPLE STYLING) */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Skills I'm looking for</h3>
              <p className="text-[10px] text-slate-500">Teammate matching & hackathons</p>
            </div>
            <span className="text-[11px] text-[#6D28D9] font-bold">
              {profile.lookingFor.length} wanted
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.lookingFor.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]"
              >
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
          <p className="text-xs text-slate-600 leading-relaxed">
            {profile.about}
          </p>
        </div>

        {/* TOP CONTRIBUTORS LEADERBOARD */}
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

      {/* EDIT PROFILE MODAL WITH FIXED, HIGH-VISIBILITY SAVE BUTTON */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            
            {/* Top Modal Header with DIRECT Save Button */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-3xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Profile</h3>
                <p className="text-[10px] text-slate-400">Make changes and tap save below</p>
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

            {/* Scrollable Form Body */}
            <form id="edit-profile-form" onSubmit={handleSaveProfile} className="p-5 overflow-y-auto space-y-4 flex-1">
              
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

              {/* Branch Dropdown */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Branch</label>
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

              {/* About Bio */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">About Bio</label>
                <textarea
                  rows={2}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {/* Public Contact Setting */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Public Contact Info</div>
                  <div className="text-[10px] text-slate-400">Allow other students to view your email</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showEmailPublicly}
                  onChange={(e) => setFormData({ ...formData, showEmailPublicly: e.target.checked })}
                  className="w-4 h-4 accent-[#7C3AED] rounded"
                />
              </div>

              {/* SKILLS I HAVE SECTION (PURPLE) */}
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

              {/* SKILLS I'M LOOKING FOR SECTION (MATCHING PURPLE THEME) */}
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

                {/* Looking-for Chips: Purple instead of black */}
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

                {/* Preset Chips: Purple instead of black */}
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

            {/* STICKY BOTTOM SAVE PROFILE BUTTON */}
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