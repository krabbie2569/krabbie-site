'use client'

import { useState } from 'react'

interface Slot {
  id: string; date: string; start_time: string; end_time: string
  is_booked: boolean; is_blocked: boolean; services: { name: string } | null
}
interface Props { slug: string; initial: Slot[]; dates: string[] }

export default function SlotsManager({ slug, initial, dates }: Props) {
  const [slots, setSlots]       = useState<Slot[]>(initial)
  const [selDate, setSelDate]   = useState(dates[0] ?? '')
  const [generating, setGen]    = useState(false)
  const [genDays, setGenDays]   = useState('14')
  const [genResult, setGenRes]  = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  const daySlots = slots.filter(s => s.date === selDate)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  async function generate() {
    setGen(true); setGenRes('')
    const res = await fetch('/api/shops/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, days: Number(genDays) }),
    })
    const json = await res.json()
    setGen(false)
    setGenRes(res.ok ? `✓ สร้าง ${json.created} slots แล้ว — รีเฟรชเพื่อดูผล` : json.error)
  }

  async function toggleBlock(slot: Slot) {
    setToggling(slot.id)
    await fetch('/api/shops/slots', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, slotId: slot.id, is_blocked: !slot.is_blocked }),
    })
    setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, is_blocked: !s.is_blocked } : s))
    setToggling(null)
  }

  return (
    <div className="space-y-5">
      {/* Generate panel */}
      <div className="card">
        <div className="sec-label mb-3">สร้าง Slots ล่วงหน้า</div>
        <div className="flex items-center gap-3">
          <select value={genDays} onChange={e => setGenDays(e.target.value)}
            className="input w-32">
            {[7,14,30,60].map(d => <option key={d} value={d}>{d} วัน</option>)}
          </select>
          <button onClick={generate} disabled={generating} className="btn-primary disabled:opacity-40">
            {generating ? 'กำลังสร้าง...' : 'สร้าง Slots'}
          </button>
        </div>
        {genResult && <p className="text-sm mt-2 text-teal-dark">{genResult}</p>}
        <p className="text-xs text-gray-400 mt-2">ข้ามวันอาทิตย์ · ไม่สร้างซ้ำ · ช่วงเวลา 09:00–18:00</p>
      </div>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.slice(0, 14).map(d => (
          <button key={d} onClick={() => setSelDate(d)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors ${
              selDate === d ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-krabbie-border hover:border-orange-300'
            }`}>
            {d.slice(5)}
          </button>
        ))}
      </div>

      {/* Slot list for selected date */}
      {selDate && (
        <div>
          <div className="sec-label mb-3">{selDate}</div>
          {daySlots.length === 0 ? (
            <div className="card text-center py-8 text-gray-400 text-sm">ไม่มี slots วันนี้ — กด "สร้าง Slots" ด้านบน</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {daySlots.map(slot => (
                <div key={slot.id} className={`card py-2 px-3 text-center text-sm transition-colors ${
                  slot.is_booked ? 'bg-orange-50 border-orange-200' :
                  slot.is_blocked ? 'bg-gray-100 border-gray-200' : 'hover:border-teal-DEFAULT'
                }`}>
                  <div className="font-mono font-bold">{slot.start_time}–{slot.end_time}</div>
                  <div className="text-xs text-gray-400 truncate">{(slot.services as any)?.name ?? '—'}</div>
                  <div className="mt-1">
                    {slot.is_booked ? (
                      <span className="badge-paid">จองแล้ว</span>
                    ) : (
                      <button
                        onClick={() => toggleBlock(slot)}
                        disabled={toggling === slot.id}
                        className={`text-[0.6rem] font-mono px-2 py-0.5 rounded transition-colors ${
                          slot.is_blocked
                            ? 'bg-gray-200 text-gray-600 hover:bg-green-100 hover:text-green-700'
                            : 'badge-live hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        {toggling === slot.id ? '...' : slot.is_blocked ? 'ปลดบล็อก' : 'ว่าง'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
