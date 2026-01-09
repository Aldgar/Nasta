import AuthGuard from "@/components/auth/AuthGuard";
import VerificationSettings from "@/components/settings/VerificationSettings";
import BackButton from "@/components/navigation/BackButton";

export const metadata = { title: "Verification | Cumprido" };

export default function VerificationPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-neutral-900">
      <AuthGuard>
        <div className="mb-4">
          <BackButton fallback="/settings" />
        </div>
        <h1 className="mb-4 text-2xl font-semibold">Verification</h1>
        <VerificationSettings />
      </AuthGuard>
    </main>
  );
}
