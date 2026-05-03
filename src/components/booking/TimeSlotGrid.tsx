'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { TimeSlot } from '@/types'

interface Props {
  tenantId:       string
  serviceId:      string
  date:           string    // YYYY-MM-DD
  selectedSlotId: string | null
  onSelect:       (slotId: string) => void
}

export default function TimeSlotGrid({ tenantId, serviceId, date, selectedSlotId, onSelect }: Props) {
  const [slots, setSlots]   = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const supabase = createClient() as any
    supabase
      .from('time_slots')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('service_id', serviceId)
      .eq('date', date)
      .eq('is_blocked', false)
      .order('start_time')
      .then(({ data }: { data: any[] | null }) => { setSlots(data ?? []); setLoading(false) })
  }, [tenantId, serviceId, date])

  if (loading) {
    return (
      <div className="mt-4">
        <div className="sec-label mb-3">เลือกเวลา</div>
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
          ))}
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
          {slots.map((slot) => {
            const isBooked   = slot.is_booked
            const isSelected = selectedSlotId === slot.id
            return (
              <button
                key={slot.id}
                disabled={isBooked}
                onClick={() => onSelect(slot.id)}
                className={cn(
                  'h-10 rounded-lg text-xs font-mono font-bold transition-all border-2',
                  isBooked   ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through' :
                  isSelected ? 'bg-orange-500 text-white border-orange-500' :
                  'bg-white text-gray-700 border-krabbie-border hover:border-orange-300 hover:text-orange-500'
                )}
              >
                {formatTime(slot.start_time)}
                {isBooked && <span className="ml-1 text-[0.55rem]">เต็ม</span>}
              </button>
            )
          })}
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
