"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";

import { useAuth } from "../../../lib/auth";
import { useLanguage } from "../../../context/LanguageContext";
import { api, API_BASE, resolveAvatarUrl } from "../../../lib/api";
import BrandedSelect from "../../../components/ui/BrandedSelect";
import BrandedDatePicker from "../../../components/ui/BrandedDatePicker";

/* ── Types ─────────────────────────────────────────────────────────── */

interface Profile {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  bio?: string;
  skills?: string[];
}

interface RateEntry {
  id: string;
  rate: string;
  description: string;
  paymentType: string;
  otherSpecification: string;
}
interface SkillEntry {
  id: string;
  name: string;
  yearsExperience: string;
}
interface LanguageEntry {
  id: string;
  language: string;
  level: string;
}
interface WorkExpEntry {
  id: string;
  company: string;
  category: string;
  years: string;
  description: string;
  fromDate: string;
  toDate: string;
  isCurrent: boolean;
}
interface CertEntry {
  id: string;
  title: string;
  institution: string;
  graduationDate: string;
  isStillStudying: boolean;
}
interface ProjectEntry {
  id: string;
  title: string;
  description: string;
  url: string;
}

const PAYMENT_TYPES_STATIC = [
  { value: "HOUR", labelKey: "Hourly" },
  { value: "DAY", labelKey: "Daily" },
  { value: "WEEK", labelKey: "Weekly" },
  { value: "MONTH", labelKey: "Monthly" },
  { value: "OTHER", labelKey: "Other" },
];

const LANG_LEVELS_STATIC = [
  { value: "NATIVE", labelKey: "Native" },
  { value: "PROFESSIONAL", labelKey: "Professional" },
  { value: "ADVANCED", labelKey: "Advanced" },
  { value: "INTERMEDIATE", labelKey: "Intermediate" },
  { value: "BEGINNER", labelKey: "Beginner" },
];

let _uid = 0;
function uid() {
  return `_${++_uid}_${Date.now()}`;
}

interface KycStatus {
  idVerification?: string;
  backgroundCheck?: string;
  selfieVerification?: string;
  driverLicense?: string;
}

interface LegalStatus {
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  platformRulesAccepted?: boolean;
  termsAcceptedAt?: string;
  privacyAcceptedAt?: string;
  platformRulesAcceptedAt?: string;
}

interface ConnectStatus {
  accountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  bankAccountLast4?: string;
  country?: string;
}

interface PaymentMethod {
  id: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
}

type ThemePref = "light" | "dark" | "system";
type Section =
  | "profile"
  | "professional"
  | "password"
  | "verification"
  | "payment"
  | "preferences"
  | "legal"
  | "account";

/* ── Helpers ───────────────────────────────────────────────────────── */

function applyTheme(pref: ThemePref) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  if (pref === "dark") root.classList.add("dark");
  else if (pref === "light") root.classList.add("light");
  else if (window.matchMedia("(prefers-color-scheme: dark)").matches)
    root.classList.add("dark");
  localStorage.setItem("pref_theme", pref);
}

async function apiUpload(path: string, formData: FormData) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json() : null;
  if (!res.ok) return { data: null, error: payload?.message ?? res.statusText };
  return { data: payload, error: null };
}

const EU_COUNTRIES = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
];

/* ── Components ────────────────────────────────────────────────────── */

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-[var(--muted-text)]">{description}</p>
      )}
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  children,
  description,
}: {
  label: string;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4">
      <div className="w-full sm:w-44 shrink-0">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
        {description && (
          <p className="text-xs text-[var(--muted-text)]">{description}</p>
        )}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function InputField({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 disabled:opacity-50 ${className}`}
    />
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ok ? "bg-[var(--achievement-green)]/15 text-[var(--achievement-green)]" : "bg-[var(--alert-red)]/15 text-[var(--alert-red)]"}`}
    >
      {ok ? (
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
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ) : (
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
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const { t } = useLanguage();
  if (!status)
    return <Badge ok={false} label={t("settings.notStarted", "Not started")} />;
  const s = status.toUpperCase();
  if (s === "VERIFIED" || s === "APPROVED" || s === "COMPLETED")
    return <Badge ok={true} label={t("settings.verified", "Verified")} />;
  if (s === "PENDING" || s === "IN_REVIEW" || s === "SUBMITTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--fulfillment-gold)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--fulfillment-gold)]">
        <svg
          className="h-3.5 w-3.5 animate-spin"
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
        {t("settings.pending", "Pending")}
      </span>
    );
  }
  if (s === "REJECTED" || s === "FAILED")
    return <Badge ok={false} label={t("settings.rejected", "Rejected")} />;
  return <Badge ok={false} label={status.replace(/_/g, " ")} />;
}

function SaveButton({
  onClick,
  loading,
  label,
}: {
  onClick: () => void;
  loading: boolean;
  label?: string;
}) {
  const { t } = useLanguage();
  const displayLabel = label ?? t("common.saveChanges", "Save changes");
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--soft-blue)] disabled:opacity-50"
    >
      {loading && (
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
      {displayLabel}
    </button>
  );
}

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-xl text-sm font-medium ${type === "success" ? "border-[var(--achievement-green)]/30 bg-[var(--achievement-green)]/15 text-[var(--achievement-green)]" : "border-[var(--alert-red)]/30 bg-[var(--alert-red)]/15 text-[var(--alert-red)]"}`}
    >
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        &times;
      </button>
    </div>
  );
}

/* ── Main Settings Page ────────────────────────────────────────────── */

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const { t } = useLanguage();
  const isServiceProvider = user?.role === "JOB_SEEKER";
  const isEmployer = user?.role === "EMPLOYER";

  const PAYMENT_TYPES = PAYMENT_TYPES_STATIC.map((pt) => ({
    value: pt.value,
    label: pt.labelKey,
  }));
  const LANG_LEVELS = LANG_LEVELS_STATIC.map((ll) => ({
    value: ll.value,
    label: ll.labelKey,
  }));

  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  /* ─ Profile state ─ */
  const [profile, setProfile] = useState<Profile>({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editPostal, setEditPostal] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editBio, setEditBio] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  /* ─ Email / Phone change state ─ */
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeSaving, setEmailChangeSaving] = useState(false);
  const [emailChangeToken, setEmailChangeToken] = useState("");
  const [emailChangeConfirmStep, setEmailChangeConfirmStep] = useState(false);
  const [showPhoneChange, setShowPhoneChange] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [phoneChangeSaving, setPhoneChangeSaving] = useState(false);
  const [phoneChangeCodeSent, setPhoneChangeCodeSent] = useState(false);
  const [phoneChangeCode, setPhoneChangeCode] = useState("");
  const [phoneChangeVerifying, setPhoneChangeVerifying] = useState(false);

  /* ─ Professional profile state (service providers) ─ */
  const [proAboutMe, setProAboutMe] = useState("");
  const [proRates, setProRates] = useState<RateEntry[]>([
    {
      id: uid(),
      rate: "",
      description: "",
      paymentType: "HOUR",
      otherSpecification: "",
    },
  ]);
  const [proSkills, setProSkills] = useState<SkillEntry[]>([
    { id: uid(), name: "", yearsExperience: "" },
  ]);
  const [proLanguages, setProLanguages] = useState<LanguageEntry[]>([]);
  const [proWorkExp, setProWorkExp] = useState<WorkExpEntry[]>([]);
  const [proCerts, setProCerts] = useState<CertEntry[]>([]);
  const [proEducation, setProEducation] = useState<CertEntry[]>([]);
  const [proProjects, setProProjects] = useState<ProjectEntry[]>([]);
  const [proSaving, setProSaving] = useState(false);
  const [proLoaded, setProLoaded] = useState(false);

  /* ─ Password state ─ */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  /* ─ Verification state ─ */
  const [kycStatus, setKycStatus] = useState<KycStatus>({});
  const [emailVerifSending, setEmailVerifSending] = useState(false);
  const [phoneVerifSending, setPhoneVerifSending] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);

  /* ─ Payment state ─ */
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>({});
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [ibanCountry, setIbanCountry] = useState("PT");
  const [ibanValue, setIbanValue] = useState("");
  const [bankSaving, setBankSaving] = useState(false);

  /* ─ Preferences state ─ */
  const [themePref, setThemePref] = useState<ThemePref>("system");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  /* ─ Legal state ─ */
  const [legalStatus, setLegalStatus] = useState<LegalStatus>({});
  const [legalLoading, setLegalLoading] = useState(false);

  /* ─ Account state ─ */
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  /* ─ Fetch all data on mount ─ */
  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    const endpoint = isEmployer ? "/profiles/employer/me" : "/profiles/me";
    const res = await api<Record<string, unknown>>(endpoint);
    if (res.data) {
      const data = res.data;
      const u = (data.user ?? data.admin ?? {}) as Record<string, unknown>;
      const prof = (data.profile ?? {}) as Record<string, unknown>;
      const userProf = (data.userProfile ?? {}) as Record<string, unknown>;
      const addrSource = isEmployer ? userProf : prof;

      const p: Profile = {
        firstName: (u.firstName ?? "") as string,
        lastName: (u.lastName ?? "") as string,
        email: (u.email ?? "") as string,
        phone: (u.phone ?? "") as string,
        dateOfBirth: ((prof.dateOfBirth ?? "") as string).split("T")[0],
        avatarUrl: resolveAvatarUrl(
          (prof.avatarUrl ??
            prof.logoUrl ??
            userProf.avatarUrl ??
            u.avatar ??
            "") as string,
        ),
        bio: (prof.bio ?? u.bio ?? "") as string,
        address: {
          street: (addrSource.addressLine1 ?? "") as string,
          city: (addrSource.city ?? u.city ?? "") as string,
          state: (addrSource.state ?? "") as string,
          postalCode: (addrSource.postalCode ?? "") as string,
          country: (addrSource.country ?? u.country ?? "") as string,
        },
      };
      setProfile(p);

      if (isServiceProvider) {
        setKycStatus({
          idVerification: (u.idVerificationStatus ?? "") as string,
          backgroundCheck: (u.backgroundCheckStatus ?? "") as string,
        });

        const links = (prof.links ?? userProf.links ?? {}) as Record<
          string,
          unknown
        >;
        setProAboutMe((prof.bio ?? "") as string);

        const rawRates = (links.rates ?? []) as Record<string, unknown>[];
        if (rawRates.length > 0) {
          setProRates(
            rawRates.map((r) => ({
              id: uid(),
              rate: String(r.rate ?? ""),
              description: (r.description ?? "") as string,
              paymentType: (r.paymentType ?? "HOUR") as string,
              otherSpecification: (r.otherSpecification ?? "") as string,
            })),
          );
        }

        const rawSkills = (links.skills ?? []) as Record<string, unknown>[];
        if (rawSkills.length > 0) {
          setProSkills(
            rawSkills.map((s) => ({
              id: uid(),
              name: (s.name ?? "") as string,
              yearsExperience: String(s.yearsExperience ?? ""),
            })),
          );
        }

        const rawLangs = (links.languages ?? []) as Record<string, unknown>[];
        setProLanguages(
          rawLangs.map((l) => ({
            id: uid(),
            language: (l.language ?? "") as string,
            level: (l.level ?? "BEGINNER") as string,
          })),
        );

        const rawWork = (links.workExperience ?? []) as Record<
          string,
          unknown
        >[];
        setProWorkExp(
          rawWork.map((w) => ({
            id: uid(),
            company: (w.company ?? "") as string,
            category: (w.category ?? "") as string,
            years: String(w.years ?? ""),
            description: (w.description ?? "") as string,
            fromDate: (w.fromDate ?? "") as string,
            toDate: (w.toDate ?? "") as string,
            isCurrent: !!w.isCurrent,
          })),
        );

        const rawCerts = (links.certifications ?? []) as Record<
          string,
          unknown
        >[];
        setProCerts(
          rawCerts.map((c) => ({
            id: uid(),
            title: (c.title ?? "") as string,
            institution: (c.institution ?? "") as string,
            graduationDate: (c.graduationDate ?? "") as string,
            isStillStudying: !!c.isStillStudying,
          })),
        );

        const rawEdu = (links.education ?? []) as Record<string, unknown>[];
        setProEducation(
          rawEdu.map((e) => ({
            id: uid(),
            title: (e.title ?? "") as string,
            institution: (e.institution ?? "") as string,
            graduationDate: (e.graduationDate ?? "") as string,
            isStillStudying: !!e.isStillStudying,
          })),
        );

        const rawProj = (links.projects ?? []) as Record<string, unknown>[];
        setProProjects(
          rawProj.map((pj) => ({
            id: uid(),
            title: (pj.title ?? "") as string,
            description: (pj.description ?? "") as string,
            url: (pj.url ?? "") as string,
          })),
        );

        setProLoaded(true);
      }
      setEditFirstName(p.firstName ?? "");
      setEditLastName(p.lastName ?? "");
      setEditPhone(p.phone ?? "");
      setEditDob(p.dateOfBirth ?? "");
      setEditStreet(p.address?.street ?? "");
      setEditCity(p.address?.city ?? "");
      setEditPostal(p.address?.postalCode ?? "");
      setEditCountry(p.address?.country ?? "");
      setEditBio(p.bio ?? "");
    }
    setProfileLoading(false);
  }, [isEmployer, isServiceProvider]);

  useEffect(() => {
    fetchProfile();

    if (isServiceProvider) {
      api<ConnectStatus>("/payments/connect/status").then((r) => {
        if (r.data) setConnectStatus(r.data);
      });
    }

    if (isEmployer) {
      api<PaymentMethod[]>("/payments/payment-methods").then((r) => {
        if (r.data && Array.isArray(r.data)) setPaymentMethods(r.data);
      });
    }

    api<LegalStatus>("/users/me/legal/status").then((r) => {
      if (r.data) setLegalStatus(r.data);
    });

    const stored = localStorage.getItem("pref_theme") as ThemePref | null;
    if (stored === "light" || stored === "dark") setThemePref(stored);
    else setThemePref("system");

    const notifPrefs = localStorage.getItem("notif_prefs");
    if (notifPrefs) {
      try {
        const p = JSON.parse(notifPrefs);
        setEmailNotifs(p.email ?? true);
        setPushNotifs(p.push ?? true);
      } catch {
        /* noop */
      }
    }
  }, [fetchProfile, isServiceProvider, isEmployer]);

  /* ─ Profile actions ─ */
  const saveProfile = async () => {
    setProfileSaving(true);
    const errors: string[] = [];

    if (editPhone && editPhone !== profile.phone) {
      const phoneRes = await api("/users/me", {
        method: "PATCH",
        body: { phone: editPhone },
      });
      if (phoneRes.error)
        errors.push(
          typeof phoneRes.error === "string"
            ? phoneRes.error
            : t("settings.failedToUpdatePhone", "Failed to update phone"),
        );
    }

    if (
      isServiceProvider &&
      (editBio !== (profile.bio ?? "") ||
        editDob !== (profile.dateOfBirth ?? ""))
    ) {
      const profileBody: Record<string, unknown> = {};
      if (editBio !== (profile.bio ?? "")) profileBody.bio = editBio;
      if (editDob && editDob !== (profile.dateOfBirth ?? ""))
        profileBody.dateOfBirth = new Date(editDob).toISOString();
      if (Object.keys(profileBody).length > 0) {
        const profRes = await api("/profiles/me", {
          method: "PATCH",
          body: profileBody,
        });
        if (profRes.error)
          errors.push(
            typeof profRes.error === "string"
              ? profRes.error
              : t("settings.failedToUpdateProfile", "Failed to update profile"),
          );
      }
    }

    if (editStreet || editCity || editPostal || editCountry) {
      const addrBody: Record<string, unknown> = {};
      if (editStreet) addrBody.addressLine1 = editStreet;
      if (editCity) addrBody.city = editCity;
      if (editPostal) addrBody.postalCode = editPostal;
      if (editCountry) addrBody.country = editCountry;
      const addrRes = await api("/users/me/address", {
        method: "PATCH",
        body: addrBody,
      });
      if (addrRes.error)
        errors.push(
          typeof addrRes.error === "string"
            ? addrRes.error
            : t("settings.failedToUpdateAddress", "Failed to update address"),
        );
      await api("/profiles/employer/me/address", {
        method: "PATCH",
        body: addrBody,
      }).catch(() => {});
    }

    setProfileSaving(false);
    if (errors.length > 0) {
      setToast({ message: errors.join(". "), type: "error" });
      return;
    }
    setToast({
      message: t("settings.profileUpdated", "Profile updated"),
      type: "success",
    });
    refreshUser();
    fetchProfile();
  };

  /* ─ Email change actions ─ */
  const requestEmailChange = async () => {
    if (!newEmail.trim()) {
      setToast({
        message: t(
          "settings.pleaseEnterNewEmail",
          "Please enter your new email address",
        ),
        type: "error",
      });
      return;
    }
    setEmailChangeSaving(true);
    const res = await api("/auth/email/request-change", {
      method: "POST",
      body: { newEmail: newEmail.trim().toLowerCase() },
    });
    setEmailChangeSaving(false);
    if (res.error) {
      setToast({
        message:
          typeof res.error === "string"
            ? res.error
            : t(
                "settings.failedToRequestEmailChange",
                "Failed to request email change",
              ),
        type: "error",
      });
      return;
    }
    setToast({
      message: t(
        "settings.emailChangeSent",
        "Confirmation email sent to your new address. Check your inbox.",
      ),
      type: "success",
    });
    setEmailChangeConfirmStep(true);
  };

  const confirmEmailChange = async () => {
    if (!emailChangeToken.trim()) {
      setToast({
        message: t(
          "settings.pleaseEnterConfirmToken",
          "Please enter the confirmation token",
        ),
        type: "error",
      });
      return;
    }
    setEmailChangeSaving(true);
    const res = await api("/auth/email/confirm-change", {
      method: "POST",
      body: { token: emailChangeToken.trim() },
    });
    setEmailChangeSaving(false);
    if (res.error) {
      setToast({
        message:
          typeof res.error === "string"
            ? res.error
            : t("settings.invalidOrExpiredToken", "Invalid or expired token"),
        type: "error",
      });
      return;
    }
    setToast({
      message: t(
        "settings.emailUpdatedSuccessfully",
        "Email updated successfully!",
      ),
      type: "success",
    });
    setShowEmailChange(false);
    setNewEmail("");
    setEmailChangeToken("");
    setEmailChangeConfirmStep(false);
    refreshUser();
    fetchProfile();
  };

  /* ─ Phone change actions ─ */
  const saveNewPhone = async () => {
    if (!newPhone.trim()) {
      setToast({
        message: t(
          "settings.pleaseEnterNewPhone",
          "Please enter your new phone number",
        ),
        type: "error",
      });
      return;
    }
    setPhoneChangeSaving(true);
    const res = await api("/users/me", {
      method: "PATCH",
      body: { phone: newPhone.trim() },
    });
    setPhoneChangeSaving(false);
    if (res.error) {
      setToast({
        message:
          typeof res.error === "string"
            ? res.error
            : t("settings.failedToUpdatePhone", "Failed to update phone"),
        type: "error",
      });
      return;
    }
    const verifRes = await api("/auth/phone/request-verify", {
      method: "POST",
    });
    if (verifRes.error) {
      setToast({
        message: t(
          "settings.phoneUpdatedSMSFailed",
          "Phone updated but verification SMS could not be sent. Try verifying later.",
        ),
        type: "error",
      });
    } else {
      setToast({
        message: t(
          "settings.phoneUpdatedCodeSent",
          "Phone updated. Verification code sent via SMS.",
        ),
        type: "success",
      });
      setPhoneChangeCodeSent(true);
    }
    refreshUser();
    fetchProfile();
  };

  const verifyNewPhoneCode = async () => {
    if (!phoneChangeCode.trim()) return;
    setPhoneChangeVerifying(true);
    const res = await api("/auth/phone/verify", {
      method: "POST",
      body: { code: phoneChangeCode.trim() },
    });
    setPhoneChangeVerifying(false);
    if (res.error) {
      setToast({
        message:
          typeof res.error === "string"
            ? res.error
            : t("settings.invalidOrExpiredCode", "Invalid or expired code"),
        type: "error",
      });
      return;
    }
    setToast({
      message: t("settings.phoneVerified", "Phone verified!"),
      type: "success",
    });
    setShowPhoneChange(false);
    setNewPhone("");
    setPhoneChangeCode("");
    setPhoneChangeCodeSent(false);
    refreshUser();
    fetchProfile();
  };

  const uploadAvatar = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const endpoint = isEmployer
      ? "/profiles/employer/me/avatar"
      : "/profiles/me/avatar";
    const res = await apiUpload(endpoint, fd);
    if (res.error) {
      setToast({
        message:
          typeof res.error === "string"
            ? res.error
            : t("settings.failedToUploadAvatar", "Failed to upload avatar"),
        type: "error",
      });
      return;
    }
    setToast({
      message: t("settings.avatarUpdated", "Avatar updated"),
      type: "success",
    });
    fetchProfile();
    refreshUser();
  };

  /* ─ Professional profile actions ─ */
  const saveProfessionalProfile = async () => {
    if (!proAboutMe.trim()) {
      setToast({
        message: t("settings.aboutMeRequired", "About Me is required"),
        type: "error",
      });
      return;
    }
    const validRates = proRates.filter((r) => parseFloat(r.rate) > 0);
    if (validRates.length === 0) {
      setToast({
        message: t(
          "settings.rateRequired",
          "At least one rate with amount > 0 is required",
        ),
        type: "error",
      });
      return;
    }
    const validSkills = proSkills.filter(
      (s) => s.name.trim() && parseFloat(s.yearsExperience) > 0,
    );
    if (validSkills.length === 0) {
      setToast({
        message: t(
          "settings.skillRequired",
          "At least one skill with experience is required",
        ),
        type: "error",
      });
      return;
    }

    setProSaving(true);
    const avgYears =
      validSkills.reduce((a, s) => a + parseFloat(s.yearsExperience), 0) /
      validSkills.length;

    const body = {
      aboutMe: proAboutMe.trim(),
      hourlyRate: parseFloat(validRates[0].rate),
      yearsExperience: Math.round(avgYears),
      rates: validRates.map((r) => ({
        rate: parseFloat(r.rate),
        description: r.description.trim() || undefined,
        paymentType: r.paymentType,
        ...(r.paymentType === "OTHER" && r.otherSpecification.trim()
          ? { otherSpecification: r.otherSpecification.trim() }
          : {}),
      })),
      skills: validSkills.map((s) => ({
        name: s.name.trim(),
        yearsExperience: parseFloat(s.yearsExperience),
      })),
      languages: proLanguages
        .filter((l) => l.language.trim())
        .map((l) => ({ language: l.language.trim(), level: l.level })),
      workExperience: proWorkExp
        .filter((w) => w.company.trim())
        .map((w) => ({
          company: w.company.trim(),
          category: w.category.trim(),
          years: parseFloat(w.years) || 0,
          description: w.description.trim(),
          fromDate: w.fromDate,
          toDate: w.toDate,
          isCurrent: w.isCurrent,
        })),
      certifications: proCerts
        .filter((c) => c.title.trim())
        .map((c) => ({
          title: c.title.trim(),
          institution: c.institution.trim(),
          graduationDate: c.graduationDate,
          isStillStudying: c.isStillStudying,
        })),
      education: proEducation
        .filter((e) => e.title.trim())
        .map((e) => ({
          title: e.title.trim(),
          institution: e.institution.trim(),
          graduationDate: e.graduationDate,
          isStillStudying: e.isStillStudying,
        })),
      projects: proProjects
        .filter((p) => p.title.trim())
        .map((p) => ({
          title: p.title.trim(),
          description: p.description.trim(),
          url: p.url.trim() || undefined,
        })),
    };

    const res = await api("/profiles/onboarding", { method: "POST", body });
    setProSaving(false);
    if (res.error) {
      setToast({ message: res.error, type: "error" });
      return;
    }
    setToast({
      message: t(
        "settings.professionalProfileSaved",
        "Professional profile saved",
      ),
      type: "success",
    });
    refreshUser();
  };

  /* ─ Password actions ─ */
  const changePassword = async () => {
    if (!currentPw.trim()) {
      setToast({
        message: t(
          "settings.pleaseEnterCurrentPassword",
          "Please enter your current password",
        ),
        type: "error",
      });
      return;
    }
    if (newPw !== confirmPw) {
      setToast({
        message: t("settings.passwordsDoNotMatch", "Passwords do not match"),
        type: "error",
      });
      return;
    }
    const pwErrors: string[] = [];
    if (newPw.length < 8) pwErrors.push("At least 8 characters");
    if (!/[A-Z]/.test(newPw)) pwErrors.push("One uppercase letter");
    if (!/[a-z]/.test(newPw)) pwErrors.push("One lowercase letter");
    if (!/[0-9]/.test(newPw)) pwErrors.push("One number");
    if (!/[^A-Za-z0-9]/.test(newPw)) pwErrors.push("One special character");
    if (pwErrors.length > 0) {
      setToast({
        message: `${t("settings.passwordRequirementsNotMet", "Password requirements not met")}: ${pwErrors.join(", ")}`,
        type: "error",
      });
      return;
    }
    setPwSaving(true);
    const res = await api("/auth/password/change", {
      method: "POST",
      body: { currentPassword: currentPw, newPassword: newPw },
    });
    setPwSaving(false);
    if (res.error) {
      setToast({
        message:
          typeof res.error === "string"
            ? res.error
            : t("settings.failedToChangePassword", "Failed to change password"),
        type: "error",
      });
      return;
    }
    setToast({
      message: t("settings.passwordUpdated", "Password changed successfully"),
      type: "success",
    });
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  /* ─ Verification actions ─ */
  const sendEmailVerification = async () => {
    setEmailVerifSending(true);
    const res = await api("/auth/email/request-verify", { method: "POST" });
    setEmailVerifSending(false);
    if (res.error) {
      setToast({ message: res.error, type: "error" });
      return;
    }
    setToast({
      message: t(
        "settings.verificationEmailSent",
        "Verification email sent! Check your inbox.",
      ),
      type: "success",
    });
  };

  const sendPhoneVerification = async () => {
    setPhoneVerifSending(true);
    const res = await api("/auth/phone/request-verify", { method: "POST" });
    setPhoneVerifSending(false);
    if (res.error) {
      setToast({ message: res.error, type: "error" });
      return;
    }
    setPhoneCodeSent(true);
    setToast({
      message: t(
        "settings.verificationCodeSentPhone",
        "Verification code sent to your phone.",
      ),
      type: "success",
    });
  };

  const verifyPhoneCode = async () => {
    if (!phoneCode.trim()) return;
    setPhoneVerifying(true);
    const res = await api("/auth/phone/verify", {
      method: "POST",
      body: { code: phoneCode },
    });
    setPhoneVerifying(false);
    if (res.error) {
      setToast({ message: res.error, type: "error" });
      return;
    }
    setToast({
      message: t("settings.phoneVerified", "Phone verified!"),
      type: "success",
    });
    setPhoneCode("");
    setPhoneCodeSent(false);
    refreshUser();
  };

  /* ─ Payment actions ─ */
  const saveBankAccount = async () => {
    if (!ibanValue.trim()) {
      setToast({
        message: t("settings.pleaseEnterIBAN", "Please enter your IBAN"),
        type: "error",
      });
      return;
    }
    setBankSaving(true);
    const res = await api("/payments/connect/bank-account", {
      method: "POST",
      body: { iban: ibanValue, country: ibanCountry },
    });
    setBankSaving(false);
    if (res.error) {
      setToast({ message: res.error, type: "error" });
      return;
    }
    setToast({
      message: t("settings.bankAccountSaved", "Bank account saved"),
      type: "success",
    });
    api<ConnectStatus>("/payments/connect/status").then((r) => {
      if (r.data) setConnectStatus(r.data);
    });
  };

  /* ─ Legal actions ─ */
  const acceptLegal = async (doc: "terms" | "privacy" | "platform-rules") => {
    setLegalLoading(true);
    const res = await api(`/users/me/legal/accept-${doc}`, { method: "POST" });
    setLegalLoading(false);
    if (res.error) {
      setToast({ message: res.error, type: "error" });
      return;
    }
    setToast({
      message: t("settings.documentAccepted", "Document accepted"),
      type: "success",
    });
    api<LegalStatus>("/users/me/legal/status").then((r) => {
      if (r.data) setLegalStatus(r.data);
    });
  };

  /* ─ Account actions ─ */
  const requestDeletion = async () => {
    setDeleteLoading(true);
    const res = await api("/users/me/deletion-request", {
      method: "POST",
      body: { reason: deleteReason || undefined },
    });
    setDeleteLoading(false);
    if (res.error) {
      setToast({ message: res.error, type: "error" });
      return;
    }
    const data = res.data as Record<string, unknown> | null;
    const ticket = (data?.request as Record<string, unknown>)?.ticketNumber as
      | string
      | undefined;
    setToast({
      message: `${t("settings.deletionRequestSubmitted", "Deletion request submitted")}${ticket ? ` (${ticket})` : ""}. ${t("settings.deletionConfirmationEmail", "You will receive a confirmation email.")}`,
      type: "success",
    });
    setDeleteConfirm(false);
    setDeleteReason("");
  };

  /* ─ Navigation items ─ */
  const NAV: {
    id: Section;
    label: string;
    icon: React.ReactNode;
    spOnly?: boolean;
  }[] = [
    {
      id: "profile",
      label: t("settings.profileNav", "Profile"),
      icon: (
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
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      ),
    },
    {
      id: "professional",
      label: t("settings.professionalNav", "Professional"),
      spOnly: true,
      icon: (
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
            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
          />
        </svg>
      ),
    },
    {
      id: "password",
      label: t("settings.password", "Password"),
      icon: (
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
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      ),
    },
    {
      id: "verification",
      label: t("settings.verification", "Verification"),
      icon: (
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
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      ),
    },
    {
      id: "payment",
      label: t("settings.payment", "Payment"),
      icon: (
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
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
          />
        </svg>
      ),
    },
    {
      id: "preferences",
      label: t("settings.preferencesNav", "Preferences"),
      icon: (
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
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
          />
        </svg>
      ),
    },
    {
      id: "legal",
      label: t("settings.legalNav", "Legal"),
      icon: (
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
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      ),
    },
    {
      id: "account",
      label: t("settings.account", "Account"),
      icon: (
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
            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const pwStrength = (() => {
    if (!newPw) return 0;
    let s = 0;
    if (newPw.length >= 8) s++;
    if (/[A-Z]/.test(newPw) && /[a-z]/.test(newPw)) s++;
    if (/[0-9]/.test(newPw)) s++;
    if (/[^A-Za-z0-9]/.test(newPw)) s++;
    return s;
  })();

  const pwStrengthLabel =
    [
      "",
      t("settings.pwStrengthWeak", "Weak"),
      t("settings.pwStrengthFair", "Fair"),
      t("settings.pwStrengthGood", "Good"),
      t("settings.pwStrengthStrong", "Strong"),
    ][pwStrength] ?? "";
  const pwStrengthColor =
    [
      "",
      "bg-[var(--alert-red)]",
      "bg-[var(--fulfillment-gold)]",
      "bg-[var(--soft-blue)]",
      "bg-[var(--achievement-green)]",
    ][pwStrength] ?? "";

  const pwHasLen = newPw.length >= 8;
  const pwHasUpper = /[A-Z]/.test(newPw);
  const pwHasLower = /[a-z]/.test(newPw);
  const pwHasDigit = /[0-9]/.test(newPw);
  const pwHasSpecial = /[^A-Za-z0-9]/.test(newPw);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {t("settings.title", "Settings")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          {t(
            "settings.manageDescription",
            "Manage your account, verification, payments and preferences.",
          )}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ── Section nav ─ */}
        <nav className="shrink-0 lg:w-52">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {NAV.filter((item) => !item.spOnly || isServiceProvider).map(
              (item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      activeSection === item.id
                        ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                        : "text-[var(--muted-text)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              ),
            )}
          </ul>
        </nav>

        {/* ── Section content ─ */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* ────── PROFILE ────── */}
          {activeSection === "profile" && (
            <SectionCard
              title={t("settings.profileNav", "Profile")}
              description={t(
                "settings.profileDescription",
                "Your personal information visible on the platform.",
              )}
            >
              {profileLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 animate-pulse rounded-lg bg-[var(--surface-alt)]"
                    />
                  ))}
                </div>
              ) : (
                <>
                  {/* Avatar */}
                  <FieldRow label={t("settings.profilePhoto", "Photo")}>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[var(--primary)]/20">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xl font-bold text-[var(--primary)]">
                            {(
                              profile.firstName?.[0] ??
                              user?.email[0] ??
                              "?"
                            ).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => avatarInputRef.current?.click()}
                          className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                        >
                          {t("settings.uploadPhoto", "Upload photo")}
                        </button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0])
                              uploadAvatar(e.target.files[0]);
                          }}
                        />
                        <p className="mt-1 text-[10px] text-[var(--muted-text)]">
                          {t("settings.photoHint", "JPG, PNG. Max 5MB.")}
                        </p>
                      </div>
                    </div>
                  </FieldRow>

                  <FieldRow
                    label={t("settings.firstName", "First name")}
                    description={t(
                      "settings.setDuringRegistration",
                      "Set during registration",
                    )}
                  >
                    <InputField
                      value={editFirstName}
                      onChange={setEditFirstName}
                      placeholder={t("settings.firstName", "First name")}
                      disabled
                    />
                  </FieldRow>
                  <FieldRow
                    label={t("settings.lastName", "Last name")}
                    description={t(
                      "settings.setDuringRegistration",
                      "Set during registration",
                    )}
                  >
                    <InputField
                      value={editLastName}
                      onChange={setEditLastName}
                      placeholder={t("settings.lastName", "Last name")}
                      disabled
                    />
                  </FieldRow>
                  <FieldRow label={t("settings.email", "Email")}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <InputField
                          value={profile.email ?? user?.email ?? ""}
                          onChange={() => {}}
                          disabled
                        />
                        {user?.emailVerified ? (
                          <Badge
                            ok={true}
                            label={t("settings.verified", "Verified")}
                          />
                        ) : (
                          <Badge
                            ok={false}
                            label={t("settings.notVerified", "Not verified")}
                          />
                        )}
                        <button
                          onClick={() => {
                            setShowEmailChange(!showEmailChange);
                            setEmailChangeConfirmStep(false);
                            setNewEmail("");
                            setEmailChangeToken("");
                          }}
                          className="shrink-0 rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                        >
                          {t("common.change", "Change")}
                        </button>
                      </div>
                      {showEmailChange && (
                        <div className="rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-3 space-y-2">
                          {!emailChangeConfirmStep ? (
                            <>
                              <p className="text-xs text-[var(--muted-text)]">
                                {t(
                                  "settings.enterNewEmail",
                                  "Enter your new email address. A confirmation link will be sent.",
                                )}
                              </p>
                              <div className="flex items-center gap-2">
                                <InputField
                                  value={newEmail}
                                  onChange={setNewEmail}
                                  placeholder="new@email.com"
                                  type="email"
                                />
                                <button
                                  onClick={requestEmailChange}
                                  disabled={emailChangeSaving}
                                  className="shrink-0 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--soft-blue)] disabled:opacity-50"
                                >
                                  {emailChangeSaving
                                    ? t("common.sending", "Sending...")
                                    : t(
                                        "settings.sendConfirmation",
                                        "Send confirmation",
                                      )}
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-[var(--muted-text)]">
                                {t(
                                  "settings.checkEmailForToken",
                                  "Check your new email for a confirmation token and enter it below.",
                                )}
                              </p>
                              <div className="flex items-center gap-2">
                                <InputField
                                  value={emailChangeToken}
                                  onChange={setEmailChangeToken}
                                  placeholder={t(
                                    "settings.pasteTokenFromEmail",
                                    "Paste token from email",
                                  )}
                                />
                                <button
                                  onClick={confirmEmailChange}
                                  disabled={emailChangeSaving}
                                  className="shrink-0 rounded-lg bg-[var(--achievement-green)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                >
                                  {emailChangeSaving
                                    ? t("common.confirming", "Confirming...")
                                    : t(
                                        "settings.confirmChange",
                                        "Confirm change",
                                      )}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </FieldRow>
                  <FieldRow label={t("settings.phone", "Phone")}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <InputField
                          value={editPhone}
                          onChange={setEditPhone}
                          placeholder="+351 912 345 678"
                          type="tel"
                        />
                        {user?.phoneVerified ? (
                          <Badge
                            ok={true}
                            label={t("settings.verified", "Verified")}
                          />
                        ) : (
                          <Badge
                            ok={false}
                            label={t("settings.notVerified", "Not verified")}
                          />
                        )}
                        <button
                          onClick={() => {
                            setShowPhoneChange(!showPhoneChange);
                            setNewPhone(editPhone);
                            setPhoneChangeCodeSent(false);
                            setPhoneChangeCode("");
                          }}
                          className="shrink-0 rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                        >
                          {t("common.change", "Change")}
                        </button>
                      </div>
                      {showPhoneChange && (
                        <div className="rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-3 space-y-2">
                          {!phoneChangeCodeSent ? (
                            <>
                              <p className="text-xs text-[var(--muted-text)]">
                                {t(
                                  "settings.enterNewPhoneNumber",
                                  "Enter your new phone number. A verification code will be sent via SMS.",
                                )}
                              </p>
                              <div className="flex items-center gap-2">
                                <InputField
                                  value={newPhone}
                                  onChange={setNewPhone}
                                  placeholder="+351 912 345 678"
                                  type="tel"
                                />
                                <button
                                  onClick={saveNewPhone}
                                  disabled={phoneChangeSaving}
                                  className="shrink-0 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--soft-blue)] disabled:opacity-50"
                                >
                                  {phoneChangeSaving
                                    ? t("common.saving", "Saving...")
                                    : t(
                                        "settings.updateAndVerify",
                                        "Update & verify",
                                      )}
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-[var(--muted-text)]">
                                {t(
                                  "settings.enter6DigitCode",
                                  "Enter the 6-digit code sent to your new phone number.",
                                )}
                              </p>
                              <div className="flex items-center gap-2">
                                <InputField
                                  value={phoneChangeCode}
                                  onChange={setPhoneChangeCode}
                                  placeholder={t(
                                    "settings.enter6DigitCode",
                                    "Enter 6-digit code",
                                  )}
                                  className="max-w-[200px]"
                                />
                                <button
                                  onClick={verifyNewPhoneCode}
                                  disabled={phoneChangeVerifying}
                                  className="shrink-0 rounded-lg bg-[var(--achievement-green)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                >
                                  {phoneChangeVerifying
                                    ? t("common.verifying", "Verifying...")
                                    : t("common.verify", "Verify")}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </FieldRow>

                  {isServiceProvider && (
                    <>
                      <FieldRow
                        label={t("settings.dateOfBirth", "Date of birth")}
                      >
                        <BrandedDatePicker
                          value={editDob}
                          onChange={setEditDob}
                          placeholder={t(
                            "settings.selectDateOfBirth",
                            "Select date of birth",
                          )}
                        />
                      </FieldRow>
                      <FieldRow label={t("settings.bio", "Bio")}>
                        <textarea
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          rows={3}
                          placeholder={t(
                            "settings.bioPlaceholder",
                            "Tell clients about yourself...",
                          )}
                          className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                        />
                      </FieldRow>
                    </>
                  )}

                  <div className="border-t border-[var(--border-color)] pt-5">
                    <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                      {t("profile.address", "Address")}
                    </h3>
                    <div className="space-y-3">
                      <FieldRow label={t("settings.street", "Street")}>
                        <InputField
                          value={editStreet}
                          onChange={setEditStreet}
                          placeholder={t(
                            "settings.streetAddress",
                            "Street address",
                          )}
                        />
                      </FieldRow>
                      <div className="grid grid-cols-2 gap-3">
                        <FieldRow label={t("profile.city", "City")}>
                          <InputField
                            value={editCity}
                            onChange={setEditCity}
                            placeholder={t("profile.city", "City")}
                          />
                        </FieldRow>
                        <FieldRow
                          label={t("settings.postalCode", "Postal code")}
                        >
                          <InputField
                            value={editPostal}
                            onChange={setEditPostal}
                            placeholder={t(
                              "settings.postalCode",
                              "Postal code",
                            )}
                          />
                        </FieldRow>
                      </div>
                      <FieldRow label={t("profile.country", "Country")}>
                        <BrandedSelect
                          value={editCountry}
                          onChange={setEditCountry}
                          placeholder={t(
                            "settings.selectCountry",
                            "Select country",
                          )}
                          options={EU_COUNTRIES.map((c) => ({
                            value: c.code,
                            label: c.name,
                          }))}
                        />
                      </FieldRow>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <SaveButton onClick={saveProfile} loading={profileSaving} />
                  </div>
                </>
              )}
            </SectionCard>
          )}

          {/* ────── PROFESSIONAL PROFILE ────── */}
          {activeSection === "professional" && isServiceProvider && (
            <div className="space-y-6">
              <SectionCard
                title={t(
                  "settings.professionalProfile",
                  "Professional Profile",
                )}
                description={t(
                  "settings.professionalDescription",
                  "Your professional information visible to clients when applying for jobs.",
                )}
              >
                {!proLoaded ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-10 animate-pulse rounded-lg bg-[var(--surface-alt)]"
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* About Me */}
                    <FieldRow
                      label={t("settings.aboutMe", "About Me")}
                      description={t(
                        "settings.describeProfessionalBackground",
                        "Describe your professional background",
                      )}
                    >
                      <textarea
                        value={proAboutMe}
                        onChange={(e) => setProAboutMe(e.target.value)}
                        rows={4}
                        placeholder={t(
                          "settings.iAmAProfessionalPlaceholder",
                          "I am a professional with experience in...",
                        )}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                      />
                    </FieldRow>
                  </>
                )}
              </SectionCard>

              {/* ── Rates ── */}
              <SectionCard
                title={t("settings.serviceRates", "Service Rates")}
                description={t(
                  "settings.serviceRatesDescription",
                  "Define your pricing for different payment types. At least one rate is required.",
                )}
              >
                <div className="space-y-4">
                  {proRates.map((r, idx) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {t("settings.rate", "Rate")} {idx + 1}
                        </span>
                        {proRates.length > 1 && (
                          <button
                            onClick={() =>
                              setProRates((prev) =>
                                prev.filter((x) => x.id !== r.id),
                              )
                            }
                            className="text-xs font-medium text-[var(--alert-red)] hover:underline"
                          >
                            {t("common.remove", "Remove")}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("common.amount", "Amount")} (&euro;)
                          </label>
                          <InputField
                            value={r.rate}
                            onChange={(v) =>
                              setProRates((prev) =>
                                prev.map((x) =>
                                  x.id === r.id ? { ...x, rate: v } : x,
                                ),
                              )
                            }
                            placeholder="0.00"
                            type="number"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("common.paymentType", "Payment Type")}
                          </label>
                          <BrandedSelect
                            value={r.paymentType}
                            onChange={(v) =>
                              setProRates((prev) =>
                                prev.map((x) =>
                                  x.id === r.id ? { ...x, paymentType: v } : x,
                                ),
                              )
                            }
                            options={PAYMENT_TYPES.map((pt) => ({
                              value: pt.value,
                              label: pt.label,
                            }))}
                            size="sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("common.description", "Description")}
                          </label>
                          <InputField
                            value={r.description}
                            onChange={(v) =>
                              setProRates((prev) =>
                                prev.map((x) =>
                                  x.id === r.id ? { ...x, description: v } : x,
                                ),
                              )
                            }
                            placeholder="e.g. Web development"
                          />
                        </div>
                      </div>
                      {r.paymentType === "OTHER" && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t(
                              "settings.specifyPaymentType",
                              "Specify payment type",
                            )}
                          </label>
                          <InputField
                            value={r.otherSpecification}
                            onChange={(v) =>
                              setProRates((prev) =>
                                prev.map((x) =>
                                  x.id === r.id
                                    ? { ...x, otherSpecification: v }
                                    : x,
                                ),
                              )
                            }
                            placeholder="e.g. Per project"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setProRates((prev) => [
                        ...prev,
                        {
                          id: uid(),
                          rate: "",
                          description: "",
                          paymentType: "HOUR",
                          otherSpecification: "",
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    {t("settings.addRate", "Add rate")}
                  </button>
                </div>
              </SectionCard>

              {/* ── Skills ── */}
              <SectionCard
                title={t("settings.skills", "Skills")}
                description={t(
                  "settings.skillsDescription",
                  "List your professional skills and years of experience.",
                )}
              >
                <div className="space-y-3">
                  {proSkills.map((s, idx) => (
                    <div key={s.id} className="flex items-end gap-3">
                      <div className="flex-1">
                        {idx === 0 && (
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.skillName", "Skill name")}
                          </label>
                        )}
                        <InputField
                          value={s.name}
                          onChange={(v) =>
                            setProSkills((prev) =>
                              prev.map((x) =>
                                x.id === s.id ? { ...x, name: v } : x,
                              ),
                            )
                          }
                          placeholder="e.g. Plumbing"
                        />
                      </div>
                      <div className="w-28">
                        {idx === 0 && (
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.years", "Years")}
                          </label>
                        )}
                        <InputField
                          value={s.yearsExperience}
                          onChange={(v) =>
                            setProSkills((prev) =>
                              prev.map((x) =>
                                x.id === s.id
                                  ? { ...x, yearsExperience: v }
                                  : x,
                              ),
                            )
                          }
                          placeholder="0"
                          type="number"
                        />
                      </div>
                      {proSkills.length > 1 && (
                        <button
                          onClick={() =>
                            setProSkills((prev) =>
                              prev.filter((x) => x.id !== s.id),
                            )
                          }
                          className="mb-0.5 text-[var(--alert-red)] hover:opacity-80"
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
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setProSkills((prev) => [
                        ...prev,
                        { id: uid(), name: "", yearsExperience: "" },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    {t("settings.addSkill", "Add skill")}
                  </button>
                </div>
              </SectionCard>

              {/* ── Languages ── */}
              <SectionCard
                title={t("settings.languages", "Languages")}
                description={t(
                  "settings.languagesDescription",
                  "Languages you speak (optional).",
                )}
              >
                <div className="space-y-3">
                  {proLanguages.map((l, idx) => (
                    <div key={l.id} className="flex items-end gap-3">
                      <div className="flex-1">
                        {idx === 0 && (
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.language", "Language")}
                          </label>
                        )}
                        <InputField
                          value={l.language}
                          onChange={(v) =>
                            setProLanguages((prev) =>
                              prev.map((x) =>
                                x.id === l.id ? { ...x, language: v } : x,
                              ),
                            )
                          }
                          placeholder="e.g. English"
                        />
                      </div>
                      <div className="w-44">
                        {idx === 0 && (
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.level", "Level")}
                          </label>
                        )}
                        <BrandedSelect
                          value={l.level}
                          onChange={(v) =>
                            setProLanguages((prev) =>
                              prev.map((x) =>
                                x.id === l.id ? { ...x, level: v } : x,
                              ),
                            )
                          }
                          options={LANG_LEVELS.map((ll) => ({
                            value: ll.value,
                            label: ll.label,
                          }))}
                          size="sm"
                        />
                      </div>
                      <button
                        onClick={() =>
                          setProLanguages((prev) =>
                            prev.filter((x) => x.id !== l.id),
                          )
                        }
                        className="mb-0.5 text-[var(--alert-red)] hover:opacity-80"
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
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setProLanguages((prev) => [
                        ...prev,
                        { id: uid(), language: "", level: "BEGINNER" },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    {t("settings.addLanguage", "Add language")}
                  </button>
                </div>
              </SectionCard>

              {/* ── Work Experience ── */}
              <SectionCard
                title={t("settings.workExperience", "Work Experience")}
                description={t(
                  "settings.workExperienceDescription",
                  "Your previous work history (optional).",
                )}
              >
                <div className="space-y-4">
                  {proWorkExp.map((w) => (
                    <div
                      key={w.id}
                      className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {w.company || t("settings.newEntry", "New entry")}
                        </span>
                        <button
                          onClick={() =>
                            setProWorkExp((prev) =>
                              prev.filter((x) => x.id !== w.id),
                            )
                          }
                          className="text-xs font-medium text-[var(--alert-red)] hover:underline"
                        >
                          {t("common.remove", "Remove")}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.company", "Company")}
                          </label>
                          <InputField
                            value={w.company}
                            onChange={(v) =>
                              setProWorkExp((prev) =>
                                prev.map((x) =>
                                  x.id === w.id ? { ...x, company: v } : x,
                                ),
                              )
                            }
                            placeholder={t(
                              "settings.companyName",
                              "Company name",
                            )}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.category", "Category")}
                          </label>
                          <InputField
                            value={w.category}
                            onChange={(v) =>
                              setProWorkExp((prev) =>
                                prev.map((x) =>
                                  x.id === w.id ? { ...x, category: v } : x,
                                ),
                              )
                            }
                            placeholder="e.g. Construction"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.from", "From")}
                          </label>
                          <BrandedDatePicker
                            value={w.fromDate}
                            onChange={(v) =>
                              setProWorkExp((prev) =>
                                prev.map((x) =>
                                  x.id === w.id ? { ...x, fromDate: v } : x,
                                ),
                              )
                            }
                            placeholder={t("common.selectDate", "Select date")}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.to", "To")}
                          </label>
                          {w.isCurrent ? (
                            <p className="py-2 text-sm text-[var(--muted-text)]">
                              {t("settings.present", "Present")}
                            </p>
                          ) : (
                            <BrandedDatePicker
                              value={w.toDate}
                              onChange={(v) =>
                                setProWorkExp((prev) =>
                                  prev.map((x) =>
                                    x.id === w.id ? { ...x, toDate: v } : x,
                                  ),
                                )
                              }
                              placeholder={t(
                                "common.selectDate",
                                "Select date",
                              )}
                            />
                          )}
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                        <input
                          type="checkbox"
                          checked={w.isCurrent}
                          onChange={(e) =>
                            setProWorkExp((prev) =>
                              prev.map((x) =>
                                x.id === w.id
                                  ? { ...x, isCurrent: e.target.checked }
                                  : x,
                              ),
                            )
                          }
                          className="accent-[var(--primary)]"
                        />
                        {t(
                          "settings.currentlyWorkingHere",
                          "Currently working here",
                        )}
                      </label>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                          {t("common.description", "Description")}
                        </label>
                        <textarea
                          value={w.description}
                          onChange={(e) =>
                            setProWorkExp((prev) =>
                              prev.map((x) =>
                                x.id === w.id
                                  ? { ...x, description: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          rows={2}
                          placeholder={t(
                            "settings.describeYourRole",
                            "Describe your role...",
                          )}
                          className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setProWorkExp((prev) => [
                        ...prev,
                        {
                          id: uid(),
                          company: "",
                          category: "",
                          years: "",
                          description: "",
                          fromDate: "",
                          toDate: "",
                          isCurrent: false,
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    {t("settings.addWorkExperience", "Add work experience")}
                  </button>
                </div>
              </SectionCard>

              {/* ── Certifications ── */}
              <SectionCard
                title={t("settings.certifications", "Certifications")}
                description={t(
                  "settings.certificationsDescription",
                  "Professional certifications or licenses (optional).",
                )}
              >
                <div className="space-y-4">
                  {proCerts.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {c.title ||
                            t("settings.newCertification", "New certification")}
                        </span>
                        <button
                          onClick={() =>
                            setProCerts((prev) =>
                              prev.filter((x) => x.id !== c.id),
                            )
                          }
                          className="text-xs font-medium text-[var(--alert-red)] hover:underline"
                        >
                          {t("common.remove", "Remove")}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("common.title", "Title")}
                          </label>
                          <InputField
                            value={c.title}
                            onChange={(v) =>
                              setProCerts((prev) =>
                                prev.map((x) =>
                                  x.id === c.id ? { ...x, title: v } : x,
                                ),
                              )
                            }
                            placeholder={t(
                              "settings.certificationTitle",
                              "Certification title",
                            )}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.institution", "Institution")}
                          </label>
                          <InputField
                            value={c.institution}
                            onChange={(v) =>
                              setProCerts((prev) =>
                                prev.map((x) =>
                                  x.id === c.id ? { ...x, institution: v } : x,
                                ),
                              )
                            }
                            placeholder={t(
                              "settings.issuingInstitution",
                              "Issuing institution",
                            )}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("common.date", "Date")}
                          </label>
                          <BrandedDatePicker
                            value={c.graduationDate}
                            onChange={(v) =>
                              setProCerts((prev) =>
                                prev.map((x) =>
                                  x.id === c.id
                                    ? { ...x, graduationDate: v }
                                    : x,
                                ),
                              )
                            }
                            placeholder={t("common.selectDate", "Select date")}
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                        <input
                          type="checkbox"
                          checked={c.isStillStudying}
                          onChange={(e) =>
                            setProCerts((prev) =>
                              prev.map((x) =>
                                x.id === c.id
                                  ? { ...x, isStillStudying: e.target.checked }
                                  : x,
                              ),
                            )
                          }
                          className="accent-[var(--primary)]"
                        />
                        {t("settings.inProgress", "In progress")}
                      </label>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setProCerts((prev) => [
                        ...prev,
                        {
                          id: uid(),
                          title: "",
                          institution: "",
                          graduationDate: "",
                          isStillStudying: false,
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    {t("settings.addCertification", "Add certification")}
                  </button>
                </div>
              </SectionCard>

              {/* ── Education ── */}
              <SectionCard
                title={t("settings.education", "Education")}
                description={t(
                  "settings.educationDescription",
                  "Your educational background (optional).",
                )}
              >
                <div className="space-y-4">
                  {proEducation.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {e.title || t("settings.newEntry", "New entry")}
                        </span>
                        <button
                          onClick={() =>
                            setProEducation((prev) =>
                              prev.filter((x) => x.id !== e.id),
                            )
                          }
                          className="text-xs font-medium text-[var(--alert-red)] hover:underline"
                        >
                          {t("common.remove", "Remove")}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.degreeCourse", "Degree / Course")}
                          </label>
                          <InputField
                            value={e.title}
                            onChange={(v) =>
                              setProEducation((prev) =>
                                prev.map((x) =>
                                  x.id === e.id ? { ...x, title: v } : x,
                                ),
                              )
                            }
                            placeholder="e.g. Bachelor of Engineering"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.institution", "Institution")}
                          </label>
                          <InputField
                            value={e.institution}
                            onChange={(v) =>
                              setProEducation((prev) =>
                                prev.map((x) =>
                                  x.id === e.id ? { ...x, institution: v } : x,
                                ),
                              )
                            }
                            placeholder={t(
                              "settings.schoolOrUniversity",
                              "School or university",
                            )}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.graduationDate", "Graduation date")}
                          </label>
                          <BrandedDatePicker
                            value={e.graduationDate}
                            onChange={(v) =>
                              setProEducation((prev) =>
                                prev.map((x) =>
                                  x.id === e.id
                                    ? { ...x, graduationDate: v }
                                    : x,
                                ),
                              )
                            }
                            placeholder={t("common.selectDate", "Select date")}
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                        <input
                          type="checkbox"
                          checked={e.isStillStudying}
                          onChange={(e2) =>
                            setProEducation((prev) =>
                              prev.map((x) =>
                                x.id === e.id
                                  ? { ...x, isStillStudying: e2.target.checked }
                                  : x,
                              ),
                            )
                          }
                          className="accent-[var(--primary)]"
                        />
                        {t("settings.currentlyStudying", "Currently studying")}
                      </label>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setProEducation((prev) => [
                        ...prev,
                        {
                          id: uid(),
                          title: "",
                          institution: "",
                          graduationDate: "",
                          isStillStudying: false,
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    {t("settings.addEducation", "Add education")}
                  </button>
                </div>
              </SectionCard>

              {/* ── Projects ── */}
              <SectionCard
                title={t("settings.projects", "Projects")}
                description={t(
                  "settings.projectsDescription",
                  "Showcase your past projects (optional).",
                )}
              >
                <div className="space-y-4">
                  {proProjects.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {p.title || t("settings.newProject", "New project")}
                        </span>
                        <button
                          onClick={() =>
                            setProProjects((prev) =>
                              prev.filter((x) => x.id !== p.id),
                            )
                          }
                          className="text-xs font-medium text-[var(--alert-red)] hover:underline"
                        >
                          {t("common.remove", "Remove")}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("common.title", "Title")}
                          </label>
                          <InputField
                            value={p.title}
                            onChange={(v) =>
                              setProProjects((prev) =>
                                prev.map((x) =>
                                  x.id === p.id ? { ...x, title: v } : x,
                                ),
                              )
                            }
                            placeholder={t(
                              "settings.projectName",
                              "Project name",
                            )}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                            {t("settings.url", "URL")}
                          </label>
                          <InputField
                            value={p.url}
                            onChange={(v) =>
                              setProProjects((prev) =>
                                prev.map((x) =>
                                  x.id === p.id ? { ...x, url: v } : x,
                                ),
                              )
                            }
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[var(--muted-text)]">
                          {t("common.description", "Description")}
                        </label>
                        <textarea
                          value={p.description}
                          onChange={(ev) =>
                            setProProjects((prev) =>
                              prev.map((x) =>
                                x.id === p.id
                                  ? { ...x, description: ev.target.value }
                                  : x,
                              ),
                            )
                          }
                          rows={2}
                          placeholder={t(
                            "settings.whatWasProjectAbout",
                            "What was this project about?",
                          )}
                          className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setProProjects((prev) => [
                        ...prev,
                        { id: uid(), title: "", description: "", url: "" },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    {t("settings.addProject", "Add project")}
                  </button>
                </div>
              </SectionCard>

              {/* ── Save ── */}
              <div className="flex justify-end">
                <SaveButton
                  onClick={saveProfessionalProfile}
                  loading={proSaving}
                  label={t(
                    "settings.saveProfessionalProfile",
                    "Save professional profile",
                  )}
                />
              </div>
            </div>
          )}

          {/* ────── PASSWORD ────── */}
          {activeSection === "password" && (
            <SectionCard
              title={t("settings.password", "Password")}
              description={t(
                "settings.changePasswordDescription",
                "Change your account password.",
              )}
            >
              <FieldRow
                label={t("settings.currentPassword", "Current password")}
              >
                <InputField
                  value={currentPw}
                  onChange={setCurrentPw}
                  type="password"
                  placeholder={t(
                    "settings.currentPassword",
                    "Current password",
                  )}
                />
              </FieldRow>
              <FieldRow label={t("settings.newPassword", "New password")}>
                <div className="space-y-2">
                  <InputField
                    value={newPw}
                    onChange={setNewPw}
                    type="password"
                    placeholder={t("settings.newPassword", "New password")}
                  />
                  {newPw && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-1 gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength ? pwStrengthColor : "bg-[var(--surface-alt)]"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[var(--muted-text)]">
                          {pwStrengthLabel}
                        </span>
                      </div>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {[
                          {
                            ok: pwHasLen,
                            text: t("settings.pwMinChars", "8+ characters"),
                          },
                          {
                            ok: pwHasUpper,
                            text: t("settings.pwUppercase", "Uppercase letter"),
                          },
                          {
                            ok: pwHasLower,
                            text: t("settings.pwLowercase", "Lowercase letter"),
                          },
                          {
                            ok: pwHasDigit,
                            text: t("settings.pwNumber", "Number"),
                          },
                          {
                            ok: pwHasSpecial,
                            text: t("settings.pwSpecial", "Special character"),
                          },
                        ].map((r) => (
                          <li
                            key={r.text}
                            className={`flex items-center gap-1.5 ${r.ok ? "text-[var(--achievement-green)]" : "text-[var(--muted-text)]"}`}
                          >
                            {r.ok ? (
                              <svg
                                className="h-3.5 w-3.5"
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
                            ) : (
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <circle cx="12" cy="12" r="9" />
                              </svg>
                            )}
                            {r.text}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </FieldRow>
              <FieldRow
                label={t("settings.confirmPassword", "Confirm password")}
              >
                <div className="space-y-1">
                  <InputField
                    value={confirmPw}
                    onChange={setConfirmPw}
                    type="password"
                    placeholder={t(
                      "settings.enterConfirmPassword",
                      "Confirm new password",
                    )}
                  />
                  {confirmPw && newPw && confirmPw !== newPw && (
                    <p className="text-xs text-[var(--alert-red)]">
                      {t(
                        "settings.passwordsDoNotMatch",
                        "Passwords do not match",
                      )}
                    </p>
                  )}
                </div>
              </FieldRow>
              <div className="flex justify-end pt-2">
                <SaveButton
                  onClick={changePassword}
                  loading={pwSaving}
                  label={t("settings.changePassword", "Change password")}
                />
              </div>
            </SectionCard>
          )}

          {/* ────── VERIFICATION ────── */}
          {activeSection === "verification" && (
            <SectionCard
              title={t("settings.verification", "Verification")}
              description={
                isServiceProvider
                  ? t(
                      "settings.verificationDescriptionSP",
                      "Complete all verifications to access instant jobs and receive payouts.",
                    )
                  : t(
                      "settings.verificationDescriptionEmployer",
                      "Verify your email and phone to post jobs and request workers.",
                    )
              }
            >
              {/* Email */}
              <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${user?.emailVerified ? "bg-[var(--achievement-green)]/15 text-[var(--achievement-green)]" : "bg-[var(--alert-red)]/15 text-[var(--alert-red)]"}`}
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
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {t("settings.emailAddress", "Email Address")}
                    </p>
                    <p className="text-xs text-[var(--muted-text)]">
                      {user?.email}
                    </p>
                  </div>
                </div>
                {user?.emailVerified ? (
                  <Badge ok={true} label={t("settings.verified", "Verified")} />
                ) : (
                  <button
                    onClick={sendEmailVerification}
                    disabled={emailVerifSending}
                    className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[var(--soft-blue)] disabled:opacity-50"
                  >
                    {emailVerifSending
                      ? t("common.sending", "Sending...")
                      : t("settings.sendVerification", "Send verification")}
                  </button>
                )}
              </div>

              {/* Phone */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${user?.phoneVerified ? "bg-[var(--achievement-green)]/15 text-[var(--achievement-green)]" : "bg-[var(--alert-red)]/15 text-[var(--alert-red)]"}`}
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
                          d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {t("settings.phoneNumber", "Phone Number")}
                      </p>
                      <p className="text-xs text-[var(--muted-text)]">
                        {editPhone || t("profile.notSet", "Not set")}
                      </p>
                    </div>
                  </div>
                  {user?.phoneVerified ? (
                    <Badge
                      ok={true}
                      label={t("settings.verified", "Verified")}
                    />
                  ) : (
                    <button
                      onClick={sendPhoneVerification}
                      disabled={phoneVerifSending}
                      className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[var(--soft-blue)] disabled:opacity-50"
                    >
                      {phoneVerifSending
                        ? t("common.sending", "Sending...")
                        : t("settings.sendCode", "Send code")}
                    </button>
                  )}
                </div>
                {phoneCodeSent && !user?.phoneVerified && (
                  <div className="mt-3 flex items-center gap-2">
                    <InputField
                      value={phoneCode}
                      onChange={setPhoneCode}
                      placeholder={t("settings.enterCode", "Enter code")}
                      className="max-w-[160px]"
                    />
                    <button
                      onClick={verifyPhoneCode}
                      disabled={phoneVerifying}
                      className="rounded-lg bg-[var(--achievement-green)] px-3 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {phoneVerifying
                        ? t("common.verifying", "Verifying...")
                        : t("common.verify", "Verify")}
                    </button>
                  </div>
                )}
              </div>

              {/* ID & Background check (service providers only) */}
              {isServiceProvider && (
                <>
                  <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-[var(--primary)]">
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
                            d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {t("settings.idVerification", "ID Verification")}
                        </p>
                        <p className="text-xs text-[var(--muted-text)]">
                          {t(
                            "settings.idVerificationDescription",
                            "Government-issued ID and selfie",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={kycStatus.idVerification} />
                      {(!kycStatus.idVerification ||
                        kycStatus.idVerification === "NOT_STARTED" ||
                        kycStatus.idVerification === "REJECTED") && (
                        <span className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-1.5 text-[10px] font-medium text-[var(--muted-text)]">
                          {t(
                            "settings.completeOnMobile",
                            "Complete on mobile app",
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-[var(--primary)]">
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
                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {t("profile.backgroundCheck", "Background Check")}
                        </p>
                        <p className="text-xs text-[var(--muted-text)]">
                          {t(
                            "settings.backgroundCheckDescription",
                            "Criminal record and background verification",
                          )}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={kycStatus.backgroundCheck} />
                  </div>
                </>
              )}

              {/* Address verification (employers) */}
              {isEmployer && (
                <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${user?.addressVerified ? "bg-[var(--achievement-green)]/15 text-[var(--achievement-green)]" : "bg-[var(--alert-red)]/15 text-[var(--alert-red)]"}`}
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
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {t("settings.physicalAddress", "Physical Address")}
                      </p>
                      <p className="text-xs text-[var(--muted-text)]">
                        {t(
                          "settings.requiredForPostingJobs",
                          "Required for posting jobs",
                        )}
                      </p>
                    </div>
                  </div>
                  {user?.addressVerified ? (
                    <Badge
                      ok={true}
                      label={t("settings.verified", "Verified")}
                    />
                  ) : (
                    <button
                      onClick={() => setActiveSection("profile")}
                      className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[var(--soft-blue)]"
                    >
                      {t("settings.addAddress", "Add address")}
                    </button>
                  )}
                </div>
              )}
            </SectionCard>
          )}

          {/* ────── PAYMENT ────── */}
          {activeSection === "payment" && (
            <SectionCard
              title={t("settings.payment", "Payment")}
              description={
                isServiceProvider
                  ? t(
                      "settings.paymentDescriptionSP",
                      "Set up your bank account to receive payouts via Stripe Connect.",
                    )
                  : t(
                      "settings.paymentDescriptionEmployer",
                      "Manage your payment methods for hiring service providers.",
                    )
              }
            >
              {isServiceProvider && (
                <>
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${connectStatus.payoutsEnabled ? "bg-[var(--achievement-green)]/15 text-[var(--achievement-green)]" : "bg-[var(--fulfillment-gold)]/15 text-[var(--fulfillment-gold)]"}`}
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
                              d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            Stripe Connect
                          </p>
                          <p className="text-xs text-[var(--muted-text)]">
                            {connectStatus.payoutsEnabled
                              ? `${t("settings.payoutsEnabled", "Payouts enabled")}${connectStatus.bankAccountLast4 ? ` · ****${connectStatus.bankAccountLast4}` : ""}`
                              : connectStatus.detailsSubmitted
                                ? t(
                                    "settings.detailsSubmittedAwaitingApproval",
                                    "Details submitted, awaiting approval",
                                  )
                                : t(
                                    "settings.setupBankAccount",
                                    "Set up your bank account to get paid",
                                  )}
                          </p>
                        </div>
                      </div>
                      {connectStatus.payoutsEnabled ? (
                        <Badge
                          ok={true}
                          label={t("settings.active", "Active")}
                        />
                      ) : connectStatus.detailsSubmitted ? (
                        <StatusBadge status="PENDING" />
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      {t("settings.bankAccount", "Bank Account")}
                    </h3>
                    <FieldRow label={t("profile.country", "Country")}>
                      <BrandedSelect
                        value={ibanCountry}
                        onChange={setIbanCountry}
                        options={EU_COUNTRIES.map((c) => ({
                          value: c.code,
                          label: c.name,
                        }))}
                        placeholder={t(
                          "settings.selectCountry",
                          "Select country",
                        )}
                      />
                    </FieldRow>
                    <FieldRow label={t("settings.iban", "IBAN")}>
                      <InputField
                        value={ibanValue}
                        onChange={setIbanValue}
                        placeholder="PT50 0002 0123 1234 5678 9015 4"
                      />
                    </FieldRow>
                    <div className="flex justify-end">
                      <SaveButton
                        onClick={saveBankAccount}
                        loading={bankSaving}
                        label={t(
                          "settings.saveBankAccount",
                          "Save bank account",
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              {isEmployer && (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      {t(
                        "settings.savedPaymentMethods",
                        "Saved Payment Methods",
                      )}
                    </h3>
                    {paymentMethods.length === 0 ? (
                      <p className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4 text-sm text-[var(--muted-text)]">
                        {t(
                          "settings.noPaymentMethodsSaved",
                          "No payment methods saved. Payment methods are added when you book a service provider.",
                        )}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {paymentMethods.map((pm) => (
                          <div
                            key={pm.id}
                            className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-[var(--primary)]">
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
                                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                  {pm.brand?.toUpperCase() ?? "Card"} ····
                                  {pm.last4}
                                </p>
                                <p className="text-xs text-[var(--muted-text)]">
                                  {t("settings.expires", "Expires")}{" "}
                                  {pm.expMonth}/{pm.expYear}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </SectionCard>
          )}

          {/* ────── PREFERENCES ────── */}
          {activeSection === "preferences" && (
            <SectionCard
              title={t("settings.preferencesNav", "Preferences")}
              description={t(
                "settings.preferencesDescription",
                "Customize your experience.",
              )}
            >
              <FieldRow label={t("settings.theme", "Theme")}>
                <div className="flex gap-2">
                  {(["light", "dark", "system"] as ThemePref[]).map((thm) => (
                    <button
                      key={thm}
                      onClick={() => {
                        setThemePref(thm);
                        applyTheme(thm);
                      }}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                        themePref === thm
                          ? "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]"
                          : "border-[var(--border-color)] bg-[var(--surface-alt)] text-[var(--muted-text)] hover:border-[var(--primary)]/30"
                      }`}
                    >
                      {thm === "light" && (
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
                            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                          />
                        </svg>
                      )}
                      {thm === "dark" && (
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
                            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 006.002-2.082z"
                          />
                        </svg>
                      )}
                      {thm === "system" && (
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
                            d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z"
                          />
                        </svg>
                      )}
                      {thm === "light"
                        ? t("settings.themeLight", "Light")
                        : thm === "dark"
                          ? t("settings.themeDark", "Dark")
                          : t("settings.themeSystem", "System")}
                    </button>
                  ))}
                </div>
              </FieldRow>

              <FieldRow
                label={t("settings.notifications", "Notifications")}
                description={t(
                  "settings.notificationsDescription",
                  "Email and push notification preferences",
                )}
              >
                <div className="space-y-3">
                  <label className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] p-3">
                    <span className="text-sm text-[var(--foreground)]">
                      {t(
                        "settings.emailJobMatchNotifications",
                        "Email job match notifications",
                      )}
                    </span>
                    <button
                      onClick={() => {
                        const v = !emailNotifs;
                        setEmailNotifs(v);
                        localStorage.setItem(
                          "notif_prefs",
                          JSON.stringify({ email: v, push: pushNotifs }),
                        );
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifs ? "bg-[var(--primary)]" : "bg-[var(--border-color)]"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${emailNotifs ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </label>
                  <label className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] p-3">
                    <span className="text-sm text-[var(--foreground)]">
                      {t("settings.pushNotifications", "Push notifications")}
                    </span>
                    <button
                      onClick={() => {
                        const v = !pushNotifs;
                        setPushNotifs(v);
                        localStorage.setItem(
                          "notif_prefs",
                          JSON.stringify({ email: emailNotifs, push: v }),
                        );
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pushNotifs ? "bg-[var(--primary)]" : "bg-[var(--border-color)]"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${pushNotifs ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </label>
                </div>
              </FieldRow>

              <FieldRow
                label={t("settings.language", "Language")}
                description={t(
                  "settings.moreLanguagesComingSoon",
                  "More languages coming soon",
                )}
              >
                <BrandedSelect
                  value="en"
                  onChange={() => {}}
                  options={[
                    { value: "en", label: "English" },
                    { value: "pt", label: "Português" },
                  ]}
                />
              </FieldRow>
            </SectionCard>
          )}

          {/* ────── LEGAL ────── */}
          {activeSection === "legal" && (
            <SectionCard
              title={t("settings.legalNav", "Legal")}
              description={t(
                "settings.legalDescription",
                "Review and accept platform agreements.",
              )}
            >
              {[
                {
                  key: "terms" as const,
                  label: t("settings.termsOfService", "Terms of Service"),
                  href: "/terms",
                  accepted: legalStatus.termsAccepted,
                  date: legalStatus.termsAcceptedAt,
                },
                {
                  key: "privacy" as const,
                  label: t("settings.privacyPolicy", "Privacy Policy"),
                  href: "/privacy",
                  accepted: legalStatus.privacyAccepted,
                  date: legalStatus.privacyAcceptedAt,
                },
                {
                  key: "platform-rules" as const,
                  label: t("settings.platformRules", "Platform Rules"),
                  href: "/platform-rules",
                  accepted: legalStatus.platformRulesAccepted,
                  date: legalStatus.platformRulesAcceptedAt,
                },
              ].map((doc) => (
                <div
                  key={doc.key}
                  className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${doc.accepted ? "bg-[var(--achievement-green)]/15 text-[var(--achievement-green)]" : "bg-[var(--muted-text)]/15 text-[var(--muted-text)]"}`}
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
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {doc.label}
                      </p>
                      <p className="text-xs text-[var(--muted-text)]">
                        {doc.accepted && doc.date
                          ? `${t("settings.acceptedOn", "Accepted on")} ${new Date(doc.date).toLocaleDateString()}`
                          : t("settings.notYetAccepted", "Not yet accepted")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={doc.href}
                      className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--muted-text)] transition-colors hover:text-[var(--foreground)]"
                    >
                      {t("common.view", "View")}
                    </Link>
                    {!doc.accepted && (
                      <button
                        onClick={() => acceptLegal(doc.key)}
                        disabled={legalLoading}
                        className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[var(--soft-blue)] disabled:opacity-50"
                      >
                        {t("common.accept", "Accept")}
                      </button>
                    )}
                    {doc.accepted && (
                      <Badge
                        ok={true}
                        label={t("settings.accepted", "Accepted")}
                      />
                    )}
                  </div>
                </div>
              ))}
            </SectionCard>
          )}

          {/* ────── ACCOUNT ────── */}
          {activeSection === "account" && (
            <div className="space-y-6">
              <SectionCard
                title={t("settings.account", "Account")}
                description={t(
                  "settings.accountDescription",
                  "Sign out or manage your account.",
                )}
              >
                <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--surface-alt)] p-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {t("settings.signOut", "Sign out")}
                    </p>
                    <p className="text-xs text-[var(--muted-text)]">
                      {t(
                        "settings.signOutDescription",
                        "Sign out of your account on this device.",
                      )}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-alt)]"
                  >
                    {t("settings.signOut", "Sign out")}
                  </button>
                </div>
              </SectionCard>

              <div className="rounded-2xl border border-[var(--alert-red)]/30 bg-[var(--alert-red)]/5 p-6">
                <h2 className="text-lg font-semibold text-[var(--alert-red)]">
                  {t("settings.dangerZone", "Danger Zone")}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted-text)]">
                  {t(
                    "settings.deleteAccountWarning",
                    "Permanently delete your account and all associated data. This action cannot be undone.",
                  )}
                </p>
                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="mt-4 rounded-lg border border-[var(--alert-red)]/30 bg-[var(--alert-red)]/10 px-4 py-2 text-sm font-semibold text-[var(--alert-red)] transition-all hover:bg-[var(--alert-red)]/20"
                  >
                    {t("settings.deleteMyAccount", "Delete my account")}
                  </button>
                ) : (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder={t(
                        "settings.deleteReasonPlaceholder",
                        "Please tell us why you want to delete your account (optional)",
                      )}
                      maxLength={500}
                      rows={3}
                      className="w-full rounded-lg border border-[var(--alert-red)]/30 bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--alert-red)]/40"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={requestDeletion}
                        disabled={deleteLoading}
                        className="rounded-lg bg-[var(--alert-red)] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {deleteLoading
                          ? t("common.processing", "Processing...")
                          : t(
                              "settings.yesDeleteMyAccount",
                              "Yes, delete my account",
                            )}
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirm(false);
                          setDeleteReason("");
                        }}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-alt)]"
                      >
                        {t("common.cancel", "Cancel")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
