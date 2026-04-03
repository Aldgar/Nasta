"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api, resolveAvatarUrl } from "./api";

export type Role = "JOB_SEEKER" | "EMPLOYER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  addressVerified?: boolean;
  kycStatus?: string;
  idVerificationStatus?: string;
  isIdVerified?: boolean;
  backgroundCheckStatus?: string;
  isBackgroundVerified?: boolean;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function roleHome(role: Role): string {
  switch (role) {
    case "EMPLOYER":
      return "/dashboard/employer";
    case "ADMIN":
      return "/dashboard/admin";
    default:
      return "/dashboard";
  }
}

export { roleHome };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  const login = useCallback(
    (token: string, user: User) => {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_email", user.email);
      localStorage.setItem("auth_role", user.role);
      setState({ user, token, loading: false });
      router.push(roleHome(user.role));
    },
    [router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_email");
    localStorage.removeItem("auth_role");
    setState({ user: null, token: null, loading: false });
    router.push("/");
  }, [router]);

  const refreshUser = useCallback(async () => {
    const role = (localStorage.getItem("auth_role") as Role) || "JOB_SEEKER";

    const endpoint =
      role === "EMPLOYER" ? "/profiles/employer/me" : "/profiles/me";

    const res = await api<Record<string, unknown>>(endpoint);
    if (!res.data) return;

    const data = res.data;
    const u = (data.user ?? data.admin ?? data) as Record<string, unknown>;
    const profile = (data.profile ?? {}) as Record<string, unknown>;
    const userProfile = (data.userProfile ?? {}) as Record<string, unknown>;

    const firstName = (u.firstName ?? "") as string;
    const lastName = (u.lastName ?? "") as string;
    const avatarRaw = (profile.avatarUrl ?? profile.logoUrl ?? userProfile.avatarUrl ?? u.avatar ?? "") as string;

    const addressSource = role === "EMPLOYER" ? userProfile : profile;

    setState((prev) => ({
      ...prev,
      user: {
        id: (u.id ?? u._id ?? "") as string,
        email: (u.email ?? "") as string,
        role,
        firstName,
        lastName,
        displayName: firstName ? `${firstName}${lastName ? " " + lastName : ""}` : (u.email as string) ?? "",
        phone: (u.phone ?? "") as string,
        emailVerified: !!(u.emailVerifiedAt),
        phoneVerified: !!(u.phoneVerifiedAt),
        addressVerified: !!(u.isBusinessVerified || addressSource.city || addressSource.addressLine1),
        kycStatus: (u.idVerificationStatus ?? "") as string,
        idVerificationStatus: (u.idVerificationStatus ?? "") as string,
        isIdVerified: !!(u.isIdVerified),
        backgroundCheckStatus: (u.backgroundCheckStatus ?? "") as string,
        isBackgroundVerified: !!(u.isBackgroundVerified),
        avatarUrl: resolveAvatarUrl(avatarRaw),
        bio: (profile.bio ?? u.bio ?? "") as string,
        dateOfBirth: ((profile.dateOfBirth ?? "") as string).split("T")[0],
        address: {
          addressLine1: (addressSource.addressLine1 ?? "") as string,
          addressLine2: (addressSource.addressLine2 ?? "") as string,
          city: (addressSource.city ?? u.city ?? "") as string,
          state: (addressSource.state ?? "") as string,
          postalCode: (addressSource.postalCode ?? "") as string,
          country: (addressSource.country ?? u.country ?? "") as string,
        },
      },
    }));
  }, []);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setState({ user: null, token: null, loading: false });
      return;
    }

    const payload = decodeJwtPayload(token);
    const role = (localStorage.getItem("auth_role") as Role) || "JOB_SEEKER";

    setState({
      user: {
        id: (payload?.sub as string) ?? "",
        email: localStorage.getItem("auth_email") ?? "",
        role,
      },
      token,
      loading: false,
    });
  }, []);

  // Auto-fetch full profile once we have a token
  useEffect(() => {
    if (state.token && state.user?.id) {
      refreshUser();
    }
  }, [state.token, state.user?.id, refreshUser]);

  const value = useMemo(
    () => ({ ...state, login, logout, refreshUser }),
    [state, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
