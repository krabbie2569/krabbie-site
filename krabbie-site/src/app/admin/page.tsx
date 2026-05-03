export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase.server'
import { formatPrice } from '@/lib/utils'
import { TENANT_PLAN_LABEL } from '@/types'
import StatsCard from '@/components/admin/StatsCard'
import LogoutButton from '@/components/admin/LogoutButton'
import type { AdminStats, Tenant } from '@/types'

export default async function SuperAdminPage() {
  const supabase = createServiceClient() as any

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  const list = (tenants as (Tenant & { plan_type: string })[]) ?? []

  const activeTenants = list.filter(t => t.plan === 'active')
  const mrr = activeTenants.reduce((sum, t) => {
    return sum + (t.plan_type === 'pro' ? 299 : 150)
  }, 0)

  const stats: AdminStats = {
    totalTenants:  list.length,
    activeTenants: activeTenants.length,
    trialTenants:  list.filter(t => t.plan === 'trial').length,
    mrr,
    totalBookings: 0,
  }

  const bepTarget = 900
  const bepProgress = Math.min((mrr / bepTarget) * 100, 100)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAV */}
      <div className="bg-krabbie-dark px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦀</span>
          <div>
            <span className="font-syne text-white font-bold">Krabbie</span>
            <span className="font-mono text-orange-500 text-xs ml-2">SUPER ADMIN</span>
          </div>
          <span className="text-gray-600 mx-1">|</span>
          <Link href="/admin/payments" className="text-gray-400 hover:text-white text-sm font-mono transition-colors">
            💳 Payments
          </Link>
        </div>
        <LogoutButton />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* STATS */}
        <div>
          <div className="sec-label mb-4">Overview</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatsCard label="ร้านทั้งหมด" value={String(stats.totalTenants)}  sub="ร้าน"        color="orange" />
            <StatsCard label="Active"        value={String(stats.activeTenants)} sub="จ่ายเงินแล้ว" color="teal"   />
            <StatsCard label="Trial"         value={String(stats.trialTenants)}  sub="ทดลองอยู่"   color="yellow" />
            <StatsCard label="MRR"           value={formatPrice(stats.mrr)}      sub="ต่อเดือน"    color="teal"   />
            <StatsCard label="BEP"           value={`${Math.round(bepProgress)}%`} sub={`${formatPrice(mrr)}/${formatPrice(bepTarget)}`} color="orange" />
          </div>
        </div>

        {/* BEP PROGRESS */}
        <div className="card">
          <div className="flex justify-between items-baseline mb-2">
            <span className="font-semibold text-sm">Progress to BEP (900 ฿/เดือน)</span>
            <span className="font-mono text-xs text-gray-400">{formatPrice(mrr)} / {formatPrice(bepTarget)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${bepProgress}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {mrr >= bepTarget
              ? '🎉 ถึง BEP แล้ว!'
              : `ขาดอีก ${formatPrice(bepTarget - mrr)} ต่อเดือน`}
          </p>
        </div>

        {/* TENANT TABLE */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="sec-label">ร้านค้าทั้งหมด ({list.length})</div>
          </div>
          <div className="bg-white rounded-krabbie border border-krabbie-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-krabbie-border">
                <tr>
                  <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">ร้าน</th>
                  <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Subdomain</th>
                  <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Template</th>
                  <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">สมัครเมื่อ</th>
                  <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">ยังไม่มีร้านค้า</td></tr>
                ) : list.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.owner_email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-orange-500">{t.slug}.krabbie.com</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{t.template_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded w-fit ${
                          t.plan === 'active' ? 'badge-live' :
                          t.plan === 'trial'  ? 'badge-trial' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {TENANT_PLAN_LABEL[t.plan]}
                        </span>
                        {t.plan_type && (t.plan_type as string) !== 'trial' && (
                          <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded w-fit ${
                            t.plan_type === 'pro' ? 'bg-teal-light text-teal-dark' : 'bg-orange-50 text-orange-500'
                          }`}>
                            {t.plan_type === 'pro' ? 'Pro 299฿' : 'Standard 150฿'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {new Date(t.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/tenants/${t.id}`}
                          className="text-xs px-2 py-1 rounded bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors font-semibold"
                        >
                          จัดการ
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
