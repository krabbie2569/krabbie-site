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
  const [selected, setSelected]       = useState<string | null>(null)
  const [overlayIn, setOverlayIn]     = useState(false)
  const [shopName, setShopName]       = useState('')
  const [slug, setSlug]               = useState('')
  const [phone, setPhone]             = useState('')
  const [slugError, setSlugError]     = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [bgScale, setBgScale]         = useState(0.65)
  const railRef = useRef<HTMLDivElement>(null)

  const template = TEMPLATES.find(t => t.id === selected)

  /* bg banner scale */
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setBgScale(e.contentRect.width / 4 / 390)
    })
    ro.observe(rail)
    return () => ro.disconnect()
  }, [])

  /* overlay enter animation */
  useEffect(() => {
    if (selected) {
      requestAnimationFrame(() => requestAnimationFrame(() => setOverlayIn(true)))
    } else {
      setOverlayIn(false)
    }
  }, [selected])

  function dismiss() { setOverlayIn(false); setTimeout(() => setSelected(null), 320) }

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
    setError(''); setLoading(true)
    try {
      const res  = await fetch('/api/shops/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName, slug, templateId: selected, ownerPhone: phone }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'เกิดข้อผิดพลาด'); return }
      router.push(`/${json.data.slug}/admin`)
    } catch { setError('ไม่สามารถเชื่อมต่อได้') }
    finally { setLoading(false) }
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

        {/* ── BACKGROUND: 4 banners, always full-width ── */}
        <div ref={railRef} style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              onClick={() => selected === t.id ? dismiss() : setSelected(t.id)}
              style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
            >
              {/* iframe */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '390px', height: '844px', transformOrigin: 'top left', transform: `scale(${bgScale})`, pointerEvents: 'none' }}>
                <iframe src={`/demo/${t.id}`} style={{ width: '390px', height: '844px', border: 'none', display: 'block' }} title={t.name} loading="lazy" />
              </div>

              {/* dim when overlay active */}
              <div style={{ position: 'absolute', inset: 0, background: selected ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0)', transition: 'background 0.4s', pointerEvents: 'none', zIndex: 2 }} />

              {/* bottom label */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '44px 12px 16px', background: 'linear-gradient(0deg,rgba(0,0,0,0.85) 0%,transparent 100%)', textAlign: 'center', pointerEvents: 'none', zIndex: 3 }}>
                <span style={{ display: 'inline-block', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: 'white', padding: '5px 16px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 700 }}>{t.name}</span>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', marginTop: '4px' }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CENTER OVERLAY: switcher | selected banner | form ── */}
        {selected && template && (
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: '50%',
            transform: `translateX(-50%) translateY(${overlayIn ? '0' : '24px'})`,
            opacity: overlayIn ? 1 : 0,
            transition: 'opacity 0.32s ease, transform 0.32s cubic-bezier(0.4,0,0.2,1)',
            display: 'flex', alignItems: 'stretch',
            zIndex: 20,
            boxShadow: `0 0 120px rgba(0,0,0,0.9), 0 0 60px ${template.color}22`,
          }}>

            {/* SWITCHER — left of selected banner */}
            <div style={{ width: '76px', background: '#111', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 8px', gap: '8px' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '4px', textAlign: 'center' }}>สลับ</div>
              {TEMPLATES.filter(t => t.id !== selected).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelected(t.id)}
                  style={{
                    width: '60px', padding: '10px 4px 8px',
                    borderRadius: '12px',
                    border: `2px solid ${t.color}`,
                    background: `${t.color}22`,
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                    transition: 'all 0.18s',
                    fontFamily: 'Sarabun, sans-serif',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${t.color}44` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${t.color}22` }}
                >
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{t.emoji}</span>
                  <span style={{ fontSize: '0.62rem', color: 'white', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{t.name}</span>
                </button>
              ))}
            </div>

            {/* SELECTED BANNER — center, scrollable iframe */}
            <div style={{ width: '280px', overflow: 'hidden', position: 'relative', borderLeft: `3px solid ${template.color}`, borderRight: `2px solid ${template.color}44` }}>
              {/* top glow */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: template.color, boxShadow: `0 0 20px 4px ${template.color}`, zIndex: 5, pointerEvents: 'none' }} />
              {/* scrollable iframe */}
              <div style={{ width: '390px', height: '100%', transformOrigin: 'top left', transform: `scale(${280 / 390})`, overflowY: 'auto' }}>
                <iframe
                  src={`/demo/${selected}`}
                  style={{ width: '390px', height: `${100 / (280 / 390)}%`, minHeight: '844px', border: 'none', display: 'block' }}
                  title={template.name}
                />
              </div>
            </div>

            {/* FORM PANEL */}
            <div style={{ width: '310px', background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: `3px solid ${template.color}` }}>
              <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: template.color, color: 'white', padding: '4px 13px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '12px', boxShadow: `0 4px 14px ${template.color}44` }}>
                    ✓ {template.name}
                  </div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#1a0f00', margin: 0 }}>ตั้งค่าร้านของคุณ</h2>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '4px' }}>กรอกข้อมูล แล้วเว็บพร้อมใช้ทันที</p>
                </div>

                {error && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.75rem', borderRadius: '10px', padding: '9px 13px', fontFamily: 'monospace' }}>{error}</div>
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
                  <button type="button" onClick={dismiss}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.75rem', cursor: 'pointer', padding: '6px', fontFamily: 'Sarabun, sans-serif' }}>
                    ✕ ปิด
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
