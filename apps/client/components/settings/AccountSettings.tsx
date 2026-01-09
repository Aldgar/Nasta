"use client";
import { useEffect, useMemo, useState } from "react";

export default function AccountSettings() {
  // Determine current role to scope phone separately for Employers vs Job Seekers
  const role = useMemo(
    () =>
      typeof window !== "undefined"
        ? (localStorage.getItem("auth_role") ?? "JOB_SEEKER")
        : "JOB_SEEKER",
    []
  );
  const phoneKey = role === "EMPLOYER" ? "employer_phone" : "job_phone";

  const [email, setEmail] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : localStorage.getItem("auth_email") || ""
  );
  const [phone, setPhone] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const scoped = localStorage.getItem(phoneKey);
    if (scoped) return scoped;
    const legacy = localStorage.getItem("auth_phone");
    if (legacy) {
      try {
        localStorage.setItem(phoneKey, legacy);
        localStorage.removeItem("auth_phone");
      } catch {}
      return legacy;
    }
    return "";
  });
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_email", email);
    // Persist phone under role-specific key
    localStorage.setItem(phoneKey, phone);
  }, [email, phone, phoneKey]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: would call backend to persist
    setStatus("Saved");
    setTimeout(() => setStatus(""), 2000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Phone
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          placeholder="+1 555 123 4567"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-soft-blue"
        >
          Save changes
        </button>
        {status && <span className="text-xs text-green-600">{status}</span>}
      </div>
    </form>
  );
}
