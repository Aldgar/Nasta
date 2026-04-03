"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface BrandedTimePickerProps {
  value: string; // "HH:MM" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  step?: number; // minutes between options, default 30
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function generateTimes(step: number) {
  const times: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += step) {
      const v = `${pad(h)}:${pad(m)}`;
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? "AM" : "PM";
      const label = `${hour12}:${pad(m)} ${ampm}`;
      times.push({ value: v, label });
    }
  }
  return times;
}

export default function BrandedTimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className = "",
  disabled = false,
  step = 30,
}: BrandedTimePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const times = generateTimes(step);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("keydown", onEsc);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, close]);

  // Scroll active item into view
  useEffect(() => {
    if (open && listRef.current && value) {
      const el = listRef.current.querySelector(`[data-value="${value}"]`);
      if (el) el.scrollIntoView({ block: "center" });
    }
  }, [open, value]);

  const selected = times.find((t) => t.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`flex w-full items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-2.5 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed ${open ? "border-[var(--primary)] ring-1 ring-[var(--primary)]/30" : ""}`}
      >
        <span
          className={
            selected ? "text-[var(--foreground)]" : "text-[var(--muted-text)]"
          }
        >
          {selected?.label ?? placeholder}
        </span>
        <svg
          className="h-4 w-4 shrink-0 text-[var(--muted-text)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--surface)] shadow-lg shadow-black/20">
          <div
            ref={listRef}
            className="max-h-56 overflow-y-auto overscroll-contain py-1"
          >
            {times.map((t) => (
              <button
                key={t.value}
                type="button"
                data-value={t.value}
                onClick={() => {
                  onChange(t.value);
                  close();
                }}
                className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--primary)]/5 ${
                  t.value === value
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                    : "text-[var(--foreground)]"
                }`}
              >
                {t.value === value && (
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                )}
                <span className={t.value === value ? "" : "pl-5.5"}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
