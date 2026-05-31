import { useState } from "react";

import { LoaderCircle } from "lucide-react";

import { StatusBadge, type AdminStatusBadgeValue } from "@/components/admin/shared/StatusBadge";
import { Button } from "@/components/ui/button";

function getAllowedTransitions(
  currentStatus: AdminStatusBadgeValue,
  role: "super_admin" | "manager" | "operator",
) {
  if (role === "operator") {
    if (currentStatus === "pending") {
      return ["confirmed", "rejected"] as const;
    }

    return [] as const;
  }

  if (currentStatus === "pending") {
    return ["confirmed", "rejected", "cancelled"] as const;
  }

  if (currentStatus === "confirmed") {
    return ["completed", "cancelled"] as const;
  }

  return [] as const;
}

export function AppointmentStatusActions({
  locale,
  role,
  currentStatus,
  copy,
  onSubmit,
}: {
  locale: "fr" | "ar";
  role: "super_admin" | "manager" | "operator";
  currentStatus: AdminStatusBadgeValue;
  copy: {
    currentStatus: string;
    statusLabels: Record<AdminStatusBadgeValue, string>;
    mutateTitle: string;
  };
  onSubmit: (status: AdminStatusBadgeValue) => Promise<void>;
}) {
  const [pendingStatus, setPendingStatus] = useState<AdminStatusBadgeValue | null>(null);
  const transitions = getAllowedTransitions(currentStatus, role);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {copy.currentStatus}
        </p>
        <div className="mt-3">
          <StatusBadge status={currentStatus} locale={locale} />
        </div>
      </div>

      {transitions.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-900">{copy.mutateTitle}</p>
          <div className="flex flex-wrap gap-2">
            {transitions.map((status) => (
              <Button
                key={status}
                type="button"
                variant="outline"
                disabled={pendingStatus !== null}
                className="rounded-xl border-slate-200"
                onClick={async () => {
                  try {
                    setPendingStatus(status);
                    await onSubmit(status);
                  } finally {
                    setPendingStatus(null);
                  }
                }}
              >
                {pendingStatus === status ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : null}
                {copy.statusLabels[status]}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
