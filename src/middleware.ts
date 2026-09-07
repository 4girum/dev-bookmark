import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Guard: if env vars are missing (e.g. during local dev without Supabase),
  // skip auth middleware entirely so the app still renders.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Write refreshed tokens back onto the outgoing request so that
        // Server Components down the chain see the updated cookies.
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        // Re-create the response so we can attach the refreshed Set-Cookie
        // headers to the browser response as well.
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not add any code between createServerClient and getUser().
  // A subtle mistake here is very hard to debug and can cause random logouts.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Route protection ──────────────────────────────────────────────────────

  // Unauthenticated user trying to reach a protected route → send to /login.
  if (!user && pathname.startsWith("/bookmarks")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user visiting /login → send them straight to /bookmarks.
  if (user && pathname === "/login") {
    const bookmarksUrl = request.nextUrl.clone();
    bookmarksUrl.pathname = "/bookmarks";
    return NextResponse.redirect(bookmarksUrl);
  }

  // IMPORTANT: return supabaseResponse as-is so the refreshed cookies are
  // forwarded to the browser. Creating a new NextResponse here would drop them.
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run middleware on all paths except:
     *   - _next/static  (compiled assets)
     *   - _next/image   (image optimisation)
     *   - favicon.ico
     *   - Public files with known extensions (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
