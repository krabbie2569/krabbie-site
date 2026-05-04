export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'

type Action = 'activate' | 'suspend' | 'extend'

export async function POST(req: NextRequest) {
  const { tenantId, action }: { tenantId: string; action: Action } = await req.json()

  if (!tenantId || !['activate', 'suspend', 'extend'].includes(action)) {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  const supabase = createServiceClient() as any

  const now = new Date()
  let update: Record<string, unknown> = {}

  if (action === 'activate') {
    const expires = new Date(now)
    expires.setDate(expires.getDate() + 30)
    update = { plan: 'active', activated_at: now.toISOString(), expires_at: expires.toISOString() }
  } else if (action === 'suspend') {
    update = { plan: 'suspended' }
  } else if (action === 'extend') {
    const { data: tenant } = await supabase.from('tenants').select('expires_at').eq('id', tenantId).single()
    const base    = tenant?.expires_at ? new Date(tenant.expires_at) : now
    const expires = new Date(Math.max(base.getTime(), now.getTime()))
    expires.setDate(expires.getDate() + 30)
    update = { plan: 'active', expires_at: expires.toISOString() }
  }

  const { error } = await supabase.from('tenants').update(update).eq('id', tenantId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
