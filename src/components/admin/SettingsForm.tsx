'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  slug: string
  name: string
  ownerPhone: string
  settings: {
    primaryColor: string
    logoUrl:      string | null
    lineId:       string | null
    autoConfirm:  boolean
    maxAdvanceDays: number
  }
}

export default function SettingsForm({ slug, name: initName, ownerPhone: initPhone, settings: s }: Props) {
  const [name, setName]         = useState(initName)
  const [phone, setPhone]       = useState(initPhone ?? '')
  const [color, setColor]       = useState(s.primaryColor ?? '#ff6b00')
  const [logo, setLogo]         = useState(s.logoUrl ?? '')
  const [line, setLine]         = useState(s.lineId ?? '')
  const [autoConfirm, setAuto]  = useState(s.autoConfirm ?? true)
  const [advance, setAdvance]   = useState(String(s.maxAdvanceDays ?? 30))
  const [loading, setLoading]   = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSaved(false)
    const res = await fetch('/api/shops/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug, name, owner_phone: phone,
        settings: {
          primaryColor:   color,
          logoUrl:        logo || null,
          lineId:         line || null,
          autoConfirm,
          maxAdvanceDays: Number(advance),
        },
      }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error ?? 'เกิดข้อผิดพลาด'); return }
    setSaved(true)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <div className="text-red-500 text-sm bg-red-50 rounded px-3 py-2">{error}</div>}
      {saved && <div className="text-teal-dark text-sm bg-teal-light/20 rounded px-3 py-2">✓ บันทึกสำเร็จ</div>}

      <div className="card space-y-4">
        <div className="sec-label">ข้อมูลร้าน</div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">ชื่อร้าน *</label>
          <input className="input" required value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">เบอร์โทร / Line ID เจ้าของ</label>
          <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0812345678 หรือ @lineid" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">LINE ID (แสดงหน้าร้าน)</label>
          <input className="input" value={line} onChange={e => setLine(e.target.value)} placeholder="@lineid" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">URL โลโก้ร้าน</label>
          <input className="input" type="url" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      <div className="card space-y-4">
        <div className="sec-label">ธีมและการจอง</div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-2">สีหลักของร้าน</label>
          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              className="w-12 h-10 rounded border-2 border-krabbie-border cursor-pointer p-0.5" />
            <span className="font-mono text-sm text-gray-500">{color}</span>
            <div className="flex gap-2 ml-2">
              {['#ff6b00','#E91E8C','#10B981','#3B82F6','#8B5CF6'].map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                  style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">รับจองล่วงหน้าได้ (วัน)</label>
          <input className="input" type="number" min="1" max="365" value={advance}
            onChange={e => setAdvance(e.target.value)} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={autoConfirm} onChange={e => setAuto(e.target.checked)}
            className="w-4 h-4 accent-orange-500" />
          <div>
            <div className="text-sm font-semibold">ยืนยันการจองอัตโนมัติ</div>
            <div className="text-xs text-gray-400">ปิดถ้าต้องการกดยืนยันเองทุกรายการ</div>
          </div>
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-40">
        {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
      </button>
    </form>
  )
}
