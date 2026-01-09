import AuthGuard from "@/components/auth/AuthGuard";
import SettingsHub from "@/components/settings/SettingsHub";
import BackButton from "@/components/navigation/BackButton";

export const metadata = { title: "Settings | Cumprido" };

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-neutral-900">
      <AuthGuard>
        <div className="mb-4">
          <BackButton fallback="/" />
        </div>
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">Settings</h1>
        <SettingsHub />
      </AuthGuard>
    </main>
  );
}
