export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase.server'
import { seedDemoData } from '@/lib/seed-demo'

export async function POST(req: NextRequest) {
  const supabaseAuth = await createServerSupabaseClient() as any
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })

  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'ไม่ระบุ slug' }, { status: 400 })

  const supabase = createServiceClient() as any

  // Verify this user owns the tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, template_id, auth_user_id, owner_email')
    .eq('slug', slug)
    .maybeSingle()

  if (!tenant) return NextResponse.json({ error: 'ไม่พบร้าน' }, { status: 404 })

  const isOwner = tenant.auth_user_id === user.id || tenant.owner_email === user.email
  if (!isOwner) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 })

  // Only seed if shop is still empty (no services yet)
  const { count } = await supabase
    .from('services')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: 'ร้านนี้มีบริการอยู่แล้ว' }, { status: 409 })
  }

  await seedDemoData(tenant.id, tenant.template_id ?? 'booking-service', supabase)

  return NextResponse.json({ ok: true })
}
