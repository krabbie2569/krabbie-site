export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase.server'
import AddSeedsButton from '@/components/admin/AddSeedsButton'
import type { Tenant } from '@/types'

interface ProfileRow { id: string; display_name: string | null; email: string | null; seeds: number; created_at: string }
interface AuthUser   { id: string; email: string; created_at: string; user_metadata: { display_name?: string } }

export default async function AdminUsersPage() {
  const supabase = createServiceClient() as any

  const [authRes, profilesRes, tenantsRes] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 200 }),
    supabase.from('profiles').select('id, display_name, email, seeds, created_at'),
    supabase.from('tenants').select('auth_user_id'),
  ])

  const authUsers: AuthUser[]    = authRes.data?.users ?? []
  const profiles: ProfileRow[]   = profilesRes.data ?? []
  const tenants:  { auth_user_id: string | null }[] = tenantsRes.data ?? []

  const profileMap  = new Map(profiles.map(p => [p.id, p]))
  const shopCounts  = tenants.reduce((acc, t) => {
    if (t.auth_user_id) acc.set(t.auth_user_id, (acc.get(t.auth_user_id) ?? 0) + 1)
    return acc
  }, new Map<string, number>())

  const users = authUsers.map(u => ({
    id:          u.id,
    email:       u.email,
    displayName: profileMap.get(u.id)?.display_name ?? u.user_metadata?.display_name ?? null,
    seeds:       profileMap.get(u.id)?.seeds ?? 0,
    shopCount:   shopCounts.get(u.id) ?? 0,
    joinedAt:    u.created_at,
  })).sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())

  const totalSeeds = users.reduce((s, u) => s + u.seeds, 0)

  return (
    <div className="px-8 py-8 space-y-6 max-w-5xl">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="font-syne font-extrabold text-2xl text-krabbie-dark">Users</h1>
          <p className="font-mono text-xs text-gray-400 mt-0.5">{users.length} บัญชี · Seeds คงเหลือรวม {totalSeeds} 🌱</p>
        </div>
      </div>

      <div className="bg-white rounded-krabbie border border-krabbie-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-krabbie-border">
            <tr>
              <th className="text-left px-5 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">User</th>
              <th className="text-center px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Shops</th>
              <th className="text-center px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Seeds 🌱</th>
              <th className="text-left px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">สมัคร</th>
              <th className="px-4 py-3 font-mono text-[0.6rem] text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-gray-400">ยังไม่มี user</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-orange-50/20 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-sm leading-tight">{u.displayName ?? '—'}</div>
                  <div className="font-mono text-xs text-gray-400">{u.email}</div>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="font-mono text-sm font-bold text-gray-700">{u.shopCount}</span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`font-mono text-sm font-bold ${u.seeds > 0 ? 'text-orange-500' : 'text-gray-300'}`}>
                    {u.seeds}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-gray-400">
                  {new Date(u.joinedAt).toLocaleDateString('th-TH')}
                </td>
                <td className="px-4 py-3.5">
                  <AddSeedsButton userId={u.id} userEmail={u.email} seedBalance={u.seeds} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
