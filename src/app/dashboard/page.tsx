export const runtime = 'edge'

import { createServerSupabaseClient } from '@/lib/supabase.server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/account/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: shops } = await supabase
    .from('tenants')
    .select('id, slug, name, plan, plan_type, trial_ends_at, expires_at, template_id, created_at')
    .eq('auth_user_id', user.id)
    .order('created_at', { ascending: false })

  const planBadge = (shop: any) => {
    if (shop.plan === 'active')    return { label: 'ACTIVE',    cls: 'badge-live' }
    if (shop.plan === 'trial')     return { label: 'TRIAL',     cls: 'badge-trial' }
    if (shop.plan === 'suspended') return { label: 'SUSPENDED', cls: 'bg-red-100 text-red-600 font-mono text-[0.6rem] px-2 py-0.5 rounded' }
    return { label: shop.plan.toUpperCase(), cls: 'bg-gray-100 text-gray-500 font-mono text-[0.6rem] px-2 py-0.5 rounded' }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-krabbie-dark px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl">🦀</Link>
          <span className="font-syne text-white font-bold">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/account" className="font-mono text-xs text-gray-400 hover:text-white transition-colors">
            {user.user_metadata?.display_name || user.email}
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* PAGE TITLE + NEW SHOP */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-syne text-xl font-bold">เว็บร้านของฉัน</h1>
            <p className="text-gray-500 text-sm mt-0.5">จัดการร้านทั้งหมดของคุณ</p>
          </div>
          <Link
            href="/dashboard/new"
            className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
          >
            + สร้างร้านใหม่
          </Link>
        </div>

        {/* SHOPS LIST */}
        {!shops || shops.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🏪</div>
            <h2 className="font-syne font-bold text-lg mb-2">ยังไม่มีเว็บร้าน</h2>
            <p className="text-gray-500 text-sm mb-6">สร้างร้านแรกของคุณได้เลย ฟรี 14 วัน</p>
            <Link href="/dashboard/new" className="btn-primary inline-block px-8">
              สร้างร้านแรก →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {shops.map((shop: any) => {
              const badge = planBadge(shop)
              return (
                <div key={shop.id} className="card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl flex-shrink-0">
                    🏪
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm">{shop.name}</span>
                      <span className={badge.cls}>{badge.label}</span>
                    </div>
                    <div className="font-mono text-xs text-gray-400">/{shop.slug}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      href={`/${shop.slug}`}
                      target="_blank"
                      className="text-xs px-3 py-1.5 rounded-lg border border-krabbie-border text-gray-500 hover:border-orange-300 transition-colors"
                    >
                      ดูเว็บ ↗
                    </Link>
                    <Link
                      href={`/${shop.slug}/admin`}
                      className="text-xs px-3 py-1.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
                    >
                      จัดการ →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
