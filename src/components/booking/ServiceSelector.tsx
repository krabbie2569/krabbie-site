'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice, formatDuration } from '@/lib/utils'
import type { Service } from '@/types'

interface Props {
  tenantId: string
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function ServiceSelector({ tenantId, selectedId, onSelect }: Props) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const supabase = createClient() as any
    supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => { setServices(data ?? []); setLoading(false) })
  }, [tenantId])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="card animate-pulse h-20 bg-gray-100" />
        ))}
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="card text-center py-12 text-gray-400">
        <div className="text-4xl mb-2">🔧</div>
        <p className="text-sm">ยังไม่มีบริการ</p>
      </div>
    )
  }

  return (
    <div>
      <div className="sec-label mb-4">เลือกบริการ</div>
      <div className="space-y-3">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full card text-left flex items-center gap-4 transition-all ${
              selectedId === s.id
                ? 'border-orange-500 bg-orange-50'
                : 'hover:border-orange-300'
            }`}
          >
            <div className="flex-1">
              <div className="font-semibold text-sm mb-0.5">{s.name}</div>
              {s.description && <div className="text-xs text-gray-400">{s.description}</div>}
              <div className="font-mono text-xs text-gray-400 mt-0.5">⏱ {formatDuration(s.duration_minutes)}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-syne font-bold text-orange-500 text-lg">{formatPrice(s.price)}</div>
              {selectedId === s.id && <div className="text-[0.6rem] font-mono text-teal-dark mt-0.5">✓ เลือกแล้ว</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
