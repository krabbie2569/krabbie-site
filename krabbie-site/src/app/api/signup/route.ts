import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'
import { isValidSlug } from '@/lib/utils'
import type { SignupForm } from '@/types'

export async function POST(req: NextRequest) {
  const body: SignupForm = await req.json()
  const { templateId, shopName, slug, ownerEmail, ownerPhone } = body

  if (!templateId || !shopName || !slug || !ownerPhone) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 })
  }
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'Subdomain ไม่ถูกต้อง' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any

  // Check slug not taken
  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    return NextResponse.json({ error: `"${slug}" ถูกใช้แล้ว กรุณาเลือกชื่ออื่น` }, { status: 409 })
  }

  // Create (or find) Supabase Auth user
  let authUserId: string | null = null
  if (ownerEmail) {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = (existingUsers?.users ?? []).find(
      (u: { email: string }) => u.email === ownerEmail
    )

    if (existingAuthUser) {
      authUserId = existingAuthUser.id
    } else {
      const tempPassword = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10).toUpperCase() + '!'
      const { data: newUser } = await supabase.auth.admin.createUser({
        email:            ownerEmail,
        password:         tempPassword,
        email_confirm:    true,
        user_metadata:    { role: 'tenant_owner', shop_slug: slug },
      })
      authUserId = newUser?.user?.id ?? null

      // Send password reset so they can set their own password
      if (authUserId) {
        await supabase.auth.admin.generateLink({
          type:  'recovery',
          email: ownerEmail,
        })
      }
    }
  }

  // Create tenant (trial = 14 days)
  const trialEnds = new Date()
  trialEnds.setDate(trialEnds.getDate() + 14)

  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert({
      slug,
      name:          shopName,
      template_id:   templateId,
      owner_email:   ownerEmail || '',
      owner_phone:   ownerPhone,
      plan:          'trial',
      plan_type:     'trial',
      auth_user_id:  authUserId,
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
