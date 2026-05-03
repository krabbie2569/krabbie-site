import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'
import { verifySlip, validatePayment } from '@/lib/slip-verify'

const PLAN_PRICE: Record<string, number> = {
  standard: 150,
  pro:      390,
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()

  // ── Parse multipart form ──────────────────────────────────
  const form      = await req.formData()
  const slipFile  = form.get('slip') as File | null
  const tenantSlug = form.get('tenantSlug') as string
  const planType  = (form.get('planType') as string) ?? 'standard'
  const months    = parseInt((form.get('months') as string) ?? '1', 10)

  if (!slipFile || !tenantSlug) {
    return NextResponse.json({ error: 'กรุณาแนบรูปสลิปและระบุ tenantSlug' }, { status: 400 })
  }

  // ── Fetch tenant ──────────────────────────────────────────
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, plan, plan_type')
    .eq('slug', tenantSlug)
    .single() as { data: Record<string, any> | null; error: unknown }

  if (!tenant) {
    return NextResponse.json({ error: 'ไม่พบร้านค้า' }, { status: 404 })
  }

  // ── Upload slip to Supabase Storage ──────────────────────
  const bytes     = await slipFile.arrayBuffer()
  const buffer    = Buffer.from(bytes)
  const ext       = slipFile.type.split('/')[1] ?? 'jpg'
  const filename  = `${tenant.id}/${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('payment-slips')
    .upload(filename, buffer, { contentType: slipFile.type, upsert: false })

  if (uploadErr) {
    return NextResponse.json({ error: 'อัพโหลดรูปไม่สำเร็จ' }, { status: 500 })
  }

  // Get signed URL for the slip (valid 1 hour for verification)
  const { data: { signedUrl } } = await supabase.storage
    .from('payment-slips')
    .createSignedUrl(filename, 3600)

  // ── Create payment record (pending) ─────────────────────
  const expectedAmount = PLAN_PRICE[planType] * months
  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .insert({
      tenant_id:    tenant.id,
      amount:       expectedAmount,
      method:       'promptpay',
      status:       'pending',
      slip_url:     signedUrl,
      months,
      plan_type:    planType,
      review_status: 'pending',
    })
    .select()
    .single() as { data: Record<string, any> | null; error: unknown }

  if (payErr || !payment) {
    return NextResponse.json({ error: 'บันทึก payment ไม่สำเร็จ' }, { status: 500 })
  }

  // ── Auto verify slip ──────────────────────────────────────
  const imageBase64 = buffer.toString('base64')
  const mimeType    = slipFile.type as 'image/jpeg' | 'image/png' | 'image/webp'

  const verifyResult = await verifySlip(imageBase64, mimeType)
  const validation   = validatePayment(verifyResult, expectedAmount)

  // ── Check duplicate transaction ──────────────────────────
  if (verifyResult.transactionRef) {
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('transaction_ref', verifyResult.transactionRef)
      .neq('id', payment.id)
      .single() as { data: Record<string, any> | null; error: unknown }

    if (existing) {
      await supabase.from('payments').update({
        review_status:    'rejected',
        rejection_reason: 'สลิปนี้ถูกใช้ไปแล้ว',
        verify_raw:       verifyResult.rawResponse,
        verify_method:    verifyResult.method,
      }).eq('id', payment.id)

      return NextResponse.json({
        error:  'สลิปนี้ถูกใช้ไปแล้ว กรุณาติดต่อ admin',
        status: 'duplicate',
      }, { status: 409 })
    }
  }

  // ── Update payment with verify result ────────────────────
  const updateData: Record<string, unknown> = {
    transaction_ref: verifyResult.transactionRef,
    verified_amount: verifyResult.amount,
    verify_method:   verifyResult.method,
    verify_raw:      verifyResult.rawResponse as object,
  }

  if (validation.valid && verifyResult.method === 'easyslip') {
    // EasySlip ยืนยันผ่าน → auto approve ทันที
    updateData.review_status = 'auto_approved'
    updateData.status        = 'paid'
    updateData.paid_at       = new Date().toISOString()
    updateData.verified_at   = new Date().toISOString()

    await supabase.from('payments').update(updateData).eq('id', payment.id)

    // Activate tenant
    await supabase.rpc('activate_tenant', {
      p_tenant_id:  tenant.id,
      p_payment_id: payment.id,
      p_months:     months,
    })

    // Update tenant plan_type if upgrading to pro
    if (planType === 'pro') {
      await supabase.from('tenants').update({ plan_type: 'pro' }).eq('id', tenant.id)
    }

    return NextResponse.json({
      status:  'auto_approved',
      message: '✅ ยืนยันการชำระเงินสำเร็จ! แพลนของคุณถูก activate แล้ว',
      method:  verifyResult.method,
    })
  }

  if (validation.valid && verifyResult.method === 'claude_vision') {
    // Claude Vision ผ่าน → รอ admin approve (ไม่ auto เพราะ verify กับ bank จริงไม่ได้)
    updateData.review_status = 'pending'
    await supabase.from('payments').update(updateData).eq('id', payment.id)

    return NextResponse.json({
      status:  'pending_review',
      message: '📋 รูปสลิปได้รับแล้ว กำลังรอ admin ตรวจสอบ (ปกติภายใน 1-2 ชั่วโมง)',
      method:  verifyResult.method,
    })
  }

  // ── Verify ไม่ผ่าน → pending manual review ───────────────
  updateData.review_status = 'pending'
  await supabase.from('payments').update(updateData).eq('id', payment.id)

  return NextResponse.json({
    status:  'pending_review',
    message: validation.reason
      ? `⚠️ ${validation.reason} — admin จะตรวจสอบภายใน 1-2 ชั่วโมง`
      : '📋 กำลังรอ admin ตรวจสอบ',
    method:  verifyResult.method,
  })
}
