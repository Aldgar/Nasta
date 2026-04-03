"use client";
import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../../lib/api";
import BrandedSelect from "../../../../../components/ui/BrandedSelect";
import { useLanguage } from "../../../../../context/LanguageContext";

interface Category {
  id: string;
  name: string;
}
interface Job {
  id: string;
  title: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  type?: string;
  workMode?: string;
  urgency?: string;
  status?: string;
  rateAmount?: number;
  currency?: string;
  paymentType?: string;
  location?: string;
  country?: string;
  city?: string;
  isInstantBook?: boolean;
  startDate?: string;
  endDate?: string;
  duration?: string;
  maxApplicants?: number;
  createdAt?: string;
  category?: Category;
  applicantCount?: number;
  employerId?: string;
}

const DELETE_REASONS = [
  { value: "NO_LONGER_NEEDED", label: "Position no longer needed" },
  { value: "FILLED_EXTERNALLY", label: "Filled through other channels" },
  { value: "BUDGET_CHANGE", label: "Budget or requirements changed" },
  { value: "DUPLICATE", label: "Duplicate listing" },
  { value: "OTHER", label: "Other" },
];

function fmt(val: string) {
  return val
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}
function fmtDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function statusColor(s: string) {
  const v = s.toUpperCase();
  if (v === "ACTIVE" || v === "OPEN")
    return "bg-emerald-500/15 text-emerald-400";
  if (v === "PAUSED")
    return "bg-[var(--fulfillment-gold)]/15 text-[var(--fulfillment-gold)]";
  if (v === "COMPLETED")
    return "bg-[var(--soft-blue)]/15 text-[var(--soft-blue)]";
  if (v === "CLOSED" || v === "CANCELLED") return "bg-red-500/15 text-red-400";
  return "bg-[var(--muted-text)]/10 text-[var(--muted-text)]";
}

export default function EmployerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = use(params);
  const { t } = useLanguage();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [showDelete, setShowDelete] = useState(false);
  const [deleteReason, setDeleteReason] = useState("NO_LONGER_NEEDED");
  const [deleteCustom, setDeleteCustom] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    const res = await api<Job>(`/jobs/${jobId}`);
    if (res.data) {
      setJob(res.data);
      setEditTitle(res.data.title);
      setEditDesc(res.data.description ?? "");
    }
    setLoading(false);
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleStatusChange = async (status: string) => {
    const res = await api(`/jobs/${jobId}/status`, {
      method: "PATCH",
      body: { status },
    });
    if (res.error) {
      setToast({
        msg:
          typeof res.error === "string" ? res.error : "Failed to update status",
        ok: false,
      });
      return;
    }
    setToast({
      msg: `Job status updated to ${status.toLowerCase()}`,
      ok: true,
    });
    fetchJob();
  };

  const handleSave = async () => {
    if (!job) return;
    setSaving(true);
    const body: Record<string, unknown> = {};
    if (editTitle.trim() !== job.title) body.title = editTitle.trim();
    if (editDesc.trim() !== (job.description ?? ""))
      body.description = editDesc.trim();
    if (Object.keys(body).length === 0) {
      setSaving(false);
      setEditing(false);
      return;
    }
    const res = await api(`/jobs/${jobId}`, { method: "PATCH", body });
    setSaving(false);
    if (res.error) {
      setToast({
        msg: typeof res.error === "string" ? res.error : "Failed to update",
        ok: false,
      });
      return;
    }
    setToast({ msg: "Job updated", ok: true });
    setEditing(false);
    fetchJob();
  };

  const handleDelete = async () => {
    setDeleting(true);
    const reason =
      deleteReason === "OTHER" && deleteCustom.trim()
        ? deleteCustom.trim()
        : (DELETE_REASONS.find((r) => r.value === deleteReason)?.label ??
          deleteReason);
    const res = await api(`/jobs/${jobId}`, {
      method: "DELETE",
      body: { reason },
    });
    setDeleting(false);
    if (res.error) {
      setToast({
        msg: typeof res.error === "string" ? res.error : "Failed to delete",
        ok: false,
      });
      return;
    }
    setToast({ msg: "Job deleted", ok: true });
    router.push("/dashboard/employer/my-jobs");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-[var(--surface-alt)]" />
        <div className="h-72 animate-pulse rounded-2xl bg-[var(--surface)]" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/employer/my-jobs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Back to My Jobs
        </Link>
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-12 text-center">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {t("employerDashboard.jobDetail.jobNotFound", "Job not found")}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-text)]">
            {t(
              "employerDashboard.jobDetail.jobNotFoundDesc",
              "This job may have been removed or is no longer available.",
            )}
          </p>
        </div>
      </div>
    );
  }

  const catName = job.category?.name ?? "";
  const rate = job.rateAmount ? (job.rateAmount / 100).toFixed(2) : null;
  const loc =
    [job.location, job.city, job.country].filter(Boolean).join(", ") ||
    "Not specified";
  const applicants = job.applicantCount ?? 0;
  const inputCls =
    "w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl px-5 py-3 text-sm font-medium shadow-lg ${toast.ok ? "bg-[var(--achievement-green)] text-white" : "bg-[var(--alert-red)] text-white"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Back */}
      <Link
        href="/dashboard/employer/my-jobs"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        Back to My Jobs
      </Link>

      {/* Header Card */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-[var(--foreground)]">
                {job.title}
              </h1>
              {job.status && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(job.status)}`}
                >
                  {fmt(job.status)}
                </span>
              )}
              {job.isInstantBook && (
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-400">
                  Instant Book
                </span>
              )}
            </div>
            {catName && (
              <p className="mt-1 text-sm text-[var(--muted-text)]">{catName}</p>
            )}
          </div>
          {rate && (
            <div className="shrink-0 rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] px-5 py-3 text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">
                €{rate}
              </p>
              {job.paymentType && (
                <p className="mt-0.5 text-xs text-[var(--muted-text)]">
                  per {fmt(job.paymentType).toLowerCase()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--muted-text)]">
          <span className="flex items-center gap-1.5">
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
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            {loc}
          </span>
          {job.type && <span>{fmt(job.type)}</span>}
          {job.workMode && <span>{fmt(job.workMode)}</span>}
          {job.urgency && job.urgency !== "NORMAL" && (
            <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-red-400">
              {fmt(job.urgency)}
            </span>
          )}
          {job.createdAt && (
            <span>
              {t("employerDashboard.jobDetail.posted", "Posted")}{" "}
              {fmtDate(job.createdAt)}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.type && (
            <span className="rounded-lg bg-[var(--fulfillment-gold)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--fulfillment-gold)]">
              {fmt(job.type)}
            </span>
          )}
          {job.workMode && (
            <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
              {fmt(job.workMode)}
            </span>
          )}
          {catName && (
            <span className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-400">
              {catName}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left - Details */}
        <div className="space-y-5">
          {/* Description */}
          {job.description && (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
              <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                {t("employerDashboard.jobDetail.description", "Description")}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--secondary-text)]">
                {job.description}
              </p>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
              <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                {t("employerDashboard.jobDetail.requirements", "Requirements")}
              </h2>
              <ul className="space-y-1.5">
                {job.requirements.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[var(--secondary-text)]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />{" "}
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
              <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                {t(
                  "employerDashboard.jobDetail.responsibilities",
                  "Responsibilities",
                )}
              </h2>
              <ul className="space-y-1.5">
                {job.responsibilities.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[var(--secondary-text)]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--soft-blue)]" />{" "}
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Schedule */}
          {(job.startDate || job.endDate || job.duration) && (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
              <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                {t("employerDashboard.jobDetail.schedule", "Schedule")}
              </h2>
              <div className="space-y-2">
                {job.startDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted-text)]">
                      {t("employerDashboard.jobDetail.startDate", "Start Date")}
                    </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {fmtDate(job.startDate)}
                    </span>
                  </div>
                )}
                {job.endDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted-text)]">
                      {t("employerDashboard.jobDetail.endDate", "End Date")}
                    </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {fmtDate(job.endDate)}
                    </span>
                  </div>
                )}
                {job.duration && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted-text)]">
                      {t("employerDashboard.jobDetail.duration", "Duration")}
                    </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {job.duration}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right - Management Sidebar */}
        <div className="space-y-5">
          {/* Applicants */}
          <Link
            href={`/dashboard/employer/applications?jobId=${jobId}`}
            className="flex items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--primary)]/30 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--soft-blue)]/15">
              <svg
                className="h-5 w-5 text-[var(--soft-blue)]"
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
            <div>
              <p className="text-lg font-bold text-[var(--foreground)]">
                {applicants}
              </p>
              <p className="text-xs text-[var(--muted-text)]">
                {applicants !== 1
                  ? t(
                      "employerDashboard.jobDetail.applicantsLabelPlural",
                      "applicants",
                    )
                  : t(
                      "employerDashboard.jobDetail.applicantsLabel",
                      "applicant",
                    )}
              </p>
            </div>
          </Link>

          {/* Manage Job Post */}
          <div className="rounded-2xl border-2 border-[var(--primary)]/30 bg-[var(--primary)]/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="h-5 w-5 text-[var(--primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                {t(
                  "employerDashboard.jobDetail.manageJobPost",
                  "Manage Job Post",
                )}
              </h3>
            </div>
            <p className="mb-4 text-xs text-[var(--muted-text)]">
              Edit job details, update requirements, modify payment information,
              or make other changes.
            </p>

            {/* Status actions */}
            <div className="flex flex-wrap gap-2 mb-3">
              {job.status === "ACTIVE" && (
                <button
                  onClick={() => handleStatusChange("PAUSED")}
                  className="flex-1 rounded-xl border border-[var(--fulfillment-gold)]/30 bg-[var(--fulfillment-gold)]/10 py-2.5 text-xs font-medium text-[var(--fulfillment-gold)] hover:bg-[var(--fulfillment-gold)]/20"
                >
                  {t("employerDashboard.jobDetail.pauseJob", "Pause Job")}
                </button>
              )}
              {job.status === "PAUSED" && (
                <button
                  onClick={() => handleStatusChange("ACTIVE")}
                  className="flex-1 rounded-xl border border-[var(--achievement-green)]/30 bg-[var(--achievement-green)]/10 py-2.5 text-xs font-medium text-[var(--achievement-green)] hover:bg-[var(--achievement-green)]/20"
                >
                  {t("employerDashboard.jobDetail.resumeJob", "Resume Job")}
                </button>
              )}
              {(job.status === "ACTIVE" || job.status === "PAUSED") && (
                <button
                  onClick={() => handleStatusChange("CLOSED")}
                  className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] py-2.5 text-xs font-medium text-[var(--muted-text)] hover:bg-[var(--surface-alt)]"
                >
                  {t("employerDashboard.jobDetail.closeJob", "Close Job")}
                </button>
              )}
            </div>

            {/* Edit */}
            <button
              onClick={() => setEditing(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 py-3 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/20"
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
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                />
              </svg>
              {t("employerDashboard.jobDetail.editDetails", "Edit Job Post")}
            </button>

            {/* Delete */}
            <button
              onClick={() => setShowDelete(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
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
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              {t("employerDashboard.jobDetail.deleteJob", "Remove the Job")}
            </button>
          </div>

          {/* Job details sidebar */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
              Details
            </h3>
            <div className="space-y-2.5">
              {job.type && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-text)]">Type</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {fmt(job.type)}
                  </span>
                </div>
              )}
              {job.workMode && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-text)]">Work Mode</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {fmt(job.workMode)}
                  </span>
                </div>
              )}
              {rate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-text)]">Rate</span>
                  <span className="font-medium text-[var(--foreground)]">
                    €{rate}
                    {job.paymentType
                      ? ` / ${fmt(job.paymentType).toLowerCase()}`
                      : ""}
                  </span>
                </div>
              )}
              {job.maxApplicants && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-text)]">
                    Max Applicants
                  </span>
                  <span className="font-medium text-[var(--foreground)]">
                    {job.maxApplicants}
                  </span>
                </div>
              )}
              {job.createdAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-text)]">Posted</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {fmtDate(job.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !saving && setEditing(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--background)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
              {t("employerDashboard.jobDetail.editDetails", "Edit Job Post")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted-text)]">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted-text)]">
                  Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={6}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--soft-blue)] disabled:opacity-50"
              >
                {saving
                  ? t("employerDashboard.jobDetail.saving", "Saving...")
                  : t("employerDashboard.jobDetail.save", "Save Changes")}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="rounded-xl border border-[var(--border-color)] px-5 py-2.5 text-sm font-medium text-[var(--muted-text)] hover:bg-[var(--surface-alt)]"
              >
                {t("employerDashboard.jobDetail.cancelEdit", "Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !deleting && setShowDelete(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--background)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
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
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {t(
                    "employerDashboard.jobDetail.deleteConfirmTitle",
                    "Delete Job",
                  )}
                </h3>
                <p className="text-xs text-[var(--muted-text)]">
                  {t(
                    "employerDashboard.jobDetail.deleteConfirmDesc",
                    "This action cannot be undone.",
                  )}
                </p>
              </div>
            </div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted-text)]">
              {t(
                "employerDashboard.jobDetail.deleteReason",
                "Reason for deletion",
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
              <textarea
                value={deleteCustom}
                onChange={(e) => setDeleteCustom(e.target.value)}
                placeholder="Please specify..."
                rows={3}
                className={`mt-3 ${inputCls} resize-none`}
              />
            )}
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deleting
                  ? t("employerDashboard.jobDetail.deleting", "Deleting...")
                  : t("employerDashboard.jobDetail.deleteJob", "Delete Job")}
              </button>
              <button
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="rounded-xl border border-[var(--border-color)] px-5 py-2.5 text-sm font-medium text-[var(--muted-text)] hover:bg-[var(--surface-alt)]"
              >
                {t("employerDashboard.jobDetail.cancel", "Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
