'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'

const SERVICES = [
  { id: '1', name: 'นวดแผนไทย',          desc: 'ผ่อนคลายกล้ามเนื้อด้วยศาสตร์ดั้งเดิม บำรุงร่างกาย',   duration: 60,  price: 350 },
  { id: '2', name: 'ทำเล็บเจล (มือ+เท้า)', desc: 'เล็บสวย สีไม่ลอก ทนนาน 3-4 สัปดาห์',                duration: 90,  price: 550 },
  { id: '3', name: 'คลีนิกหน้า + บีบสิว', desc: 'ดูแลผิวหน้า ลดสิว ล้างพอร์ บำรุงผิวลึก',             duration: 75,  price: 490 },
  { id: '4', name: 'สปาตัวทั้งตัว',       desc: 'สครับ + มาร์ค + นวดผ่อนคลาย ผิวนุ่มเนียน',            duration: 120, price: 890 },
  { id: '5', name: 'ทำสีผม (Balayage)',   desc: 'ระบายสีธรรมชาติ ดูแพง ไม่ต้องรีทัชบ่อย',              duration: 150, price: 1200 },
]

export default function DemoBookingService() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-krabbie-bg pb-16 text-sm">

      <div className="bg-orange-500 text-white py-2 px-4 text-xs font-bold font-mono flex items-center justify-between">
        <a href="/" style={{ color:'white', textDecoration:'none', opacity:0.85 }}>← หน้าแรก</a>
        <span className="tracking-wider">✦ ตัวอย่าง Template — ระบบจองบริการ</span>
        <a href="/dashboard/new?template=booking-service" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'underline' }}>ใช้ template →</a>
      </div>

      <section className="bg-krabbie-dark text-center py-10 px-6">
        <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-2xl mx-auto mb-3">💆</div>
        <h1 className="font-syne text-white text-2xl font-extrabold mb-1">Sabai Beauty Studio</h1>
        <p className="text-gray-400 text-xs mb-2">นวด · สปา · ทำเล็บ · คลีนิกหน้า</p>
        <div className="flex justify-center gap-3 mt-3 flex-wrap">
          <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">📍 เชียงใหม่</span>
          <span className="text-xs bg-teal-DEFAULT/20 text-teal-DEFAULT px-3 py-1 rounded-full">⏰ 10:00–21:00</span>
          <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">📞 081-234-5678</span>
        </div>
      </section>

      <section className="max-w-xl mx-auto px-4 py-6">
        <div className="sec-label mb-4">บริการของเรา</div>
        <div className="space-y-3 mb-8">
          {SERVICES.map(s => (
            <div key={s.id}
              onClick={() => setSelected(s.id)}
              className={`card flex items-center gap-4 py-4 cursor-pointer transition-all ${selected === s.id ? 'border-orange-400 bg-orange-50' : 'hover:border-orange-300'}`}>
              <div className="flex-1">
                <div className="font-bold text-sm mb-0.5">{s.name}</div>
                <div className="text-xs text-gray-400 mb-1">{s.desc}</div>
                <div className="font-mono text-xs text-gray-400">⏱ {s.duration} นาที</div>
              </div>
              <div className="text-right">
                <div className="font-syne font-bold text-orange-500 text-base">{s.price.toLocaleString()} ฿</div>
                <div className="text-xs text-orange-400 mt-1">{selected === s.id ? '✓ เลือกแล้ว' : 'จองเลย →'}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          disabled={!selected}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed text-base py-3">
          {selected ? `จอง${SERVICES.find(s => s.id === selected)?.name} →` : 'เลือกบริการก่อน'}
        </button>

        <div className="card mt-6 p-4 text-center">
          <div className="text-xs text-gray-400 mb-2 font-mono">เลือกวันและเวลาที่ต้องการ</div>
          <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
            {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => (
              <div key={d} className="text-orange-400 font-semibold py-1">{d}</div>
            ))}
            {[null,null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map((d,i) => (
              <div key={i} className={`py-1.5 rounded-lg font-mono cursor-pointer ${d===7?'bg-orange-500 text-white font-bold':d?'hover:bg-orange-50 text-gray-600':''}`}>{d}</div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {['10:00','11:00','13:00','14:00','16:00'].map(t => (
              <span key={t} className="px-3 py-1 rounded-lg border border-orange-200 text-xs text-orange-600 font-mono hover:bg-orange-50 cursor-pointer">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="text-center font-mono text-xs text-gray-300 mt-2">
        Powered by <span className="text-orange-400">🦀 Krabbie.com</span>
      </div>
    </div>
  )
}
