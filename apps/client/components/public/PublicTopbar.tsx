"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../../context/LanguageContext";

export default function PublicTopbar() {
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0A1628]/80 backdrop-blur-xl border-b border-[var(--border-color)]/20 shadow-lg shadow-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Nasta home"
        >
          <Image
            src="/nasta-app-icon.png"
            alt="Nasta"
            width={60}
            height={60}
            className="rounded-xl"
            priority
          />
          <span className="text-base font-bold text-white tracking-tight">
            Nasta
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-[var(--border-color)]/30 bg-white/[0.03] px-2.5 py-1.5 text-[var(--muted-text)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--primary)]/40 hover:bg-white/[0.06] md:inline-flex"
            aria-label="Download on the App Store"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span className="text-xs font-medium">App Store</span>
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-[var(--border-color)]/30 bg-white/[0.03] px-2.5 py-1.5 text-[var(--muted-text)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--primary)]/40 hover:bg-white/[0.06] md:inline-flex"
            aria-label="Get it on Google Play"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.303 2.303-8.633-8.635z" />
            </svg>
            <span className="text-xs font-medium">Google Play</span>
          </a>
          <button
            onClick={() => setLanguage(language === "en" ? "pt" : "en")}
            className="rounded-lg border border-[var(--border-color)]/30 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-[var(--muted-text)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--primary)]/40 hover:bg-white/[0.06]"
          >
            {language === "en"
              ? "\uD83C\uDDF5\uD83C\uDDF9 PT"
              : "\uD83C\uDDEC\uD83C\uDDE7 EN"}
          </button>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-[var(--muted-text)] transition-colors hover:text-white"
          >
            {t("landing.signIn", "Sign in")}
          </Link>
          <Link
            href="/register"
            className="btn-glow rounded-xl bg-gradient-to-b from-[var(--primary)] to-[#96691E] border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-[0_4px_24px_rgba(201,150,63,0.3)]"
          >
            {t("landing.getStartedFree", "Get Started")}
          </Link>
        </div>
      </div>
    </header>
  );
}
