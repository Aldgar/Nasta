"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const TITLES: Record<string, string> = {
  // Public
  "/": "Home",
  "/about": "About",
  "/login": "Login",
  "/register": "Register",
  "/forgot-password": "Forgot Password",
  "/verify-email": "Verify Email",
  "/faq": "FAQ",
  "/how-it-works": "How It Works",
  "/for-employers": "For Clients",
  "/for-service-providers": "For Service Providers",
  "/terms": "Terms of Service",
  "/privacy": "Privacy Policy",
  "/cookies": "Cookie Policy",
  "/platform-rules": "Platform Rules",
  "/support": "Support",
  "/delete-account": "Delete Account",
  "/auth/callback": "Authenticating",
  "/onboarding/employer": "Client Onboarding",
  "/onboarding/job-seeker": "Job Seeker Onboarding",
  "/settings": "Settings",
  "/settings/verification": "Verification",
  "/settings/payment": "Payment Settings",

  // Dashboard – general
  "/dashboard": "Dashboard",
  "/dashboard/jobs": "Jobs",
  "/dashboard/applications": "Applications",
  "/dashboard/chat": "Chat",
  "/dashboard/payments": "Payments",
  "/dashboard/notifications": "Notifications",
  "/dashboard/schedule": "Schedule",
  "/dashboard/profile": "Profile",
  "/dashboard/settings": "Settings",
  "/dashboard/support": "Support",
  "/dashboard/faq": "FAQ",
  "/dashboard/how-it-works": "How It Works",
  "/dashboard/terms": "Terms of Service",
  "/dashboard/privacy": "Privacy Policy",
  "/dashboard/legal/terms": "Terms of Service",
  "/dashboard/legal/privacy": "Privacy Policy",
  "/dashboard/legal/platform-rules": "Platform Rules",

  // Dashboard – admin
  "/dashboard/admin": "Admin Dashboard",
  "/dashboard/admin/users": "User Management",
  "/dashboard/admin/kyc": "KYC Reviews",
  "/dashboard/admin/support": "Support Tickets",
  "/dashboard/admin/reports": "Reports",
  "/dashboard/admin/security": "Security",
  "/dashboard/admin/surveys": "Surveys",
  "/dashboard/admin/deletions": "Deletion Requests",
  "/dashboard/admin/admins": "Admin Management",

  // Dashboard – employer
  "/dashboard/employer": "Client Dashboard",
  "/dashboard/employer/my-jobs": "My Jobs",
  "/dashboard/employer/post-job": "Post a Job",
  "/dashboard/employer/applications": "Applications",
  "/dashboard/employer/chat": "Chat",
  "/dashboard/employer/payments": "Payments",
  "/dashboard/employer/service-providers": "Service Providers",
};

// Patterns for dynamic routes (checked in order, first match wins)
const DYNAMIC_TITLES: [RegExp, string][] = [
  [/^\/dashboard\/jobs\/[^/]+$/, "Job Details"],
  [/^\/dashboard\/applications\/[^/]+$/, "Application Details"],
  [/^\/dashboard\/employer\/my-jobs\/[^/]+$/, "Job Details"],
  [/^\/dashboard\/employer\/applications\/[^/]+$/, "Application Details"],
  [/^\/dashboard\/employer\/service-providers\/[^/]+$/, "Provider Profile"],
];

function resolveTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  for (const [pattern, title] of DYNAMIC_TITLES) {
    if (pattern.test(pathname)) return title;
  }
  return "Nasta";
}

export function TitleManager() {
  const pathname = usePathname();
  useEffect(() => {
    document.title = `${resolveTitle(pathname)} — Nasta`;
  }, [pathname]);
  return null;
}
