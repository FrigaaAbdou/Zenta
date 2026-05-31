import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getAdminMe, loginAdmin, logoutAdmin } from "@/lib/api/adminAuthApi";
import type { ApiErrorPayload } from "@/lib/api/client";
import type { AdminAuthStatus, AdminUser } from "./types";

const ADMIN_TOKEN_STORAGE_KEY = "cts-admin-token";

type AdminAuthContextValue = {
  admin: AdminUser | null;
  token: string | null;
  status: AdminAuthStatus;
  login: (input: { email: string; password: string }) => Promise<AdminUser>;
  logout: () => Promise<void>;
};

const defaultValue: AdminAuthContextValue = {
  admin: null,
  token: null,
  status: "loading",
  login: async () => {
    throw new Error("AdminAuthProvider is not mounted.");
  },
  logout: async () => undefined,
};

const AdminAuthContext = createContext<AdminAuthContextValue>(defaultValue);

function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const storage = window.localStorage;

  return storage && typeof storage.getItem === "function"
    ? storage.getItem(ADMIN_TOKEN_STORAGE_KEY)
    : null;
}

function persistToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  const storage = window.localStorage;

  if (!storage) {
    return;
  }

  if (token) {
    storage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    return;
  }

  storage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [status, setStatus] = useState<AdminAuthStatus>(
    token ? "loading" : "unauthenticated",
  );

  useEffect(() => {
    if (!token) {
      setAdmin(null);
      setStatus("unauthenticated");
      return;
    }

    let cancelled = false;

    setStatus("loading");

    getAdminMe(token)
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setAdmin(payload.admin);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        persistToken(null);
        setToken(null);
        setAdmin(null);
        setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin,
      token,
      status,
      async login(input) {
        const payload = await loginAdmin(input);

        persistToken(payload.token);
        setToken(payload.token);
        setAdmin(payload.admin);
        setStatus("authenticated");

        return payload.admin;
      },
      async logout() {
        const currentToken = token;

        persistToken(null);
        setToken(null);
        setAdmin(null);
        setStatus("unauthenticated");

        if (!currentToken) {
          return;
        }

        try {
          await logoutAdmin(currentToken);
        } catch (_error) {
          return;
        }
      },
    }),
    [admin, status, token],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function isUnauthorizedAdminError(error: unknown) {
  const apiError = error as ApiErrorPayload | undefined;

  return apiError?.status === 401 || apiError?.code === "UNAUTHORIZED";
}
