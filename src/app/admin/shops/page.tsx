export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase.server'
import ShopStatusActions from '@/components/admin/ShopStatusActions'
import { shopDisplayUrl } from '@/lib/utils'
import type { Tenant } from '@/types'

const TABS = [
  { key: 'all',       label: 'ทั้งหมด'   },
  { key: 'trial',     label: 'Trial'     },
  { key: 'active',    label: 'Active'    },
  { key: 'suspended', label: 'Suspended' },
]

interface Props { searchParams: Promise<{ status?: string }> }

export default async function AdminShopsPage({ searchParams }: Props) {
  const { status = 'all' } = await searchParams
  const supabase = createServiceClient() as any

  let query = supabase.from('tenants').select('*').order('created_at', { ascending: false })
  if (status !== 'all') query = query.eq('plan', status)

  const { data: tenantsRaw } = await query
  const tenants: Tenant[] = tenantsRaw ?? []   // null-safe: Supabase returns null on error, not undefined

  const { data: allRaw } = await supabase.from('tenants').select('plan')
  const all: { plan: string }[] = allRaw ?? []
  const countMap: Record<string, number> = {
    all:       all.length,
    trial:     all.filter(t => t.plan === 'trial').length,
    active:    all.filter(t => t.plan === 'active').length,
    suspended: all.filter(t => t.plan === 'suspended').length,
  }

  return (
    <div className="px-8 py-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="font-syne font-extrabold text-2xl text-krabbie-dark">Shops</h1>
        <p className="font-mono text-xs text-gray-400 mt-0.5">จัดการร้านค้าทั้งหมด</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <a
            key={tab.key}
            href={`/admin/shops${tab.key !== 'all' ? `?status=${tab.key}` : ''}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              status === tab.key
                ? 'border-orange-500 bg-orange-50 text-orange-600'
                : 'border-krabbie-border text-gray-500 hover:border-orange-300 bg-white'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 font-mono text-xs opacity-60">({countMap[tab.key] ?? 0})</span>
          </a>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-krabbie border border-krabbie-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-krabbie-border">
            <tr>
              <th className="text-left px-5 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">ร้าน</th>
              <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Template</th>
              <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">หมดอายุ</th>
              <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">สมัคร</th>
              <th className="px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16 text-gray-400">ไม่มีร้านในหมวดนี้</td></tr>
            ) : tenants.map(t => {
              const expired = t.expires_at && new Date(t.expires_at) < new Date()
              return (
                <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-orange-50/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold leading-tight">{t.name}</div>
                    <a
                      href={`/${t.slug}`}
                      target="_blank"
                      className="font-mono text-xs text-orange-500 hover:underline"
                    >
                      {shopDisplayUrl(t.slug)} ↗
                    </a>
                    <div className="font-mono text-[0.6rem] text-gray-400 mt-0.5">{t.owner_email}</div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 font-mono">{t.template_id}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded ${
                      t.plan === 'active'    ? 'badge-live'                     :
                      t.plan === 'trial'     ? 'badge-trial'                    :
                      t.plan === 'suspended' ? 'bg-red-100 text-red-500'        :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {t.plan}
                    </span>
                    {expired && (
                      <span className="ml-1 text-[0.55rem] font-mono text-red-400">หมดอายุ</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-400">
                    {t.expires_at
                      ? <span className={expired ? 'text-red-400' : ''}>{new Date(t.expires_at).toLocaleDateString('th-TH')}</span>
                      : t.trial_ends_at
                        ? `Trial: ${new Date(t.trial_ends_at).toLocaleDateString('th-TH')}`
                        : '—'}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-400">
                    {new Date(t.created_at).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-4 py-3.5">
                    <ShopStatusActions tenantId={t.id} currentPlan={t.plan} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
