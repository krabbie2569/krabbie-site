'use client'

import { useState } from 'react'

interface Props {
  userId:      string
  userEmail:   string
  seedBalance: number
  onSuccess?: () => void
}

export default function AddSeedsButton({ userId, userEmail, seedBalance, onSuccess }: Props) {
  const [open,    setOpen]    = useState(false)
  const [amount,  setAmount]  = useState('1')
  const [note,    setNote]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleAdd() {
    const n = parseInt(amount)
    if (!n || n < 1 || n > 99) { setError('จำนวน 1–99 เท่านั้น'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/seeds/add', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId, amount: n, note }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error ?? 'เกิดข้อผิดพลาด'); return }
    setOpen(false)
    setAmount('1')
    setNote('')
    onSuccess?.()
    window.location.reload()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors whitespace-nowrap"
      >
        + Seed
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="font-mono text-xs text-gray-400 truncate max-w-[120px]">{userEmail}</div>
      <input
        type="number"
        min={1} max={99}
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="input w-16 text-sm py-1 text-center"
        placeholder="1"
      />
      <input
        type="text"
        value={note}
        onChange={e => setNote(e.target.value)}
        className="input w-32 text-sm py-1"
        placeholder="หมายเหตุ (ไม่บังคับ)"
      />
      <button
        disabled={loading}
        onClick={handleAdd}
        className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {loading ? '...' : 'ยืนยัน'}
      </button>
      <button
        onClick={() => { setOpen(false); setError('') }}
        className="px-3 py-1 border border-gray-200 text-gray-400 text-xs rounded-lg hover:border-gray-300"
      >
        ยกเลิก
      </button>
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  )
}
