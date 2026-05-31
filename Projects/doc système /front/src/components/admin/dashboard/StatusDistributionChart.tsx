import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminStatusLabel, type AdminStatusBadgeValue } from "../shared/StatusBadge";

const barClasses: Record<AdminStatusBadgeValue, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-emerald-500",
  rejected: "bg-rose-500",
  completed: "bg-sky-500",
  cancelled: "bg-slate-400",
};

export function StatusDistributionChart({
  title,
  description,
  locale,
  items,
}: {
  title: string;
  description: string;
  locale: "fr" | "ar";
  items: Array<{ status: AdminStatusBadgeValue; count: number }>;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const width = `${Math.max((item.count / max) * 100, item.count > 0 ? 8 : 0)}%`;

          return (
            <div key={item.status} className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">
                  {getAdminStatusLabel(item.status, locale)}
                </span>
                <span className="text-slate-500">{item.count}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${barClasses[item.status]}`}
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
