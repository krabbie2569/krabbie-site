export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'

export async function POST(req: NextRequest) {
  const { tenantId }: { tenantId: string } = await req.json()

  if (!tenantId) {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  const supabase = createServiceClient() as any

  const { error } = await supabase.from('tenants').delete().eq('id', tenantId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
