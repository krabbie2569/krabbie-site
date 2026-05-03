import Link from 'next/link'
import { getTenantBySlug } from '@/lib/tenant'
import { createServerSupabaseClient } from '@/lib/supabase.server'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import type { Service } from '@/types'
import StatsCard from '@/components/admin/StatsCard'
import BookingList from '@/components/admin/BookingList'

interface Props {
  params: Promise<{ tenant: string }>
}

export default async function TenantAdminPage({ params }: Props) {
  const { tenant: tenantSlug } = await params
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) notFound()

  const supabase = await createServerSupabaseClient()

  const [{ data: bookingsRaw }, { data: services }] = await Promise.all([
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

  const bookings = bookingsRaw as any[] | null
  const today = new Date().toISOString().slice(0, 10)
  const todayBookings  = bookings?.filter(b => b.time_slots?.date === today) ?? []
  const pendingCount   = bookings?.filter(b => b.status === 'pending').length ?? 0
  const confirmedCount = bookings?.filter(b => b.status === 'confirmed').length ?? 0

  const isRental = tenant.template_id === 'booking-rental'

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* ADMIN HEADER */}
      <div className="bg-krabbie-dark px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${tenantSlug}`} className="text-gray-400 hover:text-white transition-colors text-sm font-mono">
            ← หน้าร้าน
          </Link>
          <span className="text-gray-600">|</span>
          <div>
            <span className="font-syne text-white font-bold">{tenant.name}</span>
            <span className="font-mono text-gray-500 text-xs ml-2">Admin</span>
          </div>
        </div>
        <span className="badge-trial">{tenant.plan === 'trial' ? 'ทดลองใช้' : 'Active'}</span>
      </div>

      {/* QUICK NAV */}
      <div className="bg-white border-b border-krabbie-border px-4 py-2 flex gap-2 overflow-x-auto">
        {[
          { href: `/${tenantSlug}/admin`,          label: '📊 ภาพรวม',      active: true  },
          { href: `/${tenantSlug}/admin/services`,  label: isRental ? '📦 สินค้า' : '🛠️ บริการ', active: false },
          { href: `/${tenantSlug}/admin/settings`,  label: '⚙️ ตั้งค่า',    active: false },
          { href: `/${tenantSlug}/admin/billing`,   label: '💳 ชำระเงิน',   active: false },
        ].map(({ href, label, active }) => (
          <Link key={href} href={href}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              active ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'
            }`}>
            {label}
          </Link>
        ))}
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
          <div className="flex items-center justify-between mb-3">
            <div className="sec-label">{isRental ? 'สินค้าให้เช่า' : 'บริการ'}</div>
            <Link href={`/${tenantSlug}/admin/services`} className="text-xs text-orange-500 font-semibold hover:underline">
              จัดการ →
            </Link>
          </div>
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
              <div className="card text-center py-8 text-gray-400 text-sm">
                ยังไม่มี{isRental ? 'สินค้า' : 'บริการ'} —{' '}
                <Link href={`/${tenantSlug}/admin/services`} className="text-orange-500 underline">เพิ่มเลย</Link>
              </div>
            )}
          </div>
        </div>

        {/* RECENT BOOKINGS */}
        <div>
          <div className="sec-label mb-3">การจองล่าสุด</div>
          <BookingList initialBookings={(bookings as any[]) ?? []} />
        </div>

      </div>
    </div>
  )
}
