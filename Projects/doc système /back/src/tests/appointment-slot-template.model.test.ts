import { describe, expect, it } from "vitest";

import { AppointmentSlotTemplateModel } from "../modules/appointments/appointment-slot-template.model.js";

describe("AppointmentSlotTemplateModel", () => {
  it("accepts a valid recurring slot rule template", () => {
    const template = new AppointmentSlotTemplateModel({
      daysOfWeek: [1, 3, 5],
      startTime: "08:00",
      endTime: "12:00",
      intervalMinutes: 15,
      capacity: 3,
      isActive: true,
      donationTypes: ["whole_blood", "plasma"],
    });

    expect(template.validateSync()).toBeUndefined();
  });

  it("requires recurrence days and range boundaries", () => {
    const template = new AppointmentSlotTemplateModel({
      capacity: 2,
    });

    const validationError = template.validateSync();

    expect(validationError?.errors.daysOfWeek?.message).toMatch(/required/i);
    expect(validationError?.errors.startTime?.message).toMatch(/required/i);
    expect(validationError?.errors.endTime?.message).toMatch(/required/i);
  });
});
