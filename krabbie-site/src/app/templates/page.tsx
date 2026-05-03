'use client'

import { useState } from 'react'
import Link from 'next/link'

const TEMPLATES = [
  {
    id: 'booking-service',
    name: 'จองบริการ',
    emoji: '📅',
    desc: 'นวด · ฝึกสอน · ช่างภาพ · ซ่อม',
    detail: 'รับจองคิวออนไลน์ เลือกบริการ เลือกเวลา ยืนยันอัตโนมัติ',
    useCases: ['ร้านนวด', 'โค้ชส่วนตัว', 'ช่างภาพ', 'ช่างซ่อม'],
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
    useCases: ['ร้านเช่ากล้อง', 'เช่าชุดแต่งงาน', 'เช่าอุปกรณ์', 'เช่าของตกแต่ง'],
    color: '#E91E8C',
    bg: 'linear-gradient(135deg,#fff0f8,#f8e0ff)',
    available: true,
  },
  {
    id: 'shop-general',
    name: 'ร้านขายสินค้า',
    emoji: '🛍️',
    desc: 'เสื้อผ้า · handmade · สินค้าทั่วไป',
    detail: 'แสดงสินค้า ตะกร้า รับออเดอร์ออนไลน์ จัดการสต็อก',
    useCases: ['ร้านค้าออนไลน์', 'สินค้า handmade', 'ของตกแต่งบ้าน', 'ของฝาก'],
    color: '#1E293B',
    bg: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)',
    available: true,
  },
  {
    id: 'food-qr-menu',
    name: 'QR เมนูอาหาร',
    emoji: '🍜',
    desc: 'ร้านอาหาร · คาเฟ่ · เครื่องดื่ม',
    detail: 'QR เมนูดิจิทัล สั่งอาหารได้เลย ไม่ต้องพิมพ์เมนู',
    useCases: ['ร้านอาหาร', 'คาเฟ่', 'ฟู้ดทรัค', 'บาร์เครื่องดื่ม'],
    color: '#6F4E37',
    bg: 'linear-gradient(135deg,#fff8f0,#fde8d0)',
    available: true,
  },
]

export default function TemplatesPage() {
  const [preview, setPreview] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-krabbie-bg">

      {/* NAV */}
      <nav className="bg-krabbie-dark px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl">🦀</Link>
          <Link href="/" className="font-syne text-white text-xl font-extrabold hover:text-orange-400 transition-colors">
            Krabbie<span className="text-orange-500">.com</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#" className="text-orange-500 text-sm font-semibold">Templates</Link>
          <Link href="/#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">ราคา</Link>
          <Link href="/signup" className="btn-primary text-sm">เริ่มใช้งาน ฟรี!</Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-krabbie-dark text-center py-14 px-6">
        <span className="font-mono text-orange-500 text-[0.65rem] tracking-[4px] uppercase block mb-3">
          เลือก Template ที่ใช่
        </span>
        <h1 className="font-syne font-extrabold text-white text-4xl md:text-5xl mb-3">
          Templates <span className="text-orange-500">ทั้งหมด</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          เลือก template แล้วกด "ดูตัวอย่าง" เพื่อดูหน้าตาก่อนสมัคร
        </p>
      </section>

      {/* TEMPLATES GRID */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              style={{ background: t.bg }}
              className={`rounded-2xl border-2 border-transparent overflow-hidden transition-all ${
                t.available ? 'hover:scale-[1.02] hover:shadow-xl' : 'opacity-70'
              }`}
            >
              {/* CARD TOP */}
              <div className="px-8 pt-8 pb-4 text-center">
                <div className="text-6xl mb-4 leading-none">{t.emoji}</div>
                <div
                  className="font-syne font-extrabold text-2xl mb-1"
                  style={{ color: t.available ? t.color : '#9CA3AF' }}
                >
                  {t.name}
                </div>
                <div className="text-sm font-semibold text-gray-600 mb-2">{t.desc}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{t.detail}</div>
              </div>

              {/* USE CASES */}
              <div className="px-8 pb-4 flex flex-wrap gap-1.5 justify-center">
                {t.useCases.map((u) => (
                  <span
                    key={u}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                    style={{
                      background: t.available ? `${t.color}18` : '#F3F4F6',
                      color: t.available ? t.color : '#9CA3AF',
                    }}
                  >
                    {u}
                  </span>
                ))}
              </div>

              {/* ACTIONS */}
              <div className="px-8 pb-8 flex flex-col gap-2">
                {t.available ? (
                  <>
                    <button
                      onClick={() => setPreview(`/demo/${t.id}`)}
                      className="w-full py-2.5 rounded-xl border-2 text-sm font-bold transition-all hover:opacity-80"
                      style={{ borderColor: t.color, color: t.color, background: 'white' }}
                    >
                      👁 ดูตัวอย่าง
                    </button>
                    <Link
                      href={`/signup?template=${t.id}`}
                      className="block w-full py-2.5 rounded-xl text-sm font-bold text-center text-white transition-all hover:opacity-90"
                      style={{ background: t.color }}
                    >
                      ใช้ Template นี้ →
                    </Link>
                  </>
                ) : (
                  <div className="w-full py-2.5 rounded-xl bg-gray-200 text-gray-500 text-sm font-bold text-center font-mono">
                    เร็วๆ นี้
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 py-10 border-t border-krabbie-border">
          <p className="text-gray-500 text-sm mb-4">ยังไม่แน่ใจ? ทดลองฟรี 14 วัน ไม่ต้องบัตรเครดิต</p>
          <Link href="/signup" className="btn-primary">
            🦀 เริ่มทดลองฟรี ไม่ต้องชำระ
          </Link>
        </div>
      </section>

      {/* PREVIEW MODAL */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between w-full max-w-sm">
              <span className="text-white text-sm font-semibold opacity-80">
                ตัวอย่าง — {TEMPLATES.find(t => `/demo/${t.id}` === preview)?.name}
              </span>
              <button
                onClick={() => setPreview(null)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* PHONE FRAME */}
            <div className="relative" style={{ width: '320px' }}>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-10" />
              <div
                className="rounded-[42px] overflow-hidden shadow-2xl"
                style={{ border: '8px solid #1a1a2e', background: '#1a1a2e', height: '620px', position: 'relative' }}
              >
                <iframe
                  src={preview}
                  className="w-full h-full rounded-[36px]"
                  style={{ border: 'none', display: 'block' }}
                  title="Template preview"
                />
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/40 rounded-full" />
            </div>

            {/* USE THIS TEMPLATE */}
            {(() => {
              const tId = preview.replace('/demo/', '')
              const t = TEMPLATES.find(t => t.id === tId)
              return t?.available ? (
                <Link
                  href={`/signup?template=${tId}`}
                  className="px-8 py-3 rounded-full text-white font-bold text-sm shadow-lg transition-all hover:scale-105 hover:opacity-90"
                  style={{ background: t.color }}
                >
                  ✓ ใช้ Template นี้
                </Link>
              ) : null
            })()}
          </div>
        </div>
      )}

    </main>
  )
}
