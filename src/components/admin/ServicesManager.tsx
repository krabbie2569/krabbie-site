'use client'

import { useState } from 'react'
import ServiceForm from './ServiceForm'
import { formatPrice, formatDuration } from '@/lib/utils'

interface Service {
  id: string; name: string; description: string | null
  duration_minutes: number; price: number; is_active: boolean
}
interface Props { slug: string; initial: Service[] }

export default function ServicesManager({ slug, initial }: Props) {
  const [services, setServices] = useState<Service[]>(initial)
  const [adding, setAdding]     = useState(false)
  const [editing, setEditing]   = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  function handleSave(saved: Service) {
    setServices(prev => {
      const idx = prev.findIndex(s => s.id === saved.id)
      if (idx >= 0) { const a = [...prev]; a[idx] = saved; return a }
      return [...prev, saved]
    })
    setAdding(false); setEditing(null)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch('/api/shops/services', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, id }),
    })
    setServices(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-3">
      {services.map(s => (
        <div key={s.id}>
          {editing === s.id ? (
            <ServiceForm slug={slug} service={s} onSave={handleSave} onCancel={() => setEditing(null)} />
          ) : (
            <div className="card flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{s.name}</div>
                {s.description && <div className="text-xs text-gray-400 truncate">{s.description}</div>}
                <div className="font-mono text-xs text-gray-400 mt-0.5">⏱ {formatDuration(s.duration_minutes)}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-syne font-bold text-orange-500">{formatPrice(s.price)}</div>
                <span className={`text-[0.6rem] font-mono px-1.5 py-0.5 rounded ${s.is_active ? 'badge-live' : 'bg-gray-100 text-gray-400'}`}>
                  {s.is_active ? 'เปิด' : 'ปิด'}
                </span>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => setEditing(s.id)} className="text-xs text-orange-500 hover:underline">แก้ไข</button>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deleting === s.id}
                  className="text-xs text-red-400 hover:underline disabled:opacity-40"
                >
                  {deleting === s.id ? '...' : 'ลบ'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <ServiceForm slug={slug} onSave={handleSave} onCancel={() => setAdding(false)} />
      ) : (
        <button onClick={() => setAdding(true)} className="btn-outline w-full text-sm">
          + เพิ่มบริการ
        </button>
      )}
    </div>
  )
}
