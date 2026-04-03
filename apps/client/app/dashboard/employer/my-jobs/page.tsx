"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "../../../../lib/api";
import BrandedSelect from "../../../../components/ui/BrandedSelect";
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

const STATUS_TABS = [
  { key: "ALL", label: "All Jobs" },
  { key: "ACTIVE", label: "Active" },
  { key: "ASSIGNED", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CLOSED", label: "Closed" },
];

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    ACTIVE: {
      label: "Active",
      cls: "bg-[var(--achievement-green)]/15 text-[var(--achievement-green)]",
    },
    ASSIGNED: {
      label: "In Progress",
      cls: "bg-[var(--soft-blue)]/15 text-[var(--soft-blue)]",
    },
    COMPLETED: {
      label: "Completed",
      cls: "bg-[var(--primary)]/15 text-[var(--primary)]",
    },
    CLOSED: {
      label: "Closed",
      cls: "bg-[var(--muted-text)]/15 text-[var(--muted-text)]",
    },
    DRAFT: {
      label: "Draft",
      cls: "bg-[var(--fulfillment-gold)]/15 text-[var(--fulfillment-gold)]",
    },
    PAUSED: {
      label: "Paused",
      cls: "bg-[var(--warm-coral)]/15 text-[var(--warm-coral)]",
    },
    EXPIRED: {
      label: "Expired",
      cls: "bg-[var(--alert-red)]/15 text-[var(--alert-red)]",
    },
    CANCELLED_NO_SHOW: {
      label: "Cancelled",
      cls: "bg-[var(--alert-red)]/15 text-[var(--alert-red)]",
    },
  };
  const m = map[status] ?? {
    label: status,
    cls: "bg-[var(--surface-alt)] text-[var(--muted-text)]",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function typeLabel(t?: string) {
  const map: Record<string, string> = {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    CONTRACT: "Contract",
    TEMPORARY: "Temporary",
    FREELANCE: "Freelance",
    INTERNSHIP: "Internship",
    GIG: "Gig",
  };
  return t ? (map[t] ?? t) : "";
}

function workModeLabel(w?: string) {
  const map: Record<string, string> = {
    ON_SITE: "On-site",
    REMOTE: "Remote",
    HYBRID: "Hybrid",
  };
  return w ? (map[w] ?? w) : "";
}

function paymentLabel(p?: string) {
  const map: Record<string, string> = {
    HOURLY: "/ hr",
    DAILY: "/ day",
    WEEKLY: "/ wk",
    MONTHLY: "/ mo",
    FIXED: "fixed",
    PROJECT: "fixed",
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

const DELETE_REASONS = [
  { value: "NO_LONGER_NEEDED", label: "No longer needed" },
  { value: "FOUND_CANDIDATE", label: "Found a candidate" },
  { value: "FULFILLED", label: "Job fulfilled" },
  { value: "REQUIREMENTS_CHANGED", label: "Requirements changed" },
  { value: "OTHER", label: "Other" },
];

export default function MyJobsPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Delete modal
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("NO_LONGER_NEEDED");
  const [deleteCustomReason, setDeleteCustomReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Edit modal
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSaving, setEditSaving] = useState(false);

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

  const handleDelete = async () => {
    if (!deleteJobId) return;
    setDeleting(true);
    const reason =
      deleteReason === "OTHER" && deleteCustomReason.trim()
        ? deleteCustomReason.trim()
        : (DELETE_REASONS.find((r) => r.value === deleteReason)?.label ??
          deleteReason);
    const res = await api(`/jobs/${deleteJobId}`, {
      method: "DELETE",
      body: { reason },
    });
    setDeleting(false);
    if (res.error) {
      setToast({
        message:
          typeof res.error === "string" ? res.error : "Failed to delete job",
        type: "error",
      });
      return;
    }
    setToast({ message: "Job deleted", type: "success" });
    setDeleteJobId(null);
    fetchJobs();
  };

  const handleStatusChange = async (jobId: string, status: string) => {
    const res = await api(`/jobs/${jobId}/status`, {
      method: "PATCH",
      body: { status },
    });
    if (res.error) {
      setToast({
        message:
          typeof res.error === "string" ? res.error : "Failed to update status",
        type: "error",
      });
      return;
    }
    setToast({
      message: `Job status updated to ${status.toLowerCase()}`,
      type: "success",
    });
    fetchJobs();
  };

  const openEdit = (job: Job) => {
    setEditJob(job);
    setEditTitle(job.title);
    setEditDescription(job.description ?? "");
  };

  const handleEditSave = async () => {
    if (!editJob) return;
    setEditSaving(true);
    const body: Record<string, unknown> = {};
    if (editTitle.trim() !== editJob.title) body.title = editTitle.trim();
    if (editDescription.trim() !== (editJob.description ?? ""))
      body.description = editDescription.trim();
    if (Object.keys(body).length === 0) {
      setEditSaving(false);
      setEditJob(null);
      return;
    }
    const res = await api(`/jobs/${editJob.id}`, { method: "PATCH", body });
    setEditSaving(false);
    if (res.error) {
      setToast({
        message:
          typeof res.error === "string" ? res.error : "Failed to update job",
        type: "error",
      });
      return;
    }
    setToast({ message: "Job updated", type: "success" });
    setEditJob(null);
    fetchJobs();
  };

  const inputCls =
    "w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30";

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
          {STATUS_TABS.map((tab) => (
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
              <div
                key={job.id}
                className="group rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--primary)]/20 hover:shadow-md hover:shadow-[var(--primary)]/5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/employer/my-jobs/${job.id}`}
                        className="text-base font-bold text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
                      >
                        {job.title}
                      </Link>
                      {statusBadge(job.status)}
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
                          {workModeLabel(job.workMode)}
                        </span>
                      )}
                      {job.type && <span>{typeLabel(job.type)}</span>}
                      {rate && (
                        <span className="font-medium text-[var(--achievement-green)]">
                          {rate} {job.currency ?? "EUR"}{" "}
                          {paymentLabel(job.paymentType)}
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

                  {/* Right - actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/dashboard/employer/applications?jobId=${job.id}`}
                      className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
                    >
                      {t(
                        "employerDashboard.myJobsPage.applicants",
                        "Applicants",
                      )}
                    </Link>
                    {(job.status === "ACTIVE" || job.status === "DRAFT") && (
                      <button
                        onClick={() => openEdit(job)}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:border-[var(--soft-blue)]/30 hover:text-[var(--soft-blue)]"
                      >
                        {t("employerDashboard.myJobsPage.edit", "Edit")}
                      </button>
                    )}
                    {job.status === "ACTIVE" && (
                      <button
                        onClick={() => handleStatusChange(job.id, "PAUSED")}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--fulfillment-gold)] transition-colors hover:border-[var(--fulfillment-gold)]/30 hover:bg-[var(--fulfillment-gold)]/5"
                      >
                        {t("employerDashboard.myJobsPage.pause", "Pause")}
                      </button>
                    )}
                    {job.status === "PAUSED" && (
                      <button
                        onClick={() => handleStatusChange(job.id, "ACTIVE")}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--achievement-green)] transition-colors hover:border-[var(--achievement-green)]/30 hover:bg-[var(--achievement-green)]/5"
                      >
                        {t("employerDashboard.myJobsPage.resume", "Resume")}
                      </button>
                    )}
                    {(job.status === "ACTIVE" || job.status === "PAUSED") && (
                      <button
                        onClick={() => handleStatusChange(job.id, "CLOSED")}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--muted-text)] transition-colors hover:border-[var(--muted-text)]/30 hover:text-[var(--foreground)]"
                      >
                        {t("employerDashboard.myJobsPage.close", "Close")}
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteJobId(job.id)}
                      className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] p-1.5 text-[var(--muted-text)] transition-colors hover:border-[var(--alert-red)]/30 hover:bg-[var(--alert-red)]/5 hover:text-[var(--alert-red)]"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete confirmation modal ──────────── */}
      {deleteJobId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !deleting && setDeleteJobId(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--background)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--alert-red)]/15 text-[var(--alert-red)]">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  {t("employerDashboard.myJobsPage.deleteJob", "Delete Job")}
                </h3>
                <p className="text-xs text-[var(--muted-text)]">
                  {t(
                    "employerDashboard.myJobsPage.cannotBeUndone",
                    "This action cannot be undone.",
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                {t(
                  "employerDashboard.myJobsPage.reasonForRemoval",
                  "Reason for removal",
                )}
              </label>
              <BrandedSelect
                value={deleteReason}
                onChange={setDeleteReason}
                options={DELETE_REASONS.map((r) => ({
                  value: r.value,
                  label: r.label,
                }))}
              />
              {deleteReason === "OTHER" && (
                <input
                  type="text"
                  value={deleteCustomReason}
                  onChange={(e) => setDeleteCustomReason(e.target.value)}
                  placeholder="Please specify..."
                  className={inputCls}
                />
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteJobId(null)}
                disabled={deleting}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
              >
                {t("employerDashboard.myJobsPage.cancel", "Cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  deleting ||
                  (deleteReason === "OTHER" && !deleteCustomReason.trim())
                }
                className="flex items-center gap-2 rounded-xl bg-[var(--alert-red)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--alert-red)]/80 disabled:opacity-50"
              >
                {deleting
                  ? t("employerDashboard.myJobsPage.deleting", "Deleting...")
                  : t("employerDashboard.myJobsPage.deleteJob", "Delete Job")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ────────────────────────── */}
      {editJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !editSaving && setEditJob(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--background)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-5 text-lg font-semibold text-[var(--foreground)]">
              {t("employerDashboard.myJobsPage.editJob", "Edit Job")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  {t("employerDashboard.myJobsPage.titleLabel", "Title")}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  {t(
                    "employerDashboard.myJobsPage.descriptionLabel",
                    "Description",
                  )}
                </label>
                <textarea
                  rows={5}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className={inputCls + " resize-none"}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditJob(null)}
                disabled={editSaving}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
              >
                {t("employerDashboard.myJobsPage.cancel", "Cancel")}
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving || !editTitle.trim()}
                className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--soft-blue)] disabled:opacity-50"
              >
                {editSaving
                  ? t("employerDashboard.myJobsPage.saving", "Saving...")
                  : t(
                      "employerDashboard.myJobsPage.saveChanges",
                      "Save Changes",
                    )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
