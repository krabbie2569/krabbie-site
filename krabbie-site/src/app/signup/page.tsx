'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { sanitizeSlug, isValidSlug, shopUrl } from '@/lib/utils'
import type { SignupForm } from '@/types'

const TEMPLATES = [
  {
    id: 'booking-service',
    name: 'จองบริการ',
    emoji: '📅',
    desc: 'นวด · ฝึกสอน · ช่างภาพ · ซ่อม',
    detail: 'รับจองคิวออนไลน์ เลือกบริการ เลือกเวลา ยืนยันอัตโนมัติ',
    color: '#ff6b00',
    bg: 'linear-gradient(135deg,#fff8f0,#ffe0c0)',
    available: true,
  },
  {
    id: 'booking-rental',
    name: 'เช่าสินค้า',
    emoji: '📷',
    desc: 'กล้อง · เสื้อผ้า · อุปกรณ์',
    detail: 'เช่ารายวัน รายชั่วโมง เลือกวันรับ-คืน ปฏิทินแสดง busy days',
    color: '#E91E8C',
    bg: 'linear-gradient(135deg,#fff0f8,#f8e0ff)',
    available: true,
  },
  {
    id: 'shop',
    name: 'ร้านขายสินค้า',
    emoji: '🛍️',
    desc: 'เร็วๆ นี้',
    detail: 'ระบบร้านค้าออนไลน์ สต็อก ออเดอร์',
    color: '#6B7280',
    bg: 'linear-gradient(135deg,#f9fafb,#f3f4f6)',
    available: false,
  },
  {
    id: 'qr-menu',
    name: 'QR เมนูอาหาร',
    emoji: '🍜',
    desc: 'เร็วๆ นี้',
    detail: 'เมนูดิจิทัล QR สั่งอาหาร ไม่ต้องพิมพ์',
    color: '#6B7280',
    bg: 'linear-gradient(135deg,#f9fafb,#f3f4f6)',
    available: false,
  },
]

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  )
}

function SignupContent() {
  const searchParams = useSearchParams()
  const [step, setStep]         = useState<1 | 2 | 3>(1)
  const [carIdx, setCarIdx]     = useState(0)
  const [preview, setPreview]   = useState<string | null>(null)
  const [form, setForm]         = useState<SignupForm>({
    templateId: '',
    shopName:   '',
    slug:       '',
    ownerEmail: '',
    ownerPhone: '',
  })
  const [loading, setLoading]     = useState(false)
  const [slugError, setSlugError] = useState('')
  const [apiError, setApiError]   = useState('')

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
    if (!form.slug) setField('slug', sanitizeSlug(name))
  }

  function prev() { setCarIdx(i => Math.max(0, i - 1)) }
  function next() { setCarIdx(i => Math.min(TEMPLATES.length - 1, i + 1)) }

  async function handleSubmit() {
    setLoading(true)
    setApiError('')
    const res = await fetch('/api/signup', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })
    const json = await res.json()
    if (!res.ok || json.error) {
      setApiError(json.error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
      setLoading(false)
      return
    }
    setLoading(false)
    setStep(3)
  }

  useEffect(() => {
    const tParam = searchParams.get('template')
    if (!tParam) return
    const idx = TEMPLATES.findIndex(t => t.id === tParam && t.available)
    if (idx !== -1) {
      setCarIdx(idx)
      setField('templateId', tParam)
    }
  }, [])

  const current = TEMPLATES[carIdx]

  return (
    <main className="min-h-screen bg-krabbie-bg flex flex-col">

      {/* NAV */}
      <nav className="bg-krabbie-dark px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-white text-sm font-mono transition-colors">← กลับ</Link>
        <span className="text-gray-700">|</span>
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

          {/* STEP 1: CAROUSEL TEMPLATE PICKER */}
          {step === 1 && (
            <div>
              <h1 className="font-syne text-2xl font-bold mb-1">เลือก Template ที่ใช่</h1>
              <p className="text-gray-500 text-sm mb-8">เลือก template ที่เหมาะกับธุรกิจของคุณ</p>

              {/* CAROUSEL */}
              <div className="relative flex items-center gap-3 mb-6">

                {/* PREV */}
                <button onClick={prev} disabled={carIdx === 0}
                  className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-krabbie-border bg-white flex items-center justify-center text-xl transition-all hover:border-orange-400 disabled:opacity-20 disabled:cursor-not-allowed">
                  ‹
                </button>

                {/* CARD */}
                <div key={current.id}
                  style={{ background: current.bg, borderColor: form.templateId === current.id ? current.color : 'transparent' }}
                  className={`flex-1 rounded-2xl border-4 p-5 text-center transition-all cursor-pointer select-none ${
                    !current.available ? 'opacity-60' : 'hover:scale-[1.02]'
                  }`}
                  onClick={() => current.available && setField('templateId', current.id)}>

                  {current.available ? (
                    <div className="flex justify-center mb-4">
                      <div style={{
                        width: '150px', height: '300px',
                        border: '6px solid #1a1a2e', borderRadius: '22px',
                        overflow: 'hidden', position: 'relative',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                        background: '#f3f4f6', flexShrink: 0,
                      }}>
                        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '32px', height: '7px', background: '#1a1a2e', borderRadius: '0 0 7px 7px', zIndex: 10 }} />
                        <div style={{ width: '390px', height: '844px', transformOrigin: 'top left', transform: 'scale(0.385)', pointerEvents: 'none' }}>
                          <iframe src={`/demo/${current.id}`} style={{ width: '390px', height: '844px', border: 'none' }} title={`Preview ${current.name}`} loading="lazy" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-7xl mb-5 leading-none">{current.emoji}</div>
                  )}

                  <div className="font-syne font-extrabold text-2xl mb-2" style={{ color: current.available ? current.color : '#9CA3AF' }}>
                    {current.name}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 mb-3">{current.desc}</div>
                  {!current.available && <div className="text-xs text-gray-400 leading-relaxed mb-4">{current.detail}</div>}

                  {!current.available && (
                    <div className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-500 text-xs font-mono font-bold">
                      เร็วๆ นี้
                    </div>
                  )}
                  {current.available && form.templateId === current.id && (
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-bold"
                      style={{ background: current.color }}>
                      ✓ เลือกแล้ว
                    </div>
                  )}
                  {current.available && form.templateId !== current.id && (
                    <div className="inline-block px-4 py-1.5 rounded-full border-2 text-xs font-bold transition-colors"
                      style={{ borderColor: current.color, color: current.color }}>
                      แตะเพื่อเลือก
                    </div>
                  )}

                  {/* PREVIEW BUTTON */}
                  {current.available && (
                    <button
                      onClick={e => { e.stopPropagation(); setPreview(`/demo/${current.id}`) }}
                      className="block w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2">
                      👁 ดูตัวอย่างก่อน
                    </button>
                  )}
                </div>

                {/* NEXT */}
                <button onClick={next} disabled={carIdx === TEMPLATES.length - 1}
                  className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-krabbie-border bg-white flex items-center justify-center text-xl transition-all hover:border-orange-400 disabled:opacity-20 disabled:cursor-not-allowed">
                  ›
                </button>
              </div>

              {/* DOTS */}
              <div className="flex justify-center gap-2 mb-8">
                {TEMPLATES.map((t, i) => (
                  <button key={t.id} onClick={() => setCarIdx(i)}
                    className="transition-all rounded-full"
                    style={{
                      width:   i === carIdx ? '20px' : '8px',
                      height:  '8px',
                      background: i === carIdx ? (current.available ? current.color : '#9CA3AF') : '#E5E7EB',
                    }}/>
                ))}
              </div>

              {/* THUMBNAIL STRIP */}
              <div className="flex gap-2 justify-center mb-8">
                {TEMPLATES.map((t, i) => (
                  <button key={t.id} onClick={() => setCarIdx(i)}
                    style={{ background: t.bg, borderColor: i === carIdx ? t.color : 'transparent' }}
                    className="w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 text-lg transition-all hover:scale-105">
                    <span>{t.emoji}</span>
                    <span className="text-[9px] font-mono text-gray-500 leading-none">{t.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              <button
                disabled={!form.templateId}
                onClick={() => setStep(2)}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed">
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
                🎉 ทดลองใช้ฟรี 14 วัน — ไม่ต้องชำระจนกว่าจะพอใจ
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

              {apiError && (
                <div className="mt-4 text-red-500 text-xs font-mono bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {apiError}
                </div>
              )}
              <div className="flex gap-3 mt-4">
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
                ✓ ทดลองฟรี 14 วัน · ชำระ 150 ฿ ต่อเมื่อพอใจ
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

      {/* TEMPLATE PREVIEW MODAL */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}>
          <div className="flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>

            {/* CLOSE + LABEL */}
            <div className="flex items-center justify-between w-full max-w-sm">
              <span className="text-white text-sm font-semibold opacity-80">ตัวอย่าง template</span>
              <button
                onClick={() => setPreview(null)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg transition-colors">
                ✕
              </button>
            </div>

            {/* PHONE FRAME */}
            <div className="relative" style={{ width: '320px' }}>
              {/* notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-10" />
              {/* frame */}
              <div className="rounded-[42px] overflow-hidden shadow-2xl"
                style={{ border: '8px solid #1a1a2e', background: '#1a1a2e', height: '620px', position: 'relative' }}>
                <iframe
                  src={preview}
                  className="w-full h-full rounded-[36px]"
                  style={{ border: 'none', display: 'block' }}
                  title="Template preview"
                />
              </div>
              {/* home bar */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/40 rounded-full" />
            </div>

            {/* SELECT BUTTON */}
            <button
              onClick={() => {
                const tId = preview.replace('/demo/', '')
                const t   = TEMPLATES.find(t => t.id === tId)
                if (t?.available) { setField('templateId', tId); setPreview(null) }
              }}
              className="px-8 py-3 rounded-full text-white font-bold text-sm shadow-lg transition-all hover:scale-105"
              style={{ background: TEMPLATES.find(t => t.id === preview.replace('/demo/',''))?.color || '#ff6b00' }}>
              ✓ เลือก template นี้
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
