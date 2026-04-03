"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "../../../../lib/api";
import { useLanguage } from "../../../../context/LanguageContext";

interface EmployerApp {
  id: string;
  status: string;
  appliedAt: string;
  job?: { id: string; title: string; isInstantBook?: boolean };
  applicant?: { id: string; firstName: string; lastName: string };
}

type FilterStatus =
  | "ALL"
  | "PENDING"
  | "REVIEWING"
  | "SHORTLISTED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: {
    label: "Pending",
    color: "text-[var(--fulfillment-gold)]",
    bg: "bg-[var(--fulfillment-gold)]/15",
  },
  REVIEWING: {
    label: "Reviewing",
    color: "text-[var(--fulfillment-gold)]",
    bg: "bg-[var(--fulfillment-gold)]/15",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    color: "text-[var(--primary)]",
    bg: "bg-[var(--primary)]/15",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
  },
  REJECTED: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/15" },
  WITHDRAWN: {
    label: "Withdrawn",
    color: "text-[var(--muted-text)]",
    bg: "bg-[var(--muted-text)]/15",
  },
};

function progressLevel(status: string): number {
  const s = status.toUpperCase();
  if (s === "REJECTED" || s === "WITHDRAWN") return -1;
  if (s === "PENDING") return 1;
  if (s === "REVIEWING") return 2;
  if (s === "SHORTLISTED") return 3;
  if (s === "ACCEPTED") return 4;
  return 1;
}

function progressPercent(status: string): number {
  const lvl = progressLevel(status);
  if (lvl === -1) return 100;
  return Math.round((lvl / 7) * 100);
}

function progressBarColor(status: string): string {
  const s = status.toUpperCase();
  if (s === "REJECTED") return "bg-red-500";
  if (s === "WITHDRAWN") return "bg-[var(--muted-text)]";
  if (s === "ACCEPTED") return "bg-emerald-500";
  return "bg-[var(--primary)]";
}

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EmployerApplicationsPage() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<EmployerApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  const fetchApps = useCallback(async () => {
    setLoading(true);
    const qs = filter !== "ALL" ? `&status=${filter}` : "";
    const res = await api<EmployerApp[]>(
      `/applications/employer?limit=100${qs}`,
    );
    if (res.data) setApplications(res.data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const filters: { key: FilterStatus; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "New" },
    { key: "REVIEWING", label: "Reviewing" },
    { key: "SHORTLISTED", label: "Shortlisted" },
    { key: "ACCEPTED", label: "Accepted" },
    { key: "REJECTED", label: "Rejected" },
  ];

  const counts = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          {t("employerDashboard.applications.review", "Review")}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
          {t("employerDashboard.applications.title", "Applications")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          {t(
            "employerDashboard.applications.subtitle",
            "Review and manage applications from service providers.",
          )}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4 text-center">
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {applications.length}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted-text)]">
            {t("employerDashboard.applications.total", "Total")}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4 text-center">
          <p className="text-2xl font-bold text-[var(--fulfillment-gold)]">
            {(counts["PENDING"] || 0) + (counts["REVIEWING"] || 0)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted-text)]">
            {t("employerDashboard.applications.toReview", "To Review")}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4 text-center">
          <p className="text-2xl font-bold text-[var(--primary)]">
            {counts["SHORTLISTED"] || 0}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted-text)]">
            {t("employerDashboard.applications.shortlisted", "Shortlisted")}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {counts["ACCEPTED"] || 0}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted-text)]">
            {t("employerDashboard.applications.hired", "Hired")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              filter === f.key
                ? "bg-[var(--primary)] text-white"
                : "border border-[var(--border-color)] bg-[var(--surface)] text-[var(--muted-text)] hover:border-[var(--primary)]/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] px-8 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--soft-blue)]/10">
            <svg
              className="h-8 w-8 text-[var(--soft-blue)]"
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
          </div>
          <h2 className="mt-5 text-lg font-semibold text-[var(--foreground)]">
            {t(
              "employerDashboard.applications.noApplicationsYet",
              "No applications yet",
            )}
          </h2>
          <p className="mt-2 max-w-sm text-center text-sm text-[var(--muted-text)]">
            {t(
              "employerDashboard.applications.applicationsWillAppear",
              "Applications from service providers will appear here once they apply to your jobs.",
            )}
          </p>
          <Link
            href="/dashboard/employer"
            className="mt-6 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--soft-blue)]"
          >
            {t(
              "employerDashboard.applications.backToDashboard",
              "Back to Dashboard",
            )}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const meta = STATUS_META[app.status] || {
              label: app.status,
              color: "text-[var(--muted-text)]",
              bg: "bg-[var(--muted-text)]/15",
            };
            const applicantName = app.applicant
              ? `${app.applicant.firstName} ${app.applicant.lastName}`
              : "Unknown";
            const initials = app.applicant
              ? `${app.applicant.firstName[0]}${app.applicant.lastName[0]}`.toUpperCase()
              : "?";
            const pct = progressPercent(app.status);
            const barColor = progressBarColor(app.status);

            return (
              <Link
                key={app.id}
                href={`/dashboard/employer/applications/${app.id}`}
                className="group block rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15">
                    <span className="text-sm font-bold text-[var(--primary)]">
                      {initials}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                          {applicantName}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-[var(--muted-text)]">
                          {t(
                            "employerDashboard.applications.appliedFor",
                            "Applied for",
                          )}{" "}
                          {app.job?.title || "a job"}
                          {app.job?.isInstantBook && (
                            <span className="ml-2 inline-flex items-center gap-1 text-cyan-400">
                              <svg
                                className="h-3 w-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" />
                              </svg>
                              {t(
                                "employerDashboard.applications.instant",
                                "Instant",
                              )}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${meta.bg} ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                        <svg
                          className="h-4 w-4 text-[var(--muted-text)] group-hover:text-[var(--primary)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-alt)]">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[10px] text-[var(--muted-text)]">
                        {timeAgo(app.appliedAt)}
                      </span>
                    </div>
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
