import { describe, expect, it, vi } from "vitest";

import { appointmentFormSchema } from "./appointmentFormSchema";

describe("appointmentFormSchema", () => {
  it("rejects a donor younger than 18", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-30T12:00:00Z"));

    const result = appointmentFormSchema.safeParse({
      firstName: "Sara",
      lastName: "Brahimi",
      birthDate: "2010-06-01",
      gender: "female",
      phone: "0550123456",
      email: "",
      wilayaCode: "16",
      commune: "Sidi M'Hamed",
      campaignCode: "SOLIDARITE-2026",
      appointmentDate: "2026-06-10",
      appointmentTime: "08:00",
      bloodGroup: "O+",
      donationType: "whole_blood",
      isExistingDonor: false,
      remarks: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.birthDate).toContain(
      "Vous devez avoir au moins 18 ans pour faire une demande de rendez-vous.",
    );

    vi.useRealTimers();
  });

  it("accepts a donor aged 18 or older", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-30T12:00:00Z"));

    const result = appointmentFormSchema.safeParse({
      firstName: "Sara",
      lastName: "Brahimi",
      birthDate: "2008-05-30",
      gender: "female",
      phone: "0550123456",
      email: "",
      wilayaCode: "16",
      commune: "Sidi M'Hamed",
      campaignCode: "SOLIDARITE-2026",
      appointmentDate: "2026-06-10",
      appointmentTime: "08:00",
      bloodGroup: "O+",
      donationType: "whole_blood",
      isExistingDonor: false,
      remarks: "",
    });

    expect(result.success).toBe(true);

    vi.useRealTimers();
  });
});
