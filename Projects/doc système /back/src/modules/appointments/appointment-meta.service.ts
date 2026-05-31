import type { SupportedLocale } from "../../shared/constants/locales.js";
import {
  type AppointmentSlotStatus,
  BLOOD_GROUPS,
  COMMUNES_BY_WILAYA,
  DONATION_TYPES_BY_LOCALE,
  ELIGIBILITY_CHECKLIST_BY_LOCALE,
  GENDERS_BY_LOCALE,
  WILAYAS_BY_LOCALE,
} from "./appointment.constants.js";
import { getResolvedSlotDefinitionsForDate } from "./appointment-slot.service.js";
import { getAppointmentSlotOccupancy } from "./appointment.service.js";

export function getAppointmentFormMeta(locale: SupportedLocale) {
  return {
    locales: ["fr", "ar"],
    genders: GENDERS_BY_LOCALE[locale],
    bloodGroups: [...BLOOD_GROUPS],
    donationTypes: DONATION_TYPES_BY_LOCALE[locale],
    wilayas: WILAYAS_BY_LOCALE[locale],
    communesByWilaya: COMMUNES_BY_WILAYA,
    eligibilityChecklistTemplate: ELIGIBILITY_CHECKLIST_BY_LOCALE[locale],
  };
}

export async function getAppointmentSlots(date: string) {
  const occupancyByTime = await getAppointmentSlotOccupancy(date);
  const slotDefinitions = await getResolvedSlotDefinitionsForDate(date);

  return {
    date,
    slots: slotDefinitions.map((slot) => {
      const reservedCount = occupancyByTime[slot.value] ?? 0;
      const remainingCapacity =
        slot.status === "open"
          ? Math.max(slot.capacity - reservedCount, 0)
          : 0;
      const status: AppointmentSlotStatus =
        slot.status === "open" && remainingCapacity === 0
          ? "full"
          : slot.status;

      return {
        value: slot.value,
        label: slot.label,
        isAvailable: status === "open",
        capacity: slot.capacity,
        reservedCount,
        remainingCapacity,
        status,
      };
    }),
  };
}
