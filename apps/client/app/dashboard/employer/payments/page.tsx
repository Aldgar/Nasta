"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../../../lib/api";
import { useLanguage } from "../../../../context/LanguageContext";

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  isDefault: boolean;
  created: number;
}

interface DashboardData {
  authorizedHolds: number;
  totalSpent: number;
  recent: {
    id: string;
    status: string;
    holdAmount: number | null;
    capturedAmount: number | null;
    startTime: string | null;
    endTime: string | null;
  }[];
}

interface Receipt {
  applicationId: string;
  jobId: string;
  bookingId: string | null;
  jobTitle: string;
  serviceProviderName: string;
  completedAt: string;
  currency: string;
  totalPaidAmountCents: number;
  platformFeeAmountCents: number;
  serviceProviderAmountCents: number;
  receiptNumber: string | null;
  employerReceiptSentAt: string | null;
}

type Tab = "overview" | "methods" | "receipts";

export default function EmployerPaymentsPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("overview");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [resendingReceipts, setResendingReceipts] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchDashboard = useCallback(async () => {
    const res = await api<DashboardData>("/payments/dashboard/employer");
    if (res.data) setDashboard(res.data);
  }, []);

  const fetchMethods = useCallback(async () => {
    setMethodsLoading(true);
    const res = await api<PaymentMethod[]>("/payments/payment-methods");
    if (res.data) setMethods(res.data);
    setMethodsLoading(false);
  }, []);

  const fetchReceipts = useCallback(async () => {
    setReceiptsLoading(true);
    const res = await api<Receipt[]>("/payments/employer/receipts");
    if (res.data) setReceipts(res.data);
    setReceiptsLoading(false);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchMethods(), fetchReceipts()]);
      setLoading(false);
    }
    load();
  }, [fetchDashboard, fetchMethods, fetchReceipts]);

  const handleAddCard = async () => {
    setAddingCard(true);
    const res = await api<{ url?: string; clientSecret?: string }>(
      "/payments/checkout/session",
      {
        method: "POST",
        body: {
          mode: "setup",
          successUrl: `${window.location.origin}/dashboard/employer/payments?tab=methods`,
          cancelUrl: `${window.location.origin}/dashboard/employer/payments?tab=methods`,
        },
      },
    );
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      setToast({
        message: "Could not initiate card setup. Please try again.",
        type: "error",
      });
    }
    setAddingCard(false);
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment method?"))
      return;
    setDeletingId(id);
    const res = await api(`/payments/payment-methods/${id}`, {
      method: "DELETE",
    });
    setDeletingId(null);
    if (res.error) {
      setToast({ message: res.error, type: "error" });
      return;
    }
    setToast({ message: "Payment method removed.", type: "success" });
    fetchMethods();
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    const res = await api(`/payments/payment-methods/${id}/set-default`, {
      method: "POST",
    });
    setSettingDefaultId(null);
    if (res.error) {
      setToast({ message: res.error, type: "error" });
      return;
    }
    setToast({ message: "Default payment method updated.", type: "success" });
    fetchMethods();
  };

  const handleResendReceipts = async () => {
    setResendingReceipts(true);
    const res = await api("/payments/employer/receipts/resend-missing", {
      method: "POST",
    });
    setResendingReceipts(false);
    if (res.error) {
      setToast({ message: res.error, type: "error" });
      return;
    }
    setToast({
      message: "Missing receipt emails have been resent.",
      type: "success",
    });
  };

  const fmtCents = (cents: number, currency = "EUR") => {
    return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
  };

  const fmtAmount = (amount: number) => {
    return `EUR ${(amount / 100).toFixed(2)}`;
  };

  const brandIcon = (brand: string) => {
    const b = brand.toLowerCase();
    if (b === "visa") return "💳";
    if (b === "mastercard") return "💳";
    if (b === "amex") return "💳";
    return "💳";
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "methods" || t === "receipts" || t === "overview") setTab(t);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
          {t("employerDashboard.paymentsPage.billing", "Billing")}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
          {t("employerDashboard.paymentsPage.title", "Payments")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          {t(
            "employerDashboard.paymentsPage.subtitle",
            "Manage payment methods, view transaction history, and download receipts.",
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-1">
        {(
          [
            [
              "overview",
              t("employerDashboard.paymentsPage.overview", "Overview"),
            ],
            [
              "methods",
              t(
                "employerDashboard.paymentsPage.paymentMethods",
                "Payment Methods",
              ),
            ],
            [
              "receipts",
              t("employerDashboard.paymentsPage.receipts", "Receipts"),
            ],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${tab === key ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--muted-text)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── Overview ─── */}
      {tab === "overview" && dashboard && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: t(
                  "employerDashboard.paymentsPage.totalSpent",
                  "Total Spent",
                ),
                value: fmtAmount(dashboard.totalSpent),
                color: "var(--primary)",
              },
              {
                label: t(
                  "employerDashboard.paymentsPage.authorizedHolds",
                  "Authorized Holds",
                ),
                value: fmtAmount(dashboard.authorizedHolds),
                color: "var(--fulfillment-gold)",
              },
              {
                label: t(
                  "employerDashboard.paymentsPage.paymentMethodsCount",
                  "Payment Methods",
                ),
                value: String(methods.length),
                color: "var(--achievement-green)",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-text)]">
                  {s.label}
                </p>
                <p
                  className="mt-2 text-2xl font-bold"
                  style={{ color: s.color }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              {t(
                "employerDashboard.paymentsPage.recentTransactions",
                "Recent Transactions",
              )}
            </h2>
            {dashboard.recent.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted-text)]">
                {t(
                  "employerDashboard.paymentsPage.noTransactions",
                  "No transactions yet.",
                )}
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {dashboard.recent.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {t("employerDashboard.paymentsPage.booking", "Booking")}{" "}
                        #{tx.id.slice(-6)}
                      </p>
                      <p className="text-xs text-[var(--muted-text)]">
                        {tx.startTime
                          ? new Date(tx.startTime).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {tx.capturedAmount
                          ? fmtAmount(tx.capturedAmount)
                          : tx.holdAmount
                            ? fmtAmount(tx.holdAmount)
                            : "—"}
                      </p>
                      <span
                        className={`text-[10px] font-bold uppercase ${tx.status === "COMPLETED" ? "text-[var(--achievement-green)]" : tx.status === "IN_PROGRESS" ? "text-[var(--fulfillment-gold)]" : "text-[var(--muted-text)]"}`}
                      >
                        {tx.status?.replace(/_/g, " ") || "Unknown"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Payment Methods ─── */}
      {tab === "methods" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              {t(
                "employerDashboard.paymentsPage.yourPaymentMethods",
                "Your Payment Methods",
              )}
            </h2>
            <button
              onClick={handleAddCard}
              disabled={addingCard}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--soft-blue)] disabled:opacity-50"
            >
              {addingCard ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              )}
              {t("employerDashboard.paymentsPage.addCard", "Add Card")}
            </button>
          </div>

          {methodsLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          ) : methods.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-8 py-12">
              <svg
                className="h-12 w-12 text-[var(--muted-text)]/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
              <p className="mt-4 text-sm font-medium text-[var(--muted-text)]">
                {t(
                  "employerDashboard.paymentsPage.noPaymentMethods",
                  "No payment methods added yet",
                )}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-text)]">
                {t(
                  "employerDashboard.paymentsPage.addCardToStart",
                  "Add a card to start making payments for services.",
                )}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {methods.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl border p-5 transition-all ${m.isDefault ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border-color)] bg-[var(--surface)]"}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {brandIcon(m.card?.brand || "")}
                        </span>
                        <span className="text-sm font-bold text-[var(--foreground)] capitalize">
                          {m.card?.brand || "Card"}
                        </span>
                        {m.isDefault && (
                          <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold text-white">
                            {t(
                              "employerDashboard.paymentsPage.default",
                              "Default",
                            )}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 font-mono text-lg tracking-widest text-[var(--foreground)]">
                        •••• •••• •••• {m.card?.last4 || "????"}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted-text)]">
                        {t("employerDashboard.paymentsPage.expires", "Expires")}{" "}
                        {String(m.card?.expMonth || 0).padStart(2, "0")}/
                        {m.card?.expYear || "??"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-[var(--border-color)] pt-3">
                    {!m.isDefault && (
                      <button
                        onClick={() => handleSetDefault(m.id)}
                        disabled={settingDefaultId === m.id}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)] disabled:opacity-50"
                      >
                        {settingDefaultId === m.id ? (
                          <div className="h-3 w-3 animate-spin rounded-full border border-[var(--primary)] border-t-transparent" />
                        ) : (
                          t(
                            "employerDashboard.paymentsPage.setDefault",
                            "Set Default",
                          )
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMethod(m.id)}
                      disabled={deletingId === m.id}
                      className="flex items-center gap-1.5 rounded-lg border border-[var(--alert-red)]/20 bg-[var(--alert-red)]/5 px-3 py-1.5 text-xs font-medium text-[var(--alert-red)] transition-colors hover:bg-[var(--alert-red)]/10 disabled:opacity-50"
                    >
                      {deletingId === m.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border border-[var(--alert-red)] border-t-transparent" />
                      ) : (
                        t("employerDashboard.paymentsPage.remove", "Remove")
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] p-4">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-[var(--muted-text)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {t(
                    "employerDashboard.paymentsPage.securedByStripe",
                    "Secured by Stripe",
                  )}
                </p>
                <p className="text-xs text-[var(--muted-text)]">
                  {t(
                    "employerDashboard.paymentsPage.stripeDescription",
                    "Your payment information is encrypted and securely stored by Stripe. We never have access to your full card details.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Receipts ─── */}
      {tab === "receipts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              {t(
                "employerDashboard.paymentsPage.paymentReceipts",
                "Payment Receipts",
              )}
            </h2>
            {receipts.length > 0 && (
              <button
                onClick={handleResendReceipts}
                disabled={resendingReceipts}
                className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-4 py-2 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50"
              >
                {resendingReceipts ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-[var(--foreground)] border-t-transparent" />
                ) : null}
                {t(
                  "employerDashboard.paymentsPage.resendMissingEmails",
                  "Resend Missing Emails",
                )}
              </button>
            )}
          </div>

          {receiptsLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-8 py-12">
              <svg
                className="h-12 w-12 text-[var(--muted-text)]/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <p className="mt-4 text-sm font-medium text-[var(--muted-text)]">
                {t(
                  "employerDashboard.paymentsPage.noReceipts",
                  "No receipts yet",
                )}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-text)]">
                {t(
                  "employerDashboard.paymentsPage.receiptsWillAppear",
                  "Receipts will appear here once payments are completed for your job postings.",
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receipts.map((r) => (
                <div
                  key={r.applicationId}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--primary)]/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">
                          {r.jobTitle}
                        </h3>
                        {r.receiptNumber && (
                          <span className="rounded-full bg-[var(--surface-alt)] px-2.5 py-0.5 text-[10px] font-mono font-medium text-[var(--muted-text)]">
                            {r.receiptNumber}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted-text)]">
                        {t(
                          "employerDashboard.paymentsPage.serviceProvider",
                          "Service Provider:",
                        )}{" "}
                        {r.serviceProviderName}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted-text)]">
                        {t(
                          "employerDashboard.paymentsPage.completedLabel",
                          "Completed:",
                        )}{" "}
                        {new Date(r.completedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-[var(--foreground)]">
                        {fmtCents(r.totalPaidAmountCents, r.currency)}
                      </p>
                      <div className="mt-1 space-y-0.5">
                        <p className="text-[10px] text-[var(--muted-text)]">
                          {t(
                            "employerDashboard.paymentsPage.platformFee",
                            "Platform fee:",
                          )}{" "}
                          {fmtCents(r.platformFeeAmountCents, r.currency)}
                        </p>
                        <p className="text-[10px] text-[var(--muted-text)]">
                          {t(
                            "employerDashboard.paymentsPage.provider",
                            "Provider:",
                          )}{" "}
                          {fmtCents(r.serviceProviderAmountCents, r.currency)}
                        </p>
                      </div>
                      {r.employerReceiptSentAt && (
                        <span className="mt-1 inline-block rounded-full bg-[var(--achievement-green)]/15 px-2 py-0.5 text-[9px] font-medium text-[var(--achievement-green)]">
                          {t(
                            "employerDashboard.paymentsPage.emailSent",
                            "Email sent",
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl border px-5 py-3 shadow-lg transition-all ${toast.type === "success" ? "border-[var(--achievement-green)]/30 bg-[var(--achievement-green)]/15 text-[var(--achievement-green)]" : "border-[var(--alert-red)]/30 bg-[var(--alert-red)]/15 text-[var(--alert-red)]"}`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
