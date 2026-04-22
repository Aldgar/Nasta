"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "../../../../lib/api";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "../../../../context/LanguageContext";

interface Job {
  id: string;
  title: string;
  description?: string;
  type?: string;
  workMode?: string;
  status: string;
  urgency?: string;
  location?: string;
  city?: string;
  country?: string;
  isInstantBook?: boolean;
  createdAt?: string;
  startDate?: string;
  rateAmount?: number;
  currency?: string;
  paymentType?: string;
  category?: { id: string; name: string } | string;
  requirements?: string[];
  responsibilities?: string[];
  _count?: { applications: number };
  applicantCount?: number;
}

type TFunc = (...args: unknown[]) => string;

function statusBadge(status: string, t: TFunc) {
  const ns = "employerDashboard.myJobsPage";
  const labels: Record<string, string> = {
    ACTIVE: t(`${ns}.statusActive`, "Active") as string,
    ASSIGNED: t(`${ns}.statusAssigned`, "In Progress") as string,
    COMPLETED: t(`${ns}.statusCompleted`, "Completed") as string,
    CLOSED: t(`${ns}.statusClosed`, "Closed") as string,
    DRAFT: t(`${ns}.statusDraft`, "Draft") as string,
    PAUSED: t(`${ns}.statusPaused`, "Paused") as string,
    EXPIRED: t(`${ns}.statusExpired`, "Expired") as string,
    CANCELLED_NO_SHOW: t(`${ns}.statusCancelled`, "Cancelled") as string,
  };
  const clss: Record<string, string> = {
    ACTIVE: "bg-[var(--achievement-green)]/15 text-[var(--achievement-green)]",
    ASSIGNED: "bg-[var(--soft-blue)]/15 text-[var(--soft-blue)]",
    COMPLETED: "bg-[var(--primary)]/15 text-[var(--primary)]",
    CLOSED: "bg-[var(--muted-text)]/15 text-[var(--muted-text)]",
    DRAFT: "bg-[var(--fulfillment-gold)]/15 text-[var(--fulfillment-gold)]",
    PAUSED: "bg-[var(--warm-coral)]/15 text-[var(--warm-coral)]",
    EXPIRED: "bg-[var(--alert-red)]/15 text-[var(--alert-red)]",
    CANCELLED_NO_SHOW: "bg-[var(--alert-red)]/15 text-[var(--alert-red)]",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
        clss[status] ?? "bg-[var(--surface-alt)] text-[var(--muted-text)]"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function typeLabel(type: string | undefined, t: TFunc) {
  const ns = "employerDashboard.postJob";
  const map: Record<string, string> = {
    FULL_TIME: t(`${ns}.jobTypeFullTime`, "Full Time") as string,
    PART_TIME: t(`${ns}.jobTypePartTime`, "Part Time") as string,
    CONTRACT: t(`${ns}.jobTypeContract`, "Contract") as string,
    TEMPORARY: t(`${ns}.jobTypeTemporary`, "Temporary") as string,
    FREELANCE: t(`${ns}.jobTypeFreelance`, "Freelance") as string,
    INTERNSHIP: t(`${ns}.jobTypeInternship`, "Internship") as string,
    GIG: t(`${ns}.jobTypeGig`, "Gig") as string,
  };
  return type ? (map[type] ?? type) : "";
}

function workModeLabel(w: string | undefined, t: TFunc) {
  const ns = "employerDashboard.postJob";
  const map: Record<string, string> = {
    ON_SITE: t(`${ns}.workModeOnSite`, "On-site") as string,
    REMOTE: t(`${ns}.workModeRemote`, "Remote") as string,
    HYBRID: t(`${ns}.workModeHybrid`, "Hybrid") as string,
  };
  return w ? (map[w] ?? w) : "";
}

function paymentLabel(p: string | undefined, t: TFunc) {
  const ns = "employerDashboard.myJobsPage";
  const map: Record<string, string> = {
    HOURLY: t(`${ns}.paymentShortHourly`, "/ hr") as string,
    DAILY: t(`${ns}.paymentShortDaily`, "/ day") as string,
    WEEKLY: t(`${ns}.paymentShortWeekly`, "/ wk") as string,
    MONTHLY: t(`${ns}.paymentShortMonthly`, "/ mo") as string,
    FIXED: t(`${ns}.paymentShortFixed`, "fixed") as string,
    PROJECT: t(`${ns}.paymentShortFixed`, "fixed") as string,
  };
  return p ? (map[p] ?? "") : "";
}

function fmtDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyJobsPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const statusTabs = [
    {
      key: "ALL",
      label: t("employerDashboard.myJobsPage.allJobs", "All Jobs"),
    },
    {
      key: "ACTIVE",
      label: t("employerDashboard.myJobsPage.active", "Active"),
    },
    {
      key: "ASSIGNED",
      label: t("employerDashboard.myJobsPage.inProgress", "In Progress"),
    },
    {
      key: "COMPLETED",
      label: t("employerDashboard.myJobsPage.completed", "Completed"),
    },
    {
      key: "CLOSED",
      label: t("employerDashboard.myJobsPage.closed", "Closed"),
    },
  ];

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const res = await api<Job[]>("/jobs/my-jobs");
    if (res.data && Array.isArray(res.data)) {
      setJobs(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  const filteredJobs = jobs.filter((j) => {
    if (activeTab !== "ALL") {
      if (
        activeTab === "COMPLETED" &&
        j.status !== "COMPLETED" &&
        j.status !== "CLOSED"
      )
        return false;
      if (activeTab !== "COMPLETED" && j.status !== activeTab) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const catName =
        typeof j.category === "object" ? j.category?.name : j.category;
      return (
        j.title.toLowerCase().includes(q) ||
        (j.description ?? "").toLowerCase().includes(q) ||
        (catName ?? "").toLowerCase().includes(q) ||
        (j.city ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === "ACTIVE").length,
    inProgress: jobs.filter((j) => j.status === "ASSIGNED").length,
    completed: jobs.filter(
      (j) => j.status === "COMPLETED" || j.status === "CLOSED",
    ).length,
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl px-5 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success"
              ? "bg-[var(--achievement-green)] text-white"
              : "bg-[var(--alert-red)] text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
            {t("employerDashboard.myJobsPage.manage", "Manage")}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {t("employerDashboard.myJobsPage.title", "My Jobs")}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            {t(
              "employerDashboard.myJobsPage.subtitle",
              "View and manage all your posted job listings.",
            )}
          </p>
        </div>
        <Link
          href="/dashboard/employer/post-job"
          className="flex items-center gap-2 self-start rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--soft-blue)]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {t("employerDashboard.postAJob", "Post a Job")}
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: t("employerDashboard.myJobsPage.total", "Total"),
            value: stats.total,
            color: "text-[var(--foreground)]",
          },
          {
            label: t("employerDashboard.myJobsPage.active", "Active"),
            value: stats.active,
            color: "text-[var(--achievement-green)]",
          },
          {
            label: t("employerDashboard.myJobsPage.inProgress", "In Progress"),
            value: stats.inProgress,
            color: "text-[var(--soft-blue)]",
          },
          {
            label: t("employerDashboard.myJobsPage.completed", "Completed"),
            value: stats.completed,
            color: "text-[var(--primary)]",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4 text-center"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--muted-text)]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs + search */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface-alt)] text-[var(--muted-text)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t(
            "employerDashboard.myJobsPage.searchJobs",
            "Search jobs...",
          )}
          className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:border-[var(--primary)] focus:outline-none sm:w-64"
        />
      </div>

      {/* Job list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] px-8 py-16">
          <svg
            className="h-12 w-12 text-[var(--muted-text)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
          <h3 className="mt-4 text-base font-semibold text-[var(--foreground)]">
            {jobs.length === 0
              ? t(
                  "employerDashboard.myJobsPage.noJobsPosted",
                  "No jobs posted yet",
                )
              : t(
                  "employerDashboard.myJobsPage.noMatchingJobs",
                  "No matching jobs",
                )}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            {jobs.length === 0
              ? t(
                  "employerDashboard.myJobsPage.postFirstJob",
                  "Post your first job to start receiving applications from verified service providers.",
                )
              : t(
                  "employerDashboard.myJobsPage.adjustFilters",
                  "Try adjusting your filters or search terms.",
                )}
          </p>
          {jobs.length === 0 && (
            <Link
              href="/dashboard/employer/post-job"
              className="mt-5 rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--soft-blue)]"
            >
              {t("employerDashboard.postAJob", "Post a Job")}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const catName =
              typeof job.category === "object"
                ? job.category?.name
                : job.category;
            const applicants =
              job.applicantCount ?? job._count?.applications ?? 0;
            const rate = job.rateAmount
              ? (job.rateAmount / 100).toFixed(2)
              : null;

            return (
              <Link
                key={job.id}
                href={`/dashboard/employer/my-jobs/${job.id}`}
                className="group block rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--primary)]/30 hover:shadow-md hover:shadow-[var(--primary)]/5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                        {job.title}
                      </h3>
                      {statusBadge(job.status, t)}
                      {job.isInstantBook && (
                        <span className="rounded-full bg-[var(--fulfillment-gold)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--fulfillment-gold)]">
                          {t(
                            "employerDashboard.applications.instant",
                            "Instant",
                          )}
                        </span>
                      )}
                      {job.urgency === "URGENT" && (
                        <span className="rounded-full bg-[var(--alert-red)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--alert-red)]">
                          {t("employerDashboard.myJobsPage.urgent", "Urgent")}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-text)]">
                      {catName && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 6h.008v.008H6V6z"
                            />
                          </svg>
                          {catName}
                        </span>
                      )}
                      {(job.city || job.country) && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                            />
                          </svg>
                          {[job.city, job.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {job.workMode && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21"
                            />
                          </svg>
                          {workModeLabel(job.workMode, t)}
                        </span>
                      )}
                      {job.type && <span>{typeLabel(job.type, t)}</span>}
                      {rate && (
                        <span className="font-medium text-[var(--achievement-green)]">
                          {rate} {job.currency ?? "EUR"}{" "}
                          {paymentLabel(job.paymentType, t)}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-text)]">
                      <span>
                        {t("employerDashboard.myJobsPage.posted", "Posted")}{" "}
                        {fmtDate(job.createdAt)}
                      </span>
                      {job.startDate && (
                        <span>
                          {t("employerDashboard.myJobsPage.starts", "Starts")}{" "}
                          {fmtDate(job.startDate)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                          />
                        </svg>
                        {applicants}{" "}
                        {applicants !== 1
                          ? t(
                              "employerDashboard.myJobsPage.applicants",
                              "applicants",
                            )
                          : t(
                              "employerDashboard.myJobsPage.applicant",
                              "applicant",
                            )}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex shrink-0 items-center self-center">
                    <svg
                      className="h-5 w-5 text-[var(--muted-text)] transition-colors group-hover:text-[var(--primary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
