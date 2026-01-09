"use client";
import { useEffect, useState } from "react";
import PaymentSettings from "@/components/settings/PaymentSettings";
import VerificationSettings from "@/components/settings/VerificationSettings";
import AccountSettings from "@/components/settings/AccountSettings";
import AddressSettings from "@/components/settings/AddressSettings";

type SectionKey = "account" | "identity" | "financial" | "preferences";

const sections: { key: SectionKey; label: string }[] = [
  { key: "account", label: "Account" },
  { key: "identity", label: "Identity" },
  { key: "financial", label: "Payments" },
  { key: "preferences", label: "Preferences" },
];

export default function SettingsHub() {
  const [active, setActive] = useState<SectionKey>(() => {
    if (typeof window === "undefined") return "account";
    const hash = window.location.hash.replace("#", "") as SectionKey;
    return sections.find((s) => s.key === hash)?.key ?? "account";
  });

  // keep hash synced for deeplinks
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== `#${active}`) {
      history.replaceState(null, "", `#${active}`);
    }
  }, [active]);

  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Mobile-first segmented control; becomes tabs on md+ */}
      <nav className="sticky top-16 z-1 -mx-1 flex gap-2 overflow-x-auto rounded-lg bg-white/70 p-1 text-sm shadow-sm backdrop-blur dark:bg-neutral-900/70 md:bg-transparent md:p-0">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 ring-1 ring-inset transition ${
              active === s.key
                ? "bg-primary text-white ring-primary/60"
                : "bg-transparent text-neutral-700 ring-neutral-300 hover:bg-neutral-100 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-neutral-800/60"
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Sections as accordion on mobile, panels on desktop */}
      <section
        id="account"
        className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60"
      >
        <SectionHeader
          title="Account"
          subtitle="Manage your email and phone number."
          open={active === "account"}
          onToggle={() => setActive("account")}
          collapsible={isMobile}
        />
        {(!isMobile || active === "account") && (
          <div className="mt-4">
            <AccountSettings />
          </div>
        )}
      </section>

      <section
        id="identity"
        className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60"
      >
        <SectionHeader
          title="Identity"
          subtitle="Verify your identity and manage your address."
          open={active === "identity"}
          onToggle={() => setActive("identity")}
          collapsible={isMobile}
        />
        {(!isMobile || active === "identity") && (
          <div className="mt-4 space-y-6">
            <VerificationSettings />
            <AddressSettings />
          </div>
        )}
      </section>

      <section
        id="financial"
        className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60"
      >
        <SectionHeader
          title="Payments"
          subtitle="Employers add a card; job seekers add payout details."
          open={active === "financial"}
          onToggle={() => setActive("financial")}
          collapsible={isMobile}
        />
        {(!isMobile || active === "financial") && (
          <div className="mt-4">
            <PaymentSettings />
          </div>
        )}
      </section>

      <section
        id="preferences"
        className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60"
      >
        <SectionHeader
          title="Preferences"
          subtitle="App and web experience settings."
          open={active === "preferences"}
          onToggle={() => setActive("preferences")}
          collapsible={isMobile}
        />
        {(!isMobile || active === "preferences") && (
          <div className="mt-4 space-y-4">
            <ThemeToggle />
            <NotificationsPrefs />
            <div className="text-xs text-neutral-500">
              More preferences coming soon (language, accessibility).
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader(props: {
  title: string;
  subtitle?: string;
  open: boolean;
  collapsible?: boolean;
  onToggle?: () => void;
}) {
  const { title, subtitle, open, collapsible, onToggle } = props;
  return (
    <header
      className={`flex items-center justify-between ${collapsible ? "cursor-pointer" : ""}`}
      onClick={() => collapsible && onToggle?.()}
      aria-expanded={open}
    >
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>
      {collapsible && (
        <span className="text-xs text-neutral-500">
          {open ? "Hide" : "Show"}
        </span>
      )}
    </header>
  );
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return mobile;
}

function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() =>
    typeof window === "undefined"
      ? "system"
      : localStorage.getItem("pref_theme") || "system"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pref_theme", theme);
    // Best-effort DOM class for dark; full theming to be wired later
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.remove("dark");
  }, [theme]);

  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800/80">
      <div className="mb-2 text-sm font-medium">Theme</div>
      <div className="flex gap-2">
        {(
          [
            { key: "system", label: "System" },
            { key: "light", label: "Light" },
            { key: "dark", label: "Dark" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setTheme(opt.key)}
            className={`rounded-md px-3 py-1.5 text-sm ring-1 ring-inset transition ${
              theme === opt.key
                ? "bg-primary text-white ring-primary/60"
                : "ring-neutral-300 hover:bg-neutral-100 dark:ring-neutral-700 dark:hover:bg-neutral-800/60"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NotificationsPrefs() {
  const [emailJobs, setEmailJobs] = useState<boolean>(() =>
    typeof window === "undefined"
      ? true
      : localStorage.getItem("pref_email_jobs") !== "false"
  );
  const [pushGeneral, setPushGeneral] = useState<boolean>(() =>
    typeof window === "undefined"
      ? true
      : localStorage.getItem("pref_push_general") !== "false"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pref_email_jobs", String(emailJobs));
    localStorage.setItem("pref_push_general", String(pushGeneral));
  }, [emailJobs, pushGeneral]);

  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800/80">
      <div className="mb-2 text-sm font-medium">Notifications</div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={emailJobs}
          onChange={(e) => setEmailJobs(e.target.checked)}
        />
        Email me new job matches
      </label>
      <label className="mt-2 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={pushGeneral}
          onChange={(e) => setPushGeneral(e.target.checked)}
        />
        Enable general push notifications
      </label>
    </div>
  );
}
