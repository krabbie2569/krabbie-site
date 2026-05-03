import type { Tenant, TenantSettings } from '@/types'
import { createServerSupabaseClient } from './supabase.server'

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'krabbie.com'

// Extract slug from hostname.
// "sabaidee.krabbie.com" → "sabaidee"
// "krabbie.com" | "www.krabbie.com" → null (main site)
export function extractSlugFromHost(host: string): string | null {
  const hostname = host.split(':')[0]  // strip port if present
  if (hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}`) return null
  if (hostname.endsWith(`.${APP_DOMAIN}`)) {
    return hostname.replace(`.${APP_DOMAIN}`, '')
  }
  // localhost dev: ?tenant=slug  ← handled in middleware, slug passed via header
  return null
}

// Fetch tenant row from DB by slug (used in server components/middleware)
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single()
  return data ?? null
}

// Parse JSON settings with defaults
export function parseTenantSettings(raw: unknown): TenantSettings {
  const defaults: TenantSettings = {
    primaryColor: '#ff6b00',
    logoUrl: null,
    lineId: null,
    lineNotify: false,
    pushEnabled: false,
    maxAdvanceDays: 30,
    autoConfirm: true,
    businessHours: defaultBusinessHours(),
  }
  if (!raw || typeof raw !== 'object') return defaults
  return { ...defaults, ...(raw as Partial<TenantSettings>) }
}

// Check if a tenant's subscription is still valid
export function isTenantActive(tenant: Tenant): boolean {
  if (tenant.plan === 'trial') {
    if (!tenant.trial_ends_at) return false
    return new Date(tenant.trial_ends_at) > new Date()
  }
  if (tenant.plan === 'active') {
    if (!tenant.expires_at) return false
    return new Date(tenant.expires_at) > new Date()
  }
  return false
}

function defaultBusinessHours() {
  const day = { open: true, start: '09:00', end: '18:00' }
  const closed = { open: false, start: '09:00', end: '18:00' }
  return {
    monday:    { ...day },
    tuesday:   { ...day },
    wednesday: { ...day },
    thursday:  { ...day },
    friday:    { ...day },
    saturday:  { ...day },
    sunday:    { ...closed },
  }
}
