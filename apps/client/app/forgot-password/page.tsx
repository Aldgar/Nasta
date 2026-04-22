"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError(
        t("web.forgotPassword.enterEmail", "Please enter your email address."),
      );
      return;
    }
    setLoading(true);
    try {
      const res = await api("/auth/password/request-reset", {
        method: "POST",
        body: { email: trimmed },
      });
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError(
        t(
          "web.forgotPassword.networkError",
          "Network error, check your connection.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Nasta home">
            <Image
              src="/NastaLogoLight.png"
              alt="Nasta"
              width={140}
              height={140}
              priority
              className="animate-float-slow"
            />
          </Link>
        </div>

        <div className="glass-surface rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--achievement-green)]/20">
                <svg
                  className="h-8 w-8 text-[var(--achievement-green)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[var(--gentle-peach)]">
                {t("web.forgotPassword.successTitle", "Check your email")}
              </h1>
              <p className="mt-2 text-sm text-[var(--muted-text)]">
                {t(
                  "web.forgotPassword.successMessage",
                  "If an account exists for this email, we've sent a temporary password. Use it to log in, then change your password in settings.",
                )}
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--soft-blue)] transition-all"
              >
                {t("web.forgotPassword.backToLogin", "Back to sign in")}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--gentle-peach)]">
                {t("web.forgotPassword.title", "Reset password")}
              </h1>
              <p className="mt-1 text-sm text-[var(--muted-text)]">
                {t(
                  "web.forgotPassword.description",
                  "Enter the email associated with your account and we'll send you a temporary password.",
                )}
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--muted-text)] uppercase tracking-wider">
                    {t("web.forgotPassword.email", "Email")}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/60"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-[var(--alert-red)]/30 bg-[var(--alert-red)]/10 px-3 py-2 text-sm text-[var(--alert-red)]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--soft-blue)] hover:shadow-lg hover:shadow-[var(--primary)]/20 disabled:opacity-50"
                >
                  {loading
                    ? t("web.forgotPassword.sending", "Sending…")
                    : t(
                        "web.forgotPassword.sendTempPassword",
                        "Send reset link",
                      )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--muted-text)]">
                {t(
                  "web.forgotPassword.rememberPassword",
                  "Remember your password?",
                )}{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[var(--soft-blue)] hover:text-[var(--warm-coral)] transition-colors"
                >
                  {t("web.login.signIn", "Sign in")}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
