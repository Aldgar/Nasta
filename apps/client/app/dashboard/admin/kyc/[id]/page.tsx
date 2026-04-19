"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, API_BASE } from "../../../../../lib/api";
import Avatar from "../../../../../components/Avatar";

/* ─── Types ─── */
interface CertDoc {
  url: string;
  status: string;
  uploadedAt: string;
}

interface Vehicle {
  id: string;
  vehicleType: string;
  otherTypeSpecification?: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  licensePlate: string;
  capacity?: string;
  photoFrontUrl?: string;
  photoBackUrl?: string;
  photoLeftUrl?: string;
  photoRightUrl?: string;
  vehicleLicenseUrl?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  documentAnalysisScore?: number | null;
  documentAnalysisFlags?: string[];
  documentAnalyzedAt?: string | null;
}

interface ExtractedData {
  // Admin-entered fields
  legalFirstName?: string;
  legalLastName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  placeOfBirth?: string;
  documentNumber?: string;
  documentType?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingCountry?: string;
  issuingAuthority?: string;
  bsnNumber?: string;
  address?: string;
  mrzLine1?: string;
  mrzLine2?: string;
  photoMatchConfirmed?: boolean;
  workAuthorization?: string;
  adminNotes?: string;
  isEuCitizen?: boolean;
  citizenshipCountry?: string;
  // Didit-extracted fields
  firstName?: string;
  lastName?: string;
  fullName?: string;
  expirationDate?: string;
  issuingState?: string;
  issuingStateName?: string;
  warnings?: string[];
}

interface VerificationDetail {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    role?: string;
    country?: string;
    isIdVerified: boolean;
    idVerificationStatus: string;
  };
  verificationType: string;
  status: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  certifications?: CertDoc[];
  cvDocuments?: CertDoc[];
  documentNumber?: string;
  documentCountry?: string;
  documentExpiry?: string;
  documentStatuses?: Record<string, string>;
  confidence?: number;
  faceMatch?: number;
  livenessCheck?: boolean;
  extractedData?: ExtractedData;
  extractedBy?: string;
  extractedAt?: string;
  fraudChecks?: { warnings?: string[]; errors?: string[] };
  providerReference?: string;
  createdAt: string;
  updatedAt: string;
  allVerifications?: {
    id: string;
    verificationType: string;
    status: string;
    documentFrontUrl?: string;
    documentBackUrl?: string;
    selfieUrl?: string;
    documentStatuses?: Record<string, string>;
    createdAt: string;
  }[];
  backgroundCheck?: {
    id: string;
    status: string;
    uploadedDocument?: string;
    certificateNumber?: string;
    submittedAt?: string;
    createdAt: string;
    documentAnalysisScore?: number | null;
    documentAnalysisFlags?: string[];
    documentAnalyzedAt?: string | null;
  };
  vehicles?: Vehicle[];
}

/* ─── Helpers ─── */
function resolveUrl(raw?: string | null): string {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  const base = API_BASE.replace(/\/+$/, "");
  const path = raw.startsWith("/") ? raw.slice(1) : raw;
  return `${base}/${path}`;
}

function statusColor(s: string) {
  if (s === "PENDING")
    return "bg-yellow-200 text-yellow-900 font-semibold border border-yellow-400";
  if (s === "IN_PROGRESS")
    return "bg-blue-200 text-blue-900 font-semibold border border-blue-400";
  if (s === "MANUAL_REVIEW")
    return "bg-orange-200 text-orange-900 font-semibold border border-orange-400";
  if (s === "APPROVED" || s === "VERIFIED")
    return "bg-green-200 text-green-900 font-semibold border border-green-400";
  if (s === "REJECTED" || s === "FAILED")
    return "bg-red-200 text-red-900 font-semibold border border-red-400";
  return "bg-[var(--surface-alt)] text-[var(--muted-text)]";
}

function riskLevel(score: number | null | undefined): {
  label: string;
  color: string;
} {
  if (score === null || score === undefined)
    return { label: "Not Analyzed", color: "text-[var(--muted-text)]" };
  if (score < 0)
    return { label: "Unavailable", color: "text-[var(--muted-text)]" };
  if (score < 30) return { label: "High Risk", color: "text-red-400" };
  if (score < 60) return { label: "Medium Risk", color: "text-orange-400" };
  if (score < 80) return { label: "Low Risk", color: "text-yellow-400" };
  return { label: "Clean", color: "text-green-400" };
}

function AnalysisBadge({
  score,
  flags,
  analyzedAt,
}: {
  score?: number | null;
  flags?: string[];
  analyzedAt?: string | null;
}) {
  if (score === null || score === undefined) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)] p-3">
        <p className="text-xs text-[var(--muted-text)]">
          Document analysis not yet available. It runs automatically after
          upload.
        </p>
      </div>
    );
  }

  const risk = riskLevel(score);
  const hasFlags = flags && flags.length > 0;

  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--background)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)]">
          Document Analysis (Google Cloud Vision)
        </p>
        {analyzedAt && (
          <p className="text-[10px] text-[var(--muted-text)]">
            Analyzed {formatDate(analyzedAt)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[var(--foreground)]">
            {score < 0 ? "—" : score}
          </span>
          <span className="text-xs text-[var(--muted-text)]">/ 100</span>
        </div>
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
            score < 30
              ? "bg-red-500/20 text-red-300"
              : score < 60
                ? "bg-orange-500/20 text-orange-300"
                : score < 80
                  ? "bg-yellow-500/20 text-yellow-300"
                  : "bg-green-500/20 text-green-300"
          }`}
        >
          {risk.label}
        </span>
      </div>
      {hasFlags && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-text)] mb-1.5">
            Flags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {flags.map((flag) => (
              <span
                key={flag}
                className="inline-block rounded-md bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] text-red-300"
              >
                {flag.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Resolve extracted data fields — handles both Didit-extracted field names
 * and admin-entered field names with fallback logic.
 */
function resolveExtracted(ed: ExtractedData) {
  return {
    firstName: ed.legalFirstName || ed.firstName || "",
    lastName: ed.legalLastName || ed.lastName || "",
    fullName: ed.fullName || "",
    dateOfBirth: ed.dateOfBirth || "",
    gender: ed.gender || "",
    nationality: ed.nationality || "",
    placeOfBirth: ed.placeOfBirth || "",
    documentNumber: ed.documentNumber || "",
    documentType: ed.documentType || "",
    issueDate: ed.issueDate || "",
    expiryDate: ed.expiryDate || ed.expirationDate || "",
    issuingCountry:
      ed.issuingCountry || ed.issuingStateName || ed.issuingState || "",
    issuingAuthority: ed.issuingAuthority || "",
    bsnNumber: ed.bsnNumber || "",
    address: ed.address || "",
    mrzLine1: ed.mrzLine1 || "",
    mrzLine2: ed.mrzLine2 || "",
    photoMatchConfirmed: ed.photoMatchConfirmed || false,
    workAuthorization: ed.workAuthorization || "",
    adminNotes: ed.adminNotes || "",
    isEuCitizen: ed.isEuCitizen,
    citizenshipCountry: ed.citizenshipCountry || "",
    warnings: ed.warnings || [],
    // Track whether admin has specifically entered data
    hasAdminData: !!(ed.legalFirstName || ed.legalLastName),
    source:
      ed.legalFirstName || ed.legalLastName
        ? ("admin" as const)
        : ed.firstName || ed.lastName
          ? ("didit" as const)
          : ("none" as const),
  };
}

/* ─── Image component with error handling ─── */
function DocImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const resolved = resolveUrl(src);

  if (!resolved || error) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-xs text-[var(--muted-text)] ${className || ""}`}
      >
        <div className="text-center p-4">
          <svg
            className="mx-auto mb-1 h-6 w-6 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <p>Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <a href={resolved} target="_blank" rel="noopener noreferrer">
      <img
        src={resolved}
        alt={alt}
        onError={() => setError(true)}
        className={`rounded-lg border border-[var(--border-color)] object-cover cursor-zoom-in hover:opacity-90 transition-opacity ${className || ""}`}
      />
    </a>
  );
}

/* ─── Section wrapper ─── */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--muted-text)]">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ─── Info cell ─── */
function InfoCell({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="rounded-lg bg-[var(--background)] p-3">
      <p className="text-[10px] uppercase text-[var(--muted-text)]">{label}</p>
      <div className="mt-1 text-sm font-medium text-[var(--foreground)]">
        {value}
      </div>
    </div>
  );
}

/* ─── Country lists ─── */
const EU_COUNTRIES = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  // EEA + Switzerland (treated as EU for work rights)
  "Iceland",
  "Liechtenstein",
  "Norway",
  "Switzerland",
];

const NON_EU_COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (DRC)",
  "Congo (Republic)",
  "Costa Rica",
  "Côte d'Ivoire",
  "Cuba",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Gabon",
  "Gambia",
  "Georgia",
  "Ghana",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Israel",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Qatar",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "São Tomé and Príncipe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

/* ─── MRZ helpers ─── */
function extractMrzLines(text: string): string[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim().replace(/\s/g, "").toUpperCase());
  // MRZ lines: only A-Z, 0-9, < and must contain filler <
  const mrzPattern = /^[A-Z0-9<]{28,44}$/;
  const candidates = lines.filter(
    (l) => mrzPattern.test(l) && (l.match(/</g) || []).length >= 2,
  );
  // MRZ is at the bottom — take the last 2-3 matching lines
  return candidates.slice(-3);
}

function mrzDateToIso(d: string): string {
  if (!d || d.length !== 6) return "";
  const yy = parseInt(d.substring(0, 2), 10);
  const year = yy > 50 ? 1900 + yy : 2000 + yy;
  return `${year}-${d.substring(2, 4)}-${d.substring(4, 6)}`;
}

function capitalizeWords(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ─── Form field ─── */
function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "date" | "textarea";
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--muted-text)]">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
        />
      )}
    </div>
  );
}

/* ─── Service Provider Info Tab (Document Scanning) ─── */
function ServiceProviderInfoTab({
  data,
  onSaved,
}: {
  data: VerificationDetail;
  onSaved: () => void;
}) {
  const existing = (data.extractedData || {}) as ExtractedData;
  const resolved = resolveExtracted(existing);
  const [form, setForm] = useState<ExtractedData>({
    legalFirstName: existing.legalFirstName || existing.firstName || "",
    legalLastName: existing.legalLastName || existing.lastName || "",
    dateOfBirth: existing.dateOfBirth || "",
    gender: existing.gender || "",
    nationality: existing.nationality || "",
    placeOfBirth: existing.placeOfBirth || "",
    documentNumber: existing.documentNumber || "",
    documentType: existing.documentType || "",
    issueDate: existing.issueDate || "",
    expiryDate: existing.expiryDate || existing.expirationDate || "",
    issuingCountry:
      existing.issuingCountry ||
      existing.issuingStateName ||
      existing.issuingState ||
      "",
    issuingAuthority: existing.issuingAuthority || "",
    bsnNumber: existing.bsnNumber || "",
    address: existing.address || "",
    mrzLine1: existing.mrzLine1 || "",
    mrzLine2: existing.mrzLine2 || "",
    photoMatchConfirmed: existing.photoMatchConfirmed || false,
    workAuthorization: existing.workAuthorization || "",
    adminNotes: existing.adminNotes || "",
    isEuCitizen: existing.isEuCitizen ?? undefined,
    citizenshipCountry: existing.citizenshipCountry || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  const set = (key: keyof ExtractedData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await api(`/kyc/admin/${data.id}/extracted-data`, {
      method: "POST",
      body: form,
    });
    setSaving(false);
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 3000);
  };

  const docTypes = [
    "Passport",
    "National ID Card",
    "Residence Permit",
    "EU Citizen Card",
    "Drivers License",
    "Other",
  ];

  const genderOptions = ["Male", "Female", "Other"];

  // Which document image to show in the reference panel
  const [refImage, setRefImage] = useState<"front" | "back" | "selfie">(
    "front",
  );

  const getRefImageUrl = () => {
    if (refImage === "front") return data.documentFrontUrl;
    if (refImage === "back") return data.documentBackUrl;
    return data.selfieUrl;
  };

  const handleScanMrz = async () => {
    const imageUrl = getRefImageUrl();
    if (!imageUrl) {
      setScanError("No document image selected. Switch to front or back.");
      return;
    }
    setScanning(true);
    setScanError(null);
    setScanSuccess(false);
    setScanProgress("Loading OCR engine...");
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", undefined, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setScanProgress(`Scanning... ${Math.round(m.progress * 100)}%`);
          } else {
            setScanProgress(m.status);
          }
        },
      });
      setScanProgress("Reading document...");
      const resolved = imageUrl.startsWith("http")
        ? imageUrl
        : `${API_BASE}${imageUrl}`;
      const {
        data: { text },
      } = await worker.recognize(resolved);
      await worker.terminate();

      // Extract MRZ lines from OCR text
      const mrzLines = extractMrzLines(text);
      if (mrzLines.length < 2) {
        setScanError(
          "Could not detect MRZ zone in this image. Try the back of the document, or enter details manually.",
        );
        setScanning(false);
        setScanProgress("");
        return;
      }

      // Parse MRZ
      const { parse: parseMrz } = await import("mrz");
      const mrzText = mrzLines.slice(-2).join("\n"); // last 2 lines for TD2/TD3
      let result;
      try {
        result = parseMrz(mrzText);
      } catch {
        // Try 3-line format (TD1) if 2-line fails
        if (mrzLines.length >= 3) {
          result = parseMrz(mrzLines.slice(-3).join("\n"));
        } else {
          throw new Error(
            "MRZ detected but could not be parsed. OCR quality may be insufficient.",
          );
        }
      }

      const f = result.fields;
      // Map parsed MRZ fields into form
      const updates: Partial<ExtractedData> = {
        mrzLine1: mrzLines[mrzLines.length - 2] || "",
        mrzLine2: mrzLines[mrzLines.length - 1] || "",
      };
      if (f.firstName) updates.legalFirstName = capitalizeWords(f.firstName);
      if (f.lastName) updates.legalLastName = capitalizeWords(f.lastName);
      if (f.birthDate) updates.dateOfBirth = mrzDateToIso(f.birthDate);
      if (f.sex)
        updates.gender =
          f.sex === "male" ? "Male" : f.sex === "female" ? "Female" : "Other";
      if (f.nationality) updates.nationality = f.nationality;
      if (f.issuingState) updates.issuingCountry = f.issuingState;
      if (f.documentNumber) updates.documentNumber = f.documentNumber;
      if (f.expirationDate) updates.expiryDate = mrzDateToIso(f.expirationDate);
      if (f.documentCode) {
        const code = f.documentCode;
        if (code === "P") updates.documentType = "Passport";
        else if (code === "I" || code === "ID")
          updates.documentType = "National ID Card";
      }

      setForm((prev) => ({ ...prev, ...updates }));
      setScanSuccess(true);
      setScanProgress("");
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : "Scan failed. Try manually.",
      );
      setScanProgress("");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Instructions */}
      {resolved.source === "didit" && !resolved.hasAdminData && (
        <div className="rounded-xl border border-purple-400/50 bg-purple-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-purple-300">
                Didit Auto-Filled Data
              </p>
              <p className="mt-1 text-xs text-purple-300/80">
                The fields below have been pre-populated from Didit&apos;s
                automated verification. Review the data, make corrections if
                needed, and click &quot;Save Extracted Data&quot; to confirm.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="rounded-xl border border-blue-300 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800">
              Document Scanning &amp; Data Extraction
            </p>
            <p className="mt-1 text-xs text-blue-700">
              Use &quot;Scan MRZ from Document&quot; to automatically read the
              Machine Readable Zone and fill in personal details. Review the
              auto-filled data, make corrections if needed, then enter any
              remaining fields manually. Use the image switcher to toggle
              between front, back, and selfie views.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Document reference images */}
        <div className="space-y-3">
          <Section title="Document Reference">
            {/* Image switcher */}
            <div className="flex gap-2 mb-3">
              {(["front", "back", "selfie"] as const).map((img) => {
                const hasImage =
                  img === "front"
                    ? data.documentFrontUrl
                    : img === "back"
                      ? data.documentBackUrl
                      : data.selfieUrl;
                return (
                  <button
                    key={img}
                    onClick={() => setRefImage(img)}
                    disabled={!hasImage}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      refImage === img
                        ? "bg-[var(--primary)] text-white"
                        : hasImage
                          ? "bg-[var(--background)] text-[var(--muted-text)] hover:bg-[var(--surface-alt)]"
                          : "bg-[var(--background)] text-[var(--muted-text)] opacity-40 cursor-not-allowed"
                    }`}
                  >
                    {img}
                  </button>
                );
              })}
            </div>

            {/* Reference image */}
            {getRefImageUrl() ? (
              <DocImage
                src={getRefImageUrl()!}
                alt={`Document ${refImage}`}
                className="w-full rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)]">
                <p className="text-xs text-[var(--muted-text)]">
                  No {refImage} image available
                </p>
              </div>
            )}
          </Section>

          {/* Photo Match */}
          <Section title="Photo Verification">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  set("photoMatchConfirmed", !form.photoMatchConfirmed)
                }
                className={`flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.photoMatchConfirmed
                    ? "bg-green-500"
                    : "bg-[var(--surface-alt)]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    form.photoMatchConfirmed ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium ${form.photoMatchConfirmed ? "text-green-400" : "text-[var(--muted-text)]"}`}
              >
                {form.photoMatchConfirmed
                  ? "Selfie matches document photo"
                  : "Photo match not confirmed"}
              </span>
            </div>
          </Section>

          {/* MRZ Scan */}
          <Section title="MRZ (Machine Readable Zone)">
            <p className="mb-3 text-[10px] text-[var(--muted-text)]">
              Scan the document image to auto-detect the MRZ and fill in
              personal details. Make sure to select the correct document side
              (front/back) above before scanning.
            </p>

            <button
              onClick={handleScanMrz}
              disabled={scanning || !getRefImageUrl()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {scanning ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
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
                  {scanProgress || "Scanning..."}
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Scan MRZ from Document
                </>
              )}
            </button>

            {scanError && (
              <div className="mt-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                <p className="text-xs text-red-400">{scanError}</p>
              </div>
            )}

            {scanSuccess && (
              <div className="mt-2 rounded-lg bg-green-500/10 border border-green-500/30 p-3">
                <p className="text-xs text-green-400 font-medium">
                  MRZ scanned successfully — form fields auto-filled. Please
                  review and correct if needed.
                </p>
              </div>
            )}

            {/* Show detected MRZ (read-only) */}
            {(form.mrzLine1 || form.mrzLine2) && (
              <div className="mt-3 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted-text)]">
                  Detected MRZ
                </p>
                <div className="rounded-lg bg-[var(--background)] p-3 font-mono text-xs text-[var(--foreground)] break-all select-all">
                  {form.mrzLine1 && <p>{form.mrzLine1}</p>}
                  {form.mrzLine2 && <p>{form.mrzLine2}</p>}
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Right: Data entry form */}
        <div className="space-y-3">
          <Section title="Personal Information">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Legal First Name"
                value={form.legalFirstName || ""}
                onChange={(v) => set("legalFirstName", v)}
                placeholder="As shown on document"
                required
              />
              <FormField
                label="Legal Last Name"
                value={form.legalLastName || ""}
                onChange={(v) => set("legalLastName", v)}
                placeholder="As shown on document"
                required
              />
              <FormField
                label="Date of Birth"
                value={form.dateOfBirth || ""}
                onChange={(v) => set("dateOfBirth", v)}
                type="date"
                required
              />
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--muted-text)]">
                  Gender
                </label>
                <select
                  value={form.gender || ""}
                  onChange={(e) => set("gender", e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                >
                  <option value="">Select...</option>
                  {genderOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--muted-text)]">
                  Citizenship <span className="text-red-400 ml-0.5">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        isEuCitizen: true,
                        citizenshipCountry: "",
                        nationality: "",
                      }));
                    }}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      form.isEuCitizen === true
                        ? "bg-blue-600 text-white"
                        : "bg-[var(--background)] text-[var(--muted-text)] hover:bg-[var(--surface-alt)]"
                    }`}
                  >
                    EU / EEA Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        isEuCitizen: false,
                        citizenshipCountry: "",
                        nationality: "",
                      }));
                    }}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      form.isEuCitizen === false
                        ? "bg-amber-600 text-white"
                        : "bg-[var(--background)] text-[var(--muted-text)] hover:bg-[var(--surface-alt)]"
                    }`}
                  >
                    Non-EU Citizen
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--muted-text)]">
                  Country of Citizenship{" "}
                  <span className="text-red-400 ml-0.5">*</span>
                </label>
                <select
                  value={form.citizenshipCountry || ""}
                  onChange={(e) => {
                    const country = e.target.value;
                    set("citizenshipCountry", country);
                    set("nationality", country);
                  }}
                  disabled={form.isEuCitizen === undefined}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 disabled:opacity-50"
                >
                  <option value="">
                    {form.isEuCitizen === undefined
                      ? "Select citizenship type first"
                      : "Select country..."}
                  </option>
                  {(form.isEuCitizen ? EU_COUNTRIES : NON_EU_COUNTRIES).map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {form.isEuCitizen === false && (
                <div className="col-span-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-xs text-amber-300 font-medium">
                    Non-EU citizen document monitoring active
                  </p>
                  <p className="text-[10px] text-amber-300/70 mt-1">
                    Document expiry will be tracked. The service provider will
                    be notified 15 days before expiry and access will be
                    restricted if documents expire without renewal.
                  </p>
                </div>
              )}
              <FormField
                label="Place of Birth"
                value={form.placeOfBirth || ""}
                onChange={(v) => set("placeOfBirth", v)}
                placeholder="City / Country"
              />
            </div>
          </Section>

          <Section title="Document Information">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--muted-text)]">
                  Document Type
                  <span className="text-red-400 ml-0.5">*</span>
                </label>
                <select
                  value={form.documentType || ""}
                  onChange={(e) => set("documentType", e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                >
                  <option value="">Select...</option>
                  {docTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <FormField
                label="Document Number"
                value={form.documentNumber || ""}
                onChange={(v) => set("documentNumber", v)}
                placeholder="As shown on document"
                required
              />
              <FormField
                label="Issue Date"
                value={form.issueDate || ""}
                onChange={(v) => set("issueDate", v)}
                type="date"
              />
              <FormField
                label="Expiry Date"
                value={form.expiryDate || ""}
                onChange={(v) => set("expiryDate", v)}
                type="date"
                required
              />
              <FormField
                label="Issuing Country"
                value={form.issuingCountry || ""}
                onChange={(v) => set("issuingCountry", v)}
                placeholder="e.g. NL, PT, DE"
                required
              />
              <FormField
                label="Issuing Authority"
                value={form.issuingAuthority || ""}
                onChange={(v) => set("issuingAuthority", v)}
                placeholder="e.g. Municipality of Amsterdam"
              />
            </div>
          </Section>

          <Section title="Additional Details">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="BSN / Tax Number"
                value={form.bsnNumber || ""}
                onChange={(v) => set("bsnNumber", v)}
                placeholder="If visible on document"
              />
              <FormField
                label="Work Authorization"
                value={form.workAuthorization || ""}
                onChange={(v) => set("workAuthorization", v)}
                placeholder="e.g. Unrestricted, Work permit required"
              />
              <div className="col-span-2">
                <FormField
                  label="Address (if on document)"
                  value={form.address || ""}
                  onChange={(v) => set("address", v)}
                  placeholder="Full address as shown on document"
                />
              </div>
              <div className="col-span-2">
                <FormField
                  label="Admin Notes"
                  value={form.adminNotes || ""}
                  onChange={(v) => set("adminNotes", v)}
                  type="textarea"
                  placeholder="Any additional observations, discrepancies, or notes..."
                />
              </div>
            </div>
          </Section>

          {/* Save button */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4">
            <div>
              {data.extractedAt && (
                <p className="text-[10px] text-[var(--muted-text)]">
                  Last saved: {formatDate(data.extractedAt)}
                </p>
              )}
              {saved && (
                <p className="text-xs text-green-400 font-medium">
                  Saved successfully
                </p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? "Saving..." : "Save Document Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function KYCDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<VerificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewAction, setReviewAction] = useState<
    "APPROVED" | "REJECTED" | null
  >(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [bgCheckLoading, setBgCheckLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "identity" | "documents" | "vehicles" | "background" | "provider-info"
  >("identity");

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    const res = await api<VerificationDetail>(`/kyc/admin/${id}`);
    if (res.data) setData(res.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await api<VerificationDetail>(`/kyc/admin/${id}`);
      if (!cancelled && res.data) setData(res.data);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleReview = async () => {
    if (!data || !reviewAction) return;
    setActionLoading(true);
    const serverDecision = reviewAction === "APPROVED" ? "VERIFIED" : "FAILED";
    await api(`/kyc/admin/${data.id}/review`, {
      method: "POST",
      body: { decision: serverDecision, notes: reviewNotes || undefined },
    });
    setActionLoading(false);
    setReviewAction(null);
    setReviewNotes("");
    setShowApprovalModal(false);
    fetchDetail();
  };

  const handleBgCheckReview = async (result: "CLEAN" | "DISQUALIFYING") => {
    if (!data?.backgroundCheck) return;
    setBgCheckLoading(true);
    const res = await api(
      `/background-checks/admin/${data.backgroundCheck.id}/review`,
      {
        method: "POST",
        body: {
          result,
          hasCriminalRecord: result !== "CLEAN",
        },
      },
    );
    setBgCheckLoading(false);
    if (res.error) {
      alert(
        typeof res.error === "string"
          ? res.error
          : "Failed to review background check",
      );
      return;
    }
    fetchDetail();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="text-[var(--muted-text)]">Verification not found.</p>
        <Link
          href="/dashboard/admin/kyc"
          className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline"
        >
          ← Back to list
        </Link>
      </div>
    );
  }

  const user = data.user;
  const certs = Array.isArray(data.certifications) ? data.certifications : [];
  const cvs = Array.isArray(data.cvDocuments) ? data.cvDocuments : [];
  const vehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
  const allVerifs = Array.isArray(data.allVerifications)
    ? data.allVerifications
    : [];
  const isReviewable = ["PENDING", "IN_PROGRESS", "MANUAL_REVIEW"].includes(
    data.status,
  );

  const tabs = [
    { key: "identity" as const, label: "Identity & Documents" },
    { key: "documents" as const, label: "Certifications & CVs" },
    { key: "vehicles" as const, label: `Vehicles (${vehicles.length})` },
    { key: "background" as const, label: "Background Check" },
    {
      key: "provider-info" as const,
      label: `Service Provider Info${data.extractedData ? " ✓" : ""}`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/kyc"
          className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors"
        >
          ← Back
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[var(--foreground)]">
            KYC Review — {user.firstName} {user.lastName}
          </h1>
          <p className="mt-0.5 text-sm text-[var(--muted-text)]">
            {user.email}
            {user.phone ? ` · ${user.phone}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              router.push(`/dashboard/admin/chat?startChat=${user.id}`)
            }
            className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-alt)] transition-colors"
            title="Chat with user"
          >
            💬 Chat
          </button>
          <button
            onClick={() =>
              router.push(
                `/dashboard/admin/chat?startEmail=${user.id}&emailContext=KYC`,
              )
            }
            className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-alt)] transition-colors"
            title="Email user"
          >
            ✉️ Email
          </button>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusColor(data.status)}`}
          >
            {data.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* User Summary Card */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-5">
          <Avatar
            src={resolveUrl(user.avatarUrl)}
            alt="Avatar"
            imgClassName="h-16 w-16 rounded-full border-2 border-[var(--border-color)] object-cover"
            fallback={
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/20 text-lg font-bold text-[var(--primary)]">
                {(user.firstName?.[0] || "?").toUpperCase()}
              </div>
            }
          />
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoCell label="Role" value={user.role?.replace(/_/g, " ")} />
            <InfoCell label="Country" value={user.country} />
            <InfoCell
              label="ID Verified"
              value={
                <span
                  className={
                    user.isIdVerified ? "text-green-400" : "text-yellow-400"
                  }
                >
                  {user.isIdVerified ? "Yes" : "No"}
                </span>
              }
            />
            <InfoCell label="Submitted" value={formatDate(data.createdAt)} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === t.key
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted-text)] hover:bg-[var(--surface-alt)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "identity" && (
        <div className="space-y-5">
          {/* Verification Info */}
          <Section title="Verification Details">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoCell
                label="Status"
                value={
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColor(data.status)}`}
                  >
                    {data.status.replace(/_/g, " ")}
                  </span>
                }
              />
              <InfoCell
                label="Verification Type"
                value={data.verificationType?.replace(/_/g, " ")}
              />
              <InfoCell label="Document Number" value={data.documentNumber} />
              <InfoCell label="Document Country" value={data.documentCountry} />
              <InfoCell
                label="Document Expiry"
                value={
                  data.documentExpiry
                    ? formatDate(data.documentExpiry)
                    : undefined
                }
              />
              <InfoCell label="Submitted" value={formatDate(data.createdAt)} />
              <InfoCell
                label="Last Updated"
                value={formatDate(data.updatedAt)}
              />
              {data.confidence != null && (
                <InfoCell
                  label="Confidence Score"
                  value={`${(data.confidence * 100).toFixed(1)}%`}
                />
              )}
              {data.faceMatch != null && (
                <InfoCell
                  label="Face Match Score"
                  value={`${(data.faceMatch * 100).toFixed(1)}%`}
                />
              )}
              {data.livenessCheck != null && (
                <InfoCell
                  label="Liveness Check"
                  value={
                    <span
                      className={
                        data.livenessCheck ? "text-green-400" : "text-red-400"
                      }
                    >
                      {data.livenessCheck ? "Passed" : "Failed"}
                    </span>
                  }
                />
              )}
            </div>
          </Section>

          {/* ID Document Images */}
          {(() => {
            // Always show the GOV_ID verification's images, not whatever verification was clicked
            const govIdVerif = allVerifs.find(
              (v) => v.verificationType === "GOVERNMENT_ID",
            );
            const idFront =
              govIdVerif?.documentFrontUrl ?? data.documentFrontUrl;
            const idBack = govIdVerif?.documentBackUrl ?? data.documentBackUrl;
            const idSelfie = govIdVerif?.selfieUrl ?? data.selfieUrl;
            return (
              <Section title="ID Documents">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {idFront ? (
                    <div>
                      <div className="mb-1.5 flex items-center gap-2">
                        <p className="text-xs text-[var(--muted-text)]">
                          Front
                        </p>
                        {data.documentStatuses?.documentFront && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusColor(String(data.documentStatuses.documentFront))}`}
                          >
                            {String(data.documentStatuses.documentFront)}
                          </span>
                        )}
                      </div>
                      <DocImage
                        src={idFront}
                        alt="Document Front"
                        className="w-full aspect-[4/3]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)]">
                      <p className="text-xs text-[var(--muted-text)]">
                        No front uploaded
                      </p>
                    </div>
                  )}
                  {idBack ? (
                    <div>
                      <div className="mb-1.5 flex items-center gap-2">
                        <p className="text-xs text-[var(--muted-text)]">Back</p>
                        {data.documentStatuses?.documentBack && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusColor(String(data.documentStatuses.documentBack))}`}
                          >
                            {String(data.documentStatuses.documentBack)}
                          </span>
                        )}
                      </div>
                      <DocImage
                        src={idBack}
                        alt="Document Back"
                        className="w-full aspect-[4/3]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)]">
                      <p className="text-xs text-[var(--muted-text)]">
                        No back uploaded
                      </p>
                    </div>
                  )}
                  {idSelfie ? (
                    <div>
                      <div className="mb-1.5 flex items-center gap-2">
                        <p className="text-xs text-[var(--muted-text)]">
                          Selfie
                        </p>
                        {data.documentStatuses?.selfie && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusColor(String(data.documentStatuses.selfie))}`}
                          >
                            {String(data.documentStatuses.selfie)}
                          </span>
                        )}
                      </div>
                      <DocImage
                        src={idSelfie}
                        alt="Selfie"
                        className="w-full aspect-[4/3]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)]">
                      <p className="text-xs text-[var(--muted-text)]">
                        No selfie uploaded
                      </p>
                    </div>
                  )}
                </div>
              </Section>
            );
          })()}

          {/* Didit Verification Results */}
          {(data.confidence != null ||
            data.faceMatch != null ||
            data.livenessCheck != null ||
            data.fraudChecks) && (
            <Section title="Didit Verification Results">
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {data.confidence != null && (
                    <InfoCell
                      label="Confidence"
                      value={
                        <span
                          className={
                            data.confidence >= 0.7
                              ? "text-green-400"
                              : data.confidence >= 0.4
                                ? "text-yellow-400"
                                : "text-red-400"
                          }
                        >
                          {(data.confidence * 100).toFixed(1)}%
                        </span>
                      }
                    />
                  )}
                  {data.faceMatch != null && (
                    <InfoCell
                      label="Face Match"
                      value={
                        <span
                          className={
                            data.faceMatch >= 70
                              ? "text-green-400"
                              : data.faceMatch >= 40
                                ? "text-yellow-400"
                                : "text-red-400"
                          }
                        >
                          {data.faceMatch.toFixed(1)}%
                        </span>
                      }
                    />
                  )}
                  {data.livenessCheck != null && (
                    <InfoCell
                      label="Liveness"
                      value={
                        <span
                          className={
                            data.livenessCheck
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {data.livenessCheck ? "Passed" : "Failed"}
                        </span>
                      }
                    />
                  )}
                  {data.providerReference && (
                    <InfoCell
                      label="Provider Ref"
                      value={
                        <span className="text-[10px] break-all">
                          {data.providerReference}
                        </span>
                      }
                    />
                  )}
                </div>
                {data.fraudChecks && (
                  <div className="space-y-2">
                    {data.fraudChecks.warnings &&
                      data.fraudChecks.warnings.length > 0 && (
                        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 mb-1.5">
                            Warnings
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {data.fraudChecks.warnings.map((w, i) => (
                              <span
                                key={i}
                                className="inline-block rounded-md bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-300"
                              >
                                {String(w).replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    {data.fraudChecks.errors &&
                      data.fraudChecks.errors.length > 0 && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1.5">
                            Errors
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {data.fraudChecks.errors.map((e, i) => (
                              <span
                                key={i}
                                className="inline-block rounded-md bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] text-red-300"
                              >
                                {String(e).replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Extracted Document Data (read-only, synced from Service Provider Info or Didit) */}
          {data.extractedData ? (
            <Section title="Extracted Document Data">
              {(() => {
                const ed = resolveExtracted(
                  data.extractedData as ExtractedData,
                );
                return (
                  <>
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          ed.source === "admin"
                            ? "bg-blue-500/20 text-blue-300"
                            : ed.source === "didit"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-[var(--surface-alt)] text-[var(--muted-text)]"
                        }`}
                      >
                        {ed.source === "admin"
                          ? "Admin Verified"
                          : ed.source === "didit"
                            ? "Auto-Extracted (Didit)"
                            : "No Source"}
                      </span>
                      <p className="text-xs text-[var(--muted-text)]">
                        {ed.source === "didit"
                          ? 'Data auto-extracted by Didit. Review and confirm in the "Service Provider Info" tab.'
                          : "Data verified by admin via the Service Provider Info tab."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <InfoCell
                        label="First Name"
                        value={ed.firstName || "—"}
                      />
                      <InfoCell label="Last Name" value={ed.lastName || "—"} />
                      {ed.fullName && (
                        <InfoCell label="Full Name" value={ed.fullName} />
                      )}
                      <InfoCell
                        label="Date of Birth"
                        value={
                          ed.dateOfBirth ? formatDate(ed.dateOfBirth) : "—"
                        }
                      />
                      <InfoCell label="Gender" value={ed.gender || "—"} />
                      <InfoCell
                        label="Nationality"
                        value={ed.nationality || "—"}
                      />
                      {ed.placeOfBirth && (
                        <InfoCell
                          label="Place of Birth"
                          value={ed.placeOfBirth}
                        />
                      )}
                      <InfoCell
                        label="Citizenship"
                        value={
                          ed.isEuCitizen === true
                            ? "EU / EEA Citizen"
                            : ed.isEuCitizen === false
                              ? "Non-EU Citizen"
                              : "—"
                        }
                      />
                      {ed.citizenshipCountry && (
                        <InfoCell
                          label="Country of Citizenship"
                          value={ed.citizenshipCountry}
                        />
                      )}
                      <InfoCell
                        label="Document Type"
                        value={ed.documentType || "—"}
                      />
                      <InfoCell
                        label="Document Number"
                        value={ed.documentNumber || "—"}
                      />
                      {ed.issueDate && (
                        <InfoCell
                          label="Issue Date"
                          value={formatDate(ed.issueDate)}
                        />
                      )}
                      <InfoCell
                        label="Expiry Date"
                        value={ed.expiryDate ? formatDate(ed.expiryDate) : "—"}
                      />
                      <InfoCell
                        label="Issuing Country"
                        value={ed.issuingCountry || "—"}
                      />
                      {ed.issuingAuthority && (
                        <InfoCell
                          label="Issuing Authority"
                          value={ed.issuingAuthority}
                        />
                      )}
                      {ed.bsnNumber && (
                        <InfoCell
                          label="BSN / Tax Number"
                          value={ed.bsnNumber}
                        />
                      )}
                      {ed.workAuthorization && (
                        <InfoCell
                          label="Work Authorization"
                          value={ed.workAuthorization}
                        />
                      )}
                      {ed.address && (
                        <InfoCell label="Address" value={ed.address} />
                      )}
                      <InfoCell
                        label="Photo Match"
                        value={
                          ed.photoMatchConfirmed ? (
                            <span className="text-green-400">Confirmed</span>
                          ) : (
                            <span className="text-yellow-400">
                              Not confirmed
                            </span>
                          )
                        }
                      />
                    </div>
                    {ed.warnings.length > 0 && (
                      <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 mb-1.5">
                          Document Warnings
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {ed.warnings.map((w, i) => (
                            <span
                              key={i}
                              className="inline-block rounded-md bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-300"
                            >
                              {String(w).replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {ed.adminNotes && (
                      <div className="mt-3 rounded-lg bg-[var(--background)] p-3">
                        <p className="text-[10px] uppercase text-[var(--muted-text)]">
                          Admin Notes
                        </p>
                        <p className="mt-1 text-sm text-[var(--foreground)] whitespace-pre-wrap">
                          {ed.adminNotes}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </Section>
          ) : (
            <Section title="Extracted Document Data">
              <div className="rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)] p-6 text-center">
                <p className="text-xs text-[var(--muted-text)]">
                  No document data has been extracted yet. Go to the
                  &quot;Service Provider Info&quot; tab to scan and enter
                  document details.
                </p>
              </div>
            </Section>
          )}

          {/* Profile Details */}
          <Section title="Profile Details">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoCell
                label="Full Name (Profile)"
                value={
                  user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "—"
                }
              />
              <InfoCell label="Email" value={user.email} />
              <InfoCell label="Phone" value={user.phone || "—"} />
              <InfoCell label="Country (Profile)" value={user.country || "—"} />
              <InfoCell
                label="Document Number (Submitted)"
                value={data.documentNumber || "—"}
              />
              <InfoCell
                label="Issuing Country (Submitted)"
                value={data.documentCountry || "—"}
              />
              <InfoCell
                label="Expiry Date (Submitted)"
                value={
                  data.documentExpiry ? formatDate(data.documentExpiry) : "—"
                }
              />
            </div>
          </Section>

          {/* Driver's License Verification */}
          {(() => {
            const dlVerif = allVerifs.find(
              (v) => v.verificationType === "DRIVERS_LICENSE",
            );
            if (!dlVerif)
              return (
                <Section title="Driver's License Verification">
                  <p className="text-xs text-[var(--muted-text)]">
                    No driver&apos;s license verification submitted yet.
                  </p>
                </Section>
              );
            return (
              <Section title="Driver's License Verification">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColor(dlVerif.status)}`}
                    >
                      {dlVerif.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-[var(--muted-text)]">
                      Submitted {formatDate(dlVerif.createdAt)}
                    </span>
                    {dlVerif.id !== data.id && (
                      <Link
                        href={`/dashboard/admin/kyc/${dlVerif.id}`}
                        className="text-xs text-[var(--primary)] hover:underline"
                      >
                        View Full Details →
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {dlVerif.documentFrontUrl ? (
                      <div>
                        <div className="mb-1.5 flex items-center gap-2">
                          <p className="text-xs text-[var(--muted-text)]">
                            Front
                          </p>
                          {dlVerif.documentStatuses?.documentFront && (
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusColor(String(dlVerif.documentStatuses.documentFront))}`}
                            >
                              {String(dlVerif.documentStatuses.documentFront)}
                            </span>
                          )}
                        </div>
                        <DocImage
                          src={dlVerif.documentFrontUrl}
                          alt="Driver's License Front"
                          className="w-full aspect-[4/3]"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)]">
                        <p className="text-xs text-[var(--muted-text)]">
                          No front uploaded
                        </p>
                      </div>
                    )}
                    {dlVerif.documentBackUrl ? (
                      <div>
                        <div className="mb-1.5 flex items-center gap-2">
                          <p className="text-xs text-[var(--muted-text)]">
                            Back
                          </p>
                          {dlVerif.documentStatuses?.documentBack && (
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusColor(String(dlVerif.documentStatuses.documentBack))}`}
                            >
                              {String(dlVerif.documentStatuses.documentBack)}
                            </span>
                          )}
                        </div>
                        <DocImage
                          src={dlVerif.documentBackUrl}
                          alt="Driver's License Back"
                          className="w-full aspect-[4/3]"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)]">
                        <p className="text-xs text-[var(--muted-text)]">
                          No back uploaded
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Section>
            );
          })()}

          {/* All Verifications History */}
          {allVerifs.length > 1 && (
            <Section title="Verification History">
              <div className="space-y-2">
                {allVerifs.map((v) => (
                  <div
                    key={v.id}
                    className={`flex items-center justify-between rounded-lg p-3 ${
                      v.id === data.id
                        ? "bg-[var(--primary)]/10 border border-[var(--primary)]/30"
                        : "bg-[var(--background)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor(v.status)}`}
                      >
                        {v.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-[var(--foreground)]">
                        {v.verificationType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[var(--muted-text)]">
                        {formatDate(v.createdAt)}
                      </span>
                      {v.id !== data.id && (
                        <Link
                          href={`/dashboard/admin/kyc/${v.id}`}
                          className="text-[10px] text-[var(--primary)] hover:underline"
                        >
                          View →
                        </Link>
                      )}
                      {v.id === data.id && (
                        <span className="text-[10px] text-[var(--primary)]">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-5">
          {/* Certifications */}
          <Section title={`Certifications (${certs.length})`}>
            {certs.length === 0 ? (
              <p className="text-xs text-[var(--muted-text)]">
                No certifications uploaded.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {certs.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-[var(--background)] p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[var(--foreground)]">
                        Certification #{i + 1}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor(c.status)}`}
                      >
                        {c.status}
                      </span>
                    </div>
                    {c.url.toLowerCase().endsWith(".pdf") ? (
                      <a
                        href={resolveUrl(c.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-4 text-xs text-[var(--primary)] hover:underline"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                        View PDF Document
                      </a>
                    ) : (
                      <DocImage
                        src={c.url}
                        alt={`Certification ${i + 1}`}
                        className="w-full aspect-[4/3]"
                      />
                    )}
                    <p className="mt-2 text-[10px] text-[var(--muted-text)]">
                      Uploaded: {formatDate(c.uploadedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* CV Documents */}
          <Section title={`CV Documents (${cvs.length})`}>
            {cvs.length === 0 ? (
              <p className="text-xs text-[var(--muted-text)]">
                No CV documents uploaded.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cvs.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-[var(--background)] p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[var(--foreground)]">
                        CV #{i + 1}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor(c.status)}`}
                      >
                        {c.status}
                      </span>
                    </div>
                    {c.url.toLowerCase().endsWith(".pdf") ? (
                      <a
                        href={resolveUrl(c.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-4 text-xs text-[var(--primary)] hover:underline"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                        View PDF Document
                      </a>
                    ) : (
                      <DocImage
                        src={c.url}
                        alt={`CV ${i + 1}`}
                        className="w-full aspect-[4/3]"
                      />
                    )}
                    <p className="mt-2 text-[10px] text-[var(--muted-text)]">
                      Uploaded: {formatDate(c.uploadedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {activeTab === "vehicles" && (
        <div className="space-y-5">
          {vehicles.length === 0 ? (
            <Section title="Vehicles">
              <p className="text-xs text-[var(--muted-text)]">
                No vehicles registered for this user.
              </p>
            </Section>
          ) : (
            vehicles.map((v, idx) => (
              <Section
                key={v.id}
                title={`Vehicle ${idx + 1} — ${v.make} ${v.model} (${v.year})`}
              >
                {/* Vehicle Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <InfoCell
                    label="Type"
                    value={
                      v.vehicleType === "OTHER"
                        ? v.otherTypeSpecification || "Other"
                        : v.vehicleType
                    }
                  />
                  <InfoCell label="Make" value={v.make} />
                  <InfoCell label="Model" value={v.model} />
                  <InfoCell label="Year" value={v.year} />
                  <InfoCell label="Color" value={v.color} />
                  <InfoCell label="License Plate" value={v.licensePlate} />
                  <InfoCell label="Capacity" value={v.capacity} />
                  <InfoCell
                    label="Status"
                    value={
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor(v.status)}`}
                      >
                        {v.status}
                      </span>
                    }
                  />
                </div>

                {/* Vehicle Photos */}
                <p className="mb-2 text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wider">
                  Vehicle Photos
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div>
                    <p className="mb-1 text-[10px] text-[var(--muted-text)]">
                      Front
                    </p>
                    {v.photoFrontUrl ? (
                      <DocImage
                        src={v.photoFrontUrl}
                        alt="Vehicle Front"
                        className="w-full aspect-[4/3]"
                      />
                    ) : (
                      <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)]">
                        <p className="text-[10px] text-[var(--muted-text)]">
                          N/A
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] text-[var(--muted-text)]">
                      Back
                    </p>
                    {v.photoBackUrl ? (
                      <DocImage
                        src={v.photoBackUrl}
                        alt="Vehicle Back"
                        className="w-full aspect-[4/3]"
                      />
                    ) : (
                      <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)]">
                        <p className="text-[10px] text-[var(--muted-text)]">
                          N/A
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] text-[var(--muted-text)]">
                      Left
                    </p>
                    {v.photoLeftUrl ? (
                      <DocImage
                        src={v.photoLeftUrl}
                        alt="Vehicle Left"
                        className="w-full aspect-[4/3]"
                      />
                    ) : (
                      <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)]">
                        <p className="text-[10px] text-[var(--muted-text)]">
                          N/A
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] text-[var(--muted-text)]">
                      Right
                    </p>
                    {v.photoRightUrl ? (
                      <DocImage
                        src={v.photoRightUrl}
                        alt="Vehicle Right"
                        className="w-full aspect-[4/3]"
                      />
                    ) : (
                      <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)]">
                        <p className="text-[10px] text-[var(--muted-text)]">
                          N/A
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] text-[var(--muted-text)]">
                      Vehicle License
                    </p>
                    {v.vehicleLicenseUrl ? (
                      v.vehicleLicenseUrl.toLowerCase().endsWith(".pdf") ? (
                        <a
                          href={resolveUrl(v.vehicleLicenseUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 aspect-[4/3] rounded-lg border border-[var(--border-color)] bg-[var(--surface)] text-xs text-[var(--primary)] hover:underline"
                        >
                          View PDF
                        </a>
                      ) : (
                        <DocImage
                          src={v.vehicleLicenseUrl}
                          alt="Vehicle License"
                          className="w-full aspect-[4/3]"
                        />
                      )
                    ) : (
                      <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--background)]">
                        <p className="text-[10px] text-[var(--muted-text)]">
                          N/A
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {v.adminNotes && (
                  <div className="mt-3 rounded-lg bg-[var(--background)] p-3">
                    <p className="text-[10px] uppercase text-[var(--muted-text)]">
                      Admin Notes
                    </p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">
                      {v.adminNotes}
                    </p>
                  </div>
                )}
                <div className="mt-3">
                  <AnalysisBadge
                    score={v.documentAnalysisScore}
                    flags={v.documentAnalysisFlags}
                    analyzedAt={v.documentAnalyzedAt}
                  />
                </div>
              </Section>
            ))
          )}
        </div>
      )}

      {activeTab === "background" && (
        <Section title="Background Check">
          {data.backgroundCheck ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <InfoCell
                  label="Status"
                  value={
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor(data.backgroundCheck.status)}`}
                    >
                      {data.backgroundCheck.status.replace(/_/g, " ")}
                    </span>
                  }
                />
                <InfoCell
                  label="Certificate Number"
                  value={data.backgroundCheck.certificateNumber}
                />
                <InfoCell
                  label="Submitted"
                  value={
                    data.backgroundCheck.submittedAt
                      ? formatDate(data.backgroundCheck.submittedAt)
                      : formatDate(data.backgroundCheck.createdAt)
                  }
                />
              </div>
              {data.backgroundCheck.uploadedDocument && (
                <div>
                  <p className="mb-1.5 text-xs text-[var(--muted-text)]">
                    Uploaded Document
                  </p>
                  {data.backgroundCheck.uploadedDocument
                    .toLowerCase()
                    .endsWith(".pdf") ? (
                    <a
                      href={resolveUrl(data.backgroundCheck.uploadedDocument)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--background)] px-4 py-3 text-xs text-[var(--primary)] hover:underline"
                    >
                      View PDF Document
                    </a>
                  ) : (
                    <DocImage
                      src={data.backgroundCheck.uploadedDocument}
                      alt="Background Check Document"
                      className="max-w-md aspect-[4/3]"
                    />
                  )}
                </div>
              )}
              <AnalysisBadge
                score={data.backgroundCheck.documentAnalysisScore}
                flags={data.backgroundCheck.documentAnalysisFlags}
                analyzedAt={data.backgroundCheck.documentAnalyzedAt}
              />
              {["SUBMITTED", "UNDER_REVIEW"].includes(
                data.backgroundCheck.status,
              ) && (
                <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-color)]">
                  <button
                    disabled={bgCheckLoading}
                    onClick={() => handleBgCheckReview("CLEAN")}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {bgCheckLoading
                      ? "Processing…"
                      : "Approve Background Check"}
                  </button>
                  <button
                    disabled={bgCheckLoading}
                    onClick={() => handleBgCheckReview("DISQUALIFYING")}
                    className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {bgCheckLoading ? "Processing…" : "Reject Background Check"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted-text)]">
              No background check submitted for this user.
            </p>
          )}
        </Section>
      )}

      {activeTab === "provider-info" && (
        <ServiceProviderInfoTab data={data} onSaved={fetchDetail} />
      )}

      {/* Review Actions — sticky bottom bar */}
      {isReviewable && (
        <div className="sticky bottom-0 z-10 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-[var(--muted-text)]">
              Review this verification submission
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReviewAction("APPROVED");
                  setShowApprovalModal(true);
                }}
                className="rounded-lg bg-[var(--achievement-green)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setReviewAction("REJECTED");
                  setShowApprovalModal(true);
                }}
                className="rounded-lg bg-[var(--alert-red)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval / Rejection Confirmation Modal */}
      {showApprovalModal && data && reviewAction && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-8">
          <div className="relative w-full max-w-4xl rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] shadow-2xl my-4">
            {/* Modal Header */}
            <div
              className={`sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-[var(--border-color)] px-6 py-4 ${
                reviewAction === "APPROVED"
                  ? "bg-green-500/10"
                  : "bg-red-500/10"
              }`}
            >
              <div>
                <h2 className="text-lg font-bold text-[var(--foreground)]">
                  {reviewAction === "APPROVED"
                    ? "Approve Service Provider"
                    : "Reject Service Provider"}
                </h2>
                <p className="text-xs text-[var(--muted-text)]">
                  {reviewAction === "APPROVED"
                    ? "Review all information below before confirming approval. This will fully verify the service provider."
                    : "Review the information below before confirming rejection."}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setReviewAction(null);
                  setReviewNotes("");
                }}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-2 text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 p-6 max-h-[calc(100vh-220px)] overflow-y-auto">
              {/* SP Personal Info */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">
                  Service Provider Information
                </h3>
                <div className="flex items-center gap-4 mb-3">
                  <Avatar
                    src={user.avatarUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    fallback={
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)]/20 text-lg font-bold text-[var(--primary)]">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </div>
                    }
                    imgClassName="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-base font-semibold text-[var(--foreground)]">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-[var(--muted-text)]">
                      {user.email}
                    </p>
                    {user.phone && (
                      <p className="text-xs text-[var(--muted-text)]">
                        {user.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <InfoCell
                    label="Role"
                    value={user.role?.replace(/_/g, " ")}
                  />
                  <InfoCell label="Country" value={user.country} />
                  <InfoCell
                    label="ID Verified"
                    value={
                      <span
                        className={
                          user.isIdVerified
                            ? "text-green-400"
                            : "text-yellow-400"
                        }
                      >
                        {user.isIdVerified ? "Yes" : "No"}
                      </span>
                    }
                  />
                  <InfoCell
                    label="KYC Status"
                    value={
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor(data.status)}`}
                      >
                        {data.status.replace(/_/g, " ")}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Extracted Data Summary */}
              {data.extractedData &&
                (() => {
                  const ed = resolveExtracted(
                    data.extractedData as ExtractedData,
                  );
                  return (
                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4">
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">
                        Document Extracted Data
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <InfoCell
                          label="First Name"
                          value={ed.firstName || "—"}
                        />
                        <InfoCell
                          label="Last Name"
                          value={ed.lastName || "—"}
                        />
                        <InfoCell
                          label="Date of Birth"
                          value={
                            ed.dateOfBirth ? formatDate(ed.dateOfBirth) : "—"
                          }
                        />
                        <InfoCell
                          label="Nationality"
                          value={ed.nationality || "—"}
                        />
                        <InfoCell
                          label="Document Type"
                          value={ed.documentType || "—"}
                        />
                        <InfoCell
                          label="Document Number"
                          value={ed.documentNumber || "—"}
                        />
                        <InfoCell
                          label="Expiry Date"
                          value={
                            ed.expiryDate ? formatDate(ed.expiryDate) : "—"
                          }
                        />
                        <InfoCell
                          label="Issuing Country"
                          value={ed.issuingCountry || "—"}
                        />
                      </div>
                    </div>
                  );
                })()}

              {/* Verification Scores */}
              {(data.confidence != null ||
                data.faceMatch != null ||
                data.livenessCheck != null) && (
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">
                    Verification Scores
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {data.confidence != null && (
                      <InfoCell
                        label="Confidence"
                        value={
                          <span
                            className={
                              data.confidence >= 0.7
                                ? "text-green-400"
                                : data.confidence >= 0.4
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }
                          >
                            {(data.confidence * 100).toFixed(1)}%
                          </span>
                        }
                      />
                    )}
                    {data.faceMatch != null && (
                      <InfoCell
                        label="Face Match"
                        value={
                          <span
                            className={
                              data.faceMatch >= 70
                                ? "text-green-400"
                                : data.faceMatch >= 40
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }
                          >
                            {data.faceMatch.toFixed(1)}%
                          </span>
                        }
                      />
                    )}
                    {data.livenessCheck != null && (
                      <InfoCell
                        label="Liveness"
                        value={
                          <span
                            className={
                              data.livenessCheck
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {data.livenessCheck ? "Passed" : "Failed"}
                          </span>
                        }
                      />
                    )}
                  </div>
                  {/* Fraud Warnings */}
                  {data.fraudChecks?.warnings &&
                    data.fraudChecks.warnings.length > 0 && (
                      <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 mb-1">
                          Warnings
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {data.fraudChecks.warnings.map((w, i) => (
                            <span
                              key={i}
                              className="inline-block rounded-md bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-300"
                            >
                              {String(w).replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* KYC Documents — ID Front, Back, Selfie */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">
                  ID Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="mb-1 text-[10px] text-[var(--muted-text)]">
                      Front
                    </p>
                    {data.documentFrontUrl ? (
                      <DocImage
                        src={data.documentFrontUrl}
                        alt="Document Front"
                        className="w-full aspect-[4/3]"
                      />
                    ) : (
                      <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--surface)]">
                        <p className="text-[10px] text-[var(--muted-text)]">
                          No front uploaded
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] text-[var(--muted-text)]">
                      Back
                    </p>
                    {data.documentBackUrl ? (
                      <DocImage
                        src={data.documentBackUrl}
                        alt="Document Back"
                        className="w-full aspect-[4/3]"
                      />
                    ) : (
                      <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--surface)]">
                        <p className="text-[10px] text-[var(--muted-text)]">
                          No back uploaded
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] text-[var(--muted-text)]">
                      Selfie
                    </p>
                    {data.selfieUrl ? (
                      <DocImage
                        src={data.selfieUrl}
                        alt="Selfie"
                        className="w-full aspect-[4/3]"
                      />
                    ) : (
                      <div className="flex items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--surface)]">
                        <p className="text-[10px] text-[var(--muted-text)]">
                          No selfie uploaded
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Certifications */}
              {certs.length > 0 && (
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">
                    Certifications ({certs.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {certs.map((c, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-2"
                      >
                        <DocImage
                          src={c.url}
                          alt={`Certification ${i + 1}`}
                          className="w-full aspect-[4/3]"
                        />
                        <div className="mt-1.5 flex items-center justify-between">
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusColor(c.status)}`}
                          >
                            {c.status}
                          </span>
                          <span className="text-[9px] text-[var(--muted-text)]">
                            {formatDate(c.uploadedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CV Documents */}
              {cvs.length > 0 && (
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">
                    CV Documents ({cvs.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {cvs.map((c, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-2"
                      >
                        {c.url.toLowerCase().endsWith(".pdf") ? (
                          <a
                            href={resolveUrl(c.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-4 text-xs text-[var(--primary)] hover:underline"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                              />
                            </svg>
                            View PDF
                          </a>
                        ) : (
                          <DocImage
                            src={c.url}
                            alt={`CV ${i + 1}`}
                            className="w-full aspect-[4/3]"
                          />
                        )}
                        <div className="mt-1.5 flex items-center justify-between">
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusColor(c.status)}`}
                          >
                            {c.status}
                          </span>
                          <span className="text-[9px] text-[var(--muted-text)]">
                            {formatDate(c.uploadedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Background Check Summary */}
              {data.backgroundCheck && (
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">
                    Background Check
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <InfoCell
                      label="Status"
                      value={
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor(data.backgroundCheck.status)}`}
                        >
                          {data.backgroundCheck.status}
                        </span>
                      }
                    />
                    <InfoCell
                      label="Certificate #"
                      value={data.backgroundCheck.certificateNumber}
                    />
                    {data.backgroundCheck.submittedAt && (
                      <InfoCell
                        label="Submitted"
                        value={formatDate(data.backgroundCheck.submittedAt)}
                      />
                    )}
                  </div>
                  {data.backgroundCheck.uploadedDocument && (
                    <div className="mt-3">
                      <p className="mb-1 text-[10px] text-[var(--muted-text)]">
                        Uploaded Document
                      </p>
                      <DocImage
                        src={data.backgroundCheck.uploadedDocument}
                        alt="Background Check"
                        className="max-w-xs aspect-[4/3]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Vehicles Summary */}
              {vehicles.length > 0 && (
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">
                    Vehicles ({vehicles.length})
                  </h3>
                  {vehicles.map((v, idx) => (
                    <div
                      key={v.id}
                      className={`${idx > 0 ? "mt-3 pt-3 border-t border-[var(--border-color)]" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {v.make} {v.model} ({v.year})
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${statusColor(v.status)}`}
                        >
                          {v.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {v.photoFrontUrl && (
                          <div>
                            <p className="mb-0.5 text-[9px] text-[var(--muted-text)]">
                              Front
                            </p>
                            <DocImage
                              src={v.photoFrontUrl}
                              alt="Front"
                              className="w-full aspect-[4/3]"
                            />
                          </div>
                        )}
                        {v.photoBackUrl && (
                          <div>
                            <p className="mb-0.5 text-[9px] text-[var(--muted-text)]">
                              Back
                            </p>
                            <DocImage
                              src={v.photoBackUrl}
                              alt="Back"
                              className="w-full aspect-[4/3]"
                            />
                          </div>
                        )}
                        {v.photoLeftUrl && (
                          <div>
                            <p className="mb-0.5 text-[9px] text-[var(--muted-text)]">
                              Left
                            </p>
                            <DocImage
                              src={v.photoLeftUrl}
                              alt="Left"
                              className="w-full aspect-[4/3]"
                            />
                          </div>
                        )}
                        {v.photoRightUrl && (
                          <div>
                            <p className="mb-0.5 text-[9px] text-[var(--muted-text)]">
                              Right
                            </p>
                            <DocImage
                              src={v.photoRightUrl}
                              alt="Right"
                              className="w-full aspect-[4/3]"
                            />
                          </div>
                        )}
                        {v.vehicleLicenseUrl && (
                          <div>
                            <p className="mb-0.5 text-[9px] text-[var(--muted-text)]">
                              License
                            </p>
                            <DocImage
                              src={v.vehicleLicenseUrl}
                              alt="License"
                              className="w-full aspect-[4/3]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--background)] p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">
                  Admin Notes
                </h3>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes for this decision (optional)"
                  rows={3}
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-between rounded-b-2xl border-t border-[var(--border-color)] bg-[var(--surface)] px-6 py-4">
              <p className="text-xs text-[var(--muted-text)]">
                {reviewAction === "APPROVED"
                  ? "This will set the SP as fully ID-verified and unlock their account."
                  : "This will mark verification as failed. The SP will be notified."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setReviewAction(null);
                    setReviewNotes("");
                  }}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  disabled={actionLoading}
                  className={`rounded-lg px-8 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity ${
                    reviewAction === "APPROVED"
                      ? "bg-[var(--achievement-green)]"
                      : "bg-[var(--alert-red)]"
                  }`}
                >
                  {actionLoading
                    ? "Processing..."
                    : reviewAction === "APPROVED"
                      ? "Confirm Approval"
                      : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
