'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  slug:     string
  shopName: string
  plan:     string
}

export default function TenantAdminSidebar({ slug, shopName, plan }: Props) {
  const pathname = usePathname()

  const NAV = [
    { href: `/${slug}/admin`,                label: 'ภาพรวม',    icon: '▤',  exact: true },
    { href: `/${slug}/admin/bookings`,       label: 'การจอง',    icon: '📋' },
    { href: `/${slug}/admin/services`,       label: 'บริการ',    icon: '✂️' },
    { href: `/${slug}/admin/staff`,          label: 'พนักงาน',   icon: '👤' },
    { href: `/${slug}/admin/slots`,          label: 'ตารางเวลา', icon: '🗓' },
    { href: `/${slug}/admin/settings`,       label: 'ตั้งค่า',   icon: '⚙️' },
    { href: `/${slug}/admin/billing`,        label: 'Billing',   icon: '💳' },
  ]

  return (
    <aside className="w-56 bg-krabbie-dark flex-shrink-0 flex flex-col min-h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-lg flex-shrink-0">🏪</div>
          <div className="min-w-0">
            <div className="font-syne text-white font-bold leading-tight truncate text-sm">{shopName}</div>
            <span className={`font-mono text-[0.5rem] uppercase tracking-widest ${
              plan === 'active' ? 'text-teal-400' : plan === 'trial' ? 'text-orange-400' : 'text-red-400'
            }`}>
              {plan}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map(n => {
          const active = n.exact
            ? pathname === n.href || pathname === `/${slug}/admin`
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

        <a
          href={`/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white"
        >
          <span className="text-base w-5 text-center">🌐</span>
          ดูเว็บร้าน ↗
        </a>
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-white/50 hover:text-white text-xs font-mono transition-colors"
        >
          ← กลับ Dashboard
        </Link>
      </div>
    </aside>
  )
}
