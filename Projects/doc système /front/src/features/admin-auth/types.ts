export type AdminRole = "super_admin" | "manager" | "operator";

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
};

export type AdminAuthStatus = "loading" | "authenticated" | "unauthenticated";
