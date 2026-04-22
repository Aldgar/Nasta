"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../lib/api";
import BrandedSelect from "../../../components/ui/BrandedSelect";
import { useLanguage } from "../../../context/LanguageContext";

interface Category {
  id: string;
  name: string;
}

interface Job {
  id: string;
  title: string;
  description?: string;
  company?: string | { id: string; name: string };
  employerName?: string;
  location?: string;
  city?: string;
  country?: string;
  category?: Category | string;
  type?: string;
  workMode?: string;
  urgency?: string;
  status?: string;
  paymentType?: string;
  rateAmount?: number;
  payRate?: number;
  payUnit?: string;
  currency?: string;
  salaryMin?: number;
  salaryMax?: number;
  isInstantBook?: boolean;
  isRemote?: boolean;
  createdAt?: string;
  applicantCount?: number;
  employer?: {
    id: string;
    firstName: string;
    lastName: string;
    city?: string;
    country?: string;
    isVerified?: boolean;
  };
}

function formatLabel(val: string): string {
  return val
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
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
  });
}

interface MyApp {
  id: string;
  jobId: string;
  status: string;
}

export default function FindWorkPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [appliedMap, setAppliedMap] = useState<Map<string, MyApp>>(new Map());
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "50");
    if (selectedCategory) params.set("category", selectedCategory);
    const [res, appsRes] = await Promise.all([
      api<Job[]>(`/jobs?${params.toString()}`),
      api<
        { id: string; jobId?: string; job?: { id: string }; status: string }[]
      >("/applications/me?limit=200"),
    ]);
    if (res.data && Array.isArray(res.data)) setJobs(res.data);
    if (appsRes.data && Array.isArray(appsRes.data)) {
      const m = new Map<string, MyApp>();
      for (const a of appsRes.data) {
        const jid = a.jobId || a.job?.id;
        if (jid) m.set(jid, { id: a.id, jobId: jid, status: a.status });
      }
      setAppliedMap(m);
    }
    setLoading(false);
  }, [selectedCategory]);

  const fetchCategories = useCallback(async () => {
    const res = await api<Category[]>("/jobs/categories");
    if (res.data && Array.isArray(res.data)) setCategories(res.data);
  }, []);

  const quickApply = async (jobId: string) => {
    setApplyingId(jobId);
    const res = await api(`/jobs/${jobId}/apply`, { method: "POST", body: {} });
    if (!res.error) {
      setAppliedMap((prev) => {
        const next = new Map(prev);
        next.set(jobId, { id: "", jobId, status: "PENDING" });
        return next;
      });
    }
    setApplyingId(null);
  };

  useEffect(() => {
    const q = searchParams.get("search");
    if (q && q !== search) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filtered = jobs.filter((j) => {
    if (search) {
      const q = search.toLowerCase();
      const title = j.title?.toLowerCase() || "";
      const desc = j.description?.toLowerCase() || "";
      const cat =
        typeof j.category === "object" && j.category !== null
          ? j.category.name.toLowerCase()
          : "";
      if (!title.includes(q) && !desc.includes(q) && !cat.includes(q))
        return false;
    }
    if (selectedType) {
      if (j.type !== selectedType) return false;
    }
    return true;
  });

  const JOB_TYPES = [
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "TEMPORARY",
    "FREELANCE",
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          {t("jobs.discover", "Discover")}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
          {t("jobs.findWork", "Find Work")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          {t(
            "jobs.findWorkDescription",
            "Browse available jobs matching your skills and availability.",
          )}
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-text)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder={t("jobs.searchJobs", "Search jobs...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <BrandedSelect
          value={selectedCategory}
          onChange={setSelectedCategory}
          placeholder={t("jobs.allCategories", "All Categories")}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
        <BrandedSelect
          value={selectedType}
          onChange={setSelectedType}
          placeholder={t("jobs.allTypes", "All Types")}
          options={JOB_TYPES.map((t) => ({ value: t, label: formatLabel(t) }))}
        />
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-[var(--muted-text)]">
          {filtered.length}{" "}
          {filtered.length !== 1
            ? t("jobs.jobsFound", "jobs found")
            : t("jobs.jobFound", "job found")}
        </p>
      )}

      {/* Job list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-[var(--muted-text)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
            {t("jobs.noJobsFound", "No jobs found")}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-text)]">
            {search || selectedCategory || selectedType
              ? t(
                  "jobs.tryAdjustingFilters",
                  "Try adjusting your search or filters.",
                )
              : t(
                  "jobs.noJobsAvailable",
                  "No jobs available at the moment. Check back soon!",
                )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => {
            const categoryName =
              typeof job.category === "object" && job.category !== null
                ? job.category.name
                : (job.category as string) || "";
            const companyName =
              typeof job.company === "object" && job.company !== null
                ? job.company.name
                : (job.company as string) || "";
            const employerLabel = job.employer
              ? `${job.employer.firstName} ${job.employer.lastName}`
              : job.employerName || companyName || "Client";
            const locationLabel =
              [job.city, job.country].filter(Boolean).join(", ") ||
              job.location ||
              "Remote";
            const isInstant = job.isInstantBook;
            const typeLabel = job.type ? formatLabel(job.type) : "";
            const modeLabel = job.workMode ? formatLabel(job.workMode) : "";
            const rate = job.rateAmount || job.payRate;
            const unit = job.paymentType || job.payUnit || "HOUR";
            const hasApplied = appliedMap.has(job.id);
            const isApplying = applyingId === job.id;
            const count = job.applicantCount ?? 0;

            return (
              <div
                key={job.id}
                className="group rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--primary)]/30 hover:shadow-lg hover:shadow-[var(--primary)]/5"
              >
                <Link href={`/dashboard/jobs/${job.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                          {job.title}
                        </h3>
                        {isInstant && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2.5 py-1 text-[11px] font-bold text-cyan-400">
                            <svg
                              className="h-3 w-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" />
                            </svg>
                            {t("jobs.instant", "Instant")}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm text-[var(--muted-text)]">
                        {employerLabel}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {rate ? (
                        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-2 text-center">
                          <p className="text-lg font-bold text-[var(--primary)]">
                            €{rate}
                          </p>
                          <p className="text-[10px] font-medium text-[var(--muted-text)]">
                            /{unit.toLowerCase().replace("_", " ")}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {job.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--muted-text)]">
                      {job.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--muted-text)]">
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="h-4 w-4 shrink-0"
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
                      <span>{locationLabel}</span>
                    </div>
                    {count > 0 && (
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="h-4 w-4 shrink-0"
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
                        <span>
                          {count}{" "}
                          {count !== 1
                            ? t("jobs.applicants", "applicants")
                            : t("jobs.applicant", "applicant")}
                        </span>
                      </div>
                    )}
                    {job.createdAt && (
                      <span className="text-xs">{timeAgo(job.createdAt)}</span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {typeLabel && (
                      <span className="inline-flex items-center rounded-lg bg-[var(--fulfillment-gold)]/10 px-3 py-1 text-xs font-semibold text-[var(--fulfillment-gold)]">
                        {typeLabel}
                      </span>
                    )}
                    {modeLabel && (
                      <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                        {modeLabel}
                      </span>
                    )}
                    {categoryName && (
                      <span className="inline-flex items-center rounded-lg bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                        {categoryName}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--border-color)] pt-4">
                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="text-sm font-medium text-[var(--primary)] hover:text-[var(--soft-blue)] transition-colors"
                  >
                    {t("jobs.viewDetails", "View Details")} →
                  </Link>
                  {hasApplied ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-400">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      {t("jobs.applied", "Applied")}
                    </span>
                  ) : (
                    <button
                      onClick={() => quickApply(job.id)}
                      disabled={isApplying}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--soft-blue)] hover:shadow-lg hover:shadow-[var(--primary)]/20 disabled:opacity-50"
                    >
                      {isApplying ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
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
                            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                          />
                        </svg>
                      )}
                      {isInstant
                        ? t("jobs.applyInstantly", "Apply Instantly")
                        : t("jobs.quickApply", "Quick Apply")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
