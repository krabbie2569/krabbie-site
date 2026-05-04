'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isBefore, startOfDay, getDay, addDays
} from 'date-fns'
import { th } from 'date-fns/locale'
import { formatPrice, formatDuration } from '@/lib/utils'

const SERVICES = [
  { id: '1', name: 'นวดแผนไทย',             description: 'ผ่อนคลายกล้ามเนื้อด้วยศาสตร์ดั้งเดิม บำรุงร่างกาย', duration_minutes: 60,  price: 350,  image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=120&h=120&q=80&fit=crop&auto=format' },
  { id: '2', name: 'ทำเล็บเจล (มือ + เท้า)', description: 'เล็บสวย สีไม่ลอก ทนนาน 3–4 สัปดาห์',                duration_minutes: 90,  price: 550,  image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=120&h=120&q=80&fit=crop&auto=format' },
  { id: '3', name: 'คลีนิกหน้า + บีบสิว',    description: 'ดูแลผิวหน้า ลดสิว ล้างพอร์ บำรุงผิวลึก',            duration_minutes: 75,  price: 490,  image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=120&h=120&q=80&fit=crop&auto=format' },
  { id: '4', name: 'สปาตัวทั้งตัว',           description: 'สครับ + มาร์ค + นวดผ่อนคลาย ผิวนุ่มเนียน',           duration_minutes: 120, price: 890,  image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=120&h=120&q=80&fit=crop&auto=format' },
  { id: '5', name: 'ทำสีผม (Balayage)',       description: 'ระบายสีธรรมชาติ ดูแพง ไม่ต้องรีทัชบ่อย',             duration_minutes: 150, price: 1200, image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=120&h=120&q=80&fit=crop&auto=format' },
]

const ALL_SLOTS = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00']
const DAY_LABELS = ['อา','จ','อ','พ','พฤ','ศ','ส']

// Deterministic fake booked slots per date (so the demo looks realistic)
function getBookedSlots(dateStr: string): string[] {
  const day = new Date(dateStr).getDate()
  if (day % 4 === 0) return ['09:00','11:00','15:00']
  if (day % 4 === 1) return ['10:00','14:00']
  if (day % 4 === 2) return ['13:00','16:00','09:00']
  return ['11:00','15:00']
}

// Days where ALL slots are booked (for calendar dot indicator)
function isDayFull(dateStr: string): boolean {
  return getBookedSlots(dateStr).length >= ALL_SLOTS.length - 1
}
function isDayPartial(dateStr: string): boolean {
  const b = getBookedSlots(dateStr).length
  return b >= 2 && b < ALL_SLOTS.length - 1
}

function BookContent() {
  const searchParams = useSearchParams()
  const preselected  = searchParams.get('service')

  const [serviceId, setService] = useState<string|null>(preselected)
  const [viewMonth, setView]    = useState(new Date())
  const [date, setDate]         = useState<string|null>(null)
  const [slot, setSlot]         = useState<string|null>(null)
  const [showForm, setShowForm] = useState(false)
  const [done, setDone]         = useState(false)
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [email, setEmail]       = useState('')
  const [note, setNote]         = useState('')

  const service    = SERVICES.find(s => s.id === serviceId)
  const today      = startOfDay(new Date())
  const monthStart = startOfMonth(viewMonth)
  const monthEnd   = endOfMonth(viewMonth)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad   = getDay(monthStart)
  const bookedSlots = date ? getBookedSlots(date) : []

  function selectDate(d: Date) {
    const ds = format(d, 'yyyy-MM-dd')
    setDate(ds); setSlot(null); setShowForm(false)
  }

  function selectSlot(t: string) {
    setSlot(t); setShowForm(true)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-krabbie-bg flex items-center justify-center p-6">
        <div className="card max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-syne text-xl font-bold mb-2">จองสำเร็จแล้ว!</h2>
          <p className="text-gray-500 text-sm mb-1">นี่คือหน้ายืนยันที่ลูกค้าของคุณจะเห็น</p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 font-mono text-orange-600 text-sm my-4">
            KRB-DEMO-2025
          </div>
          <div className="text-xs text-gray-500 space-y-0.5 mb-6">
            <div>{service?.name}</div>
            <div className="font-mono">{date} · {slot}</div>
            <div>{name} · {phone}</div>
          </div>
          <Link href="/demo/booking-service" className="btn-outline w-full block text-center mb-2">← กลับหน้าร้าน</Link>
          <Link href="/dashboard/new?template=booking-service" className="btn-primary w-full block text-center">เปิดร้านแบบนี้ →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-krabbie-bg pb-16">

      {/* Demo banner */}
      <div className="px-4 py-1.5 text-center text-xs font-mono bg-orange-500 text-white sticky top-0 z-50">
        ✦ ตัวอย่างระบบจอง —{' '}
        <Link href="/dashboard/new?template=booking-service" className="underline text-white/80">เปิดร้านแบบนี้</Link>
      </div>

      {/* Back link */}
      <div className="max-w-xl mx-auto px-4 pt-4">
        <Link href="/demo/booking-service" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">
          ← กลับหน้าร้าน
        </Link>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-5">

        {/* ── เลือกบริการ ── */}
        {!service ? (
          <div>
            <div className="sec-label mb-4">เลือกบริการ</div>
            <div className="rounded-2xl overflow-hidden border border-krabbie-border">
              {SERVICES.map((s, i) => (
                <button key={s.id} onClick={() => setService(s.id)}
                  className={`w-full flex items-center gap-0 hover:bg-orange-50 transition-all group text-left ${i < SERVICES.length - 1 ? 'border-b border-krabbie-border' : ''}`}>
                  <img src={s.image} alt={s.name} className="w-20 h-16 object-cover flex-shrink-0" />
                  <div className="flex-1 px-3 py-2 min-w-0">
                    <div className="font-semibold text-sm group-hover:text-orange-500 transition-colors">{s.name}</div>
                    <div className="text-xs text-gray-400 leading-snug">{s.description}</div>
                    <div className="font-mono text-xs text-gray-400 mt-0.5">⏱ {formatDuration(s.duration_minutes)}</div>
                  </div>
                  <div className="font-syne font-bold text-orange-500 text-base flex-shrink-0 pr-4">{formatPrice(s.price)}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ── บริการที่เลือก ── */}
            <div className="rounded-xl overflow-hidden border border-orange-300 bg-orange-50 flex items-center">
              <img src={service.image} alt={service.name} className="w-20 h-16 object-cover flex-shrink-0" />
              <div className="flex-1 px-3 min-w-0">
                <div className="font-bold text-sm">{service.name}</div>
                <div className="text-xs text-gray-500">⏱ {formatDuration(service.duration_minutes)}</div>
              </div>
              <div className="text-right flex-shrink-0 px-3">
                <div className="font-syne font-bold text-orange-500 text-base">{formatPrice(service.price)}</div>
                <button onClick={() => { setService(null); setDate(null); setSlot(null); setShowForm(false) }}
                  className="text-[0.65rem] text-gray-400 hover:text-red-400 transition-colors">เปลี่ยน</button>
              </div>
            </div>

            {/* ── ปฏิทิน ── */}
            <div className="card p-4">
              <div className="sec-label mb-3">เลือกวันที่</div>

              {/* Month nav */}
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setView(prev => subMonths(prev, 1))}
                  className="w-8 h-8 rounded-full hover:bg-orange-50 flex items-center justify-center text-gray-400 hover:text-orange-500">‹</button>
                <span className="font-syne font-bold text-sm">
                  {format(viewMonth, 'LLLL yyyy', { locale: th })}
                </span>
                <button onClick={() => setView(prev => addMonths(prev, 1))}
                  className="w-8 h-8 rounded-full hover:bg-orange-50 flex items-center justify-center text-gray-400 hover:text-orange-500">›</button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map(d => (
                  <div key={d} className="text-center font-mono text-[0.6rem] text-gray-400 py-1">{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: startPad }).map((_, i) => <div key={`p${i}`} />)}
                {days.map(day => {
                  const ds       = format(day, 'yyyy-MM-dd')
                  const past     = isBefore(day, today)
                  const isSun    = getDay(day) === 0
                  const disabled = past || isSun
                  const selected = date === ds
                  const full     = !disabled && isDayFull(ds)
                  const partial  = !disabled && !full && isDayPartial(ds)

                  return (
                    <button key={ds} disabled={disabled} onClick={() => selectDate(day)}
                      className={`relative h-9 rounded-lg text-xs font-mono transition-all flex flex-col items-center justify-center gap-0 ${
                        disabled  ? 'text-gray-200 cursor-not-allowed' :
                        selected  ? 'bg-orange-500 text-white font-bold' :
                        isSameDay(day, today) ? 'border-2 border-orange-300 text-orange-500 hover:bg-orange-50' :
                        'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
                      }`}
                    >
                      {format(day, 'd')}
                      {/* Availability dot */}
                      {!disabled && !selected && (
                        <span className={`w-1 h-1 rounded-full ${
                          full ? 'bg-red-400' : partial ? 'bg-yellow-400' : 'bg-teal-DEFAULT'
                        }`} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-3 text-[0.6rem] text-gray-400 font-mono justify-end">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-DEFAULT inline-block"/>ว่าง</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/>เกือบเต็ม</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>เต็มแล้ว</span>
              </div>
            </div>

            {/* ── เลือกเวลา ── */}
            {date && (
              <div>
                <div className="sec-label mb-3">เลือกเวลา — {format(new Date(date), 'd MMMM yyyy', { locale: th })}</div>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_SLOTS.map(t => {
                    const booked   = bookedSlots.includes(t)
                    const selected = slot === t
                    return (
                      <button key={t} disabled={booked} onClick={() => selectSlot(t)}
                        className={`relative h-12 rounded-xl text-sm font-mono font-bold border-2 transition-all overflow-hidden ${
                          booked   ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' :
                          selected ? 'bg-orange-500 text-white border-orange-500 shadow-md' :
                          'bg-white border-krabbie-border hover:border-orange-400 hover:text-orange-500'
                        }`}
                      >
                        {t}
                        {/* Stamp overlay for booked */}
                        {booked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-red-500 border-2 border-red-400 text-[0.55rem] font-black px-1.5 py-0.5 rounded rotate-[-12deg] bg-white/90">
                              จองแล้ว
                            </span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── กรอกข้อมูล (โชว์เมื่อเลือกเวลาแล้ว) ── */}
            {showForm && slot && (
              <div>
                <div className="sec-label mb-4">ข้อมูลของคุณ</div>

                {/* Selected summary */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 mb-4 text-sm">
                  <div className="font-semibold text-orange-700 mb-1">สรุปการจอง</div>
                  <div className="space-y-0.5 text-gray-600 text-xs">
                    <div className="flex justify-between"><span>บริการ</span><span className="font-semibold">{service.name}</span></div>
                    <div className="flex justify-between"><span>วันที่</span><span className="font-mono">{format(new Date(date!), 'd MMMM yyyy', { locale: th })}</span></div>
                    <div className="flex justify-between"><span>เวลา</span><span className="font-mono font-bold text-orange-600">{slot}</span></div>
                    <div className="flex justify-between"><span>ราคา</span><span className="font-syne font-bold text-orange-500">{formatPrice(service.price)}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">ชื่อ-นามสกุล *</label>
                    <input className="input" placeholder="ชื่อ นามสกุล" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">เบอร์โทร *</label>
                    <input className="input" type="tel" placeholder="0812345678" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">อีเมล <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
                    <input className="input" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">หมายเหตุ <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
                    <textarea className="input resize-none" rows={2} placeholder="แพ้อะไรไหม? มีข้อความพิเศษ?" value={note} onChange={e => setNote(e.target.value)} />
                  </div>
                </div>

                <button onClick={() => setDone(true)} disabled={!name.trim() || !phone.trim()}
                  className="btn-primary w-full mt-5 py-3 disabled:opacity-40 text-base">
                  ยืนยันการจอง →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function DemoBookPage() {
  return <Suspense><BookContent /></Suspense>
}
