export const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const donationTypes = [
  { value: "whole_blood", label: "Don de sang total" },
  { value: "plasma", label: "Don de plasma" },
  { value: "platelets", label: "Don de plaquettes" },
] as const;

export function getFallbackAppointmentMeta(
  locale: "fr" | "ar",
): AppointmentFormMeta {
  return {
    locales: ["fr", "ar"],
    genders:
      locale === "ar"
        ? [
            { value: "male", label: "ذكر" },
            { value: "female", label: "أنثى" },
          ]
        : [
            { value: "male", label: "Homme" },
            { value: "female", label: "Femme" },
          ],
    bloodGroups: [...bloodGroups],
    donationTypes:
      locale === "ar"
        ? [
            { value: "whole_blood", label: "التبرع بالدم الكامل" },
            { value: "plasma", label: "التبرع بالبلازما" },
            { value: "platelets", label: "التبرع بالصفائح" },
          ]
        : [...donationTypes],
    wilayas:
      locale === "ar"
        ? [
            { code: "16", label: "الجزائر" },
            { code: "09", label: "البليدة" },
            { code: "42", label: "تيبازة" },
            { code: "15", label: "تيزي وزو" },
          ]
        : [
            { code: "16", label: "Alger" },
            { code: "09", label: "Blida" },
            { code: "42", label: "Tipaza" },
            { code: "15", label: "Tizi Ouzou" },
          ],
    communesByWilaya: {
      "16": ["Sidi M'Hamed", "Bab El Oued", "El Madania"],
      "09": ["Blida", "Bouarfa", "Ouled Yaich"],
      "42": ["Tipaza", "Cherchell", "Kolea"],
      "15": ["Tizi Ouzou", "Draa Ben Khedda", "Azazga"],
    },
    eligibilityChecklistTemplate:
      locale === "ar"
        ? [
            { key: "ageConfirmed", label: "العمر بين 18 و65 سنة" },
            { key: "weightConfirmed", label: "الوزن الأدنى 50 كلغ" },
            { key: "healthyConfirmed", label: "حالة صحية جيدة" },
            {
              key: "noContraIndicationConfirmed",
              label: "عدم وجود مانع للتبرع",
            },
          ]
        : [
            { key: "ageConfirmed", label: "Âge entre 18 et 65 ans" },
            { key: "weightConfirmed", label: "Poids minimum 50 kg" },
            { key: "healthyConfirmed", label: "Être en bonne santé" },
            {
              key: "noContraIndicationConfirmed",
              label: "Aucune contre-indication au don",
            },
          ],
  } as AppointmentFormMeta;
}

export const fallbackAppointmentMeta = getFallbackAppointmentMeta("fr");
import type { AppointmentFormMeta } from "@/features/appointment/types";
