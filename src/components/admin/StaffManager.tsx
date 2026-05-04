'use client'

import { useState } from 'react'

interface Staff { id: string; name: string; is_active: boolean }
interface Props  { slug: string; initial: Staff[] }

export default function StaffManager({ slug, initial }: Props) {
  const [staff, setStaff]       = useState<Staff[]>(initial)
  const [name, setName]         = useState('')
  const [adding, setAdding]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/shops/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, name }),
    })
    const json = await res.json()
    setLoading(false)
    if (res.ok) { setStaff(prev => [...prev, json.data]); setName(''); setAdding(false) }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch('/api/shops/staff', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, id }),
    })
    setStaff(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-3">
      {staff.map(s => (
        <div key={s.id} className="card flex items-center gap-3 py-3">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm flex-shrink-0">
            {s.name.charAt(0)}
          </div>
          <div className="flex-1 font-semibold text-sm">{s.name}</div>
          <button
            onClick={() => handleDelete(s.id)}
            disabled={deleting === s.id}
            className="text-xs text-red-400 hover:underline disabled:opacity-40"
          >
            {deleting === s.id ? '...' : 'ลบ'}
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleAdd} className="card flex gap-2">
          <input className="input flex-1" placeholder="ชื่อพนักงาน" required value={name} onChange={e => setName(e.target.value)} />
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-40">
            {loading ? '...' : 'เพิ่ม'}
          </button>
          <button type="button" onClick={() => setAdding(false)} className="btn-outline">ยกเลิก</button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="btn-outline w-full text-sm">+ เพิ่มพนักงาน</button>
      )}
    </div>
  )
}
