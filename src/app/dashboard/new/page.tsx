'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sanitizeSlug, isValidSlug, shopUrl } from '@/lib/utils'

const TEMPLATES = [
  { id: 'booking-service', name: 'ระบบจองบริการ', emoji: '📅', desc: 'ช่างภาพ · เสริมสวย · สนามกีฬา · สปา · ที่พัก', pills: ['เลือกวันเวลา', 'อัพสลิป', 'admin ยืนยัน'] },
  { id: 'booking-rental',  name: 'เว็บเช่าสินค้า', emoji: '📷', desc: 'กล้อง · เสื้อผ้า · ชุดแต่งงาน · อุปกรณ์',      pills: ['ปฏิทิน busy days', 'เช่ารายวัน/ชั่วโมง', 'admin ยืนยัน'] },
  { id: 'shop',            name: 'ร้านขายสินค้า',  emoji: '🛍️', desc: 'เร็วๆ นี้',                                        pills: [], soon: true },
  { id: 'qr-menu',         name: 'QR เมนูอาหาร',   emoji: '🍜', desc: 'เร็วๆ นี้',                                        pills: [], soon: true },
]

export default function NewShopPage() {
  const router = useRouter()
  const [templateId, setTemplateId] = useState('booking-service')
  const [shopName, setShopName]     = useState('')
  const [slug, setSlug]             = useState('')
  const [phone, setPhone]           = useState('')
  const [slugError, setSlugError]   = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  function handleNameChange(val: string) {
    setShopName(val)
    if (!slug) setSlug(sanitizeSlug(val))
  }

  function handleSlugChange(val: string) {
    const clean = sanitizeSlug(val)
    setSlug(clean)
    setSlugError(clean && !isValidSlug(clean) ? 'ใช้ตัวอักษรพิมพ์เล็กและตัวเลขเท่านั้น' : '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (slugError) return
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/shops/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ shopName, slug, templateId, ownerPhone: phone }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'เกิดข้อผิดพลาด'); return }
      router.push(`/${json.data.slug}/admin`)
    } catch {
      setError('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-krabbie-bg">

      <div className="bg-krabbie-dark px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">← Dashboard</Link>
        <span className="text-gray-600">/</span>
        <span className="font-syne text-white font-bold text-sm">สร้างร้านใหม่</span>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">

        <h1 className="font-syne text-2xl font-bold mb-1">สร้างร้านใหม่</h1>
        <p className="text-gray-500 text-sm mb-8">เลือก template แล้วตั้งชื่อร้าน พร้อมใช้งานทันที</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* TEMPLATE PICKER */}
          <div>
            <label className="block text-sm font-semibold mb-3">เลือก Template</label>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  disabled={!!t.soon}
                  onClick={() => !t.soon && setTemplateId(t.id)}
                  className={`w-full text-left rounded-krabbie border-2 transition-all p-4 ${
                    t.soon ? 'opacity-40 cursor-not-allowed border-krabbie-border bg-gray-50' :
                    templateId === t.id ? 'border-orange-500 bg-orange-50 shadow-md' :
                    'border-krabbie-border hover:border-orange-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl w-10 text-center flex-shrink-0">{t.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm">{t.name}</span>
                        {t.soon && <span className="badge-soon text-[0.6rem]">เร็วๆ นี้</span>}
                        {templateId === t.id && !t.soon && <span className="text-xs text-orange-500 font-semibold ml-auto">✓ เลือกแล้ว</span>}
                      </div>
                      <div className="text-xs text-gray-500">{t.desc}</div>
                      {t.pills.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {t.pills.map(p => <span key={p} className="text-[0.65rem] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{p}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SHOP INFO */}
          <div className="card space-y-4">
            <div className="sec-label">ข้อมูลร้าน</div>
            <div>
              <label className="block text-sm font-semibold mb-1">ชื่อร้าน *</label>
              <input className="input" placeholder="เช่น ร้านนวดสบาย" required value={shopName} onChange={e => handleNameChange(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">URL ร้าน *</label>
              <div className="flex items-center gap-1 bg-gray-50 border-2 border-krabbie-border rounded-krabbie px-3 py-2 focus-within:border-orange-400 transition-colors">
                <span className="font-mono text-xs text-gray-400 flex-shrink-0">/</span>
                <input className="flex-1 bg-transparent outline-none font-mono text-sm" placeholder="shop-name" value={slug} onChange={e => handleSlugChange(e.target.value)} />
              </div>
              {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
              {slug && !slugError && <p className="text-teal-dark text-xs mt-1 font-mono">✓ {shopUrl(slug)}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">เบอร์โทร / Line ID</label>
              <input className="input" placeholder="0812345678 หรือ @lineid" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !shopName || !slug || !!slugError}
            className="btn-primary w-full py-3 text-base disabled:opacity-40"
          >
            {loading ? 'กำลังสร้าง...' : 'สร้างร้าน →'}
          </button>

        </form>
      </div>
    </main>
  )
}
