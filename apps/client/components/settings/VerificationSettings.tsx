"use client";
import React, { useMemo } from "react";

export default function VerificationSettings() {
  const role = useMemo(
    () =>
      typeof window !== "undefined"
        ? (localStorage.getItem("auth_role") ?? "JOB_SEEKER")
        : "JOB_SEEKER",
    []
  );
  if (role !== "JOB_SEEKER") {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700 ring-1 ring-inset ring-soft-blue/20">
        <p>Verification is only required for service providers.</p>
      </div>
    );
  }

  const mobileLink = "nasta://verification/start";

  return (
    <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-inset ring-soft-blue/20">
      <div className="mb-2 h-1.5 w-28 rounded-full bg-linear-to-r from-primary to-soft-blue" />
      <h2 className="text-xl font-semibold">
        Identity & Background Verification
      </h2>
      <p className="text-sm text-neutral-700">
        Verify your identity on mobile to apply for jobs. We use secure KYC and
        background check services.
      </p>
      <div className="space-y-3">
        <div className="rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs break-all">
          {mobileLink}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={mobileLink}
            className="inline-flex rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-soft-blue"
          >
            Open mobile app
          </a>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(mobileLink)}
            className="inline-flex rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-50"
          >
            Copy link
          </button>
        </div>
      </div>
      <p className="text-xs text-neutral-600">
        After completing verification, refresh this page to update your status.
        A future iteration will poll the server automatically.
      </p>
    </div>
  );
}
