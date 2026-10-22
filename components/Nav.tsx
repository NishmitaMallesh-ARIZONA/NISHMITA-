'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', label: 'Feed', icon: '🏠' },
  { href: '/events', label: 'Events', icon: '📅' },
  { href: '/teams', label: 'Teams', icon: '🤝' },
  { href: '/pulse', label: 'Pulse', icon: '📡' },
  { href: '/me', label: 'Me', icon: '👤' },
]

export default function Nav() {
  const path = usePathname()
  if (path.startsWith('/login')) return null

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 flex justify-around border-t border-gray-800 bg-gray-900/95 py-2 backdrop-blur">
      {TABS.map((t) => {
        const active = t.href === '/' ? path === '/' : path.startsWith(t.href)
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-col items-center px-3 text-xs ${active ? 'text-indigo-400' : 'text-gray-400'}`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}