"use client";
import React from "react";
import BrandedSelect from "../ui/BrandedSelect";

export type PayoutMethod = "bank" | "wallet";

export type JobSeekerPayout = {
  method: PayoutMethod;
  holderName: string;
  bankName?: string;
  iban?: string; // or account number
  routing?: string; // optional
};

type Props = {
  value: JobSeekerPayout;
  onChange: (v: JobSeekerPayout) => void;
};

export default function JobSeekerPayoutFields({ value, onChange }: Props) {
  const set = (patch: Partial<JobSeekerPayout>) =>
    onChange({ ...value, ...patch });

  return (
    <fieldset className="space-y-3 rounded-xl border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-800">
        Payout details (for service providers)
      </legend>
      <p className="text-xs text-neutral-600">
        Add where you want to receive payments when hired.
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm">Payout method</label>
          <div className="mt-1">
            <BrandedSelect
              value={value.method}
              onChange={(v) => set({ method: v as PayoutMethod })}
              options={[
                { value: "bank", label: "Bank transfer" },
                { value: "wallet", label: "Wallet" },
              ]}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm">Account holder name</label>
          <input
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            value={value.holderName}
            onChange={(e) => set({ holderName: e.target.value })}
            placeholder="Full name"
          />
        </div>
      </div>

      {value.method === "bank" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="block text-sm">Bank name</label>
            <input
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              value={value.bankName ?? ""}
              onChange={(e) => set({ bankName: e.target.value })}
              placeholder="Your bank"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm">IBAN / Account number</label>
            <input
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              value={value.iban ?? ""}
              onChange={(e) => set({ iban: e.target.value })}
              placeholder="IBAN or account number"
            />
          </div>
        </div>
      )}

      {value.method === "bank" && (
        <div>
          <label className="block text-sm">Routing (optional)</label>
          <input
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            value={value.routing ?? ""}
            onChange={(e) => set({ routing: e.target.value })}
            placeholder="Routing number if applicable"
          />
        </div>
      )}

      {value.method === "wallet" && (
        <p className="text-xs text-neutral-600">
          We will enable supported wallets later.
        </p>
      )}
    </fieldset>
  );
}
