"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import VerificationFields from "./VerificationFields";
// Payment fields removed from onboarding; moved to post-login settings

type State = { step: "form" } | { step: "success"; name: string };

export default function EmployerOnboardingForm() {
  const [state, setState] = useState<State>({ step: "form" });
  // Individual employer fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState<string>(
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_email") ?? "")
      : "",
  );
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postal, setPostal] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = {
      name,
      email,
      phone,
      address,
      city,
      region,
      postal,
      coordinates: lat && lng ? { lat, lng } : undefined,
      // paymentMethod omitted at onboarding stage
    };
    try {
      const res = await api<{ ok: boolean }>("/onboarding/employer", {
        method: "POST",
        body: payload,
      });
      if (res.status === 404) {
        if (typeof window !== "undefined") {
          const list = JSON.parse(
            localStorage.getItem("employer_onboarding") ?? "[]",
          );
          list.push({ ...payload, createdAt: new Date().toISOString() });
          localStorage.setItem("employer_onboarding", JSON.stringify(list));
        }
      } else if (res.error) {
        throw new Error(res.error);
      }
      setState({ step: "success", name });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (state.step === "success") {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 text-neutral-900 ring-1 ring-inset ring-soft-blue/30">
        <h2 className="text-xl font-semibold text-primary">
          Welcome, {state.name}!
        </h2>
        <p className="mt-2 text-sm text-neutral-700">
          Your client profile has been created. You can now post jobs and
          connect with caregivers.
        </p>
        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex rounded-full bg-linear-to-r from-primary to-soft-blue px-5 py-2 text-white shadow-sm hover:opacity-90"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-inset ring-soft-blue/20"
    >
      <div className="mb-2 h-1.5 w-28 rounded-full bg-linear-to-r from-primary to-soft-blue" />
      {error && (
        <div className="rounded-md border border-alert-red/30 bg-alert-red/10 px-3 py-2 text-sm text-alert-red">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-neutral-800">
          Full name
        </label>
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          Address
        </label>
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street and number"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          placeholder="Region/State"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          placeholder="Postal code"
          value={postal}
          onChange={(e) => setPostal(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
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
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-linear-to-r from-primary to-soft-blue px-5 py-2 text-white shadow-sm transition hover:opacity-90 disabled:opacity-60 md:w-auto"
        >
          {loading ? "Saving..." : "Create client profile"}
        </button>
      </div>
    </form>
  );
}
