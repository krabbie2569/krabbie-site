'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const DEMO_SLUG = 'minimal-studio'
const NAVY      = '#1E293B'
const SLATE     = '#475569'
const ORANGE    = '#F97316'
const LIGHT     = '#F8FAFC'

type Product  = {
  id: string; name: string; description: string | null
  price: number; compare_price: number | null
  image_emoji: string; category: string | null
}
type CartItem = { id: string; name: string; price: number; qty: number; emoji: string }

export default function DemoShopGeneral() {
  const [tenantId,   setTenantId]   = useState<string | null>(null)
  const [products,   setProducts]   = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCat,  setActiveCat]  = useState<string>('ทั้งหมด')
  const [cart,       setCart]       = useState<CartItem[]>([])
  const [showCart,   setShowCart]   = useState(false)
  const [checkout,   setCheckout]   = useState(false)
  const [form,       setForm]       = useState({ name: '', phone: '', address: '', note: '' })
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
        sb.from('products').select('*').eq('tenant_id', t.id).eq('is_active', true).order('sort_order')
          .then(({ data }: any) => {
            const prods: Product[] = data ?? []
            setProducts(prods)
            const cats = ['ทั้งหมด', ...Array.from(new Set(prods.map((p: Product) => p.category ?? 'อื่นๆ')))]
            setCategories(cats as string[])
            setLoading(false)
          })
      })
  }, [])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  function addToCart(p: Product) {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id)
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1, emoji: p.image_emoji }]
    })
  }

  function removeFromCart(id: string) {
    setCart(prev => {
      const ex = prev.find(c => c.id === id)
      if (!ex) return prev
      if (ex.qty === 1) return prev.filter(c => c.id !== id)
      return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c)
    })
  }

  function getQty(id: string) { return cart.find(c => c.id === id)?.qty ?? 0 }

  function setField(k: keyof typeof form, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function submitOrder() {
    if (!form.name.trim() || !form.phone.trim() || !tenantId || cart.length === 0) return
    setSubmitting(true)
    setOrderError(null)
    const orderRef = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const sb = createClient() as any
    const { error } = await sb.from('orders').insert({
      tenant_id:      tenantId,
      order_ref:      orderRef,
      customer_name:  form.name.trim(),
      customer_phone: form.phone.trim(),
      address:        form.address.trim() || null,
      items:          cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
      total:          cartTotal,
      note:           form.note.trim() || null,
    })
    if (error) {
      setOrderError(error.message)
      setSubmitting(false)
    } else {
      setSuccess(orderRef)
      setCart([])
      setCheckout(false)
      setShowCart(false)
      setForm({ name: '', phone: '', address: '', note: '' })
      setSubmitting(false)
    }
  }

  const displayProducts = activeCat === 'ทั้งหมด'
    ? products
    : products.filter(p => (p.category ?? 'อื่นๆ') === activeCat)

  /* ── SUCCESS SCREEN ──────────────────────────────────── */
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Sarabun, sans-serif' }}>
        <div style={{ background: NAVY, color: 'white', textAlign: 'center', padding: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', position: 'fixed', top: 0, left: 0, right: 0 }}>
          ✦ ตัวอย่าง Template — ร้านขายสินค้าออนไลน์ ✦
        </div>
        <div style={{ background: 'white', borderRadius: '24px', padding: '40px 32px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginTop: '32px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: NAVY, marginBottom: '8px' }}>สั่งซื้อสำเร็จ!</h2>
          <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '16px' }}>เราจะติดต่อกลับเพื่อยืนยันออร์เดอร์และนัดจัดส่ง</p>
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', padding: '12px 16px', fontFamily: 'monospace', color: ORANGE, fontSize: '14px', fontWeight: 700, marginBottom: '24px' }}>
            {success}
          </div>
          <button onClick={() => setSuccess(null)} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: NAVY, color: 'white', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            ดูสินค้าอื่น →
          </button>
        </div>
      </div>
    )
  }

  /* ── MAIN PAGE ───────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: LIGHT, fontFamily: 'Sarabun, sans-serif', paddingBottom: '80px' }}>

      {/* DEMO BANNER */}
      <div style={{ background: NAVY, color: 'white', textAlign: 'center', padding: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '2px' }}>
        ✦ ตัวอย่าง Template — ร้านขายสินค้าออนไลน์ ✦
      </div>

      {/* STICKY HEADER */}
      <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '17px', color: NAVY }}>มินิมอล สตูดิโอ</div>
          <div style={{ fontSize: '10px', color: '#94A3B8', letterSpacing: '2px', textTransform: 'uppercase' }}>Handmade · Home Decor · กรุงเทพฯ</div>
        </div>
        {cartCount > 0 && (
          <button onClick={() => { setShowCart(true); setCheckout(false) }}
            style={{ background: NAVY, color: 'white', border: 'none', borderRadius: '12px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🛒
            <span style={{ background: ORANGE, borderRadius: '999px', padding: '2px 7px', fontSize: '11px', fontWeight: 700 }}>{cartCount}</span>
          </button>
        )}
      </header>

      {/* HERO BANNER */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY}, #334155)`, color: 'white', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '4px', opacity: 0.55, textTransform: 'uppercase', margin: '0 0 8px' }}>handmade with love</p>
        <h2 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.3 }}>งานฝีมือ<br />ตกแต่งบ้านสไตล์มินิมอล</h2>
        <p style={{ fontSize: '12px', opacity: 0.65, maxWidth: '260px', margin: '0 auto' }}>ทุกชิ้นปั้น ถัก ทอด้วยมือ ส่งตรงจากสตูดิโอ</p>
      </div>

      {/* CATEGORY FILTER */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
        <div style={{ display: 'inline-flex', gap: '4px', padding: '10px 16px', whiteSpace: 'nowrap' }}>
          {loading
            ? [1,2,3,4,5].map(i => <div key={i} style={{ width: '72px', height: '32px', background: '#F1F5F9', borderRadius: '999px' }} />)
            : categories.map(cat => (
                <button key={cat} onClick={() => setActiveCat(cat)}
                  style={{ padding: '6px 14px', borderRadius: '999px', border: activeCat === cat ? 'none' : '1px solid #E2E8F0', cursor: 'pointer', fontSize: '12px', fontWeight: activeCat === cat ? 700 : 400, background: activeCat === cat ? NAVY : 'white', color: activeCat === cat ? 'white' : SLATE, transition: 'all 0.2s' }}>
                  {cat}
                </button>
              ))
          }
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: '230px', background: 'white', borderRadius: '16px' }} />)}
          </div>
        ) : displayProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>ไม่มีสินค้าในหมวดนี้</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {displayProducts.map(p => {
              const qty      = getQty(p.id)
              const discount = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : 0
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <div style={{ height: '120px', background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', position: 'relative' }}>
                    {p.image_emoji}
                    {discount > 0 && (
                      <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#EF4444', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px' }}>-{discount}%</span>
                    )}
                  </div>
                  <div style={{ padding: '10px' }}>
                    <p style={{ fontWeight: 700, fontSize: '12px', color: NAVY, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    {p.description && (
                      <p style={{ fontSize: '10px', color: '#94A3B8', margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                    )}
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: NAVY }}>{p.price.toLocaleString()} ฿</span>
                      {p.compare_price && (
                        <span style={{ fontSize: '10px', color: '#CBD5E1', textDecoration: 'line-through', marginLeft: '5px' }}>{p.compare_price.toLocaleString()} ฿</span>
                      )}
                    </div>
                    {qty === 0 ? (
                      <button onClick={() => addToCart(p)}
                        style={{ width: '100%', padding: '7px', borderRadius: '10px', background: NAVY, color: 'white', border: 'none', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                        + ใส่ตะกร้า
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F1F5F9', borderRadius: '10px', padding: '4px 8px' }}>
                        <button onClick={() => removeFromCart(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: SLATE, width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: NAVY }}>{qty}</span>
                        <button onClick={() => addToCart(p)} style={{ background: NAVY, border: 'none', cursor: 'pointer', fontSize: '14px', color: 'white', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FLOATING CART */}
      {cartCount > 0 && !showCart && (
        <button onClick={() => { setShowCart(true); setCheckout(false) }}
          style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: NAVY, color: 'white', border: 'none', borderRadius: '999px', padding: '14px 28px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(30,41,59,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
          <span style={{ background: ORANGE, borderRadius: '999px', padding: '2px 8px', fontSize: '12px', fontWeight: 700 }}>{cartCount}</span>
          🛒 ตะกร้า · {cartTotal.toLocaleString()} ฿
        </button>
      )}

      {/* CART / CHECKOUT BOTTOM SHEET */}
      {showCart && (
        <div onClick={() => { setShowCart(false); setCheckout(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '24px 24px 0 0', padding: '24px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '40px', height: '4px', background: '#E2E8F0', borderRadius: '999px', margin: '0 auto 20px' }} />

            {!checkout ? (
              /* ── Cart list ── */
              <>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: NAVY, marginBottom: '16px' }}>🛒 ตะกร้า ({cartCount} ชิ้น)</h3>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '26px', flexShrink: 0 }}>{item.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '13px', color: NAVY, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                        <p style={{ color: '#94A3B8', fontSize: '11px', margin: 0 }}>{item.price.toLocaleString()} ฿/ชิ้น</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => removeFromCart(item.id)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#F1F5F9', border: 'none', cursor: 'pointer', fontSize: '16px', color: SLATE, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                        <span style={{ fontWeight: 700, fontSize: '13px', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => setCart(prev => prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))} style={{ width: '26px', height: '26px', borderRadius: '6px', background: NAVY, border: 'none', cursor: 'pointer', fontSize: '14px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: NAVY, minWidth: '64px', textAlign: 'right', flexShrink: 0 }}>{(item.price * item.qty).toLocaleString()} ฿</span>
                    </div>
                  ))}
                </div>
                <div style={{ paddingTop: '16px', borderTop: '1.5px solid #E2E8F0', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: NAVY }}>ยอดรวม</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: NAVY }}>{cartTotal.toLocaleString()} ฿</span>
                  </div>
                  <button onClick={() => setCheckout(true)}
                    style={{ width: '100%', padding: '14px', borderRadius: '14px', background: NAVY, color: 'white', border: 'none', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginBottom: '8px' }}>
                    สั่งซื้อ →
                  </button>
                  <button onClick={() => setShowCart(false)}
                    style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'white', color: '#6B7280', border: '1.5px solid #E2E8F0', fontSize: '14px', cursor: 'pointer' }}>
                    เลือกสินค้าเพิ่ม
                  </button>
                </div>
              </>
            ) : (
              /* ── Checkout form ── */
              <>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: NAVY, marginBottom: '20px' }}>ข้อมูลการจัดส่ง</h3>
                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {([
                    { key: 'name',    label: 'ชื่อ-นามสกุล *',   placeholder: 'ชื่อ นามสกุล',           type: 'text' },
                    { key: 'phone',   label: 'เบอร์โทรศัพท์ *',   placeholder: '0812345678',              type: 'tel'  },
                    { key: 'address', label: 'ที่อยู่จัดส่ง',      placeholder: 'บ้านเลขที่ ถนน เขต จังหวัด รหัสฯ', type: 'text' },
                    { key: 'note',    label: 'หมายเหตุ',            placeholder: 'คำขอพิเศษ เช่น สีที่ต้องการ', type: 'text' },
                  ] as const).map(({ key, label, placeholder, type }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>{label}</label>
                      <input type={type} value={form[key]} onChange={e => setField(key, e.target.value)} placeholder={placeholder}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1.5px solid ${(key === 'name' || key === 'phone') && form[key] ? NAVY : '#E2E8F0'}`, fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
                    </div>
                  ))}
                </div>
                <div style={{ paddingTop: '16px', borderTop: '1.5px solid #E2E8F0', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ color: '#64748B', fontSize: '13px' }}>{cartCount} ชิ้น</span>
                    <span style={{ fontWeight: 700, fontSize: '18px', color: NAVY }}>{cartTotal.toLocaleString()} ฿</span>
                  </div>
                  {orderError && <p style={{ color: '#EF4444', fontSize: '12px', marginBottom: '10px' }}>⚠️ {orderError}</p>}
                  <button onClick={submitOrder} disabled={!form.name.trim() || !form.phone.trim() || submitting}
                    style={{ width: '100%', padding: '14px', borderRadius: '14px', background: NAVY, color: 'white', border: 'none', fontSize: '15px', fontWeight: 700, cursor: !form.name.trim() || !form.phone.trim() || submitting ? 'not-allowed' : 'pointer', opacity: !form.name.trim() || !form.phone.trim() || submitting ? 0.5 : 1, marginBottom: '8px', transition: 'opacity 0.2s' }}>
                    {submitting ? 'กำลังส่ง...' : 'ยืนยันสั่งซื้อ →'}
                  </button>
                  <button onClick={() => setCheckout(false)}
                    style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'white', color: '#6B7280', border: '1.5px solid #E2E8F0', fontSize: '14px', cursor: 'pointer' }}>
                    ย้อนกลับ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '11px', color: '#CBD5E1', padding: '16px' }}>
        Powered by <span style={{ color: '#ff6b00' }}>🦀 Krabbie.com</span>
      </div>
    </div>
  )
}
