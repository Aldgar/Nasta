"use client";
import React, { useMemo, useState } from "react";
import EmployerPaymentFields, {
  EmployerPayment,
} from "../onboarding/EmployerPaymentFields";
import JobSeekerPayoutFields, {
  JobSeekerPayout,
} from "../onboarding/JobSeekerPayoutFields";

export default function PaymentSettings() {
  const role = useMemo(
    () =>
      typeof window !== "undefined"
        ? (localStorage.getItem("auth_role") ?? "JOB_SEEKER")
        : "JOB_SEEKER",
    []
  );
  const isEmployer = role === "EMPLOYER";

  const [card, setCard] = useState<EmployerPayment>({
    cardholder: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    billingZip: "",
  });
  const [payout, setPayout] = useState<JobSeekerPayout>({
    method: "bank",
    holderName: "",
    bankName: "",
    iban: "",
    routing: "",
  });
  const [saved, setSaved] = useState<string | null>(null);

  const onSave = async () => {
    // Stub: In production, tokenize card/payout and send to API
    const summary = isEmployer
      ? card.cardNumber
        ? { card: { brand: "mock", last4: card.cardNumber.slice(-4) } }
        : {}
      : payout.iban
        ? {
            payout: {
              method: payout.method,
              masked: `..${payout.iban.slice(-4)}`,
            },
          }
        : {};
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("payment_settings_draft", JSON.stringify(summary));
      }
      setSaved("Saved");
      setTimeout(() => setSaved(null), 1200);
    } catch {}
  };

  return (
    <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-inset ring-soft-blue/20">
      <div className="mb-2 h-1.5 w-28 rounded-full bg-linear-to-r from-primary to-soft-blue" />
      <h2 className="text-xl font-semibold">Payment settings</h2>
      {isEmployer ? (
        <EmployerPaymentFields value={card} onChange={setCard} />
      ) : (
        <JobSeekerPayoutFields value={payout} onChange={setPayout} />
      )}
      <div>
        <button
          onClick={onSave}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-soft-blue"
        >
          Save
        </button>
        {saved && (
          <span className="ml-3 text-sm text-achievement-green">{saved}</span>
        )}
      </div>
    </div>
  );
}
