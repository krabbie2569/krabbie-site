export const runtime = 'edge'

import { getTenantBySlug } from '@/lib/tenant'
import { createServerSupabaseClient } from '@/lib/supabase.server'
import { notFound } from 'next/navigation'
import SlipUploader from '@/components/payment/SlipUploader'
import TenantAdminSidebar from '@/components/tenant/TenantAdminSidebar'

interface Props { params: Promise<{ tenant: string }> }

export default async function BillingPage({ params }: Props) {
  const { tenant: tenantSlug } = await params
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) notFound()

  const supabase = await createServerSupabaseClient()
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const REVIEW_LABEL: Record<string, { label: string; cls: string }> = {
    pending:        { label: 'รอตรวจ',      cls: 'badge-trial' },
    auto_approved:  { label: '✓ Auto',       cls: 'badge-live' },
    admin_approved: { label: '✓ Admin',      cls: 'badge-live' },
    rejected:       { label: '✗ ปฏิเสธ',   cls: 'bg-red-100 text-red-600 font-mono text-[0.6rem] px-2 py-0.5 rounded' },
  }

  const expiresAt = tenant.expires_at
    ? new Date(tenant.expires_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar slug={tenantSlug} shopName={tenant.name} plan={tenant.plan} />
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50 pb-16">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* CURRENT STATUS */}
        <div className="card">
          <div className="sec-label mb-3">สถานะแพลน</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-syne font-bold text-lg capitalize">
                🦀 Standard
              </div>
              <div className="text-sm text-gray-500 mt-0.5">
                {tenant.plan === 'trial'
                  ? `ทดลองฟรี · หมด ${tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString('th-TH') : '?'}`
                  : tenant.plan === 'active'
                    ? `Active · หมดอายุ ${expiresAt}`
                    : 'ระงับการใช้งาน'}
              </div>
            </div>
            <span className={`font-mono text-xs px-2 py-1 rounded ${
              tenant.plan === 'active'    ? 'badge-live' :
              tenant.plan === 'trial'     ? 'badge-trial' :
              'bg-red-100 text-red-600'
            }`}>
              {tenant.plan === 'active' ? 'ACTIVE' : tenant.plan === 'trial' ? 'TRIAL' : 'SUSPENDED'}
            </span>
          </div>
        </div>

        {/* UPLOAD SLIP */}
        <div className="card">
          <div className="sec-label mb-4">ชำระเงิน / ต่ออายุ</div>
          <SlipUploader
            tenantSlug={tenantSlug}
            currentPlan="standard"
            onSuccess={() => {}}
          />
        </div>

        {/* PAYMENT HISTORY */}
        {payments && payments.length > 0 && (
          <div className="card">
            <div className="sec-label mb-3">ประวัติการชำระ</div>
            <div className="space-y-2">
              {payments.map((p: any) => {
                const review = REVIEW_LABEL[p.review_status] ?? REVIEW_LABEL['pending']
                return (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="text-sm font-semibold capitalize">{p.plan_type} · {p.months} เดือน</div>
                      <div className="font-mono text-xs text-gray-400">
                        {new Date(p.created_at).toLocaleDateString('th-TH')}
                        {p.verify_method && ` · via ${p.verify_method}`}
                      </div>
                      {p.rejection_reason && (
                        <div className="text-xs text-red-500 mt-0.5">{p.rejection_reason}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-syne font-bold text-orange-500">{Number(p.amount).toLocaleString()} ฿</div>
                      <span className={review.cls}>{review.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
      </main>
    </div>
  )
}
