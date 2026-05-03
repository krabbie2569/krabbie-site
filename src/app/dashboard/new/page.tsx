'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
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

  const template = TEMPLATES.find(t => t.id === selected)

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
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#0d0d0d', overflow: 'hidden', position: 'relative' }}>

      {/* NAV */}
      <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, zIndex: 20 }}>
        <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', textDecoration: 'none', transition: 'color 0.15s' }}>
          ← Dashboard
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Syne, sans-serif' }}>เลือก Template</span>
      </div>

      {/* STAGE */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* TEMPLATE RAIL */}
        <div style={{ flex: 1, display: 'flex', overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory' }}>
          {TEMPLATES.map(t => {
            const isSelected = selected === t.id
            const isDimmed   = !!selected && !isSelected
            return (
              <button
                key={t.id}
                type="button"
                disabled={!t.available}
                onClick={() => t.available && setSelected(isSelected ? null : t.id)}
                style={{
                  minWidth: '240px',
                  flex: isSelected ? 2 : 1,
                  maxWidth: isSelected ? '480px' : '340px',
                  transition: 'flex 0.45s cubic-bezier(0.4,0,0.2,1), max-width 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
                  opacity: !t.available ? 0.25 : isDimmed ? 0.4 : 1,
                  position: 'relative',
                  border: 'none',
                  cursor: t.available ? 'pointer' : 'not-allowed',
                  background: 'transparent',
                  padding: 0,
                  outline: 'none',
                  scrollSnapAlign: 'start',
                  overflow: 'hidden',
                }}
              >
                {/* Background gradient */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: isSelected
                    ? `radial-gradient(ellipse at 50% 70%, ${t.color}28 0%, transparent 65%)`
                    : 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)',
                  transition: 'background 0.4s',
                  pointerEvents: 'none',
                }} />

                {/* Vertical divider line */}
                <div style={{
                  position: 'absolute', top: '10%', bottom: '10%', right: 0,
                  width: '1px',
                  background: isSelected ? `${t.color}40` : 'rgba(255,255,255,0.05)',
                  transition: 'background 0.4s',
                }} />

                {/* Phone banner */}
                {t.available ? (
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: isSelected ? '230px' : '175px',
                    height: isSelected ? '500px' : '380px',
                    transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
                    borderRadius: '30px',
                    overflow: 'hidden',
                    border: `5px solid ${isSelected ? t.color : 'rgba(255,255,255,0.12)'}`,
                    boxShadow: isSelected
                      ? `0 0 0 2px ${t.color}55, 0 40px 100px ${t.color}55, 0 0 80px ${t.color}22`
                      : '0 20px 60px rgba(0,0,0,0.7)',
                    background: '#111',
                    flexShrink: 0,
                  }}>
                    {/* Notch */}
                    <div style={{
                      position: 'absolute', top: 0, left: '50%',
                      transform: 'translateX(-50%)',
                      width: '34px', height: '8px',
                      background: isSelected ? t.color : '#222',
                      borderRadius: '0 0 8px 8px', zIndex: 10,
                      transition: 'background 0.4s',
                    }} />
                    {/* Scaled iframe */}
                    <div style={{
                      width: '390px', height: '844px',
                      transformOrigin: 'top left',
                      transform: `scale(${isSelected ? 230 / 390 : 175 / 390})`,
                      transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
                      pointerEvents: 'none',
                    }}>
                      <iframe
                        src={`/demo/${t.id}`}
                        style={{ width: '390px', height: '844px', border: 'none' }}
                        title={t.name}
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '160px', height: '340px',
                    borderRadius: '28px',
                    border: '4px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '10px',
                  }}>
                    <span style={{ fontSize: '2.5rem' }}>{t.emoji}</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', fontFamily: 'monospace', letterSpacing: '2px' }}>เร็วๆ นี้</span>
                  </div>
                )}

                {/* Label */}
                <div style={{
                  position: 'absolute', bottom: '28px', left: 0, right: 0,
                  textAlign: 'center', zIndex: 5,
                }}>
                  <div style={{
                    display: 'inline-block',
                    background: isSelected ? t.color : 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(16px)',
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '100px',
                    fontSize: isSelected ? '0.95rem' : '0.82rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s',
                    boxShadow: isSelected ? `0 4px 20px ${t.color}55` : 'none',
                  }}>
                    {t.name}
                  </div>
                  {t.available && !isSelected && (
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', marginTop: '6px', fontFamily: 'monospace' }}>
                      {t.desc}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* FORM PANEL — slides in from right */}
        <div style={{
          width:    selected ? '360px' : '0px',
          minWidth: selected ? '360px' : '0px',
          overflow: 'hidden',
          transition: 'min-width 0.45s cubic-bezier(0.4,0,0.2,1), width 0.45s cubic-bezier(0.4,0,0.2,1)',
          background: 'white',
          borderLeft: selected ? '1px solid #ffe0c0' : 'none',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          zIndex: 10,
        }}>
          {selected && template && (
            <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Header */}
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: template.color, color: 'white',
                  padding: '5px 14px', borderRadius: '100px',
                  fontSize: '0.75rem', fontWeight: 700, marginBottom: '14px',
                }}>
                  ✓ {template.name}
                </div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.35rem', fontWeight: 800, color: '#1a0f00', margin: 0 }}>
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

              {/* Shop name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                  ชื่อร้าน *
                </label>
                <input
                  className="input"
                  placeholder="เช่น ร้านนวดสบาย"
                  required
                  value={shopName}
                  onChange={e => handleNameChange(e.target.value)}
                />
              </div>

              {/* URL */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                  URL ร้าน *
                </label>
                <div className="flex items-center gap-1 bg-gray-50 border-2 border-krabbie-border rounded-krabbie px-3 py-2 focus-within:border-orange-400 transition-colors">
                  <span className="font-mono text-xs text-gray-400 flex-shrink-0">/</span>
                  <input
                    className="flex-1 bg-transparent outline-none font-mono text-sm"
                    placeholder="shop-name"
                    value={slug}
                    onChange={e => handleSlugChange(e.target.value)}
                  />
                </div>
                {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
                {slug && !slugError && <p className="text-teal-dark text-xs mt-1 font-mono">✓ {shopUrl(slug)}</p>}
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
                  เบอร์โทร / Line ID
                </label>
                <input
                  className="input"
                  placeholder="0812345678 หรือ @lineid"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={loading || !shopName || !slug || !!slugError}
                  className="btn-primary w-full py-3 text-base disabled:opacity-40"
                  style={{ background: template.color, borderColor: template.color }}
                >
                  {loading ? 'กำลังสร้าง...' : 'สร้างร้าน →'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.78rem', cursor: 'pointer', padding: '8px', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                >
                  ← เปลี่ยน template
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* HINT */}
      {!selected && (
        <div style={{
          position: 'absolute', bottom: '24px', left: 0, right: 0,
          textAlign: 'center', pointerEvents: 'none', zIndex: 10,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
            color: 'rgba(255,255,255,0.5)',
            padding: '8px 20px', borderRadius: '100px',
            fontSize: '0.75rem', fontFamily: 'monospace', letterSpacing: '1px',
          }}>
            ← เลื่อนดู &nbsp;·&nbsp; แตะเพื่อเลือก template →
          </div>
        </div>
      )}
    </div>
  )
}
