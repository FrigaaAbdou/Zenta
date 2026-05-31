import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminShellProvider } from "@/components/admin/layout/AdminShellContext";
import { AdminTopbar } from "@/components/admin/layout/AdminTopbar";
import { useIsMobile } from "@/hooks/use-mobile";

export function AdminLayout() {
  const isMobile = useIsMobile();
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const shellValue = useMemo(
    () => ({
      isMobile,
      isMobileOpen,
      isDesktopCollapsed,
      toggleSidebar() {
        if (isMobile) {
          setIsMobileOpen((current) => !current);
          return;
        }

        setIsDesktopCollapsed((current) => !current);
      },
      closeMobileSidebar() {
        setIsMobileOpen(false);
      },
    }),
    [isDesktopCollapsed, isMobile, isMobileOpen],
  );

  return (
    <AdminShellProvider value={shellValue}>
      <div className="min-h-svh bg-[#f6f7fb] md:flex md:h-svh md:overflow-hidden">
        <AdminSidebar />

        <div className="min-w-0 flex-1 md:flex md:h-svh md:flex-col md:overflow-hidden">
          <AdminTopbar />
          <main className="px-4 py-5 sm:px-6 lg:px-8 md:min-h-0 md:flex-1 md:overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminShellProvider>
  );
}
