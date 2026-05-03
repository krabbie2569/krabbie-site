'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sanitizeSlug, isValidSlug, shopUrl } from '@/lib/utils'

export default function SignupPage() {
  const [form, setForm] = useState({ shopName: '', slug: '', ownerEmail: '', ownerPhone: '', password: '' })
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading]         = useState(false)
  const [slugError, setSlugError]     = useState('')
  const [error, setError]             = useState('')
  const [done, setDone]               = useState(false)

  function handleSlugChange(raw: string) {
    const clean = sanitizeSlug(raw)
    setForm(f => ({ ...f, slug: clean }))
    setSlugError(clean && !isValidSlug(clean) ? 'ใช้ตัวอักษรพิมพ์เล็กและตัวเลขเท่านั้น' : '')
  }

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, shopName: name, slug: f.slug || sanitizeSlug(name) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) { setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return }
    if (form.password !== confirmPass) { setError('รหัสผ่านไม่ตรงกัน'); return }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, templateId: 'booking-service' }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่'); return }
      setDone(true)
    } catch {
      setError('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <main className="min-h-screen bg-krabbie-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-4">🦀</div>
          <h1 className="font-syne text-2xl font-bold mb-2">สมัครสำเร็จ!</h1>
          <p className="text-gray-500 text-sm mb-4">เว็บร้านของคุณพร้อมใช้งานแล้ว</p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 font-mono text-orange-600 text-sm mb-4">
            {shopUrl(form.slug)}
          </div>
          <p className="text-xs text-gray-400 mb-6">ล็อกอินเพื่อตั้งค่าร้านและเลือก template</p>
          <Link href="/login" className="btn-primary block mb-3">
            เข้าสู่ระบบจัดการร้าน →
          </Link>
          <Link href="/" className="text-gray-400 text-sm hover:text-orange-500">กลับหน้าหลัก</Link>
        </div>
      </main>
    )
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

      <div className="flex-1 flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-md">

          <h1 className="font-syne text-2xl font-bold mb-1">สร้างเว็บร้านฟรี</h1>
          <p className="text-gray-500 text-sm mb-6">ทดลองใช้ฟรี 14 วัน · ไม่ต้องใช้บัตรเครดิต</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">ชื่อร้าน *</label>
              <input
                className="input"
                placeholder="เช่น ร้านนวดสบาย"
                required
                value={form.shopName}
                onChange={e => handleNameChange(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                ที่อยู่เว็บ (URL) *
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border-2 border-krabbie-border rounded-krabbie px-3 py-2 focus-within:border-orange-400 transition-colors">
                <span className="font-mono text-xs text-gray-400 whitespace-nowrap flex-shrink-0">/</span>
                <input
                  className="flex-1 bg-transparent outline-none font-mono text-sm"
                  placeholder="shop-name"
                  value={form.slug}
                  onChange={e => handleSlugChange(e.target.value)}
                />
              </div>
              {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
              {form.slug && !slugError && (
                <p className="text-teal-dark text-xs mt-1 font-mono">✓ {shopUrl(form.slug)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">เบอร์โทร / Line ID *</label>
              <input
                className="input"
                placeholder="0812345678 หรือ @lineid"
                required
                value={form.ownerPhone}
                onChange={e => setForm(f => ({ ...f, ownerPhone: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                อีเมล * <span className="font-normal text-gray-400">(ใช้ล็อกอิน)</span>
              </label>
              <input
                className="input"
                type="email"
                placeholder="shop@email.com"
                required
                value={form.ownerEmail}
                onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                รหัสผ่าน * <span className="font-normal text-gray-400">(อย่างน้อย 8 ตัว)</span>
              </label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">ยืนยันรหัสผ่าน *</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.shopName || !form.slug || !!slugError}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed text-base py-3 mt-2"
            >
              {loading ? 'กำลังสร้าง...' : 'สร้างเว็บร้านฟรี →'}
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
