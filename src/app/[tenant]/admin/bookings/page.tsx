export const runtime = 'edge'

import { getTenantBySlug } from '@/lib/tenant'
import { createServiceClient } from '@/lib/supabase.server'
import { notFound } from 'next/navigation'
import { formatDateTH, formatTime, formatPrice } from '@/lib/utils'
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR } from '@/types'
import TenantAdminSidebar from '@/components/tenant/TenantAdminSidebar'
import BookingActions from '@/components/admin/BookingActions'

interface Props {
  params:      Promise<{ tenant: string }>
  searchParams: Promise<{ status?: string }>
}

const STATUS_TABS = [
  { key: '',          label: 'ทั้งหมด' },
  { key: 'pending',   label: 'รอยืนยัน' },
  { key: 'confirmed', label: 'ยืนยันแล้ว' },
  { key: 'completed', label: 'เสร็จสิ้น' },
  { key: 'cancelled', label: 'ยกเลิก' },
]

export default async function BookingsPage({ params, searchParams }: Props) {
  const { tenant: tenantSlug } = await params
  const { status = '' } = await searchParams
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) notFound()

  const supabase = createServiceClient() as any
  let query = supabase
    .from('bookings')
    .select('*, services(name, price), time_slots(date, start_time, end_time)')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) query = query.eq('status', status)

  const { data: bookings } = await query

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar slug={tenantSlug} shopName={tenant.name} plan={tenant.plan} />
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50 pb-16">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">

          <div className="sec-label">การจองทั้งหมด</div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_TABS.map(t => (
              <a key={t.key}
                href={`/${tenantSlug}/admin/bookings${t.key ? `?status=${t.key}` : ''}`}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  status === t.key
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white border-krabbie-border hover:border-orange-300'
                }`}
              >
                {t.label}
              </a>
            ))}
          </div>

          {/* Booking list */}
          <div className="space-y-3">
            {(!bookings || bookings.length === 0) ? (
              <div className="card text-center py-12 text-gray-400 text-sm">ไม่มีการจอง</div>
            ) : bookings.map((b: any) => (
              <div key={b.id} className="card py-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{b.customer_name}</div>
                    <div className="text-xs text-gray-400">{b.customer_phone}</div>
                    {b.customer_email && <div className="text-xs text-gray-400">{b.customer_email}</div>}
                    <div className="font-mono text-xs text-gray-500 mt-1">
                      {b.time_slots?.date ? formatDateTH(b.time_slots.date) : '—'}
                      {b.time_slots?.start_time ? ` · ${formatTime(b.time_slots.start_time)}` : ''}
                      {b.time_slots?.end_time ? `–${formatTime(b.time_slots.end_time)}` : ''}
                    </div>
                    <div className="text-xs text-orange-500 mt-0.5">{b.services?.name ?? '—'}</div>
                    {b.customer_note && (
                      <div className="text-xs text-gray-400 mt-1 italic">"{b.customer_note}"</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded ${
                      BOOKING_STATUS_COLOR[b.status as keyof typeof BOOKING_STATUS_COLOR]
                    }`}>
                      {BOOKING_STATUS_LABEL[b.status as keyof typeof BOOKING_STATUS_LABEL]}
                    </span>
                    {b.services?.price && (
                      <div className="font-syne font-bold text-orange-500 text-sm mt-1">
                        {formatPrice(b.services.price)}
                      </div>
                    )}
                  </div>
                </div>
                {b.status === 'pending' && <BookingActions bookingId={b.id} />}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
