export const runtime = 'edge'

import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'Super Admin — Krabbie' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  )
}
