'use client'

import { use, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useBooking } from '@/hooks/useBooking'
import ServiceSelector from '@/components/booking/ServiceSelector'
import CalendarPicker from '@/components/booking/CalendarPicker'
import TimeSlotGrid from '@/components/booking/TimeSlotGrid'
import BookingForm from '@/components/booking/BookingForm'
import type { BookingDraft } from '@/types'

interface Props {
  params: Promise<{ tenant: string }>
}

const STEP_LABELS = ['เลือกบริการ', 'เลือกวันเวลา', 'ข้อมูลของคุณ', 'ยืนยัน']

export default function BookPage({ params }: Props) {
  const { tenant } = use(params)
  const searchParams = useSearchParams()
  const preselectedService = searchParams.get('service')

  const [step, setStep] = useState<1 | 2 | 3 | 4>(preselectedService ? 2 : 1)
  const [draft, setDraft] = useState<BookingDraft>({
    serviceId:     preselectedService,
    staffId:       null,
    date:          null,
    slotId:        null,
    customerName:  '',
    customerPhone: '',
    customerEmail: '',
    customerNote:  '',
  })

  const { submitBooking, loading, bookingRef, error: bookingError } = useBooking(tenant)

  function updateDraft(patch: Partial<BookingDraft>) {
    setDraft(prev => ({ ...prev, ...patch }))
  }

  async function handleConfirm() {
    const ref = await submitBooking(draft)
    if (ref) setStep(4)
  }

  if (step === 4 && bookingRef) {
    return (
      <div className="min-h-screen bg-krabbie-bg flex items-center justify-center p-6">
        <div className="card max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-syne text-xl font-bold mb-2">จองสำเร็จแล้ว!</h2>
          <p className="text-gray-500 text-sm mb-4">เราจะส่งการยืนยันไปยังเบอร์โทรของคุณ</p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 font-mono text-orange-600 text-sm mb-4">
            {bookingRef}
          </div>
          <button
            onClick={() => window.location.href = `/${tenant}`}
            className="btn-outline w-full"
          >
            กลับหน้าร้าน
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-krabbie-bg pb-16">

      {/* STEP INDICATOR */}
      <div className="bg-white border-b border-krabbie-border px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-1">
          {STEP_LABELS.map((label, i) => {
            const s = (i + 1) as 1 | 2 | 3 | 4
            return (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold font-mono flex-shrink-0 transition-colors ${
                  s < step  ? 'bg-teal-DEFAULT text-white' :
                  s === step ? 'bg-orange-500 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                <span className={`text-[0.65rem] hidden sm:block transition-colors ${s === step ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 transition-colors ${s < step ? 'bg-teal-DEFAULT' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">

        {step === 1 && (
          <ServiceSelector
            tenantId={tenant}
            selectedId={draft.serviceId}
            onSelect={(id) => { updateDraft({ serviceId: id }); setStep(2) }}
          />
        )}

        {step === 2 && (
          <div>
            <CalendarPicker
              selected={draft.date}
              onSelect={(date) => updateDraft({ date, slotId: null })}
            />
            {draft.date && (
              <TimeSlotGrid
                tenantId={tenant}
                serviceId={draft.serviceId!}
                date={draft.date}
                selectedSlotId={draft.slotId}
                onSelect={(slotId) => updateDraft({ slotId })}
              />
            )}
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
        )}

        {step === 3 && (
          <>
            {bookingError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {bookingError}
              </div>
            )}
            <BookingForm
              draft={draft}
              onChange={updateDraft}
              onBack={() => setStep(2)}
              onSubmit={handleConfirm}
              loading={loading}
            />
          </>
        )}

      </div>
    </div>
  )
}
