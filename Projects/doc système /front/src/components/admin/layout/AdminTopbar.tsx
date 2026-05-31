import { Bell, ChevronDown, LogOut, PanelLeft, Search, ShieldCheck } from "lucide-react";

import { useAdminAuth } from "@/features/admin-auth/AdminAuthProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { AdminLogoutDialog } from "./AdminLogoutDialog";
import { useAdminShell } from "./AdminShellContext";

const adminTopbarCopy = {
  searchPlaceholder: "Rechercher un donneur, une campagne ou une demande",
  environment: "Environnement de travail",
  workspace: "CTS Mustapha Admin Workspace",
  notifications: "Notifications",
  toggleSidebar: "Basculer la navigation",
  roleLabel: {
    super_admin: "Super admin",
    manager: "Manager",
    operator: "Opérateur",
  },
  signOut: "Déconnexion",
} as const;

export function AdminTopbar() {
  const { admin } = useAdminAuth();
  const { toggleSidebar } = useAdminShell();
  const copy = adminTopbarCopy;
  const initials =
    admin?.email
      ?.split("@")[0]
      .split(/[.\-_ ]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join("") ?? "AD";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/92 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          aria-label={copy.toggleSidebar}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          onClick={toggleSidebar}
        >
          <PanelLeft className="size-4" />
        </button>

        <div className="hidden min-w-0 lg:block">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {copy.environment}
          </p>
          <p className="mt-1 truncate text-sm font-medium text-slate-700">
            {copy.workspace}
          </p>
        </div>

        <div className="relative ms-auto w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-11 rounded-2xl border-slate-200 bg-slate-50/80 pl-10 shadow-none focus-visible:bg-white"
            placeholder={copy.searchPlaceholder}
          />
        </div>

        <button
          type="button"
          className="hidden size-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-100 hover:bg-red-50 hover:text-brand-red sm:inline-flex"
          aria-label={copy.notifications}
        >
          <Bell className="size-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-red-100 hover:bg-red-50/50"
            >
              <Avatar className="size-9 ring-1 ring-red-100">
                <AvatarFallback className="bg-red-50 text-sm font-semibold text-brand-red">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="max-w-[170px] truncate text-sm font-medium text-slate-950">
                  {admin?.email ?? "admin@cts.local"}
                </p>
                <div className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>
                    {admin ? copy.roleLabel[admin.role] : copy.roleLabel.operator}
                  </span>
                </div>
              </div>
              <ChevronDown className="size-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            <DropdownMenuLabel className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-slate-950">
                {admin?.email ?? "admin@cts.local"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {admin ? copy.roleLabel[admin.role] : copy.roleLabel.operator}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <AdminLogoutDialog>
              <DropdownMenuItem className="rounded-xl px-3 py-2 text-red-700 focus:bg-red-50 focus:text-red-700">
                <LogOut className="size-4" />
                {copy.signOut}
              </DropdownMenuItem>
            </AdminLogoutDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
