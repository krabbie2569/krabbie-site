'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      setLoading(false)
      return
    }

    // Determine where to redirect
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '9k@4k.co.th'
    if (data.user.email === adminEmail) {
      router.push('/admin')
      return
    }

    // Find tenant by owner_email
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('slug')
      .eq('owner_email', data.user.email!)
      .maybeSingle()

    const slug = (tenantData as { slug: string } | null)?.slug
    if (slug) {
      const domain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'krabbie.com'
      const isLocalhost = window.location.hostname === 'localhost'
      if (isLocalhost) {
        router.push(`/?tenant=${slug}&redirect=admin`)
      } else {
        window.location.href = `https://${slug}.${domain}/admin`
      }
      return
    }

    setError('ไม่พบบัญชีของคุณ กรุณาติดต่อ support')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-krabbie-bg flex flex-col items-center justify-center px-4">

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl">🦀</Link>
          <div className="font-syne text-white text-xl font-extrabold mt-2">
            Krabbie<span className="text-orange-500">.com</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="card space-y-4">
          <h1 className="font-syne text-lg font-bold">เข้าสู่ระบบ</h1>

          <div>
            <label className="block text-sm font-semibold mb-1">อีเมล</label>
            <input
              type="email"
              className="input"
              placeholder="shop@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">รหัสผ่าน</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

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

        <p className="text-center text-xs text-gray-500 mt-4">
          ยังไม่มีบัญชี?{' '}
          <Link href="/signup" className="text-orange-500 hover:underline">สมัครฟรี</Link>
        </p>
      </div>
    </main>
  )
}
