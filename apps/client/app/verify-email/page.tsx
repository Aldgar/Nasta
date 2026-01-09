"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Email verification page that redirects mobile users to the app via deep link
 * Desktop users will see instructions to open the link on their mobile device
 */
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  useEffect(() => {
    if (!token || typeof window === "undefined") return;

    // Detect if user is on mobile device
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent.toLowerCase()
    );

    // If mobile, redirect to app deep link immediately
    if (isMobile) {
      const deepLink = `cumprido://verify-email?token=${encodeURIComponent(token)}`;
      
      // Try to open the app - use multiple methods for better compatibility
      try {
        // Method 1: Direct location change (most reliable)
        window.location.href = deepLink;
        
        // Method 2: Create and click a link (fallback)
        setTimeout(() => {
          try {
            const link = document.createElement("a");
            link.href = deepLink;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              document.body.removeChild(link);
            }, 100);
          } catch (e) {
            // Ignore errors
          }
        }, 50);
      } catch (e) {
        console.error("Error redirecting to app:", e);
      }
    }
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Verification Link</h1>
          <p className="text-gray-600">The verification link is missing the token. Please check your email and try again.</p>
        </div>
      </div>
    );
  }

  // Check if mobile for display purposes
  const isMobile = typeof window !== "undefined" && /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Opening App...</h1>
          <p className="text-gray-600 mb-4">
            Redirecting you to the Cumprido app to verify your email.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            If the app doesn't open automatically,{" "}
            <a
              href={`cumprido://verify-email?token=${encodeURIComponent(token)}`}
              className="text-indigo-600 underline font-semibold"
            >
              tap here to open the app
            </a>
            .
          </p>
          <p className="text-xs text-gray-400">
            Make sure you have the Cumprido app installed on your device.
          </p>
        </div>
      </div>
    );
  }

  // Desktop view - show instructions
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</h1>
        <p className="text-gray-600 mb-6">
          Please open this link on your mobile device to verify your email address.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-2">Or copy this link:</p>
          <p className="text-xs text-gray-400 break-all font-mono">
            {typeof window !== "undefined" ? window.location.href : ""}
          </p>
        </div>
        <p className="text-sm text-gray-500">
          If you have the Cumprido app installed, you can also scan this link with your mobile device.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
