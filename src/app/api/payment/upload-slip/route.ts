import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'
import { uploadSlip } from '@/lib/cloudinary'

const PLAN_PRICE: Record<string, number> = {
  standard: 150,
  pro:      390,
}

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    .single() as { data: Record<string, any> | null; error: unknown }

  if (!tenant) {
    return NextResponse.json({ error: 'ไม่พบร้านค้า' }, { status: 404 })
  }

  // Upload to Cloudinary
  const bytes    = await slipFile.arrayBuffer()
  const buffer   = Buffer.from(bytes)
  let slipUrl: string

  try {
    slipUrl = await uploadSlip(buffer, slipFile.type, `krabbie/slips/${tenant.id}`)
  } catch {
    return NextResponse.json({ error: 'อัพโหลดรูปไม่สำเร็จ' }, { status: 500 })
  }

  // Save payment record — pending manual review
  const amount = PLAN_PRICE[planType] * months
  const { error: payErr } = await supabase
    .from('payments')
    .insert({
      tenant_id:     tenant.id,
      amount,
      method:        'promptpay',
      status:        'pending',
      slip_url:      slipUrl,
      months,
      plan_type:     planType,
      review_status: 'pending',
    })

  if (payErr) {
    return NextResponse.json({ error: 'บันทึก payment ไม่สำเร็จ' }, { status: 500 })
  }

  return NextResponse.json({
    status:  'pending_review',
    message: '📋 รับสลิปแล้ว admin จะตรวจสอบภายใน 1-2 ชั่วโมง',
  })
}
