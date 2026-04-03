import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProviderWrapper } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home — Nasta",
  description: "Connect with opportunities. Manage your workforce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Initialize theme early to avoid flash of incorrect theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    var pref = localStorage.getItem('pref_theme');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (pref === 'dark') {
      root.classList.add('dark');
    } else if (pref === 'light') {
      root.classList.add('light');
    } else if (systemDark) {
      root.classList.add('dark');
    }
    root.classList.add('theme-transition');
  } catch (_) {}
})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased bg-background text-foreground`}
      >
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}
