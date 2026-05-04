'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isBefore, startOfDay, getDay,
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

const STAFF = [
  { id: 'p1', name: 'พี่นุ่น',   role: 'ช่างนวดแผนไทย / สปา',     services: ['1','4'],     exp: '5 ปี', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=160&h=160&q=80&fit=crop&auto=format' },
  { id: 'p2', name: 'น้องแพร',   role: 'ช่างเล็บ / ผิวหน้า',       services: ['2','3'],     exp: '3 ปี', rating: 4.8, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&q=80&fit=crop&auto=format' },
  { id: 'p3', name: 'พี่ออย',    role: 'ช่างนวดแผนไทย / สปา',     services: ['1','4'],     exp: '4 ปี', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&q=80&fit=crop&auto=format' },
  { id: 'p4', name: 'พี่หนิง',   role: 'ช่างทำสีผม / Balayage',    services: ['5'],         exp: '6 ปี', rating: 5.0, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&q=80&fit=crop&auto=format' },
  { id: 'p5', name: 'คุณกิ่ง',   role: 'ช่างผิวหน้า / เล็บ',       services: ['2','3'],     exp: '2 ปี', rating: 4.7, avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=160&h=160&q=80&fit=crop&auto=format' },
]

const ALL_SLOTS  = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00']
const DAY_LABELS = ['อา','จ','อ','พ','พฤ','ศ','ส']

function getBookedSlots(dateStr: string): string[] {
  const day = new Date(dateStr).getDate()
  if (day % 4 === 0) return ['09:00','11:00','15:00']
  if (day % 4 === 1) return ['10:00','14:00']
  if (day % 4 === 2) return ['13:00','16:00','09:00']
  return ['11:00','15:00']
}
function isDayFull(ds: string)    { return getBookedSlots(ds).length >= ALL_SLOTS.length - 1 }
function isDayPartial(ds: string) { const b = getBookedSlots(ds).length; return b >= 2 && b < ALL_SLOTS.length - 1 }

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-orange-400 text-xs font-mono">
      {'★'.repeat(Math.floor(rating))}
      {rating % 1 ? '½' : ''}
      {' '}{rating.toFixed(1)}
    </span>
  )
}

function BookContent() {
  const searchParams = useSearchParams()
  const preselected  = searchParams.get('service')

  const [serviceId, setService]  = useState<string|null>(preselected)
  const [staffId,   setStaffId]  = useState<string|null>(null)
  const [viewMonth, setView]     = useState(new Date())
  const [date,      setDate]     = useState<string|null>(null)
  const [slot,      setSlot]     = useState<string|null>(null)
  const [showForm,  setShowForm] = useState(false)
  const [done,      setDone]     = useState(false)
  const [name,      setName]     = useState('')
  const [phone,     setPhone]    = useState('')
  const [email,     setEmail]    = useState('')
  const [note,      setNote]     = useState('')

  const service     = SERVICES.find(s => s.id === serviceId)
  const selectedStaff = STAFF.find(s => s.id === staffId)
  const matchedStaff  = serviceId ? STAFF.filter(s => s.services.includes(serviceId)) : []

  const today      = startOfDay(new Date())
  const monthStart = startOfMonth(viewMonth)
  const monthEnd   = endOfMonth(viewMonth)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad   = getDay(monthStart)
  const bookedSlots = date ? getBookedSlots(date) : []

  function resetStaff() { setStaffId(null); setDate(null); setSlot(null); setShowForm(false) }
  function selectDate(d: Date) {
    setDate(format(d, 'yyyy-MM-dd')); setSlot(null); setShowForm(false)
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
            <div className="font-semibold">{service?.name}</div>
            {selectedStaff && <div>ช่าง: {selectedStaff.name}</div>}
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

      <div className="px-4 py-1.5 text-center text-xs font-mono bg-orange-500 text-white sticky top-0 z-50">
        ✦ ตัวอย่างระบบจอง —{' '}
        <Link href="/dashboard/new?template=booking-service" className="underline text-white/80">เปิดร้านแบบนี้</Link>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4">
        <Link href="/demo/booking-service" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">
          ← กลับหน้าร้าน
        </Link>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-5">

        {/* ── 1. เลือกบริการ ── */}
        {!service ? (
          <div>
            <div className="sec-label mb-4">เลือกบริการ</div>
            <div className="rounded-2xl overflow-hidden border border-krabbie-border">
              {SERVICES.map((s, i) => (
                <button key={s.id} onClick={() => { setService(s.id); setStaffId(null) }}
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
            {/* บริการที่เลือก */}
            <div className="rounded-xl overflow-hidden border border-orange-300 bg-orange-50 flex items-center">
              <img src={service.image} alt={service.name} className="w-20 h-16 object-cover flex-shrink-0" />
              <div className="flex-1 px-3 min-w-0">
                <div className="font-bold text-sm">{service.name}</div>
                <div className="text-xs text-gray-500">⏱ {formatDuration(service.duration_minutes)}</div>
              </div>
              <div className="text-right flex-shrink-0 px-3">
                <div className="font-syne font-bold text-orange-500 text-base">{formatPrice(service.price)}</div>
                <button onClick={() => { setService(null); resetStaff() }}
                  className="text-[0.65rem] text-gray-400 hover:text-red-400 transition-colors">เปลี่ยน</button>
              </div>
            </div>

            {/* ── 2. เลือกช่าง ── */}
            {!staffId ? (
              <div>
                <div className="sec-label mb-3">เลือกช่าง / ผู้ให้บริการ</div>
                <div className="grid grid-cols-2 gap-3">
                  {/* ไม่มีความชอบ */}
                  <button onClick={() => setStaffId('any')}
                    className="card flex flex-col items-center gap-2 py-4 hover:border-orange-300 transition-all group">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl">🎲</div>
                    <div className="font-semibold text-sm group-hover:text-orange-500">ไม่มีความชอบ</div>
                    <div className="text-[0.65rem] text-gray-400 text-center">ระบบจัดช่างให้อัตโนมัติ</div>
                  </button>

                  {matchedStaff.map(s => (
                    <button key={s.id} onClick={() => setStaffId(s.id)}
                      className="card flex flex-col items-center gap-2 py-4 hover:border-orange-300 transition-all group text-center">
                      <img src={s.avatar} alt={s.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-100 group-hover:ring-orange-300 transition-all" />
                      <div>
                        <div className="font-bold text-sm group-hover:text-orange-500 transition-colors">{s.name}</div>
                        <div className="text-[0.65rem] text-gray-400">{s.role}</div>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <StarRating rating={s.rating} />
                          <span className="text-[0.6rem] text-gray-400 font-mono">{s.exp}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* ช่างที่เลือก */}
                <div className="card flex items-center gap-3 bg-orange-50 border-orange-300">
                  {staffId === 'any' ? (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">🎲</div>
                  ) : (
                    <img src={selectedStaff!.avatar} alt={selectedStaff!.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">
                      {staffId === 'any' ? 'ไม่มีความชอบ' : selectedStaff!.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {staffId === 'any' ? 'ระบบจัดช่างให้อัตโนมัติ' : selectedStaff!.role}
                    </div>
                  </div>
                  {staffId !== 'any' && <StarRating rating={selectedStaff!.rating} />}
                  <button onClick={resetStaff} className="text-[0.65rem] text-gray-400 hover:text-red-400 flex-shrink-0">เปลี่ยน</button>
                </div>

                {/* ── 3. ปฏิทิน ── */}
                <div className="card p-4">
                  <div className="sec-label mb-3">เลือกวันที่</div>
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => setView(p => subMonths(p, 1))}
                      className="w-8 h-8 rounded-full hover:bg-orange-50 flex items-center justify-center text-gray-400 hover:text-orange-500">‹</button>
                    <span className="font-syne font-bold text-sm">{format(viewMonth, 'LLLL yyyy', { locale: th })}</span>
                    <button onClick={() => setView(p => addMonths(p, 1))}
                      className="w-8 h-8 rounded-full hover:bg-orange-50 flex items-center justify-center text-gray-400 hover:text-orange-500">›</button>
                  </div>
                  <div className="grid grid-cols-7 mb-1">
                    {DAY_LABELS.map(d => <div key={d} className="text-center font-mono text-[0.6rem] text-gray-400 py-1">{d}</div>)}
                  </div>
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
                          className={`relative h-9 rounded-lg text-xs font-mono transition-all flex flex-col items-center justify-center ${
                            disabled  ? 'text-gray-200 cursor-not-allowed' :
                            selected  ? 'bg-orange-500 text-white font-bold' :
                            isSameDay(day, today) ? 'border-2 border-orange-300 text-orange-500 hover:bg-orange-50' :
                            'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
                          }`}>
                          {format(day, 'd')}
                          {!disabled && !selected && (
                            <span className={`w-1 h-1 rounded-full ${full ? 'bg-red-400' : partial ? 'bg-yellow-400' : 'bg-teal-DEFAULT'}`} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-4 mt-3 text-[0.6rem] text-gray-400 font-mono justify-end">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-DEFAULT inline-block"/>ว่าง</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/>เกือบเต็ม</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>เต็มแล้ว</span>
                  </div>
                </div>

                {/* ── 4. เลือกเวลา ── */}
                {date && (
                  <div>
                    <div className="sec-label mb-3">เลือกเวลา — {format(new Date(date), 'd MMMM yyyy', { locale: th })}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {ALL_SLOTS.map(t => {
                        const booked   = bookedSlots.includes(t)
                        const selected = slot === t
                        return (
                          <button key={t} disabled={booked} onClick={() => { setSlot(t); setShowForm(true) }}
                            className={`relative h-12 rounded-xl text-sm font-mono font-bold border-2 transition-all overflow-hidden ${
                              booked   ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' :
                              selected ? 'bg-orange-500 text-white border-orange-500 shadow-md' :
                              'bg-white border-krabbie-border hover:border-orange-400 hover:text-orange-500'
                            }`}>
                            {t}
                            {booked && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-red-500 border-2 border-red-400 text-[0.55rem] font-black px-1.5 py-0.5 rounded rotate-[-12deg] bg-white/90">จองแล้ว</span>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── 5. กรอกข้อมูล ── */}
                {showForm && slot && (
                  <div>
                    <div className="sec-label mb-4">ข้อมูลของคุณ</div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 mb-4">
                      <div className="font-semibold text-orange-700 text-sm mb-2">สรุปการจอง</div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between"><span>บริการ</span><span className="font-semibold">{service.name}</span></div>
                        <div className="flex justify-between">
                          <span>ช่าง</span>
                          <span className="font-semibold">{staffId === 'any' ? 'ระบบจัดให้' : selectedStaff!.name}</span>
                        </div>
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
                        <textarea className="input resize-none" rows={2} placeholder="แพ้อะไรไหม? ความชอบพิเศษ?" value={note} onChange={e => setNote(e.target.value)} />
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
          </>
        )}
      </div>
    </div>
  )
}

export default function DemoBookPage() {
  return <Suspense><BookContent /></Suspense>
}
