import { AppointmentRequestModel } from "./appointment.model.js";

export type AppointmentDraft = {
  donorId: string;
  campaignCode?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  donationType: string;
  isExistingDonor: boolean;
  lastDonationDate?: Date | null;
  eligibilityChecklist: {
    ageConfirmed: boolean;
    weightConfirmed: boolean;
    healthyConfirmed: boolean;
    noContraIndicationConfirmed: boolean;
  };
  remarks?: string;
  locale: "fr" | "ar";
  status?: string;
};

export async function createAppointmentRequest(draft: AppointmentDraft) {
  const appointment = new AppointmentRequestModel({
    donorId: draft.donorId,
    campaignCode: draft.campaignCode ?? null,
    appointmentDate: draft.appointmentDate,
    appointmentTime: draft.appointmentTime,
    donationType: draft.donationType,
    isExistingDonor: draft.isExistingDonor,
    lastDonationDate: draft.lastDonationDate ?? null,
    eligibilityChecklist: draft.eligibilityChecklist,
    remarks: draft.remarks ?? "",
    locale: draft.locale,
    status: draft.status ?? "pending",
  });

  await appointment.save();

  return appointment;
}

export async function findPendingAppointmentConflict(input: {
  donorId: string;
  appointmentDate: string;
  appointmentTime: string;
}) {
  return AppointmentRequestModel.findOne({
    donorId: input.donorId,
    appointmentDate: input.appointmentDate,
    appointmentTime: input.appointmentTime,
    status: "pending",
  }).exec();
}
