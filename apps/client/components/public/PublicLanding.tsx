"use client";
import PublicTopbar from "./PublicTopbar";
import ConicGradient from "../ui/ConicGradient";
import GlassyButton from "../ui/GlassyButton";
import AnimatedLogoSVG from "./AnimatedLogoSVG";
import PublicFooter from "./PublicFooter";

export default function PublicLanding() {
  return (
    <div className="relative min-h-screen bg-brand-gradient text-white flex flex-col">
      <PublicTopbar />

      {/* Decorative animated gradient backdrop */}
      <ConicGradient className="top-[-10vh]" opacity={0.25} sizeVmax={140} />
      
      <main className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pt-24 pb-12 md:grid-cols-[1fr_1.35fr] flex-grow">
        {/* Left column: headline + boxed CTAs */}
        <section>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight">
            Built For People
            <br />
            Who Get Things Done
          </h1>

          {/* Coming Soon Message */}
          <div className="mt-6 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-lg font-medium text-white mb-2">
              Website Coming Soon! 🚀
            </p>
            <p className="text-sm text-neutral-200 mb-4">
              Our website is currently under development. In the meantime, you can download our mobile apps and start using Cumprido today!
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://apps.apple.com/app/cumprido"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Download for iOS
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.mohamedibrahim.cumprido"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                Download for Android
              </a>
            </div>
          </div>

          {/* Boxed button group - DISABLED */}
          <div className="mt-8 w-full max-w-[480px] rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-6 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_20px_40px_-18px_rgba(0,0,0,0.35)] opacity-50">
            <div className="space-y-4">
              <GlassyButton
                className="w-full cursor-not-allowed"
                onClick={() => {}}
                ariaLabel="Continue with Google (Coming Soon)"
                variant="brand"
                disabled
              >
                <span className="inline-flex h-5 w-5 mr-2 items-center justify-center rounded bg-transparent">
                  <svg viewBox="0 0 48 48" className="h-5 w-5">
                    <path
                      fill="#FFC107"
                      d="M43.611 20.083h-1.611v-.083H24v8h11.303C33.788 31.915 29.273 35 24 35c-7.18 0-13-5.82-13-13s5.82-13 13-13c3.313 0 6.323 1.243 8.598 3.272l5.657-5.657C34.63 3.053 29.584 1 24 1 10.745 1 0 11.745 0 25s10.745 24 24 24 24-10.745 24-24c0-1.619-.164-3.199-.389-4.834z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M0 25c0 13.255 10.745 24 24 24 6.438 0 12.287-2.609 16.453-6.834l-6.676-5.459C31.3 38.064 27.882 39 24 39 15.82 39 9 32.18 9 24S15.82 9 24 9c3.313 0 6.323 1.243 8.598 3.272l5.657-5.657C34.63 3.053 29.584 1 24 1 10.745 1 0 11.745 0 25z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 1c-6.627 0-12.532 2.686-16.971 7.029l6.971 5.657C16.919 10.49 20.245 9 24 9c3.313 0 6.323 1.243 8.598 3.272l5.657-5.657C34.63 3.053 29.584 1 24 1z"
                    />
                    <path
                      fill="#1976D2"
                      d="M24 49c5.343 0 10.328-1.8 14.285-4.857l-6.676-5.459C29.305 40.469 26.75 41 24 41 15.82 41 9 34.18 9 26s6.82-15 15-15c3.313 0 6.323 1.243 8.598 3.272l5.657-5.657C34.63 3.053 29.584 1 24 1 10.745 1 0 11.745 0 25s10.745 24 24 24z"
                    />
                  </svg>
                </span>
                Continue with Google (Coming Soon)
              </GlassyButton>

              <GlassyButton
                className="w-full cursor-not-allowed"
                onClick={() => {}}
                ariaLabel="Sign in with email (Coming Soon)"
                variant="brand"
                disabled
              >
                Sign in with email (Coming Soon)
              </GlassyButton>

              <div className="pt-2 text-xs text-neutral-200">
                By clicking Continue to join or sign in, you agree to Cumprido's
                <a className="mx-1 underline hover:text-white" href="/terms">
                  User Agreement
                </a>
                ,
                <a className="mx-1 underline hover:text-white" href="/privacy">
                  Privacy Policy
                </a>
                , and
                <a className="mx-1 underline hover:text-white" href="/cookies">
                  Cookie Policy
                </a>
                .
              </div>

              <div className="pt-4 text-sm">
                <p className="mb-2 text-neutral-100">
                  New to Cumprido? Choose your path:
                </p>
                <div className="flex flex-wrap gap-3">
                  <GlassyButton
                    onClick={() => {}}
                    ariaLabel="Join as Job Seeker (Coming Soon)"
                    variant="brand"
                    disabled
                    className="cursor-not-allowed"
                  >
                    Join as Job Seeker (Coming Soon)
                  </GlassyButton>
                  <GlassyButton
                    onClick={() => {}}
                    ariaLabel="Join as Employer (Coming Soon)"
                    variant="brand"
                    disabled
                    className="cursor-not-allowed"
                  >
                    Join as Employer (Coming Soon)
                  </GlassyButton>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section
          aria-label="hero-right"
          className="relative mx-auto w-full max-w-4xl flex items-center justify-center"
        >
          {/* Animated SVG Logo */}
          <AnimatedLogoSVG size={400} className="animate-float-slow" />
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
