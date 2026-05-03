'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from '../app/page.module.css'

const TEMPLATES = [
  {
    id:        'booking-service',
    badge:     'จองบริการ',
    title:     'เว็บจองบริการ',
    desc:      'ช่างภาพ · เสริมสวย · สนามกีฬา · ชุดเช่า · สปา · ที่พักและอีกมาก',
    pills:     ['เลือกวันเวลา', 'อัพสลิป', 'admin ยืนยัน'],
    grad:      styles.tg1,
    emoji:     '📅',
    available: true,
    demoPath:  '/demo/booking-service',
  },
  {
    id:        'booking-rental',
    badge:     'เช่าสินค้า',
    title:     'เว็บเช่าสินค้า',
    desc:      'กล้อง · เสื้อผ้า · ชุดแต่งงาน · อุปกรณ์ · ของตกแต่งงาน',
    pills:     ['ปฏิทิน busy days', 'เช่ารายวัน/ชั่วโมง', 'admin ยืนยัน'],
    grad:      styles.tg3,
    emoji:     '📷',
    available: true,
    demoPath:  '/demo/booking-rental',
  },
  {
    id:        'shop',
    badge:     'ขายของ',
    title:     'เว็บขายของ',
    desc:      'เสื้อผ้า · handmade · เบเกอรี่ pre-order · ของมือสอง · สินค้าทั่วไป',
    pills:     ['ตะกร้าสินค้า', 'จัดการสต็อก', 'อัพสลิป'],
    grad:      styles.tg2,
    emoji:     '🛍️',
    available: false,
    demoPath:  null,
  },
  {
    id:        'qr-menu',
    badge:     'QR อาหาร',
    title:     'QR เมนูร้านอาหาร',
    desc:      'สแกน QR ต่อโต๊ะ · สั่งอาหาร · แจ้งครัว real-time · ปริ้นใบเสร็จ',
    pills:     ['QR รายโต๊ะ', 'real-time', 'ใบเสร็จ'],
    grad:      styles.tg2,
    emoji:     '🍜',
    available: false,
    demoPath:  null,
  },
]

export default function TemplatesSection() {
  const [preview, setPreview] = useState<string | null>(null)
  const [previewTitle, setPreviewTitle] = useState('')
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')

  function openPreview(path: string, title: string) {
    setPreview(path)
    setPreviewTitle(title)
    setViewMode('desktop')
  }

  return (
    <>
      <div className={styles.tmplGrid}>
        {TEMPLATES.map((t) => (
          <div key={t.id} className={`${styles.tmplCard} reveal`}>
            <div className={`${styles.tmplTop} ${t.grad}`}>
              <div className={styles.tmplMascot}>{t.emoji}</div>
              <div className={styles.tmplBadge}>{t.badge}</div>
              {!t.available && (
                <div style={{position:'absolute',top:'1rem',right:'1rem',background:'rgba(0,0,0,0.5)',color:'white',fontSize:'0.6rem',padding:'0.2rem 0.6rem',borderRadius:'100px',fontFamily:'monospace',letterSpacing:'1px'}}>
                  เร็วๆ นี้
                </div>
              )}
            </div>
            <div className={styles.tmplBody}>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
              <div className={styles.pills}>
                {t.pills.map(p => <span key={p} className={styles.pill}>{p}</span>)}
              </div>
              <div style={{display:'flex',gap:'8px',marginTop:'16px'}}>
                {t.available && t.demoPath ? (
                  <>
                    <button
                      onClick={() => openPreview(t.demoPath!, t.title)}
                      style={{flex:1,padding:'8px 0',borderRadius:'8px',border:'1.5px solid #FF5500',background:'white',color:'#FF5500',fontSize:'0.82rem',fontWeight:700,cursor:'pointer',transition:'background 0.15s'}}
                      onMouseEnter={e => (e.currentTarget.style.background='#FFF3EE')}
                      onMouseLeave={e => (e.currentTarget.style.background='white')}
                    >
                      👁 ดูตัวอย่าง
                    </button>
                    <Link
                      href={`/signup?template=${t.id}`}
                      style={{flex:1,padding:'8px 0',borderRadius:'8px',border:'none',background:'#FF5500',color:'white',fontSize:'0.82rem',fontWeight:700,cursor:'pointer',textAlign:'center',textDecoration:'none',display:'block'}}
                    >
                      ใช้ template นี้ →
                    </Link>
                  </>
                ) : (
                  <div style={{flex:1,padding:'8px 0',borderRadius:'8px',background:'#F3F4F6',color:'#9CA3AF',fontSize:'0.82rem',fontWeight:700,textAlign:'center',fontFamily:'monospace'}}>
                    เร็วๆ นี้
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PREVIEW MODAL */}
      {preview && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',backdropFilter:'blur(10px)',zIndex:1000,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'16px',gap:'14px'}}
          onClick={() => setPreview(null)}
        >
          {/* TOP BAR */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',maxWidth:'1000px'}} onClick={e => e.stopPropagation()}>
            <span style={{color:'white',fontSize:'0.9rem',fontWeight:700,opacity:0.95}}>{previewTitle}</span>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              {/* VIEW TOGGLE */}
              <div style={{display:'flex',background:'rgba(255,255,255,0.1)',borderRadius:'100px',padding:'3px',gap:'2px'}}>
                <button
                  onClick={() => setViewMode('desktop')}
                  style={{padding:'5px 14px',borderRadius:'100px',border:'none',fontSize:'0.75rem',fontWeight:700,cursor:'pointer',transition:'all 0.15s',
                    background: viewMode==='desktop' ? 'white' : 'transparent',
                    color:      viewMode==='desktop' ? '#0D1B2A' : 'rgba(255,255,255,0.6)',
                  }}
                >🖥️ เดสก์ท็อป</button>
                <button
                  onClick={() => setViewMode('mobile')}
                  style={{padding:'5px 14px',borderRadius:'100px',border:'none',fontSize:'0.75rem',fontWeight:700,cursor:'pointer',transition:'all 0.15s',
                    background: viewMode==='mobile' ? 'white' : 'transparent',
                    color:      viewMode==='mobile' ? '#0D1B2A' : 'rgba(255,255,255,0.6)',
                  }}
                >📱 มือถือ</button>
              </div>
              <button
                onClick={() => setPreview(null)}
                style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:'1.1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
              >✕</button>
            </div>
          </div>

          {/* FRAME */}
          <div onClick={e => e.stopPropagation()}>
            {viewMode === 'desktop' ? (
              /* BROWSER FRAME */
              <div style={{width:'min(90vw,1000px)',borderRadius:'12px',overflow:'hidden',boxShadow:'0 32px 100px rgba(0,0,0,0.7)',border:'1px solid rgba(255,255,255,0.1)'}}>
                {/* Browser chrome */}
                <div style={{background:'#2d2d2d',padding:'10px 16px',display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{display:'flex',gap:'6px'}}>
                    <div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#ff5f57'}} />
                    <div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#febc2e'}} />
                    <div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#28c840'}} />
                  </div>
                  <div style={{flex:1,background:'#3d3d3d',borderRadius:'6px',padding:'4px 12px',fontFamily:'monospace',fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',textAlign:'center'}}>
                    yourshop.krabbie.com
                  </div>
                </div>
                <iframe
                  src={preview}
                  style={{width:'100%',height:'min(72vh,620px)',border:'none',display:'block'}}
                  title="Template preview"
                />
              </div>
            ) : (
              /* PHONE FRAME */
              <div style={{position:'relative',width:'320px'}}>
                <div style={{position:'absolute',top:'12px',left:'50%',transform:'translateX(-50%)',width:'96px',height:'20px',background:'black',borderRadius:'100px',zIndex:10}} />
                <div style={{borderRadius:'42px',overflow:'hidden',boxShadow:'0 24px 80px rgba(0,0,0,0.6)',border:'8px solid #1a1a2e',background:'#1a1a2e',height:'620px',position:'relative'}}>
                  <iframe
                    src={preview}
                    style={{width:'100%',height:'100%',border:'none',display:'block',borderRadius:'36px'}}
                    title="Template preview mobile"
                  />
                </div>
                <div style={{position:'absolute',bottom:'12px',left:'50%',transform:'translateX(-50%)',width:'96px',height:'4px',background:'rgba(255,255,255,0.35)',borderRadius:'100px'}} />
              </div>
            )}
          </div>

          {/* CTA */}
          <div onClick={e => e.stopPropagation()}>
            <Link
              href={`/signup?template=${TEMPLATES.find(t => t.demoPath === preview)?.id ?? ''}`}
              style={{padding:'12px 32px',borderRadius:'100px',background:'#FF5500',color:'white',fontWeight:700,fontSize:'0.9rem',textDecoration:'none',boxShadow:'0 4px 24px rgba(255,85,0,0.5)',display:'inline-block'}}
              onClick={() => setPreview(null)}
            >
              ✓ ใช้ Template นี้ →
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
