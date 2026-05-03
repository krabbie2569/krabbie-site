'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import RentalBookingModal from './RentalBookingModal'

type RentalItem = {
  id: string
  name: string
  description: string | null
  category: string
  price_per_day: number
  hourly_pricing: { hours: number; price: number }[]
  daily_pricing:  { days: number;  price: number }[]
  images: string[]
  is_available: boolean
  sort_order: number
}

type RentalReview = {
  id: string
  customer_name: string
  rating: number
  comment: string | null
  images: string[]
  created_at: string
  likes?: number
}

interface Props {
  tenantId:       string
  tenantName:     string
  tenantSubtitle?: string
  lineUrl?:       string
}

const MONTH_TH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const DAY_TH   = ['อา','จ','อ','พ','พฤ','ศ','ส']
const PINK      = 'linear-gradient(135deg,#E91E8C,#9C27B0)'

const BIG_STARS = [
  {l:'8%',t:'18%',s:'72px',d:'0s',dur:'7s'},{l:'82%',t:'8%',s:'56px',d:'1s',dur:'9s'},
  {l:'58%',t:'68%',s:'88px',d:'2s',dur:'6s'},{l:'28%',t:'72%',s:'64px',d:'0.5s',dur:'8s'},
]

function Sparkles() {
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
      {BIG_STARS.map((s,i)=>(
        <div key={i} className="animate-bigstar"
          style={{position:'absolute',left:s.l,top:s.t,fontSize:s.s,color:'#E91E8C',animationDelay:s.d,animationDuration:s.dur,lineHeight:1,userSelect:'none',opacity:0.5}}>✦</div>
      ))}
    </div>
  )
}

function HourlyBadges({ item }: { item: RentalItem }) {
  const hp = item.hourly_pricing || []
  if (!hp.length) return null
  return (
    <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginTop:'6px'}}>
      {hp.map((h,i)=>(
        <span key={i} style={{fontSize:'10px',color:'#9C27B0',background:'rgba(156,39,176,0.08)',padding:'2px 7px',borderRadius:'20px',fontWeight:600}}>
          {h.hours}ชม.=฿{h.price}
        </span>
      ))}
    </div>
  )
}

function ItemCard({ item, onBook }: { item: RentalItem; onBook: () => void }) {
  return (
    <div style={{borderRadius:'20px',overflow:'hidden',background:'white',boxShadow:'0 4px 20px rgba(233,30,140,0.08)',border:'1px solid rgba(233,30,140,0.08)',opacity:item.is_available?1:0.75}}>
      <div style={{position:'relative',height:'160px',background:'linear-gradient(135deg,#FFF0F8,#F8F0FF)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
        {item.images?.[0]
          ? <img src={item.images[0]} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',display:'block'}}/>
          : <span style={{fontSize:'48px',opacity:0.3}}>{item.category==='camera'?'📷':'👕'}</span>}
        {!item.is_available && (
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.35)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{background:'#F59E0B',color:'white',fontSize:'11px',fontWeight:700,padding:'4px 12px',borderRadius:'20px'}}>🔧 ปรับปรุง</span>
          </div>
        )}
      </div>
      <div style={{padding:'12px'}}>
        <p style={{fontWeight:500,color:'#1a1a2e',fontSize:'13px',marginBottom:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</p>
        {item.description && <p style={{fontSize:'11px',color:'#9CA3AF',marginBottom:'4px',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{item.description}</p>}
        <p style={{background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:700,fontSize:'13px'}}>฿{item.price_per_day} / วัน</p>
        <HourlyBadges item={item}/>
        {item.is_available
          ? <button onClick={onBook} style={{width:'100%',padding:'8px',borderRadius:'10px',border:'none',background:PINK,color:'white',fontSize:'12px',fontWeight:600,cursor:'pointer',marginTop:'10px'}}>จอง ✦</button>
          : <div style={{width:'100%',padding:'8px',borderRadius:'10px',background:'#FEF3C7',color:'#D97706',fontSize:'12px',fontWeight:600,marginTop:'10px',textAlign:'center'}}>🔧 อยู่ระหว่างปรับปรุง</div>
        }
      </div>
    </div>
  )
}

function ItemsGrid({ items, tenantId, lineUrl }: { items: RentalItem[]; tenantId: string; lineUrl?: string }) {
  const [bookingItem, setBookingItem] = useState<RentalItem|null>(null)
  const [showAll, setShowAll]         = useState(false)
  const PREVIEW = 4
  const shown   = showAll ? items : items.slice(0, PREVIEW)

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        {shown.map(item => (
          <ItemCard key={item.id} item={item} onBook={() => setBookingItem(item)} />
        ))}
      </div>

      {items.length > PREVIEW && !showAll && (
        <div style={{display:'flex',justifyContent:'center',marginTop:'24px'}}>
          <button onClick={() => setShowAll(true)} style={{padding:'11px 28px',borderRadius:'999px',border:'1.5px solid rgba(233,30,140,0.3)',background:'white',color:'#E91E8C',fontSize:'13px',fontWeight:600,cursor:'pointer',boxShadow:'0 2px 12px rgba(233,30,140,0.1)'}}>
            ✦ ดูสินค้าทั้งหมด {items.length} รายการ
          </button>
        </div>
      )}

      {bookingItem && (
        <RentalBookingModal
          item={bookingItem}
          tenantId={tenantId}
          lineUrl={lineUrl}
          onClose={() => setBookingItem(null)}
        />
      )}
    </div>
  )
}

export default function RentalShopPage({ tenantId, tenantName, tenantSubtitle, lineUrl }: Props) {
  const [items,        setItems]        = useState<RentalItem[]>([])
  const [reviews,      setReviews]      = useState<RentalReview[]>([])
  const [bookedDates,  setBookedDates]  = useState<{ date: string; status: string }[]>([])
  const [calMonth,     setCalMonth]     = useState(new Date())
  const [activeNav,    setActiveNav]    = useState('')
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set())
  const [gallery,      setGallery]      = useState<string[]|null>(null)
  const [galIdx,       setGalIdx]       = useState(0)

  const [reviewForm,   setReviewForm]   = useState({ customer_name: '', rating: 5, comment: '' })
  const [reviewImages, setReviewImages] = useState<string[]>([])
  const [uploading,    setUploading]    = useState(false)
  const [sent,         setSent]         = useState(false)

  useEffect(() => {
    const supabase = createClient() as any

    supabase
      .from('rental_items')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_available', true)
      .order('sort_order')
      .then(({ data }: any) => setItems(data || []))

    supabase
      .from('rental_reviews')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .then(({ data }: any) => setReviews(data || []))

    supabase
      .from('rental_bookings')
      .select('date_from, date_to, status')
      .eq('tenant_id', tenantId)
      .in('status', ['confirmed', 'pending'])
      .then(({ data }: any) => {
        const dates: { date: string; status: string }[] = []
        ;(data || []).forEach((b: any) => {
          const cur = new Date(b.date_from)
          const end = new Date(b.date_to)
          while (cur <= end) {
            dates.push({ date: cur.toISOString().slice(0, 10), status: b.status })
            cur.setDate(cur.getDate() + 1)
          }
        })
        setBookedDates(dates)
      })

    const liked = JSON.parse(localStorage.getItem(`liked_reviews_${tenantId}`) || '[]')
    setLikedReviews(new Set(liked))
  }, [tenantId])

  const scrollTo = (id: string) => {
    setActiveNav(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const cameras = items.filter(i => i.category === 'camera')
  const clothes  = items.filter(i => i.category === 'clothes')
  const others   = items.filter(i => i.category !== 'camera' && i.category !== 'clothes')

  const calYear = calMonth.getFullYear(), calMonthIdx = calMonth.getMonth()
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate()
  const firstDOW    = new Date(calYear, calMonthIdx, 1).getDay()

  const bookedForDay = (day: number) => {
    const d = `${calYear}-${String(calMonthIdx + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return bookedDates.filter(b => b.date === d)
  }

  const today = new Date()
  const isCurrentCalMonth = calYear === today.getFullYear() && calMonthIdx === today.getMonth()

  const toggleLike = async (reviewId: string, currentLikes: number) => {
    const supabase = createClient() as any
    const already  = likedReviews.has(reviewId)
    const next = new Set(likedReviews)
    if (already) {
      next.delete(reviewId)
      await supabase.from('rental_reviews').update({ likes: Math.max(0, currentLikes - 1) }).eq('id', reviewId)
    } else {
      next.add(reviewId)
      await supabase.from('rental_reviews').update({ likes: (currentLikes || 0) + 1 }).eq('id', reviewId)
    }
    setLikedReviews(next)
    localStorage.setItem(`liked_reviews_${tenantId}`, JSON.stringify([...next]))
    setReviews(p => p.map(r => r.id === reviewId ? { ...r, likes: already ? Math.max(0, (r.likes||0) - 1) : (r.likes||0) + 1 } : r))
  }

  const handleReviewImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3 - reviewImages.length) as File[]
    if (!files.length) return
    setUploading(true)
    const supabase = createClient() as any
    const urls: string[] = []
    for (const file of files) {
      const ext  = file.name.split('.').pop() || 'jpg'
      const path = `reviews/${tenantId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { data } = await supabase.storage.from('rental').upload(path, file, { upsert: true })
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('rental').getPublicUrl(path)
        urls.push(publicUrl)
      }
    }
    setReviewImages(p => [...p, ...urls].slice(0, 3))
    setUploading(false)
    e.target.value = ''
  }

  const submitReview = async () => {
    if (!reviewForm.customer_name || !reviewForm.comment) return
    const supabase = createClient() as any
    await supabase.from('rental_reviews').insert([{
      tenant_id: tenantId,
      customer_name: reviewForm.customer_name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      images: reviewImages,
    }])
    setSent(true)
    setReviewForm({ customer_name: '', rating: 5, comment: '' })
    setReviewImages([])
  }

  return (
    <main style={{minHeight:'100vh',paddingBottom:'80px',overflowX:'hidden',background:'#FDFBFF'}}>
      <style>{`
        @keyframes bigstar-float { 0%,100%{transform:translateY(0) scale(1);opacity:.35} 50%{transform:translateY(-18px) scale(1.1);opacity:.55} }
        .animate-bigstar { animation:bigstar-float var(--dur,7s) ease-in-out var(--delay,0s) infinite; }
        .glass { background:rgba(255,255,255,0.8); backdrop-filter:blur(12px); border-bottom:1px solid rgba(233,30,140,0.1); }
        .gradient-bg { background: linear-gradient(160deg,#fff8ff 0%,#ffeeff 50%,#f0f8ff 100%); }
        .luxury-card { background:white; box-shadow:0 4px 24px rgba(233,30,140,0.08); border:1px solid rgba(233,30,140,0.08); }
      `}</style>

      {/* ── Header ── */}
      <header className="glass" style={{position:'fixed',top:0,left:0,right:0,zIndex:50,padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button onClick={() => scrollTo('home')} style={{display:'flex',flexDirection:'column',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
          <span style={{fontFamily:'Georgia,serif',fontSize:'20px',fontWeight:600,background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{tenantName}</span>
          {tenantSubtitle && <span style={{fontSize:'9px',letterSpacing:'3px',color:'#9CA3AF',textTransform:'uppercase'}}>{tenantSubtitle}</span>}
        </button>
        <div style={{display:'flex',gap:'8px'}}>
          {[{id:'cameras',l:'📷'},{id:'clothes',l:'👕'},{id:'calendar',l:'🗓️'},{id:'reviews',l:'⭐'}]
            .map(({id,l}) => (
              <button key={id} onClick={() => scrollTo(id)}
                style={{width:'34px',height:'34px',borderRadius:'50%',border:'1px solid rgba(233,30,140,0.2)',background:activeNav===id?'rgba(233,30,140,0.08)':'white',fontSize:'14px',cursor:'pointer'}}>
                {l}
              </button>
            ))}
        </div>
      </header>

      {/* ══ Hero ══ */}
      <section id="home" className="gradient-bg" style={{position:'relative',minHeight:'70vh',display:'flex',alignItems:'center',paddingTop:'80px',overflow:'hidden',padding:'80px 32px 64px'}}>
        <Sparkles/>
        <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:'600px',margin:'0 auto',textAlign:'center'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'8px 16px',borderRadius:'999px',marginBottom:'24px',background:'rgba(233,30,140,0.06)',border:'1px solid rgba(233,30,140,0.15)'}}>
            <span style={{color:'#E91E8C',fontSize:'10px'}}>✦</span>
            <span style={{fontSize:'11px',letterSpacing:'2px',color:'#E91E8C',textTransform:'uppercase'}}>บริการเช่า</span>
          </div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(40px,7vw,72px)',fontWeight:600,lineHeight:1.1,marginBottom:'8px',background:PINK,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{tenantName}</h1>
          {tenantSubtitle && <h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(20px,4vw,36px)',fontWeight:400,color:'#1a1a2e',marginBottom:'24px',lineHeight:1.2}}>{tenantSubtitle}</h2>}
          <div style={{width:'48px',height:'2px',background:PINK,margin:'0 auto 24px',borderRadius:'2px'}}/>
          <div style={{display:'flex',flexWrap:'wrap',gap:'12px',justifyContent:'center'}}>
            {cameras.length > 0 && <button onClick={() => scrollTo('cameras')} style={{padding:'12px 28px',borderRadius:'999px',border:'none',background:PINK,color:'white',fontSize:'13px',fontWeight:600,cursor:'pointer',boxShadow:'0 4px 20px rgba(233,30,140,0.3)'}}>📷 ดูกล้อง</button>}
            {clothes.length  > 0 && <button onClick={() => scrollTo('clothes')} style={{padding:'12px 24px',borderRadius:'999px',border:'1px solid rgba(233,30,140,0.2)',background:'white',color:'#6B7280',fontSize:'13px',cursor:'pointer'}}>✦ ดูเสื้อผ้า</button>}
            {others.length   > 0 && <button onClick={() => scrollTo('other')}   style={{padding:'12px 24px',borderRadius:'999px',border:'1px solid rgba(233,30,140,0.2)',background:'white',color:'#6B7280',fontSize:'13px',cursor:'pointer'}}>📦 ดูสินค้าอื่น</button>}
            <button onClick={() => scrollTo('reviews')} style={{padding:'12px 24px',borderRadius:'999px',border:'1px solid rgba(233,30,140,0.2)',background:'white',color:'#6B7280',fontSize:'13px',cursor:'pointer'}}>⭐ รีวิว</button>
          </div>
        </div>
      </section>

      {/* ══ กล้อง ══ */}
      {cameras.length > 0 && (
        <section id="cameras" style={{position:'relative',padding:'80px 32px',overflow:'hidden'}}>
          <Sparkles/>
          <div style={{position:'relative',zIndex:10,maxWidth:'640px',margin:'0 auto'}}>
            <div style={{marginBottom:'40px'}}>
              <p style={{fontSize:'10px',letterSpacing:'4px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'12px'}}>Equipment</p>
              <h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(28px,4vw,42px)',fontWeight:600,color:'#1a1a2e',marginBottom:'8px'}}>กล้องให้เช่า</h2>
              <p style={{color:'#9CA3AF',fontSize:'14px'}}>กล้องคุณภาพสูง พกพาสะดวก</p>
            </div>
            <ItemsGrid items={cameras} tenantId={tenantId} lineUrl={lineUrl} />
          </div>
        </section>
      )}

      {/* ══ เสื้อผ้า ══ */}
      {clothes.length > 0 && (
        <section id="clothes" style={{position:'relative',padding:'80px 32px',overflow:'hidden',background:'linear-gradient(180deg,#FDFBFF,#FFF0F8)'}}>
          <Sparkles/>
          <div style={{position:'relative',zIndex:10,maxWidth:'640px',margin:'0 auto'}}>
            <div style={{marginBottom:'40px'}}>
              <p style={{fontSize:'10px',letterSpacing:'4px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'12px'}}>Collection</p>
              <h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(28px,4vw,42px)',fontWeight:600,color:'#1a1a2e',marginBottom:'8px'}}>เสื้อผ้าให้เช่า</h2>
              <p style={{color:'#9CA3AF',fontSize:'14px'}}>เลือกสไตล์ที่ใช่สำหรับทุกโอกาส</p>
            </div>
            <ItemsGrid items={clothes} tenantId={tenantId} lineUrl={lineUrl} />
          </div>
        </section>
      )}

      {/* ══ สินค้าอื่น ══ */}
      {others.length > 0 && (
        <section id="other" style={{position:'relative',padding:'80px 32px',overflow:'hidden'}}>
          <Sparkles/>
          <div style={{position:'relative',zIndex:10,maxWidth:'640px',margin:'0 auto'}}>
            <div style={{marginBottom:'40px'}}>
              <p style={{fontSize:'10px',letterSpacing:'4px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'12px'}}>Rental</p>
              <h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(28px,4vw,42px)',fontWeight:600,color:'#1a1a2e',marginBottom:'8px'}}>สินค้าให้เช่าอื่นๆ</h2>
            </div>
            <ItemsGrid items={others} tenantId={tenantId} lineUrl={lineUrl} />
          </div>
        </section>
      )}

      {/* ══ ปฏิทิน ══ */}
      <section id="calendar" style={{position:'relative',padding:'80px 16px',overflow:'hidden'}}>
        <Sparkles/>
        <div style={{position:'relative',zIndex:10,maxWidth:'600px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'40px'}}>
            <p style={{fontSize:'10px',letterSpacing:'4px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'12px'}}>Booking Calendar</p>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(28px,4vw,42px)',fontWeight:600,color:'#1a1a2e',marginBottom:'8px'}}>ตารางการจอง</h2>
            <p style={{color:'#9CA3AF',fontSize:'14px'}}>วันที่มีการจองทั้งหมด</p>
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:'16px',marginBottom:'16px',flexWrap:'wrap'}}>
            {[{color:'#10B981',label:'ยืนยันแล้ว'},{color:'#F59E0B',label:'รอยืนยัน'}].map(({color,label}) => (
              <div key={label} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:color}}/>
                <span style={{fontSize:'12px',color:'#6B7280'}}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',padding:'0 4px'}}>
            <button onClick={() => { if (!isCurrentCalMonth) setCalMonth(new Date(calYear, calMonthIdx - 1, 1)) }}
              style={{width:'36px',height:'36px',borderRadius:'10px',border:`1px solid ${isCurrentCalMonth?'#E5E7EB':'rgba(233,30,140,0.2)'}`,background:'white',cursor:isCurrentCalMonth?'not-allowed':'pointer',fontSize:'18px',color:isCurrentCalMonth?'#D1D5DB':'#E91E8C',opacity:isCurrentCalMonth?0.4:1}}>‹</button>
            <p style={{fontFamily:'Georgia,serif',fontSize:'18px',color:'#1a1a2e',fontWeight:600}}>{MONTH_TH[calMonthIdx]} {calYear + 543}</p>
            <button onClick={() => setCalMonth(new Date(calYear, calMonthIdx + 1, 1))}
              style={{width:'36px',height:'36px',borderRadius:'10px',border:'1px solid rgba(233,30,140,0.2)',background:'white',cursor:'pointer',fontSize:'18px',color:'#E91E8C'}}>›</button>
          </div>
          <div style={{background:'white',borderRadius:'20px',border:'1px solid rgba(233,30,140,0.1)',overflow:'hidden',boxShadow:'0 4px 24px rgba(233,30,140,0.08)'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid rgba(233,30,140,0.08)'}}>
              {DAY_TH.map(d => <div key={d} style={{padding:'10px 2px',textAlign:'center',fontSize:'11px',fontWeight:600,color:'#E91E8C',background:'rgba(233,30,140,0.02)'}}>{d}</div>)}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
              {Array.from({length: firstDOW}).map((_,i) => <div key={`e${i}`} style={{minHeight:'56px',background:'rgba(249,250,251,0.5)'}}/>)}
              {Array.from({length: daysInMonth}).map((_,i) => {
                const day = i + 1
                const isToday  = calYear === today.getFullYear() && calMonthIdx === today.getMonth() && day === today.getDate()
                const isPast   = isCurrentCalMonth && day < today.getDate()
                const dayBooked = bookedForDay(day)
                const hasConfirmed = dayBooked.some(b => b.status === 'confirmed')
                const hasPending   = dayBooked.some(b => b.status === 'pending')
                return (
                  <div key={day} style={{minHeight:'56px',padding:'4px 2px',borderRight:'1px solid rgba(233,30,140,0.04)',borderBottom:'1px solid rgba(233,30,140,0.04)',background:'transparent',opacity:isPast?0.4:1}}>
                    <div style={{width:'22px',height:'22px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:isToday?700:400,background:isToday?PINK:'transparent',color:isToday?'white':'#1a1a2e',margin:'0 auto 2px'}}>{day}</div>
                    <div style={{display:'flex',justifyContent:'center',gap:'2px'}}>
                      {hasConfirmed && <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#10B981'}}/>}
                      {hasPending   && <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#F59E0B'}}/>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══ รีวิว ══ */}
      <section id="reviews" style={{position:'relative',padding:'80px 0',overflow:'hidden',background:'linear-gradient(180deg,#FFF0F8,#FDFBFF)'}}>
        <Sparkles/>
        <div style={{position:'relative',zIndex:10}}>
          <div style={{textAlign:'center',marginBottom:'48px',padding:'0 32px'}}>
            <p style={{fontSize:'10px',letterSpacing:'4px',color:'#E91E8C',textTransform:'uppercase',marginBottom:'12px'}}>Reviews</p>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(28px,4vw,42px)',fontWeight:600,color:'#1a1a2e',marginBottom:'8px'}}>รีวิวจากลูกค้า</h2>
          </div>

          {reviews.length > 0 && (
            <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch',scrollbarWidth:'none',msOverflowStyle:'none',paddingBottom:'8px',marginBottom:'32px'}}>
              <div style={{display:'flex',gap:'16px',paddingLeft:'24px',paddingRight:'24px',width:'max-content',margin:'0 auto'}}>
                {reviews.map(r => (
                  <div key={r.id} style={{width:'280px',flexShrink:0,background:'white',borderRadius:'20px',overflow:'hidden',boxShadow:'0 4px 20px rgba(233,30,140,0.08)',border:'1px solid rgba(233,30,140,0.08)'}}>
                    {r.images?.length > 0 ? (
                      <div onClick={() => { setGallery(r.images); setGalIdx(0) }} style={{position:'relative',width:'100%',height:'280px',cursor:'pointer'}}>
                        <img src={r.images[0]} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        {r.images.length > 1 && <div style={{position:'absolute',bottom:'8px',right:'8px',background:'rgba(233,30,140,0.85)',color:'white',fontSize:'10px',padding:'4px 10px',borderRadius:'10px',fontWeight:600}}>📷 {r.images.length} รูป</div>}
                      </div>
                    ) : (
                      <div style={{width:'100%',height:'80px',background:'linear-gradient(135deg,rgba(233,30,140,0.06),rgba(156,39,176,0.06))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',opacity:0.4}}>⭐</div>
                    )}
                    <div style={{padding:'16px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                        <div>
                          <p style={{fontWeight:600,color:'#1a1a2e',fontSize:'14px'}}>{r.customer_name}</p>
                          <p style={{fontSize:'11px',color:'#C4B5C4'}}>{new Date(r.created_at).toLocaleDateString('th-TH')}</p>
                        </div>
                        <div style={{display:'flex',gap:'1px'}}>{[1,2,3,4,5].map(s => <span key={s} style={{color:s<=r.rating?'#E91E8C':'#E5E7EB',fontSize:'13px'}}>★</span>)}</div>
                      </div>
                      {r.comment && <p style={{color:'#6B7280',fontSize:'13px',lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden',marginBottom:'12px'}}>{r.comment}</p>}
                      <div style={{display:'flex',justifyContent:'flex-end'}}>
                        <button onClick={() => toggleLike(r.id, r.likes || 0)}
                          style={{display:'flex',alignItems:'center',gap:'5px',padding:'5px 12px',borderRadius:'20px',border:`1px solid ${likedReviews.has(r.id)?'rgba(239,68,68,0.3)':'#F3F4F6'}`,background:likedReviews.has(r.id)?'rgba(239,68,68,0.06)':'white',cursor:'pointer',transition:'all 0.2s'}}>
                          <span style={{fontSize:'15px'}}>{likedReviews.has(r.id)?'❤️':'🤍'}</span>
                          <span style={{fontSize:'12px',color:likedReviews.has(r.id)?'#EF4444':'#9CA3AF',fontWeight:600}}>{r.likes||0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review form */}
          <div style={{padding:'0 24px',maxWidth:'600px',margin:'0 auto'}}>
            {sent ? (
              <div className="luxury-card" style={{borderRadius:'24px',padding:'48px',textAlign:'center'}}>
                <div style={{fontSize:'48px',marginBottom:'12px'}}>🎉</div>
                <p style={{fontFamily:'Georgia,serif',fontSize:'20px',color:'#E91E8C',marginBottom:'8px'}}>ขอบคุณสำหรับรีวิว!</p>
                <p style={{color:'#9CA3AF',fontSize:'13px',marginBottom:'24px'}}>รีวิวของคุณถูกบันทึกแล้ว</p>
                <button onClick={() => setSent(false)}
                  style={{padding:'12px 28px',borderRadius:'999px',border:'1px solid rgba(233,30,140,0.3)',background:'white',color:'#E91E8C',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
                  ✦ รีวิวเพิ่มอีก
                </button>
              </div>
            ) : (
              <div className="luxury-card" style={{borderRadius:'24px',padding:'32px'}}>
                <h3 style={{fontFamily:'Georgia,serif',fontSize:'22px',color:'#1a1a2e',marginBottom:'24px',textAlign:'center'}}>ให้รีวิวของคุณ</h3>

                <div style={{marginBottom:'16px'}}>
                  <p style={{fontSize:'11px',color:'#9CA3AF',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>ให้คะแนน</p>
                  <div style={{display:'flex',gap:'8px'}}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setReviewForm(p => ({...p, rating: s}))}
                        style={{fontSize:'28px',background:'none',border:'none',cursor:'pointer',color:s<=reviewForm.rating?'#E91E8C':'#E5E7EB',transform:s<=reviewForm.rating?'scale(1.1)':'scale(1)',transition:'all 0.15s'}}>★</button>
                    ))}
                  </div>
                </div>

                {[{k:'customer_name',label:'ชื่อของคุณ *',ph:'ชื่อ-นามสกุล',type:'text'},{k:'comment',label:'รีวิว *',ph:'เล่าประสบการณ์ของคุณ...',type:'textarea'}].map(({k,label,ph,type}) => (
                  <div key={k} style={{marginBottom:'16px'}}>
                    <p style={{fontSize:'11px',color:'#9CA3AF',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>{label}</p>
                    {type === 'textarea'
                      ? <textarea value={(reviewForm as any)[k]} placeholder={ph} rows={3}
                          onChange={e => setReviewForm(p => ({...p, [k]: e.target.value}))}
                          style={{width:'100%',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'12px 14px',fontSize:'14px',outline:'none',color:'#1a1a2e',fontFamily:'inherit',resize:'none'}}/>
                      : <input type="text" value={(reviewForm as any)[k]} placeholder={ph}
                          onChange={e => setReviewForm(p => ({...p, [k]: e.target.value}))}
                          style={{width:'100%',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'12px 14px',fontSize:'14px',outline:'none',color:'#1a1a2e',fontFamily:'inherit'}}/>
                    }
                  </div>
                ))}

                <div style={{marginBottom:'20px'}}>
                  <p style={{fontSize:'11px',color:'#9CA3AF',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>รูปภาพ (สูงสุด 3 รูป)</p>
                  <label style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'10px 18px',borderRadius:'12px',border:'1.5px dashed rgba(233,30,140,0.3)',cursor:'pointer',fontSize:'13px',color:'#E91E8C',background:'rgba(233,30,140,0.03)'}}>
                    {uploading ? '⏳ กำลังอัพโหลด...' : '📷 เพิ่มรูป'}
                    <input type="file" accept="image/*" multiple onChange={handleReviewImg} style={{display:'none'}} disabled={uploading || reviewImages.length >= 3}/>
                  </label>
                  {reviewImages.length > 0 && (
                    <div style={{display:'flex',gap:'8px',marginTop:'8px',flexWrap:'wrap'}}>
                      {reviewImages.map((url,i) => (
                        <div key={i} style={{position:'relative',width:'64px',height:'64px',borderRadius:'10px',overflow:'hidden'}}>
                          <img src={url} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                          <button onClick={() => setReviewImages(p => p.filter((_,j) => j!==i))}
                            style={{position:'absolute',top:'2px',right:'2px',width:'18px',height:'18px',borderRadius:'50%',background:'rgba(0,0,0,0.6)',border:'none',color:'white',fontSize:'10px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  disabled={!reviewForm.customer_name.trim() || !reviewForm.comment?.trim()}
                  onClick={submitReview}
                  style={{width:'100%',padding:'14px',borderRadius:'14px',border:'none',background:reviewForm.customer_name.trim()&&reviewForm.comment?.trim()?PINK:'#E5E7EB',color:reviewForm.customer_name.trim()&&reviewForm.comment?.trim()?'white':'#9CA3AF',fontSize:'15px',fontWeight:600,cursor:'pointer',boxShadow:reviewForm.customer_name.trim()&&reviewForm.comment?.trim()?'0 4px 20px rgba(233,30,140,0.3)':'none',transition:'all 0.2s'}}>
                  ส่งรีวิว ✦
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery modal */}
      {gallery && (
        <div onClick={() => setGallery(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <button onClick={() => setGallery(null)} style={{position:'absolute',top:'16px',right:'16px',width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:'18px',cursor:'pointer'}}>✕</button>
          <div onClick={e => e.stopPropagation()} style={{width:'100%',maxWidth:'400px',borderRadius:'16px',overflow:'hidden',background:'#111',marginBottom:'12px'}}>
            <img src={gallery[galIdx]} style={{width:'100%',maxHeight:'70vh',objectFit:'contain',display:'block'}}/>
          </div>
          {gallery.length > 1 && (
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <button onClick={() => setGalIdx(p => Math.max(0, p-1))} disabled={galIdx===0} style={{width:'36px',height:'36px',borderRadius:'50%',background:galIdx===0?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.25)',border:'none',color:'white',fontSize:'18px',cursor:galIdx===0?'default':'pointer'}}>‹</button>
              <div style={{display:'flex',gap:'6px'}}>{gallery.map((_,i) => <button key={i} onClick={() => setGalIdx(i)} style={{width:'8px',height:'8px',borderRadius:'50%',border:'none',background:i===galIdx?'#E91E8C':'rgba(255,255,255,0.4)',cursor:'pointer',padding:0}}/>)}</div>
              <button onClick={() => setGalIdx(p => Math.min(gallery.length-1, p+1))} disabled={galIdx===gallery.length-1} style={{width:'36px',height:'36px',borderRadius:'50%',background:galIdx===gallery.length-1?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.25)',border:'none',color:'white',fontSize:'18px',cursor:galIdx===gallery.length-1?'default':'pointer'}}>›</button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
