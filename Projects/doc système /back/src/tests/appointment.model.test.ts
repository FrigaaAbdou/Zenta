import { describe, expect, it } from "vitest";

import { AppointmentRequestModel } from "../modules/appointments/appointment.model.js";

describe("AppointmentRequestModel", () => {
  it("defaults a new appointment request to pending status", () => {
    const appointment = new AppointmentRequestModel({
      donorId: "6650f9f2c10d4e5d2a3e0101",
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
      locale: "fr",
    });

    expect(appointment.status).toBe("pending");
    expect(appointment.validateSync()).toBeUndefined();
  });
});
