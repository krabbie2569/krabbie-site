'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format, addDays, startOfDay, getDay } from 'date-fns'
import { th } from 'date-fns/locale'
import { formatPrice, formatDuration } from '@/lib/utils'

const SERVICES = [
  { id: '1', name: 'นวดแผนไทย',             description: 'ผ่อนคลายกล้ามเนื้อ',   duration_minutes: 60,  price: 350 },
  { id: '2', name: 'ทำเล็บเจล (มือ + เท้า)', description: 'เล็บสวย ทนนาน 3–4 สัปดาห์', duration_minutes: 90,  price: 550 },
  { id: '3', name: 'คลีนิกหน้า + บีบสิว',    description: 'ดูแลผิวหน้า ลดสิว',   duration_minutes: 75,  price: 490 },
  { id: '4', name: 'สปาตัวทั้งตัว',           description: 'สครับ + มาร์ค + นวด', duration_minutes: 120, price: 890 },
  { id: '5', name: 'ทำสีผม (Balayage)',       description: 'ระบายสีธรรมชาติ',     duration_minutes: 150, price: 1200 },
]

const SLOT_TIMES = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00']

// Generate next 10 weekdays
function getAvailableDates() {
  const dates: { value: string; label: string }[] = []
  let d = startOfDay(new Date())
  d = addDays(d, 1)
  while (dates.length < 10) {
    if (getDay(d) !== 0) {
      dates.push({ value: format(d, 'yyyy-MM-dd'), label: format(d, 'd MMM', { locale: th }) })
    }
    d = addDays(d, 1)
  }
  return dates
}

const STEP_LABELS = ['เลือกบริการ', 'เลือกวันเวลา', 'ข้อมูลของคุณ', 'ยืนยัน']

function BookContent() {
  const searchParams    = useSearchParams()
  const preselected     = searchParams.get('service')
  const DATES           = getAvailableDates()

  const [step, setStep]         = useState<1|2|3|4>(preselected ? 2 : 1)
  const [serviceId, setService] = useState<string|null>(preselected)
  const [date, setDate]         = useState<string|null>(null)
  const [slot, setSlot]         = useState<string|null>(null)
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [email, setEmail]       = useState('')
  const [note, setNote]         = useState('')

  const service = SERVICES.find(s => s.id === serviceId)

  if (step === 4) {
    return (
      <div className="min-h-screen bg-krabbie-bg flex items-center justify-center p-6">
        <div className="card max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-syne text-xl font-bold mb-2">จองสำเร็จแล้ว! (ตัวอย่าง)</h2>
          <p className="text-gray-500 text-sm mb-2">นี่คือหน้าต่างยืนยันที่ลูกค้าของคุณจะเห็น</p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 font-mono text-orange-600 text-sm mb-4">
            KRB-DEMO-2025
          </div>
          <div className="text-xs text-gray-400 mb-4">
            {service?.name} · {date} · {slot}
          </div>
          <Link href="/demo/booking-service" className="btn-outline w-full block text-center">
            ← กลับหน้าร้าน
          </Link>
          <Link href="/dashboard/new?template=booking-service"
            className="btn-primary w-full block text-center mt-2">
            เปิดร้านแบบนี้เลย →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-krabbie-bg pb-16">

      {/* Demo banner */}
      <div className="px-4 py-1.5 text-center text-xs font-mono bg-orange-500 text-white sticky top-0 z-50">
        ✦ ตัวอย่างระบบจอง —{' '}
        <Link href="/dashboard/new?template=booking-service" className="underline text-white/80 hover:text-white">
          เปิดร้านแบบนี้
        </Link>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b border-krabbie-border px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-1">
          {STEP_LABELS.map((label, i) => {
            const s = (i + 1) as 1|2|3|4
            return (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold font-mono flex-shrink-0 ${
                  s < step ? 'bg-teal-DEFAULT text-white' :
                  s === step ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>{s < step ? '✓' : s}</div>
                <span className={`text-[0.65rem] hidden sm:block ${s === step ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>{label}</span>
                {i < 3 && <div className={`flex-1 h-0.5 mx-1 ${s < step ? 'bg-teal-DEFAULT' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">

        {/* STEP 1 — เลือกบริการ */}
        {step === 1 && (
          <div>
            <div className="sec-label mb-4">เลือกบริการ</div>
            <div className="space-y-3">
              {SERVICES.map(s => (
                <button key={s.id} onClick={() => { setService(s.id); setStep(2) }}
                  className={`w-full card text-left flex items-center gap-4 transition-all ${
                    serviceId === s.id ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-300'
                  }`}>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-0.5">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.description}</div>
                    <div className="font-mono text-xs text-gray-400 mt-0.5">⏱ {formatDuration(s.duration_minutes)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-syne font-bold text-orange-500 text-lg">{formatPrice(s.price)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — เลือกวันเวลา */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <div className="sec-label mb-3">เลือกวันที่</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {DATES.map(d => (
                  <button key={d.value} onClick={() => { setDate(d.value); setSlot(null) }}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-mono font-semibold transition-colors ${
                      date === d.value ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-krabbie-border hover:border-orange-300'
                    }`}>{d.label}</button>
                ))}
              </div>
            </div>

            {date && (
              <div>
                <div className="sec-label mb-3">เลือกเวลา</div>
                <div className="grid grid-cols-3 gap-2">
                  {SLOT_TIMES.map(t => (
                    <button key={t} onClick={() => setSlot(t)}
                      className={`h-10 rounded-lg text-xs font-mono font-bold border-2 transition-all ${
                        slot === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-krabbie-border hover:border-orange-300'
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">← ย้อนกลับ</button>
              <button onClick={() => setStep(3)} disabled={!slot}
                className="btn-primary flex-1 disabled:opacity-40">ถัดไป →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — ข้อมูลลูกค้า */}
        {step === 3 && (
          <div>
            <div className="sec-label mb-4">ข้อมูลของคุณ</div>
            <div className="space-y-4">
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
                <textarea className="input resize-none" rows={2} value={note} onChange={e => setNote(e.target.value)} />
              </div>

              {/* Summary */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm space-y-1">
                <div className="font-semibold text-orange-700 mb-2">สรุปการจอง</div>
                <div className="flex justify-between text-gray-600"><span>บริการ</span><span className="font-semibold">{service?.name}</span></div>
                <div className="flex justify-between text-gray-600"><span>วันที่</span><span className="font-mono">{date}</span></div>
                <div className="flex justify-between text-gray-600"><span>เวลา</span><span className="font-mono">{slot}</span></div>
                <div className="flex justify-between text-gray-600"><span>ราคา</span><span className="font-syne font-bold text-orange-500">{formatPrice(service?.price ?? 0)}</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="btn-outline flex-1">← ย้อนกลับ</button>
              <button onClick={() => setStep(4)} disabled={!name.trim() || !phone.trim()}
                className="btn-primary flex-1 disabled:opacity-40">ยืนยันการจอง →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DemoBookPage() {
  return <Suspense><BookContent /></Suspense>
}
