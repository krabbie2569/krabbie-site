export const runtime = 'edge'

import { getTenantBySlug, parseTenantSettings } from '@/lib/tenant'
import { notFound } from 'next/navigation'
import TenantAdminSidebar from '@/components/tenant/TenantAdminSidebar'
import SettingsForm from '@/components/admin/SettingsForm'

interface Props { params: Promise<{ tenant: string }> }

export default async function SettingsPage({ params }: Props) {
  const { tenant: tenantSlug } = await params
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) notFound()

  const settings = parseTenantSettings(tenant.settings)

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar slug={tenantSlug} shopName={tenant.name} plan={tenant.plan} />
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50 pb-16">
        <div className="max-w-xl mx-auto px-6 py-8">
          <div className="sec-label mb-6">ตั้งค่าร้าน</div>
          <SettingsForm
            slug={tenantSlug}
            name={tenant.name}
            ownerPhone={tenant.owner_phone ?? ''}
            settings={{
              primaryColor:   settings.primaryColor,
              logoUrl:        settings.logoUrl,
              lineId:         settings.lineId,
              autoConfirm:    settings.autoConfirm,
              maxAdvanceDays: settings.maxAdvanceDays,
            }}
          />
        </div>
      </main>
    </div>
  )
}
