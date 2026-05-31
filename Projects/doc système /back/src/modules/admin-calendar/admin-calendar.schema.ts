import { z } from "zod";

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/, "Invalid month format. Expected YYYY-MM.");
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD.");
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format. Expected HH:MM.");

export const adminCalendarMonthQuerySchema = z.object({
  month: monthSchema,
});

export const adminCalendarDayQuerySchema = z.object({
  date: dateSchema,
});

export const adminCalendarSlotCreateSchema = z.object({
  date: dateSchema,
  time: timeSchema,
  capacity: z.number().int().min(0).max(99),
  status: z.enum(["open", "full", "closed", "blocked"]),
  reason: z.string().trim().max(240).optional(),
  campaignCode: z.string().trim().max(64).optional(),
});

export const adminCalendarSlotUpdateSchema = adminCalendarSlotCreateSchema
  .omit({ date: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

export const adminCalendarDayActionSchema = z.object({
  date: dateSchema,
  reason: z.string().trim().max(240).optional(),
  closureType: z.enum(["generic", "day_off", "holiday"]).optional(),
});

export const adminCalendarTemplatesReplaceSchema = z.object({
  items: z.array(
    z.object({
      daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
      startTime: timeSchema,
      endTime: timeSchema,
      intervalMinutes: z.union([
        z.literal(15),
        z.literal(30),
        z.literal(45),
        z.literal(60),
      ]),
      capacity: z.number().int().min(1).max(99),
      isActive: z.boolean().default(true),
      donationTypes: z
        .array(z.enum(["whole_blood", "plasma", "platelets"]))
        .optional(),
    }).refine((value) => value.endTime > value.startTime, {
      message: "endTime must be strictly after startTime.",
      path: ["endTime"],
    }),
  ),
});
