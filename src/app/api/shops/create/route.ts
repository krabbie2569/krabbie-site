export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase.server'
import { isValidSlug } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const supabaseAuth = await createServerSupabaseClient() as any
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })
  }

  const { shopName, slug, templateId, ownerPhone } = await req.json()

  if (!shopName || !slug) {
    return NextResponse.json({ error: 'กรุณากรอกชื่อร้านและ URL' }, { status: 400 })
  }
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'URL ไม่ถูกต้อง' }, { status: 400 })
  }

  const supabase = createServiceClient() as any

  // Check slug availability
  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: `"${slug}" ถูกใช้แล้ว กรุณาเลือกชื่ออื่น` }, { status: 409 })
  }

  // Check seed balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('seeds')
    .eq('id', user.id)
    .maybeSingle()

  const seeds = profile?.seeds ?? 0
  if (seeds < 1) {
    return NextResponse.json(
      { error: 'ไม่มี Seed — ติดต่อ LINE: @krabbie เพื่อซื้อ Seed ก่อนสร้างร้าน' },
      { status: 402 }
    )
  }

  // Compute 30-day expiry
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const insertData: Record<string, unknown> = {
    slug,
    name:        shopName,
    template_id: templateId || 'booking-service',
    owner_email: user.email,
    owner_phone: ownerPhone || '',
    plan:        'active',
    plan_type:   'standard',
    expires_at:  expiresAt.toISOString(),
    activated_at: new Date().toISOString(),
    settings: {
      primaryColor:   '#ff6b00',
      logoUrl:        null,
      lineId:         null,
      lineNotify:     false,
      pushEnabled:    false,
      maxAdvanceDays: 30,
      autoConfirm:    true,
      businessHours:  defaultHours(),
    },
  }

  // auth_user_id may not exist yet (migration 009) — add only if column is present
  try {
    const probe = await supabase.from('tenants').select('auth_user_id').limit(0)
    if (!probe.error) insertData.auth_user_id = user.id
  } catch { /* column doesn't exist yet — skip */ }

  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert(insertData)
    .select('slug')
    .single()

  if (error || !tenant) {
    return NextResponse.json({ error: error?.message ?? 'สร้างร้านไม่สำเร็จ กรุณาลองใหม่' }, { status: 500 })
  }

  // Deduct 1 seed and record transaction
  await Promise.all([
    supabase
      .from('profiles')
      .update({ seeds: seeds - 1 })
      .eq('id', user.id),
    supabase
      .from('seed_transactions')
      .insert({ user_id: user.id, delta: -1, note: `สร้างร้าน ${slug}` }),
  ])

  return NextResponse.json({ data: { slug: tenant.slug } })
}

function defaultHours() {
  const day    = { open: true,  start: '09:00', end: '18:00' }
  const closed = { open: false, start: '09:00', end: '18:00' }
  return { monday: day, tuesday: day, wednesday: day, thursday: day, friday: day, saturday: day, sunday: closed }
}
