'use client'

import { useState } from 'react'
import { formatPrice, formatDuration } from '@/lib/utils'

/* ─── Static demo data ────────────────────────────────────────────────────── */

type Status = 'pending' | 'confirmed' | 'cancelled'

const INIT_SERVICES = [
  { id: '1', name: 'นวดแผนไทย',             description: 'ผ่อนคลายกล้ามเนื้อ',       duration_minutes: 60,  price: 350,  is_active: true },
  { id: '2', name: 'ทำเล็บเจล (มือ + เท้า)', description: 'เล็บสวย ทนนาน 3–4 สัปดาห์', duration_minutes: 90,  price: 550,  is_active: true },
  { id: '3', name: 'คลีนิกหน้า + บีบสิว',    description: 'ดูแลผิวหน้า ลดสิว',         duration_minutes: 75,  price: 490,  is_active: true },
  { id: '4', name: 'สปาตัวทั้งตัว',           description: 'สครับ + มาร์ค + นวด',       duration_minutes: 120, price: 890,  is_active: true },
  { id: '5', name: 'ทำสีผม (Balayage)',       description: 'ระบายสีธรรมชาติ ดูแพง',     duration_minutes: 150, price: 1200, is_active: true },
]

const INIT_STAFF = [
  { id: 'p1', name: 'พี่นุ่น',  role: 'ช่างนวดแผนไทย / สปา',   exp: '5 ปี', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&q=80&fit=crop&auto=format' },
  { id: 'p2', name: 'น้องแพร',  role: 'ช่างเล็บ / ผิวหน้า',     exp: '3 ปี', rating: 4.8, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&q=80&fit=crop&auto=format' },
  { id: 'p3', name: 'พี่ออย',   role: 'ช่างนวดแผนไทย / สปา',   exp: '4 ปี', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&q=80&fit=crop&auto=format' },
  { id: 'p4', name: 'พี่หนิง',  role: 'ช่างทำสีผม / Balayage', exp: '6 ปี', rating: 5.0, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&q=80&fit=crop&auto=format' },
  { id: 'p5', name: 'คุณกิ่ง',  role: 'ช่างผิวหน้า / เล็บ',    exp: '2 ปี', rating: 4.7, avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&q=80&fit=crop&auto=format' },
]

const INIT_BOOKINGS = [
  { id: '1', name: 'คุณมินตรา สุขใจ', phone: '081-234-5678', service: 'นวดแผนไทย',           price: 350,  date: '2025-05-06', time: '10:00', status: 'pending'   as Status },
  { id: '2', name: 'คุณปิยะ นิลกาล',  phone: '089-876-5432', service: 'สปาตัวทั้งตัว',       price: 890,  date: '2025-05-06', time: '13:00', status: 'confirmed' as Status },
  { id: '3', name: 'คุณนภา วรรณา',    phone: '062-345-6789', service: 'ทำเล็บเจล',            price: 550,  date: '2025-05-07', time: '11:00', status: 'confirmed' as Status },
  { id: '4', name: 'คุณสมชาย กิตติ',  phone: '085-555-1234', service: 'ทำสีผม (Balayage)',    price: 1200, date: '2025-05-07', time: '14:00', status: 'pending'   as Status },
  { id: '5', name: 'คุณอรุณี เรือง',   phone: '091-234-5678', service: 'คลีนิกหน้า + บีบสิว', price: 490,  date: '2025-05-05', time: '09:00', status: 'cancelled' as Status },
  { id: '6', name: 'คุณวรรณา ไชย',    phone: '083-111-2222', service: 'นวดแผนไทย',           price: 350,  date: '2025-05-05', time: '11:00', status: 'confirmed' as Status },
  { id: '7', name: 'คุณกานดา พงษ์',   phone: '099-333-4444', service: 'ทำเล็บเจล',            price: 550,  date: '2025-05-04', time: '14:00', status: 'confirmed' as Status },
]

const DEMO_SLOTS_TIMES = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00']
const DEMO_DATES       = ['05-06','05-07','05-08','05-09','05-12','05-13','05-14']
const BOOKED_MAP: Record<string, string[]> = {
  '05-06': ['10:00','13:00'], '05-07': ['11:00','14:00'], '05-08': ['09:00'],
}

/* รายได้รายวัน (สัปดาห์นี้ จ–ส) */
const WEEKLY_REVENUE = [
  { day: 'จ',  date: '05-05', amount: 2890 },
  { day: 'อ',  date: '05-06', amount: 1240 },
  { day: 'พ',  date: '05-07', amount: 3750 },
  { day: 'พฤ', date: '05-08', amount: 2560 },
  { day: 'ศ',  date: '05-09', amount: 4100 },
  { day: 'ส',  date: '05-10', amount: 4610 },
]
const WEEKLY_MAX = Math.max(...WEEKLY_REVENUE.map(d => d.amount))
const WEEKLY_TOTAL = WEEKLY_REVENUE.reduce((s, d) => s + d.amount, 0)

/* บริการยอดนิยมตามรายได้ */
const TOP_SERVICES = [
  { name: 'ทำสีผม (Balayage)',    revenue: 7200, count: 6 },
  { name: 'สปาตัวทั้งตัว',        revenue: 5340, count: 6 },
  { name: 'ทำเล็บเจล',            revenue: 4400, count: 8 },
  { name: 'คลีนิกหน้า + บีบสิว',  revenue: 2940, count: 6 },
  { name: 'นวดแผนไทย',            revenue: 2800, count: 8 },
]
const TOP_MAX = TOP_SERVICES[0].revenue

type NavKey = 'overview' | 'bookings' | 'services' | 'staff' | 'revenue' | 'slots' | 'settings'
const NAV: { key: NavKey; label: string; icon: string }[] = [
  { key: 'overview', label: 'ภาพรวม',    icon: '▤'  },
  { key: 'bookings', label: 'การจอง',    icon: '📋' },
  { key: 'services', label: 'บริการ',    icon: '✂️' },
  { key: 'staff',    label: 'พนักงาน',   icon: '👤' },
  { key: 'revenue',  label: 'รายได้',    icon: '💰' },
  { key: 'slots',    label: 'ตารางเวลา', icon: '🗓' },
  { key: 'settings', label: 'ตั้งค่า',   icon: '⚙️' },
]

const STATUS_LABEL: Record<Status, string> = { pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', cancelled: 'ยกเลิก' }
const STATUS_COLOR: Record<Status, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-teal-50 text-teal-700',
  cancelled: 'bg-red-50 text-red-400',
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function DemoAdminSection() {
  const [nav,       setNav]       = useState<NavKey>('overview')
  const [services,  setServices]  = useState(INIT_SERVICES)
  const [bookings,  setBookings]  = useState(INIT_BOOKINGS)
  const [staff,     setStaff]     = useState(INIT_STAFF)
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffRole, setNewStaffRole] = useState('')
  const [addingStaff,  setAddingStaff]  = useState(false)
  const [slots,     setSlots]     = useState<Record<string, boolean[]>>(
    Object.fromEntries(DEMO_DATES.map(d => [d, DEMO_SLOTS_TIMES.map(t => !!(BOOKED_MAP[d]?.includes(t)))]))
  )
  const [selDate,   setSelDate]   = useState(DEMO_DATES[0])
  const [toast,     setToast]     = useState('')
  const [addSvc,    setAddSvc]    = useState(false)
  const [editSvcId, setEditSvcId] = useState<string|null>(null)
  const [newSvc,    setNewSvc]    = useState({ name: '', description: '', duration_minutes: 60, price: 0 })
  const [bookFilter, setBookFilter] = useState<Status|'all'>('all')
  const [settings,  setSettings]  = useState({
    shopName: 'Sabai Beauty Studio', phone: '081-234-5678', line: '@sabaibeauty',
    autoConfirm: false, advanceDays: 14, color: '#f97316',
  })
  const [revPeriod, setRevPeriod] = useState<'week'|'month'>('week')

  function showToast(msg: string) {
    setToast(msg); setTimeout(() => setToast(''), 2500)
  }

  function confirmBooking(id: string) {
    setBookings(p => p.map(b => b.id === id ? { ...b, status: 'confirmed' as Status } : b))
    showToast('✓ ยืนยันการจองแล้ว')
  }
  function cancelBooking(id: string) {
    setBookings(p => p.map(b => b.id === id ? { ...b, status: 'cancelled' as Status } : b))
    showToast('✕ ยกเลิกการจองแล้ว')
  }

  function saveService(svc: typeof newSvc & { id?: string }) {
    if (svc.id) {
      setServices(p => p.map(s => s.id === svc.id ? { ...s, ...svc } : s))
      setEditSvcId(null)
    } else {
      setServices(p => [...p, { ...svc, id: String(Date.now()), is_active: true }])
      setAddSvc(false)
    }
    setNewSvc({ name: '', description: '', duration_minutes: 60, price: 0 })
    showToast('✓ บันทึกบริการแล้ว')
  }

  function deleteService(id: string) {
    setServices(p => p.filter(s => s.id !== id)); showToast('✕ ลบบริการแล้ว')
  }

  function toggleSlot(date: string, idx: number) {
    setSlots(p => ({ ...p, [date]: p[date].map((v, i) => i === idx ? !v : v) }))
  }

  const pendingCount   = bookings.filter(b => b.status === 'pending').length
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const todayCount     = bookings.filter(b => b.date === '2025-05-06').length
  const filteredBooks  = bookFilter === 'all' ? bookings : bookings.filter(b => b.status === bookFilter)

  /* รายได้จาก confirmed เท่านั้น */
  const confirmedRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.price, 0)
  const monthRevenue     = revPeriod === 'week' ? WEEKLY_TOTAL : WEEKLY_TOTAL * 4 + 3240

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-krabbie-dark text-white text-sm font-mono px-5 py-2.5 rounded-full shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      {/* Tab nav */}
      <div className="bg-krabbie-dark border-b border-white/10 overflow-x-auto">
        <div className="flex items-center gap-1 px-3 py-2 min-w-max">
          <div className="flex items-center gap-2 pr-4 mr-2 border-r border-white/10">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-sm">🏪</div>
            <span className="font-syne text-white font-bold text-xs whitespace-nowrap">Sabai Beauty</span>
            <span className="text-[0.5rem] text-orange-400 font-mono uppercase">demo</span>
          </div>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setNav(n.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                nav === n.key ? 'bg-orange-500 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 min-h-96 p-4">

        {/* ── ภาพรวม ── */}
        {nav === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'วันนี้',     value: todayCount,          sub: 'การจอง',    color: 'text-orange-500' },
                { label: 'รอยืนยัน',  value: pendingCount,        sub: 'รายการ',    color: 'text-yellow-500' },
                { label: 'ยืนยันแล้ว',value: confirmedCount,      sub: 'รายการ',    color: 'text-teal-DEFAULT' },
                { label: 'รายได้วันนี้',value: `฿${(890+350).toLocaleString()}`, sub: 'บาท', color: 'text-green-600' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-krabbie-border p-3 text-center">
                  <div className={`font-syne font-bold text-xl ${c.color}`}>{c.value}</div>
                  <div className="text-xs text-gray-400">{c.sub}</div>
                  <div className="text-[0.6rem] text-gray-400 font-mono mt-0.5">{c.label}</div>
                </div>
              ))}
            </div>

            {/* Mini revenue bar */}
            <div className="bg-white rounded-xl border border-krabbie-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="sec-label">รายได้สัปดาห์นี้</div>
                <div className="font-syne font-bold text-green-600">{formatPrice(WEEKLY_TOTAL)}</div>
              </div>
              <div className="flex items-end gap-1.5 h-16">
                {WEEKLY_REVENUE.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-orange-500 rounded-t-sm transition-all"
                      style={{ height: `${Math.round((d.amount / WEEKLY_MAX) * 52)}px` }} />
                    <span className="text-[0.55rem] text-gray-400 font-mono">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="sec-label mb-2">การจองล่าสุด</div>
              <div className="space-y-2">
                {bookings.slice(0, 4).map(b => (
                  <div key={b.id} className="bg-white rounded-xl border border-krabbie-border px-3 py-2 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{b.name}</div>
                      <div className="text-xs text-gray-400">{b.service} · {b.date} {b.time}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono text-sm font-bold text-orange-500">{formatPrice(b.price)}</div>
                      <span className={`text-[0.6rem] font-mono px-1.5 py-0.5 rounded ${STATUS_COLOR[b.status]}`}>
                        {STATUS_LABEL[b.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── การจอง ── */}
        {nav === 'bookings' && (
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
                <button key={f} onClick={() => setBookFilter(f)}
                  className={`flex-shrink-0 text-xs font-mono px-3 py-1 rounded-full border transition-all ${
                    bookFilter === f ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-krabbie-border hover:border-orange-300'
                  }`}>
                  {f === 'all' ? `ทั้งหมด (${bookings.length})` : STATUS_LABEL[f]}
                  {f === 'pending' && pendingCount > 0 && (
                    <span className="ml-1 bg-white/30 px-1 rounded-full">{pendingCount}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredBooks.map(b => (
                <div key={b.id} className="bg-white rounded-xl border border-krabbie-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm">{b.name}</div>
                      <div className="text-xs text-gray-400">{b.phone}</div>
                      <div className="font-mono text-xs text-gray-400 mt-0.5">{b.date} · {b.time}</div>
                      <div className="text-xs text-orange-500 mt-0.5">{b.service}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono font-bold text-sm text-orange-500 mb-1">{formatPrice(b.price)}</div>
                      <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded ${STATUS_COLOR[b.status]}`}>
                        {STATUS_LABEL[b.status]}
                      </span>
                    </div>
                  </div>
                  {b.status === 'pending' && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                      <button onClick={() => confirmBooking(b.id)}
                        className="flex-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-lg py-1.5 font-semibold hover:bg-teal-100 transition-colors">
                        ✓ ยืนยัน
                      </button>
                      <button onClick={() => cancelBooking(b.id)}
                        className="flex-1 text-xs bg-red-50 text-red-500 border border-red-200 rounded-lg py-1.5 font-semibold hover:bg-red-100 transition-colors">
                        ✕ ยกเลิก
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {filteredBooks.length === 0 && (
                <div className="bg-white rounded-xl border border-krabbie-border text-center py-8 text-gray-400 text-sm">ไม่มีการจอง</div>
              )}
            </div>
          </div>
        )}

        {/* ── บริการ ── */}
        {nav === 'services' && (
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.id}>
                {editSvcId === s.id ? (
                  <ServiceFormInline
                    value={{ name: s.name, description: s.description, duration_minutes: s.duration_minutes, price: s.price }}
                    onSave={v => saveService({ ...v, id: s.id })}
                    onCancel={() => setEditSvcId(null)}
                  />
                ) : (
                  <div className="bg-white rounded-xl border border-krabbie-border px-3 py-2 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{s.name}</div>
                      {s.description && <div className="text-xs text-gray-400 truncate">{s.description}</div>}
                      <div className="font-mono text-xs text-gray-400 mt-0.5">⏱ {formatDuration(s.duration_minutes)}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-syne font-bold text-orange-500 text-sm">{formatPrice(s.price)}</div>
                      <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-teal-50 text-teal-700">เปิด</span>
                    </div>
                    <div className="flex flex-col gap-0.5 flex-shrink-0 text-right">
                      <button onClick={() => { setEditSvcId(s.id); setNewSvc({ name: s.name, description: s.description || '', duration_minutes: s.duration_minutes, price: s.price }) }}
                        className="text-xs text-orange-500 hover:underline">แก้ไข</button>
                      <button onClick={() => deleteService(s.id)} className="text-xs text-red-400 hover:underline">ลบ</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {addSvc ? (
              <ServiceFormInline value={newSvc} onSave={v => saveService(v)} onCancel={() => setAddSvc(false)} />
            ) : (
              <button onClick={() => setAddSvc(true)} className="btn-outline w-full text-sm">+ เพิ่มบริการ</button>
            )}
          </div>
        )}

        {/* ── พนักงาน ── */}
        {nav === 'staff' && (
          <div className="space-y-3">
            {staff.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-krabbie-border p-3 flex items-center gap-3">
                <img src={s.avatar} alt={s.name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{s.name}</div>
                  <div className="text-xs text-gray-400">{s.role}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-orange-400 text-xs font-mono">{'★'.repeat(Math.floor(s.rating))} {s.rating.toFixed(1)}</span>
                    <span className="text-[0.65rem] text-gray-400 font-mono">· {s.exp}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setStaff(p => p.filter(x => x.id !== s.id)); showToast('✕ ลบพนักงานแล้ว') }}
                  className="text-xs text-red-400 hover:underline flex-shrink-0">ลบ</button>
              </div>
            ))}

            {addingStaff ? (
              <div className="bg-white rounded-xl border border-orange-300 p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">ชื่อพนักงาน</label>
                  <input className="input text-sm" placeholder="เช่น พี่นิด" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">ตำแหน่ง / ความเชี่ยวชาญ</label>
                  <input className="input text-sm" placeholder="เช่น ช่างเล็บ / ผิวหน้า" value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={!newStaffName.trim()}
                    onClick={() => {
                      setStaff(p => [...p, { id: String(Date.now()), name: newStaffName, role: newStaffRole || 'พนักงาน', exp: 'ใหม่', rating: 5.0, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newStaffName)}&background=f97316&color=fff&size=80` }])
                      setNewStaffName(''); setNewStaffRole(''); setAddingStaff(false); showToast('✓ เพิ่มพนักงานแล้ว')
                    }}
                    className="btn-primary flex-1 text-sm disabled:opacity-40">เพิ่ม</button>
                  <button onClick={() => setAddingStaff(false)} className="btn-outline flex-1 text-sm">ยกเลิก</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingStaff(true)} className="btn-outline w-full text-sm">+ เพิ่มพนักงาน</button>
            )}
          </div>
        )}

        {/* ── รายได้ ── */}
        {nav === 'revenue' && (
          <div className="space-y-4">
            {/* Period toggle */}
            <div className="flex gap-2">
              {(['week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setRevPeriod(p)}
                  className={`text-xs font-mono px-4 py-1.5 rounded-full border transition-all ${
                    revPeriod === p ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-krabbie-border hover:border-orange-300'
                  }`}>
                  {p === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้'}
                </button>
              ))}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-krabbie-border p-4 col-span-2">
                <div className="text-xs text-gray-400 mb-1 font-mono">รายได้รวม</div>
                <div className="font-syne font-bold text-3xl text-green-600">{formatPrice(monthRevenue)}</div>
                <div className="text-xs text-green-500 mt-1 font-mono">↑ +12% จากสัปดาห์ก่อน</div>
              </div>
              <div className="bg-white rounded-xl border border-krabbie-border p-3 text-center">
                <div className="font-syne font-bold text-xl text-orange-500">{bookings.filter(b => b.status === 'confirmed').length}</div>
                <div className="text-xs text-gray-400">การจองที่สำเร็จ</div>
              </div>
              <div className="bg-white rounded-xl border border-krabbie-border p-3 text-center">
                <div className="font-syne font-bold text-xl text-orange-500">{formatPrice(Math.round(confirmedRevenue / Math.max(confirmedCount, 1)))}</div>
                <div className="text-xs text-gray-400">เฉลี่ย/การจอง</div>
              </div>
            </div>

            {/* Bar chart */}
            <div className="bg-white rounded-xl border border-krabbie-border p-4">
              <div className="sec-label mb-3">รายได้รายวัน (สัปดาห์นี้)</div>
              <div className="flex items-end gap-2 h-24">
                {WEEKLY_REVENUE.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[0.55rem] text-gray-400 font-mono">{formatPrice(d.amount).replace('฿','')}</div>
                    <div className="w-full bg-orange-500 rounded-t transition-all"
                      style={{ height: `${Math.round((d.amount / WEEKLY_MAX) * 52)}px` }} />
                    <span className="text-[0.6rem] text-gray-500 font-mono">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top services */}
            <div className="bg-white rounded-xl border border-krabbie-border p-4">
              <div className="sec-label mb-3">บริการยอดนิยม (ตามรายได้)</div>
              <div className="space-y-3">
                {TOP_SERVICES.map((s, i) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold flex items-center gap-1.5">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white ${
                          i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-orange-400' : 'bg-gray-300'
                        }`}>{i + 1}</span>
                        {s.name}
                      </span>
                      <span className="font-mono text-gray-500">{s.count} ครั้ง · <span className="text-green-600 font-bold">{formatPrice(s.revenue)}</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full transition-all"
                        style={{ width: `${Math.round((s.revenue / TOP_MAX) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-xl border border-krabbie-border p-4">
              <div className="sec-label mb-3">รายการที่สำเร็จล่าสุด</div>
              <div className="space-y-2">
                {bookings.filter(b => b.status === 'confirmed').map(b => (
                  <div key={b.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-semibold text-sm">{b.name}</div>
                      <div className="text-xs text-gray-400">{b.service} · {b.date}</div>
                    </div>
                    <div className="font-mono font-bold text-green-600">{formatPrice(b.price)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between font-semibold text-sm">
                <span>รวมที่แสดง</span>
                <span className="font-mono text-green-600">{formatPrice(confirmedRevenue)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── ตารางเวลา ── */}
        {nav === 'slots' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-krabbie-border p-4">
              <div className="sec-label mb-3">สร้าง Slots ล่วงหน้า</div>
              <div className="flex items-center gap-3">
                <select className="input w-32 text-sm">
                  {[7,14,30,60].map(d => <option key={d} value={d}>{d} วัน</option>)}
                </select>
                <button onClick={() => showToast('✓ สร้าง 98 slots แล้ว')} className="btn-primary text-sm">สร้าง Slots</button>
              </div>
              <p className="text-xs text-gray-400 mt-2">ข้ามวันอาทิตย์ · ไม่สร้างซ้ำ · 09:00–18:00</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {DEMO_DATES.map(d => (
                <button key={d} onClick={() => setSelDate(d)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                    selDate === d ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-krabbie-border hover:border-orange-300'
                  }`}>
                  {d}
                </button>
              ))}
            </div>

            <div>
              <div className="sec-label mb-3">2025-{selDate}</div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_SLOTS_TIMES.map((t, i) => {
                  const booked = slots[selDate]?.[i] ?? false
                  return (
                    <button key={t} onClick={() => toggleSlot(selDate, i)}
                      className={`relative h-12 rounded-xl text-sm font-mono font-bold border-2 transition-all overflow-hidden ${
                        booked ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-white border-krabbie-border hover:border-orange-400 text-gray-700'
                      }`}>
                      {t}
                      {booked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-red-500 border border-red-400 text-[0.5rem] font-black px-1 py-0.5 rounded rotate-[-12deg] bg-white/90">จองแล้ว</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">กดที่ slot เพื่อ block/unblock</p>
            </div>
          </div>
        )}

        {/* ── ตั้งค่า ── */}
        {nav === 'settings' && (
          <div className="space-y-4 max-w-md">
            <div className="bg-white rounded-xl border border-krabbie-border p-4 space-y-3">
              <div className="sec-label mb-1">ข้อมูลร้าน</div>
              <div>
                <label className="block text-xs font-semibold mb-1">ชื่อร้าน</label>
                <input className="input text-sm" value={settings.shopName} onChange={e => setSettings(p => ({ ...p, shopName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">เบอร์โทร</label>
                <input className="input text-sm" value={settings.phone} onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">LINE OA</label>
                <input className="input text-sm" value={settings.line} onChange={e => setSettings(p => ({ ...p, line: e.target.value }))} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-krabbie-border p-4 space-y-3">
              <div className="sec-label mb-1">การจอง</div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setSettings(p => ({ ...p, autoConfirm: !p.autoConfirm }))}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${settings.autoConfirm ? 'bg-orange-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.autoConfirm ? 'left-5' : 'left-1'}`} />
                </div>
                <div>
                  <div className="text-sm font-semibold">ยืนยันอัตโนมัติ</div>
                  <div className="text-xs text-gray-400">จองแล้วยืนยันทันที ไม่ต้องกดเอง</div>
                </div>
              </label>
              <div>
                <label className="block text-xs font-semibold mb-1">จองล่วงหน้าสูงสุด (วัน)</label>
                <select className="input text-sm w-32" value={settings.advanceDays} onChange={e => setSettings(p => ({ ...p, advanceDays: Number(e.target.value) }))}>
                  {[7,14,30,60].map(d => <option key={d} value={d}>{d} วัน</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-krabbie-border p-4">
              <div className="sec-label mb-2">สีหลัก</div>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.color} onChange={e => setSettings(p => ({ ...p, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-krabbie-border" />
                <span className="font-mono text-sm text-gray-500">{settings.color}</span>
                <span className="text-xs text-gray-400">สีปุ่มและ accent ทั้งเว็บ</span>
              </div>
            </div>

            <button onClick={() => showToast('✓ บันทึกการตั้งค่าแล้ว')} className="btn-primary w-full py-3 text-sm">
              บันทึกการตั้งค่า
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

/* ─── Inline service form ─────────────────────────────────────────────────── */

interface SvcFormValue { name: string; description: string; duration_minutes: number; price: number }
function ServiceFormInline({ value, onSave, onCancel }: {
  value: SvcFormValue; onSave: (v: SvcFormValue) => void; onCancel: () => void
}) {
  const [v, setV] = useState(value)
  return (
    <div className="bg-white rounded-xl border border-orange-300 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold mb-1">ชื่อบริการ</label>
          <input className="input text-sm" placeholder="เช่น นวดแผนไทย" required value={v.name} onChange={e => setV(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold mb-1">คำอธิบาย</label>
          <input className="input text-sm" placeholder="รายละเอียดบริการ" value={v.description} onChange={e => setV(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">ระยะเวลา (นาที)</label>
          <input className="input text-sm" type="number" min={15} step={15} value={v.duration_minutes} onChange={e => setV(p => ({ ...p, duration_minutes: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">ราคา (฿)</label>
          <input className="input text-sm" type="number" min={0} value={v.price} onChange={e => setV(p => ({ ...p, price: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(v)} disabled={!v.name.trim()} className="btn-primary flex-1 text-sm disabled:opacity-40">บันทึก</button>
        <button onClick={onCancel} className="btn-outline flex-1 text-sm">ยกเลิก</button>
      </div>
    </div>
  )
}
