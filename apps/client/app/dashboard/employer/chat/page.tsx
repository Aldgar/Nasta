"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployerChatRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/support");
  }, [router]);
  return null;
}
