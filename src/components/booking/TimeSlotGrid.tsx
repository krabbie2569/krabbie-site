'use client'

import { useEffect, useState } from 'react'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Slot { id: string; start_time: string; end_time: string; is_booked: boolean; is_blocked: boolean }

interface Props {
  tenantId:       string
  serviceId:      string
  date:           string
  selectedSlotId: string | null
  onSelect:       (slotId: string) => void
}

export default function TimeSlotGrid({ tenantId, serviceId, date, selectedSlotId, onSelect }: Props) {
  const [slots,   setSlots]   = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/booking/slots?slug=${tenantId}&serviceId=${serviceId}&date=${date}`)
      .then(r => r.json())
      .then(({ slots }) => { setSlots(slots ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [tenantId, serviceId, date])

  if (loading) {
    return (
      <div className="mt-4">
        <div className="sec-label mb-3">เลือกเวลา</div>
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />)}
        </div>
      </div>
    )
  }

  const available = slots.filter(s => !s.is_booked)

  return (
    <div className="mt-4">
      <div className="sec-label mb-3">เลือกเวลา</div>
      {available.length === 0 ? (
        <div className="card text-center py-6 text-gray-400 text-sm">
          ไม่มีเวลาว่างในวันนี้ กรุณาเลือกวันอื่น
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {slots.map(slot => (
            <button
              key={slot.id}
              disabled={slot.is_booked}
              onClick={() => onSelect(slot.id)}
              className={cn(
                'h-10 rounded-lg text-xs font-mono font-bold transition-all border-2',
                slot.is_booked    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through' :
                selectedSlotId === slot.id ? 'bg-orange-500 text-white border-orange-500' :
                'bg-white text-gray-700 border-krabbie-border hover:border-orange-300 hover:text-orange-500'
              )}
            >
              {formatTime(slot.start_time)}
              {slot.is_booked && <span className="ml-1 text-[0.55rem]">เต็ม</span>}
            </button>
          ))}
        </div>
      )}
      {available.length > 0 && (
        <p className="text-[0.65rem] text-gray-400 font-mono mt-2">
          ว่าง {available.length} / {slots.length} ช่วงเวลา
        </p>
      )}
    </div>
  )
}
