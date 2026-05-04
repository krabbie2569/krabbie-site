'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import styles from '@/app/page.module.css'

interface User { email: string; displayName: string | null }

export default function HomeNav() {
  const [user,     setUser]     = useState<User | null>(null)
  const [ready,    setReady]    = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient() as any

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      const u = session?.user
      if (u) setUser({ email: u.email, displayName: u.user_metadata?.display_name ?? null })
      setReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      const u = session?.user ?? null
      setUser(u ? { email: u.email, displayName: u.user_metadata?.display_name ?? null } : null)
      setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [])

  async function logout() {
    const supabase = createClient() as any
    await supabase.auth.signOut()
    window.location.reload()
  }

  const label = user?.displayName || user?.email?.split('@')[0] || ''

  return (
    <div className={styles.navLinks}>
      <a href="#how">วิธีใช้</a>
      <a href="#templates">Template</a>
      <a href="#pricing">ราคา</a>

      {!ready ? null : user ? (
        /* ── logged in: profile button + dropdown ── */
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#FF5500', color: 'white', border: 'none',
              borderRadius: '100px', padding: '8px 18px',
              fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
              fontFamily: 'Sarabun, sans-serif',
              boxShadow: '0 4px 18px rgba(255,85,0,0.45)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 22px rgba(255,85,0,0.55)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 18px rgba(255,85,0,0.45)' }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🦀</span>
            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.85 }}>{dropOpen ? '▲' : '▼'}</span>
          </button>

          {dropOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 12px)', right: 0,
              minWidth: '200px', background: 'white',
              borderRadius: '18px', boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
              overflow: 'hidden', zIndex: 1000,
              border: '1.5px solid rgba(0,0,0,0.06)',
            }}>
              {/* User info */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', background: '#FFFBF7' }}>
                <div style={{ fontSize: '0.62rem', color: '#9CA3AF', fontFamily: 'monospace', letterSpacing: '1px', textTransform: 'uppercase' }}>เข้าสู่ระบบแล้ว</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a0f00', marginTop: '3px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName || user.email}
                </div>
              </div>

              {/* เว็บของฉัน */}
              <Link
                href="/dashboard"
                onClick={() => setDropOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 18px', color: '#1a0f00', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFF8F0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span style={{ fontSize: '1.2rem' }}>🏪</span> เว็บของฉัน
              </Link>

              {/* Account */}
              <Link
                href="/account"
                onClick={() => setDropOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 18px', color: '#1a0f00', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, borderTop: '1px solid #F9FAFB' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span style={{ fontSize: '1.2rem' }}>⚙️</span> ตั้งค่าบัญชี
              </Link>

              {/* Logout */}
              <button
                onClick={logout}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '13px 18px', width: '100%', background: 'none',
                  border: 'none', borderTop: '1px solid #F3F4F6',
                  color: '#EF4444', fontSize: '0.9rem', fontWeight: 600,
                  cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span style={{ fontSize: '1.2rem' }}>🚪</span> ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── not logged in: login + signup ── */
        <>
          <Link href="/login" className={styles.navLogin}>เข้าสู่ระบบ</Link>
          <Link href="/signup" className={styles.navBtn}>ทดลองฟรี →</Link>
        </>
      )}
    </div>
  )
}
