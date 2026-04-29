import { NextRequest, NextResponse } from 'next/server'
import { evaluateGeoStatus, extractGeoFromHeaders } from '@/lib/polymarket/geoblock'

export const config = {
  matcher: ['/me/:path*', '/api/v1/trades/:path*', '/api/v1/polymarket/:path*'],
}

export function middleware(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production'
  const { country, region } = extractGeoFromHeaders(request.headers)

  if (!country && !isProduction) {
    return NextResponse.next()
  }

  const status = evaluateGeoStatus(country, region)

  if (status.allowed) {
    return NextResponse.next()
  }

  if (status.reason === 'close-only') {
    const isPost = request.method === 'POST'
    const isSubmit = request.nextUrl.pathname === '/api/v1/trades/submit'
    if (isPost && isSubmit) {
      return NextResponse.json(
        {
          error: 'GEO_BLOCKED',
          reason: 'close-only',
          country: status.country,
          region: status.region,
        },
        { status: 403 }
      )
    }
    return NextResponse.next()
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      {
        error: 'GEO_BLOCKED',
        reason: status.reason,
        country: status.country,
        region: status.region,
      },
      { status: 403 }
    )
  }

  const url = request.nextUrl.clone()
  url.pathname = '/geo-blocked'
  url.searchParams.set('country', status.country)
  if (status.region) url.searchParams.set('region', status.region)
  return NextResponse.redirect(url)
}
