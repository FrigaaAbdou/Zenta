import { describe, expect, it } from "vitest";

import { AppointmentSlotOverrideModel } from "../modules/appointments/appointment-slot-override.model.js";

describe("AppointmentSlotOverrideModel", () => {
  it("accepts a valid date override", () => {
    const override = new AppointmentSlotOverrideModel({
      date: "2026-06-15",
      time: "08:00",
      capacity: 1,
      status: "blocked",
      reason: "Collecte externe",
    });

    expect(override.validateSync()).toBeUndefined();
  });

  it("requires the date and time", () => {
    const override = new AppointmentSlotOverrideModel({
      status: "closed",
    });

    const validationError = override.validateSync();

    expect(validationError?.errors.date?.message).toMatch(/required/i);
    expect(validationError?.errors.time?.message).toMatch(/required/i);
  });
});
