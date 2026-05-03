'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sanitizeSlug, isValidSlug, shopUrl } from '@/lib/utils'
import type { SignupForm } from '@/types'

const TEMPLATES = [
  { id: 'booking-service', name: 'ระบบจองบริการ', emoji: '📅', desc: 'ช่างภาพ · เสริมสวย · สนามกีฬา · สปา · ที่พัก · และอีกมาก', pills: ['เลือกวันเวลา', 'อัพสลิป', 'admin ยืนยัน'], available: true },
  { id: 'booking-rental',  name: 'เว็บเช่าสินค้า', emoji: '📷', desc: 'กล้อง · เสื้อผ้า · ชุดแต่งงาน · อุปกรณ์ · ของตกแต่งงาน', pills: ['ปฏิทิน busy days', 'เช่ารายวัน/ชั่วโมง', 'admin ยืนยัน'], available: true },
  { id: 'shop',            name: 'ร้านขายสินค้า',  emoji: '🛍️', desc: 'เสื้อผ้า · handmade · เบเกอรี่ pre-order · ของมือสอง', pills: ['ตะกร้าสินค้า', 'จัดการสต็อก', 'อัพสลิป'], available: false },
  { id: 'qr-menu',         name: 'QR เมนูอาหาร',   emoji: '🍜', desc: 'สแกน QR ต่อโต๊ะ · สั่งอาหาร · แจ้งครัว real-time', pills: ['QR รายโต๊ะ', 'real-time', 'ใบเสร็จ'], available: false },
]

export default function SignupPage() {
  const [step, setStep]         = useState<1 | 2 | 3>(1)
  const [form, setForm]         = useState<SignupForm>({ templateId: '', shopName: '', slug: '', ownerEmail: '', ownerPhone: '', password: '' })
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading]   = useState(false)
  const [slugError, setSlugError]     = useState('')
  const [passError, setPassError]     = useState('')
  const [apiError, setApiError]       = useState('')

  function setField<K extends keyof SignupForm>(key: K, value: SignupForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSlugChange(raw: string) {
    const clean = sanitizeSlug(raw)
    setField('slug', clean)
    setSlugError(clean && !isValidSlug(clean) ? 'ใช้ตัวอักษรพิมพ์เล็กและตัวเลขเท่านั้น' : '')
  }

  function autoSlug(name: string) {
    if (!form.slug) setField('slug', sanitizeSlug(name))
  }

  function validateStep2() {
    if (!form.ownerEmail) return 'กรุณาใส่อีเมล'
    if (!form.password || form.password.length < 8) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    if (form.password !== confirmPass) return 'รหัสผ่านไม่ตรงกัน'
    return ''
  }

  async function handleSubmit() {
    const err = validateStep2()
    if (err) { setPassError(err); return }
    setPassError('')
    setApiError('')
    setLoading(true)

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) {
        setApiError(json.error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
        setLoading(false)
        return
      }
      setStep(3)
    } catch {
      setApiError('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่')
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

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h1 className="font-syne text-2xl font-bold mb-1">เลือก Template ที่ใช่</h1>
              <p className="text-gray-500 text-sm mb-6">เลือก template ที่เหมาะกับธุรกิจของคุณ</p>
              <div className="space-y-3 mb-6">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    disabled={!t.available}
                    onClick={() => setField('templateId', t.id)}
                    className={`w-full text-left rounded-krabbie border-2 transition-all p-4 ${
                      !t.available ? 'opacity-50 cursor-not-allowed border-krabbie-border bg-gray-50' :
                      form.templateId === t.id ? 'border-orange-500 bg-orange-50 shadow-md' :
                      'border-krabbie-border hover:border-orange-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl w-12 text-center flex-shrink-0">{t.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-base">{t.name}</span>
                          {!t.available && <span className="badge-soon text-[0.6rem]">เร็วๆ นี้</span>}
                          {form.templateId === t.id && <span className="text-xs text-orange-500 font-semibold ml-auto">✓ เลือกแล้ว</span>}
                        </div>
                        <div className="text-xs text-gray-500">{t.desc}</div>
                        {t.pills && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {t.pills.map(p => (
                              <span key={p} className="text-[0.65rem] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{p}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
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

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h1 className="font-syne text-2xl font-bold mb-1">ข้อมูลร้านของคุณ</h1>
              <p className="text-gray-500 text-sm mb-6">กรอกข้อมูลเพื่อสร้างเว็บร้านและบัญชีล็อกอิน</p>

              <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-700 mb-5">
                🎉 ทดลองใช้ฟรี 14 วัน — ไม่ต้องชำระจนกว่าจะพอใจ
              </div>

              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 font-mono">
                  {apiError}
                </div>
              )}

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
                  <label className="block text-sm font-semibold mb-1">Subdomain *</label>
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
                  <label className="block text-sm font-semibold mb-1">อีเมล * <span className="font-normal text-gray-400">(ใช้ล็อกอิน)</span></label>
                  <input
                    className="input"
                    type="email"
                    placeholder="shop@email.com"
                    value={form.ownerEmail}
                    onChange={e => setField('ownerEmail', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">รหัสผ่าน * <span className="font-normal text-gray-400">(อย่างน้อย 8 ตัว)</span></label>
                  <input
                    className="input"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">ยืนยันรหัสผ่าน *</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                  />
                  {passError && <p className="text-red-500 text-xs mt-1">{passError}</p>}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-outline flex-1">← ย้อนกลับ</button>
                <button
                  disabled={!form.shopName || !form.slug || !!slugError || !form.ownerPhone || !form.ownerEmail || loading}
                  onClick={handleSubmit}
                  className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังสร้าง...' : 'สร้างเว็บร้าน →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="text-center">
              <div className="text-6xl mb-4">🦀</div>
              <h1 className="font-syne text-2xl font-bold mb-2">สร้างร้านสำเร็จแล้ว!</h1>
              <p className="text-gray-500 text-sm mb-4">เว็บของคุณพร้อมใช้งานที่</p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 font-mono text-orange-600 text-sm mb-4">
                {form.slug ? shopUrl(form.slug) : 'yourshop.krabbie.com'}
              </div>
              <p className="text-xs text-gray-400 mb-6 font-mono">
                ✓ ทดลองฟรี 14 วัน · ล็อกอินได้ด้วยอีเมล {form.ownerEmail}
              </p>
              <Link
                href="/login"
                className="btn-primary block mb-3"
              >
                เข้าสู่ระบบจัดการร้าน →
              </Link>
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
