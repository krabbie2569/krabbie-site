export const runtime = 'edge'

import Link from 'next/link'
import { formatPrice, formatDuration } from '@/lib/utils'

const SERVICES = [
  {
    id: '1', name: 'นวดแผนไทย', description: 'ผ่อนคลายกล้ามเนื้อด้วยศาสตร์ดั้งเดิม บำรุงร่างกาย',
    duration_minutes: 60, price: 350,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&q=80&fit=crop&auto=format',
    emoji: '💆',
  },
  {
    id: '2', name: 'ทำเล็บเจล (มือ + เท้า)', description: 'เล็บสวย สีไม่ลอก ทนนาน 3–4 สัปดาห์',
    duration_minutes: 90, price: 550,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&q=80&fit=crop&auto=format',
    emoji: '💅',
  },
  {
    id: '3', name: 'คลีนิกหน้า + บีบสิว', description: 'ดูแลผิวหน้า ลดสิว ล้างพอร์ บำรุงผิวลึก',
    duration_minutes: 75, price: 490,
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=400&q=80&fit=crop&auto=format',
    emoji: '✨',
  },
  {
    id: '4', name: 'สปาตัวทั้งตัว', description: 'สครับ + มาร์ค + นวดผ่อนคลาย ผิวนุ่มเนียน',
    duration_minutes: 120, price: 890,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&q=80&fit=crop&auto=format',
    emoji: '🌿',
  },
  {
    id: '5', name: 'ทำสีผม (Balayage)', description: 'ระบายสีธรรมชาติ ดูแพง ไม่ต้องรีทัชบ่อย',
    duration_minutes: 150, price: 1200,
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=400&q=80&fit=crop&auto=format',
    emoji: '💇',
  },
]

const GALLERY = [
  { label: 'นวดแผนไทย',   img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500&h=500&q=80&fit=crop&auto=format' },
  { label: 'ทำเล็บ',      img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=500&q=80&fit=crop&auto=format' },
  { label: 'ดูแลผิวหน้า', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&h=500&q=80&fit=crop&auto=format' },
  { label: 'สปา',         img: 'https://images.unsplash.com/photo-1498408040764-ab6eb772a145?w=500&h=500&q=80&fit=crop&auto=format' },
  { label: 'ทำสีผม',      img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&h=500&q=80&fit=crop&auto=format' },
  { label: 'บรรยากาศร้าน',img: 'https://images.unsplash.com/photo-1470259078422-826894b933aa?w=500&h=500&q=80&fit=crop&auto=format' },
]

const REVIEWS = [
  {
    name: 'คุณมินตรา ส.', stars: 5, date: '28 เม.ย. 2568', service: 'นวดแผนไทย',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&q=80&fit=crop&auto=format',
    body: 'ประทับใจมากเลยค่ะ หมอนวดฝีมือดี กดจุดได้ถูกต้อง ร่างกายผ่อนคลายมากหลังนวด จองออนไลน์ง่ายมาก ไม่ต้องโทรหา แนะนำเลยนะคะ',
  },
  {
    name: 'คุณปิยะ น.', stars: 5, date: '20 เม.ย. 2568', service: 'สปาตัวทั้งตัว',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&q=80&fit=crop&auto=format',
    body: 'บริการดีมากครับ สครับผิวแล้วรู้สึกผิวเนียนขึ้นเห็นได้ชัด ทีมงานเป็นมิตร บรรยากาศร้านสะอาด ราคาคุ้มค่ามาก ใช้บริการซ้ำแน่นอน',
  },
  {
    name: 'คุณนภา ว.', stars: 4, date: '15 เม.ย. 2568', service: 'ทำเล็บเจล (มือ + เท้า)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&q=80&fit=crop&auto=format',
    body: 'เล็บสวยมากค่ะ ช่างทำเล็บฝีมือดี สีไม่ลอกมาสองสัปดาห์แล้ว ระบบจองดีมาก เลือกเวลาได้เองเลย สะดวกมากค่ะ',
  },
]

const FAQS = [
  { q: 'ต้องจ่ายเงินล่วงหน้าไหม?',      a: 'ไม่ต้องชำระล่วงหน้าค่ะ ชำระที่ร้านได้เลยในวันนัด' },
  { q: 'ยกเลิกหรือเลื่อนนัดได้ไหม?',   a: 'ได้ค่ะ กรุณาแจ้งล่วงหน้าอย่างน้อย 2 ชั่วโมงก่อนเวลานัด ผ่านไลน์หรือโทรศัพท์' },
  { q: 'รับลูกค้า walk-in ด้วยไหม?',   a: 'รับค่ะ แต่ขึ้นอยู่กับความพร้อม แนะนำให้จองล่วงหน้าเพื่อความแน่นอน' },
  { q: 'มีที่จอดรถไหม?',               a: 'มีที่จอดรถฟรีหน้าร้าน รองรับได้ประมาณ 5–6 คัน' },
  { q: 'เหมาะสำหรับเด็กไหม?',          a: 'บางบริการเหมาะสำหรับผู้ใหญ่เท่านั้น กรุณาสอบถามก่อนจองสำหรับเด็กอายุต่ำกว่า 15 ปี' },
]

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
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1470259078422-826894b933aa?w=1200&h=500&q=80&fit=crop&auto=format"
          alt="Sabai Beauty Studio"
          className="w-full h-52 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-krabbie-dark/90" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-4">
          <div className="w-16 h-16 rounded-full bg-orange-500 border-4 border-white flex items-center justify-center text-3xl mb-3">💆</div>
          <h1 className="font-syne text-white text-3xl font-extrabold mb-1">Sabai Beauty Studio</h1>
          <p className="text-white/80 text-sm mb-3">ความสวยงามและการผ่อนคลาย ครบจบในที่เดียว</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <span className="text-xs bg-orange-500/80 text-white px-3 py-1 rounded-full">📍 เชียงใหม่</span>
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">⏰ 09:00–18:00</span>
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">📞 081-234-5678</span>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="bg-krabbie-dark border-b border-white/10">
        <div className="max-w-xl mx-auto px-4 py-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-syne font-bold text-orange-400 text-xl">500+</div>
            <div className="text-gray-400 text-xs">ลูกค้าประจำ</div>
          </div>
          <div>
            <div className="font-syne font-bold text-orange-400 text-xl">5 ★</div>
            <div className="text-gray-400 text-xs">คะแนนเฉลี่ย</div>
          </div>
          <div>
            <div className="font-syne font-bold text-orange-400 text-xl">3 ปี</div>
            <div className="text-gray-400 text-xs">ประสบการณ์</div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-xl mx-auto px-4 py-8">
        <div className="sec-label mb-4">บริการของเรา</div>
        <div className="space-y-0 rounded-2xl overflow-hidden border border-krabbie-border">
          {SERVICES.map((service, i) => (
            <Link
              key={service.id}
              href={`/demo/booking-service/book?service=${service.id}`}
              className={`flex items-center gap-0 hover:bg-orange-50 transition-colors group ${
                i < SERVICES.length - 1 ? 'border-b border-krabbie-border' : ''
              }`}
            >
              <img
                src={service.image}
                alt={service.name}
                className="w-24 h-20 object-cover flex-shrink-0"
              />
              <div className="flex-1 px-4 py-3 min-w-0">
                <div className="font-bold text-sm mb-0.5 group-hover:text-orange-500 transition-colors">{service.name}</div>
                <div className="text-xs text-gray-400 mb-1 leading-relaxed">{service.description}</div>
                <div className="font-mono text-xs text-gray-400">⏱ {formatDuration(service.duration_minutes)}</div>
              </div>
              <div className="text-right flex-shrink-0 pr-4">
                <div className="font-syne font-bold text-orange-500 text-base">{formatPrice(service.price)}</div>
                <div className="text-xs text-gray-400 mt-0.5 group-hover:text-orange-400 transition-colors">จองเลย →</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/demo/booking-service/book" className="btn-primary text-sm px-8">
            จองคิวออนไลน์ →
          </Link>
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-xl mx-auto px-4 pb-8">
        <div className="sec-label mb-4">ผลงานของเรา</div>
        <div className="grid grid-cols-3 gap-1.5">
          {GALLERY.map((g, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={g.img} alt={g.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end">
                <span className="text-white text-xs font-semibold px-2 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">{g.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Calendar / Booking CTA */}
      <section className="max-w-xl mx-auto px-4 pb-8">
        <div className="sec-label mb-4">จองคิวออนไลน์ได้เลย</div>
        <div className="card p-5 bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">📅</div>
            <div>
              <div className="font-syne font-bold text-lg">เลือกวันเวลาที่สะดวก</div>
              <div className="text-sm text-gray-500">จองผ่านออนไลน์ได้ตลอด 24 ชั่วโมง ยืนยันทันที</div>
            </div>
          </div>
          <div className="flex gap-3 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1.5"><span className="text-teal-DEFAULT">✓</span> ไม่ต้องโทรจอง</div>
            <div className="flex items-center gap-1.5"><span className="text-teal-DEFAULT">✓</span> เลือกเวลาเองได้</div>
            <div className="flex items-center gap-1.5"><span className="text-teal-DEFAULT">✓</span> ยกเลิกฟรี</div>
          </div>
          <Link href="/demo/booking-service/book"
            className="btn-primary w-full text-center block text-sm py-3">
            เลือกวันและเวลา →
          </Link>
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-xl mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="sec-label">รีวิวจากลูกค้า</div>
          <div className="text-xs text-gray-400 font-mono">⭐ 4.9 / 5 (124 รีวิว)</div>
        </div>
        <div className="space-y-3">
          {REVIEWS.map((r, i) => (
            <div key={i} className="card">
              <div className="flex items-center gap-3 mb-2">
                <img src={r.avatar} alt={r.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="text-[0.65rem] text-gray-400 font-mono">{r.date} · {r.service}</div>
                </div>
                <div className="text-orange-400 text-sm flex-shrink-0 font-bold">
                  {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-xl mx-auto px-4 pb-8">
        <div className="sec-label mb-4">คำถามที่พบบ่อย</div>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <details key={i} className="card group cursor-pointer select-none">
              <summary className="font-semibold text-sm flex items-center justify-between gap-2 list-none">
                <span>{f.q}</span>
                <span className="text-gray-400 group-open:text-orange-500 transition-colors text-xs flex-shrink-0">▾</span>
              </summary>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="max-w-xl mx-auto px-4 pb-8">
        <div className="sec-label mb-4">ที่ตั้งร้าน</div>
        <div className="card p-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&h=320&q=80&fit=crop&auto=format"
            alt="แผนที่"
            className="w-full h-36 object-cover"
          />
          <div className="p-4 flex items-start gap-3">
            <div className="text-2xl flex-shrink-0 mt-0.5">📍</div>
            <div className="flex-1">
              <div className="font-bold text-sm mb-0.5">Sabai Beauty Studio</div>
              <div className="text-sm text-gray-500">123/45 ถ.นิมมานเหมินทร์ ซ.11 ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200</div>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-gray-400">⏰ จ–ส 09:00–18:00</span>
                <span className="text-gray-400">📞 081-234-5678</span>
              </div>
              <div className="flex gap-2 mt-3">
                <a href="#" className="text-xs bg-green-50 text-green-600 border border-green-200 px-3 py-1 rounded-lg font-semibold">
                  LINE @sabaibeauty
                </a>
                <a href="#" className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-lg font-semibold">
                  Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center font-mono text-xs text-gray-300 mt-4 pb-8">
        Powered by <span className="text-orange-400">🦀 Krabbie.com</span>
      </div>
    </div>
  )
}
