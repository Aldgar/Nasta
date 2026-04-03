"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface BrandedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}

export default function BrandedSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  size = "md",
  disabled = false,
}: BrandedSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showSearch = options.length > 6;
  const selected = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  const close = useCallback(() => {
    setOpen(false);
    setSearch("");
  }, []);

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

  useEffect(() => {
    if (open && showSearch) inputRef.current?.focus();
  }, [open, showSearch]);

  // Scroll active item into view
  useEffect(() => {
    if (open && listRef.current && value) {
      const el = listRef.current.querySelector(`[data-value="${value}"]`);
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [open, value]);

  const py = size === "sm" ? "py-1.5" : "py-2.5";
  const px = size === "sm" ? "px-2.5" : "px-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const rounded = size === "sm" ? "rounded-lg" : "rounded-xl";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`flex w-full items-center justify-between ${rounded} border border-[var(--border-color)] bg-[var(--surface)] ${px} ${py} ${textSize} text-[var(--foreground)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed ${open ? "border-[var(--primary)] ring-1 ring-[var(--primary)]/30" : ""}`}
      >
        <span className={selected ? "" : "text-[var(--muted-text)]"}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={`ml-2 h-4 w-4 shrink-0 text-[var(--muted-text)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--surface)] shadow-lg shadow-black/20">
          {showSearch && (
            <div className="border-b border-[var(--border-color)] p-2">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
          )}
          <div
            ref={listRef}
            className="max-h-56 overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-[var(--muted-text)]">
                No results
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  data-value={o.value}
                  onClick={() => {
                    onChange(o.value);
                    close();
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-left ${textSize} transition-colors hover:bg-[var(--primary)]/5 ${
                    o.value === value
                      ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {o.value === value && (
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
                  <span className={o.value === value ? "" : "pl-5.5"}>
                    {o.label}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
