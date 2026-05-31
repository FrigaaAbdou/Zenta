import { apiRequest } from "@/lib/api/client";
import type { AdminStatusBadgeValue } from "@/components/admin/shared/StatusBadge";

export type AdminAppointmentsFilters = {
  page?: number;
  pageSize?: number;
  status?: AdminStatusBadgeValue | "all";
  dateFrom?: string;
  dateTo?: string;
  campaignCode?: string;
  search?: string;
};

export type AdminAppointmentListItem = {
  id: string;
  donor: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    bloodGroup: string;
  };
  campaignCode: string | null;
  appointmentDate: string;
  appointmentTime: string;
  donationType: string;
  status: AdminStatusBadgeValue;
  createdAt: string;
};

export type AdminAppointmentDetail = AdminAppointmentListItem & {
  donorFull: {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    phone: string;
    email: string | null;
    wilayaCode: string;
    commune: string;
    bloodGroup: string;
  };
  isExistingDonor: boolean;
  lastDonationDate: string | null;
  eligibilityChecklist: {
    ageConfirmed: boolean;
    weightConfirmed: boolean;
    healthyConfirmed: boolean;
    noContraIndicationConfirmed: boolean;
  };
  remarks: string;
  locale: "fr" | "ar";
  updatedAt: string;
};

type AdminAppointmentsListResponse = {
  data: {
    items: AdminAppointmentListItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
};

type AdminAppointmentDetailResponse = {
  data: AdminAppointmentDetail;
};

type AdminAppointmentStatusResponse = {
  data: AdminAppointmentDetail;
};

function createAdminHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function toSearchParams(filters: AdminAppointmentsFilters) {
  const params = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(filters)) {
    if (
      rawValue === undefined ||
      rawValue === null ||
      rawValue === "" ||
      rawValue === "all"
    ) {
      continue;
    }

    params.set(key, String(rawValue));
  }

  return params.toString();
}

export async function listAdminAppointments(
  token: string,
  filters: AdminAppointmentsFilters = {},
) {
  const params = toSearchParams(filters);

  const payload = await apiRequest<AdminAppointmentsListResponse>(
    `/api/admin/appointments${params ? `?${params}` : ""}`,
    {
      headers: createAdminHeaders(token),
    },
  );

  return payload.data;
}

export async function getAdminAppointment(token: string, id: string) {
  const payload = await apiRequest<AdminAppointmentDetailResponse>(
    `/api/admin/appointments/${id}`,
    {
      headers: createAdminHeaders(token),
    },
  );

  return payload.data;
}

export async function updateAdminAppointmentStatus(
  token: string,
  id: string,
  status: AdminStatusBadgeValue,
) {
  const payload = await apiRequest<AdminAppointmentStatusResponse>(
    `/api/admin/appointments/${id}/status`,
    {
      method: "PATCH",
      headers: createAdminHeaders(token),
      body: JSON.stringify({ status }),
    },
  );

  return payload.data;
}
