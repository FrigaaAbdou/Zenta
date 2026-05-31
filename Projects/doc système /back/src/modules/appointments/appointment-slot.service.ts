import mongoose from "mongoose";

import { AppError } from "../../lib/errors/app-error.js";
import {
  APPOINTMENT_SLOT_TEMPLATES,
  type AppointmentSlotStatus,
} from "./appointment.constants.js";
import { AppointmentSlotOverrideModel } from "./appointment-slot-override.model.js";
import { AppointmentSlotTemplateModel } from "./appointment-slot-template.model.js";
import { getAppointmentSlotOccupancy } from "./appointment.service.js";

type SlotTemplateLike = {
  daysOfWeek?: number[];
  startTime: string;
  endTime: string;
  intervalMinutes: 15 | 30 | 45 | 60;
  capacity: number;
  isActive?: boolean;
};

type SlotOverrideLike = {
  date?: string;
  time: string;
  capacity: number;
  status: AppointmentSlotStatus;
  reason?: string;
  closureType?: "generic" | "day_off" | "holiday";
};

export type ResolvedSlotDefinition = {
  value: string;
  label: string;
  capacity: number;
  status: AppointmentSlotStatus;
  source: "template" | "override";
  overrideId?: string;
  reason?: string;
  closureType?: "generic" | "day_off" | "holiday";
};

export function getWeekdayFromDate(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function generateQuarterHourTimeRange(
  startTime: string,
  endTime: string,
  intervalMinutes: 15 | 30 | 45 | 60,
) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const times: string[] = [];

  for (let cursor = start; cursor < end; cursor += intervalMinutes) {
    times.push(minutesToTime(cursor));
  }

  return times;
}

export function expandRecurringSlotTemplate(template: SlotTemplateLike): ResolvedSlotDefinition[] {
  if (template.isActive === false) {
    return [];
  }

  return generateQuarterHourTimeRange(
    template.startTime,
    template.endTime,
    template.intervalMinutes,
  ).map((time) => ({
    value: time,
    label: time,
    capacity: template.capacity,
    status: "open" as const,
    source: "template" as const,
  }));
}

export function mergeSlotTemplatesAndOverrides(
  templates: ResolvedSlotDefinition[],
  overrides: SlotOverrideLike[],
): ResolvedSlotDefinition[] {
  const merged = new Map<string, ResolvedSlotDefinition>();

  for (const template of templates) {
    merged.set(template.value, template);
  }

  for (const override of overrides) {
    merged.set(override.time, {
      value: override.time,
      label: override.time,
      capacity: override.capacity,
      status: override.status,
      source: "override",
      overrideId: "_id" in override && override._id ? String(override._id) : undefined,
      reason: override.reason,
      closureType: override.closureType,
    });
  }

  return [...merged.values()].sort((left, right) =>
    left.value.localeCompare(right.value),
  );
}

function getFallbackTemplatesForWeekday(_weekday: number): ResolvedSlotDefinition[] {
  return APPOINTMENT_SLOT_TEMPLATES.map((slot) => ({
    value: slot.value,
    label: slot.value,
    capacity: slot.capacity,
    status: "open",
    source: "template",
  }));
}

export async function getResolvedSlotDefinitionsForDate(date: string) {
  const weekday = getWeekdayFromDate(date);

  const [templates, overrides] = await Promise.all([
    AppointmentSlotTemplateModel.find({
      daysOfWeek: weekday,
      isActive: true,
    })
      .select("daysOfWeek startTime endTime intervalMinutes capacity isActive")
      .lean()
      .exec(),
    AppointmentSlotOverrideModel.find({
      date,
    })
      .select("date time capacity status reason closureType")
      .lean()
      .exec(),
  ]);

  const templateSlots =
    templates.length > 0
      ? templates.flatMap((template) => expandRecurringSlotTemplate(template))
      : getFallbackTemplatesForWeekday(weekday);

  return mergeSlotTemplatesAndOverrides(templateSlots, overrides);
}

function getMonthDateRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthNumber - 1, 1));
  const end = new Date(Date.UTC(year, monthNumber, 0));

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function listDatesInMonth(month: string) {
  const { start, end } = getMonthDateRange(month);
  const current = new Date(`${start}T12:00:00Z`);
  const endDate = new Date(`${end}T12:00:00Z`);
  const dates: string[] = [];

  while (current <= endDate) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

export async function getAdminCalendarDay(date: string) {
  const [slotDefinitions, occupancyByTime] = await Promise.all([
    getResolvedSlotDefinitionsForDate(date),
    getAppointmentSlotOccupancy(date),
  ]);

  const slots = slotDefinitions.map((slot) => {
    const reservedCount = occupancyByTime[slot.value] ?? 0;
    const remainingCapacity =
      slot.status === "open" ? Math.max(slot.capacity - reservedCount, 0) : 0;
    const status: AppointmentSlotStatus =
      slot.status === "open" && remainingCapacity === 0 ? "full" : slot.status;

    return {
      value: slot.value,
      label: slot.label,
      capacity: slot.capacity,
      reservedCount,
      remainingCapacity,
      status,
      source: slot.source,
      overrideId: slot.overrideId ?? null,
      reason: slot.reason ?? null,
    };
  });

  const dayClosureType =
    slots.length > 0 && slots.every((slot) => slot.status === "closed")
      ? (() => {
          const closedOverrides = slotDefinitions.filter(
            (slot) => slot.source === "override" && slot.status === "closed",
          ) as Array<ResolvedSlotDefinition & { closureType?: string }>;

          const closureTypes = closedOverrides
            .map((slot) => slot.closureType)
            .filter(Boolean);

          if (closureTypes.includes("holiday")) {
            return "holiday" as const;
          }

          if (closureTypes.includes("day_off")) {
            return "day_off" as const;
          }

          return "generic" as const;
        })()
      : null;

  return {
    date,
    slots,
    summary: {
      totalSlots: slots.length,
      openSlots: slots.filter((slot: (typeof slots)[number]) => slot.status === "open").length,
      fullSlots: slots.filter((slot: (typeof slots)[number]) => slot.status === "full").length,
      blockedSlots: slots.filter((slot: (typeof slots)[number]) => slot.status === "blocked").length,
      closedSlots: slots.filter((slot: (typeof slots)[number]) => slot.status === "closed").length,
      appointmentCount: Object.values(occupancyByTime).reduce<number>(
        (sum, value) => sum + value,
        0,
      ),
      dayClosureType,
    },
  };
}

export async function getAdminCalendarMonth(month: string) {
  const dates = listDatesInMonth(month);
  const days = await Promise.all(
    dates.map(async (date) => {
      const day = await getAdminCalendarDay(date);
      const status =
        day.summary.closedSlots === day.summary.totalSlots && day.summary.totalSlots > 0
          ? "closed"
          : day.summary.openSlots > 0
            ? "available"
            : day.summary.fullSlots > 0
              ? "full"
              : "empty";

      return {
        date,
        appointmentCount: day.summary.appointmentCount,
        openSlots: day.summary.openSlots,
        fullSlots: day.summary.fullSlots,
        blockedSlots: day.summary.blockedSlots,
        closedSlots: day.summary.closedSlots,
        status,
      };
    }),
  );

  return {
    month,
    days,
  };
}

function mapOverrideDocument(document: any) {
  return {
    id: String(document._id),
    date: document.date,
    time: document.time,
    capacity: document.capacity,
    status: document.status,
    reason: document.reason ?? "",
    closureType: document.closureType ?? "generic",
    campaignCode: document.campaignCode ?? null,
  };
}

function mapTemplateDocument(document: any) {
  return {
    id: String(document._id),
    daysOfWeek: document.daysOfWeek ?? [],
    startTime: document.startTime,
    endTime: document.endTime,
    intervalMinutes: document.intervalMinutes,
    capacity: document.capacity,
    isActive: document.isActive,
    donationTypes: document.donationTypes ?? [],
  };
}

function createNotFoundError(resource: string) {
  return new AppError({
    statusCode: 404,
    code: "NOT_FOUND",
    message: `${resource} not found`,
  });
}

function createDuplicateError(resource: string) {
  return new AppError({
    statusCode: 409,
    code: "CONFLICT",
    message: `${resource} already exists`,
  });
}

export async function createAdminCalendarSlotOverride(input: {
  date: string;
  time: string;
  capacity: number;
  status: AppointmentSlotStatus;
  reason?: string;
  campaignCode?: string;
}) {
  try {
    const item = await AppointmentSlotOverrideModel.create({
      ...input,
      reason: input.reason ?? "",
      campaignCode: input.campaignCode ?? null,
    });

    return mapOverrideDocument(item);
  } catch (error: any) {
    if (error?.code === 11000) {
      throw createDuplicateError("Calendar slot override");
    }

    throw error;
  }
}

export async function updateAdminCalendarSlotOverride(
  overrideId: string,
  input: {
    time?: string;
    capacity?: number;
    status?: AppointmentSlotStatus;
    reason?: string;
    campaignCode?: string;
  },
) {
  if (!mongoose.Types.ObjectId.isValid(overrideId)) {
    throw createNotFoundError("Calendar slot override");
  }

  const item = await AppointmentSlotOverrideModel.findByIdAndUpdate(
    overrideId,
    {
      ...input,
      ...(input.campaignCode !== undefined
        ? { campaignCode: input.campaignCode || null }
        : {}),
    },
    {
      new: true,
      runValidators: true,
    },
  ).exec();

  if (!item) {
    throw createNotFoundError("Calendar slot override");
  }

  return mapOverrideDocument(item);
}

export async function closeAdminCalendarDay(input: {
  date: string;
  reason?: string;
  closureType?: "generic" | "day_off" | "holiday";
}) {
  const slotDefinitions = await getResolvedSlotDefinitionsForDate(input.date);
  const closureType = input.closureType ?? "generic";

  await Promise.all(
    slotDefinitions.map((slot) =>
      AppointmentSlotOverrideModel.updateOne(
        { date: input.date, time: slot.value },
        {
          $set: {
            capacity: 0,
            status: "closed",
            reason: input.reason ?? "",
            closureType,
          },
        },
        { upsert: true },
      ).exec(),
    ),
  );

  return {
    date: input.date,
    affectedSlots: slotDefinitions.length,
    status: "closed" as const,
    closureType,
  };
}

export async function reopenAdminCalendarDay(date: string) {
  const result = await AppointmentSlotOverrideModel.deleteMany({ date }).exec();

  return {
    date,
    removedOverrides: result.deletedCount ?? 0,
    status: "open" as const,
  };
}

export async function listAdminCalendarTemplates() {
  const items = await AppointmentSlotTemplateModel.find()
    .sort({ weekday: 1, time: 1 })
    .lean()
    .exec();

  return {
    items: items.map(mapTemplateDocument),
  };
}

export async function replaceAdminCalendarTemplates(
  items: Array<{
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    intervalMinutes: 15 | 30 | 45 | 60;
    capacity: number;
    isActive: boolean;
    donationTypes?: string[];
  }>,
) {
  await AppointmentSlotTemplateModel.deleteMany({}).exec();
  const inserted = await AppointmentSlotTemplateModel.insertMany(
    items.map((item) => ({
      ...item,
      donationTypes: item.donationTypes ?? [],
    })),
  );

  return {
    items: inserted
      .map(mapTemplateDocument)
      .sort((left, right) =>
        left.startTime === right.startTime
          ? left.endTime.localeCompare(right.endTime)
          : left.startTime.localeCompare(right.startTime),
      ),
  };
}
