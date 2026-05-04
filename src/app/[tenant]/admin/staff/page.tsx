export const runtime = 'edge'

import { getTenantBySlug } from '@/lib/tenant'
import { createServiceClient } from '@/lib/supabase.server'
import { notFound } from 'next/navigation'
import TenantAdminSidebar from '@/components/tenant/TenantAdminSidebar'
import StaffManager from '@/components/admin/StaffManager'

interface Props { params: Promise<{ tenant: string }> }

export default async function StaffPage({ params }: Props) {
  const { tenant: tenantSlug } = await params
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) notFound()

  const supabase = createServiceClient() as any
  const { data: staff } = await supabase
    .from('staff').select('*')
    .eq('tenant_id', tenant.id).order('created_at')

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar slug={tenantSlug} shopName={tenant.name} plan={tenant.plan} />
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50 pb-16">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="sec-label mb-6">พนักงาน</div>
          <StaffManager slug={tenantSlug} initial={staff ?? []} />
        </div>
      </main>
    </div>
  )
}
