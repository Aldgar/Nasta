"use client";
import Link from "next/link";
import PublicTopbar from "../../components/public/PublicTopbar";
import { useLanguage } from "../../context/LanguageContext";

const benefitIcons = [
  <svg key="0" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  <svg key="1" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>,
  <svg key="2" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
  <svg key="3" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  <svg key="4" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
  <svg key="5" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
];

const reqRequired = [true, true, true, false];

export default function ForEmployersPage() {
  const { t } = useLanguage();

  const benefits = Array.from({ length: 6 }, (_, i) => ({
    icon: benefitIcons[i],
    title: t(`forEmployersPage.benefit${i}Title`),
    desc: t(`forEmployersPage.benefit${i}Desc`),
  }));

  const steps = [
    { num: "01", title: t("forEmployersPage.step0Title", "Post or request instantly"), desc: t("forEmployersPage.step0Desc") },
    { num: "02", title: t("forEmployersPage.step1Title", "Get matched with verified talent"), desc: t("forEmployersPage.step1Desc") },
    { num: "03", title: t("forEmployersPage.step2Title", "Book, monitor, and pay"), desc: t("forEmployersPage.step2Desc") },
  ];

  const requirements = Array.from({ length: 4 }, (_, i) => ({
    title: t(`forEmployersPage.req${i}Title`),
    desc: t(`forEmployersPage.req${i}Desc`),
    required: reqRequired[i],
  }));

  return (
    <div className="min-h-screen bg-brand-gradient text-[var(--foreground)]">
      <PublicTopbar />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-28">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--muted-text)] transition-colors hover:text-[var(--foreground)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t("common.back", "Back")}
        </Link>

        {/* Hero */}
        <section className="mb-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
            {t("forEmployersPage.heroLabel", "For Employers")}
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            {t("forEmployersPage.heroTitle", "Instant access to verified talent")}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--muted-text)]">
            {t("forEmployersPage.heroDesc", "Need something done right now? Request instantly available, verified service providers on demand. Every worker is ID-verified, every assignment is monitored in real-time, and every payment is protected by Stripe escrow.")}
          </p>
        </section>

        {/* Benefits */}
        <section className="mb-20">
          <h2 className="mb-10 text-2xl font-bold tracking-tight">
            {t("forEmployersPage.whyTitle", "Why employers choose Nasta")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-[var(--border-color)]/20 bg-white/[0.02] p-7 backdrop-blur-sm transition-all duration-300 hover:border-[var(--primary)]/30 hover:bg-white/[0.04]"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] ring-1 ring-[var(--primary)]/15">
                  {b.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold">{b.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted-text)]">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-20">
          <h2 className="mb-10 text-2xl font-bold tracking-tight">
            {t("forEmployersPage.howTitle", "How it works")}
          </h2>
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((s) => (
              <div key={s.num}>
                <span className="block text-5xl font-bold leading-none text-[var(--primary)] opacity-[0.15]">
                  {s.num}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-text)]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What you need */}
        <section className="mb-20">
          <h2 className="mb-3 text-2xl font-bold tracking-tight">
            {t("forEmployersPage.reqTitle", "What you need to get started")}
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-[var(--muted-text)]">
            {t("forEmployersPage.reqDesc", "A quick setup so you can start hiring fast. Add the essentials and request your first service provider today.")}
          </p>
          <div className="space-y-3">
            {requirements.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border-color)]/20 bg-white/[0.02] px-5 py-4 backdrop-blur-sm"
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${
                    item.required
                      ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                      : "bg-[var(--soft-blue)]/10 text-[var(--soft-blue)] ring-[var(--soft-blue)]/20"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-[var(--muted-text)]">{item.desc}</p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${
                    item.required
                      ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                      : "bg-[var(--soft-blue)]/10 text-[var(--soft-blue)] ring-[var(--soft-blue)]/20"
                  }`}
                >
                  {item.required ? t("forEmployersPage.required", "Required") : t("forEmployersPage.optional", "Optional")}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Trust callout */}
        <section className="mb-20">
          <div className="rounded-2xl border border-[var(--border-color)]/20 bg-white/[0.02] p-8 backdrop-blur-sm sm:p-10">
            <h2 className="mb-4 text-xl font-bold">
              {t("forEmployersPage.protectedTitle", "Your money is protected")}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--muted-text)]">
              <p>{t("forEmployersPage.protectedP1", "When you book a service provider, payment is secured in Stripe escrow before work begins. The service provider can see the payment is secured, but cannot access the funds.")}</p>
              <p>{t("forEmployersPage.protectedP2", "Once the job is complete and you confirm satisfaction, the funds are released. If there is a dispute, our team reviews the case with full GPS logs, check-in/out records, and communication history.")}</p>
              <p>{t("forEmployersPage.protectedP3", "Nasta takes a small platform commission to cover payment processing, identity verification, and monitoring infrastructure. You never pay more than the agreed job price.")}</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight">
            {t("forEmployersPage.ctaTitle", "Ready to hire?")}
          </h2>
          <p className="mx-auto mb-8 max-w-md text-base text-[var(--muted-text)]">
            {t("forEmployersPage.ctaDesc", "Create a free employer account and post your first job in minutes.")}
          </p>
          <Link
            href="/register"
            className="btn-glow inline-flex items-center rounded-xl bg-gradient-to-b from-[var(--primary)] to-[#96691E] border border-white/10 px-8 py-4 text-base font-semibold text-white shadow-[0_4px_24px_rgba(201,150,63,0.25)] transition-all duration-300 hover:shadow-[0_4px_36px_rgba(201,150,63,0.45)] hover:brightness-110"
          >
            {t("forEmployersPage.ctaButton", "Create Employer Account")}
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </section>
      </main>
    </div>
  );
}
