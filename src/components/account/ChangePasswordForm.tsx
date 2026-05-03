'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function ChangePasswordForm() {
  const [open, setOpen]         = useState(false)
  const [current, setCurrent]   = useState('')
  const [newPass, setNewPass]   = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPass.length < 8) { setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return }
    if (newPass !== confirm)  { setError('รหัสผ่านใหม่ไม่ตรงกัน'); return }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Re-authenticate first
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { setError('ไม่พบข้อมูลผู้ใช้'); setLoading(false); return }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current,
    })
    if (signInErr) { setError('รหัสผ่านปัจจุบันไม่ถูกต้อง'); setLoading(false); return }

    const { error: updateErr } = await supabase.auth.updateUser({ password: newPass })
    if (updateErr) {
      setError('เปลี่ยนรหัสผ่านไม่สำเร็จ')
    } else {
      setSuccess(true)
      setCurrent(''); setNewPass(''); setConfirm('')
      setTimeout(() => { setSuccess(false); setOpen(false) }, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="sec-label">ความปลอดภัย</div>
        <button
          onClick={() => { setOpen(o => !o); setError(null); setSuccess(false) }}
          className="text-xs text-orange-500 hover:underline font-semibold"
        >
          {open ? 'ยกเลิก' : 'เปลี่ยนรหัสผ่าน'}
        </button>
      </div>

      {!open && (
        <p className="text-sm text-gray-400 mt-2">••••••••</p>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="space-y-3 mt-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600">รหัสผ่านปัจจุบัน</label>
            <input type="password" required className="input text-sm" value={current} onChange={e => setCurrent(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600">รหัสผ่านใหม่</label>
            <input type="password" required className="input text-sm" placeholder="อย่างน้อย 8 ตัว" value={newPass} onChange={e => setNewPass(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600">ยืนยันรหัสผ่านใหม่</label>
            <input type="password" required className="input text-sm" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          {error   && <p className="text-red-500 text-xs font-mono">{error}</p>}
          {success && <p className="text-teal-dark text-xs font-mono">✓ เปลี่ยนรหัสผ่านสำเร็จ</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm py-2 disabled:opacity-50">
            {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
          </button>
        </form>
      )}
    </div>
  )
}
