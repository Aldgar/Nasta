"use client";
import Link from "next/link";
import Image from "next/image";
import PublicTopbar from "../../components/public/PublicTopbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-gradient text-[var(--foreground)]">
      <PublicTopbar />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--muted-text)] transition-colors hover:text-[var(--foreground)]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Back
        </Link>

        <div className="mb-10 flex items-center gap-4">
          <Image
            src="/nasta-app-icon.png"
            alt="Nasta"
            width={56}
            height={56}
            className="rounded-xl"
          />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            About Nasta
          </h1>
        </div>

        <div className="space-y-6 text-base leading-relaxed text-[var(--muted-text)]">
          <p>
            Nasta is an on-demand workforce marketplace that connects verified
            service providers with trusted employers instantly. Whether you need
            someone right now for an urgent task or want to schedule a long-term
            contract, Nasta makes hiring fast, fair, and fully transparent.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-[var(--foreground)]">
            Our Mission
          </h2>
          <p>
            We believe that everyone deserves instant access to legitimate work
            opportunities, and every employer deserves instant access to
            reliable, verified talent. Nasta was built to make that connection
            instant and seamless, while protecting both sides with secure
            payments, identity verification, and real-time job monitoring.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-[var(--foreground)]">
            How It Works
          </h2>
          <ul className="list-inside list-disc space-y-2">
            <li>
              <strong className="text-[var(--foreground)]">For Service Providers:</strong>{" "}
              Create a verified profile and receive instant job requests near you.
              Use Nasta as your main income or a flexible side gig, and get paid
              securely when the work is done.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">For Employers:</strong>{" "}
              Post instant requests for on-demand help or schedule jobs across
              unlimited categories. Browse verified candidates, book with
              confidence, and only release payment when you&apos;re satisfied.
            </li>
          </ul>

          <h2 className="pt-4 text-xl font-semibold text-[var(--foreground)]">
            Trust &amp; Safety
          </h2>
          <p>
            Every user on Nasta is identity-verified with government-issued
            documents. Payments are held in escrow via Stripe until the job is
            complete. Live GPS tracking and digital check-in/out ensure full
            accountability for every assignment.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-[var(--foreground)]">
            Contact Us
          </h2>
          <p>
            Have questions? Reach out at{" "}
            <a
              href="mailto:support@nasta.app"
              className="text-[var(--primary)] underline underline-offset-2 transition-colors hover:text-[var(--soft-blue)]"
            >
              support@nasta.app
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
