"use client";
import PublicTopbar from "../../components/public/PublicTopbar";
import BackButton from "../../components/navigation/BackButton";
import LegalContent from "../../components/public/LegalContent";
import { LEGAL_TEXT } from "../../lib/legal-text";

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-brand-gradient text-white">
      <PublicTopbar />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-6">
          <BackButton fallback="/" />
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-8 sm:p-12 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_20px_40px_-18px_rgba(0,0,0,0.35)]">
          <LegalContent content={LEGAL_TEXT.ACCOUNT_DELETION} />
        </div>
      </main>
    </div>
  );
}
