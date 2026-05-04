export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { formatPrice, formatDuration } from '@/lib/utils'

const TENANT = {
  slug:        'demo',
  name:        'Sabai Beauty Studio',
  owner_phone: '081-234-5678',
}
const SETTINGS = {
  primaryColor: '#ff6b00',
  logoUrl:      null as string | null,
}
const SERVICES = [
  { id: '1', name: 'นวดแผนไทย',             description: 'ผ่อนคลายกล้ามเนื้อด้วยศาสตร์ดั้งเดิม บำรุงร่างกาย',   duration_minutes: 60,  price: 350 },
  { id: '2', name: 'ทำเล็บเจล (มือ + เท้า)', description: 'เล็บสวย สีไม่ลอก ทนนาน 3–4 สัปดาห์',                 duration_minutes: 90,  price: 550 },
  { id: '3', name: 'คลีนิกหน้า + บีบสิว',    description: 'ดูแลผิวหน้า ลดสิว ล้างพอร์ บำรุงผิวลึก',             duration_minutes: 75,  price: 490 },
  { id: '4', name: 'สปาตัวทั้งตัว',           description: 'สครับ + มาร์ค + นวดผ่อนคลาย ผิวนุ่มเนียน',            duration_minutes: 120, price: 890 },
  { id: '5', name: 'ทำสีผม (Balayage)',       description: 'ระบายสีธรรมชาติ ดูแพง ไม่ต้องรีทัชบ่อย',              duration_minutes: 150, price: 1200 },
]

export default function DemoBookingService() {
  return (
    <div className="min-h-screen bg-krabbie-bg pb-16">

      {/* Demo notice — same position as TenantHeader */}
      <div className="px-4 py-2 flex items-center justify-between sticky top-0 z-40 text-xs font-mono"
        style={{ backgroundColor: SETTINGS.primaryColor }}>
        <Link href="/" className="text-white/70 hover:text-white transition-colors">← หน้าแรก</Link>
        <span className="text-white font-bold tracking-wider">✦ ตัวอย่าง — ระบบจองบริการ</span>
        <Link href="/dashboard/new?template=booking-service" className="text-white/80 hover:text-white underline">
          ใช้ template →
        </Link>
      </div>

      {/* Header — เหมือน TenantHeader */}
      <header className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: SETTINGS.primaryColor }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <span className="font-syne font-extrabold text-white text-base">{TENANT.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-xs">Admin</span>
          <Link href="/dashboard/new?template=booking-service"
            className="bg-white text-krabbie-dark font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
            จองเลย
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-krabbie-dark text-center py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-3xl mx-auto mb-4">
          💆
        </div>
        <h1 className="font-syne text-white text-3xl font-extrabold mb-2">{TENANT.name}</h1>
        <p className="text-gray-400 text-sm mb-4">เลือกบริการและจองคิวออนไลน์ได้เลย</p>
        <div className="flex justify-center gap-2 flex-wrap">
          <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">📍 เชียงใหม่</span>
          <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">⏰ 09:00–18:00</span>
          <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">📞 {TENANT.owner_phone}</span>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-xl mx-auto px-4 py-8">
        <div className="sec-label mb-4">บริการของเรา</div>
        <div className="space-y-3">
          {SERVICES.map(service => (
            <Link
              key={service.id}
              href="/dashboard/new?template=booking-service"
              className="card flex items-center gap-4 hover:border-orange-300 transition-colors group"
            >
              <div className="flex-1">
                <div className="font-bold text-sm mb-0.5 group-hover:text-orange-500 transition-colors">{service.name}</div>
                <div className="text-xs text-gray-400 mb-1">{service.description}</div>
                <div className="font-mono text-xs text-gray-400">⏱ {formatDuration(service.duration_minutes)}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-syne font-bold text-orange-500 text-lg">{formatPrice(service.price)}</div>
                <div className="text-xs text-gray-400 mt-0.5 group-hover:text-orange-400 transition-colors">จองเลย →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="text-center font-mono text-xs text-gray-300 mt-4">
        Powered by <span className="text-orange-400">🦀 Krabbie.com</span>
      </div>
    </div>
  )
}
