'use client'

import { useState } from 'react'

interface Props {
  tenantId:    string
  currentPlan: string
}

export default function ShopStatusActions({ tenantId, currentPlan }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  async function act(action: 'activate' | 'suspend' | 'extend') {
    setLoading(action)
    await fetch('/api/admin/shops/status', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ tenantId, action }),
    })
    setLoading(null)
    window.location.reload()
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {currentPlan !== 'active' && (
        <button
          disabled={!!loading}
          onClick={() => act('activate')}
          className="px-2.5 py-1 bg-teal-light text-teal-dark text-[0.65rem] font-bold rounded-md hover:opacity-80 transition disabled:opacity-40"
        >
          {loading === 'activate' ? '...' : 'Activate'}
        </button>
      )}
      {currentPlan === 'active' && (
        <button
          disabled={!!loading}
          onClick={() => act('extend')}
          className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[0.65rem] font-bold rounded-md hover:opacity-80 transition disabled:opacity-40"
        >
          {loading === 'extend' ? '...' : '+30 วัน'}
        </button>
      )}
      {currentPlan !== 'suspended' && currentPlan !== 'cancelled' && (
        <button
          disabled={!!loading}
          onClick={() => act('suspend')}
          className="px-2.5 py-1 bg-red-50 text-red-500 text-[0.65rem] font-bold rounded-md hover:opacity-80 transition disabled:opacity-40"
        >
          {loading === 'suspend' ? '...' : 'Suspend'}
        </button>
      )}
    </div>
  )
}
