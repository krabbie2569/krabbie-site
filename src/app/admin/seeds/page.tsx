export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase.server'
import type { SeedTransaction } from '@/types'

type TxWithTenant = SeedTransaction & {
  tenants: { slug: string; name: string } | null
}

export default async function AdminSeedsPage() {
  const supabase = createServiceClient() as any

  const [txRes, profilesRes] = await Promise.all([
    supabase
      .from('seed_transactions')
      .select('*, tenants(slug, name)')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase.from('profiles').select('seeds, email'),
  ])

  const txList: TxWithTenant[] = txRes.data ?? []
  const profiles: { seeds: number; email: string }[] = profilesRes.data ?? []

  const totalIssued   = txList.filter(t => t.delta > 0).reduce((s, t) => s + t.delta, 0)
  const totalRedeemed = txList.filter(t => t.delta < 0).reduce((s, t) => s + Math.abs(t.delta), 0)
  const totalBalance  = profiles.reduce((s, p) => s + (p.seeds ?? 0), 0)

  return (
    <div className="px-8 py-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-syne font-extrabold text-2xl text-krabbie-dark">Seeds</h1>
        <p className="font-mono text-xs text-gray-400 mt-0.5">ประวัติการออก seed ทั้งหมด</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-krabbie border border-krabbie-border p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
          <div className="font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider mb-1 pl-1">ออกไปทั้งหมด</div>
          <div className="font-syne font-extrabold text-3xl text-orange-500 pl-1">{totalIssued}</div>
          <div className="font-mono text-[0.65rem] text-gray-400 pl-1">🌱 เมล็ด</div>
        </div>
        <div className="bg-white rounded-krabbie border border-krabbie-border p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-teal-DEFAULT" />
          <div className="font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider mb-1 pl-1">ใช้แล้ว</div>
          <div className="font-syne font-extrabold text-3xl text-teal-dark pl-1">{totalRedeemed}</div>
          <div className="font-mono text-[0.65rem] text-gray-400 pl-1">🌱 เมล็ด</div>
        </div>
        <div className="bg-white rounded-krabbie border border-krabbie-border p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />
          <div className="font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider mb-1 pl-1">คงเหลือในมือลูกค้า</div>
          <div className="font-syne font-extrabold text-3xl text-yellow-600 pl-1">{totalBalance}</div>
          <div className="font-mono text-[0.65rem] text-gray-400 pl-1">🌱 เมล็ด</div>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="bg-white rounded-krabbie border border-krabbie-border overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <span className="font-semibold text-sm">Seed Transaction Log</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-krabbie-border">
            <tr>
              <th className="text-left px-5 py-2.5 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">วันที่</th>
              <th className="text-left px-4 py-2.5 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">User</th>
              <th className="text-center px-4 py-2.5 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Delta</th>
              <th className="text-left px-4 py-2.5 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">หมายเหตุ</th>
              <th className="text-left px-4 py-2.5 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">ร้าน</th>
              <th className="text-left px-4 py-2.5 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Admin</th>
            </tr>
          </thead>
          <tbody>
            {txList.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16 text-gray-400">ยังไม่มีรายการ</td></tr>
            ) : txList.map(tx => (
              <tr key={tx.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-5 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                  {new Date(tx.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[140px] truncate">
                  {tx.user_id.slice(0, 8)}…
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-mono font-bold text-sm ${tx.delta > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                    {tx.delta > 0 ? `+${tx.delta}` : tx.delta} 🌱
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{tx.note ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-orange-500">
                  {tx.tenants ? `${tx.tenants.slug}.krabbie.com` : '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{tx.admin_email ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
