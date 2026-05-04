export const runtime = 'edge'

import { createServerSupabaseClient } from '@/lib/supabase.server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardSidebar from '@/components/account/DashboardSidebar'
import ChangePasswordForm from '@/components/account/ChangePasswordForm'

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/account')

  const [{ data: tenant }, { data: profile }, { data: seedTx }] = await Promise.all([
    supabase
      .from('tenants')
      .select('slug, name, plan, plan_type, trial_ends_at, expires_at, created_at')
      .eq('owner_email', user.email)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('seeds, display_name')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('seed_transactions')
      .select('delta, note, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const seeds = profile?.seeds ?? 0

  const planLabel: Record<string, string> = {
    trial: `ทดลองฟรี · หมด ${tenant?.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString('th-TH') : '?'}`,
    active: `Active · หมดอายุ ${tenant?.expires_at ? new Date(tenant.expires_at).toLocaleDateString('th-TH') : '?'}`,
    suspended: 'ระงับการใช้งาน',
    cancelled: 'ยกเลิกแล้ว',
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar email={user.email ?? ''} />
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto px-6 py-8 space-y-4">

        {/* Profile */}
        <div className="card">
          <div className="sec-label mb-3">ข้อมูลบัญชี</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">อีเมล</span>
              <span className="font-semibold">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">สมาชิกตั้งแต่</span>
              <span className="font-mono text-xs">{new Date(user.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Shop / Plan */}
        {tenant && (
          <div className="card">
            <div className="sec-label mb-3">ร้านของฉัน</div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ชื่อร้าน</span>
                <span className="font-semibold">{tenant.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">ที่อยู่เว็บ</span>
                <a href={`/${tenant.slug}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-orange-500 hover:underline">
                  {tenant.slug}.krabbie.com →
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">แพลน</span>
                <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                  tenant.plan === 'active' ? 'badge-live' :
                  tenant.plan === 'trial'  ? 'badge-trial' :
                  'bg-red-100 text-red-600'
                }`}>
                  {tenant.plan_type?.toUpperCase() ?? 'STANDARD'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">สถานะ</span>
                <span className="text-xs text-gray-600">{planLabel[tenant.plan] ?? tenant.plan}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link href={`/${tenant.slug}/admin`} className="btn-primary flex-1 text-center text-sm py-2">
                จัดการร้าน →
              </Link>
              <Link href={`/${tenant.slug}/admin/billing`} className="btn-outline flex-1 text-center text-sm py-2">
                ชำระเงิน
              </Link>
            </div>
          </div>
        )}

        {/* Seeds */}
        <div className="card border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="flex items-center justify-between mb-3">
            <div className="sec-label">🌱 Seed ของฉัน</div>
            <div className="font-syne font-extrabold text-3xl text-orange-500">{seeds}</div>
          </div>

          {/* what is seed */}
          <div className="bg-white/70 rounded-xl p-3 mb-3 space-y-1.5 text-xs text-gray-600 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">◆</span>
              <span><strong>1 Seed</strong> = เปิดใช้งานเว็บร้าน 1 ร้าน นาน <strong>30 วัน</strong></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">◆</span>
              <span>ซื้อ seed แล้วกด <strong>Activate</strong> ในหน้าจัดการร้านได้เลย</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">◆</span>
              <span>โอนเงิน <strong>150 ฿/เดือน</strong> → แจ้ง LINE: @krabbie → แอดมินเพิ่ม seed ให้</span>
            </div>
          </div>

          {seeds === 0 ? (
            <div className="bg-orange-100 text-orange-700 text-xs rounded-lg px-3 py-2 font-mono text-center">
              ยังไม่มี seed — ติดต่อ LINE: @krabbie เพื่อซื้อ
            </div>
          ) : (
            <div className="bg-teal-50 text-teal-700 text-xs rounded-lg px-3 py-2 font-mono text-center">
              ✓ มี {seeds} seed · ใช้ได้อีก {seeds} เดือน
            </div>
          )}

          {/* transaction history */}
          {seedTx && seedTx.length > 0 && (
            <div className="mt-3">
              <div className="text-[0.6rem] font-mono text-gray-400 uppercase tracking-wider mb-1.5">ประวัติ Seed</div>
              <div className="space-y-1">
                {(seedTx as any[]).map((tx: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-orange-100 last:border-0">
                    <div className="text-gray-500">{tx.note || 'เพิ่ม seed'}</div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.6rem] text-gray-300">
                        {new Date(tx.created_at).toLocaleDateString('th-TH')}
                      </span>
                      <span className={`font-mono font-bold ${tx.delta > 0 ? 'text-teal-600' : 'text-red-500'}`}>
                        {tx.delta > 0 ? `+${tx.delta}` : tx.delta} 🌱
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <ChangePasswordForm />

      </div>
      </main>
    </div>
  )
}
