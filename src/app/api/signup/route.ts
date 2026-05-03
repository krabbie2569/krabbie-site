import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'
import { isValidSlug } from '@/lib/utils'
import type { SignupForm } from '@/types'

export async function POST(req: NextRequest) {
  const body: SignupForm = await req.json()
  const { templateId, shopName, slug, ownerEmail, ownerPhone } = body

  // Validate
  if (!templateId || !shopName || !slug || !ownerPhone) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 })
  }
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'Subdomain ไม่ถูกต้อง' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Check slug not taken
  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    return NextResponse.json({ error: `"${slug}" ถูกใช้แล้ว กรุณาเลือกชื่ออื่น` }, { status: 409 })
  }

  // Create tenant (trial = 30 days)
  const trialEnds = new Date()
  trialEnds.setDate(trialEnds.getDate() + 30)

  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert({
      slug,
      name:          shopName,
      template_id:   templateId,
      owner_email:   ownerEmail || '',
      owner_phone:   ownerPhone,
      plan:          'trial',
      trial_ends_at: trialEnds.toISOString(),
      settings:      {
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

  // TODO: setup Cloudflare DNS subdomain via API
  // TODO: send welcome notification

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
