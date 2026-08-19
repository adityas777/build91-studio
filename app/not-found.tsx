import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-ink-900 px-6 py-24 text-center">
      <div className="absolute inset-0 -z-10 bg-mesh opacity-30" />
      <div className="absolute inset-0 -z-10 bg-grid-soft opacity-20" />
      <div className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-96 w-96 rounded-full bg-violet-glow/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-gold/10 blur-[140px]" />

      <div className="flex flex-col items-center max-w-md">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-glow/30 bg-violet-glow/[0.08] text-violet-soft mb-8">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="text-display text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          404
        </h1>
        <h2 className="text-display mt-4 text-xl font-medium text-white/80">
          Page Not Found
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/55">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="btn-primary inline-flex px-8 py-3 text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
