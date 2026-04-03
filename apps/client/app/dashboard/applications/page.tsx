"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth";
import { useLanguage } from "../../../context/LanguageContext";

interface AppJob {
  id: string;
  title: string;
  description?: string;
  city?: string;
  country?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  workMode?: string;
  category?: { id: string; name: string } | null;
  company?: { id: string; name: string } | null;
}

interface ApplicationItem {
  id: string;
  status: string;
  appliedAt: string;
  job?: AppJob;
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
    label: "Under Review",
    color: "text-[var(--fulfillment-gold)]",
    bg: "bg-[var(--fulfillment-gold)]/15",
  },
  REVIEWING: {
    label: "Under Review",
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

function formatLabel(val: string): string {
  return val
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  useEffect(() => {
    if (user?.role === "EMPLOYER") {
      router.replace("/dashboard/employer/applications");
    }
  }, [user, router]);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    const qs = filter !== "ALL" ? `&status=${filter}` : "";
    const res = await api<ApplicationItem[]>(`/applications/me?limit=100${qs}`);
    if (res.data) setApplications(res.data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const filters: { key: FilterStatus; label: string }[] = [
    { key: "ALL", label: t("common.all", "All") },
    { key: "PENDING", label: t("jobs.tabs.active", "Active") },
    { key: "ACCEPTED", label: t("applications.statusAccepted", "Accepted") },
    { key: "REJECTED", label: t("applications.statusRejected", "Rejected") },
    { key: "WITHDRAWN", label: t("applications.statusWithdrawn", "Withdrawn") },
  ];

  const counts = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          {t("navigation.myApplications", "Track")}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
          {t("applications.myApplications", "My Applications")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          {t(
            "applications.trackDescription",
            "Track all your job applications and their progress.",
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
            {t("applications.total", "Total")}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4 text-center">
          <p className="text-2xl font-bold text-[var(--fulfillment-gold)]">
            {(counts["PENDING"] || 0) +
              (counts["REVIEWING"] || 0) +
              (counts["SHORTLISTED"] || 0)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted-text)]">
            {t("applications.inProgress", "In Progress")}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {counts["ACCEPTED"] || 0}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted-text)]">
            {t("applications.statusAccepted", "Accepted")}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {counts["REJECTED"] || 0}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted-text)]">
            {t("applications.statusRejected", "Rejected")}
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

      {/* Application list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-[var(--surface)]"
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
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
              />
            </svg>
          </div>
          <h2 className="mt-5 text-lg font-semibold text-[var(--foreground)]">
            {t("applications.noApplicationsYet", "No applications yet")}
          </h2>
          <p className="mt-2 max-w-sm text-center text-sm text-[var(--muted-text)]">
            {t(
              "applications.startApplyingDescription",
              "Start applying for jobs to track your progress here.",
            )}
          </p>
          <Link
            href="/dashboard/jobs"
            className="mt-6 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--soft-blue)]"
          >
            {t("applications.findWork", "Find Work")}
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
            const job = app.job;
            const location = [job?.city, job?.country]
              .filter(Boolean)
              .join(", ");
            const pct = progressPercent(app.status);
            const barColor = progressBarColor(app.status);

            return (
              <Link
                key={app.id}
                href={`/dashboard/applications/${app.id}`}
                className="group block rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="truncate text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                        {job?.title ||
                          t("applications.untitledJob", "Untitled Job")}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${meta.bg} ${meta.color}`}
                      >
                        {t(
                          `applications.status${app.status.charAt(0)}${app.status.slice(1).toLowerCase()}`,
                          meta.label,
                        )}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-text)]">
                      {job?.company?.name && (
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
                              d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                            />
                          </svg>
                          {job.company.name}
                        </span>
                      )}
                      {location && (
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
                          {location}
                        </span>
                      )}
                      {job?.type && (
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
                              d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                            />
                          </svg>
                          {formatLabel(job.type)}
                        </span>
                      )}
                      {job?.category?.name && (
                        <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400">
                          {job.category.name}
                        </span>
                      )}
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-alt)]">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[10px] text-[var(--muted-text)]">
                        {app.status === "ACCEPTED"
                          ? t("applications.hired", "Hired")
                          : app.status === "REJECTED"
                            ? t("applications.closed", "Closed")
                            : app.status === "WITHDRAWN"
                              ? t("applications.statusWithdrawn", "Withdrawn")
                              : t("applications.inProgress", "In progress")}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-[var(--muted-text)]">
                      {timeAgo(app.appliedAt)}
                    </p>
                    <svg
                      className="ml-auto mt-2 h-5 w-5 text-[var(--muted-text)] transition-colors group-hover:text-[var(--primary)]"
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
