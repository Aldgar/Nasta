"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import { useLanguage } from "../../../context/LanguageContext";

interface Notification {
  id: string;
  type:
    | "NEARBY_JOB"
    | "JOB_MESSAGE"
    | "APPLICATION_UPDATE"
    | "SYSTEM"
    | "LEGAL_ACTION"
    | "WARNING"
    | "ACTION_FORM";
  title: string | null;
  body: string | null;
  payload: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

interface NotificationResponse {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
}

type FilterTab = "all" | "unread" | "APPLICATION_UPDATE" | "SYSTEM";

function timeAgo(
  dateStr: string,
  t: (key: string, fallback: string) => string,
): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("notifications.justNow", "Just now");
  if (mins < 60) return `${mins}${t("notifications.minutesAgo", "m ago")}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${t("notifications.hoursAgo", "h ago")}`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}${t("notifications.daysAgo", "d ago")}`;
  if (days < 30)
    return `${Math.floor(days / 7)}${t("notifications.weeksAgo", "w ago")}`;
  return new Date(dateStr).toLocaleDateString();
}

function typeIcon(type: string) {
  switch (type) {
    case "APPLICATION_UPDATE":
      return (
        <svg
          className="h-5 w-5"
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
      );
    case "NEARBY_JOB":
    case "JOB_MESSAGE":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      );
    case "WARNING":
    case "LEGAL_ACTION":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
      );
  }
}

function typeColor(type: string, isRead: boolean) {
  if (isRead) return "text-[var(--muted-text)]";
  switch (type) {
    case "APPLICATION_UPDATE":
      return "text-[var(--fulfillment-gold)]";
    case "WARNING":
    case "LEGAL_ACTION":
      return "text-red-400";
    case "NEARBY_JOB":
    case "JOB_MESSAGE":
      return "text-emerald-400";
    default:
      return "text-[var(--soft-blue)]";
  }
}

function typeLabel(type: string, t: (key: string, fallback: string) => string) {
  switch (type) {
    case "APPLICATION_UPDATE":
      return t("notifications.applicationLabel", "Application");
    case "NEARBY_JOB":
      return t("notifications.jobMatchLabel", "Job Match");
    case "JOB_MESSAGE":
      return t("notifications.jobLabel", "Job");
    case "SYSTEM":
      return t("notifications.systemLabel", "System");
    case "WARNING":
      return t("notifications.warningLabel", "Warning");
    case "LEGAL_ACTION":
      return t("notifications.legalLabel", "Legal");
    case "ACTION_FORM":
      return t("notifications.actionRequiredLabel", "Action Required");
    default:
      return t("notifications.notification", "Notification");
  }
}

function notificationLink(n: Notification): string | null {
  const p = n.payload;
  if (!p) return null;
  if (p.applicationId) return `/dashboard/applications/${p.applicationId}`;
  if (p.jobId) return `/dashboard/jobs/${p.jobId}`;
  if (p.bookingId) return `/dashboard/schedule`;
  return null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [markingAll, setMarkingAll] = useState(false);
  const limit = 20;
  const { t } = useLanguage();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const statusParam = filter === "unread" ? "unread" : "all";
    const res = await api<NotificationResponse>(
      `/notifications?status=${statusParam}&page=${page}&limit=${limit}`,
    );
    if (res.data) {
      setNotifications(res.data.items || []);
      setTotal(res.data.total || 0);
    }
    setLoading(false);
  }, [page, filter]);

  const fetchUnread = useCallback(async () => {
    const res = await api<{ count: number }>("/notifications/unread-count");
    if (res.data) setUnreadCount(res.data.count);
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnread();
  }, [fetchNotifications, fetchUnread]);

  useEffect(() => {
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const markRead = async (id: string) => {
    await api(`/notifications/${id}/read`, { method: "POST" });
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await api("/notifications/read-all", { method: "POST" });
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })),
    );
    setUnreadCount(0);
    setMarkingAll(false);
  };

  const displayed = useMemo(() => {
    if (filter === "all" || filter === "unread") return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const totalPages = Math.ceil(total / limit);

  const FILTERS: { key: FilterTab; label: string }[] = [
    { key: "all", label: t("common.all", "All") },
    {
      key: "unread",
      label: `${t("notifications.unreadLabel", "Unread")}${unreadCount > 0 ? ` (${unreadCount})` : ""}`,
    },
    {
      key: "APPLICATION_UPDATE",
      label: t("notifications.applicationsLabel", "Applications"),
    },
    { key: "SYSTEM", label: t("notifications.systemLabel", "System") },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
            {t("notifications.updatesLabel", "Updates")}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {t("notifications.title", "Notifications")}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-text)]">
            {t(
              "notifications.subtitle",
              "Stay updated on applications, payments, and platform announcements.",
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="mt-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-all hover:bg-[var(--surface-alt)] disabled:opacity-50"
          >
            {markingAll
              ? t("notifications.marking", "Marking...")
              : t("notifications.markAllAsRead", "Mark all read")}
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: t("notifications.totalLabel", "Total"),
            value: total,
            color: "text-[var(--foreground)]",
          },
          {
            label: t("notifications.unreadLabel", "Unread"),
            value: unreadCount,
            color: "text-[var(--fulfillment-gold)]",
          },
          {
            label: t("notifications.applicationsLabel", "Applications"),
            value: notifications.filter((n) => n.type === "APPLICATION_UPDATE")
              .length,
            color: "text-[var(--soft-blue)]",
          },
          {
            label: t("notifications.systemLabel", "System"),
            value: notifications.filter((n) => n.type === "SYSTEM").length,
            color: "text-emerald-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4 text-center"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-[var(--muted-text)]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
              filter === f.key
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--border-color)] bg-transparent text-[var(--muted-text)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] px-8 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--fulfillment-gold)]/10">
            <svg
              className="h-8 w-8 text-[var(--fulfillment-gold)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </div>
          <h2 className="mt-5 text-lg font-semibold text-[var(--foreground)]">
            {filter === "unread"
              ? t("notifications.allCaughtUp", "All caught up")
              : t("notifications.noNotifications", "No notifications yet")}
          </h2>
          <p className="mt-2 max-w-sm text-center text-sm text-[var(--muted-text)]">
            {filter === "unread"
              ? t(
                  "notifications.allCaughtUpMessage",
                  "You have no unread notifications. Check back later for updates.",
                )
              : t(
                  "notifications.emptyMessage",
                  "Notifications about applications, payments, and platform updates will appear here.",
                )}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((n) => {
            const isRead = !!n.readAt;
            const link = notificationLink(n);
            const Inner = (
              <div
                className={`group relative flex gap-4 rounded-xl border p-4 transition-all ${
                  isRead
                    ? "border-[var(--border-color)] bg-[var(--surface)]"
                    : "border-[var(--fulfillment-gold)]/30 bg-[var(--fulfillment-gold)]/5"
                } hover:border-[var(--primary)]/40 hover:shadow-sm`}
              >
                {/* Unread dot */}
                {!isRead && (
                  <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-[var(--fulfillment-gold)]" />
                )}

                {/* Icon */}
                <div
                  className={`mt-0.5 flex-shrink-0 ${typeColor(n.type, isRead)}`}
                >
                  {typeIcon(n.type)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${typeColor(n.type, isRead)}`}
                        >
                          {typeLabel(n.type, t)}
                        </span>
                        <span className="text-[10px] text-[var(--muted-text)]">
                          {timeAgo(n.createdAt, t)}
                        </span>
                      </div>
                      <h3
                        className={`mt-1 text-sm font-semibold leading-tight ${isRead ? "text-[var(--muted-text)]" : "text-[var(--foreground)]"}`}
                      >
                        {n.title ||
                          t("notifications.notification", "Notification")}
                      </h3>
                      {n.body && (
                        <p
                          className={`mt-1 text-sm leading-relaxed ${isRead ? "text-[var(--muted-text)]/70" : "text-[var(--muted-text)]"}`}
                        >
                          {n.body}
                        </p>
                      )}
                    </div>

                    {!isRead && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markRead(n.id);
                        }}
                        className="flex-shrink-0 rounded-md p-1.5 text-[var(--muted-text)] opacity-0 transition-all hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)] group-hover:opacity-100"
                        title={t("notifications.markAsRead", "Mark as read")}
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
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {link && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-[var(--primary)] group-hover:underline">
                        {t("notifications.viewDetails", "View details")} &rarr;
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );

            if (link) {
              return (
                <Link
                  key={n.id}
                  href={link}
                  onClick={() => {
                    if (!isRead) markRead(n.id);
                  }}
                >
                  {Inner}
                </Link>
              );
            }
            return (
              <div
                key={n.id}
                onClick={() => {
                  if (!isRead) markRead(n.id);
                }}
                className="cursor-pointer"
              >
                {Inner}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-[var(--border-color)] px-3 py-1.5 text-sm text-[var(--muted-text)] transition-all hover:bg-[var(--surface)] disabled:opacity-30"
          >
            {t("notifications.previous", "Previous")}
          </button>
          <span className="text-sm text-[var(--muted-text)]">
            {t("notifications.pageInfo", `Page ${page} of ${totalPages}`)}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-[var(--border-color)] px-3 py-1.5 text-sm text-[var(--muted-text)] transition-all hover:bg-[var(--surface)] disabled:opacity-30"
          >
            {t("common.next", "Next")}
          </button>
        </div>
      )}
    </div>
  );
}
