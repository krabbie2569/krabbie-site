'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sanitizeSlug, isValidSlug, shopUrl } from '@/lib/utils'

const TEMPLATES = [
  { id: 'booking-service', name: 'จองบริการ', emoji: '📅', desc: 'นวด · สปา · ทำเล็บ · คลีนิก', color: '#ff6b00', available: true },
  { id: 'booking-rental',  name: 'เช่าสินค้า', emoji: '📷', desc: 'กล้อง · เสื้อผ้า · อุปกรณ์',   color: '#E91E8C', available: true },
  { id: 'shop',            name: 'ร้านค้า',    emoji: '🛍️', desc: 'เร็วๆ นี้',                   color: '#6B7280', available: false },
  { id: 'qr-menu',         name: 'QR เมนู',    emoji: '🍜', desc: 'เร็วๆ นี้',                   color: '#6B7280', available: false },
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
  const [scale, setScale]         = useState(0.6)
  const railRef = useRef<HTMLDivElement>(null)

  const template = TEMPLATES.find(t => t.id === selected)

  /* measure rail width → compute iframe scale */
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
      <div style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, zIndex: 20 }}>
        <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', textDecoration: 'none' }}>← Dashboard</Link>
        <span style={{ color: 'rgba(255,255,255,0.12)' }}>/</span>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Syne, sans-serif' }}>เลือก Template</span>
      </div>

      {/* STAGE */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* BANNER RAIL */}
        <div ref={railRef} style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {TEMPLATES.map(t => {
            const isSelected = selected === t.id
            const isDimmed   = !!selected && !isSelected
            const isIdle     = !selected

            return (
              <div
                key={t.id}
                onClick={() => t.available && setSelected(isSelected ? null : t.id)}
                style={{
                  flex: 1,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: t.available ? 'pointer' : 'default',
                  borderRight: '1px solid rgba(255,255,255,0.04)',
                  transition: 'opacity 0.35s',
                  opacity: !t.available ? 0.28 : 1,
                }}
              >
                {/* IFRAME BANNER (available only) */}
                {t.available ? (
                  <div style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '390px', height: '844px',
                    transformOrigin: 'top left',
                    transform: `scale(${scale})`,
                    pointerEvents: 'none',
                    transition: 'transform 0.35s',
                  }}>
                    <iframe
                      src={`/demo/${t.id}`}
                      style={{ width: '390px', height: '844px', border: 'none', display: 'block' }}
                      title={t.name}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  /* Coming soon — dark placeholder */
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '10px',
                    background: '#111',
                  }}>
                    <span style={{ fontSize: '3rem' }}>{t.emoji}</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', fontFamily: 'monospace', letterSpacing: '3px' }}>เร็วๆ นี้</span>
                  </div>
                )}

                {/* OVERLAY */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: isDimmed ? 'rgba(0,0,0,0.6)' : isIdle ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0)',
                  transition: 'background 0.35s',
                  pointerEvents: 'none',
                }} />

                {/* SELECTED — top glow line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '3px',
                  background: isSelected ? t.color : 'transparent',
                  boxShadow: isSelected ? `0 0 24px 4px ${t.color}` : 'none',
                  transition: 'background 0.35s, box-shadow 0.35s',
                  pointerEvents: 'none',
                }} />

                {/* SELECTED — side glow */}
                {isSelected && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    boxShadow: `inset 0 0 0 2px ${t.color}88`,
                    pointerEvents: 'none',
                  }} />
                )}

                {/* BOTTOM LABEL */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '40px 16px 20px',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  pointerEvents: 'none',
                }}>
                  <span style={{
                    display: 'inline-block',
                    background: isSelected ? t.color : 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)',
                    color: 'white',
                    padding: '6px 18px',
                    borderRadius: '100px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.3px',
                    transition: 'background 0.3s, box-shadow 0.3s',
                    boxShadow: isSelected ? `0 4px 20px ${t.color}66` : 'none',
                  }}>
                    {t.available ? t.name : `${t.name} — เร็วๆ นี้`}
                  </span>
                  {t.available && (
                    <span style={{
                      color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
                      fontSize: '0.7rem',
                      transition: 'color 0.3s',
                    }}>
                      {isSelected ? '✓ กดเลือก' : t.desc}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* FORM PANEL — slides in from right */}
        <div style={{
          width:    selected ? '340px' : '0px',
          minWidth: selected ? '340px' : '0px',
          overflow: 'hidden',
          transition: 'min-width 0.4s cubic-bezier(0.4,0,0.2,1), width 0.4s cubic-bezier(0.4,0,0.2,1)',
          background: 'white',
          borderLeft: selected ? `3px solid ${template?.color ?? '#ff6b00'}` : 'none',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          zIndex: 10,
        }}>
          {selected && template && (
            <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: template.color, color: 'white',
                  padding: '5px 14px', borderRadius: '100px',
                  fontSize: '0.75rem', fontWeight: 700, marginBottom: '14px',
                  boxShadow: `0 4px 16px ${template.color}44`,
                }}>
                  ✓ {template.name}
                </div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#1a0f00', margin: 0 }}>
                  ตั้งค่าร้านของคุณ
                </h2>
                <p style={{ color: '#9CA3AF', fontSize: '0.78rem', marginTop: '4px' }}>
                  กรอกข้อมูลแล้วเว็บพร้อมใช้ทันที
                </p>
              </div>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.78rem', borderRadius: '10px', padding: '10px 14px', fontFamily: 'monospace' }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>ชื่อร้าน *</label>
                <input className="input" placeholder="เช่น ร้านนวดสบาย" required value={shopName} onChange={e => handleNameChange(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>URL ร้าน *</label>
                <div className="flex items-center gap-1 bg-gray-50 border-2 border-krabbie-border rounded-krabbie px-3 py-2 focus-within:border-orange-400 transition-colors">
                  <span className="font-mono text-xs text-gray-400 flex-shrink-0">/</span>
                  <input className="flex-1 bg-transparent outline-none font-mono text-sm" placeholder="shop-name" value={slug} onChange={e => handleSlugChange(e.target.value)} />
                </div>
                {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
                {slug && !slugError && <p className="text-teal-dark text-xs mt-1 font-mono">✓ {shopUrl(slug)}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>เบอร์โทร / Line ID</label>
                <input className="input" placeholder="0812345678 หรือ @lineid" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={loading || !shopName || !slug || !!slugError}
                  className="btn-primary w-full py-3 text-base disabled:opacity-40"
                  style={{ background: template.color, borderColor: template.color }}
                >
                  {loading ? 'กำลังสร้าง...' : 'สร้างร้าน →'}
                </button>
                <button type="button" onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.78rem', cursor: 'pointer', padding: '8px' }}>
                  ← เปลี่ยน template
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* HINT when nothing selected */}
      {!selected && (
        <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', color: 'rgba(255,255,255,0.45)', padding: '8px 20px', borderRadius: '100px', fontSize: '0.72rem', fontFamily: 'monospace', letterSpacing: '1px' }}>
            คลิกเพื่อเลือก template
          </div>
        </div>
      )}
    </div>
  )
}
