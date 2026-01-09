"use client";
import { useEffect, useState, startTransition } from "react";
import { api } from "../../lib/api";

export type FeedItem = {
  id: string;
  title?: string | null;
  body: string;
  visibility: "ALL" | "JOB_SEEKERS" | "EMPLOYERS";
  createdAt: string;
};

export default function Feed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guest, setGuest] = useState(false);
  const [nowString, setNowString] = useState<string>("");

  useEffect(() => {
    // Set client-only timestamp (prevents SSR/CSR mismatch)
    startTransition(() => {
      setNowString(new Date().toLocaleString());
    });
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      startTransition(() => {
        setGuest(true);
        setLoading(false);
      });
      return;
    }
    let mounted = true;
    (async () => {
      const res = await api<unknown>("/feed");
      if (!mounted) return;
      startTransition(() => {
        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
        // Accept either an array response or an object with { items: [] }
        const payload = res.data;
        let arr: FeedItem[] = [];
        if (Array.isArray(payload)) {
          arr = payload as FeedItem[];
        } else if (
          payload &&
          typeof payload === "object" &&
          "items" in payload &&
          Array.isArray((payload as { items?: unknown }).items)
        ) {
          arr = ((payload as { items: unknown[] }).items || []) as FeedItem[];
        }
        setItems(arr);
        setLoading(false);
      });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setDemoToken = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", "demo-token");
    window.location.reload();
  };
  const clearToken = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
    window.location.reload();
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between gap-3">
        <span
          suppressHydrationWarning
          className="inline-flex items-center rounded-full bg-linear-to-r from-primary to-soft-blue px-3 py-1 text-xs font-medium text-white shadow-sm"
        >
          Dev build · {nowString}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={setDemoToken}
            className="inline-flex items-center gap-1 appearance-none rounded-full bg-linear-to-r from-primary to-soft-blue px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/60"
            title="Set a demo token to simulate an authenticated session"
          >
            Set demo token
          </button>
          <button
            type="button"
            onClick={clearToken}
            className="inline-flex items-center gap-1 appearance-none rounded-full border border-alert-red/30 bg-white px-3 py-1 text-xs font-medium text-alert-red shadow-sm transition hover:bg-alert-red/5 focus:outline-none focus:ring-2 focus:ring-alert-red/50"
            title="Clear token and view guest feed"
          >
            Clear token
          </button>
        </div>
      </div>

      {process.env.NODE_ENV !== "production" && (
        <div className="mb-6 rounded-2xl bg-soft-blue/20 p-4 ring-2 ring-inset ring-soft-blue/60">
          <span className="font-semibold">Style probe:</span> You should see a
          blue rounded box with a visible ring. If not, Tailwind utilities
          aren’t being applied.
        </div>
      )}

      {guest && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-800 shadow-sm ring-1 ring-inset ring-soft-blue/30">
          <div className="mb-2 h-1.5 w-24 rounded-full bg-linear-to-r from-primary to-soft-blue" />
          <p className="mb-1 font-medium">Welcome!</p>
          <p>
            You’re viewing the app without an account. Once sign-in is wired,
            this page will show your personalized feed.
          </p>
        </div>
      )}

      {loading && <p className="mt-4 text-neutral-400">Loading…</p>}
      {!loading && error && !guest && (
        <p className="mt-4 text-red-400">Could not load feed: {error}</p>
      )}
      {!loading && !error && !guest && items.length === 0 && (
        <p className="mt-4 text-neutral-400">No updates yet.</p>
      )}

      <div className="mt-8 grid gap-5">
        {!guest &&
          items.map((p) => (
            <div
              key={p.id}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-inset ring-soft-blue/20 transition hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="h-1.5 w-16 rounded-full bg-linear-to-r from-primary to-soft-blue" />
                <div className="text-xs font-medium uppercase tracking-wide text-soft-blue">
                  {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                {p.title ?? "Update"}
              </h3>
              <p className="whitespace-pre-line text-neutral-700">{p.body}</p>
              <div className="mt-4 flex gap-3">
                <button className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 shadow-sm transition hover:border-soft-blue/40 hover:text-primary">
                  Like
                </button>
                <button className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 shadow-sm transition hover:border-soft-blue/40 hover:text-primary">
                  Comment
                </button>
                <button className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 shadow-sm transition hover:border-soft-blue/40 hover:text-primary">
                  Share
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
