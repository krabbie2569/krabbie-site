'use client'

import { useState } from 'react'

interface Props {
  shopId: string
  seeds: number
}

export default function ExtendShopButton({ shopId, seeds }: Props) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function extend() {
    setLoading(true)
    setErr('')
    const res = await fetch('/api/shops/extend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopId }),
    })
    const json = await res.json()
    if (!res.ok) {
      setErr(json.error ?? 'เกิดข้อผิดพลาด')
      setLoading(false)
    } else {
      window.location.reload()
    }
  }

  const noSeeds = seeds < 1

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={loading || noSeeds}
        onClick={extend}
        title={noSeeds ? 'ไม่มี Seed — ติดต่อ LINE: @krabbie' : 'ใช้ 1 Seed ต่ออายุ 30 วัน'}
        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
          noSeeds
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
      >
        {loading ? '...' : '🌱 +30 วัน'}
      </button>
      {err && <div className="text-red-500 text-[0.6rem] font-mono max-w-[120px] text-right leading-tight">{err}</div>}
    </div>
  )
}
