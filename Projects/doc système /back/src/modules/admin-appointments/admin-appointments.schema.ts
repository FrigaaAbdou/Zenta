import { z } from "zod";

import { ADMIN_APPOINTMENT_STATUSES } from "../appointments/appointment.constants.js";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const adminAppointmentsListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(ADMIN_APPOINTMENT_STATUSES).optional(),
  dateFrom: z.string().regex(isoDateRegex, "dateFrom must be YYYY-MM-DD").optional(),
  dateTo: z.string().regex(isoDateRegex, "dateTo must be YYYY-MM-DD").optional(),
  campaignCode: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});

export const adminAppointmentStatusUpdateSchema = z.object({
  status: z.enum(ADMIN_APPOINTMENT_STATUSES),
});
