import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/**
 * Creates a Supabase client for use in Client Components (browser).
 * Instantiate once per component with useMemo, or call directly inside
 * a "use client" component.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
