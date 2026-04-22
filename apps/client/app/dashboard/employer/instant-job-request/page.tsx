"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../lib/api";
import BrandedSelect from "../../../../components/ui/BrandedSelect";
import BrandedDatePicker from "../../../../components/ui/BrandedDatePicker";
import BrandedTimePicker from "../../../../components/ui/BrandedTimePicker";
import { useLanguage } from "../../../../context/LanguageContext";

interface Category {
  id: string;
  name: string;
}

interface ProviderRate {
  rate: number;
  paymentType: string;
  description?: string;
  otherSpecification?: string;
}

interface CandidateData {
  id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  skills?: Array<{ name?: string } | string>;
  rates?: ProviderRate[];
  hasVerifiedVehicle?: boolean;
  hasVerifiedDriversLicense?: boolean;
  availability?: Array<{
    id?: string;
    start: string;
    end: string;
    isRecurring?: boolean;
  }>;
}

const WORK_MODE_VALUES = ["ON_SITE", "REMOTE", "HYBRID"] as const;
const URGENCY_VALUES = ["NORMAL", "URGENT"] as const;
const JOB_TYPE_VALUES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "TEMPORARY",
  "FREELANCE",
  "INTERNSHIP",
  "GIG",
] as const;
const PAYMENT_TYPE_VALUES = [
  "HOURLY",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "FIXED",
] as const;

const CURRENCIES = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
];

const PAYMENT_TYPE_MAP: Record<string, string> = {
  HOUR: "HOURLY",
  DAY: "DAILY",
  WEEK: "WEEKLY",
  MONTH: "MONTHLY",
  HOURLY: "HOURLY",
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  FIXED: "FIXED",
  OTHER: "OTHER",
};

const PAYMENT_TYPE_LABEL_KEYS: Record<string, string> = {
  HOUR: "employerDashboard.postJob.paymentTypePerHour",
  HOURLY: "employerDashboard.postJob.paymentTypePerHour",
  DAY: "employerDashboard.postJob.paymentTypePerDay",
  DAILY: "employerDashboard.postJob.paymentTypePerDay",
  WEEK: "employerDashboard.postJob.paymentTypePerWeek",
  WEEKLY: "employerDashboard.postJob.paymentTypePerWeek",
  MONTH: "employerDashboard.postJob.paymentTypePerMonth",
  MONTHLY: "employerDashboard.postJob.paymentTypePerMonth",
  FIXED: "employerDashboard.postJob.paymentTypeFixed",
  OTHER: "common.other",
};

export default function InstantJobRequestPage() {
  const { t } = useLanguage();

  const getWorkModeLabel = (value: string) => {
    const map: Record<string, string> = {
      ON_SITE: t("employerDashboard.postJob.workModeOnSite", "On-site"),
      REMOTE: t("employerDashboard.postJob.workModeRemote", "Remote"),
      HYBRID: t("employerDashboard.postJob.workModeHybrid", "Hybrid"),
    };
    return map[value] ?? value;
  };

  const getUrgencyLabel = (value: string) => {
    const map: Record<string, string> = {
      NORMAL: t("employerDashboard.postJob.urgencyNormal", "Normal"),
      URGENT: t("employerDashboard.postJob.urgencyUrgent", "Urgent"),
    };
    return map[value] ?? value;
  };

  const getJobTypeLabel = (value: string) => {
    const map: Record<string, string> = {
      FULL_TIME: t("employerDashboard.postJob.jobTypeFullTime", "Full Time"),
      PART_TIME: t("employerDashboard.postJob.jobTypePartTime", "Part Time"),
      CONTRACT: t("employerDashboard.postJob.jobTypeContract", "Contract"),
      TEMPORARY: t("employerDashboard.postJob.jobTypeTemporary", "Temporary"),
      FREELANCE: t("employerDashboard.postJob.jobTypeFreelance", "Freelance"),
      INTERNSHIP: t(
        "employerDashboard.postJob.jobTypeInternship",
        "Internship",
      ),
      GIG: t("employerDashboard.postJob.jobTypeGig", "Gig"),
    };
    return map[value] ?? value;
  };

  const getPaymentTypeLabel = (value: string) => {
    const key = PAYMENT_TYPE_LABEL_KEYS[value];
    if (!key) return value;
    const fallbacks: Record<string, string> = {
      "employerDashboard.postJob.paymentTypePerHour": "Per Hour",
      "employerDashboard.postJob.paymentTypePerDay": "Per Day",
      "employerDashboard.postJob.paymentTypePerWeek": "Per Week",
      "employerDashboard.postJob.paymentTypePerMonth": "Per Month",
      "employerDashboard.postJob.paymentTypeFixed": "Fixed Price",
      "common.other": "Other",
    };
    return t(key, fallbacks[key] ?? value);
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = searchParams.get("candidateId");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Candidate / provider data
  const [candidateData, setCandidateData] = useState<CandidateData | null>(
    null,
  );
  const [candidateLoading, setCandidateLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [workMode, setWorkMode] = useState("ON_SITE");
  const [urgency, setUrgency] = useState("NORMAL");
  const [jobType, setJobType] = useState("GIG");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");

  // Payment — provider rate selection + custom rate
  const [selectedProviderRateIndices, setSelectedProviderRateIndices] =
    useState<number[]>([]);
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [rateAmount, setRateAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [paymentType, setPaymentType] = useState("HOURLY");

  const [requirements, setRequirements] = useState<string[]>([""]);
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [isRestrictedSector, setIsRestrictedSector] = useState(false);
  const [requiresVehicle, setRequiresVehicle] = useState(false);
  const [requiresDriverLicense, setRequiresDriverLicense] = useState(false);

  // Two-step flow: form -> review
  const [showReview, setShowReview] = useState(false);

  const fetchCategories = useCallback(async () => {
    const res = await api<Category[]>("/jobs/categories");
    if (res.data && Array.isArray(res.data)) setCategories(res.data);
  }, []);

  const fetchCandidateData = useCallback(async () => {
    if (!candidateId) return;
    setCandidateLoading(true);
    const res = await api<CandidateData>(`/users/candidates/${candidateId}`);
    if (res.data) setCandidateData(res.data);
    setCandidateLoading(false);
  }, [candidateId]);

  useEffect(() => {
    fetchCategories();
    fetchCandidateData();
  }, [fetchCategories, fetchCandidateData]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Build selectedRates array for the API
  const buildSelectedRates = () => {
    const rates: Array<{
      rate: number;
      paymentType: string;
      description?: string;
      isCustom?: boolean;
    }> = [];
    const providerRates = candidateData?.rates || [];
    for (const idx of selectedProviderRateIndices) {
      const pr = providerRates[idx];
      if (pr) {
        rates.push({
          rate: pr.rate,
          paymentType: pr.paymentType,
          description: pr.description || pr.otherSpecification,
        });
      }
    }
    if (useCustomRate && rateAmount && parseFloat(rateAmount) > 0) {
      rates.push({
        rate: parseFloat(rateAmount),
        paymentType: paymentType,
        isCustom: true,
      });
    }
    return rates;
  };

  const handleContinueToReview = () => {
    if (!candidateId) {
      setToast({
        message: t(
          "employerDashboard.instantJob.missingCandidate",
          "No candidate specified",
        ),
        type: "error",
      });
      return;
    }
    if (!title.trim()) {
      setToast({
        message: t(
          "employerDashboard.postJob.errorTitleRequired",
          "Job title is required",
        ),
        type: "error",
      });
      return;
    }
    if (!description.trim()) {
      setToast({
        message: t(
          "employerDashboard.postJob.errorDescRequired",
          "Job description is required",
        ),
        type: "error",
      });
      return;
    }
    if (!location.trim()) {
      setToast({
        message: t(
          "employerDashboard.postJob.errorLocationRequired",
          "Location is required",
        ),
        type: "error",
      });
      return;
    }
    if (!city.trim()) {
      setToast({
        message: t(
          "employerDashboard.postJob.errorCityRequired",
          "City is required",
        ),
        type: "error",
      });
      return;
    }
    if (!country.trim()) {
      setToast({
        message: t(
          "employerDashboard.postJob.errorCountryRequired",
          "Country is required",
        ),
        type: "error",
      });
      return;
    }
    if (!startDate) {
      setToast({
        message: t(
          "employerDashboard.postJob.errorStartDateRequired",
          "Start date is required",
        ),
        type: "error",
      });
      return;
    }

    // Payment validation: at least one provider rate OR valid custom rate
    const hasProviderRate = selectedProviderRateIndices.length > 0;
    const hasCustom = useCustomRate && rateAmount && parseFloat(rateAmount) > 0;
    if (!hasProviderRate && !hasCustom) {
      setToast({
        message: t(
          "employerDashboard.instantJob.paymentRequired",
          "Please select at least one service provider rate or add a custom rate.",
        ),
        type: "error",
      });
      return;
    }

    setShowReview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!candidateId) return;
    setLoading(true);

    const startDateTime = `${startDate}T${startTime || "09:00"}:00.000Z`;
    const selectedRates = buildSelectedRates();

    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      workMode,
      urgency,
      type: jobType,
      location: location.trim(),
      city: city.trim(),
      country: country.trim(),
      lat: 0,
      lng: 0,
      startDate: startDateTime,
      isInstantBook: true,
    };

    if (categoryId === "custom") {
      if (customCategory.trim()) payload.categoryName = customCategory.trim();
    } else if (categoryId) {
      payload.categoryId = categoryId;
    }

    if (endDate) payload.endDate = `${endDate}T23:59:59.000Z`;

    // Set the first rate on the job for backward compatibility
    if (selectedRates.length > 0) {
      const primary = selectedRates[0];
      payload.rateAmount = Math.round(primary.rate * 100);
      payload.currency = currency;
      payload.paymentType =
        PAYMENT_TYPE_MAP[primary.paymentType] || primary.paymentType;
    }

    const filteredReqs = requirements.filter((r) => r.trim());
    if (filteredReqs.length > 0) payload.requirements = filteredReqs;
    const filteredResps = responsibilities.filter((r) => r.trim());
    if (filteredResps.length > 0) payload.responsibilities = filteredResps;

    if (requiresVehicle) payload.requiresVehicle = true;
    if (requiresDriverLicense) payload.requiresDriverLicense = true;

    // Step 1: Create the job
    const jobRes = await api<{ job: { id: string }; message: string }>(
      "/jobs",
      {
        method: "POST",
        body: payload,
      },
    );

    if (jobRes.error || !jobRes.data?.job?.id) {
      setLoading(false);
      setToast({
        message:
          typeof jobRes.error === "string"
            ? jobRes.error
            : t(
                "employerDashboard.postJob.errorCreateFailed",
                "Failed to create instant job",
              ),
        type: "error",
      });
      return;
    }

    // Step 2: Auto-apply the candidate with selectedRates
    const applyRes = await api(
      `/applications/instant/${jobRes.data.job.id}/${candidateId}`,
      {
        method: "POST",
        body: { selectedRates },
      },
    );

    setLoading(false);

    if (applyRes.error) {
      setToast({
        message:
          typeof applyRes.error === "string"
            ? applyRes.error
            : t(
                "employerDashboard.instantJob.failedToSendRequest",
                "Job created but failed to send request to provider",
              ),
        type: "error",
      });
      return;
    }

    setToast({
      message: t(
        "employerDashboard.instantJob.success",
        "Instant job request sent successfully!",
      ),
      type: "success",
    });
    setTimeout(() => router.push("/dashboard/employer/my-jobs"), 1500);
  };

  const addListItem = (list: string[], setter: (v: string[]) => void) => {
    setter([...list, ""]);
  };

  const updateListItem = (
    list: string[],
    setter: (v: string[]) => void,
    idx: number,
    val: string,
  ) => {
    const updated = [...list];
    updated[idx] = val;
    setter(updated);
  };

  const removeListItem = (
    list: string[],
    setter: (v: string[]) => void,
    idx: number,
  ) => {
    if (list.length <= 1) {
      setter([""]);
      return;
    }
    setter(list.filter((_, i) => i !== idx));
  };

  const toggleProviderRate = (idx: number) => {
    setSelectedProviderRateIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const inputCls =
    "w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30";
  const labelCls = "block text-sm font-medium text-[var(--foreground)] mb-1.5";

  if (!candidateId) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-12 text-center">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {t(
              "employerDashboard.instantJob.missingCandidate",
              "No candidate specified",
            )}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-text)]">
            {t(
              "employerDashboard.instantJob.missingCandidateDesc",
              "Please select a service provider first.",
            )}
          </p>
          <Link
            href="/dashboard/employer/service-providers"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            {t(
              "employerDashboard.instantJob.browseProviders",
              "Browse Service Providers",
            )}
          </Link>
        </div>
      </div>
    );
  }

  // --- REVIEW / SUMMARY STEP ---
  if (showReview) {
    const selectedRates = buildSelectedRates();
    const providerRates = candidateData?.rates || [];
    const selectedRatesList = selectedProviderRateIndices
      .map((idx) => providerRates[idx])
      .filter(Boolean);
    const hasCustom = useCustomRate && rateAmount && parseFloat(rateAmount) > 0;
    const categoryLabel =
      categoryId === "custom"
        ? customCategory
        : categories.find((c) => c.id === categoryId)?.name || "\u2014";

    return (
      <div className="mx-auto max-w-4xl">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed right-6 top-6 z-50 rounded-xl px-5 py-3 text-sm font-medium shadow-lg transition-all ${
              toast.type === "success"
                ? "bg-[var(--achievement-green)] text-white"
                : "bg-[var(--alert-red)] text-white"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => setShowReview(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] text-[var(--muted-text)] transition-colors hover:text-[var(--foreground)]"
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
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9963F]">
              {t("employerDashboard.instantJob.badge", "Instant")}
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
            {t("employerDashboard.instantJob.reviewRequest", "Review Request")}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            {t(
              "employerDashboard.instantJob.reviewSubtitle",
              "Review the details before sending your instant job request.",
            )}
          </p>
        </div>

        <div className="space-y-6">
          {/* Provider Info Card */}
          {candidateData && (
            <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#C9963F]">
                {t(
                  "employerDashboard.instantJob.serviceProvider",
                  "Service Provider",
                )}
              </h2>
              <div className="flex items-center gap-4">
                {candidateData.avatar ? (
                  <img
                    src={candidateData.avatar}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9963F]/10">
                    <svg
                      className="h-6 w-6 text-[#C9963F]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    {candidateData.firstName} {candidateData.lastName}
                  </p>
                  {candidateData.skills && candidateData.skills.length > 0 && (
                    <p className="text-xs text-[var(--muted-text)]">
                      {candidateData.skills
                        .slice(0, 3)
                        .map((s) => (typeof s === "string" ? s : s.name || ""))
                        .join(" \u00B7 ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Provider Availability */}
              {candidateData.availability &&
                candidateData.availability.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-[var(--muted-text)]">
                      {t(
                        "employerDashboard.instantJob.providerAvailability",
                        "Provider Availability",
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {candidateData.availability.map((avail, idx) => (
                        <span
                          key={avail.id || idx}
                          className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-[var(--foreground)]"
                        >
                          {new Date(avail.start).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          {new Date(avail.start).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(avail.end).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {avail.isRecurring ? " \u21BB" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </section>
          )}

          {/* Job Details Summary */}
          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#C9963F]">
              {t("employerDashboard.postJob.jobDetails", "Job Details")}
            </h2>
            <div className="space-y-3">
              <SummaryRow
                label={t("employerDashboard.postJob.jobTitle", "Job Title")}
                value={title}
              />
              <SummaryRow
                label={t("employerDashboard.postJob.categoryLabel", "Category")}
                value={categoryLabel}
              />
              <SummaryRow
                label={t("employerDashboard.postJob.location", "Location")}
                value={`${location}, ${city}, ${country}`}
              />
              <SummaryRow
                label={t("employerDashboard.postJob.startDateAndTime", "Start")}
                value={`${startDate} ${startTime}`}
              />
              {endDate && (
                <SummaryRow
                  label={t("employerDashboard.postJob.endDate", "End Date")}
                  value={endDate}
                />
              )}
              <SummaryRow
                label={t("employerDashboard.postJob.workMode", "Work Mode")}
                value={getWorkModeLabel(workMode)}
              />
              <SummaryRow
                label={t("employerDashboard.postJob.urgency", "Urgency")}
                value={urgency}
              />

              {/* Selected Rates */}
              {(selectedRatesList.length > 0 || hasCustom) && (
                <div className="border-t border-[var(--border-color)] pt-3 mt-3">
                  <p className="mb-2 text-xs font-medium text-[var(--muted-text)]">
                    {t("employerDashboard.instantJob.paymentLabel", "Payment")}
                  </p>
                  <div className="space-y-1.5">
                    {selectedRatesList.map((rate, i) => (
                      <p
                        key={`pr-${i}`}
                        className="text-sm text-[var(--foreground)]"
                      >
                        • {currency} {rate.rate.toFixed(2)} /{" "}
                        {getPaymentTypeLabel(rate.paymentType)}
                        {rate.description || rate.otherSpecification
                          ? ` — ${rate.description || rate.otherSpecification}`
                          : ""}
                      </p>
                    ))}
                    {hasCustom && (
                      <p className="text-sm text-blue-500">
                        • {currency} {rateAmount} /{" "}
                        {getPaymentTypeLabel(paymentType)} (
                        {t(
                          "employerDashboard.instantJob.customRateLabel",
                          "Custom",
                        )}
                        )
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {requirements.filter((r) => r.trim()).length > 0 && (
                <div className="border-t border-[var(--border-color)] pt-3 mt-3">
                  <p className="mb-2 text-xs font-medium text-[var(--muted-text)]">
                    {t(
                      "employerDashboard.postJob.requirementsTitle",
                      "Requirements",
                    )}
                  </p>
                  {requirements
                    .filter((r) => r.trim())
                    .map((req, i) => (
                      <p key={i} className="text-sm text-[var(--foreground)]">
                        • {req}
                      </p>
                    ))}
                </div>
              )}

              {/* Responsibilities */}
              {responsibilities.filter((r) => r.trim()).length > 0 && (
                <div className="border-t border-[var(--border-color)] pt-3 mt-3">
                  <p className="mb-2 text-xs font-medium text-[var(--muted-text)]">
                    {t(
                      "employerDashboard.instantJob.responsibilities",
                      "Responsibilities",
                    )}
                  </p>
                  {responsibilities
                    .filter((r) => r.trim())
                    .map((resp, i) => (
                      <p key={i} className="text-sm text-[var(--foreground)]">
                        • {resp}
                      </p>
                    ))}
                </div>
              )}
            </div>
          </section>

          {/* Info Banner */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
            <p className="text-sm text-[var(--foreground)]">
              {t(
                "employerDashboard.instantJob.requestWillBeSent",
                "Your request will be sent to the service provider for review. They can accept or decline your instant job request.",
              )}
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
            <button
              type="button"
              onClick={() => setShowReview(false)}
              className="text-sm font-medium text-[var(--muted-text)] transition-colors hover:text-[var(--foreground)]"
            >
              {t(
                "employerDashboard.instantJob.backToEdit",
                "\u2190 Back to Edit",
              )}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {t("employerDashboard.instantJob.sending", "Sending...")}
                </>
              ) : (
                <>
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
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                  {t(
                    "employerDashboard.instantJob.sendRequest",
                    "Send Instant Request",
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- FORM STEP ---
  return (
    <div className="mx-auto max-w-4xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl px-5 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-[var(--achievement-green)] text-white"
              : "bg-[var(--alert-red)] text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] text-[var(--muted-text)] transition-colors hover:text-[var(--foreground)]"
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
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9963F]">
            {t("employerDashboard.instantJob.badge", "Instant")}
          </p>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
          {t("employerDashboard.instantJob.title", "Request Instant Job")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          {t(
            "employerDashboard.instantJob.subtitle",
            "Create an instant job request and send it directly to this service provider.",
          )}
        </p>
      </div>

      <div className="space-y-8">
        {/* -- Provider Info Card -- */}
        {candidateLoading ? (
          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-full bg-[var(--border-color)]" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-[var(--border-color)]" />
                <div className="h-3 w-24 animate-pulse rounded bg-[var(--border-color)]" />
              </div>
            </div>
          </section>
        ) : (
          candidateData && (
            <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#C9963F]">
                {t(
                  "employerDashboard.instantJob.serviceProvider",
                  "Service Provider",
                )}
              </h2>
              <div className="flex items-center gap-4">
                {candidateData.avatar ? (
                  <img
                    src={candidateData.avatar}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9963F]/10">
                    <svg
                      className="h-6 w-6 text-[#C9963F]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    {candidateData.firstName} {candidateData.lastName}
                  </p>
                  {candidateData.skills && candidateData.skills.length > 0 && (
                    <p className="text-xs text-[var(--muted-text)]">
                      {candidateData.skills
                        .slice(0, 3)
                        .map((s) => (typeof s === "string" ? s : s.name || ""))
                        .join(" \u00B7 ")}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )
        )}

        {/* -- Basic Info -- */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <h2 className="mb-5 text-lg font-semibold text-[var(--foreground)]">
            {t("employerDashboard.postJob.jobDetails", "Job Details")}
          </h2>

          <div className="space-y-5">
            <div>
              <label className={labelCls}>
                {t("employerDashboard.postJob.jobTitle", "Job Title *")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t(
                  "employerDashboard.postJob.jobTitlePlaceholder",
                  "e.g. House Cleaning, Garden Maintenance...",
                )}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                {t("employerDashboard.postJob.description", "Description *")}
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  "employerDashboard.postJob.descriptionPlaceholder",
                  "Describe the job, what needs to be done, and any specific instructions...",
                )}
                className={inputCls + " resize-none"}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  {t("employerDashboard.postJob.categoryLabel", "Category")}
                </label>
                <BrandedSelect
                  value={categoryId}
                  onChange={setCategoryId}
                  placeholder={t(
                    "employerDashboard.postJob.selectCategory",
                    "Select a category",
                  )}
                  options={[
                    ...categories.map((c) => ({ value: c.id, label: c.name })),
                    { value: "custom", label: "Other (custom)" },
                  ]}
                />
              </div>
              {categoryId === "custom" && (
                <div>
                  <label className={labelCls}>
                    {t(
                      "employerDashboard.postJob.customCategory",
                      "Custom Category",
                    )}
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder={t(
                      "employerDashboard.postJob.enterCategoryPlaceholder",
                      "Enter category name...",
                    )}
                    className={inputCls}
                  />
                </div>
              )}
              <div>
                <label className={labelCls}>
                  {t("employerDashboard.postJob.jobType", "Job Type")}
                </label>
                <BrandedSelect
                  value={jobType}
                  onChange={setJobType}
                  options={JOB_TYPE_VALUES.map((v) => ({
                    value: v,
                    label: getJobTypeLabel(v),
                  }))}
                />
              </div>
            </div>
          </div>
        </section>

        {/* -- Work Mode & Urgency -- */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <h2 className="mb-5 text-lg font-semibold text-[var(--foreground)]">
            {t("employerDashboard.postJob.workMode", "Work Mode")} &{" "}
            {t("employerDashboard.postJob.urgency", "Urgency")}
          </h2>

          <div className="space-y-5">
            <div>
              <label className={labelCls}>
                {t("employerDashboard.postJob.workMode", "Work Mode")} *
              </label>
              <div className="flex flex-wrap gap-3">
                {WORK_MODE_VALUES.map((wm) => (
                  <button
                    key={wm}
                    type="button"
                    onClick={() => setWorkMode(wm)}
                    className={`rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
                      workMode === wm
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border-color)] bg-[var(--surface-alt)] text-[var(--muted-text)] hover:border-[var(--primary)]/30 hover:text-[var(--foreground)]"
                    }`}
                  >
                    {getWorkModeLabel(wm)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>
                {t("employerDashboard.postJob.urgency", "Urgency")}
              </label>
              <div className="flex flex-wrap gap-3">
                {URGENCY_VALUES.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUrgency(u)}
                    className={`rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
                      urgency === u
                        ? u === "URGENT"
                          ? "border-[var(--alert-red)] bg-[var(--alert-red)]/10 text-[var(--alert-red)]"
                          : "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border-color)] bg-[var(--surface-alt)] text-[var(--muted-text)]"
                    }`}
                  >
                    {getUrgencyLabel(u)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* -- Location -- */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <h2 className="mb-5 text-lg font-semibold text-[var(--foreground)]">
            {t("employerDashboard.postJob.location", "Location")}
          </h2>

          <div className="space-y-5">
            <div>
              <label className={labelCls}>
                {t("employerDashboard.postJob.location", "Address / Location")}{" "}
                *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t(
                  "employerDashboard.postJob.streetAddressPlaceholder",
                  "Street address or area...",
                )}
                className={inputCls}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  {t("employerDashboard.postJob.city", "City")} *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t(
                    "employerDashboard.postJob.cityPlaceholder",
                    "City...",
                  )}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  {t("employerDashboard.postJob.country", "Country")} *
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t(
                    "employerDashboard.postJob.countryPlaceholder",
                    "Country...",
                  )}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        </section>

        {/* -- Schedule -- */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <h2 className="mb-5 text-lg font-semibold text-[var(--foreground)]">
            {t("employerDashboard.postJob.schedule", "Schedule")}
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className={labelCls}>
                {t("employerDashboard.postJob.startDateAndTime", "Start Date")}{" "}
                *
              </label>
              <BrandedDatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder={t(
                  "employerDashboard.postJob.selectStartDate",
                  "Select start date",
                )}
              />
            </div>
            <div>
              <label className={labelCls}>
                {t("employerDashboard.postJob.startTime", "Start Time")}
              </label>
              <BrandedTimePicker
                value={startTime}
                onChange={setStartTime}
                placeholder={t(
                  "employerDashboard.postJob.selectTime",
                  "Select time",
                )}
                step={15}
              />
            </div>
            <div>
              <label className={labelCls}>
                {t("employerDashboard.postJob.endDate", "End Date (Optional)")}
              </label>
              <BrandedDatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder={t(
                  "employerDashboard.postJob.selectEndDate",
                  "Select end date",
                )}
              />
            </div>
          </div>
        </section>

        {/* -- Payment: Provider Rates + Custom Rate -- */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <h2 className="mb-5 text-lg font-semibold text-[var(--foreground)]">
            {t("employerDashboard.postJob.compensation", "Payment")}
          </h2>

          {/* Provider Rates */}
          {candidateData?.rates && candidateData.rates.length > 0 ? (
            <div className="mb-5">
              <p className="mb-3 text-xs text-[var(--muted-text)]">
                {t(
                  "employerDashboard.instantJob.selectProviderRates",
                  "Select from provider's rates:",
                )}
              </p>
              <div className="space-y-2">
                {candidateData.rates.map((rate, idx) => {
                  const isSelected = selectedProviderRateIndices.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleProviderRate(idx)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-[#C9963F] bg-[#C9963F]/10"
                          : "border-[var(--border-color)] bg-[var(--surface-alt)] hover:border-[#C9963F]/30"
                      }`}
                    >
                      <svg
                        className={`h-5 w-5 shrink-0 ${
                          isSelected
                            ? "text-[#C9963F]"
                            : "text-[var(--muted-text)]"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        {isSelected ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        ) : (
                          <circle cx="12" cy="12" r="9" />
                        )}
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {currency} {rate.rate.toFixed(2)} /{" "}
                          {getPaymentTypeLabel(rate.paymentType)}
                        </p>
                        {(rate.description || rate.otherSpecification) && (
                          <p className="text-xs text-[var(--muted-text)]">
                            {rate.description || rate.otherSpecification}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4 text-center">
              <p className="text-xs text-[var(--muted-text)]">
                {t(
                  "employerDashboard.instantJob.noProviderRates",
                  "This provider has no rates set. Please add a custom rate below.",
                )}
              </p>
            </div>
          )}

          {/* Custom Rate Toggle */}
          <button
            type="button"
            onClick={() => setUseCustomRate(!useCustomRate)}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              useCustomRate
                ? "border-blue-500 bg-blue-500/10"
                : "border-[var(--border-color)] bg-[var(--surface-alt)] hover:border-blue-500/30"
            }`}
          >
            <svg
              className={`h-5 w-5 shrink-0 ${
                useCustomRate ? "text-blue-500" : "text-[var(--muted-text)]"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {useCustomRate ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              )}
            </svg>
            <span
              className={`text-sm font-semibold ${
                useCustomRate ? "text-blue-500" : "text-[var(--foreground)]"
              }`}
            >
              {t(
                "employerDashboard.instantJob.addCustomRate",
                "Add Custom Rate",
              )}
            </span>
          </button>

          {/* Custom Rate Fields */}
          {useCustomRate && (
            <div className="mt-4 grid gap-5 sm:grid-cols-3">
              <div>
                <label className={labelCls}>
                  {t("employerDashboard.postJob.rate", "Rate Amount")}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rateAmount}
                  onChange={(e) => setRateAmount(e.target.value)}
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  {t("employerDashboard.postJob.currency", "Currency")}
                </label>
                <BrandedSelect
                  value={currency}
                  onChange={setCurrency}
                  options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                />
              </div>
              <div>
                <label className={labelCls}>
                  {t("employerDashboard.postJob.paymentType", "Payment Type")}
                </label>
                <BrandedSelect
                  value={paymentType}
                  onChange={setPaymentType}
                  options={PAYMENT_TYPE_VALUES.map((v) => ({
                    value: v,
                    label: getPaymentTypeLabel(v),
                  }))}
                />
              </div>
            </div>
          )}
        </section>

        {/* -- Requirements -- */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <h2 className="mb-5 text-lg font-semibold text-[var(--foreground)]">
            {t("employerDashboard.postJob.requirementsTitle", "Requirements")}
          </h2>

          <div className="space-y-2">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) =>
                    updateListItem(
                      requirements,
                      setRequirements,
                      i,
                      e.target.value,
                    )
                  }
                  placeholder={`${t("employerDashboard.postJob.requirementPlaceholder", "Requirement")} ${i + 1}...`}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() =>
                    removeListItem(requirements, setRequirements, i)
                  }
                  className="shrink-0 rounded-lg p-2 text-[var(--muted-text)] transition-colors hover:bg-[var(--alert-red)]/10 hover:text-[var(--alert-red)]"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem(requirements, setRequirements)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
            >
              <svg
                className="h-3.5 w-3.5"
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
              {t("employerDashboard.postJob.addRequirement", "Add requirement")}
            </button>
          </div>
        </section>

        {/* -- Responsibilities -- */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <h2 className="mb-5 text-lg font-semibold text-[var(--foreground)]">
            {t(
              "employerDashboard.instantJob.responsibilities",
              "Responsibilities",
            )}
          </h2>

          <div className="space-y-2">
            {responsibilities.map((resp, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) =>
                    updateListItem(
                      responsibilities,
                      setResponsibilities,
                      i,
                      e.target.value,
                    )
                  }
                  placeholder={`${t("employerDashboard.postJob.responsibilityPlaceholder", "Responsibility")} ${i + 1}...`}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() =>
                    removeListItem(responsibilities, setResponsibilities, i)
                  }
                  className="shrink-0 rounded-lg p-2 text-[var(--muted-text)] transition-colors hover:bg-[var(--alert-red)]/10 hover:text-[var(--alert-red)]"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem(responsibilities, setResponsibilities)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
            >
              <svg
                className="h-3.5 w-3.5"
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
              {t(
                "employerDashboard.instantJob.addResponsibility",
                "Add responsibility",
              )}
            </button>
          </div>
        </section>

        {/* -- Vehicle / License Requirements -- */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <h2 className="mb-5 text-lg font-semibold text-[var(--foreground)]">
            {t(
              "employerDashboard.postJob.jobRequirementsTitle",
              "Job Requirements",
            )}
          </h2>

          <div className="space-y-5">
            {/* Restricted sector */}
            <div>
              <p className="mb-2 text-sm text-[var(--secondary-text)]">
                {t(
                  "employerDashboard.postJob.restrictedSectorQuestion",
                  "Is this job related to Healthcare, Government, Finance, Military, Government Papers, or Babysitting?",
                )}
              </p>
              <p className="mb-3 text-xs text-[var(--muted-text)]">
                {t(
                  "employerDashboard.postJob.restrictedSectorDisclaimer",
                  "Please declare: Nasta is not responsible for incidents related to these job types as they are outside of Nasta\u2019s scope.",
                )}
              </p>
              <label className="relative inline-flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isRestrictedSector}
                  onChange={(e) => setIsRestrictedSector(e.target.checked)}
                />
                <div className="peer h-6 w-11 rounded-full bg-[var(--border-color)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[var(--alert-red)] peer-checked:after:translate-x-full" />
                <span
                  className={`text-sm ${
                    isRestrictedSector
                      ? "font-medium text-[var(--alert-red)]"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {isRestrictedSector
                    ? t(
                        "employerDashboard.postJob.restrictedSectorYes",
                        "Yes \u2014 Restricted Sector",
                      )
                    : t("employerDashboard.postJob.no", "No")}
                </span>
              </label>
            </div>

            {/* Warning banner when restricted sector is selected */}
            {isRestrictedSector && (
              <div className="flex items-start gap-3 rounded-xl border border-[var(--alert-red)]/30 bg-[var(--alert-red)]/5 p-4">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--alert-red)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                <p className="text-sm text-[var(--alert-red)]">
                  {t(
                    "employerDashboard.postJob.restrictedSectorWarning",
                    "Jobs in Healthcare, Government, Finance, Military, Government Papers, and Babysitting sectors require special verification. These job types are outside of Nasta\u2019s scope and Nasta is not responsible for any related incidents.",
                  )}
                </p>
              </div>
            )}

            {/* Vehicle & driver requirements */}
            {!isRestrictedSector && (
              <>
                <div>
                  <p className="mb-2 text-sm text-[var(--secondary-text)]">
                    {t(
                      "employerDashboard.postJob.vehicleQuestion",
                      "Does this job have any of these requirements?",
                    )}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                    <label className="relative inline-flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={requiresVehicle}
                        onChange={(e) => setRequiresVehicle(e.target.checked)}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-[var(--border-color)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[var(--primary)] peer-checked:after:translate-x-full" />
                      <span className="text-sm text-[var(--foreground)]">
                        {t(
                          "employerDashboard.postJob.requiresVehicle",
                          "Requires a vehicle / truck",
                        )}
                      </span>
                    </label>
                    <label className="relative inline-flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={requiresDriverLicense}
                        onChange={(e) =>
                          setRequiresDriverLicense(e.target.checked)
                        }
                      />
                      <div className="peer h-6 w-11 rounded-full bg-[var(--border-color)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[var(--primary)] peer-checked:after:translate-x-full" />
                      <span className="text-sm text-[var(--foreground)]">
                        {t(
                          "employerDashboard.postJob.requiresDriverLicense",
                          "Requires a driving license",
                        )}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Provider verification warnings */}
                {(requiresVehicle || requiresDriverLicense) &&
                  candidateData && (
                    <>
                      {requiresVehicle &&
                        candidateData.hasVerifiedVehicle === false && (
                          <div className="flex items-start gap-3 rounded-xl border border-[var(--alert-red)]/30 bg-[var(--alert-red)]/5 p-4">
                            <svg
                              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--alert-red)]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                              />
                            </svg>
                            <p className="text-sm text-[var(--alert-red)]">
                              {t(
                                "employerDashboard.instantJob.providerMissingVehicle",
                                "This provider does not have a verified vehicle yet. You can still send the request, but the provider may not be able to fulfil this requirement.",
                              )}
                            </p>
                          </div>
                        )}
                      {requiresDriverLicense &&
                        candidateData.hasVerifiedDriversLicense === false &&
                        candidateData.hasVerifiedVehicle !== true && (
                          <div className="flex items-start gap-3 rounded-xl border border-[var(--alert-red)]/30 bg-[var(--alert-red)]/5 p-4">
                            <svg
                              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--alert-red)]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                              />
                            </svg>
                            <p className="text-sm text-[var(--alert-red)]">
                              {t(
                                "employerDashboard.instantJob.providerMissingLicense",
                                "This provider does not have a verified driver's license yet. You can still send the request, but the provider may not be able to fulfil this requirement.",
                              )}
                            </p>
                          </div>
                        )}

                      {/* General driving requirement hint */}
                      {((requiresVehicle &&
                        candidateData.hasVerifiedVehicle === false) ||
                        (requiresDriverLicense &&
                          candidateData.hasVerifiedDriversLicense === false &&
                          candidateData.hasVerifiedVehicle !== true)) && (
                        <div className="flex items-start gap-3 rounded-xl border border-[#C9963F]/30 bg-[#C9963F]/5 p-4">
                          <svg
                            className="mt-0.5 h-5 w-5 shrink-0 text-[#C9963F]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                            />
                          </svg>
                          <p className="text-sm text-[var(--foreground)]">
                            {t(
                              "employerDashboard.instantJob.drivingRequirementsHint",
                              "This provider must have a verified vehicle or driver's license to fulfil driving requirements. The request can still be sent.",
                            )}
                          </p>
                        </div>
                      )}
                    </>
                  )}
              </>
            )}
          </div>
        </section>

        {/* -- Continue to Review -- */}
        <div className="flex items-center justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-[var(--muted-text)] transition-colors hover:text-[var(--foreground)]"
          >
            {t("employerDashboard.postJob.cancel", "Cancel")}
          </button>
          <button
            type="button"
            disabled={isRestrictedSector}
            onClick={handleContinueToReview}
            className="flex items-center gap-2 rounded-xl bg-[#C9963F] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#B8822A] disabled:opacity-50"
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
                d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
              />
            </svg>
            {t(
              "employerDashboard.instantJob.continueToReview",
              "Continue to Review",
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs text-[var(--muted-text)]">{label}</span>
      <span className="text-right text-sm font-medium text-[var(--foreground)]">
        {value}
      </span>
    </div>
  );
}
