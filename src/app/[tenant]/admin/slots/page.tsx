export const runtime = 'edge'

import { getTenantBySlug } from '@/lib/tenant'
import { createServiceClient } from '@/lib/supabase.server'
import { notFound } from 'next/navigation'
import TenantAdminSidebar from '@/components/tenant/TenantAdminSidebar'
import SlotsManager from '@/components/admin/SlotsManager'

interface Props { params: Promise<{ tenant: string }> }

export default async function SlotsPage({ params }: Props) {
  const { tenant: tenantSlug } = await params
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) notFound()

  const supabase = createServiceClient() as any

  // Fetch slots for next 30 days
  const today = new Date().toISOString().slice(0, 10)
  const future = new Date(); future.setDate(future.getDate() + 30)
  const futureStr = future.toISOString().slice(0, 10)

  const { data: slots } = await supabase
    .from('time_slots')
    .select('id, date, start_time, end_time, is_booked, is_blocked, services(name)')
    .eq('tenant_id', tenant.id)
    .gte('date', today)
    .lte('date', futureStr)
    .order('date').order('start_time')

  // Get unique dates that have slots
  const allDates: string[] = [...new Set<string>((slots ?? []).map((s: any) => s.date as string))].sort()

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar slug={tenantSlug} shopName={tenant.name} plan={tenant.plan} />
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50 pb-16">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="sec-label mb-6">ตารางเวลา</div>
          <SlotsManager slug={tenantSlug} initial={slots ?? []} dates={allDates} />
        </div>
      </main>
    </div>
  )
}
