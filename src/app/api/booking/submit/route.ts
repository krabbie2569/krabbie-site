export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'
import { generateRef } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const { tenantSlug, serviceId, slotId, staffId,
          customerName, customerPhone, customerEmail, customerNote }
    = await req.json()

  if (!tenantSlug || !serviceId || !slotId || !customerName || !customerPhone) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 })
  }

  const supabase = createServiceClient() as any

  // Get tenant
  const { data: tenant } = await supabase
    .from('tenants').select('id').eq('slug', tenantSlug).single()
  if (!tenant) return NextResponse.json({ error: 'ไม่พบร้านค้า' }, { status: 404 })

  // Check slot availability
  const { data: slot } = await supabase
    .from('time_slots').select('id, is_booked, is_blocked')
    .eq('id', slotId).eq('tenant_id', tenant.id).single()
  if (!slot)          return NextResponse.json({ error: 'ไม่พบช่วงเวลา' }, { status: 404 })
  if (slot.is_booked) return NextResponse.json({ error: 'ช่วงเวลานี้ถูกจองแล้ว กรุณาเลือกเวลาอื่น' }, { status: 409 })
  if (slot.is_blocked) return NextResponse.json({ error: 'ช่วงเวลานี้ไม่พร้อมรับจอง' }, { status: 409 })

  // Insert booking
  const { error: bookErr } = await supabase.from('bookings').insert({
    tenant_id:      tenant.id,
    service_id:     serviceId,
    slot_id:        slotId,
    staff_id:       staffId ?? null,
    customer_name:  customerName.trim(),
    customer_phone: customerPhone.trim(),
    customer_email: customerEmail?.trim() || null,
    customer_note:  customerNote?.trim()  || null,
    status:         'pending',
  })
  if (bookErr) return NextResponse.json({ error: bookErr.message }, { status: 500 })

  // Mark slot booked
  await supabase.from('time_slots').update({ is_booked: true }).eq('id', slotId)

  return NextResponse.json({ ref: generateRef() })
}
