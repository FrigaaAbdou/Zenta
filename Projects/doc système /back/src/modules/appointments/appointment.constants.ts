import type { SupportedLocale } from "../../shared/constants/locales.js";

export const APPOINTMENT_TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
] as const;

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const GENDERS_BY_LOCALE: Record<
  SupportedLocale,
  Array<{ value: "male" | "female"; label: string }>
> = {
  fr: [
    { value: "male", label: "Homme" },
    { value: "female", label: "Femme" },
  ],
  ar: [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" },
  ],
};

export const DONATION_TYPES_BY_LOCALE: Record<
  SupportedLocale,
  Array<{ value: "whole_blood" | "plasma" | "platelets"; label: string }>
> = {
  fr: [
    { value: "whole_blood", label: "Don de sang total" },
    { value: "plasma", label: "Don de plasma" },
    { value: "platelets", label: "Don de plaquettes" },
  ],
  ar: [
    { value: "whole_blood", label: "التبرع بالدم الكامل" },
    { value: "plasma", label: "التبرع بالبلازما" },
    { value: "platelets", label: "التبرع بالصفائح" },
  ],
};

export const WILAYAS_BY_LOCALE: Record<
  SupportedLocale,
  Array<{ code: string; label: string }>
> = {
  fr: [
    { code: "16", label: "Alger" },
    { code: "09", label: "Blida" },
    { code: "42", label: "Tipaza" },
    { code: "15", label: "Tizi Ouzou" },
  ],
  ar: [
    { code: "16", label: "الجزائر" },
    { code: "09", label: "البليدة" },
    { code: "42", label: "تيبازة" },
    { code: "15", label: "تيزي وزو" },
  ],
};

export const COMMUNES_BY_WILAYA = {
  "16": ["Sidi M'Hamed", "Bab El Oued", "El Madania"],
  "09": ["Blida", "Bouarfa", "Ouled Yaich"],
  "42": ["Tipaza", "Cherchell", "Kolea"],
  "15": ["Tizi Ouzou", "Draa Ben Khedda", "Azazga"],
} as const;

export const ELIGIBILITY_CHECKLIST_BY_LOCALE: Record<
  SupportedLocale,
  Array<{ key: "ageConfirmed" | "weightConfirmed" | "healthyConfirmed" | "noContraIndicationConfirmed"; label: string }>
> = {
  fr: [
    { key: "ageConfirmed", label: "Âge entre 18 et 65 ans" },
    { key: "weightConfirmed", label: "Poids minimum 50 kg" },
    { key: "healthyConfirmed", label: "Être en bonne santé" },
    {
      key: "noContraIndicationConfirmed",
      label: "Aucune contre-indication au don",
    },
  ],
  ar: [
    { key: "ageConfirmed", label: "العمر بين 18 و65 سنة" },
    { key: "weightConfirmed", label: "الوزن لا يقل عن 50 كلغ" },
    { key: "healthyConfirmed", label: "التمتع بصحة جيدة" },
    {
      key: "noContraIndicationConfirmed",
      label: "عدم وجود مانع للتبرع",
    },
  ],
};
