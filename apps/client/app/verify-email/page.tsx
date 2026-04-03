"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useLanguage } from "../../context/LanguageContext";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const token = searchParams?.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const verify = useCallback(async () => {
    if (!token) return;
    const res = await api<{ success: boolean; message: string }>(
      "/auth/email/verify",
      { method: "POST", body: JSON.stringify({ token }) },
    );
    if (res.data?.success) {
      setStatus("success");
      setTimeout(() => {
        router.push(user ? "/dashboard" : "/login");
      }, 2500);
    } else {
      setStatus("error");
      setErrorMessage(
        res.error ||
          t(
            "web.verifyEmail.errorMessage",
            "Invalid or expired verification link. Please request a new one.",
          ),
      );
    }
  }, [token, router, user]);

  useEffect(() => {
    if (token) verify();
    else setStatus("error");
  }, [token, verify]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] shadow-xl p-8 text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              {t("web.verifyEmail.verifying", "Verifying your email...")}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted-text)]">
              {t(
                "auth.verification.verifying",
                "Please wait while we confirm your email address.",
              )}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              {t("web.verifyEmail.successTitle", "Email Verified!")}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted-text)]">
              {t(
                "web.verifyEmail.successMessage",
                "Your email has been verified successfully. Redirecting…",
              )}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              {t("web.verifyEmail.failed", "Verification Failed")}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted-text)]">
              {errorMessage ||
                t(
                  "web.verifyEmail.errorMessage",
                  "The verification link is invalid or has expired.",
                )}
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-6 rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              {t("web.verifyEmail.goToLogin", "Go to Login")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] shadow-xl p-8 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
            <p className="text-sm text-[var(--muted-text)]">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
