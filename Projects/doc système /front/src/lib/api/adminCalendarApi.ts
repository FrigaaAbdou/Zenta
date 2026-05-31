import { apiRequest } from "@/lib/api/client";

function createAdminHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export type AdminCalendarDayStatus =
  | "available"
  | "full"
  | "closed"
  | "empty";

export type AdminCalendarMonthDay = {
  date: string;
  appointmentCount: number;
  openSlots: number;
  fullSlots: number;
  blockedSlots: number;
  closedSlots: number;
  status: AdminCalendarDayStatus;
};

export type AdminCalendarDaySlot = {
  value: string;
  label: string;
  capacity: number;
  reservedCount: number;
  remainingCapacity: number;
  status: "open" | "full" | "closed" | "blocked";
  source: "template" | "override";
  overrideId: string | null;
  reason: string | null;
};

export type AdminCalendarDayClosureType = "generic" | "day_off" | "holiday";

export type AdminCalendarTemplateItem = {
  id: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  intervalMinutes: 15 | 30 | 45 | 60;
  capacity: number;
  isActive: boolean;
  donationTypes: Array<"whole_blood" | "plasma" | "platelets">;
};

export type AdminCalendarSlotPayload = {
  date: string;
  time: string;
  capacity: number;
  status: "open" | "full" | "closed" | "blocked";
  reason?: string;
  campaignCode?: string;
};

export type AdminCalendarSlotUpdatePayload = Partial<
  Omit<AdminCalendarSlotPayload, "date">
>;

type AdminCalendarMonthResponse = {
  data: {
    month: string;
    days: AdminCalendarMonthDay[];
  };
};

type AdminCalendarDayResponse = {
  data: {
    date: string;
    slots: AdminCalendarDaySlot[];
    summary: {
      totalSlots: number;
      openSlots: number;
      fullSlots: number;
      blockedSlots: number;
      closedSlots: number;
      appointmentCount: number;
      dayClosureType: AdminCalendarDayClosureType | null;
    };
  };
};

type AdminCalendarTemplatesResponse = {
  data: {
    items: AdminCalendarTemplateItem[];
  };
};

type AdminCalendarSlotMutationResponse = {
  data: {
    item: {
      id: string;
      date: string;
      time: string;
      capacity: number;
      status: "open" | "full" | "closed" | "blocked";
      reason: string;
      campaignCode: string | null;
    };
  };
};

type AdminCalendarDayActionResponse = {
  data: {
    date: string;
    status: "open" | "closed";
    affectedSlots?: number;
    removedOverrides?: number;
    closureType?: AdminCalendarDayClosureType;
  };
};

export async function getAdminCalendarMonth(token: string, month: string) {
  const payload = await apiRequest<AdminCalendarMonthResponse>(
    `/api/admin/calendar/month?month=${month}`,
    {
      headers: createAdminHeaders(token),
    },
  );

  return payload.data;
}

export async function getAdminCalendarDay(token: string, date: string) {
  const payload = await apiRequest<AdminCalendarDayResponse>(
    `/api/admin/calendar/day?date=${date}`,
    {
      headers: createAdminHeaders(token),
    },
  );

  return payload.data;
}

export async function listAdminCalendarTemplates(token: string) {
  const payload = await apiRequest<AdminCalendarTemplatesResponse>(
    "/api/admin/calendar/templates",
    {
      headers: createAdminHeaders(token),
    },
  );

  return payload.data.items;
}

export async function replaceAdminCalendarTemplates(
  token: string,
  items: Array<{
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    intervalMinutes: 15 | 30 | 45 | 60;
    capacity: number;
    isActive: boolean;
    donationTypes?: Array<"whole_blood" | "plasma" | "platelets">;
  }>,
) {
  const payload = await apiRequest<AdminCalendarTemplatesResponse>(
    "/api/admin/calendar/templates",
    {
      method: "PUT",
      headers: createAdminHeaders(token),
      body: JSON.stringify({ items }),
    },
  );

  return payload.data.items;
}

export async function createAdminCalendarSlot(
  token: string,
  payload: AdminCalendarSlotPayload,
) {
  const response = await apiRequest<AdminCalendarSlotMutationResponse>(
    "/api/admin/calendar/slots",
    {
      method: "POST",
      headers: createAdminHeaders(token),
      body: JSON.stringify(payload),
    },
  );

  return response.data.item;
}

export async function updateAdminCalendarSlot(
  token: string,
  id: string,
  payload: AdminCalendarSlotUpdatePayload,
) {
  const response = await apiRequest<AdminCalendarSlotMutationResponse>(
    `/api/admin/calendar/slots/${id}`,
    {
      method: "PATCH",
      headers: createAdminHeaders(token),
      body: JSON.stringify(payload),
    },
  );

  return response.data.item;
}

export async function closeAdminCalendarDay(
  token: string,
  payload: { date: string; reason?: string; closureType?: AdminCalendarDayClosureType },
) {
  const response = await apiRequest<AdminCalendarDayActionResponse>(
    "/api/admin/calendar/day/close",
    {
      method: "POST",
      headers: createAdminHeaders(token),
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function reopenAdminCalendarDay(
  token: string,
  payload: { date: string },
) {
  const response = await apiRequest<AdminCalendarDayActionResponse>(
    "/api/admin/calendar/day/reopen",
    {
      method: "POST",
      headers: createAdminHeaders(token),
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}
