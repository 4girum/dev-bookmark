import Link from "next/link";
import { signInWithPassword, signUpWithEmail, signInWithGoogle } from "@/app/auth/actions";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string; tab?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message, tab } = await searchParams;
  const activeTab = tab === "signup" ? "signup" : "signin";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] px-6">
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3" aria-hidden="true">
              <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
            </svg>
            Back to home
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            DevBookmark
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to access your knowledge hub
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-6 space-y-5 shadow-sm">

          {/* Google OAuth */}
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-100 font-medium text-sm px-4 py-2.5 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              {/* Google "G" icon */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-neutral-50 dark:bg-neutral-900 px-2 text-neutral-400 dark:text-neutral-500">
                or continue with email
              </span>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1 gap-1" role="tablist">
            <Link
              href="/login?tab=signin"
              role="tab"
              aria-selected={activeTab === "signin"}
              className={`flex-1 text-center text-xs font-medium py-1.5 rounded-md transition-colors duration-150 ${
                activeTab === "signin"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/login?tab=signup"
              role="tab"
              aria-selected={activeTab === "signup"}
              className={`flex-1 text-center text-xs font-medium py-1.5 rounded-md transition-colors duration-150 ${
                activeTab === "signup"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              }`}
            >
              Sign Up
            </Link>
          </div>

          {/* Sign In form */}
          {activeTab === "signin" && (
            <form action={signInWithPassword} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="signin-email" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Email
                </label>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="signin-password" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <input
                  id="signin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Sign In
              </button>
            </form>
          )}

          {/* Sign Up form */}
          {activeTab === "signup" && (
            <form action={signUpWithEmail} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="signup-email" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Email
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-neutral-400 dark:text-neutral-500">Minimum 6 characters</p>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Create Account
              </button>
            </form>
          )}

          {/* Feedback messages */}
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-600 dark:text-red-400">
              {decodeURIComponent(error)}
            </p>
          )}
          {message && (
            <p role="status" className="rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
              {decodeURIComponent(message)}
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600">
          By signing in you agree to our terms of service.
        </p>
      </div>
    </main>
  );
}
