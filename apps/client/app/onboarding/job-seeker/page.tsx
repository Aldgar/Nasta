import BackButton from "@/components/navigation/BackButton";
import JobSeekerOnboardingForm from "@/components/onboarding/JobSeekerOnboardingForm";

export const metadata = {
  title: "Job Seeker Onboarding | Cumprido",
  description: "Set up your profile and continue KYC on mobile.",
};

export default function JobSeekerOnboardingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-4">
        <BackButton fallback="/" />
      </div>
      <h1 className="mb-4 text-2xl font-semibold text-primary">
        Job Seeker Onboarding
      </h1>
      <p className="mb-6 text-sm text-neutral-700">
        Tell us a bit about you. We’ll save your info and you can finish KYC in
        the mobile app.
      </p>
      <JobSeekerOnboardingForm />
    </div>
  );
}
