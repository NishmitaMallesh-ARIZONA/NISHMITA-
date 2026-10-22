import Link from 'next/link'

const TILES = [
  { href: '/pulse', icon: '📡', title: 'Campus Pulse', sub: 'Live crowd levels', grad: 'from-emerald-400 to-cyan-500' },
  { href: '/market', icon: '📚', title: 'Market', sub: 'Books, notes, gadgets', grad: 'from-amber-400 to-orange-500' },
  { href: '/communities', icon: '👥', title: 'Communities', sub: 'Clubs and interests', grad: 'from-pink-500 to-rose-500' },
  { href: '/focus', icon: '⏱️', title: 'Focus Room', sub: 'Study with others live', grad: 'from-indigo-500 to-purple-600' },
  { href: '/tickets', icon: '🎟️', title: 'My tickets', sub: 'QR event passes', grad: 'from-sky-400 to-blue-600' },
  { href: '/me', icon: '🏅', title: 'Leaderboard', sub: 'Karma and badges', grad: 'from-fuchsia-500 to-violet-600' },
]

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-gray-950">
      <header className="sticky top-0 px-4 py-3">
        <h1 className="text-xl font-bold">🧭 Explore CampusCircle</h1>
      </header>
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 p-4">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            style={{ color: '#fff' }}
            className={`rounded-2xl bg-gradient-to-br ${t.grad} p-4 shadow-lg`}
          >
            <p className="text-3xl">{t.icon}</p>
            <p className="mt-2 font-bold">{t.title}</p>
            <p className="text-xs opacity-90">{t.sub}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}