export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase.server'

export async function PUT(req: NextRequest) {
  const supabaseAuth = await createServerSupabaseClient() as any
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })

  const supabase = createServiceClient() as any
  const body = await req.json()
  const { slug, name, owner_phone, settings } = body

  const { data: tenant } = await supabase
    .from('tenants').select('id, auth_user_id, owner_email, settings')
    .eq('slug', slug).maybeSingle()
  if (!tenant) return NextResponse.json({ error: 'ไม่พบร้าน' }, { status: 404 })
  if (tenant.auth_user_id !== user.id && tenant.owner_email !== user.email)
    return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 })

  const merged = { ...(tenant.settings as object ?? {}), ...settings }

  const { error } = await supabase.from('tenants').update({
    name,
    owner_phone: owner_phone || '',
    settings:   merged,
  }).eq('id', tenant.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
