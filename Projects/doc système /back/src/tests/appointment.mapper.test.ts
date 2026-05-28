import { describe, expect, it } from "vitest";

import { mapAppointmentRequestInput } from "../modules/appointments/appointment.mapper.js";

describe("mapAppointmentRequestInput", () => {
  it("splits the donor payload from the appointment payload", () => {
    const result = mapAppointmentRequestInput({
      firstName: "Amine",
      lastName: "Brahimi",
      birthDate: "1994-06-10",
      gender: "male",
      phone: "  +213560000000 ",
      email: "amine@example.com",
      wilayaCode: "16",
      commune: "Sidi M'Hamed",
      bloodGroup: "O+",
      campaignCode: "SOLIDARITE-2026",
      appointmentDate: "2026-06-01",
      appointmentTime: "10:00",
      donationType: "whole_blood",
      isExistingDonor: true,
      lastDonationDate: "2025-11-02",
      eligibilityChecklist: {
        ageConfirmed: true,
        weightConfirmed: true,
        healthyConfirmed: true,
        noContraIndicationConfirmed: true,
      },
      remarks: "Souhaite etre accompagne.",
      locale: "fr",
    });

    expect(result.donor).toEqual({
      firstName: "Amine",
      lastName: "Brahimi",
      birthDate: new Date("1994-06-10"),
      gender: "male",
      phone: "+213560000000",
      email: "amine@example.com",
      wilayaCode: "16",
      commune: "Sidi M'Hamed",
      bloodGroup: "O+",
    });

    expect(result.appointment).toEqual({
      campaignCode: "SOLIDARITE-2026",
      appointmentDate: "2026-06-01",
      appointmentTime: "10:00",
      donationType: "whole_blood",
      isExistingDonor: true,
      lastDonationDate: new Date("2025-11-02"),
      eligibilityChecklist: {
        ageConfirmed: true,
        weightConfirmed: true,
        healthyConfirmed: true,
        noContraIndicationConfirmed: true,
      },
      remarks: "Souhaite etre accompagne.",
      locale: "fr",
    });
  });
});
