import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-neutral-950 text-neutral-100 font-sans">
      <main className="max-w-2xl text-center space-y-6">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-neutral-800 text-neutral-400 border border-neutral-700">
          CareerOS • Phase 0 Bootstrap
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          CareerOS
        </h1>
        <p className="text-lg text-neutral-400 leading-relaxed">
          Your personal job-switch preparation workspace. Track DSA practice, Coding Shuttle modules, resume-wide interview question banks, and capacity-aware 30-day study sprints.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-lg bg-neutral-100 text-neutral-900 font-semibold hover:bg-neutral-200 transition-colors shadow-sm"
          >
            Sign in
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-300 font-medium transition-colors"
          >
            Documentation & Roadmap
          </a>
        </div>
        <div className="pt-12 text-xs text-neutral-500 border-t border-neutral-900">
          Built with Next.js App Router, TypeScript, Tailwind CSS, Supabase, and Antigravity.
        </div>
      </main>
    </div>
  );
}
