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
        <p style={{fontWeight:600,color:'#1a1a2e',fontSize:'12px',marginBottom:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</p>
        <p style={{fontSize:'10px',color:'#9CA3AF',marginBottom:'4px',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{item.desc}</p>
        <p style={{background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:700,fontSize:'12px'}}>฿{item.price}/วัน</p>
        {item.hours.length > 0 && (
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

      {/* DEMO BANNER */}
      <div style={{background:'linear-gradient(135deg,#E91E8C,#9C27B0)',color:'white',textAlign:'center',padding:'6px',fontSize:'11px',fontWeight:700,letterSpacing:'2px'}}>
        ✦ ตัวอย่าง Template — ระบบเช่าสินค้า ✦
      </div>

      {/* HEADER */}
      <header style={{background:'rgba(255,255,255,0.85)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(233,30,140,0.1)',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:10}}>
        <div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'17px',fontWeight:600,background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>BoBBoB Camera</div>
          <div style={{fontSize:'8px',letterSpacing:'3px',color:'#9CA3AF',textTransform:'uppercase'}}>Rental · Korat</div>
        </div>
        <div style={{display:'flex',gap:'6px'}}>
          {['📷','👕','🗓️','⭐'].map(e => (
            <div key={e} style={{width:'30px',height:'30px',borderRadius:'50%',border:'1px solid rgba(233,30,140,0.2)',background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px'}}>
              {e}
            </div>
          ))}
        </div>
      </header>

      {/* HERO */}
      <section style={{background:'linear-gradient(160deg,#fff8ff,#ffeeff,#f0f8ff)',padding:'40px 20px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
          {['8%','82%','58%','28%'].map((l,i) => (
            <div key={i} style={{position:'absolute',left:l,top:`${18+i*15}%`,fontSize:'40px',color:'#E91E8C',opacity:0.3,lineHeight:1}}>✦</div>
          ))}
        </div>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'6px 12px',borderRadius:'999px',marginBottom:'16px',background:'rgba(233,30,140,0.06)',border:'1px solid rgba(233,30,140,0.15)'}}>
            <span style={{color:'#E91E8C',fontSize:'9px'}}>✦</span>
            <span style={{fontSize:'9px',letterSpacing:'2px',color:'#E91E8C',textTransform:'uppercase'}}>บริการเช่าสินค้า</span>
          </div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'36px',fontWeight:600,lineHeight:1.1,marginBottom:'6px',background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>BoBBoB Camera</h1>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:'20px',fontWeight:400,color:'#1a1a2e',marginBottom:'16px'}}>Rental · Korat</h2>
          <div style={{display:'flex',gap:'8px',justifyContent:'center',flexWrap:'wrap'}}>
            {['📷 ดูกล้อง','✦ ดูเสื้อผ้า','🗓️ ปฏิทิน','⭐ รีวิว'].map(l => (
              <div key={l} style={{padding:'8px 16px',borderRadius:'999px',border:'1px solid rgba(233,30,140,0.2)',background:'white',color:'#6B7280',fontSize:'11px',cursor:'pointer'}}>{l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CAMERAS */}
      <section style={{padding:'40px 20px'}}>
        <p style={{fontSize:'9px',letterSpacing:'4px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'8px'}}>Equipment</p>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:600,color:'#1a1a2e',marginBottom:'4px'}}>กล้องให้เช่า</h2>
        <p style={{color:'#9CA3AF',fontSize:'12px',marginBottom:'20px'}}>กล้องคุณภาพสูง พกพาสะดวก</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
          {CAMERAS.map(c => <ItemCard key={c.id} item={c} onBook={() => { setBookItem(c); setShowBooking(true) }} />)}
        </div>
      </section>

      {/* CLOTHES */}
      <section style={{padding:'40px 20px',background:'linear-gradient(180deg,#FDFBFF,#FFF0F8)'}}>
        <p style={{fontSize:'9px',letterSpacing:'4px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'8px'}}>Collection</p>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:600,color:'#1a1a2e',marginBottom:'4px'}}>เสื้อผ้าให้เช่า</h2>
        <p style={{color:'#9CA3AF',fontSize:'12px',marginBottom:'20px'}}>เลือกสไตล์ที่ใช่</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
          {CLOTHES.map(c => <ItemCard key={c.id} item={c} onBook={() => { setBookItem(c); setShowBooking(true) }} />)}
        </div>
      </section>

      {/* MINI CALENDAR */}
      <section style={{padding:'40px 20px'}}>
        <p style={{fontSize:'9px',letterSpacing:'4px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'8px',textAlign:'center'}}>Booking Calendar</p>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:600,color:'#1a1a2e',marginBottom:'20px',textAlign:'center'}}>ตารางการจอง</h2>
        <div style={{background:'white',borderRadius:'16px',border:'1px solid rgba(233,30,140,0.1)',overflow:'hidden',maxWidth:'320px',margin:'0 auto',boxShadow:'0 4px 24px rgba(233,30,140,0.08)'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid rgba(233,30,140,0.08)'}}>
            {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => (
              <div key={d} style={{padding:'8px 2px',textAlign:'center',fontSize:'10px',fontWeight:600,color:'#E91E8C'}}>{d}</div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'4px'}}>
            {[null,null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map((d,i) => (
              <div key={i} style={{padding:'4px 2px',textAlign:'center'}}>
                <div style={{width:'24px',height:'24px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:d===7||d===15?700:400,background:d===7?'linear-gradient(135deg,#E91E8C,#9C27B0)':d===15?'rgba(233,30,140,0.08)':'transparent',color:d===7?'white':d===15?'#E91E8C':'#374151',margin:'0 auto',position:'relative'}}>
                  {d}
                  {(d===7||d===12||d===15)&&d&&<span style={{position:'absolute',bottom:'1px',left:'50%',transform:'translateX(-50%)',width:'4px',height:'4px',borderRadius:'50%',background:d===7?'white':'#F59E0B'}}/>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{padding:'40px 0',background:'linear-gradient(180deg,#FFF0F8,#FDFBFF)'}}>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:600,color:'#1a1a2e',marginBottom:'20px',textAlign:'center',padding:'0 20px'}}>รีวิวจากลูกค้า</h2>
        <div style={{display:'flex',gap:'12px',overflowX:'auto',paddingLeft:'20px',paddingRight:'20px',paddingBottom:'8px'}}>
          {[{name:'นุ่น ณัฐชา',rating:5,comment:'กล้องสวยมาก ภาพคมชัด บริการดีมากค่ะ ประทับใจมาก',img:'🌸'},{name:'ต้น วรวิทย์',rating:5,comment:'เช่าชุดกิโมโนถ่ายรูปได้สวยมาก คุ้มค่ามากครับ',img:'🎌'}].map((r,i) => (
            <div key={i} style={{width:'220px',flexShrink:0,background:'white',borderRadius:'16px',overflow:'hidden',boxShadow:'0 4px 20px rgba(233,30,140,0.08)',border:'1px solid rgba(233,30,140,0.08)'}}>
              <div style={{height:'80px',background:'linear-gradient(135deg,rgba(233,30,140,0.06),rgba(156,39,176,0.06))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'36px'}}>{r.img}</div>
              <div style={{padding:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                  <span style={{fontWeight:600,fontSize:'12px',color:'#1a1a2e'}}>{r.name}</span>
                  <span style={{color:'#E91E8C',fontSize:'11px'}}>{'★'.repeat(r.rating)}</span>
                </div>
                <p style={{color:'#6B7280',fontSize:'11px',lineHeight:1.5}}>{r.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{textAlign:'center',fontFamily:'monospace',fontSize:'11px',color:'#D1D5DB',padding:'16px'}}>
        Powered by <span style={{color:'#ff6b00'}}>🦀 Krabbie.com</span>
      </div>

      {/* BOOKING MODAL (simple demo) */}
      {showBooking && (
        <div onClick={() => setShowBooking(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
          <div onClick={e => e.stopPropagation()} style={{background:'white',borderRadius:'24px',width:'100%',maxWidth:'360px',padding:'24px',boxShadow:'0 24px 64px rgba(233,30,140,0.2)'}}>
            <div style={{textAlign:'center',marginBottom:'16px'}}>
              <div style={{fontSize:'40px',marginBottom:'8px'}}>{bookItem?.img}</div>
              <p style={{fontFamily:'Georgia,serif',fontSize:'16px',fontWeight:600,color:'#1a1a2e'}}>{bookItem?.name}</p>
              <p style={{fontSize:'12px',color:'#9CA3AF'}}>ตัวอย่าง — ในระบบจริงเลือกวันรับ-คืนได้</p>
            </div>
            <div style={{background:'rgba(233,30,140,0.04)',border:'1px solid rgba(233,30,140,0.12)',borderRadius:'14px',padding:'14px',marginBottom:'16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
              {[{l:'วันรับ',v:'15 พ.ค.'},{l:'วันคืน',v:'17 พ.ค.'},{l:'รวม',v:'2 วัน'},{l:'ราคา',v:`฿${(bookItem?.price||0)*2}`}].map(({l,v}) => (
                <div key={l} style={{textAlign:'center',padding:'8px',background:'white',borderRadius:'10px'}}>
                  <p style={{fontSize:'10px',color:'#9CA3AF',marginBottom:'2px'}}>{l}</p>
                  <p style={{fontSize:'14px',fontWeight:600,color:'#1a1a2e'}}>{v}</p>
                </div>
              ))}
            </div>
            <button style={{width:'100%',padding:'12px',borderRadius:'14px',border:'none',background:PINK,color:'white',fontSize:'14px',fontWeight:600,cursor:'pointer',boxShadow:'0 4px 20px rgba(233,30,140,0.35)',marginBottom:'8px'}}>
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
