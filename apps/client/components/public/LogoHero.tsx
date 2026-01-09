"use client";
import Image from "next/image";
import { useMemo, useState } from "react";

type LogoHeroProps = {
  /** Public path under apps/client/public. Example: "/cumprido-logo.png" */
  src?: string;
  /** Maximum width in pixels on large screens */
  maxWidth?: number;
  /** Accessible label for the image */
  alt?: string;
  className?: string;
};

/**
 * LogoHero
 * Responsive hero logo shown on the right side of the landing page.
 * - Uses next/image for optimization
 * - Scales down responsively and centers with subtle glow
 */
export default function LogoHero({
  // Default to a known, existing asset under apps/client/public
  src = "/cumprido_logo.png",
  maxWidth = 520,
  alt = "Cumprido logo",
  className,
}: LogoHeroProps) {
  // Build a small list of fallback candidates; remove duplicates while preserving order
  const candidates = useMemo(
    () =>
      Array.from(
        new Set([
          src,
          "/cumprido_logo.png",
          "/cumprido_logo.png",
          "/cumprido_logo.png",
        ])
      ),
    [src]
  );
  const [idx, setIdx] = useState(0);
  const currentSrc = candidates[Math.min(idx, candidates.length - 1)];

  function handleError() {
    setIdx((i) => (i + 1 < candidates.length ? i + 1 : i));
  }
  return (
    <div
      className={`relative mx-auto w-full` + (className ? ` ${className}` : "")}
      style={{ maxWidth }}
    >
      <div className="relative w-full">
        <Image
          src={currentSrc}
          alt={alt}
          priority
          width={maxWidth}
          height={Math.round(maxWidth * 0.7)}
          sizes="(max-width: 768px) 100vw, 40vw"
          className="h-auto w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
          onError={handleError}
        />
      </div>
    </div>
  );
}
