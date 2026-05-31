import { createContext, useContext, type ReactNode } from "react";

type AdminShellContextValue = {
  isMobile: boolean;
  isMobileOpen: boolean;
  isDesktopCollapsed: boolean;
  toggleSidebar: () => void;
  closeMobileSidebar: () => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

export function AdminShellProvider({
  value,
  children,
}: {
  value: AdminShellContextValue;
  children: ReactNode;
}) {
  return (
    <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>
  );
}

export function useAdminShell() {
  const context = useContext(AdminShellContext);

  if (!context) {
    throw new Error("useAdminShell must be used within AdminShellProvider.");
  }

  return context;
}
