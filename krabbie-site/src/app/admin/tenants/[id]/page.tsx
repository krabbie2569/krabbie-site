export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase.server'
import { formatPrice } from '@/lib/utils'
import TenantActions from './TenantActions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TenantDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient() as any

  const [{ data: tenant }, { data: bookings }, { data: payments }] = await Promise.all([
    supabase.from('tenants').select('*').eq('id', id).single(),
    supabase.from('bookings').select('id, status, created_at').eq('tenant_id', id).order('created_at', { ascending: false }).limit(20),
    supabase.from('payments').select('*').eq('tenant_id', id).order('created_at', { ascending: false }),
  ])

  if (!tenant) notFound()

  const planColors: Record<string, string> = {
    trial: 'badge-trial',
    active: 'badge-live',
    suspended: 'bg-red-100 text-red-500',
    cancelled: 'bg-gray-100 text-gray-400',
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAV */}
      <div className="bg-krabbie-dark px-6 py-4 flex items-center gap-3">
        <Link href="/admin" className="text-gray-400 hover:text-white text-sm font-mono transition-colors">← Back</Link>
        <span className="text-gray-600">|</span>
        <span className="text-2xl">🦀</span>
        <span className="font-syne text-white font-bold">Krabbie</span>
        <span className="font-mono text-orange-500 text-xs">/ {tenant.slug}</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* TENANT HEADER */}
        <div className="card">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-syne text-xl font-bold">{tenant.name}</h1>
              <div className="font-mono text-sm text-orange-500 mt-0.5">{tenant.slug}.krabbie.com</div>
              <div className="text-sm text-gray-500 mt-1">{tenant.owner_email} · {tenant.owner_phone}</div>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <span className={`text-[0.6rem] font-mono px-2 py-1 rounded ${planColors[tenant.plan] ?? 'bg-gray-100 text-gray-400'}`}>
                {tenant.plan.toUpperCase()}
              </span>
              {tenant.plan_type && (
                <span className={`text-[0.6rem] font-mono px-2 py-1 rounded ${
                  tenant.plan_type === 'pro' ? 'bg-teal-light text-teal-dark' : 'bg-orange-50 text-orange-500'
                }`}>
                  {tenant.plan_type === 'pro' ? 'Pro 299฿' : tenant.plan_type === 'trial' ? 'Trial' : 'Standard 150฿'}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 text-sm">
            <div>
              <div className="text-xs text-gray-400 font-mono">Template</div>
              <div className="font-semibold">{tenant.template_id}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-mono">สมัครเมื่อ</div>
              <div className="font-semibold">{new Date(tenant.created_at).toLocaleDateString('th-TH')}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-mono">Trial หมด</div>
              <div className="font-semibold">
                {tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString('th-TH') : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-mono">หมดอายุ</div>
              <div className="font-semibold">
                {tenant.expires_at ? new Date(tenant.expires_at).toLocaleDateString('th-TH') : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <TenantActions tenant={tenant} />

        {/* QUICK LINKS */}
        <div className="flex gap-3 flex-wrap">
          <a
            href={`//${tenant.slug}.krabbie.com`}
            target="_blank"
            className="text-sm px-4 py-2 rounded-lg border border-krabbie-border text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors font-semibold"
          >
            🌐 หน้าร้าน ↗
          </a>
          <a
            href={`//${tenant.slug}.krabbie.com/admin`}
            target="_blank"
            className="text-sm px-4 py-2 rounded-lg border border-krabbie-border text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors font-semibold"
          >
            ⚙️ Admin Panel ↗
          </a>
        </div>

        {/* PAYMENTS */}
        <div>
          <div className="sec-label mb-3">ประวัติการชำระเงิน ({payments?.length ?? 0})</div>
          {!payments || payments.length === 0 ? (
            <div className="card text-center py-8 text-gray-400 text-sm">ยังไม่มีการชำระเงิน</div>
          ) : (
            <div className="space-y-2">
              {payments.map((p: any) => (
                <div key={p.id} className="card flex items-center gap-4 py-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-syne font-bold text-orange-500">{formatPrice(p.amount)}</span>
                      <span className="text-xs text-gray-400">{p.months} เดือน</span>
                      <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded ${
                        p.plan_type === 'pro' ? 'bg-teal-light text-teal-dark' : 'bg-orange-50 text-orange-500'
                      }`}>{p.plan_type === 'pro' ? 'Pro' : 'Standard'}</span>
                    </div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                      {new Date(p.created_at).toLocaleString('th-TH')}
                    </div>
                  </div>
                  <span className={`text-[0.6rem] font-mono px-2 py-1 rounded ${
                    p.review_status === 'admin_approved' ? 'badge-live' :
                    p.review_status === 'pending' ? 'badge-trial' : 'bg-red-100 text-red-500'
                  }`}>
                    {p.review_status === 'admin_approved' ? '✓ อนุมัติ' :
                     p.review_status === 'pending' ? 'รอตรวจ' : 'ปฏิเสธ'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT BOOKINGS */}
        <div>
          <div className="sec-label mb-3">การจองล่าสุด ({bookings?.length ?? 0})</div>
          {!bookings || bookings.length === 0 ? (
            <div className="card text-center py-8 text-gray-400 text-sm">ยังไม่มีการจอง</div>
          ) : (
            <div className="bg-white rounded-krabbie border border-krabbie-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-krabbie-border">
                  <tr>
                    <th className="text-left px-4 py-2 font-mono text-[0.6rem] text-gray-400 uppercase">ID</th>
                    <th className="text-left px-4 py-2 font-mono text-[0.6rem] text-gray-400 uppercase">Status</th>
                    <th className="text-left px-4 py-2 font-mono text-[0.6rem] text-gray-400 uppercase">วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b: any) => (
                    <tr key={b.id} className="border-b border-gray-50">
                      <td className="px-4 py-2 font-mono text-xs text-gray-400">{b.id.slice(0, 8)}…</td>
                      <td className="px-4 py-2">
                        <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded ${
                          b.status === 'confirmed' ? 'badge-live' :
                          b.status === 'pending' ? 'badge-trial' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-500' :
                          'bg-gray-100 text-gray-500'
                        }`}>{b.status}</span>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-gray-400">
                        {new Date(b.created_at).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
