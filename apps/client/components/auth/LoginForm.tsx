"use client";
import { useState } from "react";
import { api } from "../../lib/api";
import { useAuth, type Role } from "../../lib/auth";

export default function LoginForm() {
  const { login: authLogin } = useAuth();
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
          body: { email: trimmedEmail, password: password.trim() },
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
          setError("Only Admins with Admin Credentials can login");
          setLoading(false);
          return;
        }
        const adminRole = (admin.who?.role as Role) || "ADMIN";
        authLogin(admin.token, {
          id: "",
          email: admin.who?.email ?? trimmedEmail,
          role: adminRole,
        });
        return;
      }

      if (role === "EMPLOYER") {
        const emp = await tryLogin("/auth/employer/login");
        if (!emp.ok) {
          const userProbe = await tryLogin("/auth/user/login");
          if (userProbe.ok) {
            setError("Please use the Service Provider login if you are a Service Provider");
          } else {
            setError("Invalid email or password");
          }
          setLoading(false);
          return;
        }
        const empRole = (emp.who?.role as Role) || "EMPLOYER";
        authLogin(emp.token, {
          id: "",
          email: emp.who?.email ?? trimmedEmail,
          role: empRole,
        });
        return;
      }

      // JOB_SEEKER
      {
        const user = await tryLogin("/auth/user/login");
        if (!user.ok) {
          const empProbe = await tryLogin("/auth/employer/login");
          if (empProbe.ok) {
            setError("Please use Employer login if you are Employer");
          } else {
            setError("Invalid email or password");
          }
          setLoading(false);
          return;
        }
        const userRole = (user.who?.role as Role) || "JOB_SEEKER";
        authLogin(user.token, {
          id: "",
          email: user.who?.email ?? trimmedEmail,
          role: userRole,
        });
        return;
      }
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
      <div className="flex gap-2">
        {(
          [
            ["JOB_SEEKER", "Service Provider"],
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
        Choose your portal: Service Provider for workers, Employer for companies,
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

      <p className="text-xs text-neutral-600">
        By signing in, you agree to our Terms and Privacy Policy.
      </p>
    </form>
  );
}
