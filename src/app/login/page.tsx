'use client'

export const runtime = 'edge'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'operations@4k.co.th'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // adminkrab shortcut — go straight to super admin
    if (email.trim().toLowerCase() === 'adminkrab') {
      document.cookie = 'krabbie_bypass=adminkrab_ok; path=/; max-age=86400; SameSite=Lax'
      window.location.href = '/admin'
      return
    }

    const supabase = createClient() as any

    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    if (authErr) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      setLoading(false)
      return
    }

    // Super admin
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      window.location.href = '/admin'
      return
    }

    // Tenant owner → their admin dashboard
    const { data: tenant } = await supabase
      .from('tenants')
      .select('slug')
      .eq('owner_email', email.toLowerCase())
      .single()

    if (tenant?.slug) {
      window.location.href = `/${tenant.slug}/admin`
      return
    }

    setError('ไม่พบบัญชีในระบบ กรุณาติดต่อ support')
    await supabase.auth.signOut()
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
          <p className="font-mono text-gray-400 text-xs mt-2">เข้าสู่ระบบจัดการร้านค้า</p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="sec-label mb-1">อีเมล</label>
              <input
                type="text"
                required
                autoComplete="email"
                className="input w-full"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            {email.trim().toLowerCase() !== 'adminkrab' && (
              <div>
                <label className="sec-label mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  className="input w-full"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            )}

            {error && (
              <div className="text-red-500 text-xs font-mono bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ →'}
            </button>
          </form>

          {email.trim().toLowerCase() !== 'adminkrab' && (
            <div className="text-center mt-3">
              <Link href="/forgot-password" className="font-mono text-xs text-gray-400 hover:text-orange-500 transition-colors">
                ลืมรหัสผ่าน?
              </Link>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <Link
            href="/signup"
            className="btn-outline block text-center w-full"
          >
            สมัครใช้งาน — ทดลองฟรี 14 วัน →
          </Link>
          <p className="text-center font-mono text-xs text-gray-400">
            ยังไม่มีบัญชี? สมัครได้เลย ไม่ต้องใช้บัตรเครดิต
          </p>
        </div>

      </div>
    </main>
  )
}
