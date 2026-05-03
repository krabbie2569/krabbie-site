'use client'

import { useState } from 'react'
import { formatDateTH, formatTime } from '@/lib/utils'
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR } from '@/types'

type BookingRow = {
  id:             string
  status:         string
  customer_name:  string
  customer_phone: string
  services:       { name: string } | null
  time_slots:     { date: string; start_time: string } | null
}

interface Props {
  initialBookings: BookingRow[]
}

export default function BookingList({ initialBookings }: Props) {
  const [bookings, setBookings]     = useState(initialBookings)
  const [loading, setLoading]       = useState<string | null>(null)

  async function handleAction(bookingId: string, action: 'confirm' | 'cancel') {
    setLoading(bookingId)
    const res = await fetch('/api/booking/action', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ bookingId, action }),
    })
    const json = await res.json()
    if (json.success) {
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: json.status } : b)
      )
    }
    setLoading(null)
  }

  if (bookings.length === 0) {
    return <div className="card text-center py-8 text-gray-400 text-sm">ยังไม่มีการจอง</div>
  }

  return (
    <div className="space-y-2">
      {bookings.map((b) => (
        <div key={b.id} className="card py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-sm">{b.customer_name}</div>
              <div className="text-xs text-gray-400">{b.customer_phone}</div>
              <div className="font-mono text-xs text-gray-400 mt-0.5">
                {b.time_slots?.date ? formatDateTH(b.time_slots.date) : '—'}
                {b.time_slots?.start_time ? ` · ${formatTime(b.time_slots.start_time)}` : ''}
              </div>
              <div className="text-xs text-orange-500 mt-0.5">{b.services?.name}</div>
            </div>
            <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded flex-shrink-0 ${BOOKING_STATUS_COLOR[b.status as keyof typeof BOOKING_STATUS_COLOR]}`}>
              {BOOKING_STATUS_LABEL[b.status as keyof typeof BOOKING_STATUS_LABEL]}
            </span>
          </div>
          {b.status === 'pending' && (
            <div className="flex gap-2 mt-3">
              <button
                disabled={loading === b.id}
                onClick={() => handleAction(b.id, 'confirm')}
                className="flex-1 text-xs bg-teal-light text-teal-dark font-semibold py-1.5 rounded-lg hover:bg-teal-DEFAULT/20 transition-colors disabled:opacity-50"
              >
                {loading === b.id ? '...' : '✓ ยืนยัน'}
              </button>
              <button
                disabled={loading === b.id}
                onClick={() => handleAction(b.id, 'cancel')}
                className="flex-1 text-xs bg-red-50 text-red-500 font-semibold py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {loading === b.id ? '...' : '✕ ยกเลิก'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
