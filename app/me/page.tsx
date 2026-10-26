'use client'

import { useState } from 'react'
import Link from 'next/link'

type Role = 'student' | 'faculty' | 'admin'

export default function MePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showSkillPicker, setShowSkillPicker] = useState(false)

  // Profile Data
  const [profile, setProfile] = useState({
    name: 'Nishmita Mallesh',
    role: 'admin' as Role, // 'student' | 'faculty' | 'admin'
    branch: 'Computer Science & Engineering',
    interest: 'Web & Mobile Systems',
    year: '2nd Year',
    semester: '4th Sem',
    college: 'EWIT',
    usn: '26CS159T',
    city: 'Bengaluru',
    email: 'nishmitamallesh@gmail.com',
    showEmailPublicly: true,
    karma: 1240,
    connections: 186,
    eventsCount: 12,
    teamsCount: 3,
    level: 4,
    about: 'Computer Science student passionate about building scalable campus web apps, Next.js PWAs, and collaborative developer tools.',
    avatarUrl: '',
    openTo: ['Joining teams', 'Internships', 'Hackathons', 'Mentoring juniors'],
    skills: ['Python', 'Web Development', 'React', 'UI/UX Design']
  })

  const [formData, setFormData] = useState(profile)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setProfile(formData)
    setIsEditing(false)
  }

  const toggleSkill = (skill: string) => {
    const exists = formData.skills.includes(skill)
    setFormData({
      ...formData,
      skills: exists
        ? formData.skills.filter((s) => s !== skill)
        : [...formData.skills, skill]
    })
  }

  const allSkills = [
    'Python', 'Java', 'C Programming', 'Web Development', 'React',
    'UI Design', 'Backend', 'SQL', 'Machine Learning', 'Data Analysis',
    'IoT', 'Arduino', 'Embedded Systems', 'PCB Design', 'Presentation'
  ]

  return (
    <div className="min-h-screen bg-[#F4F5FB] text-slate-900 pb-28">
      {/* Top Search & App Bar */}
      <div className="bg-[#2B0E68] px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-black text-xs border border-white/20">
            OC
          </div>
          <div className="flex-1 bg-white/15 rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/10 text-white/70 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        {/* Main Profile Card (Matches Reference Image) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {/* Purple Curved Cover Header */}
          <div className="relative h-28 bg-gradient-to-r from-[#4A1D96] via-[#5B21B6] to-[#7C3AED] p-4 flex justify-between items-start">
            <div className="w-24 h-24 rounded-full bg-white/5 absolute -bottom-6 -left-6 pointer-events-none"></div>

            {/* Role Tag on Header */}
            <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20 shadow-sm">
              {profile.role === 'admin' ? 'Campus Admin' : profile.role === 'faculty' ? 'Faculty Mentor' : 'Student'}
            </span>

            {/* Camera Icon to change cover/photo */}
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
            {/* Avatar with overlapping Level 4 Badge */}
            <div className="relative -mt-12 mb-3 inline-block">
              <div className="w-20 h-20 rounded-full bg-[#B89CF7] border-4 border-white flex items-center justify-center text-[#2E1065] text-2xl font-black shadow-md overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  'YN'
                )}
              </div>
              {/* Level 4 Badge */}
              <div className="absolute top-0 right-0 transform translate-x-2 bg-[#F59E0B] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow border-2 border-white">
                Level {profile.level}
              </div>
            </div>

            {/* Name and Details */}
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              {profile.name}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
              {profile.branch} student building campus projects and {profile.interest}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {profile.semester} ({profile.year}) · {profile.college} · USN [{profile.usn}]
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {profile.city}, India ·{' '}
              <button
                onClick={() => alert(`Email: ${profile.email}\nUSN: ${profile.usn}\nCollege: ${profile.college}`)}
                className="text-[#6D28D9] font-bold hover:underline"
              >
                Contact info
              </button>
            </p>

            {/* Buttons: Edit profile & Share profile */}
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                onClick={() => {
                  setFormData(profile)
                  setIsEditing(true)
                }}
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
                    alert('Profile link copied!')
                  }
                }}
                className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-2xl shadow-sm transition-all text-center"
              >
                Share profile
              </button>
            </div>

            {/* 4 Counter Columns (Karma, Connections, Events, Teams) */}
            <div className="grid grid-cols-4 gap-2 pt-5 mt-4 border-t border-slate-100 text-center">
              <div>
                <div className="text-base font-extrabold text-slate-900">{profile.karma.toLocaleString()}</div>
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

        {/* Open To Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-900">Open to</h3>
          <div className="flex flex-wrap gap-2">
            {profile.openTo.map((item) => (
              <span
                key={item}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Skills Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Skills</h3>
            <span className="text-[11px] text-[#6D28D9] font-bold">
              {profile.skills.length} skills
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
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
            <button
              onClick={() => {
                setFormData(profile)
                setIsEditing(true)
              }}
              className="text-slate-400 hover:text-slate-700"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {profile.about}
          </p>
        </div>

        {/* Event Pass Button */}
        <Link
          href="/tickets"
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 hover:opacity-95"
        >
          🎟️ View My Event Pass (QR)
        </Link>
      </div>

      {/* INSTAGRAM-STYLE "EDIT PROFILE" SLIDE-OVER SHEET */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-500 hover:text-slate-900 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Role / Account Type</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* USN / Employee ID */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  {formData.role === 'faculty' ? 'Employee ID' : 'USN'}
                </label>
                <input
                  type="text"
                  value={formData.usn}
                  onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {/* Semester & Year */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Semester</label>
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
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Year</label>
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

              {/* Bio / About */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">About Bio</label>
                <textarea
                  rows={2}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {/* Email Privacy */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Public Contact Info</div>
                  <div className="text-[10px] text-slate-400">Allow other students to view email</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showEmailPublicly}
                  onChange={(e) => setFormData({ ...formData, showEmailPublicly: e.target.checked })}
                  className="w-4 h-4 accent-[#7C3AED] rounded"
                />
              </div>

              {/* Expandable Skills Picker */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSkillPicker(!showSkillPicker)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#6D28D9] flex items-center justify-between"
                >
                  <span>Select Skills ({formData.skills.length} active)</span>
                  <span>{showSkillPicker ? '▲' : '▼'}</span>
                </button>

                {showSkillPicker && (
                  <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {allSkills.map((sk) => {
                      const sel = formData.skills.includes(sk)
                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => toggleSkill(sk)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                            sel
                              ? 'bg-[#7C3AED] text-white'
                              : 'bg-white border border-slate-200 text-slate-700'
                          }`}
                        >
                          {sel ? `✓ ${sk}` : `+ ${sk}`}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-purple-500/20 mt-2"
              >
                Save & Apply Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}