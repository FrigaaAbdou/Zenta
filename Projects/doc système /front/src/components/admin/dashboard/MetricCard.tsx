import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  detail,
  accent,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <CardDescription>{label}</CardDescription>
          {icon ? (
            <div className="flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
              {icon}
            </div>
          ) : null}
        </div>
        <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 pt-0">
        <p className="text-sm text-slate-500">{detail}</p>
        {accent}
      </CardContent>
    </Card>
  );
}
