export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'
import { isValidSlug } from '@/lib/utils'
import type { SignupForm } from '@/types'

export async function POST(req: NextRequest) {
  const body: SignupForm = await req.json()
  const { templateId, shopName, slug, ownerEmail, ownerPhone, password } = body

  if (!templateId || !shopName || !slug || !ownerPhone || !ownerEmail || !password) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 })
  }
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'Subdomain ไม่ถูกต้อง' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }, { status: 400 })
  }

  const supabase = createServiceClient() as any

  // Check slug not taken
  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: `"${slug}" ถูกใช้แล้ว กรุณาเลือกชื่ออื่น` }, { status: 409 })
  }

  // Check email not already registered
  const { data: existingEmail } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_email', ownerEmail.toLowerCase())
    .maybeSingle()

  if (existingEmail) {
    return NextResponse.json({ error: 'อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ' }, { status: 409 })
  }

  // Create Supabase Auth user first
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: ownerEmail.toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { shop_name: shopName, slug },
  })

  if (authErr || !authData?.user) {
    const msg = authErr?.message?.includes('already registered')
      ? 'อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ'
      : 'สร้างบัญชีไม่สำเร็จ กรุณาลองใหม่'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const trialEnds = new Date()
  trialEnds.setDate(trialEnds.getDate() + 14)

  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert({
      slug,
      name:          shopName,
      template_id:   templateId,
      owner_email:   ownerEmail.toLowerCase(),
      owner_phone:   ownerPhone,
      plan:          'trial',
      plan_type:     'standard',
      auth_user_id:  authData.user.id,
      trial_ends_at: trialEnds.toISOString(),
      settings: {
        primaryColor:   '#ff6b00',
        logoUrl:        null,
        lineId:         null,
        lineNotify:     false,
        pushEnabled:    false,
        maxAdvanceDays: 30,
        autoConfirm:    true,
        businessHours:  defaultBusinessHours(),
      },
    })
    .select()
    .single()

  if (error || !tenant) {
    // Cleanup auth user if tenant creation failed
    await supabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: 'สร้างร้านไม่สำเร็จ กรุณาลองใหม่' }, { status: 500 })
  }

  return NextResponse.json({ data: { slug: tenant.slug }, error: null }, { status: 201 })
}

function defaultBusinessHours() {
  const day    = { open: true,  start: '09:00', end: '18:00' }
  const closed = { open: false, start: '09:00', end: '18:00' }
  return {
    monday: day, tuesday: day, wednesday: day,
    thursday: day, friday: day, saturday: day, sunday: closed,
  }
}
