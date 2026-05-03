'use client'

import type { BookingDraft } from '@/types'

interface Props {
  draft:    BookingDraft
  onChange: (patch: Partial<BookingDraft>) => void
  onBack:   () => void
  onSubmit: () => void
  loading:  boolean
}

export default function BookingForm({ draft, onChange, onBack, onSubmit, loading }: Props) {
  const canSubmit = draft.customerName.trim() && draft.customerPhone.trim()

  return (
    <div>
      <div className="sec-label mb-4">ข้อมูลของคุณ</div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">ชื่อ-นามสกุล *</label>
          <input
            className="input"
            placeholder="ชื่อ นามสกุล"
            value={draft.customerName}
            onChange={e => onChange({ customerName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">เบอร์โทรศัพท์ *</label>
          <input
            className="input"
            type="tel"
            placeholder="0812345678"
            value={draft.customerPhone}
            onChange={e => onChange({ customerPhone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">อีเมล <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
          <input
            className="input"
            type="email"
            placeholder="email@example.com"
            value={draft.customerEmail}
            onChange={e => onChange({ customerEmail: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">หมายเหตุ <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="แพ้อะไรไหม? มีข้อความพิเศษ?"
            value={draft.customerNote}
            onChange={e => onChange({ customerNote: e.target.value })}
          />
        </div>
      </div>

      {/* SUMMARY BOX */}
      {draft.slotId && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4 text-sm space-y-1">
          <div className="font-semibold text-orange-700 mb-2">สรุปการจอง</div>
          {draft.date && <div className="text-gray-600 flex justify-between"><span>วันที่</span><span className="font-mono">{draft.date}</span></div>}
          <div className="text-xs text-gray-400 font-mono">กรุณาตรวจสอบก่อนยืนยัน</div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="btn-outline flex-1" disabled={loading}>
          ← ย้อนกลับ
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'กำลังส่ง...' : 'ยืนยันการจอง →'}
        </button>
      </div>
    </div>
  )
}
