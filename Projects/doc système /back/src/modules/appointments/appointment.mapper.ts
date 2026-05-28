import type { SupportedLocale } from "../../shared/constants/locales.js";
import type { DonorDraft } from "../donors/donor.service.js";

type EligibilityChecklist = {
  ageConfirmed: boolean;
  weightConfirmed: boolean;
  healthyConfirmed: boolean;
  noContraIndicationConfirmed: boolean;
};

export type AppointmentRequestInput = {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: "male" | "female";
  phone: string;
  email?: string;
  wilayaCode: string;
  commune: string;
  bloodGroup: string;
  campaignCode?: string;
  appointmentDate: string;
  appointmentTime: string;
  donationType: string;
  isExistingDonor: boolean;
  lastDonationDate?: string;
  eligibilityChecklist: EligibilityChecklist;
  remarks?: string;
  locale: SupportedLocale;
};

type AppointmentDraft = {
  campaignCode: string | null;
  appointmentDate: string;
  appointmentTime: string;
  donationType: string;
  isExistingDonor: boolean;
  lastDonationDate: Date | null;
  eligibilityChecklist: EligibilityChecklist;
  remarks: string;
  locale: SupportedLocale;
};

export function mapAppointmentRequestInput(input: AppointmentRequestInput): {
  donor: DonorDraft;
  appointment: AppointmentDraft;
} {
  const normalizedPhone = input.phone.trim();
  const normalizedEmail = input.email?.trim() ? input.email.trim() : undefined;
  const normalizedRemarks = input.remarks?.trim() ?? "";

  return {
    donor: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      birthDate: new Date(input.birthDate),
      gender: input.gender,
      phone: normalizedPhone,
      email: normalizedEmail,
      wilayaCode: input.wilayaCode,
      commune: input.commune.trim(),
      bloodGroup: input.bloodGroup,
    },
    appointment: {
      campaignCode: input.campaignCode?.trim() || null,
      appointmentDate: input.appointmentDate,
      appointmentTime: input.appointmentTime,
      donationType: input.donationType,
      isExistingDonor: input.isExistingDonor,
      lastDonationDate: input.lastDonationDate
        ? new Date(input.lastDonationDate)
        : null,
      eligibilityChecklist: input.eligibilityChecklist,
      remarks: normalizedRemarks,
      locale: input.locale,
    },
  };
}
