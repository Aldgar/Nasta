"use client";
import React, { useState } from "react";

export type EmployerPayment = {
  cardholder: string;
  cardNumber: string;
  expiry: string; // MM/YY
  cvc: string;
  billingZip?: string;
};

type Props = {
  value: EmployerPayment;
  onChange: (v: EmployerPayment) => void;
};

export default function EmployerPaymentFields({ value, onChange }: Props) {
  const [showHint, setShowHint] = useState(false);

  const set = (patch: Partial<EmployerPayment>) =>
    onChange({ ...value, ...patch });

  return (
    <fieldset className="space-y-3 rounded-xl border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-800">
        Payment method (for employers)
      </legend>
      <p className="text-xs text-neutral-600">
        Add a card to pay for services. We don’t charge now; this is a
        design-only field.
      </p>
      <div>
        <label className="block text-sm">Cardholder name</label>
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          value={value.cardholder}
          onChange={(e) => set({ cardholder: e.target.value })}
          placeholder="Name on card"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm">Card number</label>
          <input
            inputMode="numeric"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/60"
            value={value.cardNumber}
            onChange={(e) =>
              set({ cardNumber: e.target.value.replace(/\s+/g, "") })
            }
            placeholder="4242 4242 4242 4242"
            onFocus={() => setShowHint(true)}
            onBlur={() => setShowHint(false)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Expiry</label>
            <input
              inputMode="numeric"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              value={value.expiry}
              onChange={(e) => set({ expiry: e.target.value })}
              placeholder="MM/YY"
              maxLength={5}
            />
          </div>
          <div>
            <label className="block text-sm">CVC</label>
            <input
              inputMode="numeric"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              value={value.cvc}
              onChange={(e) => set({ cvc: e.target.value })}
              placeholder="123"
              maxLength={4}
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm">Billing ZIP (optional)</label>
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          value={value.billingZip ?? ""}
          onChange={(e) => set({ billingZip: e.target.value })}
          placeholder="ZIP / Postcode"
        />
      </div>

      {showHint && (
        <p className="text-xs text-neutral-500">
          Tip: In production we’d use a PCI-compliant provider (e.g., Stripe
          Elements) here.
        </p>
      )}
    </fieldset>
  );
}
