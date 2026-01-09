"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackClient() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const token = search?.get("token");
    const role = search?.get("role");
    const provider = search?.get("provider");
    if (token && provider === "google") {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
          if (role) localStorage.setItem("auth_role", role);
        }
      } catch {}
      router.replace("/");
    } else {
      router.replace("/login");
    }
  }, [router, search]);

  return <p className="text-sm text-neutral-600">Finishing sign-in…</p>;
}
