export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase.server'

function addMinutes(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const SLOT_STARTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
const END_OF_DAY  = '18:00'

// POST — generate slots for next N days
export async function POST(req: NextRequest) {
  const supabaseAuth = await createServerSupabaseClient() as any
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })

  const supabase = createServiceClient() as any
  const { slug, days = 14 } = await req.json()

  const { data: tenant } = await supabase
    .from('tenants').select('id, auth_user_id, owner_email')
    .eq('slug', slug).maybeSingle()
  if (!tenant) return NextResponse.json({ error: 'ไม่พบร้าน' }, { status: 404 })
  if (tenant.auth_user_id !== user.id && tenant.owner_email !== user.email)
    return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 })

  const { data: services } = await supabase
    .from('services').select('id, duration_minutes')
    .eq('tenant_id', tenant.id).eq('is_active', true)
  if (!services?.length) return NextResponse.json({ error: 'ไม่มีบริการ' }, { status: 400 })

  const { data: staffRow } = await supabase
    .from('staff').select('id').eq('tenant_id', tenant.id).eq('is_active', true).limit(1).maybeSingle()
  const staffId = staffRow?.id ?? null

  // Build date list (skip Sundays)
  const dates: string[] = []
  const base = new Date()
  for (let i = 1; dates.length < days; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    if (d.getDay() !== 0) dates.push(d.toISOString().slice(0, 10))
  }

  // Find existing slots to avoid duplicates
  const { data: existing } = await supabase
    .from('time_slots').select('service_id, date, start_time')
    .eq('tenant_id', tenant.id)
    .in('date', dates)
  const existSet = new Set(
    (existing ?? []).map((s: any) => `${s.service_id}|${s.date}|${s.start_time}`)
  )

  const slots: any[] = []
  for (const svc of services as { id: string; duration_minutes: number }[]) {
    for (const date of dates) {
      for (const start of SLOT_STARTS) {
        const end = addMinutes(start, svc.duration_minutes)
        if (end > END_OF_DAY) continue
        if (existSet.has(`${svc.id}|${date}|${start}`)) continue
        slots.push({ tenant_id: tenant.id, service_id: svc.id, staff_id: staffId,
          date, start_time: start, end_time: end, is_booked: false, is_blocked: false })
      }
    }
  }

  for (let i = 0; i < slots.length; i += 100) {
    await supabase.from('time_slots').insert(slots.slice(i, i + 100))
  }

  return NextResponse.json({ ok: true, created: slots.length })
}

// PATCH — toggle block on a single slot
export async function PATCH(req: NextRequest) {
  const supabaseAuth = await createServerSupabaseClient() as any
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })

  const supabase = createServiceClient() as any
  const { slug, slotId, is_blocked } = await req.json()

  const { data: tenant } = await supabase
    .from('tenants').select('id, auth_user_id, owner_email')
    .eq('slug', slug).maybeSingle()
  if (!tenant) return NextResponse.json({ error: 'ไม่พบร้าน' }, { status: 404 })
  if (tenant.auth_user_id !== user.id && tenant.owner_email !== user.email)
    return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 })

  await supabase.from('time_slots')
    .update({ is_blocked })
    .eq('id', slotId).eq('tenant_id', tenant.id)

  return NextResponse.json({ ok: true })
}
