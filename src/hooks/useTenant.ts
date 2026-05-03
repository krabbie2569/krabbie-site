'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { parseTenantSettings } from '@/lib/tenant'
import type { Tenant, TenantSettings } from '@/types'

interface UseTenantResult {
  tenant:   Tenant | null
  settings: TenantSettings | null
  loading:  boolean
  error:    string | null
}

export function useTenant(slug: string): UseTenantResult {
  const [tenant, setTenant]   = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    const supabase = createClient()
    supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setTenant(data)
        setLoading(false)
      })
  }, [slug])

  const settings = tenant ? parseTenantSettings(tenant.settings) : null

  return { tenant, settings, loading, error }
}
