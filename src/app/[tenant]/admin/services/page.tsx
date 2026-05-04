export const runtime = 'edge'

import { getTenantBySlug } from '@/lib/tenant'
import { createServiceClient } from '@/lib/supabase.server'
import { notFound } from 'next/navigation'
import TenantAdminSidebar from '@/components/tenant/TenantAdminSidebar'
import ServicesManager from '@/components/admin/ServicesManager'

interface Props { params: Promise<{ tenant: string }> }

export default async function ServicesPage({ params }: Props) {
  const { tenant: tenantSlug } = await params
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) notFound()

  const supabase = createServiceClient() as any
  const { data: services } = await supabase
    .from('services').select('*')
    .eq('tenant_id', tenant.id).order('sort_order')

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar slug={tenantSlug} shopName={tenant.name} plan={tenant.plan} />
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50 pb-16">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="sec-label mb-6">บริการทั้งหมด</div>
          <ServicesManager slug={tenantSlug} initial={services ?? []} />
        </div>
      </main>
    </div>
  )
}
