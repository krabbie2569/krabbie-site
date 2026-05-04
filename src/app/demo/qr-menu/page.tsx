'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'

const MENU = [
  { id:'1', cat:'อาหารจานเดียว', name:'ข้าวผัดกะเพราไก่ไข่ดาว', price:75,  emoji:'🍳', hot:true,  tag:'ยอดนิยม' },
  { id:'2', cat:'อาหารจานเดียว', name:'ผัดไทยกุ้งสด',           price:95,  emoji:'🍜', hot:false, tag:'' },
  { id:'3', cat:'อาหารจานเดียว', name:'ข้าวมันไก่ต้ม',           price:70,  emoji:'🍗', hot:false, tag:'' },
  { id:'4', cat:'อาหารจานหลัก',  name:'ต้มยำกุ้งน้ำข้น',        price:150, emoji:'🍲', hot:true,  tag:'แนะนำ' },
  { id:'5', cat:'อาหารจานหลัก',  name:'แกงเขียวหวานไก่',         price:130, emoji:'🥘', hot:false, tag:'' },
  { id:'6', cat:'เครื่องดื่ม',   name:'ชาไทยเย็น',               price:40,  emoji:'🧋', hot:false, tag:'' },
  { id:'7', cat:'เครื่องดื่ม',   name:'กาแฟโบราณเย็น',           price:50,  emoji:'☕', hot:false, tag:'' },
  { id:'8', cat:'ของหวาน',       name:'ข้าวเหนียวมะม่วง',        price:80,  emoji:'🥭', hot:true,  tag:'ตามฤดูกาล' },
]

const CATS = ['ทั้งหมด', 'อาหารจานเดียว', 'อาหารจานหลัก', 'เครื่องดื่ม', 'ของหวาน']
const YELLOW = '#F59E0B'
const GRAD   = 'linear-gradient(135deg,#F59E0B,#D97706)'

export default function DemoQRMenu() {
  const [cat, setCat]     = useState('ทั้งหมด')
  const [order, setOrder] = useState(0)
  const filtered = cat === 'ทั้งหมด' ? MENU : MENU.filter(m => m.cat === cat)

  return (
    <div style={{ minHeight:'100vh', background:'#FFFBEB', fontFamily:'Sarabun,sans-serif', color:'#1a1a2e' }}>

      {/* DEMO BADGE */}
      <div style={{ background:GRAD, color:'white', padding:'8px 16px', fontSize:'0.72rem', fontWeight:700, letterSpacing:'1px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <a href="/" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none' }}>← หน้าแรก</a>
        <span style={{ letterSpacing:'2px' }}>✦ ตัวอย่าง Template · QR เมนูอาหาร</span>
        <a href="/dashboard/new?template=qr-menu" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'underline' }}>ใช้ template →</a>
      </div>

      {/* HEADER */}
      <header style={{ background:'#1a0f00', padding:'20px 20px 16px', textAlign:'center', position:'relative' }}>
        <div style={{ position:'absolute', top:'14px', right:'16px', background:GRAD, color:'white', borderRadius:'100px', padding:'5px 13px', fontSize:'0.75rem', fontWeight:700 }}>
          🛒 {order}
        </div>
        <div style={{ fontSize:'2.8rem', marginBottom:'6px' }}>🍜</div>
        <div style={{ fontWeight:800, fontSize:'1.3rem', color:'white', marginBottom:'2px' }}>ร้านอร่อยใจ</div>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.78rem', marginBottom:'10px' }}>โคราช · เปิด 10:00–21:00 · ☎ 044-123-456</div>
        <div style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap' }}>
          {['🚗 มีที่จอดรถ','💳 รับบัตร','🌶️ ปรับความเผ็ดได้'].map(t => (
            <span key={t} style={{ background:'rgba(245,158,11,0.15)', color:YELLOW, padding:'3px 10px', borderRadius:'100px', fontSize:'0.65rem', fontWeight:600 }}>{t}</span>
          ))}
        </div>
      </header>

      {/* CATEGORY TABS */}
      <div style={{ display:'flex', gap:'8px', padding:'14px 16px 8px', overflowX:'auto', background:'white', borderBottom:'1px solid #F3F4F6', position:'sticky', top:0, zIndex:10 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ flexShrink:0, padding:'6px 15px', borderRadius:'100px', border:`1.5px solid ${cat===c?YELLOW:'#E5E7EB'}`, background:cat===c?YELLOW:'white', color:cat===c?'white':'#6B7280', fontWeight:700, fontSize:'0.78rem', cursor:'pointer', transition:'all 0.15s', fontFamily:'Sarabun,sans-serif' }}>
            {c}
          </button>
        ))}
      </div>

      {/* MENU ITEMS */}
      <div style={{ padding:'12px 16px 80px', display:'flex', flexDirection:'column', gap:'10px' }}>
        {filtered.map(m => (
          <div key={m.id} style={{ background:'white', borderRadius:'16px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'14px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', border:'1px solid #FEF3C7', position:'relative' }}>
            {m.tag && (
              <span style={{ position:'absolute', top:'-6px', right:'12px', background:GRAD, color:'white', fontSize:'0.55rem', padding:'2px 8px', borderRadius:'100px', fontWeight:700 }}>{m.tag}</span>
            )}
            <div style={{ width:'60px', height:'60px', borderRadius:'12px', background:'linear-gradient(135deg,#FEF3C7,#FDE68A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', flexShrink:0 }}>
              {m.emoji}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:'0.88rem', marginBottom:'2px' }}>{m.name}</div>
              <div style={{ fontSize:'0.68rem', color:'#9CA3AF' }}>{m.cat}{m.hot ? ' · 🌶️ เผ็ด' : ''}</div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontWeight:800, color:YELLOW, fontSize:'1rem' }}>฿{m.price}</div>
              <button onClick={() => setOrder(o => o+1)} style={{ background:GRAD, color:'white', border:'none', borderRadius:'8px', padding:'5px 12px', fontSize:'0.7rem', fontWeight:700, cursor:'pointer', marginTop:'5px', fontFamily:'Sarabun,sans-serif' }}>
                + สั่ง
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ORDER BAR */}
      {order > 0 && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, padding:'12px 16px', background:'white', borderTop:'2px solid #FDE68A', display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:50, boxShadow:'0 -4px 20px rgba(245,158,11,0.15)' }}>
          <div>
            <div style={{ fontWeight:700, fontSize:'0.9rem' }}>{order} รายการในออเดอร์</div>
            <div style={{ fontSize:'0.72rem', color:'#9CA3AF' }}>แจ้งพนักงานเพื่อยืนยัน</div>
          </div>
          <button style={{ background:GRAD, color:'white', border:'none', borderRadius:'100px', padding:'10px 22px', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'Sarabun,sans-serif' }}>
            สั่งอาหาร →
          </button>
        </div>
      )}

      <div style={{ textAlign:'center', fontFamily:'monospace', fontSize:'0.68rem', color:'#9CA3AF', padding:'20px 0 100px' }}>
        Powered by <span style={{ color:'#ff6b00', fontWeight:700 }}>🦀 Krabbie.com</span>
      </div>
    </div>
  )
}
