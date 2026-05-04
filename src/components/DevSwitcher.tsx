'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const CUSTOMER_EMAIL = 'testcustomer@krabbie.dev'
const CUSTOMER_PASS  = 'KrabbieTest123!'
const ENABLED        = process.env.NEXT_PUBLIC_DEV_SWITCHER === '1'

export default function DevSwitcher() {
  const [current, setCurrent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)

  useEffect(() => {
    if (!ENABLED) return
    const supabase = createClient() as any
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setCurrent(session?.user?.email ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: any, session: any) => {
      setCurrent(session?.user?.email ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!ENABLED) return null

  async function switchToCustomer() {
    setLoading(true)
    document.cookie = 'krabbie_bypass=; path=/; max-age=0'
    const supabase = createClient() as any
    await supabase.auth.signOut()
    await supabase.auth.signInWithPassword({ email: CUSTOMER_EMAIL, password: CUSTOMER_PASS })
    window.location.href = '/dashboard'
  }

  function switchToAdmin() {
    document.cookie = 'krabbie_bypass=adminkrab_ok; path=/; max-age=86400; SameSite=Lax'
    window.location.href = '/admin'
  }

  async function logout() {
    setLoading(true)
    document.cookie = 'krabbie_bypass=; path=/; max-age=0'
    const supabase = createClient() as any
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, fontFamily: 'monospace' }}>
      {open && (
        <div style={{
          background: '#0D1B2A', border: '1.5px solid rgba(255,255,255,0.15)',
          borderRadius: '16px', padding: '14px 16px', marginBottom: '8px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)', minWidth: '230px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Dev Switcher
          </div>

          {current && (
            <div style={{
              color: '#F4D03F', fontSize: '0.68rem',
              padding: '5px 10px', background: 'rgba(244,208,63,0.08)',
              borderRadius: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              ● {current}
            </div>
          )}

          <button
            onClick={switchToCustomer}
            disabled={loading}
            style={{
              padding: '9px 14px', borderRadius: '10px', border: 'none',
              background: '#0099CC', color: 'white', fontFamily: 'monospace',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left',
            }}
          >
            👤 มุมมองลูกค้า
          </button>

          <button
            onClick={switchToAdmin}
            disabled={loading}
            style={{
              padding: '9px 14px', borderRadius: '10px', border: 'none',
              background: '#FF5500', color: 'white', fontFamily: 'monospace',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left',
            }}
          >
            🔑 มุมมองแอดมิน
          </button>

          {current && (
            <button
              onClick={logout}
              disabled={loading}
              style={{
                padding: '7px 14px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.18)', background: 'transparent',
                color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace',
                fontSize: '0.72rem', cursor: 'pointer', textAlign: 'left',
              }}
            >
              ↩ ออกจากระบบ
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: '#0D1B2A', border: '1.5px solid rgba(255,255,255,0.2)',
            color: 'white', fontSize: '1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
          title="Dev Switcher"
        >
          🛠️
        </button>
      </div>
    </div>
  )
}
