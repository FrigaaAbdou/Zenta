import type { SupportedLocale } from "../../shared/constants/locales.js";
import {
  APPOINTMENT_TIME_SLOTS,
  BLOOD_GROUPS,
  COMMUNES_BY_WILAYA,
  DONATION_TYPES_BY_LOCALE,
  ELIGIBILITY_CHECKLIST_BY_LOCALE,
  GENDERS_BY_LOCALE,
  WILAYAS_BY_LOCALE,
} from "./appointment.constants.js";

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

export function getAppointmentSlots(date: string) {
  return {
    date,
    slots: APPOINTMENT_TIME_SLOTS.map((value) => ({
      value,
      label: value,
      isAvailable: true,
    })),
  };
}
