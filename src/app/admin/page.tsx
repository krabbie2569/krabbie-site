export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase.server'
import StatsCard from '@/components/admin/StatsCard'
import { formatPrice } from '@/lib/utils'
import type { AdminStats, Tenant, SeedTransaction } from '@/types'

export default async function SuperAdminPage() {
  const supabase = createServiceClient() as any

  const [tenantsRes, seedTxRes, profilesRes] = await Promise.all([
    supabase.from('tenants').select('*').order('created_at', { ascending: false }),
    supabase.from('seed_transactions').select('*, tenants(slug,name)').order('created_at', { ascending: false }).limit(8),
    supabase.from('profiles').select('seeds'),
  ])

  const tenants: Tenant[] = tenantsRes.data ?? []
  const seedTx: (SeedTransaction & { tenants: { slug: string; name: string } | null })[] = seedTxRes.data ?? []
  const profiles: { seeds: number }[] = profilesRes.data ?? []

  const seedsIssued  = seedTx.filter(t => t.delta > 0).reduce((s, t) => s + t.delta, 0)
  const seedsBalance = profiles.reduce((s, p) => s + (p.seeds ?? 0), 0)

  const stats: AdminStats = {
    totalUsers:       0,
    totalTenants:     tenants.length,
    activeTenants:    tenants.filter(t => t.plan === 'active').length,
    trialTenants:     tenants.filter(t => t.plan === 'trial').length,
    suspendedTenants: tenants.filter(t => t.plan === 'suspended').length,
    seedsIssued,
    seedsBalance,
    mrr: tenants.filter(t => t.plan === 'active').length * 150,
  }

  const bepTarget = 6
  const bepPct    = Math.min((stats.activeTenants / bepTarget) * 100, 100)

  return (
    <div className="px-8 py-8 space-y-8 max-w-5xl">

      <div>
        <h1 className="font-syne font-extrabold text-2xl text-krabbie-dark">Dashboard</h1>
        <p className="font-mono text-xs text-gray-400 mt-0.5">ภาพรวมระบบ Krabbie</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="ร้านทั้งหมด"   value={String(stats.totalTenants)}     sub="ร้าน"         color="orange" />
        <StatsCard label="Active"         value={String(stats.activeTenants)}    sub="กำลังใช้งาน"   color="teal"   />
        <StatsCard label="Trial"          value={String(stats.trialTenants)}     sub="ทดลองอยู่"     color="yellow" />
        <StatsCard label="Suspended"      value={String(stats.suspendedTenants)} sub="ระงับชั่วคราว" color="gray"   />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Seeds ออกไปแล้ว"   value={String(stats.seedsIssued)}  sub="เมล็ด"       color="orange" />
        <StatsCard label="Seeds คงเหลือรวม"  value={String(stats.seedsBalance)} sub="ในมือลูกค้า"  color="teal"   />
        <StatsCard label="MRR"               value={formatPrice(stats.mrr)}     sub="ต่อเดือน"     color="teal"   />
        <StatsCard label="ถึง BEP"           value={`${stats.activeTenants}/${bepTarget}`} sub="ร้าน" color="orange" />
      </div>

      {/* BEP Progress */}
      <div className="bg-white rounded-krabbie border border-krabbie-border p-5">
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-semibold text-sm">Progress to BEP</span>
          <span className="font-mono text-xs text-gray-400">{stats.activeTenants} / {bepTarget} ร้าน</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${bepPct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {stats.activeTenants >= bepTarget
            ? `ถึง BEP แล้ว 🎉 กำไร ${formatPrice(stats.mrr - 900)}/เดือน`
            : `ต้องการอีก ${bepTarget - stats.activeTenants} ร้านเพื่อถึง BEP (900 ฿/เดือน)`}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Shops */}
        <div className="bg-white rounded-krabbie border border-krabbie-border overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-sm">ร้านล่าสุด</span>
            <a href="/admin/shops" className="text-xs text-orange-500 hover:underline">ดูทั้งหมด →</a>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {tenants.slice(0, 6).map(t => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm leading-tight">{t.name}</div>
                    <div className="font-mono text-[0.6rem] text-orange-500">{t.slug}.krabbie.com</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded ${
                      t.plan === 'active'    ? 'badge-live'  :
                      t.plan === 'trial'     ? 'badge-trial' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {t.plan}
                    </span>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr><td colSpan={2} className="text-center py-8 text-gray-400 text-sm">ยังไม่มีร้าน</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Seed Transactions */}
        <div className="bg-white rounded-krabbie border border-krabbie-border overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-sm">Seed ล่าสุด</span>
            <a href="/admin/seeds" className="text-xs text-orange-500 hover:underline">ดูทั้งหมด →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {seedTx.slice(0, 6).map(tx => (
              <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs text-gray-500 truncate max-w-[160px]">
                    {tx.admin_email ?? '—'}
                  </div>
                  <div className="text-xs text-gray-400">{tx.note ?? 'ไม่มีหมายเหตุ'}</div>
                </div>
                <span className={`font-mono font-bold text-sm ${tx.delta > 0 ? 'text-teal-dark' : 'text-red-500'}`}>
                  {tx.delta > 0 ? `+${tx.delta}` : tx.delta} 🌱
                </span>
              </div>
            ))}
            {seedTx.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">ยังไม่มี seed transaction</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
