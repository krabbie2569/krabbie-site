'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const DEMO_SLUG  = 'corner-cafe'
const BROWN      = '#6F4E37'
const CREAM      = '#FFFDF8'
const GOLDEN     = '#C59A6D'
const BROWN_PALE = '#FFF5EC'

type Category = { id: string; name: string; icon: string; sort_order: number }
type MenuItem  = {
  id: string; category_id: string; name: string
  description: string | null; price: number
  image_emoji: string; is_popular: boolean
}
type CartItem  = { id: string; name: string; price: number; qty: number }

export default function DemoFoodQRMenu() {
  const [tenantId,   setTenantId]   = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items,      setItems]      = useState<MenuItem[]>([])
  const [activeCat,  setActiveCat]  = useState<string | null>(null)
  const [cart,       setCart]       = useState<CartItem[]>([])
  const [showCart,   setShowCart]   = useState(false)
  const [showOrder,  setShowOrder]  = useState(false)
  const [tableNo,    setTableNo]    = useState('')
  const [custName,   setCustName]   = useState('')
  const [orderNote,  setOrderNote]  = useState('')
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState<string | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)

  useEffect(() => {
    const sb = createClient() as any
    sb.from('tenants').select('id').eq('slug', DEMO_SLUG).single()
      .then(({ data: t }: any) => {
        if (!t) { setLoading(false); return }
        setTenantId(t.id)
        Promise.all([
          sb.from('menu_categories').select('*').eq('tenant_id', t.id).order('sort_order'),
          sb.from('menu_items').select('*').eq('tenant_id', t.id).eq('is_available', true).order('sort_order'),
        ]).then(([catsRes, itemsRes]: any[]) => {
          const cats: Category[] = catsRes.data ?? []
          setCategories(cats)
          setItems(itemsRes.data ?? [])
          if (cats.length > 0) setActiveCat(cats[0].id)
          setLoading(false)
        })
      })
  }, [])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  function addItem(item: MenuItem) {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }]
    })
  }

  function removeItem(id: string) {
    setCart(prev => {
      const ex = prev.find(c => c.id === id)
      if (!ex) return prev
      if (ex.qty === 1) return prev.filter(c => c.id !== id)
      return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c)
    })
  }

  function getQty(id: string) { return cart.find(c => c.id === id)?.qty ?? 0 }

  async function submitOrder() {
    if (!tableNo.trim() || !tenantId || cart.length === 0) return
    setSubmitting(true)
    setOrderError(null)
    const orderRef = 'TBL-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const sb = createClient() as any
    const { error } = await sb.from('table_orders').insert({
      tenant_id:     tenantId,
      order_ref:     orderRef,
      table_number:  tableNo.trim(),
      customer_name: custName.trim() || null,
      items:         cart,
      total:         cartTotal,
      note:          orderNote.trim() || null,
    })
    if (error) {
      setOrderError(error.message)
      setSubmitting(false)
    } else {
      setSuccess(orderRef)
      setCart([])
      setShowOrder(false)
      setShowCart(false)
      setTableNo('')
      setCustName('')
      setOrderNote('')
      setSubmitting(false)
    }
  }

  const displayItems = activeCat ? items.filter(i => i.category_id === activeCat) : items

  /* ── SUCCESS SCREEN ──────────────────────────────────── */
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: CREAM, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Sarabun, sans-serif' }}>
        <div style={{ background: BROWN, color: 'white', textAlign: 'center', padding: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', position: 'fixed', top: 0, left: 0, right: 0 }}>
          ✦ ตัวอย่าง Template — QR เมนูดิจิทัล ✦
        </div>
        <div style={{ background: 'white', borderRadius: '24px', padding: '40px 32px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(111,78,55,0.12)', marginTop: '32px' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>☕</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: BROWN, marginBottom: '8px' }}>ส่งออร์เดอร์แล้ว!</h2>
          <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '4px' }}>พนักงานกำลังเตรียมให้คุณ</p>
          <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '20px' }}>โต๊ะ {tableNo || '–'} {custName ? `· ${custName}` : ''}</p>
          <div style={{ background: BROWN_PALE, border: `1px solid ${GOLDEN}`, borderRadius: '12px', padding: '12px 16px', fontFamily: 'monospace', color: BROWN, fontSize: '14px', fontWeight: 700, marginBottom: '24px' }}>
            {success}
          </div>
          <button onClick={() => setSuccess(null)} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: BROWN, color: 'white', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            สั่งเพิ่ม ☕
          </button>
        </div>
      </div>
    )
  }

  /* ── MAIN PAGE ───────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: 'Sarabun, sans-serif', paddingBottom: '80px' }}>

      {/* DEMO BANNER */}
      <div style={{ background: BROWN, color: 'white', textAlign: 'center', padding: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '2px' }}>
        ✦ ตัวอย่าง Template — QR เมนูดิจิทัล ✦
      </div>

      {/* HEADER */}
      <header style={{ background: BROWN, color: 'white', padding: '28px 20px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '44px', marginBottom: '8px' }}>☕</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>The Corner Café</h1>
        <p style={{ fontSize: '12px', opacity: 0.75, margin: '0 0 14px' }}>Specialty Coffee & Desserts · เชียงใหม่</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['📍 นิมมานเหมินท์', '⏰ 08:00–20:00', '📶 Free WiFi'].map(t => (
            <span key={t} style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '999px', fontSize: '10px', whiteSpace: 'nowrap' }}>{t}</span>
          ))}
        </div>
      </header>

      {/* CATEGORY TABS */}
      <div style={{ background: 'white', borderBottom: '1px solid #F3E8DF', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ overflowX: 'auto', padding: '0 16px', display: 'flex', gap: '4px', paddingTop: '10px', paddingBottom: '10px', whiteSpace: 'nowrap' }}>
          {loading
            ? [1,2,3,4].map(i => <div key={i} style={{ width: '88px', height: '34px', background: '#F3F4F6', borderRadius: '999px', flexShrink: 0 }} />)
            : categories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                  style={{ padding: '6px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, flexShrink: 0, background: activeCat === cat.id ? BROWN : 'transparent', color: activeCat === cat.id ? 'white' : '#6B7280', transition: 'all 0.2s' }}>
                  {cat.icon} {cat.name}
                </button>
              ))
          }
        </div>
      </div>

      {/* MENU GRID */}
      <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: '190px', background: 'white', borderRadius: '16px' }} />)}
          </div>
        ) : displayItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>ยังไม่มีเมนูในหมวดนี้</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {displayItems.map(item => {
              const qty = getQty(item.id)
              return (
                <div key={item.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(111,78,55,0.06)', border: '1px solid rgba(111,78,55,0.08)' }}>
                  <div style={{ height: '100px', background: 'linear-gradient(135deg, #FFF5EC, #FDE8D0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', position: 'relative' }}>
                    {item.image_emoji}
                    {item.is_popular && (
                      <span style={{ position: 'absolute', top: '7px', right: '7px', background: GOLDEN, color: 'white', fontSize: '8px', fontWeight: 700, padding: '2px 6px', borderRadius: '999px', lineHeight: 1.4 }}>⭐ ยอดฮิต</span>
                    )}
                  </div>
                  <div style={{ padding: '10px' }}>
                    <p style={{ fontWeight: 700, fontSize: '12px', color: '#1F2937', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    {item.description && (
                      <p style={{ fontSize: '10px', color: '#9CA3AF', margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: BROWN, fontWeight: 700, fontSize: '13px' }}>{item.price.toLocaleString()} ฿</span>
                      {qty === 0 ? (
                        <button onClick={() => addItem(item)}
                          style={{ background: BROWN, color: 'white', border: 'none', borderRadius: '999px', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                          +
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button onClick={() => removeItem(item.id)} style={{ background: '#F3F4F6', border: 'none', borderRadius: '999px', width: '24px', height: '24px', cursor: 'pointer', fontSize: '15px', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                          <span style={{ fontWeight: 700, fontSize: '13px', minWidth: '16px', textAlign: 'center', color: BROWN }}>{qty}</span>
                          <button onClick={() => addItem(item)} style={{ background: BROWN, border: 'none', borderRadius: '999px', width: '24px', height: '24px', cursor: 'pointer', fontSize: '15px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FLOATING CART */}
      {cartCount > 0 && !showCart && !showOrder && (
        <button onClick={() => setShowCart(true)}
          style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: BROWN, color: 'white', border: 'none', borderRadius: '999px', padding: '14px 28px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(111,78,55,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
          <span style={{ background: GOLDEN, borderRadius: '999px', padding: '2px 8px', fontSize: '12px', fontWeight: 700 }}>{cartCount}</span>
          ดูรายการ · {cartTotal.toLocaleString()} ฿
        </button>
      )}

      {/* CART BOTTOM SHEET */}
      {showCart && (
        <div onClick={() => setShowCart(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '24px 24px 0 0', padding: '24px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '40px', height: '4px', background: '#E5E7EB', borderRadius: '999px', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: BROWN, marginBottom: '16px' }}>รายการที่สั่ง</h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>{item.name}</p>
                    <p style={{ color: GOLDEN, fontSize: '12px', margin: 0 }}>{item.price.toLocaleString()} ฿ × {item.qty}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 12px' }}>
                    <button onClick={() => removeItem(item.id)} style={{ background: '#F3F4F6', border: 'none', borderRadius: '999px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center', fontSize: '14px' }}>{item.qty}</span>
                    <button onClick={() => setCart(prev => prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))} style={{ background: BROWN, border: 'none', borderRadius: '999px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: BROWN, minWidth: '64px', textAlign: 'right' }}>{(item.price * item.qty).toLocaleString()} ฿</span>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: '16px', borderTop: `2px solid #F3F4F6`, marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700 }}>รวมทั้งหมด</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: BROWN }}>{cartTotal.toLocaleString()} ฿</span>
              </div>
              <button onClick={() => { setShowCart(false); setShowOrder(true) }}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', background: BROWN, color: 'white', border: 'none', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginBottom: '8px' }}>
                สั่งอาหาร →
              </button>
              <button onClick={() => setShowCart(false)}
                style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB', fontSize: '14px', cursor: 'pointer' }}>
                เพิ่มเมนู
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER FORM BOTTOM SHEET */}
      {showOrder && (
        <div onClick={() => setShowOrder(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '24px 24px 0 0', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ width: '40px', height: '4px', background: '#E5E7EB', borderRadius: '999px', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: BROWN, marginBottom: '20px' }}>ยืนยันออร์เดอร์</h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>เลขโต๊ะ *</label>
              <input value={tableNo} onChange={e => setTableNo(e.target.value)} placeholder="เช่น 3, A5, VIP1" maxLength={10}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1.5px solid ${tableNo ? BROWN : '#E5E7EB'}`, fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>ชื่อ <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(ไม่บังคับ)</span></label>
              <input value={custName} onChange={e => setCustName(e.target.value)} placeholder="ชื่อเพื่อเรียก"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>หมายเหตุ <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(ไม่บังคับ)</span></label>
              <textarea value={orderNote} onChange={e => setOrderNote(e.target.value)} rows={2} placeholder="ไม่ใส่น้ำตาล, ลดหวาน, แพ้ถั่ว..."
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ background: BROWN_PALE, borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>{cartCount} รายการ</span>
              <span style={{ fontWeight: 700, fontSize: '16px', color: BROWN }}>{cartTotal.toLocaleString()} ฿</span>
            </div>

            {orderError && <p style={{ color: '#EF4444', fontSize: '12px', marginBottom: '10px' }}>⚠️ {orderError}</p>}

            <button onClick={submitOrder} disabled={!tableNo.trim() || submitting || cart.length === 0}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: BROWN, color: 'white', border: 'none', fontSize: '15px', fontWeight: 700, cursor: !tableNo.trim() || submitting ? 'not-allowed' : 'pointer', opacity: !tableNo.trim() || submitting ? 0.5 : 1, marginBottom: '8px', transition: 'opacity 0.2s' }}>
              {submitting ? 'กำลังส่ง...' : 'ยืนยันสั่ง →'}
            </button>
            <button onClick={() => { setShowOrder(false); setShowCart(true) }}
              style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'white', color: '#6B7280', border: '1.5px solid #E5E7EB', fontSize: '14px', cursor: 'pointer' }}>
              ย้อนกลับ
            </button>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '11px', color: '#D1D5DB', padding: '16px' }}>
        Powered by <span style={{ color: '#ff6b00' }}>🦀 Krabbie.com</span>
      </div>
    </div>
  )
}
