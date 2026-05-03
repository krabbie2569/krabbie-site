import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const APP_DOMAIN  = process.env.NEXT_PUBLIC_APP_DOMAIN  ?? 'krabbie.com'
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '9k@4k.co.th'

function makeSupabaseMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options as any))
        },
      },
    }
  )
}

export async function middleware(request: NextRequest) {
  const url      = request.nextUrl.clone()
  const host     = request.headers.get('host') ?? ''
  const hostname = host.split(':')[0]
  const path     = url.pathname

  // ── Auth check helper ──────────────────────────────────────────
  const response = NextResponse.next({ request })
  const supabase = makeSupabaseMiddlewareClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()

  // ── Super admin routes (/admin/*) ─────────────────────────────
  const isSuperAdminPath = path === '/admin' || path.startsWith('/admin/')
  if (isSuperAdminPath) {
    if (!user) {
      url.pathname = '/login'
      url.searchParams.set('next', path)
      return NextResponse.redirect(url)
    }
    if (user.email !== ADMIN_EMAIL) {
      url.pathname = '/login'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
  }

  // ── Dev shortcut: ?tenant=slug on localhost ────────────────────
  if (hostname === 'localhost') {
    const tenantParam = url.searchParams.get('tenant')
    if (tenantParam) {
      const redirect = url.searchParams.get('redirect')
      url.pathname = `/${tenantParam}${redirect ? `/${redirect}` : (url.pathname === '/' ? '' : url.pathname)}`
      url.searchParams.delete('tenant')
      url.searchParams.delete('redirect')
      const res = NextResponse.rewrite(url, { request })
      res.headers.set('x-tenant-slug', tenantParam)
      // Copy auth cookies
      response.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value))
      return res
    }

    // Protect tenant admin on localhost: /{slug}/admin/*
    const tenantAdminMatch = path.match(/^\/([^/]+)\/admin/)
    if (tenantAdminMatch) {
      const slug = tenantAdminMatch[1]
      if (!['admin', 'api', 'login', 'signup', 'templates', 'demo', '_next'].includes(slug)) {
        if (!user) {
          url.pathname = '/login'
          url.searchParams.set('next', path)
          return NextResponse.redirect(url)
        }
      }
    }

    return response
  }

  // ── Production: resolve tenant from subdomain ──────────────────
  const isMainDomain = hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}`
  if (isMainDomain) return response

  if (hostname.endsWith(`.${APP_DOMAIN}`)) {
    const slug = hostname.replace(`.${APP_DOMAIN}`, '')

    // Protect tenant admin routes
    if (path === '/admin' || path.startsWith('/admin/')) {
      if (!user) {
        const loginUrl = new URL(`https://${APP_DOMAIN}/login`)
        loginUrl.searchParams.set('next', `https://${slug}.${APP_DOMAIN}/admin`)
        return NextResponse.redirect(loginUrl)
      }
    }

    url.pathname = `/${slug}${url.pathname === '/' ? '' : url.pathname}`
    const res = NextResponse.rewrite(url, { request })
    res.headers.set('x-tenant-slug', slug)
    response.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value))
    return res
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
}
