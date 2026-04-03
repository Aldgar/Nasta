"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../../../lib/api";

interface DeletionRequest {
  id: string;
  ticketNumber?: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  reason?: string;
  createdAt: string;
  reviewedAt?: string;
  adminNotes?: string;
  assignedTo?: string;
  assignedAt?: string;
  user: {
    id: string;
    publicId?: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
}

export default function AdminDeletionsPage() {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"all" | "mine" | "unassigned">("all");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: "approve" | "deny" } | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ scope });
    if (statusFilter) params.set("status", statusFilter);
    const res = await api<DeletionRequest[]>(`/admin/users/deletion-requests?${params}`);
    if (res.data) setRequests(res.data);
    setLoading(false);
  }, [scope, statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async (id: string, action: "approve" | "deny") => {
    setActionLoading(id);
    await api(`/admin/users/deletion-requests/${id}/${action}`, {
      method: "POST",
      body: { notes: adminNotes || undefined },
    });
    setActionLoading(null);
    setNoteModal(null);
    setAdminNotes("");
    fetchRequests();
  };

  const handleAssign = async (id: string) => {
    setActionLoading(id);
    await api(`/admin/users/deletion-requests/${id}/assign`, { method: "POST" });
    setActionLoading(null);
    fetchRequests();
  };

  const handleUnassign = async (id: string) => {
    setActionLoading(id);
    await api(`/admin/users/deletion-requests/${id}/unassign`, { method: "POST" });
    setActionLoading(null);
    fetchRequests();
  };

  const statusColor = (s: string) => {
    if (s === "PENDING") return "bg-yellow-500/20 text-yellow-300";
    if (s === "APPROVED") return "bg-red-500/20 text-red-300";
    if (s === "DENIED") return "bg-green-500/20 text-green-300";
    return "bg-[var(--surface-alt)] text-[var(--muted-text)]";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Deletion Requests</h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            Review and manage account deletion requests (GDPR)
          </p>
        </div>
        <span className="rounded-full bg-[var(--primary)]/20 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
          {requests.length} request{requests.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters */}
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
        <div className="flex rounded-lg border border-[var(--border-color)] bg-[var(--surface)] overflow-hidden">
          {["PENDING", "APPROVED", "DENIED", ""].map((s) => (
            <button
              key={s || "all-status"}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-[var(--primary)] text-white" : "text-[var(--muted-text)] hover:bg-[var(--surface-alt)]"}`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-12 text-center">
          <p className="text-[var(--muted-text)]">No deletion requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--primary)]/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      {req.user.firstName} {req.user.lastName}
                    </h3>
                    {req.ticketNumber && (
                      <span className="rounded-full bg-[var(--surface-alt)] px-2.5 py-0.5 text-[10px] font-mono font-medium text-[var(--muted-text)]">
                        {req.ticketNumber}
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColor(req.status)}`}>
                      {req.status}
                    </span>
                    <span className="rounded-full bg-[var(--surface-alt)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--muted-text)]">
                      {req.user.role === "JOB_SEEKER" ? "Service Provider" : req.user.role === "EMPLOYER" ? "Employer" : req.user.role}
                    </span>
                    {!req.user.isActive && (
                      <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-300">Inactive</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted-text)]">{req.user.email}</p>
                  {req.reason && (
                    <p className="mt-2 text-sm text-[var(--foreground)]/80 leading-relaxed">
                      <span className="font-medium text-[var(--muted-text)]">Reason:</span> {req.reason}
                    </p>
                  )}
                  {req.adminNotes && (
                    <p className="mt-1 text-sm text-[var(--soft-blue)]">
                      <span className="font-medium">Admin notes:</span> {req.adminNotes}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-[10px] text-[var(--muted-text)]">
                    <span>Created: {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    {req.reviewedAt && <span>Reviewed: {new Date(req.reviewedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>}
                    {req.assignedTo && <span>Assigned</span>}
                  </div>
                </div>

                {req.status === "PENDING" && (
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {!req.assignedTo ? (
                      <button
                        onClick={() => handleAssign(req.id)}
                        disabled={actionLoading === req.id}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--primary)]/20 disabled:opacity-50"
                      >
                        Assign to me
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnassign(req.id)}
                        disabled={actionLoading === req.id}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--muted-text)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50"
                      >
                        Unassign
                      </button>
                    )}
                    <button
                      onClick={() => { setNoteModal({ id: req.id, action: "approve" }); setAdminNotes(""); }}
                      disabled={actionLoading === req.id}
                      className="rounded-lg bg-[var(--alert-red)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => { setNoteModal({ id: req.id, action: "deny" }); setAdminNotes(""); }}
                      disabled={actionLoading === req.id}
                      className="rounded-lg bg-[var(--achievement-green)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin notes modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {noteModal.action === "approve" ? "Approve Deletion" : "Deny Deletion"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-text)]">
              {noteModal.action === "approve"
                ? "This will permanently deactivate the user's account."
                : "This will reactivate the user's account and deny their request."}
            </p>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes (optional)"
              rows={3}
              className="mt-4 w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => { setNoteModal(null); setAdminNotes(""); }}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(noteModal.id, noteModal.action)}
                disabled={actionLoading === noteModal.id}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 ${noteModal.action === "approve" ? "bg-[var(--alert-red)]" : "bg-[var(--achievement-green)]"}`}
              >
                {actionLoading === noteModal.id ? "Processing..." : noteModal.action === "approve" ? "Confirm Approve" : "Confirm Deny"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
