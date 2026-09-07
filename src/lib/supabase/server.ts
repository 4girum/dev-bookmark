import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// if (!supabaseUrl) {
//   throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
// }
// if (!supabaseAnonKey) {
//   throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
// }

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads and writes auth tokens via Next.js cookies().
 *
 * Must be called inside a request context (not at module scope) because
 * cookies() is request-scoped in Next.js 15+.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // safe to ignore from Server Components
        }
      },
    },
  });
}
