"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Email sign-in (magic link / OTP — passwordless)
// ---------------------------------------------------------------------------

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email")?.toString().trim();

  if (!email) {
    redirect("/login?error=Email+is+required");
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // After clicking the magic link the user lands on the callback route
      // which exchanges the code and redirects to /bookmarks.
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    const msg = encodeURIComponent(error.message);
    redirect(`/login?error=${msg}`);
  }

  redirect("/login?message=Check+your+email+for+a+login+link");
}

// ---------------------------------------------------------------------------
// Email + password sign-up
// ---------------------------------------------------------------------------

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    redirect("/login?error=Email+and+password+are+required");
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    const msg = encodeURIComponent(error.message);
    redirect(`/login?error=${msg}`);
  }

  redirect("/login?message=Check+your+email+to+confirm+your+account");
}

// ---------------------------------------------------------------------------
// Email + password sign-in
// ---------------------------------------------------------------------------

export async function signInWithPassword(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    redirect("/login?error=Email+and+password+are+required");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const msg = encodeURIComponent(error.message);
    redirect(`/login?error=${msg}`);
  }

  redirect("/bookmarks");
}

// ---------------------------------------------------------------------------
// Google OAuth — initiates the redirect flow
// ---------------------------------------------------------------------------

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=Could+not+initiate+Google+sign-in");
  }

  redirect(data.url);
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
