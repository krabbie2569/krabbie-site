export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase.server'

export async function POST(req: NextRequest) {
  const supabaseAuth = await createServerSupabaseClient() as any
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })

  const { shopId }: { shopId: string } = await req.json()
  if (!shopId) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })

  const supabase = createServiceClient() as any

  const { data: shop } = await supabase
    .from('tenants')
    .select('id, slug, expires_at, auth_user_id, owner_email')
    .eq('id', shopId)
    .maybeSingle()

  if (!shop) return NextResponse.json({ error: 'ไม่พบร้าน' }, { status: 404 })

  const isOwner = shop.auth_user_id === user.id || shop.owner_email === user.email
  if (!isOwner) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 })

  const { data: profile } = await supabase
    .from('profiles').select('seeds').eq('id', user.id).maybeSingle()

  const seeds = profile?.seeds ?? 0
  if (seeds < 1) {
    return NextResponse.json(
      { error: 'ไม่มี Seed — ติดต่อ LINE: @krabbie เพื่อซื้อ Seed' },
      { status: 402 }
    )
  }

  // Extend from current expiry (or now if expired), +30 days
  const base = shop.expires_at ? new Date(shop.expires_at) : new Date()
  const newExpiry = new Date(Math.max(base.getTime(), Date.now()))
  newExpiry.setDate(newExpiry.getDate() + 30)

  await Promise.all([
    supabase.from('tenants')
      .update({ plan: 'active', expires_at: newExpiry.toISOString() })
      .eq('id', shopId),
    supabase.from('profiles')
      .update({ seeds: seeds - 1 })
      .eq('id', user.id),
    supabase.from('seed_transactions')
      .insert({ user_id: user.id, delta: -1, note: `ต่ออายุร้าน ${shop.slug}` }),
  ])

  return NextResponse.json({ success: true })
}
