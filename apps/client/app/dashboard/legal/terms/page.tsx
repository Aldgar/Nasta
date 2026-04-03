"use client";
import Link from "next/link";
import { LEGAL_TEXT } from "../../../../lib/legal-text";
import { useLanguage } from "../../../../context/LanguageContext";
import DashboardLegalContent from "../DashboardLegalContent";

export default function DashboardTermsPage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-text)] transition-colors hover:text-[var(--primary)]"
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
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          {t("common.backToDashboard", "Back to Dashboard")}
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-[var(--foreground)]">
          {t("legal.termsOfService", "Terms of Service")}
        </h1>
      </div>
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 sm:p-10">
        <DashboardLegalContent content={LEGAL_TEXT.TERMS_OF_SERVICE} />
      </div>
    </div>
  );
}
