export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase.server'

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })

  const supabase = createServiceClient() as any
  const { data: tenant } = await supabase
    .from('tenants').select('id').eq('slug', slug).maybeSingle()
  if (!tenant) return NextResponse.json({ error: 'ไม่พบร้าน' }, { status: 404 })

  const { data: services } = await supabase
    .from('services')
    .select('id, name, description, duration_minutes, price, sort_order')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('sort_order')

  return NextResponse.json({ services: services ?? [] })
}
