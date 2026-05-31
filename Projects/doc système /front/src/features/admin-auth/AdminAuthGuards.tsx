import { Navigate, Outlet, useLocation } from "react-router-dom";

import { ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useAdminAuth } from "./AdminAuthProvider";

function AdminAuthLoadingState() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f7f8fb] px-4">
      <Card className="w-full max-w-sm border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-red text-white shadow-sm">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-950">
              Vérification de la session admin
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Chargement de l’espace sécurisé.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RequireAdminAuth() {
  const { status } = useAdminAuth();
  const location = useLocation();

  if (status === "loading") {
    return <AdminAuthLoadingState />;
  }

  if (status !== "authenticated") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export function RequireAdminGuest() {
  const { status } = useAdminAuth();

  if (status === "loading") {
    return <AdminAuthLoadingState />;
  }

  if (status === "authenticated") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
