'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface Props {
  tenantSlug:  string
  currentPlan: 'standard' | 'pro'
  onSuccess:   (status: string, message: string) => void
}

const PLANS = {
  standard: { name: 'Standard', price: 150, color: 'orange' },
  pro:      { name: 'Pro',      price: 390, color: 'teal'   },
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

export default function SlipUploader({ tenantSlug, currentPlan, onSuccess }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro'>(currentPlan)
  const [months, setMonths]             = useState(1)
  const [preview, setPreview]           = useState<string | null>(null)
  const [file, setFile]                 = useState<File | null>(null)
  const [state, setState]               = useState<UploadState>('idle')
  const [resultMsg, setResultMsg]       = useState('')
  const [resultStatus, setResultStatus] = useState('')
  const fileRef                         = useRef<HTMLInputElement>(null)

  const plan          = PLANS[selectedPlan]
  const totalAmount   = plan.price * months

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
    setState('idle')
    setResultMsg('')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (!f || !f.type.startsWith('image/')) return
    const dt = new DataTransfer()
    dt.items.add(f)
    if (fileRef.current) fileRef.current.files = dt.files
    setFile(f)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  async function handleSubmit() {
    if (!file) return
    setState('uploading')

    const form = new FormData()
    form.append('slip',       file)
    form.append('tenantSlug', tenantSlug)
    form.append('planType',   selectedPlan)
    form.append('months',     String(months))

    try {
      const res  = await fetch('/api/payment/upload-slip', { method: 'POST', body: form })
      const json = await res.json()

      setState('done')
      setResultMsg(json.message ?? (res.ok ? 'ส่งสลิปสำเร็จ' : json.error))
      setResultStatus(json.status ?? (res.ok ? 'ok' : 'error'))
      onSuccess(json.status, json.message)
    } catch {
      setState('error')
      setResultMsg('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  const STATUS_ICON: Record<string, string> = {
    auto_approved:  '✅',
    pending_review: '📋',
    duplicate:      '⚠️',
    error:          '❌',
  }

  return (
    <div className="max-w-lg">

      {/* PLAN SELECTOR */}
      <div className="mb-6">
        <div className="sec-label mb-3">เลือกแพลน</div>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(PLANS) as [typeof selectedPlan, typeof plan][]).map(([key, p]) => (
            <button
              key={key}
              onClick={() => setSelectedPlan(key)}
              className={`p-4 rounded-krabbie border-2 text-left transition-all ${
                selectedPlan === key
                  ? key === 'pro'
                    ? 'border-teal-DEFAULT bg-teal-light'
                    : 'border-orange-500 bg-orange-50'
                  : 'border-krabbie-border hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-syne font-bold text-sm">{p.name}</span>
                {selectedPlan === key && (
                  <span className={`text-[0.6rem] font-mono px-1.5 py-0.5 rounded ${key === 'pro' ? 'bg-teal-DEFAULT text-white' : 'bg-orange-500 text-white'}`}>
                    ✓
                  </span>
                )}
              </div>
              <div className={`font-syne font-extrabold text-xl ${key === 'pro' ? 'text-teal-dark' : 'text-orange-500'}`}>
                {p.price} ฿
              </div>
              <div className="text-xs text-gray-400">/เดือน</div>
            </button>
          ))}
        </div>
      </div>

      {/* MONTHS SELECTOR */}
      <div className="mb-6">
        <div className="sec-label mb-3">จำนวนเดือน</div>
        <div className="flex gap-2">
          {[1, 3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`flex-1 py-2 rounded-lg border-2 text-sm font-bold font-mono transition-all ${
                months === m
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-krabbie-border text-gray-500 hover:border-orange-300'
              }`}
            >
              {m} เดือน
              {m === 12 && <div className="text-[0.55rem] text-teal-dark font-mono">-2 เดือน</div>}
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-500">ยอดรวม</span>
          <span className="font-syne font-bold text-orange-500 text-lg">{totalAmount.toLocaleString()} ฿</span>
        </div>
      </div>

      {/* PROMPTPAY QR PLACEHOLDER */}
      <div className="card mb-6 text-center">
        <div className="text-xs text-gray-400 font-mono mb-2">โอนมาที่ PromptPay</div>
        <div className="w-32 h-32 bg-gray-50 rounded-lg mx-auto flex items-center justify-center border border-krabbie-border mb-2">
          <span className="text-gray-300 text-xs">QR Code</span>
        </div>
        <div className="font-mono text-sm font-bold">{process.env.NEXT_PUBLIC_PROMPTPAY ?? 'XXX-XXX-XXXX'}</div>
        <div className="font-syne text-orange-500 font-bold">{totalAmount.toLocaleString()} ฿</div>
      </div>

      {/* SLIP UPLOAD */}
      <div className="mb-4">
        <div className="sec-label mb-3">แนบสลิป</div>
        <div
          className={`border-2 border-dashed rounded-krabbie p-6 text-center cursor-pointer transition-colors ${
            preview ? 'border-orange-300 bg-orange-50' : 'border-krabbie-border hover:border-orange-300 hover:bg-orange-50/30'
          }`}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="slip preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              <div className="mt-2 text-xs text-orange-500 font-mono">คลิกเพื่อเปลี่ยนรูป</div>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-2">📱</div>
              <div className="text-sm font-semibold mb-1">ลากรูปมาวาง หรือคลิกเพื่อเลือก</div>
              <div className="text-xs text-gray-400">JPG, PNG, WEBP · ขนาดไม่เกิน 5 MB</div>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* SUBMIT */}
      {state === 'done' ? (
        <div className={`card p-4 text-center ${
          resultStatus === 'auto_approved' ? 'bg-teal-light border-teal-DEFAULT' :
          resultStatus === 'duplicate'     ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="text-2xl mb-1">{STATUS_ICON[resultStatus] ?? '📋'}</div>
          <p className="text-sm font-semibold">{resultMsg}</p>
          {resultStatus === 'pending_review' && (
            <p className="text-xs text-gray-500 mt-1 font-mono">admin จะตรวจสอบภายใน 1-2 ชั่วโมง</p>
          )}
        </div>
      ) : (
        <button
          disabled={!file || state === 'uploading'}
          onClick={handleSubmit}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {state === 'uploading' ? '⏳ กำลังอัพโหลด...' :
           `ส่งสลิป ${totalAmount.toLocaleString()} ฿ →`}
        </button>
      )}

      <p className="text-xs text-gray-400 text-center mt-3 font-mono">
        admin จะตรวจสอบและเปิดใช้งานภายใน 1-2 ชั่วโมง
      </p>
    </div>
  )
}
