import AuthGuard from "@/components/auth/AuthGuard";
import PaymentSettings from "@/components/settings/PaymentSettings";
import BackButton from "@/components/navigation/BackButton";

export const metadata = { title: "Payment Settings | Cumprido" };

export default function PaymentSettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-neutral-900">
      <AuthGuard>
        <div className="mb-4">
          <BackButton fallback="/settings" />
        </div>
        <h1 className="mb-4 text-2xl font-semibold">Payment</h1>
        <PaymentSettings />
      </AuthGuard>
    </main>
  );
}
