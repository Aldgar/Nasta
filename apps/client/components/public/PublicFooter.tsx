"use client";
import Link from "next/link";
import BrandLogo from "./BrandLogo";

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { label: "Terms and Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Delete Account", href: "/delete-account" },
    { label: "Cookies Settings", href: "/cookies" },
    { label: "Platform Rules", href: "/platform-rules" },
  ];

  return (
    <footer className="relative border-t border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BrandLogo size={32} animated tile />
              <span className="text-xl font-semibold text-white">Cumprido</span>
            </div>
            <p className="text-sm text-neutral-200">
              Connecting service providers with employers. Find jobs, track
              work, and get paid seamlessly.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact/Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>
                <a
                  href="mailto:support@cumprido.com"
                  className="transition-colors hover:text-white"
                >
                  support@cumprido.com
                </a>
              </li>
              <li className="text-neutral-400">
                © {currentYear} Cumprido. All rights reserved.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
