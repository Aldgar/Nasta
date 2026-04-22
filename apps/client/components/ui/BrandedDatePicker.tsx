"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "../../context/LanguageContext";

interface BrandedDatePickerProps {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
}

const DAY_KEYS = [
  "daySu",
  "dayMo",
  "dayTu",
  "dayWe",
  "dayTh",
  "dayFr",
  "daySa",
] as const;

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toYMD(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function parseYMD(s: string): { y: number; m: number; d: number } | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { y: +m[1], m: +m[2] - 1, d: +m[3] };
}

export default function BrandedDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  min,
  max,
  disabled = false,
}: BrandedDatePickerProps) {
  const { t } = useLanguage();
  const days = DAY_KEYS.map((k) =>
    t(`common.datePicker.${k}`, k.replace("day", "")),
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    t(`common.datePicker.month${i}`, String(i)),
  );
  const parsed = parseYMD(value);
  const today = useMemo(() => new Date(), []);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.y ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.m ?? today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

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

  // Sync view when value changes externally
  useEffect(() => {
    const p = parseYMD(value);
    if (p) {
      setViewYear(p.y);
      setViewMonth(p.m);
    }
  }, [value]);

  const minDate = min ? parseYMD(min) : null;
  const maxDate = max ? parseYMD(max) : null;

  function isDisabled(y: number, m: number, d: number) {
    const t = new Date(y, m, d).getTime();
    if (minDate && t < new Date(minDate.y, minDate.m, minDate.d).getTime())
      return true;
    if (maxDate && t > new Date(maxDate.y, maxDate.m, maxDate.d).getTime())
      return true;
    return false;
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else setViewMonth(viewMonth - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else setViewMonth(viewMonth + 1);
  }

  function selectDay(d: number) {
    onChange(toYMD(viewYear, viewMonth, d));
    close();
  }

  // Build calendar grid
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; current: boolean }[] = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ day: daysInPrev - firstDow + 1 + i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) cells.push({ day: i, current: false });
  }

  const displayValue = parsed
    ? `${pad(parsed.d)}/${pad(parsed.m + 1)}/${parsed.y}`
    : "";

  const isToday = (d: number) =>
    viewYear === today.getFullYear() &&
    viewMonth === today.getMonth() &&
    d === today.getDate();

  const isSelected = (d: number) =>
    parsed !== null &&
    viewYear === parsed.y &&
    viewMonth === parsed.m &&
    d === parsed.d;

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
            displayValue
              ? "text-[var(--foreground)]"
              : "text-[var(--muted-text)]"
          }
        >
          {displayValue || placeholder}
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
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-72 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-3 shadow-lg shadow-black/20">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {months[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-text)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-text)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Day of week headers */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {days.map((d) => (
              <span
                key={d}
                className="py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-text)]"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 text-center">
            {cells.map((c, i) => {
              if (!c.current) {
                return (
                  <span
                    key={i}
                    className="py-1.5 text-xs text-[var(--muted-text)]/30"
                  >
                    {c.day}
                  </span>
                );
              }
              const dis = isDisabled(viewYear, viewMonth, c.day);
              const sel = isSelected(c.day);
              const tod = isToday(c.day);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={dis}
                  onClick={() => selectDay(c.day)}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    sel
                      ? "bg-[var(--primary)] text-white"
                      : tod
                        ? "bg-[var(--primary)]/15 text-[var(--primary)] font-bold"
                        : "text-[var(--foreground)] hover:bg-[var(--surface-alt)]"
                  } ${dis ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {c.day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between border-t border-[var(--border-color)] pt-2">
            <button
              type="button"
              onClick={() => {
                onChange("");
                close();
              }}
              className="text-xs font-medium text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors"
            >
              {t("common.datePicker.clear", "Clear")}
            </button>
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                onChange(toYMD(t.getFullYear(), t.getMonth(), t.getDate()));
                close();
              }}
              className="text-xs font-medium text-[var(--primary)] hover:opacity-80 transition-colors"
            >
              {t("common.datePicker.today", "Today")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
