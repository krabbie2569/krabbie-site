import { createServiceClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { TENANT_PLAN_LABEL } from '@/types'
import StatsCard from '@/components/admin/StatsCard'
import type { AdminStats, Tenant } from '@/types'

// Super Admin — จัดการ tenants ทั้งหมด
export default async function SuperAdminPage() {
  const supabase = createServiceClient()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  const list = (tenants as Tenant[]) ?? []

  const stats: AdminStats = {
    totalTenants:  list.length,
    activeTenants: list.filter(t => t.plan === 'active').length,
    trialTenants:  list.filter(t => t.plan === 'trial').length,
    mrr:           list.filter(t => t.plan === 'active').length * 150,
    totalBookings: 0,
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-krabbie-dark px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">🦀</span>
        <div>
          <span className="font-syne text-white font-bold">Krabbie</span>
          <span className="font-mono text-orange-500 text-xs ml-2">SUPER ADMIN</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* STATS */}
        <div>
          <div className="sec-label mb-4">Overview</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatsCard label="ร้านทั้งหมด"   value={String(stats.totalTenants)}  sub="ร้าน"        color="orange" />
            <StatsCard label="Active"          value={String(stats.activeTenants)} sub="จ่ายเงินแล้ว" color="teal"   />
            <StatsCard label="Trial"           value={String(stats.trialTenants)}  sub="ทดลองอยู่"   color="yellow" />
            <StatsCard label="MRR"             value={formatPrice(stats.mrr)}      sub="ต่อเดือน"    color="teal"   />
            <StatsCard label="ถึง BEP"         value={`${stats.activeTenants}/6`}  sub="ร้าน"        color="orange" />
          </div>
        </div>

        {/* MRR PROGRESS BAR */}
        <div className="card">
          <div className="flex justify-between items-baseline mb-2">
            <span className="font-semibold text-sm">Progress to BEP</span>
            <span className="font-mono text-xs text-gray-400">{stats.activeTenants} / 6 ร้าน</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{ width: `${Math.min((stats.activeTenants / 6) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">ต้องการ {Math.max(0, 6 - stats.activeTenants)} ร้านเพิ่มเพื่อถึง BEP (900 ฿/เดือน)</p>
        </div>

        {/* TENANT TABLE */}
        <div>
          <div className="sec-label mb-4">ร้านค้าทั้งหมด</div>
          <div className="bg-white rounded-krabbie border border-krabbie-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-krabbie-border">
                <tr>
                  <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">ร้าน</th>
                  <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Subdomain</th>
                  <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Template</th>
                  <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">สมัครเมื่อ</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">ยังไม่มีร้านค้า</td>
                  </tr>
                ) : list.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.owner_email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-orange-500">{t.slug}.krabbie.com</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{t.template_id}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded ${
                        t.plan === 'active'    ? 'badge-live' :
                        t.plan === 'trial'     ? 'badge-trial' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {TENANT_PLAN_LABEL[t.plan]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {new Date(t.created_at).toLocaleDateString('th-TH')}
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
