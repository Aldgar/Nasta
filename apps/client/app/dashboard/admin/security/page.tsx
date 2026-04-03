"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../../../lib/api";

interface SupportTicket {
  id: string;
  ticketNumber?: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  userId?: string;
  user?: {
    id: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
  };
  name?: string;
  email?: string;
  assignedTo?: string;
  resolution?: string;
  createdAt: string;
}

export default function AdminSecurityPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"all" | "mine" | "unassigned">("all");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [resolution, setResolution] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ scope, category: "SECURITY" });
    if (statusFilter) params.set("status", statusFilter);
    const res = await api<{ tickets: SupportTicket[] }>(
      `/support/admin/tickets?${params}`,
    );
    if (res.data) {
      setTickets(res.data.tickets || []);
    } else {
      setTickets([]);
    }
    setLoading(false);
  }, [scope, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleAssign = async (id: string) => {
    setActionLoading(id);
    await api(`/support/admin/tickets/${id}/assign`, { method: "POST" });
    setActionLoading(null);
    fetchTickets();
  };

  const handleResolve = async () => {
    if (!selectedTicket) return;
    setActionLoading(selectedTicket.id);
    await api(`/support/admin/tickets/${selectedTicket.id}/resolve`, {
      method: "POST",
      body: { resolution },
    });
    setActionLoading(null);
    setSelectedTicket(null);
    setResolution("");
    fetchTickets();
  };

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id);
    await api(`/support/admin/tickets/${id}/status`, {
      method: "POST",
      body: { status },
    });
    setActionLoading(null);
    fetchTickets();
  };

  const priorityColor = (p: string) => {
    if (p === "URGENT") return "bg-red-500/20 text-red-300";
    if (p === "HIGH") return "bg-orange-500/20 text-orange-300";
    if (p === "NORMAL") return "bg-yellow-500/20 text-yellow-300";
    return "bg-[var(--surface-alt)] text-[var(--muted-text)]";
  };

  const statusColorFn = (s: string) => {
    if (s === "OPEN") return "bg-yellow-500/20 text-yellow-300";
    if (s === "IN_PROGRESS") return "bg-blue-500/20 text-blue-300";
    if (s === "RESOLVED") return "bg-green-500/20 text-green-300";
    if (s === "CLOSED")
      return "bg-[var(--surface-alt)] text-[var(--muted-text)]";
    return "bg-[var(--surface-alt)] text-[var(--muted-text)]";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Security Reports
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            Review and manage security incident reports.
          </p>
        </div>
        <span className="rounded-full bg-[var(--warm-coral)]/20 px-3 py-1 text-xs font-semibold text-[var(--warm-coral)]">
          {tickets.length} report{tickets.length !== 1 ? "s" : ""}
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
          {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", ""].map((s) => (
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
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-12 text-center">
          <p className="text-[var(--muted-text)]">No security reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--warm-coral)]/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    {ticket.ticketNumber && (
                      <span className="rounded-full bg-[var(--surface-alt)] px-2.5 py-0.5 text-[10px] font-mono font-medium text-[var(--muted-text)]">
                        {ticket.ticketNumber}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColorFn(ticket.status)}`}
                    >
                      {ticket.status}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${priorityColor(ticket.priority)}`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                    {ticket.subject}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--muted-text)]">
                    {ticket.user
                      ? `${ticket.user.firstName || ""} ${ticket.user.lastName || ""}`.trim() ||
                        ticket.user.email
                      : ticket.name || "Anonymous"}
                    {(ticket.user?.email || ticket.email) &&
                      ` (${ticket.user?.email || ticket.email})`}
                    {ticket.user?.phone && ` · ${ticket.user.phone}`}
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]/70 line-clamp-3">
                    {ticket.message}
                  </p>
                  {ticket.resolution && (
                    <p className="mt-1 text-sm text-[var(--achievement-green)]">
                      <span className="font-medium">Resolution:</span>{" "}
                      {ticket.resolution}
                    </p>
                  )}
                  <div className="mt-2 text-[10px] text-[var(--muted-text)]">
                    Reported:{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {ticket.assignedTo && (
                      <span className="ml-3">Assigned</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  {!ticket.assignedTo && ticket.status === "OPEN" && (
                    <button
                      onClick={() => handleAssign(ticket.id)}
                      disabled={actionLoading === ticket.id}
                      className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--primary)]/20 disabled:opacity-50"
                    >
                      Assign to me
                    </button>
                  )}
                  {ticket.status !== "RESOLVED" &&
                    ticket.status !== "CLOSED" && (
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setResolution("");
                        }}
                        className="rounded-lg bg-[var(--achievement-green)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                      >
                        Resolve
                      </button>
                    )}
                  {ticket.status === "OPEN" && (
                    <button
                      onClick={() =>
                        handleStatusChange(ticket.id, "IN_PROGRESS")
                      }
                      disabled={actionLoading === ticket.id}
                      className="rounded-lg bg-[var(--soft-blue)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      In Progress
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Resolve Security Report
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-text)]">
              {selectedTicket.subject}
            </p>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe the resolution and actions taken..."
              rows={4}
              className="mt-4 w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setResolution("");
                }}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={
                  !resolution.trim() || actionLoading === selectedTicket.id
                }
                className="rounded-lg bg-[var(--achievement-green)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {actionLoading === selectedTicket.id
                  ? "Processing..."
                  : "Resolve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
