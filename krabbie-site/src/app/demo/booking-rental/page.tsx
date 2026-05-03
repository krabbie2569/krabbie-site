'use client'
import { useState } from 'react'

const CAMERAS = [
  { id: 'cam-1', name: 'Sony ZV-1F',     desc: 'กล้องคอมแพค 4K เซลฟี่สวย ถ่ายวิดีโอเนียน', price: 390, daily: [{d:3,p:999},{d:7,p:1990}], hourly: [{h:4,p:250},{h:8,p:350}], emoji: '📷' },
  { id: 'cam-2', name: 'Fujifilm X-T30',  desc: 'Mirrorless สีฟิล์มสวย โหมดถ่ายครบ',          price: 490, daily: [{d:3,p:1290},{d:7,p:2790}], hourly: [],                          emoji: '📸' },
]
const CLOTHES = [
  { id: 'cls-1', name: 'ชุดฮั้นบก เกาหลี', desc: 'สีชมพูพาสเทล ไซส์ S–L พร้อมอุปกรณ์',          price: 290, daily: [], hourly: [], emoji: '👘' },
  { id: 'cls-2', name: 'ชุดกิโมโน ญี่ปุ่น', desc: 'สีน้ำเงินลายดอกไม้ ไซส์ XS–L พร้อมสายคาด', price: 350, daily: [], hourly: [], emoji: '🎌' },
]
type Item = typeof CAMERAS[number]

const PINK   = 'linear-gradient(135deg,#E91E8C,#9C27B0)'
const MONTH_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const DAY_TH   = ['อา','จ','อ','พ','พฤ','ศ','ส']

/* ── Booking Modal ───────────────────────────────────────── */
function BookingModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const [step,          setStep]          = useState<'cal'|'info'|'done'>('cal')
  const [dateFrom,      setDateFrom]      = useState('')
  const [dateTo,        setDateTo]        = useState('')
  const [picking,       setPicking]       = useState<'from'|'to'>('from')
  const [calView,       setCalView]       = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selHourly,     setSelHourly]     = useState<{h:number;p:number}|null>(null)
  const [form,          setForm]          = useState({ name:'', phone:'', note:'' })
  const [loading,       setLoading]       = useState(false)
  const [bookRef,       setBookRef]       = useState('')

  const today = new Date().toISOString().slice(0,10)

  function handleCalClick(ds: string) {
    if (ds < today) return
    if (picking === 'from') {
      setDateFrom(ds); setDateTo(ds); setSelHourly(null); setPicking('to')
    } else {
      if (ds < dateFrom) { setDateFrom(ds); setDateTo(ds); setSelHourly(null); setPicking('to') }
      else { setDateTo(ds); setSelHourly(null); setPicking('from') }
    }
  }

  function renderCal() {
    const y = calView.getFullYear(), m = calView.getMonth()
    const first = new Date(y,m,1).getDay()
    const total = new Date(y,m+1,0).getDate()
    const cells: React.ReactNode[] = []
    for (let i = 0; i < first; i++) cells.push(<div key={`e${i}`}/>)
    for (let d = 1; d <= total; d++) {
      const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const past   = ds < today
      const isFrom = ds === dateFrom
      const isTo   = ds === dateTo
      const inRange = dateFrom && dateTo && ds > dateFrom && ds < dateTo
      let bg = 'transparent', color = '#374151', border = '1px solid transparent'
      if (past)            { color = '#D1D5DB' }
      else if (isFrom||isTo) { bg = PINK; color = 'white' }
      else if (inRange)    { bg = 'rgba(233,30,140,0.1)'; color = '#E91E8C' }
      else if (ds===today) { border = '1.5px solid #E91E8C'; color = '#E91E8C' }
      cells.push(
        <button key={ds} disabled={past} onClick={() => handleCalClick(ds)}
          style={{width:'100%',aspectRatio:'1',borderRadius:'8px',border,background:bg,color,fontSize:'13px',fontWeight:isFrom||isTo?700:400,cursor:past?'not-allowed':'pointer',transition:'all 0.15s'}}>
          {d}
        </button>
      )
    }
    return cells
  }

  const days    = dateFrom && dateTo ? Math.max(1, Math.ceil((+new Date(dateTo) - +new Date(dateFrom))/86400000)+1) : 0
  const single  = dateFrom && dateTo && dateFrom===dateTo
  const hp      = single ? item.hourly : []
  const getTotal = () => {
    if (selHourly) return selHourly.p
    if (!days) return 0
    const match = item.daily.find((r: any) => r.d === days)
    return match ? match.p : days * item.price
  }
  const total   = getTotal()
  const canNext = !!(dateFrom && dateTo)

  async function handleConfirm() {
    if (!form.name.trim() || !form.phone.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setBookRef('RNT-' + Math.random().toString(36).slice(2,8).toUpperCase())
    setLoading(false)
    setStep('done')
  }

  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
      <div onClick={e => e.stopPropagation()}
        style={{background:'white',borderRadius:'24px',width:'100%',maxWidth:'420px',maxHeight:'90dvh',overflowY:'auto',overscrollBehavior:'contain',boxShadow:'0 24px 64px rgba(233,30,140,0.2)'}}>

        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}>
          <div style={{width:'40px',height:'4px',background:'#E5E7EB',borderRadius:'2px'}}/>
        </div>

        {/* header */}
        <div style={{padding:'12px 24px 16px',borderBottom:'1px solid rgba(233,30,140,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <p style={{fontSize:'10px',letterSpacing:'3px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'4px'}}>จองสินค้า</p>
            <h3 style={{fontFamily:'Georgia,serif',fontSize:'17px',color:'#1a1a2e',fontWeight:600}}>{item.emoji} {item.name}</h3>
          </div>
          <button onClick={onClose} style={{width:'32px',height:'32px',borderRadius:'50%',background:'#F3F4F6',border:'none',fontSize:'16px',cursor:'pointer',color:'#6B7280',flexShrink:0}}>✕</button>
        </div>

        {/* step dots */}
        <div style={{padding:'14px 24px',borderBottom:'1px solid rgba(233,30,140,0.06)',display:'flex',alignItems:'center',gap:'6px'}}>
          {[['cal','เลือกวัน'],['info','ข้อมูล'],['done','เสร็จ']].map(([id,label],i) => (
            <div key={id} style={{display:'flex',alignItems:'center',gap:'6px',flex:i<2?1:'auto'}}>
              <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                <div style={{width:'24px',height:'24px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:600,
                  background: step===id||(['info','done'].includes(step)&&i===0)||(step==='done'&&i===1) ? PINK : '#F3F4F6',
                  color:      step===id||(['info','done'].includes(step)&&i===0)||(step==='done'&&i===1) ? 'white' : '#9CA3AF',
                }}>{i+1}</div>
                <span style={{fontSize:'11px',color:step===id?'#E91E8C':'#9CA3AF'}}>{label}</span>
              </div>
              {i < 2 && <div style={{flex:1,height:'1px',background:'rgba(233,30,140,0.15)'}}/>}
            </div>
          ))}
        </div>

        <div style={{padding:'24px'}}>

          {/* STEP 1: Calendar */}
          {step === 'cal' && (
            <div>
              {/* Pill tabs */}
              <div style={{display:'flex',gap:'8px',marginBottom:'20px'}}>
                {[{label:'รับวันที่',val:dateFrom,which:'from' as const},{label:'คืนวันที่',val:dateTo,which:'to' as const}].map(({label,val,which}) => {
                  const active = picking===which
                  return (
                    <button key={which} onClick={() => setPicking(which)}
                      style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',padding:'10px 12px',borderRadius:'999px',border:active?'none':'1.5px solid rgba(233,30,140,0.3)',background:active?PINK:'white',color:active?'white':'#9CA3AF',cursor:'pointer',fontSize:'13px',fontWeight:active?700:400,transition:'all 0.2s',boxShadow:active?'0 4px 14px rgba(233,30,140,0.3)':'none'}}>
                      📅 <span>{label}<span style={{marginLeft:'6px',fontFamily:'Georgia,serif',fontWeight:700,color:active?'rgba(255,255,255,0.95)':(val?'#1a1a2e':'#D1D5DB')}}>{val?val.slice(5).replace('-','/'):'—'}</span></span>
                    </button>
                  )
                })}
              </div>

              {/* Calendar */}
              <div style={{marginBottom:'16px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
                  <button onClick={() => setCalView(p => new Date(p.getFullYear(),p.getMonth()-1,1))}
                    style={{width:'32px',height:'32px',borderRadius:'50%',background:'#F9F9F9',border:'none',cursor:'pointer',fontSize:'16px',color:'#6B7280',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
                  <span style={{fontFamily:'Georgia,serif',fontSize:'15px',color:'#1a1a2e',fontWeight:600}}>{MONTH_TH[calView.getMonth()]} {calView.getFullYear()+543}</span>
                  <button onClick={() => setCalView(p => new Date(p.getFullYear(),p.getMonth()+1,1))}
                    style={{width:'32px',height:'32px',borderRadius:'50%',background:'#F9F9F9',border:'none',cursor:'pointer',fontSize:'16px',color:'#6B7280',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px',marginBottom:'4px'}}>
                  {DAY_TH.map(d => <div key={d} style={{textAlign:'center',fontSize:'11px',color:'#9CA3AF',padding:'4px 0'}}>{d}</div>)}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px'}}>
                  {renderCal()}
                </div>
              </div>

              {/* Hourly options */}
              {hp.length > 0 && (
                <div style={{marginBottom:'16px'}}>
                  <p style={{fontSize:'12px',fontWeight:600,color:'#1a1a2e',marginBottom:'8px'}}>เช่ารายชั่วโมง (วันเดียว)</p>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    {hp.map((h: any,i: number) => (
                      <button key={i} onClick={() => setSelHourly(selHourly?.h===h.h?null:h)}
                        style={{padding:'8px 16px',borderRadius:'12px',border:`1.5px solid ${selHourly?.h===h.h?'#9C27B0':'rgba(156,39,176,0.2)'}`,background:selHourly?.h===h.h?'rgba(156,39,176,0.08)':'white',fontSize:'13px',fontWeight:600,cursor:'pointer',color:selHourly?.h===h.h?'#7B1FA2':'#374151'}}>
                        {h.h} ชม. = ฿{h.p.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price summary */}
              {days > 0 && (
                <div style={{padding:'14px',borderRadius:'14px',background:'rgba(233,30,140,0.04)',border:'1px solid rgba(233,30,140,0.12)',marginBottom:'20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:'13px',color:'#6B7280'}}>{selHourly?`เช่า ${selHourly.h} ชั่วโมง`:`เช่า ${days} วัน`}</span>
                  <span style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:700,background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>฿{total.toLocaleString()}</span>
                </div>
              )}

              <button disabled={!canNext} onClick={() => setStep('info')}
                style={{width:'100%',padding:'14px',borderRadius:'14px',border:'none',background:canNext?PINK:'#E5E7EB',color:canNext?'white':'#9CA3AF',fontSize:'15px',fontWeight:600,cursor:canNext?'pointer':'not-allowed',boxShadow:canNext?'0 4px 20px rgba(233,30,140,0.35)':'none',transition:'all 0.2s'}}>
                ถัดไป →
              </button>
            </div>
          )}

          {/* STEP 2: Customer info */}
          {step === 'info' && (
            <div>
              {[{k:'name',label:'ชื่อผู้เช่า *',ph:'ชื่อ-นามสกุล',type:'text'},{k:'phone',label:'เบอร์โทร *',ph:'0812345678',type:'tel'},{k:'note',label:'หมายเหตุ',ph:'แจ้งขนาด / สีที่ต้องการ...',type:'text'}].map(({k,label,ph,type}) => (
                <div key={k} style={{marginBottom:'16px'}}>
                  <p style={{fontSize:'11px',color:'#9CA3AF',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>{label}</p>
                  <input type={type} value={(form as any)[k]} placeholder={ph}
                    onChange={e => setForm(p => ({...p,[k]:e.target.value}))}
                    style={{width:'100%',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'12px 14px',fontSize:'14px',outline:'none',color:'#1a1a2e',fontFamily:'inherit',boxSizing:'border-box' as const}} />
                </div>
              ))}
              <div style={{padding:'12px 16px',borderRadius:'12px',background:'rgba(233,30,140,0.04)',border:'1px solid rgba(233,30,140,0.12)',marginBottom:'20px',display:'flex',justifyContent:'space-between',fontSize:'13px',color:'#6B7280'}}>
                <span>{dateFrom.slice(5).replace('-','/')} → {dateTo.slice(5).replace('-','/')}</span>
                <span style={{fontWeight:700,color:'#E91E8C'}}>฿{total.toLocaleString()}</span>
              </div>
              <div style={{display:'flex',gap:'12px'}}>
                <button onClick={() => setStep('cal')}
                  style={{flex:1,padding:'14px',borderRadius:'14px',border:'1.5px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:'15px',cursor:'pointer'}}>
                  ← ย้อนกลับ
                </button>
                <button disabled={loading||!form.name.trim()||!form.phone.trim()} onClick={handleConfirm}
                  style={{flex:2,padding:'14px',borderRadius:'14px',border:'none',background:form.name.trim()&&form.phone.trim()?PINK:'#E5E7EB',color:form.name.trim()&&form.phone.trim()?'white':'#9CA3AF',fontSize:'15px',fontWeight:600,cursor:loading||!form.name.trim()||!form.phone.trim()?'not-allowed':'pointer',boxShadow:form.name.trim()&&form.phone.trim()?'0 4px 20px rgba(233,30,140,0.35)':'none'}}>
                  {loading?'กำลังจอง...':'ยืนยันการจอง →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === 'done' && (
            <div style={{textAlign:'center'}}>
              <div style={{width:'64px',height:'64px',borderRadius:'50%',background:PINK,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:'28px'}}>✓</div>
              <h3 style={{fontFamily:'Georgia,serif',fontSize:'20px',color:'#1a1a2e',marginBottom:'8px'}}>จองสำเร็จแล้ว!</h3>
              <p style={{fontSize:'13px',color:'#9CA3AF',marginBottom:'20px'}}>เราจะติดต่อยืนยันไปยังเบอร์โทรของคุณ</p>
              <div style={{background:'rgba(233,30,140,0.04)',border:'1px solid rgba(233,30,140,0.12)',borderRadius:'14px',padding:'14px',textAlign:'left',marginBottom:'20px'}}>
                {[{l:'สินค้า',v:`${item.emoji} ${item.name}`},{l:'วันรับ',v:dateFrom},{l:'วันคืน',v:dateTo},{l:'ราคารวม',v:`฿${total.toLocaleString()}`},{l:'ชื่อ',v:form.name},{l:'เบอร์',v:form.phone}].map(({l,v}) => (
                  <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:'13px',padding:'4px 0',borderBottom:'1px solid rgba(233,30,140,0.06)'}}>
                    <span style={{color:'#9CA3AF'}}>{l}</span><span style={{color:'#1a1a2e',fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:'rgba(233,30,140,0.04)',border:'1px solid rgba(233,30,140,0.12)',borderRadius:'12px',padding:'10px 16px',fontFamily:'monospace',color:'#E91E8C',fontSize:'14px',fontWeight:700,marginBottom:'20px'}}>
                {bookRef}
              </div>
              <button onClick={onClose}
                style={{width:'100%',padding:'14px',borderRadius:'14px',border:'1.5px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:'15px',cursor:'pointer'}}>
                ปิด
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

/* ── Item Card ───────────────────────────────────────────── */
function ItemCard({ item, onBook }: { item: Item; onBook: () => void }) {
  return (
    <div style={{borderRadius:'20px',overflow:'hidden',background:'white',boxShadow:'0 4px 20px rgba(233,30,140,0.08)',border:'1px solid rgba(233,30,140,0.08)'}}>
      <div style={{height:'120px',background:'linear-gradient(135deg,#FFF0F8,#F8F0FF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px'}}>
        {item.emoji}
      </div>
      <div style={{padding:'10px'}}>
        <p style={{fontWeight:600,color:'#1a1a2e',fontSize:'12px',marginBottom:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</p>
        <p style={{fontSize:'10px',color:'#9CA3AF',marginBottom:'4px',display:'-webkit-box' as const,WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const,overflow:'hidden'}}>{item.desc}</p>
        <p style={{background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:700,fontSize:'12px'}}>฿{item.price}/วัน</p>
        {item.hourly.length > 0 && (
          <div style={{display:'flex',gap:'3px',marginTop:'3px',flexWrap:'wrap' as const}}>
            {item.hourly.map((h,i) => (
              <span key={i} style={{fontSize:'9px',color:'#9C27B0',background:'rgba(156,39,176,0.08)',padding:'1px 5px',borderRadius:'20px',fontWeight:600}}>{h.h}ชม.=฿{h.p}</span>
            ))}
          </div>
        )}
        <button onClick={onBook} style={{width:'100%',padding:'6px',borderRadius:'10px',border:'none',background:PINK,color:'white',fontSize:'11px',fontWeight:600,cursor:'pointer',marginTop:'8px'}}>
          จอง ✦
        </button>
      </div>
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────── */
export default function DemoBookingRental() {
  const [bookItem, setBookItem] = useState<Item | null>(null)

  return (
    <main style={{minHeight:'100vh',paddingBottom:'80px',background:'#FDFBFF',fontFamily:'Sarabun,sans-serif'}}>

      {/* DEMO BANNER */}
      <div style={{background:PINK,color:'white',textAlign:'center',padding:'6px',fontSize:'11px',fontWeight:700,letterSpacing:'2px'}}>
        ✦ ตัวอย่าง Template — ระบบเช่าสินค้า ✦
      </div>

      {/* HEADER */}
      <header style={{background:'rgba(255,255,255,0.85)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(233,30,140,0.1)',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:10}}>
        <div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'17px',fontWeight:600,background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>BoBBoB Camera Korat</div>
          <div style={{fontSize:'8px',letterSpacing:'3px',color:'#9CA3AF',textTransform:'uppercase'}}>Stylist & Camera Rental · Korat</div>
        </div>
        <div style={{display:'flex',gap:'6px'}}>
          {['📷','👕','⭐'].map(e => (
            <div key={e} style={{width:'30px',height:'30px',borderRadius:'50%',border:'1px solid rgba(233,30,140,0.2)',background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px'}}>{e}</div>
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
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'36px',fontWeight:600,lineHeight:1.1,marginBottom:'6px',background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>BoBBoB Camera Korat</h1>
          <p style={{fontSize:'11px',color:'#6B7280',maxWidth:'260px',margin:'0 auto 16px',lineHeight:1.6}}>สไตลิสต์และช่างภาพมืออาชีพ ให้เช่าเสื้อผ้าแฟชั่นและกล้องคอมแพคคุณภาพสูง</p>
          <div style={{display:'flex',gap:'8px',justifyContent:'center',flexWrap:'wrap'}}>
            {['📷 ดูกล้อง','✦ ดูเสื้อผ้า','⭐ รีวิว'].map(l => (
              <div key={l} style={{padding:'8px 16px',borderRadius:'999px',border:'1px solid rgba(233,30,140,0.2)',background:'white',color:'#6B7280',fontSize:'11px'}}>{l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CAMERAS */}
      <section style={{padding:'40px 20px'}}>
        <p style={{fontSize:'9px',letterSpacing:'4px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'8px'}}>Equipment</p>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:600,color:'#1a1a2e',marginBottom:'4px'}}>กล้องให้เช่า</h2>
        <p style={{color:'#9CA3AF',fontSize:'12px',marginBottom:'20px'}}>กล้องคอมแพคคุณภาพสูง พกพาสะดวก</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
          {CAMERAS.map(c => <ItemCard key={c.id} item={c} onBook={() => setBookItem(c)} />)}
        </div>
      </section>

      {/* CLOTHES */}
      <section style={{padding:'40px 20px',background:'linear-gradient(180deg,#FDFBFF,#FFF0F8)'}}>
        <p style={{fontSize:'9px',letterSpacing:'4px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'8px'}}>Collection</p>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:'22px',fontWeight:600,color:'#1a1a2e',marginBottom:'4px'}}>เสื้อผ้าให้เช่า</h2>
        <p style={{color:'#9CA3AF',fontSize:'12px',marginBottom:'20px'}}>เลือกสไตล์ที่ใช่สำหรับทุกโอกาส</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
          {CLOTHES.map(c => <ItemCard key={c.id} item={c} onBook={() => setBookItem(c)} />)}
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

      {/* BOOKING MODAL */}
      {bookItem && <BookingModal item={bookItem} onClose={() => setBookItem(null)} />}
    </main>
  )
}
