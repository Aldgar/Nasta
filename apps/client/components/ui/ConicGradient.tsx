import React from "react";

type Props = {
  className?: string;
  /** Opacity for the gradient layer (0-1) */
  opacity?: number;
  /** Size in viewport max (e.g., 120 -> 120vmax) */
  sizeVmax?: number;
  /** Optional rotation offset in degrees */
  fromDeg?: number;
};

/**
 * ConicGradient
 * Decorative animated conic gradient background. Useful behind heroes.
 */
export default function ConicGradient({
  className,
  opacity = 0.45,
  sizeVmax = 120,
  fromDeg = 0,
}: Props) {
  return (
    <div
      className={
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden " +
        (className ?? "")
      }
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl will-change-transform animate-spin-slower"
        style={{
          width: `${sizeVmax}vmax`,
          height: `${sizeVmax}vmax`,
          background: `conic-gradient(from ${fromDeg}deg, var(--soft-blue), var(--warm-coral), var(--gentle-peach), var(--soft-blue))`,
          opacity,
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 65%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 65%)",
        }}
      />
    </div>
  );
}
