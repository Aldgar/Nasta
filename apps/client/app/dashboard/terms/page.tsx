"use client";
import Link from "next/link";
import LegalContent from "../../../components/public/LegalContent";
import { LEGAL_TEXT } from "../../../lib/legal-text";
import { useLanguage } from "../../../context/LanguageContext";

export default function DashboardTermsPage() {
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
          {t("common.backToSupport", "Back to Support")}
        </Link>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          {t("legal.legal", "Legal")}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
          {t("legal.termsOfService", "Terms of Service")}
        </h1>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 sm:p-8">
        <LegalContent content={LEGAL_TEXT.TERMS_OF_SERVICE} />
      </div>
    </div>
  );
}
