import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — required for SSR auth to stay in sync
  await supabase.auth.getUser()

  // ─── TEMPORARY — DO NOT SHIP ──────────────────────────────────────────────
  // Auth gate disabled so features can be built and tested without a session.
  // To re-enable: uncomment the block below and delete this comment.
  //
  // const { data: { user } } = await supabase.auth.getUser()
  // const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  // if (!user && !isAuthRoute) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/auth/login'
  //   return NextResponse.redirect(url)
  // }
  // ──────────────────────────────────────────────────────────────────────────

  return supabaseResponse
}

export const proxyConfig = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
