import Link from 'next/link'

const TILES = [
  { href: '/library', icon: '📚', title: 'Library', sub: 'Notes, papers, journals', tint: 'bg-orange-100' },
  { href: '/market', icon: '🛒', title: 'Market', sub: 'Books, notes, gadgets', tint: 'bg-amber-100' },
  { href: '/communities', icon: '👥', title: 'Communities', sub: 'Clubs and interests', tint: 'bg-rose-100' },
  { href: '/pulse', icon: '📡', title: 'Campus Pulse', sub: 'Live crowd levels', tint: 'bg-emerald-100' },
  { href: '/focus', icon: '⏱️', title: 'Focus Room', sub: 'Study with others live', tint: 'bg-indigo-100' },
  { href: '/tickets', icon: '🎟️', title: 'My tickets', sub: 'QR event passes', tint: 'bg-sky-100' },
  { href: '/me', icon: '🏅', title: 'Leaderboard', sub: 'Karma and badges', tint: 'bg-violet-100' },
]

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-gray-950">
      <header className="sticky top-0 px-4 py-3">
        <h1 className="text-xl font-bold">Explore Off Campus</h1>
      </header>
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 p-4">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="block rounded-2xl bg-gray-900 p-4">
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${t.tint}`}>
              {t.icon}
            </span>
            <p className="mt-2 font-semibold">{t.title}</p>
            <p className="text-xs text-gray-400">{t.sub}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}