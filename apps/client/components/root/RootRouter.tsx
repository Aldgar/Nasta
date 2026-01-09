"use client";
import { useEffect, useState, startTransition } from "react";
import PublicLanding from "../public/PublicLanding";
import Topbar from "../layout/Topbar";
import LeftSidebar from "../layout/LeftSidebar";
import RightSidebar from "../layout/RightSidebar";
import Feed from "../feed/Feed";

/**
 * Client-side root router: shows public landing for guests, authenticated shell for users.
 * Heuristic: localStorage.getItem("auth_token").
 */
export default function RootRouter() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    startTransition(() => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      setAuthed(!!token);
      setChecked(true);
    });
  }, []);

  // While checking, show the public landing to avoid a blank page
  if (!checked) {
    return <PublicLanding />;
  }

  if (!authed) {
    return <PublicLanding />;
  }

  // Authenticated shell
  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-200 via-neutral-550 to-neutral-600">
      <Topbar />
      <main className="mx-auto max-w-7xl px-4 pt-16 pb-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <LeftSidebar />
          <section className="lg:col-span-6">
            <header className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Feed</h1>
              <p className="mt-2 text-sm text-neutral-700">
                Quick updates and announcements will appear here.
              </p>
            </header>
            <Feed />
          </section>
          <RightSidebar />
        </div>
      </main>
    </div>
  );
}
