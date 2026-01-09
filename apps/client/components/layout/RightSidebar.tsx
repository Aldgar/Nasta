"use client";
export default function RightSidebar() {
  return (
    <aside className="hidden lg:block lg:col-span-3">
      <div className="sticky top-16 space-y-4">
        <section className="rounded-xl border border-neutral-200 bg-white p-4 ring-1 ring-inset ring-soft-blue/30 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:ring-neutral-800/40">
          <h3 className="mb-2 text-sm font-semibold text-primary dark:text-neutral-200">
            Your profile
          </h3>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-800/60" />
            <div>
              <div className="h-4 w-28 rounded bg-neutral-800/60" />
              <div className="mt-1 h-3 w-20 rounded bg-neutral-800/60" />
            </div>
          </div>
        </section>
        <section className="rounded-xl border border-neutral-200 bg-white p-4 ring-1 ring-inset ring-soft-blue/30 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:ring-neutral-800/40">
          <h3 className="mb-2 text-sm font-semibold text-primary dark:text-neutral-200">
            For you
          </h3>
          <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li className="h-4 w-2/3 rounded bg-neutral-800/60" />
            <li className="h-4 w-1/2 rounded bg-neutral-800/60" />
            <li className="h-4 w-3/4 rounded bg-neutral-800/60" />
          </ul>
        </section>
      </div>
    </aside>
  );
}
