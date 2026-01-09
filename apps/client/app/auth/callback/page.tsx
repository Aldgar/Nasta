import AuthCallbackClient from "@/components/auth/AuthCallbackClient";
import PublicTopbar from "@/components/public/PublicTopbar";
import { Suspense } from "react";

export const metadata = {
  title: "Signing in… | Cumprido",
};

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <PublicTopbar />
      <main className="mx-auto max-w-7xl px-4 pt-24">
        <Suspense
          fallback={
            <p className="text-sm text-neutral-600">Finishing sign-in…</p>
          }
        >
          <AuthCallbackClient />
        </Suspense>
      </main>
    </div>
  );
}
