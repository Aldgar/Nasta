"use client";
import Link from "next/link";
import PublicTopbar from "../../components/public/PublicTopbar";
import { useLanguage } from "../../context/LanguageContext";

const spIcons = [
  "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm-3.375 3.375h3.75",
  "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
  "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z",
  "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
  "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
];

const empIcons: (string | string[])[] = [
  [
    "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z",
    "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  ],
  "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
];

const empRequired = [true, true, true, false];

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

export default function HowItWorksPage() {
  const { t } = useLanguage();

  const steps = [
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
        "Clients request on demand. Providers apply with one tap.",
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
  ];

  const spRequirements = Array.from({ length: 7 }, (_, i) => ({
    icon: spIcons[i],
    title: t(`howItWorks.spReq${i}Title`),
    desc: t(`howItWorks.spReq${i}Desc`),
  }));

  const empRequirements = Array.from({ length: 4 }, (_, i) => ({
    icon: empIcons[i],
    title: t(`howItWorks.empReq${i}Title`),
    desc: t(`howItWorks.empReq${i}Desc`),
    required: empRequired[i],
  }));

  return (
    <div className="min-h-screen bg-brand-gradient text-[var(--foreground)]">
      <PublicTopbar />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-28">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--muted-text)] transition-colors hover:text-[var(--foreground)]"
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
          {t("common.back", "Back")}
        </Link>

        {/* Hero */}
        <section className="mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
            {t("howItWorks.heroLabel", "How it works")}
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            {t(
              "howItWorks.subtitle",
              "Verified before the first job. Trusted from day one.",
            )}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--muted-text)]">
            {t(
              "howItWorks.heroDesc",
              "We take trust seriously. Every user completes a verification process before they can post or accept a single job. Here is exactly what is required for each side.",
            )}
          </p>
        </section>

        {/* 3 Steps overview */}
        <section className="mb-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.num}
                className="rounded-2xl border border-[var(--border-color)]/20 bg-white/[0.02] p-6 backdrop-blur-sm"
              >
                <span className="block text-4xl font-bold leading-none text-[var(--primary)] opacity-[0.15]">
                  {s.num}
                </span>
                <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted-text)]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Service Providers verification */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border-color)]/20 bg-white/[0.02] backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--warm-coral)] to-[var(--primary)]" />
            <div className="p-8 sm:p-10">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)] ring-1 ring-[var(--primary)]/20">
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
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                {t("howItWorks.spBadge", "Service Providers")}
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                {t("howItWorks.spTitle", "Get verified once, earn forever")}
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-[var(--muted-text)]">
                {t(
                  "howItWorks.spFullDesc",
                  "Complete your verification to unlock instant job requests and start earning. Every step builds your trust score and visibility to clients.",
                )}
              </p>
              <div className="space-y-0.5">
                {spRequirements.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                      <IconFromPath d={item.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted-text)]">
                        {item.desc}
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
        </section>

        {/* Employers verification */}
        <section className="mb-20">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border-color)]/20 bg-white/[0.02] backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--soft-blue)] via-[var(--primary)] to-[var(--soft-blue)]" />
            <div className="p-8 sm:p-10">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--soft-blue)]/10 px-3 py-1 text-xs font-semibold text-[var(--soft-blue)] ring-1 ring-[var(--soft-blue)]/20">
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
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                  />
                </svg>
                {t("howItWorks.empBadge", "Clients")}
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight">
                {t("howItWorks.empTitle", "Post your first job in minutes")}
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-[var(--muted-text)]">
                {t(
                  "howItWorks.empFullDesc",
                  "A lighter setup so you can start hiring fast. Add the essentials and request your first service provider today.",
                )}
              </p>
              <div className="space-y-0.5">
                {empRequirements.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-white/[0.03]"
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${
                        item.required
                          ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                          : "bg-[var(--soft-blue)]/10 text-[var(--soft-blue)] ring-[var(--soft-blue)]/20"
                      }`}
                    >
                      <IconFromPath d={item.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted-text)]">
                        {item.desc}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                        item.required
                          ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                          : "bg-[var(--soft-blue)]/10 text-[var(--soft-blue)] ring-[var(--soft-blue)]/20"
                      }`}
                    >
                      {item.required
                        ? t("howItWorks.required", "Required")
                        : t("howItWorks.optional", "Optional")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-xl border border-[var(--border-color)]/10 bg-white/[0.02] p-5">
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
        </section>

        {/* Trust statement */}
        <section className="mb-20 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/20">
            <svg
              className="h-7 w-7 text-[var(--primary)]"
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
          <h3 className="mb-3 text-xl font-bold tracking-tight">
            {t("howItWorks.trustTitle", "Every verification builds trust")}
          </h3>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-[var(--muted-text)]">
            {t(
              "howItWorks.trustDesc",
              "These steps exist to protect everyone on the platform. Verified service providers get more job requests. Verified clients attract better talent. The result is a marketplace where both sides can work with confidence.",
            )}
          </p>
        </section>

        {/* Contact Us */}
        <section>
          <div className="rounded-3xl border border-[var(--border-color)]/20 bg-white/[0.02] p-8 text-center backdrop-blur-sm sm:p-12">
            <h2 className="mb-3 text-2xl font-bold tracking-tight">
              {t("howItWorks.stillHaveQuestions", "Still have questions?")}
            </h2>
            <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-[var(--muted-text)]">
              {t(
                "howItWorks.stillHaveQuestionsDesc",
                "Our team is here to help. Whether you need guidance on verification, payment, or anything else, reach out anytime.",
              )}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/support"
                className="btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[var(--primary)] to-[#96691E] border border-white/10 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-[0_4px_24px_rgba(201,150,63,0.3)]"
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
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                {t("howItWorks.contactSupport", "Contact Support")}
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)]/40 px-6 py-3 text-sm font-semibold transition-all duration-300 hover:border-[var(--primary)]/50 hover:bg-white/[0.05]"
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
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
                {t("howItWorks.viewFAQs", "View FAQs")}
              </Link>
              <a
                href="mailto:support@nasta.app"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)]/40 px-6 py-3 text-sm font-semibold transition-all duration-300 hover:border-[var(--primary)]/50 hover:bg-white/[0.05]"
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
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                support@nasta.app
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
