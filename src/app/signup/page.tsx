'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return }
    if (password !== confirm)  { setError('รหัสผ่านไม่ตรงกัน'); return }
    setError('')
    setLoading(true)

    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'เกิดข้อผิดพลาด'); return }
      router.push('/login?registered=1')
    } catch {
      setError('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-krabbie-bg flex flex-col">

      <nav className="bg-krabbie-dark px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-2xl">🦀</Link>
        <span className="font-syne text-white font-extrabold">
          Krabbie<span className="text-orange-500">.com</span>
        </span>
        <span className="ml-auto font-mono text-gray-500 text-xs">
          มีบัญชีแล้ว?{' '}
          <Link href="/login" className="text-orange-400 hover:underline">เข้าสู่ระบบ</Link>
        </span>
      </nav>

      <div className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <h1 className="font-syne text-2xl font-bold mb-1">สร้างบัญชีฟรี</h1>
            <p className="text-gray-500 text-sm">ทดลองใช้ฟรี 14 วัน · ไม่ต้องใช้บัตรเครดิต</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="sec-label mb-1">ชื่อของคุณ</label>
              <input
                className="input w-full"
                placeholder="ชื่อ-นามสกุล หรือชื่อเล่น"
                required
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="sec-label mb-1">อีเมล</label>
              <input
                className="input w-full"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="sec-label mb-1">รหัสผ่าน <span className="font-normal text-gray-400">(อย่างน้อย 8 ตัว)</span></label>
              <input
                className="input w-full"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="sec-label mb-1">ยืนยันรหัสผ่าน</label>
              <input
                className="input w-full"
                type="password"
                placeholder="••••••••"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-50"
            >
              {loading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชีฟรี →'}
            </button>
          </form>

          <p className="text-center font-mono text-xs text-gray-400 mt-4">
            มีบัญชีแล้ว?{' '}
            <Link href="/login" className="text-orange-500 hover:underline">เข้าสู่ระบบ</Link>
          </p>

        </div>
      </div>
    </main>
  )
}
