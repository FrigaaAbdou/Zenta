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

export const fallbackAppointmentMeta = {
  locales: ["fr", "ar"],
  genders: [
    { value: "male", label: "Homme" },
    { value: "female", label: "Femme" },
  ],
  bloodGroups: [...bloodGroups],
  donationTypes: [...donationTypes],
  wilayas: [
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
  eligibilityChecklistTemplate: [
    { key: "ageConfirmed", label: "Âge entre 18 et 65 ans" },
    { key: "weightConfirmed", label: "Poids minimum 50 kg" },
    { key: "healthyConfirmed", label: "Être en bonne santé" },
    {
      key: "noContraIndicationConfirmed",
      label: "Aucune contre-indication au don",
    },
  ],
} as const;
