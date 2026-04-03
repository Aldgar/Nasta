"use client";
import Link from "next/link";
import { useLanguage } from "../../../context/LanguageContext";

const spRequirements = [
  {
    icon: "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm-3.375 3.375h3.75",
    title: "Identity Verification",
    desc: "Government-issued photo ID to confirm your real identity",
  },
  {
    icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
    title: "Driver's License",
    desc: "Required for driving jobs, must be issued at least 3 years ago",
  },
  {
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    title: "Background & Criminal Record Check",
    desc: "Comprehensive screening for your safety and employer trust",
  },
  {
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    title: "Professional CV",
    desc: "Your work experience and qualifications on file",
  },
  {
    icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z",
    title: "Skills & Service Rates",
    desc: "List your professional skills with your service rates in EUR",
  },
  {
    icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
    title: "Bank Account & Payout Setup",
    desc: "Date of birth, address, verified phone and email required for payouts",
  },
  {
    icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
    title: "Phone & Email Verification",
    desc: "SMS and email confirmation to secure your account",
  },
];

const empRequirements: {
  icon: string | string[];
  title: string;
  desc: string;
  required: boolean;
}[] = [
  {
    icon: [
      "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z",
      "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
    ],
    title: "Physical Address",
    desc: "Your business or residential address for job location accuracy",
    required: true,
  },
  {
    icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
    title: "Phone Number",
    desc: "For direct communication and account security",
    required: true,
  },
  {
    icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Email & Phone Verification",
    desc: "SMS and email confirmation to verify your account",
    required: true,
  },
  {
    icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
    title: "Payment Method",
    desc: "Add a card to book service providers and secure payment in escrow",
    required: false,
  },
];

function IconFromPath({ d }: { d: string | string[] }) {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      {Array.isArray(d) ? (
        d.map((p) => (
          <path key={p} strokeLinecap="round" strokeLinejoin="round" d={p} />
        ))
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      )}
    </svg>
  );
}

export default function DashboardHowItWorksPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/support"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-[var(--muted-text)] transition-colors hover:text-[var(--foreground)]"
        >
          <svg
            className="h-3.5 w-3.5"
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
          {t("support.backToSupport", "Back to Support")}
        </Link>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          {t("support.helpCenter", "Help Center")}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
          {t("howItWorks.title", "How Nasta Works")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted-text)]">
          {t(
            "howItWorks.subtitle",
            "Verified before the first job. Trusted from day one.",
          )}
        </p>
      </div>

      {/* 3 Steps */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            num: "01",
            title: t("howItWorks.step1Title", "Create your profile"),
            desc: t(
              "howItWorks.step1Desc",
              "Sign up, verify your identity, and set your preferences.",
            ),
          },
          {
            num: "02",
            title: t("howItWorks.step2Title", "Request or apply"),
            desc: t(
              "howItWorks.step2Desc",
              "Employers request on demand. Providers apply with one tap.",
            ),
          },
          {
            num: "03",
            title: t("howItWorks.step3Title", "Complete & get paid"),
            desc: t(
              "howItWorks.step3Desc",
              "Job done, funds released instantly. Simple and transparent.",
            ),
          },
        ].map((s) => (
          <div
            key={s.num}
            className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5"
          >
            <span className="block text-3xl font-bold leading-none text-[var(--primary)] opacity-[0.15]">
              {s.num}
            </span>
            <h3 className="mt-2 text-sm font-semibold text-[var(--foreground)]">
              {s.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted-text)]">
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Service Providers */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--warm-coral,#e07a5f)] to-[var(--primary)]" />
        <div className="p-6">
          <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--primary)] ring-1 ring-[var(--primary)]/20">
            {t("howItWorks.spBadge", "Service Providers")}
          </div>
          <h2 className="mt-2 text-lg font-bold text-[var(--foreground)]">
            {t("howItWorks.spTitle", "Get verified once, earn forever")}
          </h2>
          <p className="mt-1 mb-5 text-xs leading-relaxed text-[var(--muted-text)]">
            {t(
              "howItWorks.spDesc",
              "Complete your verification to unlock instant job requests and start earning.",
            )}
          </p>
          <div className="space-y-0.5">
            {spRequirements.map((item, idx) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-[var(--surface-alt)]"
              >
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                  <IconFromPath d={item.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    {t(`howItWorks.spReq${idx}Title`, item.title)}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted-text)]">
                    {t(`howItWorks.spReq${idx}Desc`, item.desc)}
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                  {t("howItWorks.required", "Required")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employers */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[var(--soft-blue,#6b9ac4)] via-[var(--primary)] to-[var(--soft-blue,#6b9ac4)]" />
        <div className="p-6">
          <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-[var(--soft-blue,#6b9ac4)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--soft-blue,#6b9ac4)] ring-1 ring-[var(--soft-blue,#6b9ac4)]/20">
            {t("howItWorks.empBadge", "Employers")}
          </div>
          <h2 className="mt-2 text-lg font-bold text-[var(--foreground)]">
            {t("howItWorks.empTitle", "Post your first job in minutes")}
          </h2>
          <p className="mt-1 mb-5 text-xs leading-relaxed text-[var(--muted-text)]">
            {t(
              "howItWorks.empDesc",
              "A lighter setup so you can start hiring fast.",
            )}
          </p>
          <div className="space-y-0.5">
            {empRequirements.map((item, idx) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-[var(--surface-alt)]"
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${item.required ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : "bg-[var(--soft-blue,#6b9ac4)]/10 text-[var(--soft-blue,#6b9ac4)] ring-[var(--soft-blue,#6b9ac4)]/20"}`}
                >
                  <IconFromPath d={item.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    {t(`howItWorks.empReq${idx}Title`, item.title)}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted-text)]">
                    {t(`howItWorks.empReq${idx}Desc`, item.desc)}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${item.required ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : "bg-[var(--soft-blue,#6b9ac4)]/10 text-[var(--soft-blue,#6b9ac4)] ring-[var(--soft-blue,#6b9ac4)]/20"}`}
                >
                  {item.required
                    ? t("howItWorks.required", "Required")
                    : t("howItWorks.optional", "Optional")}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-[var(--surface-alt)] p-4">
            <p className="text-xs leading-relaxed text-[var(--muted-text)]">
              <strong className="text-[var(--foreground)]">
                {t("howItWorks.quickStart", "Quick start:")}
              </strong>{" "}
              {t(
                "howItWorks.quickStartDesc",
                "You can browse verified service providers immediately after creating your account. Add your address and verify your phone to post your first job or send an instant request.",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Trust */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/20">
          <svg
            className="h-6 w-6 text-[var(--primary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-[var(--foreground)]">
          {t("howItWorks.trustTitle", "Every verification builds trust")}
        </h3>
        <p className="mt-1 mx-auto max-w-lg text-xs leading-relaxed text-[var(--muted-text)]">
          {t(
            "howItWorks.trustDesc",
            "These steps exist to protect everyone on the platform. Verified service providers get more job requests. Verified employers attract better talent.",
          )}
        </p>
      </div>
    </div>
  );
}
