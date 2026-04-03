"use client";
import { useMemo, useState } from "react";
import VerificationFields from "./VerificationFields";
// Payout moved to post-login settings; keep onboarding simple

export default function JobSeekerOnboardingForm() {
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | "">("");
  const [email, setEmail] = useState<string>(
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_email") ?? "")
      : "",
  );
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [notify, setNotify] = useState<string | null>(null);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  };

  const deepLink = useMemo(() => {
    const params = new URLSearchParams();
    if (fullName) params.set("name", fullName);
    if (headline) params.set("headline", headline);
    if (location) params.set("location", location);
    if (skills) params.set("skills", skills);
    if (experienceYears !== "") params.set("exp", String(experienceYears));
    return `nasta://onboarding/kyc?${params.toString()}`;
  }, [fullName, headline, location, skills, experienceYears]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "jobseeker_onboarding_draft",
          JSON.stringify({
            fullName,
            headline,
            location,
            skills,
            experienceYears,
            email,
            phone,
            address,
            coordinates: lat && lng ? { lat, lng } : undefined,
            // payout moved to settings
          }),
        );
      }
    } catch (err) {
      // Non-blocking: if localStorage fails, continue UX
      console.warn("Failed to store onboarding draft", err);
    }
    // Simulate sending a helpful reminder email
    setTimeout(
      () =>
        setNotify(
          `We sent a reminder to ${email} to complete verification later.`,
        ),
      300,
    );
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-sm ring-1 ring-inset ring-soft-blue/20">
        <div className="mb-2 h-1.5 w-28 rounded-full bg-linear-to-r from-primary to-soft-blue" />
        <h2 className="text-xl font-semibold text-primary">
          You&apos;re all set to explore
        </h2>
        <p className="mt-2 text-sm text-neutral-700">
          We saved your details. You can browse jobs now. To apply, please
          complete identity & background verification from your profile any
          time.
        </p>
        {notify && <p className="mt-1 text-xs text-neutral-600">{notify}</p>}
        <div className="mt-4 space-y-3">
          <div className="rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs break-all">
            {deepLink}
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={deepLink}
              className="inline-flex rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-soft-blue"
            >
              Continue verification on mobile
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(deepLink)}
              className="inline-flex rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-50"
            >
              Copy link
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs text-neutral-600">
          Tip: If you&apos;re on desktop, copy the link and send it to your
          phone. We&apos;ll add a QR code here later.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-inset ring-soft-blue/20"
    >
      <div className="mb-2 h-1.5 w-28 rounded-full bg-linear-to-r from-primary to-soft-blue" />
      <div>
        <label className="block text-sm font-medium text-neutral-800">
          Full name
        </label>
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <VerificationFields
        email={email}
        setEmail={setEmail}
        phone={phone}
        setPhone={setPhone}
      />
      <div>
        <label className="block text-sm font-medium text-neutral-800">
          Headline
        </label>
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g., Frontend Developer"
        />
      </div>
      {/* Payout fields moved to Settings > Payment */}
      <div>
        <label className="block text-sm font-medium text-neutral-800">
          Address
        </label>
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street and number"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={useMyLocation}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
          >
            Use my location
          </button>
          {lat && lng ? (
            <span className="text-xs text-neutral-600">
              {lat.toFixed(5)}, {lng.toFixed(5)} –
              <a
                href={`https://maps.google.com/?q=${lat},${lng}`}
                className="ml-1 underline"
                target="_blank"
                rel="noreferrer"
              >
                Open map
              </a>
            </span>
          ) : (
            <span className="text-xs text-neutral-500">Optional</span>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-800">
          Location
        </label>
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-800">
          Primary skills
        </label>
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="TypeScript, React, Node.js"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-800">
          Years of experience
        </label>
        <input
          type="number"
          min={0}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          value={experienceYears}
          onChange={(e) =>
            setExperienceYears(e.target.value ? Number(e.target.value) : "")
          }
        />
      </div>
      <div className="pt-2 flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-linear-to-r from-primary to-soft-blue px-4 py-2 text-white hover:opacity-95"
        >
          Save and continue to explore
        </button>
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-neutral-900 hover:bg-neutral-50"
        >
          Skip for now
        </button>
      </div>
    </form>
  );
}
