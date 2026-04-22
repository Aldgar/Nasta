"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../../../lib/auth";
import { API_BASE } from "../../../lib/api";
import { useLanguage } from "../../../context/LanguageContext";

/* ── Types ─────────────────────────────────────────────────────────── */

type IssueType = "GENERAL" | "REPORT" | "BILLING" | "ACCOUNT" | "VERIFICATION";
type ReportType = "ABUSE" | "SECURITY";
type Tab = "ticket" | "report" | "email";

interface TicketResponse {
  ticket?: { ticketNumber?: string; id?: string };
  message?: string;
}

const ISSUE_TYPES: {
  value: IssueType;
  label: string;
  priority: "NORMAL" | "HIGH";
}[] = [
  { value: "GENERAL", label: "General Support", priority: "NORMAL" },
  { value: "REPORT", label: "Report Bug", priority: "NORMAL" },
  { value: "BILLING", label: "Payment Issues", priority: "HIGH" },
  { value: "ACCOUNT", label: "Login Issues", priority: "HIGH" },
  { value: "VERIFICATION", label: "Verification Issues", priority: "NORMAL" },
];

const REPORT_TYPES: {
  value: ReportType;
  label: string;
  description: string;
}[] = [
  {
    value: "ABUSE",
    label: "Report Abuse",
    description: "Report harassment, fraud, or inappropriate behavior",
  },
  {
    value: "SECURITY",
    label: "Report Security Concerns",
    description: "Report vulnerabilities or security issues",
  },
];

const EMAIL_CATEGORIES = [
  {
    key: "support" as const,
    label: "General Support",
    email: "support@nasta.app",
    description: "Account issues, technical help, or general questions",
  },
  {
    key: "policy" as const,
    label: "Policy & Legal",
    email: "policy@nasta.app",
    description: "Privacy, terms of service, or compliance inquiries",
  },
  {
    key: "feature" as const,
    label: "Feature Request",
    email: "feature-request@nasta.app",
    description: "Suggest improvements or new features for Nasta",
  },
];

/* ── Helpers ────────────────────────────────────────────────────────── */

async function submitTicket(
  formData: FormData,
): Promise<{ data: TicketResponse | null; error: string | null }> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  try {
    const res = await fetch(`${API_BASE}/support/contact`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const isJson = res.headers
      .get("content-type")
      ?.includes("application/json");
    const payload = isJson ? await res.json() : null;
    if (!res.ok)
      return { data: null, error: payload?.message ?? res.statusText };
    return { data: payload, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function SupportPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("ticket");

  /* ── Ticket state ── */
  const [issueType, setIssueType] = useState<IssueType>("GENERAL");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketFiles, setTicketFiles] = useState<File[]>([]);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const ticketFileRef = useRef<HTMLInputElement>(null);

  /* ── Report state ── */
  const [reportType, setReportType] = useState<ReportType>("ABUSE");
  const [reportSubject, setReportSubject] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  /* ── Email state ── */
  const [emailCategory, setEmailCategory] = useState<
    "support" | "policy" | "feature"
  >("support");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  /* ── Handlers ── */
  const handleAddFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setTicketFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
      }
      if (ticketFileRef.current) ticketFileRef.current.value = "";
    },
    [],
  );

  const removeFile = useCallback((index: number) => {
    setTicketFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    setTicketSubmitting(true);
    setTicketError(null);
    setTicketSuccess(null);

    const selected = ISSUE_TYPES.find((t) => t.value === issueType);
    const fd = new FormData();
    fd.append("subject", ticketSubject || selected?.label || "Support Request");
    fd.append("message", ticketMessage);
    fd.append("category", issueType);
    fd.append("priority", selected?.priority ?? "NORMAL");
    if (user?.email) fd.append("email", user.email);
    ticketFiles.forEach((f) => fd.append("files", f));

    const res = await submitTicket(fd);
    setTicketSubmitting(false);

    if (res.error) {
      setTicketError(res.error);
      return;
    }

    const ticketNumber = res.data?.ticket?.ticketNumber;
    setTicketSuccess(
      ticketNumber
        ? t("support.ticketSuccessWithNumber", {
            defaultValue: "Ticket #{{n}} submitted successfully!",
            n: ticketNumber,
          })
        : t("support.ticketSuccess", "Ticket submitted successfully!"),
    );
    setTicketSubject("");
    setTicketMessage("");
    setTicketFiles([]);
    setIssueType("GENERAL");
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportMessage.trim()) return;

    setReportSubmitting(true);
    setReportError(null);
    setReportSuccess(null);

    const fd = new FormData();
    fd.append(
      "subject",
      reportSubject ||
        (reportType === "ABUSE" ? "Abuse Report" : "Security Concern"),
    );
    fd.append("message", reportMessage);
    fd.append("category", reportType);
    fd.append("priority", "HIGH");
    if (user?.email) fd.append("email", user.email);

    const res = await submitTicket(fd);
    setReportSubmitting(false);

    if (res.error) {
      setReportError(res.error);
      return;
    }

    const ticketNumber = res.data?.ticket?.ticketNumber;
    setReportSuccess(
      ticketNumber
        ? t("support.reportSuccessWithNumber", {
            defaultValue: "Report #{{n}} filed successfully.",
            n: ticketNumber,
          })
        : t("support.reportSuccess", "Report filed successfully."),
    );
    setReportSubject("");
    setReportMessage("");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailMessage.trim() || !emailSubject.trim()) return;

    const cfg = EMAIL_CATEGORIES.find((c) => c.key === emailCategory);
    if (!cfg) return;

    setEmailSubmitting(true);
    setEmailError(null);
    setEmailSuccess(null);

    const categoryMap: Record<string, string> = {
      support: "GENERAL",
      policy: "ACCOUNT",
      feature: "GENERAL",
    };
    const fd = new FormData();
    fd.append("subject", `[${cfg.label}] ${emailSubject}`);
    fd.append("message", emailMessage);
    fd.append("category", categoryMap[emailCategory] ?? "GENERAL");
    fd.append("priority", "NORMAL");
    if (user?.email) fd.append("email", user.email);
    if (user?.firstName)
      fd.append(
        "name",
        [user.firstName, user.lastName].filter(Boolean).join(" "),
      );

    const res = await submitTicket(fd);
    setEmailSubmitting(false);

    if (res.error) {
      setEmailError(res.error);
      return;
    }

    const ticketNumber = res.data?.ticket?.ticketNumber;
    setEmailSuccess(
      ticketNumber
        ? t("support.emailSuccessWithNumber", {
            defaultValue:
              "Message sent! Ticket #{{n}} created. We'll respond to {{email}} inquiries within 24 hours.",
            n: ticketNumber,
            email: cfg.email,
          })
        : t(
            "support.emailSuccessShort",
            "Message sent! We'll get back to you shortly.",
          ),
    );
    setEmailSubject("");
    setEmailMessage("");
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "ticket",
      label: t("support.submitTicket", "Submit Ticket"),
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
          />
        </svg>
      ),
    },
    {
      id: "report",
      label: t("support.report", "Report"),
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
          />
        </svg>
      ),
    },
    {
      id: "email",
      label: t("support.emailUs", "Email Us"),
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          {t("support.helpCenter", "Help Center")}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
          {t("support.title", "Support")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          {t(
            "support.howCanWeHelpYou",
            "How can we help you? Submit a ticket and our team will get back to you.",
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-1">
        {TABS.map((tabDef) => (
          <button
            key={tabDef.id}
            onClick={() => setTab(tabDef.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              tab === tabDef.id
                ? "bg-[var(--primary)]/15 text-[var(--primary)] shadow-sm"
                : "text-[var(--muted-text)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
            }`}
          >
            {tabDef.icon}
            {tabDef.label}
          </button>
        ))}
      </div>

      {/* ────── SUBMIT TICKET TAB ────── */}
      {tab === "ticket" && (
        <form onSubmit={handleSubmitTicket} className="space-y-5">
          {/* Success banner */}
          {ticketSuccess && (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--achievement-green)]/30 bg-[var(--achievement-green)]/10 p-4">
              <svg
                className="h-5 w-5 shrink-0 text-[var(--achievement-green)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-[var(--achievement-green)]">
                  {ticketSuccess}
                </p>
                <p className="text-xs text-[var(--muted-text)]">
                  {t(
                    "support.willReviewTicket",
                    "We will review your ticket and respond within 24 hours.",
                  )}
                </p>
              </div>
              <button
                onClick={() => setTicketSuccess(null)}
                className="ml-auto text-[var(--muted-text)] hover:text-[var(--foreground)]"
              >
                &times;
              </button>
            </div>
          )}

          {ticketError && (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--alert-red)]/30 bg-[var(--alert-red)]/10 p-4">
              <svg
                className="h-5 w-5 shrink-0 text-[var(--alert-red)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <p className="text-sm text-[var(--alert-red)]">{ticketError}</p>
              <button
                onClick={() => setTicketError(null)}
                className="ml-auto text-[var(--muted-text)] hover:text-[var(--foreground)]"
              >
                &times;
              </button>
            </div>
          )}

          {/* Issue type selector */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                {t("support.issueType", "Issue Type")} *
              </label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ISSUE_TYPES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIssueType(opt.value)}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      issueType === opt.value
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-sm"
                        : "border-[var(--border-color)] bg-[var(--surface-alt)] hover:border-[var(--primary)]/30"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${issueType === opt.value ? "bg-[var(--primary)]" : "bg-[var(--muted-text)]/40"}`}
                    />
                    <span
                      className={`text-sm font-medium ${issueType === opt.value ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}
                    >
                      {t(`support.issueLabel.${opt.value}`, opt.label)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t("support.subject", "Subject")}
              </label>
              <input
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder={t(
                  "support.briefDescription",
                  "Brief description of your issue",
                )}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--foreground)]">
                {t("support.describeYourIssue", "Describe your issue")} *
              </label>
              <textarea
                required
                rows={5}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder={t(
                  "support.provideDetailsAboutIssue",
                  "Provide details about your issue...",
                )}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 resize-none"
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                {t("support.attachments", "Attachments")} (
                {t("support.optional", "Optional")})
              </label>
              <p className="mb-3 text-xs text-[var(--muted-text)]">
                {t(
                  "support.attachmentsHint",
                  "Add screenshots, photos, or files to help us understand your issue better.",
                )}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => ticketFileRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--muted-text)] transition-all hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                    />
                  </svg>
                  {t("support.addFiles", "Add files")}
                </button>

                {ticketFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-2 text-xs"
                  >
                    <svg
                      className="h-4 w-4 shrink-0 text-[var(--primary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    <span className="max-w-[120px] truncate text-[var(--foreground)]">
                      {f.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="ml-1 text-[var(--muted-text)] hover:text-[var(--alert-red)]"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <input
                ref={ticketFileRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleAddFiles}
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-5">
              {user?.email && (
                <p className="text-xs text-[var(--muted-text)]">
                  {t("support.submittingAs", "Submitting as")}{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {user.email}
                  </span>
                </p>
              )}
              <button
                type="submit"
                disabled={ticketSubmitting || !ticketMessage.trim()}
                className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--soft-blue)] hover:shadow-lg hover:shadow-[var(--primary)]/20 disabled:opacity-50"
              >
                {ticketSubmitting && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                    />
                  </svg>
                )}
                {ticketSubmitting
                  ? t("support.submitting", "Submitting...")
                  : t("support.submitTicket", "Submit Ticket")}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ────── REPORT TAB ────── */}
      {tab === "report" && (
        <form onSubmit={handleSubmitReport} className="space-y-5">
          {reportSuccess && (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--achievement-green)]/30 bg-[var(--achievement-green)]/10 p-4">
              <svg
                className="h-5 w-5 shrink-0 text-[var(--achievement-green)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-[var(--achievement-green)]">
                  {reportSuccess}
                </p>
                <p className="text-xs text-[var(--muted-text)]">
                  {t(
                    "support.thankYouReport",
                    "Thank you for helping keep our platform safe.",
                  )}
                </p>
              </div>
              <button
                onClick={() => setReportSuccess(null)}
                className="ml-auto text-[var(--muted-text)] hover:text-[var(--foreground)]"
              >
                &times;
              </button>
            </div>
          )}

          {reportError && (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--alert-red)]/30 bg-[var(--alert-red)]/10 p-4">
              <svg
                className="h-5 w-5 shrink-0 text-[var(--alert-red)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <p className="text-sm text-[var(--alert-red)]">{reportError}</p>
              <button
                onClick={() => setReportError(null)}
                className="ml-auto text-[var(--muted-text)] hover:text-[var(--foreground)]"
              >
                &times;
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 space-y-5">
            <div>
              <p className="mb-1 text-sm font-semibold text-[var(--foreground)]">
                {t("support.whatToReport", "What would you like to report?")}
              </p>
              <p className="mb-3 text-xs text-[var(--muted-text)]">
                {t(
                  "support.reportsHighPriority",
                  "All reports are treated as high priority and reviewed by our team.",
                )}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {REPORT_TYPES.map((rt) => (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => setReportType(rt.value)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      reportType === rt.value
                        ? "border-[var(--alert-red)]/40 bg-[var(--alert-red)]/5 shadow-sm"
                        : "border-[var(--border-color)] bg-[var(--surface-alt)] hover:border-[var(--alert-red)]/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className={`h-4 w-4 ${reportType === rt.value ? "text-[var(--alert-red)]" : "text-[var(--muted-text)]"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                      <span
                        className={`text-sm font-semibold ${reportType === rt.value ? "text-[var(--alert-red)]" : "text-[var(--foreground)]"}`}
                      >
                        {t(`support.reportLabel.${rt.value}`, rt.label)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted-text)]">
                      {t(`support.reportDesc.${rt.value}`, rt.description)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t("support.reportTitle", "Title")}
              </label>
              <input
                type="text"
                value={reportSubject}
                onChange={(e) => setReportSubject(e.target.value)}
                placeholder={
                  reportType === "ABUSE"
                    ? t(
                        "support.whoReporting",
                        "Who or what are you reporting?",
                      )
                    : t(
                        "support.whatSecurityIssue",
                        "What security issue did you find?",
                      )
                }
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[var(--foreground)]">
                {t("support.details", "Details")} *
              </label>
              <textarea
                required
                rows={5}
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                placeholder={t(
                  "support.provideAsMuchDetail",
                  "Please provide as much detail as possible...",
                )}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 resize-none"
              />
            </div>

            <div className="flex justify-end border-t border-[var(--border-color)] pt-5">
              <button
                type="submit"
                disabled={reportSubmitting || !reportMessage.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--alert-red)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              >
                {reportSubmitting && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                    />
                  </svg>
                )}
                {reportSubmitting
                  ? t("support.filingReport", "Filing report...")
                  : t("support.submitReport", "Submit Report")}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ────── EMAIL US TAB ────── */}
      {tab === "email" && (
        <div className="space-y-5">
          {emailSuccess && (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--achievement-green)]/30 bg-[var(--achievement-green)]/10 p-4">
              <svg
                className="h-5 w-5 shrink-0 text-[var(--achievement-green)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-[var(--achievement-green)]">
                  {emailSuccess}
                </p>
                <p className="text-xs text-[var(--muted-text)]">
                  {t(
                    "support.teamWillReview",
                    "Our team will review your message and respond shortly.",
                  )}
                </p>
              </div>
              <button
                onClick={() => setEmailSuccess(null)}
                className="ml-auto text-[var(--muted-text)] hover:text-[var(--foreground)]"
              >
                &times;
              </button>
            </div>
          )}

          {emailError && (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--alert-red)]/30 bg-[var(--alert-red)]/10 p-4">
              <svg
                className="h-5 w-5 shrink-0 text-[var(--alert-red)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <p className="text-sm text-[var(--alert-red)]">{emailError}</p>
              <button
                onClick={() => setEmailError(null)}
                className="ml-auto text-[var(--muted-text)] hover:text-[var(--foreground)]"
              >
                &times;
              </button>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            {EMAIL_CATEGORIES.map((cfg) => (
              <button
                key={cfg.key}
                onClick={() => setEmailCategory(cfg.key)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  emailCategory === cfg.key
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-md shadow-[var(--primary)]/5"
                    : "border-[var(--border-color)] bg-[var(--surface)] hover:border-[var(--primary)]/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${emailCategory === cfg.key ? "bg-[var(--primary)]" : "bg-[var(--muted-text)]"}`}
                  />
                  <span
                    className={`text-sm font-semibold ${emailCategory === cfg.key ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}
                  >
                    {t(`support.emailCategory.${cfg.key}.label`, cfg.label)}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-[var(--muted-text)]">
                  {t(`support.emailCategory.${cfg.key}.desc`, cfg.description)}
                </p>
              </button>
            ))}
          </div>

          <form
            onSubmit={handleEmailSubmit}
            className="space-y-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6"
          >
            <div className="flex items-center gap-2 text-xs text-[var(--muted-text)]">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              {t("support.regarding", "Regarding:")}{" "}
              <span className="font-medium text-[var(--foreground)]">
                {EMAIL_CATEGORIES.find((c) => c.key === emailCategory)?.email}
              </span>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t("support.subject", "Subject")} *
              </label>
              <input
                type="text"
                required
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder={t(
                  "support.briefInquiry",
                  "Brief description of your inquiry",
                )}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t("support.message", "Message")} *
              </label>
              <textarea
                required
                rows={6}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder={t(
                  "support.describeInDetail",
                  "Describe your issue or request in detail...",
                )}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 resize-none"
              />
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-5">
              {user?.email && (
                <p className="text-xs text-[var(--muted-text)]">
                  {t("support.sendingAs", "Sending as")}{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {user.email}
                  </span>
                </p>
              )}
              <button
                type="submit"
                disabled={
                  emailSubmitting ||
                  !emailMessage.trim() ||
                  !emailSubject.trim()
                }
                className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--soft-blue)] hover:shadow-lg hover:shadow-[var(--primary)]/20 disabled:opacity-50"
              >
                {emailSubmitting && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                    />
                  </svg>
                )}
                {emailSubmitting
                  ? t("support.sending", "Sending...")
                  : t("support.sendMessage", "Send Message")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── FAQ & Resources ── */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          {t("support.lookingForAnswers", "Looking for answers?")}
        </h3>
        <p className="mt-1 text-xs text-[var(--muted-text)]">
          {t(
            "support.checkResources",
            "Check our resources for quick solutions before submitting a ticket.",
          )}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/dashboard/faq"
            className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-2 text-xs font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
          >
            {t("web.nav.faq", "FAQs")}
          </Link>
          <Link
            href="/dashboard/how-it-works"
            className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-2 text-xs font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
          >
            {t("web.nav.howItWorks", "How it Works")}
          </Link>
          <Link
            href="/dashboard/terms"
            className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-2 text-xs font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
          >
            {t("web.nav.termsOfService", "Terms of Service")}
          </Link>
          <Link
            href="/dashboard/privacy"
            className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-2 text-xs font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
          >
            {t("web.nav.privacyPolicy", "Privacy Policy")}
          </Link>
        </div>
      </div>
    </div>
  );
}
