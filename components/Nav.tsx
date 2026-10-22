'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Tab = { href: string; label: string; icon: string; also: string[] }

const TABS: Tab[] = [
  { href: '/', label: 'Feed', icon: '🏠', also: [] },
  { href: '/events', label: 'Events', icon: '📅', also: ['/tickets', '/checkin'] },
  { href: '/teams', label: 'Teams', icon: '🤝', also: [] },
  { href: '/explore', label: 'Explore', icon: '🧭', also: ['/pulse', '/market', '/communities', '/focus'] },
  { href: '/me', label: 'Me', icon: '👤', also: [] },
]

export default function Nav() {
  const path = usePathname()
  if (path.startsWith('/login')) return null

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 flex justify-around border-t border-gray-800 bg-gray-900/95 py-2 backdrop-blur">
      {TABS.map((t) => {
        const active = t.href === '/' ? path === '/' : [t.href, ...t.also].some((h) => path.startsWith(h))
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-col items-center px-3 text-xs font-semibold ${active ? 'text-indigo-400' : 'text-gray-400'}`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}