import { describe, expect, it, vi } from "vitest";

import {
  createAppointmentRequestSchema,
  getAppointmentSlotsQuerySchema,
} from "../modules/appointments/appointment.schema.js";

describe("appointment schemas", () => {
  it("parses a valid slot query", () => {
    const result = getAppointmentSlotsQuerySchema.parse({
      date: "2026-06-01",
      campaignCode: "SOLIDARITE-2026",
    });

    expect(result).toEqual({
      date: "2026-06-01",
      campaignCode: "SOLIDARITE-2026",
    });
  });

  it("rejects a slot query without date", () => {
    const result = getAppointmentSlotsQuerySchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("requires lastDonationDate for existing donors", () => {
    const result = createAppointmentRequestSchema.safeParse({
      firstName: "Amine",
      lastName: "Brahimi",
      birthDate: "1994-06-10",
      gender: "male",
      phone: "+213560000000",
      email: "amine@example.com",
      wilayaCode: "16",
      commune: "Sidi M'Hamed",
      bloodGroup: "O+",
      appointmentDate: "2026-06-01",
      appointmentTime: "10:00",
      donationType: "whole_blood",
      isExistingDonor: true,
      eligibilityChecklist: {
        ageConfirmed: true,
        weightConfirmed: true,
        healthyConfirmed: true,
        noContraIndicationConfirmed: true,
      },
      remarks: "",
      locale: "fr",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a donor younger than 18", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-30T12:00:00Z"));

    const result = createAppointmentRequestSchema.safeParse({
      firstName: "Amine",
      lastName: "Brahimi",
      birthDate: "2010-06-01",
      gender: "male",
      phone: "+213560000000",
      email: "amine@example.com",
      wilayaCode: "16",
      commune: "Sidi M'Hamed",
      bloodGroup: "O+",
      appointmentDate: "2026-06-01",
      appointmentTime: "10:00",
      donationType: "whole_blood",
      isExistingDonor: false,
      eligibilityChecklist: {
        ageConfirmed: true,
        weightConfirmed: true,
        healthyConfirmed: true,
        noContraIndicationConfirmed: true,
      },
      remarks: "",
      locale: "fr",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.birthDate).toContain(
      "The donor must be at least 18 years old to request an appointment.",
    );

    vi.useRealTimers();
  });
});
