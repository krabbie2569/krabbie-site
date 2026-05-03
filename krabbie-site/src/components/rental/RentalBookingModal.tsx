'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Step = 'calendar' | 'info' | 'summary'

type RentalItem = {
  id: string
  name: string
  description: string | null
  category: string
  price_per_day: number
  hourly_pricing: { hours: number; price: number }[]
  daily_pricing:  { days: number;  price: number }[]
  images: string[]
  is_available: boolean
}

interface Props {
  item:     RentalItem
  tenantId: string
  lineUrl?: string
  onClose:  () => void
}

function ImageSlider({ images }: { images: string[] }) {
  const [cur, setCur] = useState(0)
  useEffect(() => {
    if (images.length <= 1) return
    const iv = setInterval(() => setCur(p => (p + 1) % images.length), 3000)
    return () => clearInterval(iv)
  }, [images.length])

  return (
    <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden', background: '#F9FAFB' }}>
      {images.map((src, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === cur ? 1 : 0, transition: 'opacity 0.7s ease', zIndex: i === cur ? 1 : 0 }}>
          <img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        </div>
      ))}
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '5px', zIndex: 3 }}>
          {images.map((_, i) => (
            <button key={i} onClick={() => setCur(i)} style={{ width: i === cur ? '18px' : '6px', height: '6px', borderRadius: '3px', border: 'none', cursor: 'pointer', padding: 0, background: i === cur ? 'white' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s' }} />
          ))}
        </div>
      )}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 3, background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '10px', padding: '3px 8px', borderRadius: '20px', fontWeight: 600 }}>
        {cur + 1}/{images.length}
      </div>
    </div>
  )
}

const MONTH_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const DAY_TH   = ['อา','จ','อ','พ','พฤ','ศ','ส']

export default function RentalBookingModal({ item, tenantId, lineUrl, onClose }: Props) {
  const [step,          setStep]          = useState<Step>('calendar')
  const [dateFrom,      setDateFrom]      = useState('')
  const [dateTo,        setDateTo]        = useState('')
  const [picking,       setPicking]       = useState<'from' | 'to'>('from')
  const [calView,       setCalView]       = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [bookedDates,   setBookedDates]   = useState<Set<string>>(new Set())
  const [loadingDates,  setLoadingDates]  = useState(true)
  const [selectedHourly, setSelectedHourly] = useState<{ hours: number; price: number } | null>(null)
  const [form,          setForm]          = useState({ name: '', phone: '', note: '' })
  const [loading,       setLoading]       = useState(false)
  const [bookError,     setBookError]     = useState('')
  const [vp,            setVp]            = useState({ top: 0, height: 0 })

  useEffect(() => {
    const supabase = createClient() as any
    supabase
      .from('rental_bookings')
      .select('date_from, date_to, status')
      .eq('item_id', item.id)
      .in('status', ['confirmed', 'pending'])
      .then(({ data }: { data: any[] | null }) => {
        const blocked = new Set<string>()
        data?.forEach(b => {
          const cur = new Date(b.date_from)
          const end = new Date(b.date_to)
          while (cur <= end) { blocked.add(cur.toISOString().slice(0, 10)); cur.setDate(cur.getDate() + 1) }
        })
        setBookedDates(blocked)
        setLoadingDates(false)
      })
  }, [item.id])

  useEffect(() => {
    const update = () => {
      const v = window.visualViewport
      if (v) setVp({ top: v.offsetTop, height: v.height })
      else setVp({ top: 0, height: window.innerHeight })
    }
    update()
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [])

  const isBooked = (d: string) => bookedDates.has(d)

  const hasConflict = (from: string, to: string) => {
    if (!from || !to) return false
    const cur = new Date(from); const end = new Date(to)
    while (cur <= end) {
      if (bookedDates.has(cur.toISOString().slice(0, 10))) return true
      cur.setDate(cur.getDate() + 1)
    }
    return false
  }

  const handleCalClick = (dateStr: string) => {
    if (picking === 'from') {
      setDateFrom(dateStr); setDateTo(dateStr); setSelectedHourly(null); setPicking('to')
    } else {
      if (dateStr < dateFrom) {
        setDateFrom(dateStr); setDateTo(dateStr); setSelectedHourly(null); setPicking('to')
      } else if (hasConflict(dateFrom, dateStr)) {
        return
      } else {
        setDateTo(dateStr); setSelectedHourly(null); setPicking('from')
      }
    }
  }

  const days = dateFrom && dateTo
    ? Math.max(1, Math.ceil((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000) + 1)
    : 0
  const isSingleDay   = !!(dateFrom && dateTo && dateFrom === dateTo)
  const hourlyOptions = item.hourly_pricing || []
  const hasHourly     = isSingleDay && hourlyOptions.length > 0
  const getDailyTotal = (d: number) => {
    const match = (item.daily_pricing || []).find(r => r.days === d)
    return match ? match.price : d * item.price_per_day
  }
  const total   = selectedHourly ? selectedHourly.price : (days > 0 ? getDailyTotal(days) : 0)
  const conflict = hasConflict(dateFrom, dateTo)
  const canNext  = dateFrom && dateTo && !conflict && !isBooked(dateFrom)

  const handleBook = async () => {
    if (conflict) { setBookError('วันที่เลือกมีการจองแล้ว'); return }
    if (!form.name.trim() || !form.phone.trim()) { setBookError('กรุณากรอกชื่อและเบอร์โทร'); return }
    setLoading(true); setBookError('')
    const supabase = createClient() as any
    const { error } = await supabase.from('rental_bookings').insert({
      tenant_id: tenantId, item_id: item.id,
      date_from: dateFrom, date_to: dateTo,
      customer_name: form.name.trim(),
      customer_phone: form.phone.trim(),
      customer_note: form.note.trim() || null,
      total_price: total, status: 'pending',
    })
    setLoading(false)
    if (error) setBookError('เกิดข้อผิดพลาด: ' + error.message)
    else setStep('summary')
  }

  // ── Calendar renderer ──────────────────────────────────────────────────────
  const renderCalendar = () => {
    const year  = calView.getFullYear()
    const month = calView.getMonth()
    const first = new Date(year, month, 1).getDay()
    const total_days = new Date(year, month + 1, 0).getDate()
    const today = new Date().toISOString().slice(0, 10)
    const cells: JSX.Element[] = []

    for (let i = 0; i < first; i++) cells.push(<div key={`e${i}`} />)

    for (let d = 1; d <= total_days; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isPast    = dateStr < today
      const booked    = isBooked(dateStr)
      const isFrom    = dateStr === dateFrom
      const isTo      = dateStr === dateTo
      const inRange   = dateFrom && dateTo && dateStr > dateFrom && dateStr < dateTo
      const disabled  = isPast || booked

      let bg = 'transparent', color = '#374151', border = '1px solid transparent'
      if (disabled)       { color = '#D1D5DB' }
      else if (isFrom || isTo) { bg = 'linear-gradient(135deg,#E91E8C,#9C27B0)'; color = 'white' }
      else if (inRange)   { bg = 'rgba(233,30,140,0.08)'; color = '#E91E8C' }
      else if (dateStr === today) { border = '1.5px solid #E91E8C'; color = '#E91E8C' }

      cells.push(
        <button key={dateStr} disabled={disabled} onClick={() => handleCalClick(dateStr)}
          style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', border, background: bg, color, fontSize: '13px', fontWeight: isFrom || isTo ? 700 : 400, cursor: disabled ? 'not-allowed' : 'pointer', position: 'relative', transition: 'all 0.15s' }}>
          {d}
          {booked && !isPast && <span style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#F59E0B' }} />}
        </button>
      )
    }
    return cells
  }

  const PINK = 'linear-gradient(135deg,#E91E8C,#9C27B0)'

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', top: vp.top || 0, left: 0, right: 0, height: vp.height || '100dvh', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', transition: 'top 0.2s, height 0.2s' }}>
      <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '480px', maxHeight: vp.height ? `${vp.height - 32}px` : '88dvh', overflowY: 'auto', overscrollBehavior: 'contain', boxShadow: '0 24px 64px rgba(233,30,140,0.2)' }}>

        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#E5E7EB' }} />
        </div>

        {item.images?.length > 0 && <ImageSlider images={item.images} />}

        {/* Header */}
        <div style={{ padding: '12px 24px 16px', borderBottom: '1px solid rgba(233,30,140,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '3px', color: '#E91E8C', textTransform: 'uppercase', marginBottom: '4px' }}>จองสินค้า</p>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '18px', color: '#1a1a2e', fontWeight: 600 }}>{item.name}</h3>
            {item.description && <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '3px', lineHeight: 1.4 }}>{item.description}</p>}
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F3F4F6', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#6B7280', flexShrink: 0 }}>✕</button>
        </div>

        {/* Steps indicator */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(233,30,140,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {[{ id: 'calendar', label: 'เลือกวัน' }, { id: 'info', label: 'ข้อมูล' }, { id: 'summary', label: 'สรุป' }].map(({ id, label }, i) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: i < 2 ? '1' : 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, background: (step === 'calendar' && i === 0) || (step === 'info' && i <= 1) || step === 'summary' ? PINK : '#F3F4F6', color: (step === 'calendar' && i === 0) || (step === 'info' && i <= 1) || step === 'summary' ? 'white' : '#9CA3AF' }}>{i + 1}</div>
                  <span style={{ fontSize: '11px', color: step === id ? '#E91E8C' : '#9CA3AF' }}>{label}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: '1px', background: 'rgba(233,30,140,0.15)' }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px' }}>

          {/* STEP 1: Calendar */}
          {step === 'calendar' && (
            <div>
              {/* Selected range display */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {[{ label: 'รับวันที่', val: dateFrom, active: picking === 'from' }, { label: 'คืนวันที่', val: dateTo, active: picking === 'to' }].map(({ label, val, active }) => (
                  <div key={label} style={{ padding: '12px', borderRadius: '14px', border: `1.5px solid ${active ? '#E91E8C' : 'rgba(233,30,140,0.15)'}`, background: active ? 'rgba(233,30,140,0.03)' : 'white', textAlign: 'center' }}>
                    <p style={{ fontSize: '10px', color: '#9CA3AF', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontFamily: 'Georgia,serif', fontSize: '16px', color: val ? '#1a1a2e' : '#D1D5DB', fontWeight: val ? 600 : 400 }}>
                      {val ? val.slice(5).replace('-', '/') : '—'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Calendar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <button onClick={() => setCalView(p => new Date(p.getFullYear(), p.getMonth() - 1, 1))}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F9F9F9', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                  <span style={{ fontFamily: 'Georgia,serif', fontSize: '15px', color: '#1a1a2e', fontWeight: 600 }}>
                    {MONTH_TH[calView.getMonth()]} {calView.getFullYear() + 543}
                  </span>
                  <button onClick={() => setCalView(p => new Date(p.getFullYear(), p.getMonth() + 1, 1))}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F9F9F9', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '4px' }}>
                  {DAY_TH.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#9CA3AF', padding: '4px 0' }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
                  {renderCalendar()}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '10px', color: '#9CA3AF' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} /> ติดจองแล้ว
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: PINK, display: 'inline-block' }} /> วันที่เลือก
                </span>
              </div>

              {/* Hourly options (single day) */}
              {hasHourly && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#1a1a2e', fontWeight: 600, marginBottom: '8px' }}>เช่ารายชั่วโมง (วันเดียว)</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {hourlyOptions.map((h, i) => (
                      <button key={i} onClick={() => setSelectedHourly(selectedHourly?.hours === h.hours ? null : h)}
                        style={{ padding: '8px 16px', borderRadius: '12px', border: `1.5px solid ${selectedHourly?.hours === h.hours ? '#9C27B0' : 'rgba(156,39,176,0.2)'}`, background: selectedHourly?.hours === h.hours ? 'rgba(156,39,176,0.08)' : 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: selectedHourly?.hours === h.hours ? '#7B1FA2' : '#374151' }}>
                        {h.hours} ชม. = ฿{h.price.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price summary */}
              {days > 0 && (
                <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(233,30,140,0.04)', border: '1px solid rgba(233,30,140,0.12)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>
                      {selectedHourly ? `เช่า ${selectedHourly.hours} ชั่วโมง` : `เช่า ${days} วัน`}
                    </span>
                    <span style={{ fontFamily: 'Georgia,serif', fontSize: '22px', fontWeight: 700, background: PINK, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      ฿{total.toLocaleString()}
                    </span>
                  </div>
                  {!selectedHourly && days > 1 && (item.daily_pricing || []).find((r: any) => r.days === days) && (
                    <p style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>✓ ราคาพิเศษแพ็กเกจ {days} วัน</p>
                  )}
                </div>
              )}

              {conflict && <p style={{ fontSize: '12px', color: '#EF4444', marginBottom: '12px' }}>❌ วันที่เลือกมีการจองแล้ว</p>}

              <button disabled={!canNext} onClick={() => setStep('info')}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: canNext ? PINK : '#E5E7EB', color: canNext ? 'white' : '#9CA3AF', fontSize: '15px', fontWeight: 600, cursor: canNext ? 'pointer' : 'not-allowed', boxShadow: canNext ? '0 4px 20px rgba(233,30,140,0.35)' : 'none', transition: 'all 0.2s' }}>
                ถัดไป →
              </button>
            </div>
          )}

          {/* STEP 2: Customer info */}
          {step === 'info' && (
            <div>
              {[{ k: 'name', label: 'ชื่อผู้เช่า *', ph: 'ชื่อ-นามสกุล', type: 'text' }, { k: 'phone', label: 'เบอร์โทร *', ph: '0812345678', type: 'tel' }, { k: 'note', label: 'หมายเหตุ', ph: 'แจ้งเพิ่มเติม...', type: 'text' }].map(({ k, label, ph, type }) => (
                <div key={k} style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</p>
                  <input type={type} value={(form as any)[k]} placeholder={ph}
                    onChange={e => setForm(prev => ({ ...prev, [k]: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px 14px', fontSize: '14px', outline: 'none', color: '#1a1a2e', fontFamily: 'inherit' }} />
                </div>
              ))}

              {bookError && <p style={{ fontSize: '12px', color: '#EF4444', marginBottom: '12px' }}>{bookError}</p>}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep('calendar')}
                  style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid #E5E7EB', background: 'white', color: '#6B7280', fontSize: '15px', cursor: 'pointer' }}>
                  ← ย้อนกลับ
                </button>
                <button disabled={loading || !form.name.trim() || !form.phone.trim()} onClick={handleBook}
                  style={{ flex: 2, padding: '14px', borderRadius: '14px', border: 'none', background: !form.name.trim() || !form.phone.trim() ? '#E5E7EB' : PINK, color: !form.name.trim() || !form.phone.trim() ? '#9CA3AF' : 'white', fontSize: '15px', fontWeight: 600, cursor: loading || !form.name.trim() || !form.phone.trim() ? 'not-allowed' : 'pointer', boxShadow: form.name.trim() && form.phone.trim() ? '0 4px 20px rgba(233,30,140,0.35)' : 'none' }}>
                  {loading ? 'กำลังจอง...' : 'ยืนยันการจอง →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Summary */}
          {step === 'summary' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: PINK, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>✓</div>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '20px', color: '#1a1a2e', marginBottom: '8px' }}>จองสำเร็จแล้ว!</h3>
              <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '24px' }}>รอการยืนยันจากร้านค้า</p>

              <div style={{ background: 'rgba(233,30,140,0.04)', border: '1px solid rgba(233,30,140,0.12)', borderRadius: '16px', padding: '16px', textAlign: 'left', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>{item.name}</p>
                {[
                  { label: 'วันรับ', val: dateFrom },
                  { label: 'วันคืน', val: dateTo },
                  { label: 'ราคารวม', val: `฿${total.toLocaleString()}` },
                  { label: 'ชื่อ', val: form.name },
                  { label: 'เบอร์', val: form.phone },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid rgba(233,30,140,0.06)' }}>
                    <span style={{ color: '#9CA3AF' }}>{label}</span>
                    <span style={{ color: '#1a1a2e', fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>

              {lineUrl && (
                <a href={lineUrl} target="_blank" rel="noreferrer"
                  style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: '#06C755', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', marginBottom: '12px', textAlign: 'center' }}>
                  แจ้งยืนยันผ่าน LINE →
                </a>
              )}
              <button onClick={onClose}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1.5px solid #E5E7EB', background: 'white', color: '#6B7280', fontSize: '15px', cursor: 'pointer' }}>
                ปิด
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
