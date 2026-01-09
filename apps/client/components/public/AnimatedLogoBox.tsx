"use client";
import React from "react";
import BrandLogo from "./BrandLogo";

type AnimatedLogoBoxProps = {
  className?: string;
};

/**
 * AnimatedLogoBox
 * A small glassy box that houses the animated brand logo.
 * Gentle floating and glow animations keep it subtle and premium.
 */
export default function AnimatedLogoBox({
  className = "",
}: AnimatedLogoBoxProps) {
  return (
    <div
      className={`relative hidden md:flex items-center gap-2 rounded-2xl px-2.5 py-1.5 ${className}`}
      aria-hidden="true"
    >
      {/* Subtle animated gradient wash behind content */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-25 animate-brand-gradient"
          style={{
            background:
              "linear-gradient(90deg, var(--primary), var(--soft-blue), var(--warm-coral), var(--gentle-peach), var(--primary))",
          }}
        />
        <div className="absolute inset-0 rounded-2xl bg-white/6 backdrop-blur-md" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
      </div>

      {/* Content with soft glow and float */}
      <div className="relative flex items-center justify-center animate-soft-glow">
        <BrandLogo size={24} animated className="animate-float-slow" />
      </div>
      <div
        className="hidden lg:block h-4 w-px bg-white/15"
        aria-hidden="true"
      />
      <span
        className="hidden lg:block select-none bg-clip-text text-[12px] font-semibold leading-none text-transparent"
        style={{
          background:
            "linear-gradient(135deg, var(--primary), var(--soft-blue), var(--warm-coral), var(--gentle-peach))",
        }}
      >
        Cumprido
      </span>
    </div>
  );
}
