'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { generateRef } from '@/lib/utils'
import type { BookingDraft } from '@/types'

interface UseBookingResult {
  submitBooking: (draft: BookingDraft) => Promise<string | null>
  loading:       boolean
  bookingRef:    string | null
  error:         string | null
}

export function useBooking(tenantSlug: string): UseBookingResult {
  const [loading, setLoading]       = useState(false)
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [error, setError]           = useState<string | null>(null)

  async function submitBooking(draft: BookingDraft): Promise<string | null> {
    if (!draft.serviceId || !draft.slotId || !draft.customerName || !draft.customerPhone) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // 1. Fetch tenant id from slug
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenantSlug)
        .single()

      if (!tenant) throw new Error('ไม่พบร้านค้า')

      // 2. Mark slot as booked (optimistic lock via check)
      const { data: slot, error: slotErr } = await supabase
        .from('time_slots')
        .select('id, is_booked')
        .eq('id', draft.slotId)
        .single()

      if (slotErr || !slot) throw new Error('ไม่พบช่วงเวลา')
      if (slot.is_booked)  throw new Error('ช่วงเวลานี้ถูกจองแล้ว กรุณาเลือกเวลาอื่น')

      // 3. Insert booking
      const { error: bookErr } = await supabase
        .from('bookings')
        .insert({
          tenant_id:      tenant.id,
          service_id:     draft.serviceId!,
          slot_id:        draft.slotId,
          staff_id:       draft.staffId,
          customer_name:  draft.customerName.trim(),
          customer_phone: draft.customerPhone.trim(),
          customer_email: draft.customerEmail.trim() || null,
          customer_note:  draft.customerNote.trim()  || null,
          status:         'pending',
        })

      if (bookErr) throw new Error(bookErr.message)

      // 4. Mark slot booked
      await supabase
        .from('time_slots')
        .update({ is_booked: true })
        .eq('id', draft.slotId)

      const ref = generateRef()
      setBookingRef(ref)
      return ref

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { submitBooking, loading, bookingRef, error }
}
