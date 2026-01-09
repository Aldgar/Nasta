"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, API_BASE } from "../../lib/api";

type Role = "JOB_SEEKER" | "EMPLOYER" | "ADMIN";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [role, setRole] = useState<Role>("JOB_SEEKER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Client-side validation for empty/invalid credentials
    const nextFieldErrors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) nextFieldErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      nextFieldErrors.email = "Enter a valid email";
    if (!password) nextFieldErrors.password = "Password is required";
    if (nextFieldErrors.email || nextFieldErrors.password) {
      setFieldErrors(nextFieldErrors);
      setError("Please provide your email and password");
      setLoading(false);
      return;
    }
    try {
      const tryLogin = async (path: string) => {
        const res = await api<unknown>(path, {
          method: "POST",
          body: { email: trimmedEmail, password },
        });
        if (res.error || !res.data) return { ok: false as const, res };
        const data = res.data as Record<string, unknown>;
        const token = data.accessToken as string | undefined;
        const who = (data.user ?? data.admin) as
          | { email?: string; role?: string }
          | undefined;
        if (!token) return { ok: false as const, res };
        return { ok: true as const, token, who };
      };

      if (role === "ADMIN") {
        const admin = await tryLogin("/auth/admin/login");
        if (!admin.ok) {
          setError("Only Admins with Admin Credintials can login");
          setLoading(false);
          return;
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", admin.token);
          if (admin.who?.email)
            localStorage.setItem("auth_email", admin.who.email);
          if (admin.who?.role)
            localStorage.setItem("auth_role", admin.who.role);
        }
        router.push("/");
        router.refresh();
        return;
      }

      if (role === "EMPLOYER") {
        const emp = await tryLogin("/auth/employer/login");
        if (!emp.ok) {
          // If these credentials are for a Job Seeker, suggest correct login
          const userProbe = await tryLogin("/auth/user/login");
          if (userProbe.ok) {
            setError("Please use the Job Seeker login if you are a Job Seeker");
          } else {
            setError("Invalid email or password");
          }
          setLoading(false);
          return;
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", emp.token);
          if (emp.who?.email) localStorage.setItem("auth_email", emp.who.email);
          if (emp.who?.role) localStorage.setItem("auth_role", emp.who.role);
        }
        router.push("/");
        router.refresh();
        return;
      }

      // JOB_SEEKER
      {
        const user = await tryLogin("/auth/user/login");
        if (!user.ok) {
          // If these credentials are for an Employer, suggest correct login
          const empProbe = await tryLogin("/auth/employer/login");
          if (empProbe.ok) {
            setError("Please use Employer login if you are Employer");
          } else {
            setError("Invalid email or password");
          }
          setLoading(false);
          return;
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", user.token);
          if (user.who?.email)
            localStorage.setItem("auth_email", user.who.email);
          if (user.who?.role) localStorage.setItem("auth_role", user.who.role);
        }
        router.push("/");
        router.refresh();
        return;
      }
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  // If we arrive with provider=google, attempt to start OAuth on the server
  useEffect(() => {
    const provider = search?.get("provider");
    const roleParam = search?.get("role") as Role | null;
    if (provider === "google") {
      // Redirect directly; avoid setState inside the effect per lint rule
      const roleToUse = roleParam || "JOB_SEEKER";
      const url = `${API_BASE}/auth/google?role=${encodeURIComponent(roleToUse)}`;
      if (typeof window !== "undefined") window.location.href = url;
    }
  }, [search]);

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
      <div className="flex gap-2">
        {(
          [
            ["JOB_SEEKER", "Job Seeker"],
            ["EMPLOYER", "Employer"],
            ["ADMIN", "Admin"],
          ] as const
        ).map(([value, label]) => (
          <button
            type="button"
            key={value}
            onClick={() => setRole(value)}
            className={
              "rounded-full px-3 py-1 text-sm font-medium ring-1 " +
              (role === value
                ? "bg-neutral-900 text-white ring-neutral-800"
                : "bg-white text-neutral-900 ring-neutral-300 hover:bg-neutral-50")
            }
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-600">
        Choose your portal: Job Seeker for candidates, Employer for companies,
        and Admin for platform administrators.
      </p>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email)
              setFieldErrors((f) => ({ ...f, email: undefined }));
          }}
          aria-invalid={!!fieldErrors.email}
          className={
            "w-full rounded-md bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 " +
            (fieldErrors.email
              ? "border-alert-red focus:ring-alert-red/70"
              : "border-neutral-300 focus:ring-primary")
          }
          placeholder="you@example.com"
          autoComplete="email"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-xs text-alert-red">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password)
              setFieldErrors((f) => ({ ...f, password: undefined }));
          }}
          aria-invalid={!!fieldErrors.password}
          className={
            "w-full rounded-md bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 " +
            (fieldErrors.password
              ? "border-alert-red focus:ring-alert-red/70"
              : "border-neutral-300 focus:ring-primary")
          }
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-alert-red">{fieldErrors.password}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-soft-blue disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs text-neutral-500">or</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <button
        type="button"
        onClick={() => {
          const url = `${API_BASE}/auth/google?role=${encodeURIComponent(role)}`;
          if (typeof window !== "undefined") window.location.href = url;
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
      >
        <span>Continue with Google</span>
      </button>

      <p className="text-xs text-neutral-600">
        By signing in, you agree to our Terms and Privacy Policy.
      </p>
    </form>
  );
}
