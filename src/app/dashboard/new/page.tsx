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
  const [overlayIn, setOverlayIn] = useState(false)
  const [shopName, setShopName]   = useState('')
  const [slug, setSlug]           = useState('')
  const [phone, setPhone]         = useState('')
  const [slugError, setSlugError] = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [colWidth, setColWidth]   = useState(0)
  const railRef = useRef<HTMLDivElement>(null)

  const template = TEMPLATES.find(t => t.id === selected)
  const bgScale  = colWidth ? colWidth / 390 : 1

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setColWidth(e.contentRect.width / 4)
    })
    ro.observe(rail)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (selected) requestAnimationFrame(() => requestAnimationFrame(() => setOverlayIn(true)))
    else setOverlayIn(false)
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

        {/* 4 BANNER COLUMNS — always full size, iframes fully interactive */}
        <div ref={railRef} style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                borderRight: '1px solid rgba(255,255,255,0.04)',
                transition: 'filter 0.35s ease',
                filter: selected && selected !== t.id ? 'brightness(0.28)' : 'brightness(1)',
              }}
            >
              {/* IFRAME — zoom (not transform) so scroll layout is correct */}
              {colWidth > 0 && (
                <div style={{ zoom: bgScale, width: '390px', height: '2600px' } as React.CSSProperties}>
                  <iframe
                    src={`/demo/${t.id}`}
                    style={{ width: '390px', height: '2600px', border: 'none', display: 'block' }}
                    title={t.name}
                    loading="lazy"
                  />
                </div>
              )}

              {/* TOP LABEL — always visible */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                padding: '10px 10px 32px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%)',
                pointerEvents: 'none', zIndex: 10,
              }}>
                <span style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: 'white', padding: '3px 10px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700 }}>
                  {t.name}
                </span>
              </div>

              {/* SELECT BUTTON — pinned at bottom, always clickable */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '60px 12px 18px',
                background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)',
                zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', textAlign: 'center' }}>{t.desc}</div>
                <button
                  type="button"
                  onClick={() => selected === t.id ? dismiss() : setSelected(t.id)}
                  style={{
                    background: selected === t.id ? 'rgba(255,255,255,0.15)' : t.color,
                    color: 'white',
                    border: selected === t.id ? `2px solid ${t.color}` : 'none',
                    borderRadius: '100px',
                    padding: '9px 22px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontFamily: 'Sarabun, sans-serif',
                    boxShadow: selected === t.id ? 'none' : `0 4px 20px ${t.color}66`,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  {selected === t.id ? '✕ ยกเลิก' : `เลือกเทมเพลตนี้ →`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CENTER OVERLAY — Switcher + Form only (banners stay behind) */}
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

            {/* SWITCHER */}
            <div style={{ width: '80px', background: '#111', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 8px', gap: '10px' }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.58rem', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '4px', textAlign: 'center' }}>สลับ</div>
              {TEMPLATES.filter(t => t.id !== selected).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelected(t.id)}
                  style={{
                    width: '62px', padding: '10px 4px 8px',
                    borderRadius: '12px',
                    border: `2px solid ${t.color}`,
                    background: `${t.color}22`,
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                    transition: 'background 0.18s',
                    fontFamily: 'Sarabun, sans-serif',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${t.color}44` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${t.color}22` }}
                >
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{t.emoji}</span>
                  <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{t.name}</span>
                </button>
              ))}
            </div>

            {/* FORM PANEL */}
            <div style={{ width: '320px', background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: `3px solid ${template.color}` }}>
              <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: template.color, color: 'white', padding: '4px 13px', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '12px', boxShadow: `0 4px 14px ${template.color}44` }}>
                    {template.emoji} {template.name}
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
          <div style={{ position: 'absolute', top: '14px', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', zIndex: 15 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', color: 'rgba(255,255,255,0.5)', padding: '7px 18px', borderRadius: '100px', fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '1px', border: '1px solid rgba(255,255,255,0.08)' }}>
              เลื่อนดูและเลือก template ที่ต้องการ ↓
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
