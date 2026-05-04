'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin',             label: 'Dashboard', icon: '▤' },
  { href: '/admin/shops',       label: 'Shops',     icon: '⊞' },
  { href: '/admin/templates',   label: 'Templates', icon: '◧' },
  { href: '/admin/users',       label: 'Users',     icon: '◎' },
  { href: '/admin/seeds',       label: 'Seeds',     icon: '◈' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 bg-krabbie-dark flex-shrink-0 flex flex-col min-h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🦀</span>
          <div>
            <div className="font-syne text-white font-bold leading-tight">Krabbie</div>
            <div className="font-mono text-orange-400 text-[0.5rem] uppercase tracking-widest">Super Admin</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map(n => {
          const active = n.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(n.href)
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                active
                  ? 'bg-orange-500 text-white border-orange-400 shadow-md'
                  : 'text-white border-white/10 bg-white/5 hover:bg-white/15 hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center">{n.icon}</span>
              {n.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <p className="font-mono text-white/40 text-[0.55rem] truncate mb-1">stock@4k.co.th</p>
        <Link href="/" className="font-mono text-white/60 text-[0.6rem] hover:text-white transition-colors">
          ← กลับหน้าหลัก
        </Link>
      </div>
    </aside>
  )
}
