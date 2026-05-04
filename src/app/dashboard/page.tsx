export const runtime = 'edge'

import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase.server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardSidebar from '@/components/account/DashboardSidebar'
import ExtendShopButton from '@/components/account/ExtendShopButton'
import { shopDisplayUrl } from '@/lib/utils'

export default async function DashboardPage() {
  const supabaseAuth = await createServerSupabaseClient() as any
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  // Use service client so RLS/column issues never block the query
  const supabase = createServiceClient() as any

  const [shopsRes, profileRes] = await Promise.all([
    supabase
      .from('tenants')
      .select('id, slug, name, plan, plan_type, trial_ends_at, expires_at, template_id, created_at')
      .or(`auth_user_id.eq.${user.id},owner_email.eq.${user.email}`)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('seeds, display_name')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  const shopsRaw = shopsRes.data
  const { data: profile } = profileRes

  const shops  = shopsRaw ?? []
  const seeds  = profile?.seeds ?? 0
  const name   = profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'คุณ'

  const planBadge = (shop: any) => {
    if (shop.plan === 'active')    return { label: 'ACTIVE',    cls: 'badge-live' }
    if (shop.plan === 'trial')     return { label: 'TRIAL',     cls: 'badge-trial' }
    if (shop.plan === 'suspended') return { label: 'SUSPENDED', cls: 'bg-red-100 text-red-600 font-mono text-[0.6rem] px-2 py-0.5 rounded' }
    return { label: shop.plan.toUpperCase(), cls: 'bg-gray-100 text-gray-500 font-mono text-[0.6rem] px-2 py-0.5 rounded' }
  }

  const daysLeft = (shop: any): number | null => {
    const end = shop.expires_at ? new Date(shop.expires_at)
      : shop.trial_ends_at ? new Date(shop.trial_ends_at)
      : null
    if (!end) return null
    return Math.ceil((end.getTime() - Date.now()) / 86_400_000)
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar email={user.email ?? ''} />
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* WELCOME */}
        <div className="mb-6">
          <h1 className="font-syne text-xl font-bold">สวัสดี, {name} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">จัดการเว็บร้านของคุณได้ที่นี่เลย</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT: SHOPS ── */}
          <div className="flex-1 min-w-0">

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-syne font-bold text-base">เว็บร้านของฉัน</h2>
              <Link href="/dashboard/new" className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
                + สร้างร้านใหม่
              </Link>
            </div>

            {shops.length === 0 ? (
              <div className="card text-center py-14">
                <div className="text-5xl mb-4">🏪</div>
                <h2 className="font-syne font-bold text-lg mb-2">ยังไม่มีเว็บร้าน</h2>
                <p className="text-gray-500 text-sm mb-1">กด "สร้างร้านใหม่" เลือก template แล้วตั้งชื่อร้าน</p>
                <p className="text-gray-400 text-xs mb-6 font-mono">ใช้ 1 seed เพื่อเปิดใช้งาน 30 วัน</p>
                <Link href="/dashboard/new" className="btn-primary inline-block px-8">
                  สร้างร้านแรก →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {shops.map((shop: any) => {
                  const badge = planBadge(shop)
                  const days  = daysLeft(shop)
                  const expired = days !== null && days <= 0
                  return (
                    <div key={shop.id} className="card flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl flex-shrink-0">🏪</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <Link href={`/${shop.slug}/admin`} className="font-bold text-sm hover:text-orange-500 transition-colors">
                            {shop.name} →
                          </Link>
                          <span className={badge.cls}>{badge.label}</span>
                        </div>
                        <div className="font-mono text-xs text-gray-400">{shopDisplayUrl(shop.slug)}</div>
                        {days !== null && (
                          <div className={`font-mono text-[0.6rem] mt-0.5 font-bold ${
                            expired        ? 'text-red-500' :
                            days <= 7      ? 'text-orange-500' :
                                             'text-teal-600'
                          }`}>
                            {expired ? 'หมดอายุแล้ว' : `เหลืออีก ${days} วัน`}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0 items-start">
                        <Link href={`/${shop.slug}`} target="_blank" className="text-xs px-3 py-1.5 rounded-lg border border-krabbie-border text-gray-500 hover:border-orange-300 transition-colors">
                          ดูเว็บ ↗
                        </Link>
                        <ExtendShopButton shopId={shop.id} seeds={seeds} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: SIDEBAR ── */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-4">

            {/* Seeds card */}
            <div className="card border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50">
              <div className="flex items-center justify-between mb-3">
                <div className="font-syne font-bold text-sm">🌱 Seed ของฉัน</div>
                <div className="font-mono text-2xl font-bold text-orange-500">{seeds}</div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                1 seed = เปิดใช้งานเว็บ 1 ร้าน นาน <strong>30 วัน</strong><br/>
                ซื้อกี่ร้านก็ใช้กี่ seed ง่ายมาก
              </p>
              {seeds === 0 ? (
                <div className="bg-orange-500/10 text-orange-700 text-xs rounded-lg px-3 py-2 font-mono">
                  📩 ติดต่อ LINE: @krabbie เพื่อซื้อ seed
                </div>
              ) : (
                <div className="bg-teal-50 text-teal-700 text-xs rounded-lg px-3 py-2 font-mono">
                  ✓ มี {seeds} seed พร้อมใช้งาน
                </div>
              )}
            </div>

            {/* How to use */}
            <div className="card">
              <div className="font-syne font-bold text-sm mb-3">📋 วิธีเริ่มต้น</div>
              <ol className="space-y-3">
                {[
                  { n:'1', title:'สร้างร้าน', desc:'กด "+ สร้างร้านใหม่" เลือก template แล้วตั้งชื่อ' },
                  { n:'2', title:'ได้เว็บทันที', desc:'ระบบสร้าง yourshop.krabbie.com ให้อัตโนมัติ (ทดลองได้เลย)' },
                  { n:'3', title:'ซื้อ seed เปิดใช้', desc:'โอนเงิน 150 ฿ → แอดมินเพิ่ม seed → กด Activate ได้เลย' },
                ].map(s => (
                  <li key={s.n} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-500 text-white text-[0.6rem] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</div>
                    <div>
                      <div className="text-xs font-bold">{s.title}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Contact */}
            <div className="card text-center py-4">
              <div className="text-xs text-gray-500 mb-1">มีคำถาม? ติดต่อเราได้เลย</div>
              <div className="font-mono text-sm font-bold text-orange-500">LINE: @krabbie</div>
              <div className="font-mono text-xs text-gray-400 mt-0.5">ตอบทุกวัน 9:00–21:00</div>
            </div>

          </div>
        </div>
      </div>
      </main>
    </div>
  )
}
