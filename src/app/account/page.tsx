export const runtime = 'edge'

import { createServerSupabaseClient } from '@/lib/supabase.server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/account/LogoutButton'
import ChangePasswordForm from '@/components/account/ChangePasswordForm'

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/account')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('slug, name, plan, plan_type, trial_ends_at, expires_at, created_at')
    .eq('owner_email', user.email)
    .maybeSingle()

  const planLabel: Record<string, string> = {
    trial: `ทดลองฟรี · หมด ${tenant?.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString('th-TH') : '?'}`,
    active: `Active · หมดอายุ ${tenant?.expires_at ? new Date(tenant.expires_at).toLocaleDateString('th-TH') : '?'}`,
    suspended: 'ระงับการใช้งาน',
    cancelled: 'ยกเลิกแล้ว',
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-krabbie-dark px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl">🦀</Link>
          <span className="font-syne text-white font-bold">บัญชีของฉัน</span>
        </div>
        <LogoutButton />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

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

        {/* Change Password */}
        <ChangePasswordForm />

      </div>
    </div>
  )
}
