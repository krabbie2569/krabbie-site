'use client'
import { useState } from 'react'
import { useTenant } from '@/hooks/useTenant'
import { useBooking } from '@/hooks/useBooking'
import ServiceSelector from '@/components/booking/ServiceSelector'
import CalendarPicker from '@/components/booking/CalendarPicker'
import TimeSlotGrid from '@/components/booking/TimeSlotGrid'
import BookingForm from '@/components/booking/BookingForm'
import type { BookingDraft } from '@/types'

const DEMO_SLUG = 'sabaidee'
const STEPS = ['เลือกบริการ', 'เลือกวัน-เวลา', 'ข้อมูลของคุณ']

const BLANK: BookingDraft = {
  serviceId: null, staffId: null, date: null, slotId: null,
  customerName: '', customerPhone: '', customerEmail: '', customerNote: '',
}

export default function DemoBookingService() {
  const { tenant, loading: tenantLoading } = useTenant(DEMO_SLUG)
  const [step, setStep]   = useState<1 | 2 | 3 | 4>(1)
  const [draft, setDraft] = useState<BookingDraft>(BLANK)

  const { submitBooking, loading, bookingRef, error } = useBooking(DEMO_SLUG)

  function update(patch: Partial<BookingDraft>) {
    setDraft(prev => ({ ...prev, ...patch }))
  }

  async function handleConfirm() {
    const ref = await submitBooking(draft)
    if (ref) setStep(4)
  }

  function reset() {
    setStep(1)
    setDraft(BLANK)
  }

  return (
    <div className="min-h-screen bg-krabbie-bg pb-16 text-sm">

      {/* DEMO BANNER */}
      <div className="bg-orange-500 text-white text-center py-1.5 text-xs font-bold font-mono tracking-wider">
        ✦ ตัวอย่าง Template — ระบบจองบริการ ✦
      </div>

      {/* SHOP HEADER */}
      <section className="bg-krabbie-dark text-center py-10 px-6">
        <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-2xl mx-auto mb-3">💆</div>
        <h1 className="font-syne text-white text-2xl font-extrabold mb-1">ร้านนวด สบายใจ</h1>
        <p className="text-gray-400 text-xs mb-2">นวดแผนไทย · สปา · ผ่อนคลาย</p>
        <div className="flex justify-center gap-3 mt-3 flex-wrap">
          <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">📍 เชียงใหม่</span>
          <span className="text-xs bg-teal-DEFAULT/20 text-teal-DEFAULT px-3 py-1 rounded-full">⏰ 10:00–21:00</span>
          <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">📞 081-234-5678</span>
        </div>
      </section>

      {/* STEP INDICATOR */}
      {step < 4 && (
        <div className="bg-white border-b border-krabbie-border px-4 py-3">
          <div className="max-w-xl mx-auto flex items-center gap-1">
            {STEPS.map((label, i) => {
              const s = (i + 1) as 1 | 2 | 3
              return (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold font-mono flex-shrink-0 transition-colors ${
                    s < step  ? 'bg-teal-DEFAULT text-white' :
                    s === step ? 'bg-orange-500 text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {s < step ? '✓' : s}
                  </div>
                  <span className={`text-[0.65rem] hidden sm:block transition-colors ${
                    s === step ? 'text-orange-500 font-semibold' : 'text-gray-400'
                  }`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 transition-colors ${s < step ? 'bg-teal-DEFAULT' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto px-4 py-6">

        {/* Loading tenant */}
        {tenantLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-20 bg-gray-100" />)}
          </div>

        ) : !tenant ? (
          <div className="card text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-sm">ไม่พบข้อมูลร้านค้าเดโม กรุณารัน SQL migration ก่อน</p>
          </div>

        ) : step === 1 ? (
          <ServiceSelector
            tenantId={tenant.id}
            selectedId={draft.serviceId}
            onSelect={(id) => { update({ serviceId: id }); setStep(2) }}
          />

        ) : step === 2 ? (
          <div>
            <CalendarPicker
              selected={draft.date}
              onSelect={(date) => update({ date, slotId: null })}
            />
            {draft.date && (
              <TimeSlotGrid
                tenantId={tenant.id}
                serviceId={draft.serviceId!}
                date={draft.date}
                selectedSlotId={draft.slotId}
                onSelect={(slotId) => update({ slotId })}
              />
            )}
            <div className="mt-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 font-mono text-[0.65rem] text-gray-400 leading-relaxed">
              💡 เดโม: ถ้าไม่มีเวลาว่าง ให้รัน SQL migration (002_shop_food.sql) ใน Supabase
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">← ย้อนกลับ</button>
              <button
                disabled={!draft.slotId}
                onClick={() => setStep(3)}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                ถัดไป →
              </button>
            </div>
          </div>

        ) : step === 3 ? (
          <div>
            <BookingForm
              draft={draft}
              onChange={update}
              onBack={() => setStep(2)}
              onSubmit={handleConfirm}
              loading={loading}
            />
            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-xs font-mono">
                ⚠️ {error}
              </div>
            )}
          </div>

        ) : step === 4 && bookingRef ? (
          <div className="card text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="font-syne text-xl font-bold mb-2">จองสำเร็จแล้ว!</h2>
            <p className="text-gray-500 text-sm mb-4">เราจะติดต่อยืนยันไปยังเบอร์โทรของคุณ</p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 font-mono text-orange-600 text-sm mb-6">
              รหัสการจอง: {bookingRef}
            </div>
            <button onClick={reset} className="btn-primary w-full">
              จองบริการอื่น →
            </button>
          </div>

        ) : null}
      </div>

      <div className="text-center font-mono text-xs text-gray-300 mt-2 mb-4">
        Powered by <span className="text-orange-400">🦀 Krabbie.com</span>
      </div>
    </div>
  )
}
