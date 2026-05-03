import Link from 'next/link'
import { getTenantBySlug, parseTenantSettings } from '@/lib/tenant'
import { createServerSupabaseClient } from '@/lib/supabase'
import { formatPrice, formatDuration } from '@/lib/utils'
import { notFound } from 'next/navigation'
import type { Service } from '@/types'

interface Props {
  params: { tenant: string }
}

export default async function TenantHomePage({ params }: Props) {
  const tenant = await getTenantBySlug(params.tenant)
  if (!tenant) notFound()

  const supabase = await createServerSupabaseClient()
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('sort_order')

  const settings = parseTenantSettings(tenant.settings)

  return (
    <div className="min-h-screen bg-krabbie-bg pb-16">

      {/* HERO */}
      <section className="bg-krabbie-dark text-center py-12 px-6">
        {settings.logoUrl && (
          <img src={settings.logoUrl} alt={tenant.name} className="w-16 h-16 rounded-full mx-auto mb-4 object-cover" />
        )}
        <h1 className="font-syne text-white text-3xl font-extrabold mb-2">{tenant.name}</h1>
        <p className="text-gray-400 text-sm">เลือกบริการและจองคิวออนไลน์ได้เลย</p>
      </section>

      {/* SERVICES */}
      <section className="max-w-xl mx-auto px-4 py-8">
        <div className="sec-label mb-4">บริการของเรา</div>

        {!services || services.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🔧</div>
            <p className="text-sm">ยังไม่มีบริการ — เจ้าของร้านกำลังเพิ่มข้อมูล</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(services as Service[]).map((service) => (
              <Link
                key={service.id}
                href={`/${params.tenant}/book?service=${service.id}`}
                className="card flex items-center gap-4 hover:border-orange-300 transition-colors group"
              >
                <div className="flex-1">
                  <div className="font-bold text-sm mb-0.5 group-hover:text-orange-500 transition-colors">
                    {service.name}
                  </div>
                  {service.description && (
                    <div className="text-xs text-gray-400 mb-1">{service.description}</div>
                  )}
                  <div className="font-mono text-xs text-gray-400">
                    ⏱ {formatDuration(service.duration_minutes)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-syne font-bold text-orange-500 text-lg">
                    {formatPrice(service.price)}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 group-hover:text-orange-400 transition-colors">
                    จองเลย →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <div className="text-center font-mono text-xs text-gray-300 mt-4">
        Powered by <span className="text-orange-400">🦀 Krabbie.com</span>
      </div>
    </div>
  )
}
