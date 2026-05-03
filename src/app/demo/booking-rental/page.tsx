'use client'
export const dynamic = 'force-dynamic'
import { useState, useMemo } from 'react'

/* ── DATA ────────────────────────────────────────── */
const ITEMS = [
  { id:'1', cat:'camera', name:'Sony ZV-1F', tag:'Best Seller', desc:'กล้องคอมแพค 4K เซลฟี่สวย วิดีโอลื่น เหมาะทริป', price:390, hourly:[{h:4,p:250},{h:8,p:350}], img:'📷', stock:3 },
  { id:'2', cat:'camera', name:'Fujifilm X-T30 II', tag:'Popular', desc:'Mirrorless สีฟิล์มสวยเป็นเอกลักษณ์ ถ่ายรูปสวยไม่แต่ง', price:590, hourly:[], img:'📸', stock:2 },
  { id:'3', cat:'camera', name:'Sony A7C II', tag:'Pro', desc:'Full-frame mirrorless น้ำหนักเบา คุณภาพระดับมืออาชีพ', price:890, hourly:[], img:'🎥', stock:1 },
  { id:'4', cat:'lens', name:'Lens 50mm f/1.8', tag:'', desc:'เลนส์ portrait หน้าชัดหลังเบลอ ใช้กับ Sony A-mount', price:190, hourly:[{h:4,p:120}], img:'🔭', stock:4 },
  { id:'5', cat:'outfit', name:'ชุดฮั้นบก เกาหลี', tag:'New', desc:'สีชมพูพาสเทล ลวดลายดอกไม้ ไซส์ XS-XL', price:290, hourly:[], img:'👘', stock:5 },
  { id:'6', cat:'outfit', name:'ชุดกิโมโน ญี่ปุ่น', tag:'', desc:'สีน้ำเงิน-ทอง ลายดั้งเดิม ไซส์ S-L', price:350, hourly:[], img:'🎌', stock:3 },
]

const REVIEWS = [
  { name:'นุ่น ณัฐชา', role:'ถ่ายพรีเวดดิ้ง', rating:5, text:'กล้อง Sony A7C สวยมาก ภาพออกมาคมชัดมากเลยค่ะ บริการดี ส่งตรงเวลา จะมาเช่าอีกแน่นอน', avatar:'🌸', date:'15 เม.ย. 68' },
  { name:'ต้น วรวิทย์', role:'ถ่ายท่องเที่ยว', rating:5, text:'เช่า Fujifilm X-T30 ไปทริปเชียงใหม่ สีฟิล์มสวยมากครับ ไม่ต้องแต่งเลย คุ้มค่ามาก', avatar:'🎌', date:'8 เม.ย. 68' },
  { name:'มิน พิมลรัตน์', role:'Cosplay Photo', rating:5, text:'ชุดฮั้นบกสวยมากค่ะ ผ้าดีไม่ยับ ถ่ายรูปออกมาสวยมาก มีให้เลือกหลายสีด้วย', avatar:'🌺', date:'2 เม.ย. 68' },
  { name:'กอล์ฟ ธนกร', role:'YouTuber', rating:4, text:'เช่า Sony ZV-1F ถ่าย vlog ครับ auto focus ดีมาก ราคาเช่าสมเหตุสมผลดี', avatar:'🎬', date:'28 มี.ค. 68' },
]

const BUSY_DAYS = [3, 4, 5, 12, 13, 18, 19, 20]

const PINK = '#E91E8C'
const PURPLE = '#9C27B0'
const GRAD = `linear-gradient(135deg, ${PINK}, ${PURPLE})`

/* ── HELPERS ─────────────────────────────────────── */
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}
const MONTHS_TH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const DAYS_TH = ['อา','จ','อ','พ','พฤ','ศ','ส']

/* ── CALENDAR COMPONENT ──────────────────────────── */
function Calendar({ year, month, startDate, endDate, onSelect, busy }: {
  year: number; month: number
  startDate: number | null; endDate: number | null
  onSelect: (d: number) => void; busy: number[]
}) {
  const days = getDaysInMonth(year, month)
  const firstDay = getFirstDay(year, month)
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const todayDate = isCurrentMonth ? today.getDate() : -1

  return (
    <div>
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', color: '#1a1a2e' }}>
        {MONTHS_TH[month]} {year + 543}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
        {DAYS_TH.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: PINK, padding: '4px 0' }}>{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1
          const isBusy = busy.includes(d)
          const isPast = isCurrentMonth && d < todayDate
          const isStart = startDate === d
          const isEnd = endDate === d
          const isInRange = startDate && endDate && d > startDate && d < endDate
          const isToday = d === todayDate
          return (
            <button
              key={d}
              disabled={isBusy || isPast}
              onClick={() => onSelect(d)}
              style={{
                padding: '6px 2px',
                borderRadius: '8px',
                border: 'none',
                cursor: isBusy || isPast ? 'not-allowed' : 'pointer',
                background: isStart || isEnd ? GRAD
                  : isInRange ? 'rgba(233,30,140,0.1)'
                  : 'transparent',
                color: isStart || isEnd ? 'white'
                  : isBusy ? '#D1D5DB'
                  : isPast ? '#E5E7EB'
                  : isInRange ? PINK
                  : '#374151',
                fontSize: '0.82rem',
                fontWeight: isStart || isEnd || isToday ? 700 : 400,
                position: 'relative',
                outline: isToday && !isStart && !isEnd ? `2px solid ${PINK}` : 'none',
                opacity: isPast ? 0.4 : 1,
              }}
            >
              {d}
              {isBusy && !isPast && (
                <span style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#F59E0B', display: 'block' }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── ITEM CARD ───────────────────────────────────── */
function ItemCard({ item, onBook }: { item: typeof ITEMS[0]; onBook: (item: typeof ITEMS[0]) => void }) {
  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'white', border: '1px solid #F3E8FF', boxShadow: '0 2px 12px rgba(233,30,140,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(233,30,140,0.14)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(233,30,140,0.06)' }}
    >
      <div style={{ height: '140px', background: 'linear-gradient(135deg,#FFF0F8,#F3E8FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', position: 'relative' }}>
        {item.img}
        {item.tag && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', background: GRAD, color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px', borderRadius: '100px', letterSpacing: '1px' }}>
            {item.tag}
          </span>
        )}
        <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.12)', color: 'white', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '100px' }}>
          เหลือ {item.stock}
        </span>
      </div>
      <div style={{ padding: '14px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e', marginBottom: '4px' }}>{item.name}</div>
        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '8px', lineHeight: 1.4 }}>{item.desc}</div>
        {item.hourly.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {item.hourly.map((h, i) => (
              <span key={i} style={{ fontSize: '0.65rem', background: 'rgba(156,39,176,0.08)', color: PURPLE, padding: '2px 6px', borderRadius: '100px', fontWeight: 600 }}>
                {h.h}ชม. ฿{h.p}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800, fontSize: '1.1rem' }}>฿{item.price}</span>
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>/วัน</span>
          </div>
          <button
            onClick={() => onBook(item)}
            style={{ padding: '7px 16px', borderRadius: '10px', border: 'none', background: GRAD, color: 'white', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
          >
            จอง →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── BOOKING MODAL ───────────────────────────────── */
function BookingModal({ item, onClose }: { item: typeof ITEMS[0]; onClose: () => void }) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year]  = useState(now.getFullYear())
  const [startDate, setStartDate] = useState<number | null>(null)
  const [endDate,   setEndDate]   = useState<number | null>(null)
  const [step, setStep] = useState<'calendar'|'form'|'done'>('calendar')
  const [form, setForm] = useState({ name:'', phone:'' })

  function handleDateSelect(d: number) {
    if (!startDate || (startDate && endDate)) {
      setStartDate(d); setEndDate(null)
    } else {
      if (d <= startDate) { setStartDate(d); setEndDate(null) }
      else setEndDate(d)
    }
  }

  const nights = startDate && endDate ? endDate - startDate : 0
  const total  = nights * item.price

  const nextMonth = (month + 1) % 12
  const nextYear  = month === 11 ? year + 1 : year

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '720px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(233,30,140,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* HEADER */}
        <div style={{ background: GRAD, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase' }}>จองสินค้า</div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{item.img} {item.name}</div>
          </div>
          <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
        </div>

        {step === 'calendar' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {startDate && <span style={{ background: 'rgba(233,30,140,0.08)', color: PINK, padding: '4px 12px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 600 }}>รับ: {startDate} {MONTHS_TH[month]}</span>}
              {endDate   && <span style={{ background: 'rgba(233,30,140,0.08)', color: PINK, padding: '4px 12px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 600 }}>คืน: {endDate} {MONTHS_TH[month]}</span>}
              {!startDate && <span style={{ color: '#9CA3AF', fontSize: '0.82rem' }}>เลือกวันรับสินค้า</span>}
              {startDate && !endDate && <span style={{ color: '#9CA3AF', fontSize: '0.82rem' }}>เลือกวันคืนสินค้า</span>}
            </div>

            {/* CALENDARS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <button onClick={() => setMonth(m => m === 0 ? 0 : m - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: PINK, fontSize: '1.2rem', padding: '4px 8px' }}>‹</button>
                  <span />
                  <button onClick={() => setMonth(m => (m + 1) % 12)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: PINK, fontSize: '1.2rem', padding: '4px 8px' }}>›</button>
                </div>
                <Calendar year={year} month={month} startDate={startDate} endDate={endDate} onSelect={handleDateSelect} busy={BUSY_DAYS} />
              </div>
              <div>
                <div style={{ height: '32px' }} />
                <Calendar year={nextYear} month={nextMonth} startDate={startDate} endDate={endDate} onSelect={handleDateSelect} busy={[6, 7, 14, 15, 21]} />
              </div>
            </div>

            {/* LEGEND */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              {[
                { color: GRAD, label: 'วันรับ/คืน' },
                { color: 'rgba(233,30,140,0.1)', label: 'ช่วงที่เช่า', border: `1px solid ${PINK}` },
                { color: '#F3F4F6', label: 'ถูกจองแล้ว', dot: '#F59E0B' },
              ].map(({ color, label, dot }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: color, position: 'relative', flexShrink: 0 }}>
                    {dot && <span style={{ position: 'absolute', bottom: '1px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: dot }} />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* SUMMARY & NEXT */}
            {startDate && endDate && (
              <div style={{ marginTop: '20px', background: 'linear-gradient(135deg, rgba(233,30,140,0.04), rgba(156,39,176,0.04))', border: '1px solid rgba(233,30,140,0.12)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { label: 'วันรับ', value: `${startDate} ${MONTHS_TH[month]}` },
                    { label: 'วันคืน', value: `${endDate} ${MONTHS_TH[month]}` },
                    { label: 'รวม', value: `${nights} วัน` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ textAlign: 'center', background: 'white', borderRadius: '10px', padding: '10px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginBottom: '2px' }}>{label}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a2e' }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.82rem' }}>รวมทั้งหมด: </span>
                    <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800, fontSize: '1.4rem' }}>฿{total.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => setStep('form')}
                    style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: GRAD, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    ถัดไป →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'form' && (
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1a1a2e' }}>ข้อมูลผู้เช่า</h3>
            <div style={{ background: 'rgba(233,30,140,0.04)', border: '1px solid rgba(233,30,140,0.12)', borderRadius: '12px', padding: '12px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>📅 {startDate}–{endDate} {MONTHS_TH[month]} · {nights} วัน</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: PINK }}>฿{total.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'ชื่อ-นามสกุล', key: 'name', placeholder: 'สมชาย ใจดี', type: 'text' },
                { label: 'เบอร์โทร / Line ID', key: 'phone', placeholder: '081-234-5678', type: 'tel' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = PINK}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setStep('calendar')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: 'white', color: '#6B7280', fontWeight: 600, cursor: 'pointer' }}>← ย้อนกลับ</button>
              <button
                disabled={!form.name || !form.phone}
                onClick={() => setStep('done')}
                style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: !form.name || !form.phone ? '#E5E7EB' : GRAD, color: !form.name || !form.phone ? '#9CA3AF' : 'white', fontWeight: 700, cursor: !form.name || !form.phone ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
              >
                ยืนยันการจอง →
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
            <h3 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '8px', color: '#1a1a2e' }}>จองสำเร็จ!</h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '20px' }}>เจ้าของร้านจะติดต่อกลับภายใน 30 นาที</p>
            <div style={{ background: 'rgba(233,30,140,0.04)', border: '1px solid rgba(233,30,140,0.12)', borderRadius: '16px', padding: '16px', marginBottom: '20px', display: 'inline-block', textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>หมายเลขการจอง</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: PINK, fontSize: '1rem' }}>BRK-{Math.random().toString(36).slice(2,8).toUpperCase()}</div>
            </div>
            <button onClick={onClose} style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: GRAD, color: 'white', fontWeight: 700, cursor: 'pointer' }}>ปิด</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── MAIN PAGE ───────────────────────────────────── */
export default function DemoBookingRental() {
  const [activeTab, setActiveTab] = useState<'all'|'camera'|'lens'|'outfit'>('all')
  const [bookItem, setBookItem]   = useState<typeof ITEMS[0] | null>(null)
  const [menuOpen, setMenuOpen]   = useState(false)

  const filtered = useMemo(() =>
    activeTab === 'all' ? ITEMS : ITEMS.filter(i => i.cat === activeTab),
    [activeTab]
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBFF', fontFamily: 'Sarabun, sans-serif', color: '#1a1a2e' }}>

      {/* DEMO BADGE */}
      <div style={{ background: GRAD, color: 'white', textAlign: 'center', padding: '8px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px' }}>
        ✦ ตัวอย่าง Template · ระบบเช่าสินค้า · <a href="/signup?template=booking-rental" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'underline' }}>ใช้ template นี้ →</a>
      </div>

      {/* NAVBAR */}
      <nav style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(233,30,140,0.08)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📷</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BoBBoB Camera Korat</div>
            <div style={{ fontSize: '0.6rem', color: '#9CA3AF', letterSpacing: '2px', textTransform: 'uppercase' }}>Stylist &amp; Camera Rental</div>
          </div>
        </div>
        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[
            { label: '📷 กล้อง', tab: 'camera' },
            { label: '🔭 เลนส์', tab: 'lens' },
            { label: '👘 ชุดเช่า', tab: 'outfit' },
          ].map(({ label, tab }) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab as any); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }}
              style={{ padding: '7px 14px', borderRadius: '100px', border: `1.5px solid ${activeTab === tab ? PINK : 'rgba(233,30,140,0.15)'}`, background: activeTab === tab ? 'rgba(233,30,140,0.06)' : 'white', color: activeTab === tab ? PINK : '#6B7280', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'none' }}
              className="desktop-nav-btn"
            />
          ))}
          <a href="#reviews" style={{ fontSize: '0.82rem', color: '#6B7280', textDecoration: 'none', padding: '7px 14px' }}>⭐ รีวิว</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg, #fff8ff 0%, #ffeeff 50%, #f0f8ff 100%)', padding: 'clamp(40px, 8vw, 80px) 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {['8%', '82%', '58%', '28%', '70%'].map((l, i) => (
            <div key={i} style={{ position: 'absolute', left: l, top: `${18 + i * 14}%`, fontSize: `${30 + i * 5}px`, color: PINK, opacity: 0.15, lineHeight: 1 }}>✦</div>
          ))}
        </div>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: 'rgba(233,30,140,0.07)', border: '1px solid rgba(233,30,140,0.15)', marginBottom: '20px' }}>
              <span style={{ color: PINK, fontSize: '0.7rem' }}>✦</span>
              <span style={{ fontSize: '0.72rem', letterSpacing: '2px', color: PINK, textTransform: 'uppercase', fontWeight: 600 }}>เปิดให้เช่าทุกวัน 09:00–20:00</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '12px', background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BoBBoB<br />Camera Korat
            </h1>
            <p style={{ color: '#4B5563', fontSize: '1rem', lineHeight: 1.7, marginBottom: '24px' }}>
              สไตลิสต์และช่างภาพมืออาชีพ<br />ให้เช่าเสื้อผ้าแฟชั่นและกล้องคอมแพคคุณภาพสูง
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ padding: '12px 28px', borderRadius: '100px', border: 'none', background: GRAD, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 20px rgba(233,30,140,0.3)' }}
              >
                ดูสินค้าทั้งหมด →
              </button>
              <a href="#reviews" style={{ padding: '12px 28px', borderRadius: '100px', border: `1.5px solid rgba(233,30,140,0.3)`, background: 'white', color: PINK, fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', textDecoration: 'none' }}>
                ⭐ ดูรีวิว
              </a>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { num: '50+', label: 'กล้องให้เช่า' },
              { num: '4.9★', label: 'คะแนนรีวิว' },
              { num: '500+', label: 'การจองสำเร็จ' },
              { num: '3 ปี', label: 'เปิดให้บริการ' },
            ].map(({ num, label }) => (
              <div key={label} style={{ background: 'white', borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 12px rgba(233,30,140,0.06)' }}>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{num}</div>
                <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.65rem', letterSpacing: '4px', color: PINK, textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>สินค้าให้เช่า</div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>เลือกสินค้าที่ต้องการ</h2>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {([['all','ทั้งหมด'],['camera','กล้อง 📷'],['lens','เลนส์ 🔭'],['outfit','ชุดเช่า 👘']] as const).map(([t, l]) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{ padding: '7px 16px', borderRadius: '100px', border: `1.5px solid ${activeTab === t ? PINK : '#E5E7EB'}`, background: activeTab === t ? 'rgba(233,30,140,0.07)' : 'white', color: activeTab === t ? PINK : '#6B7280', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {filtered.map(item => <ItemCard key={item.id} item={item} onBook={setBookItem} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: 'linear-gradient(180deg, white, #FFF0F8)', padding: '60px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '4px', color: PINK, textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>วิธีจอง</div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1a1a2e' }}>จองง่าย แค่ 3 ขั้นตอน</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { num: '01', icon: '🔍', title: 'เลือกสินค้า', desc: 'เลือกกล้องหรือชุดที่ต้องการจากรายการ' },
              { num: '02', icon: '📅', title: 'เลือกวันรับ-คืน', desc: 'ระบุวันที่ต้องการรับและคืนสินค้า' },
              { num: '03', icon: '✅', title: 'ยืนยัน', desc: 'รอเจ้าของร้านยืนยันภายใน 30 นาที' },
            ].map(({ num, icon, title, desc }) => (
              <div key={num} style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 16px rgba(233,30,140,0.06)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', fontWeight: 800, color: PINK, opacity: 0.05, lineHeight: 1 }}>{num}</div>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(233,30,140,0.08), rgba(156,39,176,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '12px' }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>{title}</div>
                <div style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '4px', color: PINK, textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>รีวิว</div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>ลูกค้าพูดถึงเรา</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(233,30,140,0.06)', border: `1px solid rgba(233,30,140,0.15)`, borderRadius: '100px', padding: '8px 16px' }}>
              <span style={{ color: PINK, fontSize: '1rem' }}>★</span>
              <span style={{ fontWeight: 800, color: PINK }}>4.9</span>
              <span style={{ color: '#9CA3AF', fontSize: '0.78rem' }}>({REVIEWS.length * 47} รีวิว)</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #F3E8FF', boxShadow: '0 2px 12px rgba(233,30,140,0.04)' }}>
                <div style={{ color: PINK, fontSize: '0.9rem', marginBottom: '10px' }}>{'★'.repeat(r.rating)}</div>
                <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.7, marginBottom: '16px' }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(233,30,140,0.08), rgba(156,39,176,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{r.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{r.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{r.role}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#D1D5DB' }}>{r.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#1a1a2e', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>BoBBoB Camera Rental</div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>📍 โคราช · 📞 081-234-5678 · ⏰ 09:00–20:00</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#4B5563', textAlign: 'right' }}>
            Powered by <a href="/" style={{ color: '#ff6b00', textDecoration: 'none', fontWeight: 700 }}>🦀 Krabbie.com</a>
          </div>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {bookItem && <BookingModal item={bookItem} onClose={() => setBookItem(null)} />}
    </div>
  )
}
