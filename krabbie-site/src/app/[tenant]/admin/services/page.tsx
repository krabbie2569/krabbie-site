'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────────
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
  sort_order: number
}

type ServiceItem = {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  is_active: boolean
  sort_order: number
}

const BLANK_RENTAL: Omit<RentalItem, 'id'> = {
  name: '', description: '', category: 'camera',
  price_per_day: 0, hourly_pricing: [], daily_pricing: [],
  images: [], is_available: true, sort_order: 0,
}

const BLANK_SERVICE: Omit<ServiceItem, 'id'> = {
  name: '', description: '', duration_minutes: 60,
  price: 0, is_active: true, sort_order: 0,
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminServicesPage() {
  const params       = useParams()
  const tenantSlug   = params.tenant as string

  const [tenant,      setTenant]      = useState<any>(null)
  const [items,       setItems]       = useState<RentalItem[]>([])
  const [services,    setServices]    = useState<ServiceItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState<'add' | 'edit' | null>(null)
  const [editTarget,  setEditTarget]  = useState<any>(null)
  const [saving,      setSaving]      = useState(false)
  const [deleteId,    setDeleteId]    = useState<string | null>(null)

  // Rental item form
  const [rForm, setRForm] = useState<Omit<RentalItem,'id'>>(BLANK_RENTAL)
  const [rHourlyRaw, setRHourlyRaw] = useState('')
  const [rDailyRaw,  setRDailyRaw]  = useState('')

  // Service form
  const [sForm, setSForm] = useState<Omit<ServiceItem,'id'>>(BLANK_SERVICE)

  const supabase = createClient() as any
  const isRental = tenant?.template_id === 'booking-rental'

  async function loadTenant() {
    const { data } = await supabase.from('tenants').select('*').eq('slug', tenantSlug).single()
    setTenant(data)
    return data
  }

  async function loadItems(t: any) {
    if (t?.template_id === 'booking-rental') {
      const { data } = await supabase.from('rental_items').select('*').eq('tenant_id', t.id).order('sort_order')
      setItems(data || [])
    } else {
      const { data } = await supabase.from('services').select('*').eq('tenant_id', t.id).order('sort_order')
      setServices(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTenant().then(t => { if (t) loadItems(t) })
  }, [tenantSlug])

  function openAdd() {
    if (isRental) { setRForm(BLANK_RENTAL); setRHourlyRaw(''); setRDailyRaw('') }
    else          { setSForm(BLANK_SERVICE) }
    setEditTarget(null)
    setModal('add')
  }

  function openEdit(item: any) {
    if (isRental) {
      setRForm({ name: item.name, description: item.description||'', category: item.category, price_per_day: item.price_per_day, hourly_pricing: item.hourly_pricing||[], daily_pricing: item.daily_pricing||[], images: item.images||[], is_available: item.is_available, sort_order: item.sort_order })
      setRHourlyRaw((item.hourly_pricing||[]).map((h:any)=>`${h.hours}h=${h.price}`).join(', '))
      setRDailyRaw((item.daily_pricing||[]).map((d:any)=>`${d.days}d=${d.price}`).join(', '))
    } else {
      setSForm({ name: item.name, description: item.description||'', duration_minutes: item.duration_minutes, price: item.price, is_active: item.is_active, sort_order: item.sort_order })
    }
    setEditTarget(item)
    setModal('edit')
  }

  function parseHourly(raw: string) {
    return raw.split(',').map(s=>s.trim()).filter(Boolean).map(s=>{
      const m = s.match(/(\d+)h=(\d+)/)
      return m ? { hours: Number(m[1]), price: Number(m[2]) } : null
    }).filter(Boolean) as { hours:number; price:number }[]
  }

  function parseDaily(raw: string) {
    return raw.split(',').map(s=>s.trim()).filter(Boolean).map(s=>{
      const m = s.match(/(\d+)d=(\d+)/)
      return m ? { days: Number(m[1]), price: Number(m[2]) } : null
    }).filter(Boolean) as { days:number; price:number }[]
  }

  async function handleSave() {
    if (!tenant) return
    setSaving(true)
    if (isRental) {
      const payload = { ...rForm, tenant_id: tenant.id, hourly_pricing: parseHourly(rHourlyRaw), daily_pricing: parseDaily(rDailyRaw) }
      if (modal === 'add') {
        await supabase.from('rental_items').insert([payload])
      } else {
        await supabase.from('rental_items').update(payload).eq('id', editTarget.id)
      }
      loadItems(tenant)
    } else {
      const payload = { ...sForm, tenant_id: tenant.id }
      if (modal === 'add') {
        await supabase.from('services').insert([payload])
      } else {
        await supabase.from('services').update(payload).eq('id', editTarget.id)
      }
      loadItems(tenant)
    }
    setSaving(false)
    setModal(null)
  }

  async function handleDelete(id: string) {
    if (!tenant) return
    if (isRental) await supabase.from('rental_items').delete().eq('id', id)
    else          await supabase.from('services').delete().eq('id', id)
    setDeleteId(null)
    loadItems(tenant)
  }

  async function toggleAvailable(item: any) {
    if (isRental) {
      await supabase.from('rental_items').update({ is_available: !item.is_available }).eq('id', item.id)
    } else {
      await supabase.from('services').update({ is_active: !item.is_active }).eq('id', item.id)
    }
    loadItems(tenant)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400 font-mono text-sm">กำลังโหลด...</div>
    </div>
  )

  const listItems = isRental ? items : services

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* HEADER */}
      <div className="bg-krabbie-dark px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${tenantSlug}`} className="text-gray-400 hover:text-white text-sm font-mono transition-colors">← หน้าร้าน</Link>
          <span className="text-gray-600">|</span>
          <span className="font-syne text-white font-bold">{tenant?.name}</span>
          <span className="font-mono text-gray-500 text-xs">/ {isRental ? 'สินค้า' : 'บริการ'}</span>
        </div>
      </div>

      {/* QUICK NAV */}
      <div className="bg-white border-b border-krabbie-border px-4 py-2 flex gap-2 overflow-x-auto">
        {[
          { href: `/${tenantSlug}/admin`,          label: '📊 ภาพรวม'    },
          { href: `/${tenantSlug}/admin/services`,  label: isRental ? '📦 สินค้า' : '🛠️ บริการ', active: true },
          { href: `/${tenantSlug}/admin/settings`,  label: '⚙️ ตั้งค่า'  },
          { href: `/${tenantSlug}/admin/billing`,   label: '💳 ชำระเงิน' },
        ].map(({ href, label, active }: any) => (
          <Link key={href} href={href}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              active ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'
            }`}>{label}</Link>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-4">
          <div className="sec-label">{isRental ? 'สินค้าให้เช่า' : 'บริการทั้งหมด'}</div>
          <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm">
            + เพิ่ม{isRental ? 'สินค้า' : 'บริการ'}
          </button>
        </div>

        {listItems.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">{isRental ? '📦' : '🛠️'}</div>
            <p className="text-gray-400 text-sm mb-4">ยังไม่มี{isRental ? 'สินค้า' : 'บริการ'}</p>
            <button onClick={openAdd} className="btn-primary px-6 py-2 text-sm">+ เพิ่มเลย</button>
          </div>
        ) : (
          <div className="space-y-2">
            {listItems.map((item: any) => (
              <div key={item.id} className="card flex items-center gap-3 py-3">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-krabbie-border" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-xl">
                    {isRental ? (item.category === 'camera' ? '📷' : '👕') : '🛠️'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{item.name}</div>
                  {item.description && <div className="text-xs text-gray-400 truncate">{item.description}</div>}
                  <div className="font-mono text-xs text-orange-500 mt-0.5">
                    {isRental
                      ? `฿${Number(item.price_per_day).toLocaleString()}/วัน${(item.hourly_pricing||[]).length ? ` · ${item.hourly_pricing.length} ราคาชม.` : ''}`
                      : `฿${Number(item.price).toLocaleString()} · ${item.duration_minutes} นาที`}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleAvailable(item)}
                    className={`text-xs font-mono px-2 py-0.5 rounded transition-colors ${
                      (isRental ? item.is_available : item.is_active)
                        ? 'badge-live cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-pointer hover:bg-gray-200'
                    }`}>
                    {(isRental ? item.is_available : item.is_active) ? 'เปิด' : 'ปิด'}
                  </button>
                  <button onClick={() => openEdit(item)} className="text-xs text-gray-500 hover:text-orange-500 transition-colors px-2 py-1">แก้ไข</button>
                  <button onClick={() => setDeleteId(item.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ─────────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-krabbie-border flex justify-between items-center">
              <h3 className="font-syne font-bold text-lg">
                {modal === 'add' ? '+ เพิ่ม' : 'แก้ไข'}{isRental ? 'สินค้า' : 'บริการ'}
              </h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {isRental ? (
                <>
                  <Field label="ชื่อสินค้า *" value={rForm.name} onChange={v => setRForm(p=>({...p,name:v}))} placeholder="เช่น Sony ZV-1F" />
                  <Field label="คำอธิบาย" value={rForm.description||''} onChange={v => setRForm(p=>({...p,description:v}))} placeholder="ข้อมูลเพิ่มเติม" />
                  <div>
                    <label className="block text-sm font-semibold mb-1">ประเภทสินค้า</label>
                    <select value={rForm.category} onChange={e => setRForm(p=>({...p,category:e.target.value}))} className="input">
                      <option value="camera">📷 กล้อง</option>
                      <option value="clothes">👕 เสื้อผ้า</option>
                      <option value="other">📦 อื่นๆ</option>
                    </select>
                  </div>
                  <Field label="ราคาต่อวัน (฿) *" value={String(rForm.price_per_day)} onChange={v => setRForm(p=>({...p,price_per_day:Number(v)||0}))} placeholder="300" type="number" />
                  <div>
                    <label className="block text-sm font-semibold mb-1">ราคารายชั่วโมง</label>
                    <input className="input" value={rHourlyRaw} onChange={e => setRHourlyRaw(e.target.value)} placeholder="4h=250, 8h=350" />
                    <p className="text-xs text-gray-400 mt-1">รูปแบบ: 4h=250, 8h=350 (ชั่วโมง=ราคา)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">ราคาแพ็กเกจรายวัน</label>
                    <input className="input" value={rDailyRaw} onChange={e => setRDailyRaw(e.target.value)} placeholder="3d=750, 7d=1600" />
                    <p className="text-xs text-gray-400 mt-1">รูปแบบ: 3d=750, 7d=1600 (วัน=ราคา)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">URL รูปภาพ (คั่นด้วย ,)</label>
                    <textarea className="input min-h-[80px]" value={rForm.images.join('\n')}
                      onChange={e => setRForm(p=>({...p,images:e.target.value.split('\n').map(s=>s.trim()).filter(Boolean)}))}
                      placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg" />
                    <p className="text-xs text-gray-400 mt-1">ใส่ URL รูป 1 บรรทัดต่อ 1 รูป</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={rForm.is_available} onChange={e => setRForm(p=>({...p,is_available:e.target.checked}))} className="w-4 h-4 accent-orange-500" />
                    <span className="text-sm font-semibold">เปิดให้เช่า</span>
                  </label>
                </>
              ) : (
                <>
                  <Field label="ชื่อบริการ *" value={sForm.name} onChange={v => setSForm(p=>({...p,name:v}))} placeholder="เช่น นวดแผนไทย" />
                  <Field label="คำอธิบาย" value={sForm.description||''} onChange={v => setSForm(p=>({...p,description:v}))} placeholder="รายละเอียดบริการ" />
                  <Field label="ระยะเวลา (นาที) *" value={String(sForm.duration_minutes)} onChange={v => setSForm(p=>({...p,duration_minutes:Number(v)||60}))} placeholder="60" type="number" />
                  <Field label="ราคา (฿) *" value={String(sForm.price)} onChange={v => setSForm(p=>({...p,price:Number(v)||0}))} placeholder="350" type="number" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sForm.is_active} onChange={e => setSForm(p=>({...p,is_active:e.target.checked}))} className="w-4 h-4 accent-orange-500" />
                    <span className="text-sm font-semibold">เปิดให้จอง</span>
                  </label>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-krabbie-border flex gap-3">
              <button onClick={() => setModal(null)} className="btn-outline flex-1">ยกเลิก</button>
              <button
                disabled={saving || !(isRental ? rForm.name : sForm.name)}
                onClick={handleSave}
                className="btn-primary flex-1 disabled:opacity-40">
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ───────────────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="text-3xl mb-3">🗑️</div>
            <p className="font-semibold mb-2">ลบรายการนี้?</p>
            <p className="text-xs text-gray-400 mb-5">ไม่สามารถกู้คืนได้</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-outline flex-1 py-2 text-sm">ยกเลิก</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 text-sm rounded-krabbie bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input type={type} className="input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}
