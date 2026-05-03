'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sanitizeSlug, isValidSlug, shopUrl } from '@/lib/utils'

const TEMPLATES = [
  { id: 'booking-service', name: 'จองบริการ', emoji: '📅', desc: 'นวด · สปา · ทำเล็บ · คลีนิก', color: '#ff6b00' },
  { id: 'booking-rental',  name: 'เช่าสินค้า', emoji: '📷', desc: 'กล้อง · เสื้อผ้า · อุปกรณ์',   color: '#E91E8C' },
  { id: 'shop',            name: 'ร้านค้า',    emoji: '🛍️', desc: 'สินค้า · ตะกร้า · ออเดอร์',   color: '#10B981' },
  { id: 'qr-menu',         name: 'QR เมนู',    emoji: '🍜', desc: 'เมนูอาหาร · QR · ร้านอาหาร', color: '#F59E0B' },
]

export default function NewShopPage() {
  const router = useRouter()
  const [selected, setSelected]   = useState<string | null>(null)
  const [shopName, setShopName]   = useState('')
  const [slug, setSlug]           = useState('')
  const [phone, setPhone]         = useState('')
  const [slugError, setSlugError] = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [scale, setScale]         = useState(0.65)
  const railRef = useRef<HTMLDivElement>(null)

  const template = TEMPLATES.find(t => t.id === selected)

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setScale(entry.contentRect.width / 4 / 390)
      }
    })
    ro.observe(rail)
    return () => ro.disconnect()
  }, [])

  function handleNameChange(val: string) {
    setShopName(val)
    if (!slug) setSlug(sanitizeSlug(val))
  }
  function handleSlugChange(val: string) {
    const clean = sanitizeSlug(val)
    setSlug(clean)
    setSlugError(clean && !isValidSlug(clean) ? 'ใช้ตัวอักษรพิมพ์เล็กและตัวเลขเท่านั้น' : '')
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (slugError || !selected) return
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/shops/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ shopName, slug, templateId: selected, ownerPhone: phone }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'เกิดข้อผิดพลาด'); return }
      router.push(`/${json.data.slug}/admin`)
    } catch {
      setError('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#0d0d0d', overflow: 'hidden' }}>

      {/* NAV */}
      <div style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, zIndex: 30 }}>
        <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', textDecoration: 'none' }}>← Dashboard</Link>
        <span style={{ color: 'rgba(255,255,255,0.12)' }}>/</span>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Syne, sans-serif' }}>เลือก Template</span>
      </div>

      {/* STAGE */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* ── BANNER RAIL — always fills full stage, never shrinks ── */}
        <div ref={railRef} style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {TEMPLATES.map(t => {
            const isSelected = selected === t.id
            const isDimmed   = !!selected && !isSelected
            return (
              <div key={t.id} style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.04)' }}>

                {/* IFRAME — pointer events ON so user can scroll */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '390px', height: '844px', transformOrigin: 'top left', transform: `scale(${scale})`, pointerEvents: 'auto' }}>
                  <iframe src={`/demo/${t.id}`} style={{ width: '390px', height: '844px', border: 'none', display: 'block' }} title={t.name} loading="lazy" />
                </div>

                {/* DIM OVERLAY — only when a different template is selected */}
                <div style={{ position: 'absolute', inset: 0, background: isDimmed ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)', transition: 'background 0.35s', pointerEvents: 'none', zIndex: 2 }} />

                {/* CLICK INTERCEPTOR — only on NON-selected, so selected can scroll */}
                {!isSelected && (
                  <div
                    style={{ position: 'absolute', inset: 0, zIndex: 3, cursor: 'pointer' }}
                    onClick={() => setSelected(t.id)}
                  />
                )}

                {/* TOP GLOW when selected */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: isSelected ? t.color : 'transparent', boxShadow: isSelected ? `0 0 28px 6px ${t.color}` : 'none', transition: 'background 0.35s, box-shadow 0.35s', pointerEvents: 'none', zIndex: 4 }} />

                {/* INSET BORDER when selected */}
                {isSelected && (
                  <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 2px ${t.color}99`, pointerEvents: 'none', zIndex: 4 }} />
                )}

                {/* BOTTOM LABEL */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '48px 12px 18px', background: 'linear-gradient(0deg, rgba(0,0,0,0.88) 0%, transparent 100%)', textAlign: 'center', pointerEvents: 'none', zIndex: 5 }}>
                  <span style={{ display: 'inline-block', background: isSelected ? t.color : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: 'white', padding: '6px 18px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700, transition: 'background 0.3s', boxShadow: isSelected ? `0 4px 20px ${t.color}66` : 'none' }}>
                    {t.name}
                  </span>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.68rem', marginTop: '4px' }}>{t.desc}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── FORM OVERLAY — slides over banners from right ── */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          display: 'flex',
          transform: selected ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.42s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 20,
          pointerEvents: selected ? 'auto' : 'none',
        }}>

          {/* MINI SWITCHER STRIP */}
          <div style={{ width: '72px', background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '16px 8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.55rem', fontFamily: 'monospace', letterSpacing: '2px', textAlign: 'center', marginBottom: '2px' }}>สลับ</div>
            {TEMPLATES.filter(t => t.id !== selected).map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelected(t.id)}
                style={{ width: '52px', padding: '8px 4px 6px', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}
                onMouseEnter={e => { const b = e.currentTarget; b.style.background = `${t.color}22`; b.style.borderColor = `${t.color}88` }}
                onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'rgba(255,255,255,0.03)'; b.style.borderColor = 'rgba(255,255,255,0.07)' }}
              >
                <span style={{ fontSize: '1.25rem' }}>{t.emoji}</span>
                <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.2, fontFamily: 'Sarabun, sans-serif' }}>{t.name}</span>
              </button>
            ))}
          </div>

          {/* FORM PANEL */}
          <div style={{ width: '310px', background: 'white', borderLeft: template ? `3px solid ${template.color}` : '3px solid #ff6b00', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selected && template && (
              <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: template.color, color: 'white', padding: '4px 13px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '12px', boxShadow: `0 4px 14px ${template.color}44` }}>
                    ✓ {template.name}
                  </div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#1a0f00', margin: 0 }}>ตั้งค่าร้านของคุณ</h2>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '4px' }}>กรอกข้อมูลแล้วเว็บพร้อมใช้ทันที</p>
                </div>

                {error && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.75rem', borderRadius: '10px', padding: '9px 13px', fontFamily: 'monospace' }}>
                    {error}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px', color: '#374151' }}>ชื่อร้าน *</label>
                  <input className="input" placeholder="เช่น ร้านนวดสบาย" required value={shopName} onChange={e => handleNameChange(e.target.value)} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px', color: '#374151' }}>URL ร้าน *</label>
                  <div className="flex items-center gap-1 bg-gray-50 border-2 border-krabbie-border rounded-krabbie px-3 py-2 focus-within:border-orange-400 transition-colors">
                    <span className="font-mono text-xs text-gray-400 flex-shrink-0">/</span>
                    <input className="flex-1 bg-transparent outline-none font-mono text-sm" placeholder="shop-name" value={slug} onChange={e => handleSlugChange(e.target.value)} />
                  </div>
                  {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
                  {slug && !slugError && <p className="text-teal-dark text-xs mt-1 font-mono">✓ {shopUrl(slug)}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px', color: '#374151' }}>เบอร์โทร / Line ID</label>
                  <input className="input" placeholder="0812345678 หรือ @lineid" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="submit"
                    disabled={loading || !shopName || !slug || !!slugError}
                    className="btn-primary w-full py-3 disabled:opacity-40"
                    style={{ background: template.color, borderColor: template.color, fontSize: '0.95rem' }}
                  >
                    {loading ? 'กำลังสร้าง...' : 'สร้างร้าน →'}
                  </button>
                  <button type="button" onClick={() => setSelected(null)}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.75rem', cursor: 'pointer', padding: '6px', fontFamily: 'Sarabun, sans-serif' }}>
                    ✕ ปิด
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* HINT */}
        {!selected && (
          <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', color: 'rgba(255,255,255,0.4)', padding: '8px 20px', borderRadius: '100px', fontSize: '0.72rem', fontFamily: 'monospace', letterSpacing: '1px' }}>
              คลิกเพื่อเลือก template
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
