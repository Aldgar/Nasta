"use client";
import Link from "next/link";
import PublicTopbar from "../../components/public/PublicTopbar";

const benefits = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: "Instant Payouts",
    desc: "Funds are released as soon as the job is marked complete. No invoices, no delays. Instant payouts straight to your account, perfect for side income.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Payment Guaranteed",
    desc: "Every job is backed by Stripe escrow. The employer's payment is secured before you start, so you are guaranteed to be paid for completed work.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: "Verified Employers",
    desc: "Every employer on Nasta is verified too. You always know who you are working for, with transparent job details and fair terms.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: "Unlimited Categories",
    desc: "Cleaning, childcare, construction, events, tutoring, and more. Pick up instant jobs in any category, whether as your main work or a side gig.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    title: "Mobile First",
    desc: "Get instant job notifications, apply with one tap, chat with employers, and track your earnings. Full-featured iOS and Android app.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    title: "Build Your Reputation",
    desc: "Every completed job earns you ratings and reviews. A strong profile means more bookings, better jobs, and higher earnings over time.",
  },
];

const steps = [
  {
    num: "01",
    title: "Create your profile",
    desc: "Sign up for free, verify your identity with a government ID, and set up your skills and availability. Takes less than five minutes.",
  },
  {
    num: "02",
    title: "Get instant job requests",
    desc: "Receive real-time notifications for jobs near you that match your skills. Accept with one tap, or browse and apply on your schedule.",
  },
  {
    num: "03",
    title: "Work and get paid",
    desc: "Complete the assignment, check out digitally, and funds are released to your payout account. Simple, fast, transparent.",
  },
];

export default function ForServiceProvidersPage() {
  return (
    <div className="min-h-screen bg-brand-gradient text-[var(--foreground)]">
      <PublicTopbar />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-28">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--muted-text)] transition-colors hover:text-[var(--foreground)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>

        {/* Hero */}
        <section className="mb-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
            For Service Providers
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Earn instantly. On your terms.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--muted-text)]">
            Whether it is your main income or a side gig, Nasta connects you
            with instant job requests from verified employers. Get paid fast,
            work on your schedule, and build your reputation.
          </p>
        </section>

        {/* Benefits */}
        <section className="mb-20">
          <h2 className="mb-10 text-2xl font-bold tracking-tight">
            Why service providers choose Nasta
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-[var(--border-color)]/20 bg-white/[0.02] p-7 backdrop-blur-sm transition-all duration-300 hover:border-[var(--primary)]/30 hover:bg-white/[0.04]"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] ring-1 ring-[var(--primary)]/15">
                  {b.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold">{b.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted-text)]">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-20">
          <h2 className="mb-10 text-2xl font-bold tracking-tight">
            How it works
          </h2>
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((s) => (
              <div key={s.num}>
                <span className="block text-5xl font-bold leading-none text-[var(--primary)] opacity-[0.15]">
                  {s.num}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-text)]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What you need */}
        <section className="mb-20">
          <h2 className="mb-3 text-2xl font-bold tracking-tight">
            Get verified once, earn forever
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-[var(--muted-text)]">
            Complete your verification to unlock instant job requests and start
            earning. Every step builds your trust score and visibility.
          </p>
          <div className="space-y-3">
            {[
              { title: "Identity Verification", desc: "Government-issued photo ID to confirm your real identity" },
              { title: "Driver's License", desc: "Required for driving jobs, must be issued at least 3 years ago" },
              { title: "Background & Criminal Record Check", desc: "Comprehensive screening for your safety and employer trust" },
              { title: "Professional CV", desc: "Your work experience and qualifications on file" },
              { title: "Skills & Service Rates", desc: "List your professional skills with your service rates in EUR" },
              { title: "Bank Account & Payout Setup", desc: "Date of birth, address, verified phone and email required for payouts" },
              { title: "Phone & Email Verification", desc: "SMS and email confirmation to secure your account" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border-color)]/20 bg-white/[0.02] px-5 py-4 backdrop-blur-sm"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-[var(--muted-text)]">{item.desc}</p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                  Required
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Payout callout */}
        <section className="mb-20">
          <div className="rounded-2xl border border-[var(--border-color)]/20 bg-white/[0.02] p-8 backdrop-blur-sm sm:p-10">
            <h2 className="mb-4 text-xl font-bold">
              Your earnings are protected
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--muted-text)]">
              <p>
                Before you start any job, the employer's payment is already
                secured in Stripe escrow. Whether this is your full-time work
                or a side gig, you will never do work without the guarantee
                of getting paid.
              </p>
              <p>
                Once the job is complete and confirmed, your earnings are
                released directly to your connected payout account. Most payouts
                arrive within 1-2 business days.
              </p>
              <p>
                Nasta takes a small platform commission from each completed job
                to cover payment processing and platform operations. You always
                see the exact amount you will earn before accepting a job.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight">
            Ready to start earning?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-base text-[var(--muted-text)]">
            Create a free account, verify your identity, and start applying for
            jobs today.
          </p>
          <Link
            href="/register"
            className="btn-glow inline-flex items-center rounded-xl bg-gradient-to-b from-[var(--primary)] to-[#96691E] border border-white/10 px-8 py-4 text-base font-semibold text-white shadow-[0_4px_24px_rgba(201,150,63,0.25)] transition-all duration-300 hover:shadow-[0_4px_36px_rgba(201,150,63,0.45)] hover:brightness-110"
          >
            Create Free Account
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </section>
      </main>
    </div>
  );
}
