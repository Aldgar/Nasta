"use client";
import { useState } from "react";
import Link from "next/link";
import PublicTopbar from "../../components/public/PublicTopbar";
import { useLanguage } from "../../context/LanguageContext";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border-color)]/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-base font-medium transition-colors hover:text-[var(--primary)]"
      >
        {q}
        <svg
          className={`ml-4 h-5 w-5 flex-shrink-0 text-[var(--muted-text)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
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
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-5" : "max-h-0"}`}
      >
        <p className="text-sm leading-relaxed text-[var(--muted-text)]">{a}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const { t } = useLanguage();

  const faqs = Array.from({ length: 11 }, (_, i) => ({
    q: t(`faq.q${i + 1}`),
    a: t(`faq.a${i + 1}`),
  }));

  return (
    <div className="min-h-screen bg-brand-gradient text-[var(--foreground)]">
      <PublicTopbar />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-28">
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

        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {t("faq.title", "Frequently Asked Questions")}
        </h1>
        <p className="mb-10 text-base text-[var(--muted-text)]">
          {t("faq.subtitle", "Everything you need to know about Nasta.")}
        </p>

        <div>
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[var(--border-color)]/20 bg-white/[0.02] p-8 text-center backdrop-blur-sm">
          <h3 className="mb-2 text-lg font-semibold">{t("faq.stillHaveQuestions", "Still have questions?")}</h3>
          <p className="mb-4 text-sm text-[var(--muted-text)]">
            {t("faq.stillHaveQuestionsDesc", "We are here to help. Reach out anytime.")}
          </p>
          <a
            href="mailto:support@nasta.app"
            className="btn-glow inline-flex items-center rounded-xl bg-gradient-to-b from-[var(--primary)] to-[#96691E] border border-white/10 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-[0_4px_24px_rgba(201,150,63,0.3)]"
          >
            {t("faq.contactSupport", "Contact Support")}
          </a>
        </div>
      </main>
    </div>
  );
}
