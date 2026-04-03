"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, API_BASE } from "../../../../lib/api";

interface KYCVerification {
  id: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  verificationType: string;
  status: string;
  assignedTo?: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  documentNumber?: string;
  documentCountry?: string;
  documentExpiry?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminKYCPage() {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"all" | "mine" | "unassigned">("all");
  const [selectedVerification, setSelectedVerification] =
    useState<KYCVerification | null>(null);
  const [reviewAction, setReviewAction] = useState<
    "APPROVED" | "REJECTED" | null
  >(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    const statuses =
      scope === "unassigned"
        ? "MANUAL_REVIEW"
        : "PENDING,IN_PROGRESS,MANUAL_REVIEW";
    const res = await api<KYCVerification[]>(
      `/kyc/admin/list?statuses=${statuses}`,
    );
    if (res.data) {
      let items = Array.isArray(res.data) ? res.data : [];
      if (scope === "unassigned") {
        items = items.filter((item) => !item.assignedTo);
      }
      setVerifications(items);
    } else {
      setVerifications([]);
    }
    setLoading(false);
  }, [scope]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleReview = async () => {
    if (!selectedVerification || !reviewAction) return;
    setActionLoading(true);
    await api(`/kyc/admin/${selectedVerification.id}/review`, {
      method: "POST",
      body: { decision: reviewAction, notes: reviewNotes || undefined },
    });
    setActionLoading(false);
    setSelectedVerification(null);
    setReviewAction(null);
    setReviewNotes("");
    fetchVerifications();
  };

  const resolveUrl = (raw?: string) => {
    if (!raw) return "";
    if (raw.startsWith("http")) return raw;
    return `${API_BASE.replace(/\/+$/, "")}/${raw.startsWith("/") ? raw.slice(1) : raw}`;
  };

  const statusColor = (s: string) => {
    if (s === "PENDING") return "bg-yellow-500/20 text-yellow-300";
    if (s === "IN_PROGRESS") return "bg-blue-500/20 text-blue-300";
    if (s === "MANUAL_REVIEW") return "bg-orange-500/20 text-orange-300";
    if (s === "APPROVED" || s === "VERIFIED")
      return "bg-green-500/20 text-green-300";
    if (s === "REJECTED" || s === "FAILED") return "bg-red-500/20 text-red-300";
    return "bg-[var(--surface-alt)] text-[var(--muted-text)]";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            KYC Reviews
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            Review and approve identity verification submissions.
          </p>
        </div>
        <span className="rounded-full bg-[var(--primary)]/20 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
          {verifications.length} verification
          {verifications.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Scope filter */}
      <div className="flex flex-wrap gap-3">
        <div className="flex rounded-lg border border-[var(--border-color)] bg-[var(--surface)] overflow-hidden">
          {(["all", "mine", "unassigned"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-4 py-2 text-xs font-medium capitalize transition-colors ${scope === s ? "bg-[var(--primary)] text-white" : "text-[var(--muted-text)] hover:bg-[var(--surface-alt)]"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : verifications.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-12 text-center">
          <p className="text-[var(--muted-text)]">No verifications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {verifications.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVerification(v)}
              className="cursor-pointer rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--primary)]/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      {v.user
                        ? `${v.user.firstName || ""} ${v.user.lastName || ""}`.trim() ||
                          "Unknown User"
                        : "Unknown User"}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColor(v.status)}`}
                    >
                      {v.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted-text)]">
                    {v.user?.email || "N/A"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--foreground)]/70">
                    Type: {v.verificationType?.replace("_", " ") || "N/A"}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-[10px] text-[var(--muted-text)]">
                    <span>
                      Submitted:{" "}
                      {new Date(v.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {v.documentCountry && (
                      <span>Country: {v.documentCountry}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-[var(--muted-text)]">
                  View details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail / Review modal */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--foreground)]">
                  KYC Verification Detail
                </h2>
                <p className="text-sm text-[var(--muted-text)]">
                  {selectedVerification.user?.firstName}{" "}
                  {selectedVerification.user?.lastName} —{" "}
                  {selectedVerification.user?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedVerification(null);
                  setReviewAction(null);
                  setReviewNotes("");
                }}
                className="text-[var(--muted-text)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            {/* Status & Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-[var(--background)] p-3">
                <p className="text-[10px] uppercase text-[var(--muted-text)]">
                  Status
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColor(selectedVerification.status)}`}
                >
                  {selectedVerification.status.replace("_", " ")}
                </span>
              </div>
              <div className="rounded-lg bg-[var(--background)] p-3">
                <p className="text-[10px] uppercase text-[var(--muted-text)]">
                  Type
                </p>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {selectedVerification.verificationType?.replace("_", " ")}
                </p>
              </div>
              {selectedVerification.documentNumber && (
                <div className="rounded-lg bg-[var(--background)] p-3">
                  <p className="text-[10px] uppercase text-[var(--muted-text)]">
                    Document Number
                  </p>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {selectedVerification.documentNumber}
                  </p>
                </div>
              )}
              {selectedVerification.documentCountry && (
                <div className="rounded-lg bg-[var(--background)] p-3">
                  <p className="text-[10px] uppercase text-[var(--muted-text)]">
                    Country
                  </p>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {selectedVerification.documentCountry}
                  </p>
                </div>
              )}
              {selectedVerification.documentExpiry && (
                <div className="rounded-lg bg-[var(--background)] p-3">
                  <p className="text-[10px] uppercase text-[var(--muted-text)]">
                    Expiry
                  </p>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {selectedVerification.documentExpiry}
                  </p>
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-[var(--foreground)] mb-2">
                Documents
              </p>
              <div className="grid grid-cols-3 gap-3">
                {selectedVerification.documentFrontUrl && (
                  <div>
                    <p className="text-[10px] text-[var(--muted-text)] mb-1">
                      Front
                    </p>
                    <img
                      src={resolveUrl(selectedVerification.documentFrontUrl)}
                      alt="Front"
                      className="w-full rounded-lg border border-[var(--border-color)] object-cover aspect-[4/3]"
                    />
                  </div>
                )}
                {selectedVerification.documentBackUrl && (
                  <div>
                    <p className="text-[10px] text-[var(--muted-text)] mb-1">
                      Back
                    </p>
                    <img
                      src={resolveUrl(selectedVerification.documentBackUrl)}
                      alt="Back"
                      className="w-full rounded-lg border border-[var(--border-color)] object-cover aspect-[4/3]"
                    />
                  </div>
                )}
                {selectedVerification.selfieUrl && (
                  <div>
                    <p className="text-[10px] text-[var(--muted-text)] mb-1">
                      Selfie
                    </p>
                    <img
                      src={resolveUrl(selectedVerification.selfieUrl)}
                      alt="Selfie"
                      className="w-full rounded-lg border border-[var(--border-color)] object-cover aspect-[4/3]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Review Actions */}
            {(selectedVerification.status === "PENDING" ||
              selectedVerification.status === "IN_PROGRESS" ||
              selectedVerification.status === "MANUAL_REVIEW") && (
              <div className="border-t border-[var(--border-color)] pt-4">
                {!reviewAction ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setReviewAction("APPROVED")}
                      className="flex-1 rounded-lg bg-[var(--achievement-green)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setReviewAction("REJECTED")}
                      className="flex-1 rounded-lg bg-[var(--alert-red)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {reviewAction === "APPROVED" ? "Approve" : "Reject"} this
                      verification?
                    </p>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes (optional)"
                      rows={3}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setReviewAction(null);
                          setReviewNotes("");
                        }}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface)]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReview}
                        disabled={actionLoading}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 ${reviewAction === "APPROVED" ? "bg-[var(--achievement-green)]" : "bg-[var(--alert-red)]"}`}
                      >
                        {actionLoading
                          ? "Processing..."
                          : `Confirm ${reviewAction === "APPROVED" ? "Approve" : "Reject"}`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
