import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'krabbie.com'

export function middleware(request: NextRequest) {
  const url    = request.nextUrl.clone()
  const host   = request.headers.get('host') ?? ''
  const hostname = host.split(':')[0]

  // Dev shortcut: ?tenant=slug on localhost
  if (hostname === 'localhost') {
    const tenantParam = url.searchParams.get('tenant')
    if (tenantParam) {
      url.pathname = `/${tenantParam}${url.pathname === '/' ? '' : url.pathname}`
      url.searchParams.delete('tenant')
      const res = NextResponse.rewrite(url)
      res.headers.set('x-tenant-slug', tenantParam)
      return res
    }
    return NextResponse.next()
  }

  // Production: resolve tenant from subdomain
  const isMainDomain = hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}`
  if (isMainDomain) return NextResponse.next()

  if (hostname.endsWith(`.${APP_DOMAIN}`)) {
    const slug = hostname.replace(`.${APP_DOMAIN}`, '')
    // Rewrite to /[tenant] route, pass slug via header for server components
    url.pathname = `/${slug}${url.pathname === '/' ? '' : url.pathname}`
    const res = NextResponse.rewrite(url)
    res.headers.set('x-tenant-slug', slug)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip static assets and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
}
