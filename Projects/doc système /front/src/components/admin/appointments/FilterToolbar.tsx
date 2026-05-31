import { Search } from "lucide-react";

import type { AdminStatusBadgeValue } from "@/components/admin/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AppointmentFiltersValue = {
  search: string;
  status: AdminStatusBadgeValue | "all";
  campaignCode: string;
};

export function AppointmentFilterToolbar({
  copy,
  value,
  campaigns,
  onChange,
}: {
  copy: {
    searchPlaceholder: string;
    statusPlaceholder: string;
    campaignPlaceholder: string;
    allStatuses: string;
    allCampaigns: string;
    statuses: Record<AdminStatusBadgeValue, string>;
  };
  value: AppointmentFiltersValue;
  campaigns: Array<{ code: string; label: string }>;
  onChange: (next: AppointmentFiltersValue) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1.5fr_0.8fr_0.8fr]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={value.search}
          onChange={(event) =>
            onChange({
              ...value,
              search: event.target.value,
            })
          }
          placeholder={copy.searchPlaceholder}
          className="h-11 rounded-2xl border-slate-200 bg-slate-50/80 pl-10"
        />
      </div>

      <Select
        value={value.status}
        onValueChange={(nextValue) =>
          onChange({
            ...value,
            status: nextValue as AppointmentFiltersValue["status"],
          })
        }
      >
        <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50/80">
          <SelectValue placeholder={copy.statusPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{copy.allStatuses}</SelectItem>
          <SelectItem value="pending">{copy.statuses.pending}</SelectItem>
          <SelectItem value="confirmed">{copy.statuses.confirmed}</SelectItem>
          <SelectItem value="rejected">{copy.statuses.rejected}</SelectItem>
          <SelectItem value="completed">{copy.statuses.completed}</SelectItem>
          <SelectItem value="cancelled">{copy.statuses.cancelled}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={value.campaignCode || "all"}
        onValueChange={(nextValue) =>
          onChange({
            ...value,
            campaignCode: nextValue === "all" ? "" : nextValue,
          })
        }
      >
        <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50/80">
          <SelectValue placeholder={copy.campaignPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{copy.allCampaigns}</SelectItem>
          {campaigns.map((campaign) => (
            <SelectItem key={campaign.code} value={campaign.code}>
              {campaign.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
