"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * BackButton provides an app-level controlled back navigation without relying on the browser UI.
 * Strategy:
 * - Prefer router.back() to maintain history when available.
 * - If history stack length is 1 (direct visit / no prior page), fallback to a safe default ("/").
 * - Optional: allow overriding fallback target via props.
 */
export default function BackButton({
  fallback = "/",
  label = "Back",
}: {
  fallback?: string;
  label?: string;
}) {
  const router = useRouter();
  const onBack = useCallback(() => {
    // window.history.length > 1 indicates we can go back
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }, [router, fallback]);

  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="Go back"
      className="inline-flex items-center gap-1 rounded-md border border-base bg-surface-alt px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {/* Simple chevron */}
      <span className="text-muted-text">←</span>
      <span>{label}</span>
    </button>
  );
}
