export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase.server'

async function getOwnerTenant(supabaseAuth: any, supabase: any, slug: string) {
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return null
  const { data: tenant } = await supabase
    .from('tenants').select('id, auth_user_id, owner_email')
    .eq('slug', slug).maybeSingle()
  if (!tenant) return null
  if (tenant.auth_user_id !== user.id && tenant.owner_email !== user.email) return null
  return tenant
}

// POST — create service
export async function POST(req: NextRequest) {
  const supabaseAuth = await createServerSupabaseClient() as any
  const supabase = createServiceClient() as any
  const body = await req.json()
  const tenant = await getOwnerTenant(supabaseAuth, supabase, body.slug)
  if (!tenant) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 })

  const { data, error } = await supabase.from('services').insert({
    tenant_id:        tenant.id,
    name:             body.name,
    description:      body.description || null,
    duration_minutes: Number(body.duration_minutes),
    price:            Number(body.price),
    is_active:        body.is_active ?? true,
    sort_order:       body.sort_order ?? 99,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// PUT — update service
export async function PUT(req: NextRequest) {
  const supabaseAuth = await createServerSupabaseClient() as any
  const supabase = createServiceClient() as any
  const body = await req.json()
  const tenant = await getOwnerTenant(supabaseAuth, supabase, body.slug)
  if (!tenant) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 })

  const { data, error } = await supabase.from('services')
    .update({
      name:             body.name,
      description:      body.description || null,
      duration_minutes: Number(body.duration_minutes),
      price:            Number(body.price),
      is_active:        body.is_active ?? true,
    })
    .eq('id', body.id)
    .eq('tenant_id', tenant.id)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE — delete service
export async function DELETE(req: NextRequest) {
  const supabaseAuth = await createServerSupabaseClient() as any
  const supabase = createServiceClient() as any
  const { slug, id } = await req.json()
  const tenant = await getOwnerTenant(supabaseAuth, supabase, slug)
  if (!tenant) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 })

  const { error } = await supabase.from('services')
    .delete().eq('id', id).eq('tenant_id', tenant.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
