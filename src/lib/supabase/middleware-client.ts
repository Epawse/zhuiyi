import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Check if Supabase env vars are present (not placeholder values).
 * The middleware gracefully skips auth if Supabase is not configured.
 */
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && !url.includes('your-project') && !key.includes('your-anon'))
}

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, skip auth middleware entirely
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request })
  }

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient() and supabase.auth.getUser()
  // A simple mistake could make it very hard to debug issues with users being randomly logged out
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // This app allows anonymous access, so no redirect for unauthenticated users.
  // The session refresh is handled automatically by the cookie setAll above.
  // Suppress the unused variable warning — user is available for future auth gating.
  void user

  return supabaseResponse
}