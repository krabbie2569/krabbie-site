'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'

const PRODUCTS = [
  { id:'1', name:'เสื้อโอเวอร์ไซส์', price:490, emoji:'👕', tag:'New',      cat:'เสื้อผ้า' },
  { id:'2', name:'กระเป๋าผ้า Canvas', price:290, emoji:'👜', tag:'',        cat:'กระเป๋า' },
  { id:'3', name:'หมวกแก๊ป Minimal', price:350, emoji:'🧢', tag:'Hot',      cat:'หมวก' },
  { id:'4', name:'ถุงเท้าน่ารัก',    price:120, emoji:'🧦', tag:'',         cat:'เสริม' },
  { id:'5', name:'สร้อยมือ DIY',      price:180, emoji:'📿', tag:'Handmade', cat:'เครื่องประดับ' },
  { id:'6', name:'แว่นตา Retro',      price:550, emoji:'🕶️', tag:'',        cat:'เสริม' },
]

const GREEN = '#10B981'
const GRAD  = 'linear-gradient(135deg,#10B981,#059669)'

export default function DemoShop() {
  const [cart, setCart] = useState(0)

  return (
    <div style={{ minHeight:'100vh', background:'#F0FDF4', fontFamily:'Sarabun,sans-serif', color:'#1a1a2e' }}>

      {/* DEMO BADGE */}
      <div style={{ background:GRAD, color:'white', textAlign:'center', padding:'8px', fontSize:'0.72rem', fontWeight:700, letterSpacing:'2px' }}>
        ✦ ตัวอย่าง Template · ร้านขายสินค้า · <a href="/dashboard/new?template=shop" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'underline' }}>ใช้ template นี้ →</a>
      </div>

      {/* HEADER */}
      <header style={{ background:'white', borderBottom:'1px solid #E5E7EB', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:'1.05rem', background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Green Shop 🛍️</div>
          <div style={{ fontSize:'0.65rem', color:'#9CA3AF', letterSpacing:'2px' }}>FASHION · LIFESTYLE</div>
        </div>
        <div style={{ background:GRAD, color:'white', borderRadius:'100px', padding:'6px 16px', fontSize:'0.8rem', fontWeight:700, cursor:'pointer' }}>
          🛒 {cart}
        </div>
      </header>

      {/* HERO */}
      <section style={{ background:GRAD, padding:'36px 20px', textAlign:'center', color:'white', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          {['10%','80%','45%'].map((l,i) => (
            <div key={i} style={{ position:'absolute', left:l, top:`${20+i*25}%`, fontSize:`${40+i*10}px`, color:'white', opacity:0.06 }}>✦</div>
          ))}
        </div>
        <div style={{ position:'relative' }}>
          <div style={{ fontSize:'0.68rem', letterSpacing:'4px', marginBottom:'8px', opacity:0.75 }}>NEW COLLECTION 2025</div>
          <h1 style={{ fontSize:'2rem', fontWeight:800, marginBottom:'8px', lineHeight:1.15 }}>ของดี ราคาโดน<br/>ส่งทุกวัน 🎉</h1>
          <p style={{ opacity:0.8, marginBottom:'20px', fontSize:'0.9rem' }}>คัดสรรสินค้าคุณภาพ พร้อมส่งถึงบ้าน</p>
          <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
            <button style={{ background:'white', color:GREEN, padding:'10px 24px', borderRadius:'100px', border:'none', fontWeight:700, cursor:'pointer', fontSize:'0.9rem' }}>
              ดูสินค้าทั้งหมด →
            </button>
            <button style={{ background:'rgba(255,255,255,0.15)', color:'white', padding:'10px 24px', borderRadius:'100px', border:'1.5px solid rgba(255,255,255,0.4)', fontWeight:700, cursor:'pointer', fontSize:'0.9rem', backdropFilter:'blur(8px)' }}>
              🔥 สินค้าขายดี
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'#E5E7EB' }}>
        {[['500+','สินค้า'],['4.8★','รีวิว'],['1 วัน','จัดส่ง']].map(([n,l]) => (
          <div key={l} style={{ background:'white', padding:'14px', textAlign:'center' }}>
            <div style={{ fontWeight:800, fontSize:'1.1rem', color:GREEN }}>{n}</div>
            <div style={{ fontSize:'0.7rem', color:'#9CA3AF' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* PRODUCTS */}
      <section style={{ padding:'20px 16px 32px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={{ fontWeight:700, fontSize:'1rem' }}>สินค้าแนะนำ</div>
          <span style={{ fontSize:'0.78rem', color:GREEN, fontWeight:600 }}>ดูทั้งหมด →</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {PRODUCTS.map(p => (
            <div key={p.id} style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #F3F4F6' }}>
              <div style={{ height:'130px', background:'linear-gradient(135deg,#F0FDF4,#DCFCE7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3.2rem', position:'relative' }}>
                {p.emoji}
                {p.tag && (
                  <span style={{ position:'absolute', top:'8px', left:'8px', background:GRAD, color:'white', fontSize:'0.55rem', padding:'2px 8px', borderRadius:'100px', fontWeight:700 }}>{p.tag}</span>
                )}
              </div>
              <div style={{ padding:'12px' }}>
                <div style={{ fontWeight:600, fontSize:'0.82rem', marginBottom:'2px' }}>{p.name}</div>
                <div style={{ fontSize:'0.65rem', color:'#9CA3AF', marginBottom:'8px' }}>{p.cat}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontWeight:800, fontSize:'0.95rem', background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>฿{p.price}</span>
                  <button onClick={() => setCart(c => c+1)} style={{ background:GRAD, color:'white', border:'none', borderRadius:'8px', padding:'5px 11px', fontSize:'0.7rem', fontWeight:700, cursor:'pointer' }}>+ ตะกร้า</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ background:'#1a1a2e', padding:'24px 20px', textAlign:'center' }}>
        <div style={{ fontWeight:800, fontSize:'0.9rem', background:GRAD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'6px' }}>Green Shop</div>
        <div style={{ fontSize:'0.72rem', color:'#4B5563' }}>Powered by <span style={{ color:'#ff6b00', fontWeight:700 }}>🦀 Krabbie.com</span></div>
      </footer>
    </div>
  )
}
