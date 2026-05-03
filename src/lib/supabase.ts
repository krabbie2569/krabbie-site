import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client — use in Client Components
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnon)
}

// Server client — use in Server Components, Route Handlers, Server Actions
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Component — cookie writes are ignored (expected)
        }
      },
    },
  })
}

// Service-role client — use only in Route Handlers / server-side trusted code
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createBrowserClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}
