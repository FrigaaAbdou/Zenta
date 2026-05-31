import { CalendarRange, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

type FeaturedCampaign = {
  code: string;
  title: string;
  badgeLabel: string;
  theme: string;
  startDate: string | null;
  endDate: string | null;
};

export function FeaturedCampaignCard({
  title,
  description,
  emptyLabel,
  manageLabel,
  item,
}: {
  title: string;
  description: string;
  emptyLabel: string;
  manageLabel: string;
  item: FeaturedCampaign | null;
}) {
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {item ? (
          <>
            <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
                    {item.code}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {item.title}
                  </p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-red text-white shadow-sm">
                  <Megaphone className="size-5" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {item.badgeLabel ? (
                  <Badge className="rounded-full bg-red-100 text-red-700 shadow-none hover:bg-red-100">
                    {item.badgeLabel}
                  </Badge>
                ) : null}
                <Badge
                  variant="secondary"
                  className="rounded-full bg-slate-100 text-slate-700 shadow-none hover:bg-slate-100"
                >
                  {item.theme}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CalendarRange className="size-4 text-brand-red" />
              <span>
                {item.startDate ?? "Non définie"} - {item.endDate ?? "Ouverte"}
              </span>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            {emptyLabel}
          </div>
        )}

        <Button asChild variant="outline" className="w-full rounded-2xl border-slate-200">
          <Link to="/admin/campaigns">{manageLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
