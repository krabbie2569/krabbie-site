import Link from 'next/link'
import type { Tenant, TenantSettings } from '@/types'

interface Props {
  tenant:   Tenant
  settings: TenantSettings
}

export default function TenantHeader({ tenant, settings }: Props) {
  return (
    <header
      className="px-4 py-3 flex items-center justify-between sticky top-0 z-40"
      style={{ backgroundColor: settings.primaryColor }}
    >
      <Link href={`/${tenant.slug}`} className="flex items-center gap-2">
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt={tenant.name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            {tenant.name.charAt(0)}
          </div>
        )}
        <span className="font-syne font-extrabold text-white text-base">{tenant.name}</span>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href={`/${tenant.slug}/book`}
          className="bg-white text-krabbie-dark font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
        >
          จองเลย
        </Link>
      </div>
    </header>
  )
}
