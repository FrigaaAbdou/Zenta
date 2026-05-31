import {
  CalendarDays,
  CalendarRange,
  Droplets,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ShieldCheck,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { useAdminAuth } from "@/features/admin-auth/AdminAuthProvider";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminLogoutDialog } from "./AdminLogoutDialog";
import { useAdminShell } from "./AdminShellContext";

const adminSidebarCopy = {
  workspace: "Back-office CTS",
  subtitle: "Pilotage opérationnel",
  sectionLabel: "Navigation",
  dashboard: "Dashboard",
  calendar: "Calendrier",
  appointments: "Demandes",
  campaigns: "Campagnes",
  content: "Contenus",
  adminRole: {
    super_admin: "Super admin",
    manager: "Manager",
    operator: "Opérateur",
  },
  logout: "Déconnexion",
  close: "Fermer le menu",
} as const;

const navItems = [
  {
    to: "/admin",
    label: adminSidebarCopy.dashboard,
    icon: LayoutDashboard,
    matches: (pathname: string) => pathname === "/admin",
  },
  {
    to: "/admin/calendar",
    label: adminSidebarCopy.calendar,
    icon: CalendarRange,
    matches: (pathname: string) => pathname.startsWith("/admin/calendar"),
  },
  {
    to: "/admin/appointments",
    label: adminSidebarCopy.appointments,
    icon: CalendarDays,
    matches: (pathname: string) => pathname.startsWith("/admin/appointments"),
  },
  {
    to: "/admin/campaigns",
    label: adminSidebarCopy.campaigns,
    icon: Megaphone,
    matches: (pathname: string) => pathname.startsWith("/admin/campaigns"),
  },
  {
    to: "/admin/content",
    label: adminSidebarCopy.content,
    icon: FileText,
    matches: (pathname: string) => pathname.startsWith("/admin/content"),
  },
];

export function AdminSidebar() {
  const { admin } = useAdminAuth();
  const { pathname } = useLocation();
  const { isMobile, isMobileOpen, isDesktopCollapsed, closeMobileSidebar } =
    useAdminShell();

  const initials =
    admin?.email
      ?.split("@")[0]
      .split(/[.\-_ ]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join("") ?? "AD";

  const isCollapsed = !isMobile && isDesktopCollapsed;

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white">
      <div
        className={cn(
          "border-b border-slate-200 px-4 py-4",
          isCollapsed && "px-3",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-brand-red shadow-sm">
            <Droplets className="size-5" strokeWidth={1.9} />
          </div>

          {!isCollapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-slate-950">
                {adminSidebarCopy.workspace}
              </p>
              <p className="mt-1 truncate text-sm text-slate-500">
                {adminSidebarCopy.subtitle}
              </p>
            </div>
          ) : null}

          {isMobile ? (
            <button
              type="button"
              aria-label={adminSidebarCopy.close}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              onClick={closeMobileSidebar}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        {!isCollapsed ? (
          <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {adminSidebarCopy.sectionLabel}
          </p>
        ) : null}

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.matches(pathname);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                onClick={() => {
                  if (isMobile) {
                    closeMobileSidebar();
                  }
                }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium transition-colors",
                  isCollapsed && "justify-center px-0",
                  isActive
                    ? "bg-red-50 text-slate-950 shadow-[inset_0_0_0_1px_rgba(231,0,11,0.08)]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isActive ? "bg-white text-brand-red shadow-sm" : "text-slate-500",
                  )}
                >
                  <Icon className="size-[18px]" />
                </div>

                {!isCollapsed ? <span className="truncate">{item.label}</span> : null}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <Avatar className="size-10 ring-1 ring-red-100">
              <AvatarFallback className="bg-red-50 text-sm font-semibold text-brand-red">
                {initials}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-950">
                  {admin?.email ?? "admin@cts.local"}
                </p>
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>{adminSidebarCopy.adminRole[admin?.role ?? "operator"]}</span>
                </div>
              </div>
            ) : null}
          </div>

          <AdminLogoutDialog>
            <button
              type="button"
              className={cn(
                "mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 transition hover:border-red-100 hover:bg-red-50 hover:text-brand-red",
                isCollapsed && "mt-0 size-10 w-10 border-transparent bg-transparent p-0",
              )}
              aria-label={adminSidebarCopy.logout}
              title={isCollapsed ? adminSidebarCopy.logout : undefined}
            >
              <LogOut className="size-4 shrink-0" />
              {!isCollapsed ? <span>{adminSidebarCopy.logout}</span> : null}
            </button>
          </AdminLogoutDialog>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div
          className={cn(
            "fixed inset-0 z-40 bg-slate-950/30 transition-opacity md:hidden",
            isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={closeMobileSidebar}
        />
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[min(20rem,85vw)] -translate-x-full border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 md:hidden",
            isMobileOpen && "translate-x-0",
          )}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={cn(
        "hidden h-svh shrink-0 border-r border-slate-200 bg-white transition-[width] duration-300 md:sticky md:top-0 md:flex md:flex-col",
        isCollapsed ? "md:w-[5.5rem]" : "md:w-[17.5rem]",
      )}
    >
      {sidebarContent}
    </aside>
  );
}
