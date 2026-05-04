export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'

export async function POST(req: NextRequest) {
  const { userId, amount, note } = await req.json()

  if (!userId || !amount || typeof amount !== 'number' || amount < 1 || amount > 99) {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  const supabase = createServiceClient() as any

  // Upsert profile (create if not exist), then increment seeds
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, seeds, email')
    .eq('id', userId)
    .maybeSingle()

  if (profile) {
    const { error } = await supabase
      .from('profiles')
      .update({ seeds: profile.seeds + amount })
      .eq('id', userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    // get email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(userId)
    const { error } = await supabase
      .from('profiles')
      .insert({ id: userId, seeds: amount, email: authUser?.user?.email ?? null })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log transaction
  await supabase.from('seed_transactions').insert({
    user_id:     userId,
    delta:       amount,
    note:        note || null,
    admin_email: 'stock@4k.co.th',
  })

  return NextResponse.json({ success: true, newBalance: (profile?.seeds ?? 0) + amount })
}
