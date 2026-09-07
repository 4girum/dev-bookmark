import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback route — handles the PKCE authorization code exchange for:
 *   - Google OAuth redirects
 *   - Email magic-link / OTP verification links
 *
 * Supabase redirects here with ?code=... after the user authenticates.
 * We exchange the code for a session, then redirect to /bookmarks.
 * On failure we redirect to /login with an error message.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Optional: a "next" param lets us redirect to a specific page post-login.
  const next = searchParams.get("next") ?? "/bookmarks";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful exchange — send the user to their destination.
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to login with a generic error.
  return NextResponse.redirect(
    `${origin}/login?error=Could+not+authenticate+user`
  );
}
