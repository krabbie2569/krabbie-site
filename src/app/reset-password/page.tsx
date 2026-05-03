'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [ready, setReady]           = useState(false)
  const [done, setDone]             = useState(false)

  useEffect(() => {
    // Supabase sets the session from the URL hash/params automatically
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return }
    if (password !== confirm)  { setError('รหัสผ่านไม่ตรงกัน'); return }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })

    if (err) {
      setError('ตั้งรหัสผ่านไม่สำเร็จ ลิงก์อาจหมดอายุแล้ว')
    } else {
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
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
          <p className="font-mono text-gray-400 text-xs mt-2">ตั้งรหัสผ่านใหม่</p>
        </div>

        {done ? (
          <div className="card text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="font-syne font-bold text-lg mb-2">ตั้งรหัสผ่านสำเร็จ!</h2>
            <p className="text-sm text-gray-500">กำลังพาไปหน้าล็อกอิน...</p>
          </div>
        ) : !ready ? (
          <div className="card text-center py-8">
            <div className="text-gray-400 text-sm font-mono">กำลังตรวจสอบลิงก์...</div>
          </div>
        ) : (
          <div className="card">
            <h2 className="font-syne font-bold text-lg mb-1">ตั้งรหัสผ่านใหม่</h2>
            <p className="text-sm text-gray-500 mb-5">ใส่รหัสผ่านใหม่ที่ต้องการ</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="sec-label mb-1">รหัสผ่านใหม่</label>
                <input
                  type="password"
                  required
                  className="input w-full"
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="sec-label mb-1">ยืนยันรหัสผ่าน</label>
                <input
                  type="password"
                  required
                  className="input w-full"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-red-500 text-xs font-mono bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน →'}
              </button>
            </form>
          </div>
        )}

      </div>
    </main>
  )
}
