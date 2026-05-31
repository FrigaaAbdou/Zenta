import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AdminStatusBadgeLocale = "fr" | "ar";
export type AdminStatusBadgeValue =
  | "pending"
  | "confirmed"
  | "rejected"
  | "completed"
  | "cancelled";

const statusLabels: Record<AdminStatusBadgeLocale, Record<AdminStatusBadgeValue, string>> = {
  fr: {
    pending: "En attente",
    confirmed: "Confirmé",
    rejected: "Rejeté",
    completed: "Terminé",
    cancelled: "Annulé",
  },
  ar: {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    rejected: "مرفوض",
    completed: "مكتمل",
    cancelled: "ملغى",
  },
};

const statusClasses: Record<AdminStatusBadgeValue, string> = {
  pending: "bg-amber-50 text-amber-700 hover:bg-amber-50",
  confirmed: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  rejected: "bg-rose-50 text-rose-700 hover:bg-rose-50",
  completed: "bg-sky-50 text-sky-700 hover:bg-sky-50",
  cancelled: "bg-slate-100 text-slate-700 hover:bg-slate-100",
};

export function getAdminStatusLabel(
  status: AdminStatusBadgeValue,
  locale: AdminStatusBadgeLocale,
) {
  return statusLabels[locale][status];
}

export function StatusBadge({
  status,
  locale,
  className,
}: {
  status: AdminStatusBadgeValue;
  locale: AdminStatusBadgeLocale;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full border border-transparent shadow-none",
        statusClasses[status],
        className,
      )}
    >
      {getAdminStatusLabel(status, locale)}
    </Badge>
  );
}
