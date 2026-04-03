"use client";
import Link from "next/link";
import Image from "next/image";
import { useCallback } from "react";
import BackButton from "../navigation/BackButton";

export default function Topbar() {
  const logout = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_email");
    localStorage.removeItem("auth_role");
    window.location.href = "/";
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-base bg-surface/90 backdrop-blur supports-backdrop-filter:bg-surface/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <BackButton label="Back" fallback="/" />
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Nasta feed"
        >
          {/* Logo mark: use your provided assets */}
          {/* Light mode uses the dark logo, dark mode uses the light logo */}
          <Image
            src="/NastaLogoLight.png"
            alt="Nasta logo"
            width={28}
            height={28}
            className="block dark:hidden"
            priority
          />
          <Image
            src="/NastaLogoDark.png"
            alt="Nasta logo"
            width={28}
            height={28}
            className="hidden dark:block"
            priority
          />
          {/* Wordmark: use your provided assets */}
          {/* Light mode uses the dark wordmark, dark mode uses the light wordmark */}
        </Link>
        <div className="ml-4 hidden flex-1 items-center sm:flex">
          <input
            type="search"
            placeholder="Search"
            className="w-full max-w-md rounded-md border border-base bg-surface-alt/70 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>
        <nav className="ml-auto flex items-center gap-3 text-sm text-muted-text">
          <button className="rounded-md px-2 py-1 hover:bg-surface-alt">
            Home
          </button>
          <button className="rounded-md px-2 py-1 hover:bg-surface-alt">
            My Network
          </button>
          <button className="rounded-md px-2 py-1 hover:bg-surface-alt">
            Jobs
          </button>
          <button className="rounded-md px-2 py-1 hover:bg-surface-alt">
            Messaging
          </button>
          <button className="rounded-md px-2 py-1 hover:bg-surface-alt">
            Notifications
          </button>
          <Link
            href="/settings"
            className="rounded-md px-2 py-1 hover:bg-surface-alt"
          >
            Settings
          </Link>
          <button
            onClick={logout}
            className="rounded-md px-2 py-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-300"
            title="Sign out"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
