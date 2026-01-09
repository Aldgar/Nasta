"use client";
export default function LeftSidebar() {
  return (
    <aside className="hidden lg:block lg:col-span-3 text-sm">
      <div className="sticky top-16 space-y-4">
        <section className="rounded-xl border border-base bg-surface p-4 shadow-sm">
          <div className="mb-2 h-16 w-full rounded bg-neutral-800/60" />
          <div className="h-4 w-1/2 rounded bg-neutral-800/60" />
          <div className="mt-2 h-3 w-2/3 rounded bg-neutral-800/60" />
        </section>
        <section className="rounded-xl border border-base bg-surface p-4 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-text">
            Settings Hub
          </div>
          <nav className="grid gap-2 text-sm text-foreground">
            <a
              href="/settings#account"
              className="rounded-md px-2 py-1 hover:bg-surface-alt"
            >
              Account
            </a>
            <a
              href="/settings#identity"
              className="rounded-md px-2 py-1 hover:bg-surface-alt"
            >
              Identity
            </a>
            <a
              href="/settings#financial"
              className="rounded-md px-2 py-1 hover:bg-surface-alt"
            >
              Payments
            </a>
            <a
              href="/settings#preferences"
              className="rounded-md px-2 py-1 hover:bg-surface-alt"
            >
              Preferences
            </a>
          </nav>
        </section>
      </div>
    </aside>
  );
}
