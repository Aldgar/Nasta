"use client";
import React, { useState } from "react";

export type VerificationFieldsProps = {
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
};

/**
 * Lightweight front-end email/phone verification mock.
 * - Generates a 6-digit code and stores it in memory; in real use, call the API to send SMS/email.
 * - Shows a small helper text indicating a notification was sent.
 */
export default function VerificationFields({
  email,
  setEmail,
  phone,
  setPhone,
}: VerificationFieldsProps) {
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [phoneSent, setPhoneSent] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [generatedEmailCode, setGeneratedEmailCode] = useState<string>("");
  const [generatedPhoneCode, setGeneratedPhoneCode] = useState<string>("");

  const sendEmail = () => {
    if (!email) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedEmailCode(code);
    setEmailSent(`We sent a code to ${email}. (Dev: ${code})`);
  };
  const sendSms = () => {
    if (!phone) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPhoneCode(code);
    setPhoneSent(`We sent a code by SMS to ${phone}. (Dev: ${code})`);
  };
  const verifyEmail = () => setEmailVerified(emailCode === generatedEmailCode);
  const verifyPhone = () => setPhoneVerified(phoneCode === generatedPhoneCode);

  return (
    <div className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-neutral-800">
          Email
        </label>
        <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
          <input
            type="email"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <button
            type="button"
            onClick={sendEmail}
            className="rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-soft-blue"
          >
            Send code
          </button>
        </div>
        {emailSent && (
          <p className="mt-1 text-xs text-neutral-600">{emailSent}</p>
        )}
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            placeholder="Enter 6-digit code"
            value={emailCode}
            onChange={(e) => setEmailCode(e.target.value)}
          />
          <button
            type="button"
            onClick={verifyEmail}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
          >
            Verify
          </button>
        </div>
        {emailVerified && (
          <p className="mt-1 text-xs text-achievement-green">Email verified</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-neutral-800">
          Phone number
        </label>
        <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
          <input
            type="tel"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 555 5555"
            required
          />
          <button
            type="button"
            onClick={sendSms}
            className="rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-soft-blue"
          >
            Send code
          </button>
        </div>
        {phoneSent && (
          <p className="mt-1 text-xs text-neutral-600">{phoneSent}</p>
        )}
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            placeholder="Enter 6-digit code"
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value)}
          />
          <button
            type="button"
            onClick={verifyPhone}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
          >
            Verify
          </button>
        </div>
        {phoneVerified && (
          <p className="mt-1 text-xs text-achievement-green">Phone verified</p>
        )}
      </div>
    </div>
  );
}
