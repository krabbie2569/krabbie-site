'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Payment = {
  id:               string
  tenant_id:        string
  amount:           number
  plan_type:        string
  months:           number
  status:           string
  review_status:    string
  slip_url:         string | null
  rejection_reason: string | null
  created_at:       string
  tenants:          { slug: string; name: string } | null
}

const REVIEW_TABS = [
  { key: 'pending',        label: 'รอตรวจ',    cls: 'bg-yellow-100 text-yellow-700' },
  { key: 'admin_approved', label: '✓ Approved', cls: 'bg-teal-light text-teal-dark' },
  { key: 'rejected',       label: '✗ ปฏิเสธ', cls: 'bg-red-100 text-red-600' },
]

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [activeTab, setActiveTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const supabase = createClient() as any
    const { data } = await supabase
      .from('payments')
      .select('*, tenants(slug, name)')
      .eq('review_status', activeTab)
      .order('created_at', { ascending: false })
      .limit(50)
    setPayments((data as Payment[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [activeTab])

  async function handleApprove(paymentId: string) {
    setActionLoading(paymentId)
    await fetch('/api/payment/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId,
        action:     'approve',
        adminEmail: 'operations@4k.co.th',
      }),
    })
    setActionLoading(null)
    load()
  }

  async function handleReject(paymentId: string) {
    if (!rejectReason.trim()) { alert('กรุณาระบุเหตุผล'); return }
    setActionLoading(paymentId)
    await fetch('/api/payment/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId,
        action:     'reject',
        reason:     rejectReason,
        adminEmail: 'operations@4k.co.th',
      }),
    })
    setActionLoading(null)
    setRejectTarget(null)
    setRejectReason('')
    load()
  }

  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="font-syne font-extrabold text-2xl text-krabbie-dark">Payments</h1>
        <p className="font-mono text-xs text-gray-400 mt-0.5">รายการชำระเงินจากลูกค้า (ระบบเก่า — ใช้ Seeds แทน)</p>
      </div>

      <div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {REVIEW_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                activeTab === tab.key
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-krabbie-border text-gray-500 hover:border-orange-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PAYMENT LIST */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm">ไม่มีรายการ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map(p => (
              <div key={p.id} className="card">
                <div className="flex items-start gap-4">

                  {/* SLIP THUMBNAIL */}
                  {p.slip_url && (
                    <button
                      onClick={() => setSelectedSlip(p.slip_url!)}
                      className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-krabbie-border hover:border-orange-400 transition-colors"
                    >
                      <img src={p.slip_url} alt="slip" className="w-full h-full object-cover" />
                    </button>
                  )}

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-syne font-bold">{p.tenants?.name ?? 'Unknown'}</span>
                      <span className="font-mono text-xs text-orange-500">{p.tenants?.slug}.krabbie.com</span>
                    </div>

                    <div className="flex gap-4 mt-1 text-sm flex-wrap">
                      <span className="font-syne font-bold text-orange-500">{Number(p.amount).toLocaleString()} ฿</span>
                      <span className="text-gray-400">{p.months} เดือน</span>
                      <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded capitalize ${
                        p.plan_type === 'pro' ? 'bg-teal-light text-teal-dark' : 'badge-free'
                      }`}>{p.plan_type}</span>
                    </div>

                    <div className="font-mono text-xs text-gray-400 mt-0.5">
                      {new Date(p.created_at).toLocaleString('th-TH')}
                    </div>

                    {p.rejection_reason && (
                      <div className="text-xs text-red-500 mt-1">เหตุผล: {p.rejection_reason}</div>
                    )}
                  </div>

                  {/* ACTIONS */}
                  {activeTab === 'pending' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        disabled={actionLoading === p.id}
                        onClick={() => handleApprove(p.id)}
                        className="px-3 py-1.5 bg-teal-light text-teal-dark text-xs font-bold rounded-lg hover:bg-teal-DEFAULT/20 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === p.id ? '...' : '✓ Approve'}
                      </button>
                      <button
                        disabled={actionLoading === p.id}
                        onClick={() => setRejectTarget(p.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* REJECT FORM */}
                {rejectTarget === p.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <input
                      className="input flex-1 text-sm py-1.5"
                      placeholder="เหตุผลที่ปฏิเสธ..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                    />
                    <button
                      onClick={() => handleReject(p.id)}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg"
                    >
                      ยืนยัน
                    </button>
                    <button
                      onClick={() => { setRejectTarget(null); setRejectReason('') }}
                      className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs rounded-lg"
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SLIP MODAL */}
      {selectedSlip && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSlip(null)}
        >
          <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <img src={selectedSlip} alt="slip" className="w-full rounded-xl shadow-2xl" />
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
