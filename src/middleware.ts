import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Kill switch: set MAINTENANCE_MODE=true in the hosting dashboard and
// redeploy to take the site down; set it back to false and redeploy to
// bring it back up. See README.md "Taking the site down" for the runbook.
export async function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE === 'true' && !request.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.rewrite(new URL('/maintenance', request.url))
  }

  let response = NextResponse.next({ request: { headers: request.headers } })

  // Refresh the Supabase session cookie on every request so Server Components
  // can safely read auth state without writing cookies during render. No-ops
  // until real Supabase credentials are set (see .env.example).
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options })
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )
    await supabase.auth.getUser()
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json).*)'],
}
