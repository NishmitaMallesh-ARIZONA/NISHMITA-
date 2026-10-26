'use client'

import { useState } from 'react'
import Link from 'next/link'

type Role = 'student' | 'faculty' | 'admin'

interface ProfileData {
  name: string
  role: Role
  idNumber: string // USN or Employee ID
  department: string
  year: string
  semester: string
  college: string
  about: string
  email: string
  showEmailPublicly: boolean
  karma: number
  skills: string[]
  lookingFor: string[]
  avatarUrl: string
}

const AVAILABLE_SKILLS = [
  'Python', 'Java', 'C/C++', 'Web Development', 'React', 'Next.js',
  'UI/UX Design', 'Backend (Node/SQL)', 'Machine Learning', 'Data Analysis',
  'IoT & Robotics', 'Embedded Systems', 'PCB Design', 'MATLAB', 'CAD Modeling'
]

export default function MePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showSkillPicker, setShowSkillPicker] = useState(false)

  // Profile State
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Nishmita Mallesh',
    role: 'admin', // Change to 'faculty' or 'student' to preview other roles
    idNumber: '26CS159T',
    department: 'Computer Science & Engineering',
    year: '2nd Year',
    semester: '4th Sem',
    college: 'East West Institute of Technology',
    about: 'Full-stack developer building campus community systems and PWA architectures.',
    email: 'nishmitamallesh@gmail.com',
    showEmailPublicly: false,
    karma: 42,
    skills: ['Web Development', 'React', 'Backend (Node/SQL)', 'UI/UX Design'],
    lookingFor: ['Machine Learning', 'Python', 'IoT & Robotics'],
    avatarUrl: ''
  })

  // Temporary Edit Form State
  const [formData, setFormData] = useState<ProfileData>(profile)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setProfile(formData)
    setIsEditing(false)
  }

  const toggleSkill = (skill: string) => {
    const current = formData.skills.includes(skill)
      ? formData.skills.filter((s) => s !== skill)
      : [...formData.skills, skill]
    setFormData({ ...formData, skills: current })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Top App Header */}
      <div className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/80 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Campus Profile</h1>
        <button
          onClick={() => {}}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full"
        >
          Log out
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Main Identity Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/50 via-slate-900 to-gray-900 p-5 border border-indigo-500/30 shadow-xl">
          <div className="flex items-start justify-between">
            {/* Avatar & Photo Picker */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-indigo-400/40 shadow-lg overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-full cursor-pointer shadow-md border border-gray-900">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Role Badge */}
            <div>
              {profile.role === 'admin' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Campus Admin
                </span>
              )}
              {profile.role === 'faculty' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Faculty Mentor
                </span>
              )}
              {profile.role === 'student' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Student Member
                </span>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="mt-4">
            <h2 className="text-xl font-bold tracking-tight text-white">{profile.name}</h2>
            <p className="text-xs text-indigo-300 font-medium mt-0.5">{profile.college}</p>
            
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-300">
              <span className="bg-gray-800/80 px-2 py-0.5 rounded-md border border-gray-700/60 font-mono">
                {profile.role === 'faculty' ? `Emp ID: ${profile.idNumber}` : `USN: ${profile.idNumber}`}
              </span>
              <span className="bg-gray-800/80 px-2 py-0.5 rounded-md border border-gray-700/60">
                {profile.department}
              </span>
              {profile.role === 'student' && (
                <span className="bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-700/40">
                  {profile.semester} ({profile.year})
                </span>
              )}
            </div>

            {profile.about && (
              <p className="mt-3 text-xs leading-relaxed text-gray-300 bg-gray-900/60 p-2.5 rounded-xl border border-gray-800/80">
                "{profile.about}"
              </p>
            )}
          </div>

          {/* Edit Profile Button (Instagram Style Action) */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                setFormData(profile)
                setIsEditing(true)
              }}
              className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-indigo-600/20 text-center"
            >
              Edit Profile
            </button>
            <Link
              href="/tickets"
              className="py-2 px-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition-colors flex items-center justify-center gap-1.5"
            >
              🎟️ Event Pass
            </Link>
          </div>
        </div>

        {/* Role-Specific Metric Strip */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3 text-center">
            <div className="text-lg font-bold text-indigo-400">{profile.karma}</div>
            <div className="text-[11px] text-gray-400">Campus Karma</div>
          </div>
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3 text-center">
            <div className="text-lg font-bold text-violet-400">{profile.skills.length}</div>
            <div className="text-[11px] text-gray-400">Core Skills</div>
          </div>
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3 text-center">
            <div className="text-lg font-bold text-emerald-400">
              {profile.role === 'admin' ? 'All Access' : profile.role === 'faculty' ? 'Mentor' : 'Tier 1'}
            </div>
            <div className="text-[11px] text-gray-400">Role Status</div>
          </div>
        </div>

        {/* Contact Visibility Pill */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-200">Email Display</div>
            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
              {profile.showEmailPublicly ? profile.email : '•••••••••••••@gmail.com'}
            </div>
          </div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
            profile.showEmailPublicly
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}>
            {profile.showEmailPublicly ? 'Public' : 'Protected'}
          </span>
        </div>

        {/* Verified Skills Display */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Skills & Tech Stack
            </h3>
            <span className="text-[10px] text-indigo-400 font-medium">
              {profile.skills.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-950/70 text-indigo-200 border border-indigo-800/50"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Role Quick Actions */}
        {profile.role === 'admin' && (
          <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-300">Admin Privileges</p>
              <p className="text-[11px] text-gray-400">Moderate campus posts & verify events</p>
            </div>
            <span className="text-xs bg-rose-500 text-white px-2.5 py-1 rounded-lg font-bold">
              Active
            </span>
          </div>
        )}
      </div>

      {/* INSTAGRAM-STYLE "EDIT PROFILE" SLIDE-OVER SHEET */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md bg-gray-900 border-t sm:border border-gray-800 rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Role Selector */}
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">Account Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* ID / USN */}
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  {formData.role === 'faculty' ? 'Employee / Faculty ID' : 'USN'}
                </label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Semester & Year */}
              {formData.role === 'student' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 font-medium block mb-1">Semester</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'].map((sem) => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium block mb-1">Year</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Bio / About */}
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">About Me</label>
                <textarea
                  rows={2}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Privacy Setting for Email */}
              <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-200">Public Email</div>
                  <div className="text-[11px] text-gray-400">Allow other students to see your email</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showEmailPublicly}
                  onChange={(e) => setFormData({ ...formData, showEmailPublicly: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Collapsible Skills Picker */}
              <div className="pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowSkillPicker(!showSkillPicker)}
                  className="w-full py-2 px-3 rounded-xl bg-gray-950 border border-gray-800 text-xs font-medium text-indigo-300 flex items-center justify-between"
                >
                  <span>Select Skills ({formData.skills.length} active)</span>
                  <span>{showSkillPicker ? '▲ Hide' : '▼ Expand'}</span>
                </button>

                {showSkillPicker && (
                  <div className="mt-2.5 p-3 bg-gray-950/80 rounded-xl border border-gray-800 flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                    {AVAILABLE_SKILLS.map((skill) => {
                      const selected = formData.skills.includes(skill)
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                            selected
                              ? 'bg-indigo-600 text-white font-medium shadow-sm'
                              : 'bg-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {selected ? `✓ ${skill}` : `+ ${skill}`}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Modal Save Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs tracking-wide text-white transition-all shadow-lg shadow-indigo-600/30"
                >
                  Save & Apply Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}