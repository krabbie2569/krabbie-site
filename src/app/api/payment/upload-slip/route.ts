export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'

const PLAN_PRICE: Record<string, number> = {
  standard: 150,
  pro:      390,
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient() as any

  const form       = await req.formData()
  const slipFile   = form.get('slip') as File | null
  const tenantSlug = form.get('tenantSlug') as string
  const planType   = (form.get('planType') as string) ?? 'standard'
  const months     = parseInt((form.get('months') as string) ?? '1', 10)

  if (!slipFile || !tenantSlug) {
    return NextResponse.json({ error: 'กรุณาแนบรูปสลิปและระบุ tenantSlug' }, { status: 400 })
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single()

  if (!tenant) {
    return NextResponse.json({ error: 'ไม่พบร้านค้า' }, { status: 404 })
  }

  const ext      = slipFile.type.split('/')[1] ?? 'jpg'
  const filename = `${tenant.id}/${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('payment-slips')
    .upload(filename, slipFile, { contentType: slipFile.type, upsert: false })

  if (uploadErr) {
    return NextResponse.json({ error: 'อัพโหลดรูปไม่สำเร็จ' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('payment-slips')
    .getPublicUrl(filename)

  const expectedAmount = PLAN_PRICE[planType] * months
  const { error: payErr } = await supabase
    .from('payments')
    .insert({
      tenant_id:     tenant.id,
      amount:        expectedAmount,
      method:        'promptpay',
      status:        'pending',
      slip_url:      publicUrl,
      months,
      plan_type:     planType,
      review_status: 'pending',
    })

  if (payErr) {
    return NextResponse.json({ error: 'บันทึก payment ไม่สำเร็จ' }, { status: 500 })
  }

  return NextResponse.json({
    status:  'pending_review',
    message: '📋 รูปสลิปได้รับแล้ว กำลังรอ admin ตรวจสอบ (ปกติภายใน 1-2 ชั่วโมง)',
  })
}
