"use client";
import Link from "next/link";
import React from "react";

type CommonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  ariaLabel?: string;
  variant?: "glass" | "brand"; // brand = animated gradient wash style
  disabled?: boolean;
};

type ButtonAsButton = CommonProps & { href?: undefined };
type ButtonAsLink = CommonProps & { href: string };

export type GlassyButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * GlassyButton
 * - Apple-like liquid glass button with animated conic-gradient border.
 * - Works as <button> or <Link> based on presence of `href`.
 * - No external deps; uses CSS variables defined in globals.
 */
export function GlassyButton(props: GlassyButtonProps) {
  const {
    children,
    className,
    onClick,
    icon,
    ariaLabel,
    variant = "glass",
    disabled = false,
  } = props as GlassyButtonProps & { variant?: "glass" | "brand"; disabled?: boolean };

  const glassContent = (
    <span className="relative inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white">
      {/* Animated conic gradient ring */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full opacity-90 blur-[1px] animate-spin-slow"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, var(--soft-blue), var(--warm-coral), var(--gentle-peach), var(--soft-blue))",
        }}
      />
      {/* Inner glass surface */}
      <span className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 backdrop-blur-xl ring-1 ring-white/30 shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_10px_30px_-10px_rgba(0,0,0,0.35)]">
        {/* glossy top highlight */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-linear-to-b from-white/40 to-transparent" />
        {icon ? (
          <span className="relative z-10 h-5 w-5 shrink-0">{icon}</span>
        ) : null}
        <span className="relative z-10">{children}</span>
      </span>
    </span>
  );

  const brandContent = (
    <span className="relative inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white">
      {/* Subtle animated gradient border halo */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full opacity-70 blur-[1px] animate-brand-gradient"
        style={{
          background:
            "linear-gradient(90deg, var(--primary), var(--soft-blue), var(--warm-coral), var(--gentle-peach), var(--primary))",
        }}
      />
      {/* Inner surface filled with animated brand gradient */}
      <span className="relative z-10 inline-flex items-center gap-2 rounded-full px-5 py-3 backdrop-blur-xl ring-1 ring-white/25 shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_12px_30px_-14px_rgba(0,0,0,0.45)]">
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full opacity-35 animate-brand-gradient"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--soft-blue), var(--warm-coral), var(--gentle-peach))",
          }}
        />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-linear-to-b from-white/40 to-transparent" />
        {icon ? (
          <span className="relative z-10 h-5 w-5 shrink-0">{icon}</span>
        ) : null}
        <span className="relative z-10">{children}</span>
      </span>
    </span>
  );

  const base = `relative inline-flex select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
    disabled ? "opacity-50 cursor-not-allowed" : ""
  } ${className ?? ""}`;

  const content = variant === "brand" ? brandContent : glassContent;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} aria-label={ariaLabel} className={base}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={base}
    >
      {content}
    </button>
  );
}

export default GlassyButton;
