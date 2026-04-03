import BackButton from "../../../components/navigation/BackButton";
import EmployerOnboardingForm from "../../../components/onboarding/EmployerOnboardingForm";

export const metadata = { title: "Employer Onboarding" };

export default function EmployerOnboardingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-neutral-900">
      <div className="mb-4">
        <BackButton fallback="/" />
      </div>
      <h1 className="text-3xl font-semibold">Create your employer profile</h1>
      <p className="mt-2 text-sm text-neutral-700">
        Tell us about yourself and where you are. Employers on Nasta are
        individuals, not companies. KYC is not required at this stage, and you
        can complete this on web or mobile.
      </p>
      <div className="mt-8">
        <EmployerOnboardingForm />
      </div>
    </main>
  );
}
