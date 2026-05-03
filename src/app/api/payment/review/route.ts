export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'

// Super admin: approve หรือ reject payment ด้วยตัวเอง
export async function POST(req: NextRequest) {
  const supabase = createServiceClient() as any

  const { paymentId, action, reason, adminEmail } = await req.json() as {
    paymentId:  string
    action:     'approve' | 'reject'
    reason?:    string
    adminEmail: string
  }

  if (!paymentId || !action || !adminEmail) {
    return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })
  }

  // Fetch payment
  const { data: payment } = await supabase
    .from('payments')
    .select('*, tenants(id, plan_type)')
    .eq('id', paymentId)
    .single()

  if (!payment) {
    return NextResponse.json({ error: 'ไม่พบ payment' }, { status: 404 })
  }

  if (payment.review_status !== 'pending') {
    return NextResponse.json({
      error: `payment นี้ถูก ${payment.review_status} ไปแล้ว`,
    }, { status: 409 })
  }

  if (action === 'approve') {
    // Update payment
    await supabase.from('payments').update({
      review_status: 'admin_approved',
      status:        'paid',
      paid_at:       new Date().toISOString(),
      verified_at:   new Date().toISOString(),
      reviewed_by:   adminEmail,
      reviewed_at:   new Date().toISOString(),
    }).eq('id', paymentId)

    // Activate tenant
    await supabase.rpc('activate_tenant', {
      p_tenant_id:  payment.tenant_id,
      p_payment_id: paymentId,
      p_months:     payment.months,
    })

    // Upgrade plan_type ถ้าจ่าย pro
    if (payment.plan_type === 'pro') {
      await supabase
        .from('tenants')
        .update({ plan_type: 'pro' })
        .eq('id', payment.tenant_id)
    }

    return NextResponse.json({ success: true, action: 'approved' })
  }

  // Reject
  await supabase.from('payments').update({
    review_status:    'rejected',
    status:           'failed',
    rejection_reason: reason ?? 'ไม่ผ่านการตรวจสอบ',
    reviewed_by:      adminEmail,
    reviewed_at:      new Date().toISOString(),
  }).eq('id', paymentId)

  return NextResponse.json({ success: true, action: 'rejected' })
}
