'use client'

import { useState } from 'react'

interface Service {
  id: string; name: string; description: string | null
  duration_minutes: number; price: number; is_active: boolean
}
interface Props {
  slug: string
  service?: Service
  onSave: (s: Service) => void
  onCancel: () => void
}

export default function ServiceForm({ slug, service, onSave, onCancel }: Props) {
  const [name, setName]         = useState(service?.name ?? '')
  const [desc, setDesc]         = useState(service?.description ?? '')
  const [dur,  setDur]          = useState(String(service?.duration_minutes ?? 60))
  const [price, setPrice]       = useState(String(service?.price ?? 0))
  const [active, setActive]     = useState(service?.is_active ?? true)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/shops/services', {
      method: service ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug, id: service?.id,
        name, description: desc,
        duration_minutes: Number(dur), price: Number(price), is_active: active,
      }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error ?? 'เกิดข้อผิดพลาด'); return }
    onSave(json.data)
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="font-syne font-bold text-base">{service ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}</div>
      {error && <div className="text-red-500 text-sm bg-red-50 rounded px-3 py-2">{error}</div>}

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">ชื่อบริการ *</label>
        <input className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="เช่น นวดแผนไทย" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1">คำอธิบาย</label>
        <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="รายละเอียดบริการ" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">ระยะเวลา (นาที) *</label>
          <input className="input" type="number" min="1" required value={dur} onChange={e => setDur(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">ราคา (บาท) *</label>
          <input className="input" type="number" min="0" required value={price} onChange={e => setPrice(e.target.value)} />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 accent-orange-500" />
        <span className="text-sm">เปิดรับจอง</span>
      </label>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-40">
          {loading ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline flex-1">ยกเลิก</button>
      </div>
    </form>
  )
}
