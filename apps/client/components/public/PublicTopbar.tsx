"use client";
import Link from "next/link";
import Image from "next/image";

export default function PublicTopbar() {
  return (
    <header className="header-animated fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-neutral-950/40 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Cumprido home"
        >
          {/* App Icon Logo */}
          <Image
            src="/app-icon.png"
            alt="Cumprido"
            width={120}
            height={120}
            className="rounded-lg"
            priority
          />
        </Link>
        <nav className="ml-2 hidden items-center gap-4 text-sm text-neutral-200 md:flex">
          <Link href="#" className="hover:text-white">
            Top Content
          </Link>
          <Link href="#" className="hover:text-white">
            People
          </Link>
          <Link href="#" className="hover:text-white">
            Learning
          </Link>
          <Link href="#" className="hover:text-white">
            Jobs
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {/* Join now button - DISABLED */}
          <button
            type="button"
            disabled
            className="hidden md:inline-flex rounded-full border border-white/20 bg-primary/50 px-4 py-2 text-sm font-medium text-white/70 cursor-not-allowed opacity-50"
            title="Coming Soon"
          >
            Join now (Coming Soon)
          </button>
          {/* Sign in button - DISABLED */}
          <button
            type="button"
            disabled
            className="inline-flex rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 ring-1 ring-white/10 cursor-not-allowed opacity-50"
            title="Coming Soon"
          >
            Sign in (Coming Soon)
          </button>
        </div>
      </div>
    </header>
  );
}
