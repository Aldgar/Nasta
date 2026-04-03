"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../../../lib/api";

interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  adminCapabilities: string[];
  createdAt: string;
}

const ADMIN_CAPABILITIES = [
  "SUPER_ADMIN",
  "BACKGROUND_CHECK_REVIEWER",
  "DELETION_REQUEST_REVIEWER",
  "SUPPORT",
];

export default function AdminManageAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    adminCapabilities: [] as string[],
  });
  const [formError, setFormError] = useState("");

  // Check if current user is SUPER_ADMIN
  useEffect(() => {
    (async () => {
      const res = await api<{
        admin?: { adminCapabilities?: string[] };
        adminCapabilities?: string[];
      }>("/auth/admin/whoami");
      if (res.data) {
        const admin = res.data.admin || res.data;
        const caps =
          (admin as { adminCapabilities?: string[] }).adminCapabilities || [];
        setIsSuperAdmin(Array.isArray(caps) && caps.includes("SUPER_ADMIN"));
      }
    })();
  }, []);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    const res = await api<{ admins: Admin[] }>("/auth/admin/list");
    if (res.data) setAdmins(res.data.admins || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const toggleCapability = (cap: string) => {
    setFormData((prev) => ({
      ...prev,
      adminCapabilities: prev.adminCapabilities.includes(cap)
        ? prev.adminCapabilities.filter((c) => c !== cap)
        : [...prev.adminCapabilities, cap],
    }));
  };

  const handleCreateAdmin = async () => {
    setFormError("");
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (formData.adminCapabilities.length === 0) {
      setFormError("Please select at least one capability.");
      return;
    }

    let caps = formData.adminCapabilities;
    if (!isSuperAdmin) {
      caps = caps.filter((c) => c !== "SUPER_ADMIN");
      if (caps.length === 0) {
        setFormError("Please select at least one capability.");
        return;
      }
    }

    setIsCreating(true);
    const res = await api("/auth/admin/create", {
      method: "POST",
      body: {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        adminCapabilities: caps,
      },
    });
    setIsCreating(false);

    if (res.error) {
      setFormError(res.error);
      return;
    }

    setShowAddModal(false);
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      adminCapabilities: [],
    });
    fetchAdmins();
  };

  const handleDeleteAdmin = async (admin: Admin) => {
    setDeletingId(admin.id);
    await api(`/auth/admin/${admin.id}/delete`, { method: "POST" });
    setDeletingId(null);
    setConfirmDelete(null);
    fetchAdmins();
  };

  const capColor = (cap: string) => {
    if (cap === "SUPER_ADMIN") return "bg-purple-500/20 text-purple-300";
    if (cap === "BACKGROUND_CHECK_REVIEWER")
      return "bg-blue-500/20 text-blue-300";
    if (cap === "DELETION_REQUEST_REVIEWER")
      return "bg-orange-500/20 text-orange-300";
    if (cap === "SUPPORT") return "bg-green-500/20 text-green-300";
    return "bg-[var(--surface-alt)] text-[var(--muted-text)]";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Manage Admins
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            View admin accounts and manage permissions.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              email: "",
              password: "",
              firstName: "",
              lastName: "",
              adminCapabilities: [],
            });
            setFormError("");
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <span>+</span> Add Admin
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : admins.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-12 text-center">
          <p className="text-[var(--muted-text)]">No admins found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {admins.map((admin) => {
            const targetIsSuperAdmin =
              admin.adminCapabilities.includes("SUPER_ADMIN");
            const canDelete = isSuperAdmin || !targetIsSuperAdmin;
            return (
              <div
                key={admin.id}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--primary)]/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-sm font-semibold text-[var(--foreground)]">
                        {admin.firstName} {admin.lastName}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${admin.isActive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}
                      >
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted-text)]">
                      {admin.email}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {admin.adminCapabilities.map((cap) => (
                        <span
                          key={cap}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${capColor(cap)}`}
                        >
                          {cap.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-[var(--muted-text)]">
                      Created:{" "}
                      {new Date(admin.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    {canDelete ? (
                      <button
                        onClick={() => setConfirmDelete(admin)}
                        disabled={deletingId === admin.id}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {deletingId === admin.id ? "Deleting..." : "Delete"}
                      </button>
                    ) : (
                      <span className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--muted-text)]">
                        🔒 Protected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add admin modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Add New Admin
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[var(--muted-text)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--foreground)]">
                    First Name *
                  </label>
                  <input
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, firstName: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--foreground)]">
                    Last Name *
                  </label>
                  <input
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, lastName: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--foreground)]">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--foreground)]">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, password: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                  placeholder="Min 8 characters"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-[var(--foreground)]">
                  Capabilities *
                </label>
                <div className="flex flex-wrap gap-2">
                  {ADMIN_CAPABILITIES.filter(
                    (cap) => isSuperAdmin || cap !== "SUPER_ADMIN",
                  ).map((cap) => (
                    <button
                      key={cap}
                      onClick={() => toggleCapability(cap)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${formData.adminCapabilities.includes(cap) ? "bg-[var(--primary)] text-white" : "border border-[var(--border-color)] bg-[var(--surface-alt)] text-[var(--muted-text)] hover:bg-[var(--surface)]"}`}
                    >
                      {cap.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              {formError && <p className="text-xs text-red-400">{formError}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={isCreating}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Delete Admin
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-text)]">
              Are you sure you want to delete{" "}
              <strong className="text-[var(--foreground)]">
                {confirmDelete.firstName} {confirmDelete.lastName}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAdmin(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="rounded-lg bg-[var(--alert-red)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {deletingId === confirmDelete.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
