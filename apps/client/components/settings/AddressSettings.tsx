"use client";
import { useEffect, useState } from "react";

type ReverseResult = {
  formatted?: string;
  city?: string;
  country?: string;
  error?: string;
};

// Minimal shape of the Nominatim reverse geocoding response we use
type NominatimResponse = {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
  };
};

export default function AddressSettings() {
  const [address, setAddress] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : localStorage.getItem("user_address") || "",
  );
  const [coords, setCoords] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : localStorage.getItem("user_coords") || "",
  );
  const [status, setStatus] = useState<string>("");
  const [resolving, setResolving] = useState(false);
  const [reverse, setReverse] = useState<ReverseResult | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("user_address", address);
    localStorage.setItem("user_coords", coords);
  }, [address, coords]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saved");
    setTimeout(() => setStatus(""), 2000);
  }

  function captureLocation() {
    if (!navigator.geolocation) return;
    setStatus("Capturing GPS...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void (async () => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          const c = `${lat},${lng}`;
          setCoords(c);
          setStatus("Resolving address...");
          setResolving(true);
          const rev = await reverseGeocode(lat, lng);
          setReverse(rev);
          if (rev.formatted && !address) setAddress(rev.formatted);
          setResolving(false);
          setStatus(rev.error ? "Lookup failed" : "Location captured");
          setTimeout(() => setStatus(""), 2500);
        })().catch((e) => {
          console.error(e);
          setResolving(false);
          setStatus("Lookup failed");
          setTimeout(() => setStatus(""), 2500);
        });
      },
      (err) => {
        setStatus(err.message || "GPS denied");
        setResolving(false);
        setTimeout(() => setStatus(""), 3000);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function reverseGeocode(
    lat: string,
    lng: string,
  ): Promise<ReverseResult> {
    try {
      // Use OpenStreetMap Nominatim (no key). Respect usage: 1 request per second.
      // Provide a contact email to comply with their usage policy.
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(lat),
        lon: String(lng),
        email: "support@nasta.app",
      });
      const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;
      const r = await fetch(url, {
        headers: { "Accept-Language": "en" },
        // Keep referrer to your site to be transparent
        referrerPolicy: "strict-origin-when-cross-origin",
      });
      if (!r.ok) return { error: `HTTP ${r.status}` };
      const data: unknown = await r.json();
      const parsed = data as NominatimResponse;
      const formatted: string | undefined = parsed.display_name;
      return {
        formatted,
        city:
          parsed.address?.city ||
          parsed.address?.town ||
          parsed.address?.village,
        country: parsed.address?.country,
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { error: message || "Reverse geocode error" };
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Address
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          placeholder="Street, City, Region"
        />
        {reverse?.formatted && (
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            Suggested: {reverse.formatted}
          </p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          GPS Coordinates
        </label>
        <input
          type="text"
          readOnly
          value={coords}
          placeholder="(capture)"
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
        <button
          type="button"
          onClick={captureLocation}
          className="mt-2 rounded-md bg-neutral-800 px-3 py-1.5 text-xs text-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-neutral-700 dark:hover:bg-neutral-600"
          disabled={resolving}
        >
          {resolving ? "Resolving..." : "Capture current location"}
        </button>
        {reverse && !reverse.formatted && reverse.error && (
          <p className="mt-1 text-xs text-red-600">{reverse.error}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-soft-blue"
        >
          Save address
        </button>
        {status && (
          <span className="text-xs text-green-600 transition-opacity">
            {status}
          </span>
        )}
      </div>
    </form>
  );
}
