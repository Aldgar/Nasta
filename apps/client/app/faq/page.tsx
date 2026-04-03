"use client";
import { useState } from "react";
import Link from "next/link";
import PublicTopbar from "../../components/public/PublicTopbar";

const faqs = [
  {
    q: "What is Nasta?",
    a: "Nasta is an on-demand marketplace that connects verified service providers with trusted employers for instant work. Think of it like a ride-sharing app, but for jobs. Employers can request help right now, and service providers can pick up jobs instantly as their main work or a side gig.",
  },
  {
    q: "How does payment work?",
    a: "When an employer books a job, payment is secured upfront via Stripe and held in escrow. Once the job is marked complete by both parties, funds are released to the service provider automatically.",
  },
  {
    q: "Is my identity verified?",
    a: "Yes. Every user on Nasta goes through identity verification with government-issued documents before they can accept or post jobs. This protects both employers and service providers.",
  },
  {
    q: "What types of jobs can I find on Nasta?",
    a: "Nasta supports unlimited job categories including cleaning, childcare, elderly care, construction, event staffing, moving, gardening, tutoring, and much more. If you can do it, you can list it.",
  },
  {
    q: "How does Nasta protect employers?",
    a: "Employers only pay when the job is complete. Every worker is ID-verified, assignments include live GPS tracking and digital check-in/out, and there is a fair cancellation and no-show protection policy.",
  },
  {
    q: "How does Nasta protect service providers?",
    a: "Payment is secured before work begins, so you are guaranteed to get paid for completed work. All employers are also verified, and you can rate and review every assignment.",
  },
  {
    q: "What are the fees?",
    a: "Creating an account is free for both employers and service providers. Nasta takes a small platform commission from each completed job to cover payment processing and platform operations.",
  },
  {
    q: "Is Nasta available on mobile?",
    a: "Yes. Nasta has full-featured iOS and Android apps. You can apply for jobs, manage bookings, chat, and receive payments all from your phone.",
  },
  {
    q: "How do I get started?",
    a: "Simply create a free account, verify your identity, set up your profile, and start browsing. The whole process takes less than five minutes.",
  },
  {
    q: "Can I use Nasta as a side job?",
    a: "Absolutely. Many service providers use Nasta to pick up extra work on their own schedule. You choose when you are available and which jobs to accept. There are no minimum hours or commitments.",
  },
  {
    q: "How fast can I find a worker?",
    a: "Employers can use instant requests to find available, verified service providers nearby in seconds. For scheduled jobs, you will typically receive applications from qualified candidates shortly after posting.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border-color)]/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-base font-medium transition-colors hover:text-[var(--primary)]"
      >
        {q}
        <svg
          className={`ml-4 h-5 w-5 flex-shrink-0 text-[var(--muted-text)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-5" : "max-h-0"}`}
      >
        <p className="text-sm leading-relaxed text-[var(--muted-text)]">{a}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
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

        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mb-10 text-base text-[var(--muted-text)]">
          Everything you need to know about Nasta.
        </p>

        <div>
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[var(--border-color)]/20 bg-white/[0.02] p-8 text-center backdrop-blur-sm">
          <h3 className="mb-2 text-lg font-semibold">Still have questions?</h3>
          <p className="mb-4 text-sm text-[var(--muted-text)]">
            We are here to help. Reach out anytime.
          </p>
          <a
            href="mailto:support@nasta.app"
            className="btn-glow inline-flex items-center rounded-xl bg-gradient-to-b from-[var(--primary)] to-[#96691E] border border-white/10 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-[0_4px_24px_rgba(201,150,63,0.3)]"
          >
            Contact Support
          </a>
        </div>
      </main>
    </div>
  );
}
