'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sanitizeSlug, isValidSlug, shopUrl } from '@/lib/utils'
import type { SignupForm } from '@/types'

const TEMPLATES = [
  { id: 'booking-service', name: 'ระบบจองบริการ', emoji: '📅', desc: 'นวด · ฝึกสอน · ช่างภาพ · ซ่อม', available: true },
  { id: 'booking-spa',     name: 'สปา & นวดแผนไทย', emoji: '🌿', desc: 'สปา · อโรมา · นวดแผนไทย', available: true },
  { id: 'shop',            name: 'ร้านขายสินค้า',   emoji: '🛍️', desc: 'เร็วๆ นี้', available: false },
  { id: 'qr-menu',         name: 'QR เมนูร้านอาหาร', emoji: '🍜', desc: 'เร็วๆ นี้', available: false },
]

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<SignupForm>({
    templateId: '',
    shopName:   '',
    slug:       '',
    ownerEmail: '',
    ownerPhone: '',
  })
  const [loading, setLoading] = useState(false)
  const [slugError, setSlugError] = useState('')

  function setField<K extends keyof SignupForm>(key: K, value: SignupForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSlugChange(raw: string) {
    const clean = sanitizeSlug(raw)
    setField('slug', clean)
    if (clean && !isValidSlug(clean)) {
      setSlugError('ใช้ตัวอักษรภาษาอังกฤษพิมพ์เล็กและตัวเลขเท่านั้น')
    } else {
      setSlugError('')
    }
  }

  function autoSlug(name: string) {
    if (!form.slug) {
      const generated = sanitizeSlug(name)
      setField('slug', generated)
    }
  }

  async function handleSubmit() {
    setLoading(true)
    // TODO: call POST /api/signup
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setStep(3)
  }

  return (
    <main className="min-h-screen bg-krabbie-bg flex flex-col">

      {/* NAV */}
      <nav className="bg-krabbie-dark px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-2xl">🦀</Link>
        <span className="font-syne text-white font-extrabold">
          Krabbie<span className="text-orange-500">.com</span>
        </span>
      </nav>

      <div className="flex-1 flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-lg">

          {/* STEP INDICATOR */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                  s < step ? 'bg-teal-DEFAULT text-white' :
                  s === step ? 'bg-orange-500 text-white' :
                  'bg-krabbie-border text-gray-400'
                }`}>{s < step ? '✓' : s}</div>
                {s < 3 && <div className={`h-0.5 w-8 transition-colors ${s < step ? 'bg-teal-DEFAULT' : 'bg-krabbie-border'}`} />}
              </div>
            ))}
            <span className="font-mono text-xs text-gray-400 ml-2">
              {step === 1 ? 'เลือก template' : step === 2 ? 'ข้อมูลร้าน' : 'เสร็จสิ้น!'}
            </span>
          </div>

          {/* STEP 1: CHOOSE TEMPLATE */}
          {step === 1 && (
            <div>
              <h1 className="font-syne text-2xl font-bold mb-1">เลือก Template ที่ใช่</h1>
              <p className="text-gray-500 text-sm mb-6">เลือก template ที่เหมาะกับธุรกิจของคุณ</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    disabled={!t.available}
                    onClick={() => setField('templateId', t.id)}
                    className={`p-4 rounded-krabbie border-2 text-left transition-all ${
                      !t.available ? 'opacity-50 cursor-not-allowed border-krabbie-border' :
                      form.templateId === t.id ? 'border-orange-500 bg-orange-50' :
                      'border-krabbie-border hover:border-orange-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{t.emoji}</div>
                    <div className="font-bold text-sm mb-1">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.desc}</div>
                    {!t.available && <div className="badge-soon mt-1 inline-block">เร็วๆ นี้</div>}
                  </button>
                ))}
              </div>
              <button
                disabled={!form.templateId}
                onClick={() => setStep(2)}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ถัดไป →
              </button>
            </div>
          )}

          {/* STEP 2: SHOP INFO */}
          {step === 2 && (
            <div>
              <h1 className="font-syne text-2xl font-bold mb-1">ข้อมูลร้านของคุณ</h1>
              <p className="text-gray-500 text-sm mb-6">กรอกข้อมูลเพื่อสร้างเว็บร้านของคุณ</p>

              <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-700 mb-5">
                🎉 ทดลองใช้ฟรี 1 เดือน — ไม่ต้องชำระจนกว่าจะพอใจ
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">ชื่อร้าน *</label>
                  <input
                    className="input"
                    placeholder="เช่น ร้านนวดสบาย"
                    value={form.shopName}
                    onChange={e => { setField('shopName', e.target.value); autoSlug(e.target.value) }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Subdomain (ที่อยู่เว็บ) *</label>
                  <div className="flex">
                    <input
                      className="input rounded-r-none border-r-0"
                      placeholder="sabaidee"
                      value={form.slug}
                      onChange={e => handleSlugChange(e.target.value)}
                    />
                    <span className="border-2 border-krabbie-border rounded-r-lg bg-gray-50 px-3 flex items-center font-mono text-xs text-gray-500 whitespace-nowrap">
                      .krabbie.com
                    </span>
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
                    value={form.ownerPhone}
                    onChange={e => setField('ownerPhone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">อีเมล</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="shop@email.com"
                    value={form.ownerEmail}
                    onChange={e => setField('ownerEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-outline flex-1">← ย้อนกลับ</button>
                <button
                  disabled={!form.shopName || !form.slug || !!slugError || !form.ownerPhone || loading}
                  onClick={handleSubmit}
                  className="btn-primary flex-2 flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังสร้าง...' : 'สร้างเว็บร้าน →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="text-center">
              <div className="text-6xl mb-4">🦀</div>
              <h1 className="font-syne text-2xl font-bold mb-2">สร้างร้านสำเร็จแล้ว!</h1>
              <p className="text-gray-500 text-sm mb-4">เว็บของคุณพร้อมใช้งานที่</p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 font-mono text-orange-600 text-sm mb-6">
                {form.slug ? shopUrl(form.slug) : 'yourshop.krabbie.com'}
              </div>
              <p className="text-xs text-gray-400 mb-6 font-mono">
                ✓ ทดลองฟรี 1 เดือน · ชำระ 150 ฿ ต่อเมื่อพอใจ
              </p>
              <a href={form.slug ? shopUrl(form.slug) : '#'} className="btn-primary block mb-3">
                เข้าเว็บร้านของฉัน →
              </a>
              <Link href="/" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">
                กลับหน้าหลัก
              </Link>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
