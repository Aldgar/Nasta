"use client";
import { Suspense } from "react";
import PublicTopbar from "../../components/public/PublicTopbar";
import BackButton from "../../components/navigation/BackButton";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <PublicTopbar />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16">
        <div className="mb-6">
          <BackButton fallback="/" />
        </div>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Choose your role and enter your credentials.
          </p>
          <div className="mt-8">
            <Suspense
              fallback={
                <div className="text-sm text-neutral-500">Loading…</div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
