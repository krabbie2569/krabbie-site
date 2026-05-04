import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const APP_DOMAIN  = process.env.NEXT_PUBLIC_APP_DOMAIN  ?? 'krabbie.com'
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Paths that require login (exact or prefix match)
const PROTECTED = ['/admin']

function isProtected(pathname: string) {
  return PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'))
    || /^\/[^/]+\/admin(\/|$)/.test(pathname)  // /[tenant]/admin/*
}

export async function middleware(request: NextRequest) {
  const url      = request.nextUrl.clone()
  const host     = request.headers.get('host') ?? ''
  const hostname = host.split(':')[0]

  // ── Subdomain rewrite (unchanged) ────────────────────────
  if (hostname === 'localhost') {
    const tenantParam = url.searchParams.get('tenant')
    if (tenantParam) {
      url.pathname = `/${tenantParam}${url.pathname === '/' ? '' : url.pathname}`
      url.searchParams.delete('tenant')
      const rh = withPathname(request.headers, url.pathname)
      const res = NextResponse.rewrite(url, { request: { headers: rh } })
      res.headers.set('x-tenant-slug', tenantParam)
      return guardAdmin(request, res, url.pathname)
    }
    const rh = withPathname(request.headers, url.pathname)
    return guardAdmin(request, NextResponse.next({ request: { headers: rh } }), url.pathname)
  }

  const isMainDomain = hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}`
  if (isMainDomain) {
    const rh = withPathname(request.headers, url.pathname)
    return guardAdmin(request, NextResponse.next({ request: { headers: rh } }), url.pathname)
  }

  if (hostname.endsWith(`.${APP_DOMAIN}`)) {
    const slug = hostname.replace(`.${APP_DOMAIN}`, '')
    url.pathname = `/${slug}${url.pathname === '/' ? '' : url.pathname}`
    const rh = withPathname(request.headers, url.pathname)
    const res = NextResponse.rewrite(url, { request: { headers: rh } })
    res.headers.set('x-tenant-slug', slug)
    return guardAdmin(request, res, url.pathname)
  }

  return NextResponse.next()
}

function withPathname(existing: Headers, pathname: string): Headers {
  const h = new Headers(existing)
  h.set('x-pathname', pathname)
  return h
}

async function guardAdmin(req: NextRequest, res: NextResponse, pathname: string) {
  if (!isProtected(pathname)) return res

  // Dev bypass via adminkrab cookie
  if (req.cookies.get('krabbie_bypass')?.value === 'adminkrab_ok') return res

  // Check Supabase session
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => toSet.forEach(({ name, value, options }) => {
        req.cookies.set(name, value)
        res.cookies.set(name, value, options as Parameters<typeof res.cookies.set>[2])
      }),
    },
  })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
}
