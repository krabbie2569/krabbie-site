export const runtime = 'edge'

import { notFound } from 'next/navigation'
import { getTenantBySlug, parseTenantSettings } from '@/lib/tenant'
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

  const settings = parseTenantSettings(tenant.settings)

  return (
    <div style={{ '--primary': settings.primaryColor } as React.CSSProperties}>
      {children}
    </div>
  )
}
