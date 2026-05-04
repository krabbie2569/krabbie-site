export const runtime = 'edge'

import Link from 'next/link'

const TEMPLATES = [
  {
    id: 'booking-service',
    name: 'จองบริการ',
    emoji: '📅',
    desc: 'นวด · ฝึกสอน · ช่างภาพ · ซ่อม',
    color: '#ff6b00',
    bg: '#fff8f0',
    demo: '/demo/booking-service',
  },
  {
    id: 'booking-rental',
    name: 'เช่าสินค้า',
    emoji: '📷',
    desc: 'กล้อง · เสื้อผ้า · อุปกรณ์',
    color: '#E91E8C',
    bg: '#fff0f8',
    demo: '/demo/booking-rental',
  },
  {
    id: 'shop-general',
    name: 'ร้านขายสินค้า',
    emoji: '🛍️',
    desc: 'เสื้อผ้า · handmade · สินค้าทั่วไป',
    color: '#1E293B',
    bg: '#f1f5f9',
    demo: '/demo/shop',
  },
  {
    id: 'food-qr-menu',
    name: 'QR เมนูอาหาร',
    emoji: '🍜',
    desc: 'ร้านอาหาร · คาเฟ่ · เครื่องดื่ม',
    color: '#6F4E37',
    bg: '#fff8f0',
    demo: '/demo/qr-menu',
  },
]

export default function AdminTemplatesPage() {
  return (
    <div className="px-8 py-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-syne font-extrabold text-2xl text-krabbie-dark">Templates</h1>
        <p className="font-mono text-xs text-gray-400 mt-0.5">ดูและแกะ template แต่ละแบบ</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-krabbie-border overflow-hidden flex flex-col"
            style={{ background: t.bg }}
          >
            <div className="px-5 pt-7 pb-4 text-center flex-1">
              <div className="text-5xl mb-3 leading-none">{t.emoji}</div>
              <div className="font-syne font-extrabold text-lg mb-1" style={{ color: t.color }}>
                {t.name}
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">{t.desc}</div>
              <div className="font-mono text-[9px] text-gray-300 mt-2 uppercase tracking-wider">{t.id}</div>
            </div>

            <div className="px-4 pb-5">
              <Link
                href={t.demo}
                target="_blank"
                className="block w-full py-2.5 rounded-xl text-center text-sm font-bold text-white transition-all hover:opacity-85 active:scale-95"
                style={{ background: t.color }}
              >
                เปิด Demo →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
