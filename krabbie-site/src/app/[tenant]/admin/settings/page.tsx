'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AdminSettingsPage() {
  const params     = useParams()
  const tenantSlug = params.tenant as string
  const supabase   = createClient() as any

  const [tenant,  setTenant]  = useState<any>(null)
  const [form,    setForm]    = useState({ name: '', subtitle: '', lineUrl: '', phone: '', address: '' })
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('tenants').select('*').eq('slug', tenantSlug).single()
      .then(({ data }: any) => {
        if (!data) return
        setTenant(data)
        const s = data.settings || {}
        setForm({
          name:     data.name || '',
          subtitle: s.subtitle || '',
          lineUrl:  s.lineUrl  || '',
          phone:    s.phone    || '',
          address:  s.address  || '',
        })
        setLoading(false)
      })
  }, [tenantSlug])

  async function handleSave() {
    if (!tenant) return
    setSaving(true)
    const newSettings = { ...(tenant.settings || {}), subtitle: form.subtitle, lineUrl: form.lineUrl, phone: form.phone, address: form.address }
    await supabase.from('tenants').update({ name: form.name, settings: newSettings }).eq('id', tenant.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const isRental = tenant?.template_id === 'booking-rental'

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400 font-mono text-sm">กำลังโหลด...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      <div className="bg-krabbie-dark px-4 py-3 flex items-center gap-3">
        <Link href={`/${tenantSlug}`} className="text-gray-400 hover:text-white text-sm font-mono transition-colors">← หน้าร้าน</Link>
        <span className="text-gray-600">|</span>
        <span className="font-syne text-white font-bold">{tenant?.name}</span>
        <span className="font-mono text-gray-500 text-xs">/ ตั้งค่า</span>
      </div>

      <div className="bg-white border-b border-krabbie-border px-4 py-2 flex gap-2 overflow-x-auto">
        {[
          { href: `/${tenantSlug}/admin`,          label: '📊 ภาพรวม'   },
          { href: `/${tenantSlug}/admin/services`,  label: isRental ? '📦 สินค้า' : '🛠️ บริการ' },
          { href: `/${tenantSlug}/admin/settings`,  label: '⚙️ ตั้งค่า', active: true },
          { href: `/${tenantSlug}/admin/billing`,   label: '💳 ชำระเงิน'},
        ].map(({ href, label, active }: any) => (
          <Link key={href} href={href}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              active ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'
            }`}>{label}</Link>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="sec-label mb-4">ตั้งค่าร้าน</div>

        {[
          { key: 'name',     label: 'ชื่อร้าน *',            ph: 'ร้านของฉัน' },
          { key: 'subtitle', label: 'คำอธิบายสั้น',           ph: 'Camera Korat · Rental' },
          { key: 'phone',    label: 'เบอร์โทร / Line ID',     ph: '081-234-5678 หรือ @lineid' },
          { key: 'lineUrl',  label: 'LINE URL (ลูกค้าแอดได้)', ph: 'https://line.me/ti/p/...' },
          { key: 'address',  label: 'ที่อยู่',                ph: '123 ถ.สีลม กรุงเทพ' },
        ].map(({ key, label, ph }) => (
          <div key={key}>
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <input className="input" value={(form as any)[key]} placeholder={ph}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
          </div>
        ))}

        <div className="card p-4 text-sm text-gray-500 space-y-1">
          <div className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-2">ข้อมูลแผน</div>
          <div className="flex justify-between"><span>Template</span><span className="font-mono text-orange-500">{tenant?.template_id}</span></div>
          <div className="flex justify-between"><span>แผน</span><span className="font-mono">{tenant?.plan}</span></div>
          <div className="flex justify-between"><span>Subdomain</span><span className="font-mono text-orange-500">{tenant?.slug}.krabbie.com</span></div>
          {tenant?.trial_ends_at && (
            <div className="flex justify-between"><span>ทดลองถึง</span><span className="font-mono">{new Date(tenant.trial_ends_at).toLocaleDateString('th-TH')}</span></div>
          )}
        </div>

        <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary w-full disabled:opacity-40">
          {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกแล้ว!' : 'บันทึกการตั้งค่า'}
        </button>
      </div>
    </div>
  )
}
