'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

const NAV = [
  { href: '/dashboard', label: 'ภาพรวม',     icon: '▤', exact: true },
  { href: '/account',   label: 'โปรไฟล์',    icon: '◎' },
]

export default function DashboardSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  return (
    <aside className="w-56 bg-krabbie-dark flex-shrink-0 flex flex-col min-h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🦀</span>
          <div>
            <div className="font-syne text-white font-bold leading-tight">Krabbie</div>
            <div className="font-mono text-orange-400 text-[0.5rem] uppercase tracking-widest">My Account</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map(n => {
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href)
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

        <Link
          href="/dashboard/new"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border border-orange-500/40 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 hover:text-orange-300 mt-2"
        >
          <span className="text-base w-5 text-center">＋</span>
          สร้างร้านใหม่
        </Link>
      </nav>

      <div className="px-4 py-4 border-t border-white/10 space-y-2">
        <p className="font-mono text-white/40 text-[0.55rem] truncate">{email}</p>
        <LogoutButton />
      </div>
    </aside>
  )
}
