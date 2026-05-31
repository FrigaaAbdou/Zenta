import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, type AdminStatusBadgeValue } from "../shared/StatusBadge";

type AppointmentRow = {
  id: string;
  donor: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  campaignCode: string | null;
  appointmentDate: string;
  appointmentTime: string;
  status: AdminStatusBadgeValue;
};

export function RecentAppointmentsTable({
  title,
  description,
  locale,
  viewAllLabel,
  items,
}: {
  title: string;
  description: string;
  locale: "fr" | "ar";
  viewAllLabel: string;
  items: AppointmentRow[];
}) {
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
        <Button asChild variant="outline" className="rounded-2xl border-slate-200">
          <Link to="/admin/appointments">
            {viewAllLabel}
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donneur</TableHead>
              <TableHead>Créneau</TableHead>
              <TableHead>Campagne</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900">
                      {item.donor.firstName} {item.donor.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{item.donor.phone}</p>
                  </div>
                </TableCell>
                <TableCell className="text-slate-700">
                  {item.appointmentDate} - {item.appointmentTime}
                </TableCell>
                <TableCell className="text-slate-700">
                  {item.campaignCode ?? "Sans campagne"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} locale={locale} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
