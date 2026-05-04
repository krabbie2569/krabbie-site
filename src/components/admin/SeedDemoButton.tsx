'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SeedDemoButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleSeed() {
    setLoading(true)
    const res = await fetch('/api/shops/seed-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    setLoading(false)
    if (res.ok) {
      setDone(true)
      setTimeout(() => router.refresh(), 800)
    }
  }

  if (done) {
    return (
      <div className="card text-center py-8 text-teal-dark text-sm font-semibold">
        ✅ โหลดข้อมูลตัวอย่างสำเร็จ — กำลังรีเฟรช...
      </div>
    )
  }

  return (
    <div className="card py-8 text-center">
      <div className="text-3xl mb-3">🚀</div>
      <p className="text-sm text-gray-500 mb-4">ร้านยังไม่มีบริการ — โหลดข้อมูลตัวอย่างเพื่อเริ่มต้นได้เลย</p>
      <button
        onClick={handleSeed}
        disabled={loading}
        className="btn-primary disabled:opacity-40"
      >
        {loading ? 'กำลังโหลด...' : '📦 โหลดข้อมูลตัวอย่าง'}
      </button>
      <p className="text-xs text-gray-400 mt-3">สามารถแก้ไขหรือลบทีหลังได้</p>
    </div>
  )
}
