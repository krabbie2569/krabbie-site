'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin',        label: 'Dashboard', icon: '▤' },
  { href: '/admin/users',  label: 'Users',     icon: '◎' },
  { href: '/admin/shops',  label: 'Shops',     icon: '⊞' },
  { href: '/admin/seeds',  label: 'Seeds',     icon: '◈' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-52 bg-krabbie-dark flex-shrink-0 flex flex-col min-h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🦀</span>
          <div>
            <div className="font-syne text-white font-bold leading-tight">Krabbie</div>
            <div className="font-mono text-orange-400 text-[0.5rem] uppercase tracking-widest">Super Admin</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map(n => {
          const active = n.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(n.href)
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-base w-5 text-center opacity-80">{n.icon}</span>
              {n.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <p className="font-mono text-white/25 text-[0.5rem] truncate">stock@4k.co.th</p>
        <Link href="/" className="font-mono text-white/40 text-[0.55rem] hover:text-white/70 transition-colors">
          ← กลับหน้าหลัก
        </Link>
      </div>
    </aside>
  )
}
