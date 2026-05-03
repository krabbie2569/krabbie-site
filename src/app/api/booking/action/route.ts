export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'

export async function POST(req: NextRequest) {
  const { bookingId, action } = await req.json() as {
    bookingId: string
    action:    'confirm' | 'cancel'
  }

  if (!bookingId || !action) {
    return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })
  }

  const supabase = createServiceClient() as any
  const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled'

  const { error } = await supabase
    .from('bookings')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (error) {
    return NextResponse.json({ error: 'อัปเดตสถานะไม่สำเร็จ' }, { status: 500 })
  }

  return NextResponse.json({ success: true, status: newStatus })
}
