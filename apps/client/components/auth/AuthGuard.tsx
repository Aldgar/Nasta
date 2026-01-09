"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
    } else {
      // Defer setReady to end of microtask to avoid cascading
      Promise.resolve().then(() => setReady(true));
    }
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
