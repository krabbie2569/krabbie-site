import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTenantBySlug, parseTenantSettings, isTenantActive } from '@/lib/tenant'
import TenantHeader from '@/components/tenant/TenantHeader'
import type { Metadata } from 'next'

interface Props {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug } = await params
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) return { title: 'ไม่พบร้านค้า' }
  return {
    title: {
      default: tenant.name,
      template: `%s | ${tenant.name}`,
    },
    description: `จองบริการออนไลน์ที่ ${tenant.name}`,
  }
}

export default async function TenantLayout({ children, params }: Props) {
  const { tenant: tenantSlug } = await params
  const tenant = await getTenantBySlug(tenantSlug)

  if (!tenant) notFound()
  if (!isTenantActive(tenant)) {
    return (
      <main className="min-h-screen bg-krabbie-bg flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🦀</div>
          <h1 className="font-syne text-xl font-bold mb-2">ร้านนี้ระงับการใช้งานชั่วคราว</h1>
          <p className="text-gray-500 text-sm">กรุณาติดต่อเจ้าของร้าน หรือกลับมาใหม่ภายหลัง</p>
        </div>
      </main>
    )
  }

  const settings = parseTenantSettings(tenant.settings)

  return (
    <div style={{ '--primary': settings.primaryColor } as React.CSSProperties}>
      <TenantHeader tenant={tenant} settings={settings} />
      <main>{children}</main>
    </div>
  )
}
