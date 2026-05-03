import { getTenantBySlug, parseTenantSettings } from '@/lib/tenant'
import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { formatDateTH, formatTime, formatPrice } from '@/lib/utils'
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR } from '@/types'
import type { Booking, Service } from '@/types'
import StatsCard from '@/components/admin/StatsCard'

interface Props {
  params: { tenant: string }
}

export default async function TenantAdminPage({ params }: Props) {
  const tenant = await getTenantBySlug(params.tenant)
  if (!tenant) notFound()

  const supabase = await createServerSupabaseClient()

  const [{ data: bookings }, { data: services }] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, services(name), time_slots(date, start_time, end_time)')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('sort_order'),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const todayBookings  = bookings?.filter(b => (b.time_slots as any)?.date === today) ?? []
  const pendingCount   = bookings?.filter(b => b.status === 'pending').length ?? 0
  const confirmedCount = bookings?.filter(b => b.status === 'confirmed').length ?? 0

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* ADMIN HEADER */}
      <div className="bg-krabbie-dark px-4 py-3 flex items-center justify-between">
        <div>
          <span className="font-syne text-white font-bold">{tenant.name}</span>
          <span className="font-mono text-gray-500 text-xs ml-2">Admin</span>
        </div>
        <span className="badge-trial">{tenant.plan === 'trial' ? 'ทดลองใช้' : 'Active'}</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatsCard label="วันนี้" value={String(todayBookings.length)} sub="การจอง" color="orange" />
          <StatsCard label="รอยืนยัน" value={String(pendingCount)} sub="รายการ" color="yellow" />
          <StatsCard label="ยืนยันแล้ว" value={String(confirmedCount)} sub="รายการ" color="teal" />
          <StatsCard label="บริการ" value={String(services?.length ?? 0)} sub="รายการ" color="gray" />
        </div>

        {/* SERVICES */}
        <div>
          <div className="sec-label mb-3">บริการ</div>
          <div className="space-y-2">
            {(services as Service[] ?? []).map((s) => (
              <div key={s.id} className="card flex items-center gap-3 py-3">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{s.name}</div>
                  <div className="font-mono text-xs text-gray-400">{s.duration_minutes} นาที</div>
                </div>
                <div className="font-syne text-orange-500 font-bold">{formatPrice(s.price)}</div>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${s.is_active ? 'badge-live' : 'bg-gray-100 text-gray-400'}`}>
                  {s.is_active ? 'เปิด' : 'ปิด'}
                </span>
              </div>
            ))}
            {(!services || services.length === 0) && (
              <div className="card text-center py-8 text-gray-400 text-sm">ยังไม่มีบริการ</div>
            )}
          </div>
        </div>

        {/* RECENT BOOKINGS */}
        <div>
          <div className="sec-label mb-3">การจองล่าสุด</div>
          <div className="space-y-2">
            {(bookings as any[] ?? []).map((b) => (
              <div key={b.id} className="card py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm">{b.customer_name}</div>
                    <div className="text-xs text-gray-400">{b.customer_phone}</div>
                    <div className="font-mono text-xs text-gray-400 mt-0.5">
                      {b.time_slots?.date ? formatDateTH(b.time_slots.date) : '—'}
                      {b.time_slots?.start_time ? ` · ${formatTime(b.time_slots.start_time)}` : ''}
                    </div>
                    <div className="text-xs text-orange-500 mt-0.5">{(b.services as any)?.name}</div>
                  </div>
                  <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded flex-shrink-0 ${BOOKING_STATUS_COLOR[b.status as keyof typeof BOOKING_STATUS_COLOR]}`}>
                    {BOOKING_STATUS_LABEL[b.status as keyof typeof BOOKING_STATUS_LABEL]}
                  </span>
                </div>
                {b.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 text-xs bg-teal-light text-teal-dark font-semibold py-1.5 rounded-lg hover:bg-teal-DEFAULT/20 transition-colors">
                      ✓ ยืนยัน
                    </button>
                    <button className="flex-1 text-xs bg-red-50 text-red-500 font-semibold py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                      ✕ ยกเลิก
                    </button>
                  </div>
                )}
              </div>
            ))}
            {(!bookings || bookings.length === 0) && (
              <div className="card text-center py-8 text-gray-400 text-sm">ยังไม่มีการจอง</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
