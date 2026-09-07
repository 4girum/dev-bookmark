import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] px-6">
      {/* Hero section */}
      <div className="max-w-2xl w-full text-center space-y-6">
        {/* Badge */}
        <span className="inline-block rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">
          Developer Tools
        </span>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          DevBookmark:{" "}
          <span className="text-indigo-500 dark:text-indigo-400">
            Your Developer 
             <p className="bg-linear-to-r from-indigo-500 to-violet-500 bg-clip-text font-extrabold text-transparent ...">
                Knowledge Hub
             </p>
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Save, tag, and search your favorite docs, tools, and resources — all
          in one place. Stop re-Googling what you already know.
        </p>

        {/* CTA */}
        <div className="pt-2">
          <Link
            href="/bookmarks"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold px-6 py-3 text-base transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Get Started
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer hint */}
      <p className="absolute bottom-6 text-xs text-neutral-400 dark:text-neutral-600">
        DevBookmark Hub &mdash; built for developers
      </p>
    </main>
  );
}
