'use client'

import { useState } from 'react'
import type { BookingDraft } from '@/types'

interface UseBookingResult {
  submitBooking: (draft: BookingDraft) => Promise<string | null>
  loading:       boolean
  bookingRef:    string | null
  error:         string | null
}

export function useBooking(tenantSlug: string): UseBookingResult {
  const [loading,    setLoading]    = useState(false)
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [error,      setError]      = useState<string | null>(null)

  async function submitBooking(draft: BookingDraft): Promise<string | null> {
    if (!draft.serviceId || !draft.slotId || !draft.customerName || !draft.customerPhone) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/booking/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug,
          serviceId:     draft.serviceId,
          slotId:        draft.slotId,
          staffId:       draft.staffId,
          customerName:  draft.customerName.trim(),
          customerPhone: draft.customerPhone.trim(),
          customerEmail: draft.customerEmail.trim(),
          customerNote:  draft.customerNote.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'เกิดข้อผิดพลาด')
      setBookingRef(json.ref)
      return json.ref
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { submitBooking, loading, bookingRef, error }
}
