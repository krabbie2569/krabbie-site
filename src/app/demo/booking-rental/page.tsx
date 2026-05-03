'use client'
import { useState } from 'react'

const CAMERAS = [
  { id: '1', name: 'Sony ZV-1F', desc: 'กล้องคอมแพคเซลฟี่ 4K ถ่ายวิดีโอสวย', price: 390, hours: [{h:4,p:250},{h:8,p:350}], img: '📷' },
  { id: '2', name: 'Fujifilm X-T30', desc: 'กล้อง Mirrorless สีฟิล์มสวย', price: 490, hours: [], img: '📸' },
]
const CLOTHES = [
  { id: '3', name: 'ชุดฮั้นบก เกาหลี', desc: 'สีชมพูพาสเทล ไซส์ S-L', price: 290, img: '👘' },
  { id: '4', name: 'ชุดกิโมโน ญี่ปุ่น', desc: 'สีน้ำเงิน ลายดอกไม้', price: 350, img: '🎌' },
]

const PINK = 'linear-gradient(135deg,#E91E8C,#9C27B0)'

function ItemCard({ item, onBook }: { item: any; onBook: () => void }) {
  return (
    <div style={{borderRadius:'20px',overflow:'hidden',background:'white',boxShadow:'0 4px 20px rgba(233,30,140,0.08)',border:'1px solid rgba(233,30,140,0.08)'}}>
      <div style={{height:'120px',background:'linear-gradient(135deg,#FFF0F8,#F8F0FF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px'}}>
        {item.img}
      </div>
      <div style={{padding:'10px'}}>
        <p style={{fontWeight:600,color:'#1a1a2e',fontSize:'12px',marginBottom:'2px'}}>{item.name}</p>
        <p style={{fontSize:'10px',color:'#9CA3AF',marginBottom:'4px'}}>{item.desc}</p>
        <p style={{background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:700,fontSize:'12px'}}>฿{item.price}/วัน</p>
        {item.hours?.length > 0 && (
          <div style={{display:'flex',gap:'3px',marginTop:'3px',flexWrap:'wrap'}}>
            {item.hours.map((h: any, i: number) => (
              <span key={i} style={{fontSize:'9px',color:'#9C27B0',background:'rgba(156,39,176,0.08)',padding:'1px 5px',borderRadius:'20px',fontWeight:600}}>{h.h}ชม.=฿{h.p}</span>
            ))}
          </div>
        )}
        <button onClick={onBook} style={{width:'100%',padding:'6px',borderRadius:'10px',border:'none',background:PINK,color:'white',fontSize:'11px',fontWeight:600,cursor:'pointer',marginTop:'8px'}}>จอง ✦</button>
      </div>
    </div>
  )
}

export default function DemoBookingRental() {
  const [showBooking, setShowBooking] = useState(false)
  const [bookItem, setBookItem] = useState<any>(null)

  return (
    <main style={{minHeight:'100vh',paddingBottom:'80px',background:'#FDFBFF',fontFamily:'Sarabun,sans-serif'}}>

      <div style={{background:PINK,color:'white',textAlign:'center',padding:'6px',fontSize:'11px',fontWeight:700,letterSpacing:'2px'}}>
        ✦ ตัวอย่าง Template — ระบบเช่าสินค้า ✦
      </div>

      <header style={{background:'rgba(255,255,255,0.85)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(233,30,140,0.1)',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:10}}>
        <div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'17px',fontWeight:600,background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>BoBBoB Camera</div>
          <div style={{fontSize:'8px',letterSpacing:'3px',color:'#9CA3AF',textTransform:'uppercase'}}>Rental · Korat</div>
        </div>
        <div style={{display:'flex',gap:'6px'}}>
          {['📷','👕','🗓️','⭐'].map(e => (
            <div key={e} style={{width:'30px',height:'30px',borderRadius:'50%',border:'1px solid rgba(233,30,140,0.2)',background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px'}}>{e}</div>
          ))}
        </div>
      </header>

      <section style={{background:'linear-gradient(160deg,#fff8ff,#ffeeff,#f0f8ff)',padding:'40px 20px',textAlign:'center'}}>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:'36px',fontWeight:600,lineHeight:1.1,marginBottom:'6px',background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>BoBBoB Camera</h1>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:'20px',fontWeight:400,color:'#1a1a2e',marginBottom:'16px'}}>Rental · Korat</h2>
      </section>

      <section style={{padding:'40px 20px'}}>
        <p style={{fontSize:'9px',letterSpacing:'4px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'8px'}}>Equipment</p>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:600,color:'#1a1a2e',marginBottom:'20px'}}>กล้องให้เช่า</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
          {CAMERAS.map(c => <ItemCard key={c.id} item={c} onBook={() => { setBookItem(c); setShowBooking(true) }} />)}
        </div>
      </section>

      <section style={{padding:'40px 20px',background:'linear-gradient(180deg,#FDFBFF,#FFF0F8)'}}>
        <p style={{fontSize:'9px',letterSpacing:'4px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'8px'}}>Collection</p>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:600,color:'#1a1a2e',marginBottom:'20px'}}>เสื้อผ้าให้เช่า</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
          {CLOTHES.map(c => <ItemCard key={c.id} item={c} onBook={() => { setBookItem(c); setShowBooking(true) }} />)}
        </div>
      </section>

      <div style={{textAlign:'center',fontFamily:'monospace',fontSize:'11px',color:'#D1D5DB',padding:'16px'}}>
        Powered by <span style={{color:'#ff6b00'}}>🦀 Krabbie.com</span>
      </div>

      {showBooking && (
        <div onClick={() => setShowBooking(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
          <div onClick={e => e.stopPropagation()} style={{background:'white',borderRadius:'24px',width:'100%',maxWidth:'360px',padding:'24px'}}>
            <div style={{textAlign:'center',marginBottom:'16px'}}>
              <div style={{fontSize:'40px',marginBottom:'8px'}}>{bookItem?.img}</div>
              <p style={{fontFamily:'Georgia,serif',fontSize:'16px',fontWeight:600,color:'#1a1a2e'}}>{bookItem?.name}</p>
              <p style={{fontSize:'12px',color:'#9CA3AF'}}>ตัวอย่าง — เลือกวันรับ-คืนได้ในระบบจริง</p>
            </div>
            <button style={{width:'100%',padding:'12px',borderRadius:'14px',border:'none',background:PINK,color:'white',fontSize:'14px',fontWeight:600,cursor:'pointer',marginBottom:'8px'}}>
              ยืนยันการจอง →
            </button>
            <button onClick={() => setShowBooking(false)} style={{width:'100%',padding:'12px',borderRadius:'14px',border:'1.5px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:'14px',cursor:'pointer'}}>
              ปิด
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
