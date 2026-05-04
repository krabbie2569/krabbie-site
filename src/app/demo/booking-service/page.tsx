export const runtime = 'edge'

import Link from 'next/link'
import { formatPrice, formatDuration } from '@/lib/utils'

const SERVICES = [
  { id: '1', name: 'นวดแผนไทย',             description: 'ผ่อนคลายกล้ามเนื้อด้วยศาสตร์ดั้งเดิม บำรุงร่างกาย',   duration_minutes: 60,  price: 350 },
  { id: '2', name: 'ทำเล็บเจล (มือ + เท้า)', description: 'เล็บสวย สีไม่ลอก ทนนาน 3–4 สัปดาห์',                 duration_minutes: 90,  price: 550 },
  { id: '3', name: 'คลีนิกหน้า + บีบสิว',    description: 'ดูแลผิวหน้า ลดสิว ล้างพอร์ บำรุงผิวลึก',             duration_minutes: 75,  price: 490 },
  { id: '4', name: 'สปาตัวทั้งตัว',           description: 'สครับ + มาร์ค + นวดผ่อนคลาย ผิวนุ่มเนียน',            duration_minutes: 120, price: 890 },
  { id: '5', name: 'ทำสีผม (Balayage)',       description: 'ระบายสีธรรมชาติ ดูแพง ไม่ต้องรีทัชบ่อย',              duration_minutes: 150, price: 1200 },
]

const REVIEWS = [
  { name: 'คุณมินตรา ส.', stars: 5, date: '28 เม.ย. 2568', service: 'นวดแผนไทย',
    body: 'ประทับใจมากเลยค่ะ หมอนวดฝีมือดี กดจุดได้ถูกต้อง ร่างกายผ่อนคลายมากหลังนวด จองออนไลน์ง่ายมาก ไม่ต้องโทรหา แนะนำเลยนะคะ' },
  { name: 'คุณปิยะ น.', stars: 5, date: '20 เม.ย. 2568', service: 'สปาตัวทั้งตัว',
    body: 'บริการดีมากครับ สครับผิวแล้วรู้สึกผิวเนียนขึ้นเห็นได้ชัด ทีมงานเป็นมิตร บรรยากาศร้านสะอาด ราคาคุ้มค่ามาก ใช้บริการซ้ำแน่นอน' },
  { name: 'คุณนภา ว.', stars: 4, date: '15 เม.ย. 2568', service: 'ทำเล็บเจล (มือ + เท้า)',
    body: 'เล็บสวยมากค่ะ ช่างทำเล็บฝีมือดี สีไม่ลอกมาสองสัปดาห์แล้ว ระบบจองดีมาก เลือกเวลาได้เองเลย สะดวกมากค่ะ' },
]

const CALENDAR_DAYS = ['อา','จ','อ','พ','พฤ','ศ','ส']
const DEMO_DATES    = [null,null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
const DEMO_SLOTS    = ['10:00','11:00','13:00','14:00','16:00']

export default function DemoBookingService() {
  return (
    <div className="min-h-screen bg-krabbie-bg pb-16">

      {/* Demo banner */}
      <div className="px-4 py-2 flex items-center justify-between sticky top-0 z-50 text-xs font-mono bg-orange-500">
        <Link href="/" className="text-white/70 hover:text-white">← หน้าแรก</Link>
        <span className="text-white font-bold tracking-wider">✦ ตัวอย่าง — ระบบจองบริการ</span>
        <Link href="/dashboard/new?template=booking-service" className="text-white/80 hover:text-white underline">
          ใช้ template →
        </Link>
      </div>

      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-orange-500">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-syne font-extrabold text-white text-base">Sabai Beauty Studio</span>
        </div>
        <Link href="/demo/booking-service/book"
          className="bg-white text-krabbie-dark font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
          จองเลย
        </Link>
      </header>

      {/* Hero */}
      <section className="bg-krabbie-dark text-center py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-3xl mx-auto mb-4">💆</div>
        <h1 className="font-syne text-white text-3xl font-extrabold mb-2">Sabai Beauty Studio</h1>
        <p className="text-gray-400 text-sm mb-4">เลือกบริการและจองคิวออนไลน์ได้เลย</p>
        <div className="flex justify-center gap-2 flex-wrap">
          <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">📍 เชียงใหม่</span>
          <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">⏰ 09:00–18:00</span>
          <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">📞 081-234-5678</span>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-xl mx-auto px-4 py-8">
        <div className="sec-label mb-4">บริการของเรา</div>
        <div className="space-y-3">
          {SERVICES.map(service => (
            <Link
              key={service.id}
              href={`/demo/booking-service/book?service=${service.id}`}
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

      {/* Calendar preview */}
      <section className="max-w-xl mx-auto px-4 pb-8">
        <div className="sec-label mb-4">ตัวอย่างการจองวันเวลา</div>
        <div className="card p-4">
          <div className="text-xs text-gray-400 font-mono text-center mb-3">เลือกวันที่ต้องการ</div>
          <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
            {CALENDAR_DAYS.map(d => (
              <div key={d} className="text-orange-400 font-semibold py-1">{d}</div>
            ))}
            {DEMO_DATES.map((d, i) => (
              <div key={i} className={`py-1.5 rounded-lg font-mono cursor-pointer ${
                d === 7 ? 'bg-orange-500 text-white font-bold' :
                d ? 'hover:bg-orange-50 text-gray-600' : ''
              }`}>{d}</div>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-xs text-gray-400 font-mono mb-2">เลือกเวลา</div>
            <div className="flex gap-2 flex-wrap">
              {DEMO_SLOTS.map(t => (
                <span key={t} className={`px-3 py-1 rounded-lg border text-xs font-mono cursor-pointer transition-colors ${
                  t === '13:00'
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'border-orange-200 text-orange-600 hover:bg-orange-50'
                }`}>{t}</span>
              ))}
            </div>
          </div>
          <Link href="/demo/booking-service/book"
            className="btn-primary w-full text-center block mt-4 text-sm">
            ลองจองจริง →
          </Link>
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-xl mx-auto px-4 pb-8">
        <div className="sec-label mb-4">รีวิวจากลูกค้า</div>
        <div className="space-y-3">
          {REVIEWS.map((r, i) => (
            <div key={i} className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm flex-shrink-0">
                  {r.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="text-[0.65rem] text-gray-400 font-mono">{r.date} · {r.service}</div>
                </div>
                <div className="text-orange-400 text-sm flex-shrink-0">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/demo/booking-service/book"
            className="btn-primary text-sm px-6">
            จองบริการเลย →
          </Link>
        </div>
      </section>

      <div className="text-center font-mono text-xs text-gray-300 mt-4 pb-8">
        Powered by <span className="text-orange-400">🦀 Krabbie.com</span>
      </div>
    </div>
  )
}
