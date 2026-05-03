'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
}

export default function BookingActions({ bookingId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'confirm' | 'cancel' | null>(null)

  async function handleAction(action: 'confirm' | 'cancel') {
    setLoading(action)
    try {
      const res = await fetch('/api/booking/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action }),
      })
      if (res.ok) router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => handleAction('confirm')}
        disabled={!!loading}
        className="flex-1 text-xs bg-teal-light text-teal-dark font-semibold py-1.5 rounded-lg hover:bg-teal-DEFAULT/20 transition-colors disabled:opacity-50"
      >
        {loading === 'confirm' ? '...' : '✓ ยืนยัน'}
      </button>
      <button
        onClick={() => handleAction('cancel')}
        disabled={!!loading}
        className="flex-1 text-xs bg-red-50 text-red-500 font-semibold py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {loading === 'cancel' ? '...' : '✕ ยกเลิก'}
      </button>
    </div>
  )
}
