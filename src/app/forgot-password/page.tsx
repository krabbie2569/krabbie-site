'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (err) {
      setError('ไม่สามารถส่งอีเมลได้ กรุณาตรวจสอบอีเมลของคุณ')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-krabbie-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🦀</span>
            <span className="font-syne text-2xl font-extrabold">
              Krabbie<span className="text-orange-500">.com</span>
            </span>
          </Link>
          <p className="font-mono text-gray-400 text-xs mt-2">รีเซ็ตรหัสผ่าน</p>
        </div>

        {sent ? (
          <div className="card text-center">
            <div className="text-4xl mb-3">📧</div>
            <h2 className="font-syne font-bold text-lg mb-2">ส่งอีเมลแล้ว!</h2>
            <p className="text-sm text-gray-500 mb-4">
              ตรวจสอบกล่องขาเข้าที่ <span className="font-semibold text-orange-500">{email}</span><br />
              กดลิงก์ในอีเมลเพื่อตั้งรหัสผ่านใหม่
            </p>
            <p className="font-mono text-xs text-gray-400">ไม่เห็นอีเมล? ตรวจสอบโฟลเดอร์ spam</p>
            <Link href="/login" className="btn-outline block mt-4 text-center">
              กลับหน้าล็อกอิน
            </Link>
          </div>
        ) : (
          <div className="card">
            <h2 className="font-syne font-bold text-lg mb-1">ลืมรหัสผ่าน?</h2>
            <p className="text-sm text-gray-500 mb-5">ใส่อีเมลที่สมัครไว้ เราจะส่งลิงก์รีเซ็ตให้</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="sec-label mb-1">อีเมล</label>
                <input
                  type="email"
                  required
                  className="input w-full"
                  placeholder="shop@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-red-500 text-xs font-mono bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ต →'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center font-mono text-xs text-gray-400 mt-4">
          <Link href="/login" className="text-orange-500 hover:underline">← กลับหน้าล็อกอิน</Link>
        </p>

      </div>
    </main>
  )
}
