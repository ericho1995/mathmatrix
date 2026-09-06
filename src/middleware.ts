import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Kill switch: set MAINTENANCE_MODE=true in the hosting dashboard and
// redeploy to take the site down; set it back to false and redeploy to
// bring it back up. See README.md "Taking the site down" for the runbook.
export function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== 'true') {
    return NextResponse.next()
  }
  if (request.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.next()
  }
  return NextResponse.rewrite(new URL('/maintenance', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json).*)'],
}
