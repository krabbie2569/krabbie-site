'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Tenant {
  id: string
  name: string
  plan: string
  plan_type: string
  slug: string
}

export default function TenantActions({ tenant }: { tenant: Tenant }) {
  const router  = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [planType, setPlanType] = useState(tenant.plan_type === 'pro' ? 'pro' : 'standard')
  const [months, setMonths]   = useState(1)

  async function update(updates: Record<string, unknown>) {
    setLoading(JSON.stringify(updates))
    const supabase = createClient() as any
    await supabase.from('tenants').update(updates).eq('id', tenant.id)
    setLoading(null)
    router.refresh()
  }

  async function activate() {
    const expires = new Date()
    expires.setMonth(expires.getMonth() + months)
    await update({
      plan:       'active',
      plan_type:  planType,
      expires_at: expires.toISOString(),
    })
  }

  async function suspend()   { await update({ plan: 'suspended' }) }
  async function unsuspend() { await update({ plan: 'active'    }) }

  const isLoading = loading !== null

  return (
    <div className="card space-y-4">
      <div className="sec-label">Actions</div>

      {/* ACTIVATE */}
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-500">Plan</label>
          <select
            value={planType}
            onChange={e => setPlanType(e.target.value)}
            className="input text-sm py-2 pr-8"
          >
            <option value="standard">Standard 150฿</option>
            <option value="pro">Pro 299฿</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-500">เดือน</label>
          <select
            value={months}
            onChange={e => setMonths(Number(e.target.value))}
            className="input text-sm py-2 pr-8"
          >
            {[1,2,3,6,12].map(m => (
              <option key={m} value={m}>{m} เดือน</option>
            ))}
          </select>
        </div>
        <button
          disabled={isLoading}
          onClick={activate}
          className="px-4 py-2 bg-teal-light text-teal-dark text-sm font-bold rounded-lg hover:bg-teal-DEFAULT/20 transition-colors disabled:opacity-50"
        >
          {isLoading ? '...' : '✓ Activate'}
        </button>
      </div>

      {/* SUSPEND / UNSUSPEND */}
      <div className="flex gap-3 pt-3 border-t border-gray-100 flex-wrap">
        {tenant.plan !== 'suspended' ? (
          <button
            disabled={isLoading}
            onClick={suspend}
            className="px-4 py-2 bg-red-50 text-red-500 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            ⏸ Suspend
          </button>
        ) : (
          <button
            disabled={isLoading}
            onClick={unsuspend}
            className="px-4 py-2 bg-orange-50 text-orange-600 text-sm font-bold rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            ▶ Unsuspend
          </button>
        )}
        <div className="flex-1 text-right">
          <span className={`text-xs font-mono px-3 py-2 rounded ${
            tenant.plan === 'active' ? 'bg-teal-light text-teal-dark' :
            tenant.plan === 'trial'  ? 'badge-trial' :
            tenant.plan === 'suspended' ? 'bg-red-100 text-red-500' :
            'bg-gray-100 text-gray-400'
          }`}>
            Status: {tenant.plan}
          </span>
        </div>
      </div>
    </div>
  )
}
