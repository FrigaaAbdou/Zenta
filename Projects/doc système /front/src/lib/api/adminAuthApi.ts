import { apiRequest } from "./client";
import type { AdminUser } from "@/features/admin-auth/types";

type AdminLoginResponse = {
  token: string;
  expiresIn: string;
  admin: AdminUser;
};

type AdminMeResponse = {
  admin: AdminUser;
};

function createAdminHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function loginAdmin(input: { email: string; password: string }) {
  return apiRequest<AdminLoginResponse>("/api/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getAdminMe(token: string) {
  return apiRequest<AdminMeResponse>("/api/admin/auth/me", {
    headers: createAdminHeaders(token),
  });
}

export async function logoutAdmin(token: string) {
  return apiRequest<void>("/api/admin/auth/logout", {
    method: "POST",
    headers: createAdminHeaders(token),
  });
}
