export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug      = searchParams.get('slug')
  const serviceId = searchParams.get('serviceId')
  const date      = searchParams.get('date')

  if (!slug || !serviceId || !date) {
    return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })
  }

  const supabase = createServiceClient() as any
  const { data: tenant } = await supabase
    .from('tenants').select('id').eq('slug', slug).maybeSingle()
  if (!tenant) return NextResponse.json({ error: 'ไม่พบร้าน' }, { status: 404 })

  const { data: slots } = await supabase
    .from('time_slots')
    .select('id, start_time, end_time, is_booked, is_blocked')
    .eq('tenant_id', tenant.id)
    .eq('service_id', serviceId)
    .eq('date', date)
    .eq('is_blocked', false)
    .order('start_time')

  return NextResponse.json({ slots: slots ?? [] })
}
