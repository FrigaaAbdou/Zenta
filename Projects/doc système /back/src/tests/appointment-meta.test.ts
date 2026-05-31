import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const appointmentService = vi.hoisted(() => ({
  getAppointmentSlotOccupancy: vi.fn(),
}));

const appointmentSlotService = vi.hoisted(() => ({
  getResolvedSlotDefinitionsForDate: vi.fn(),
}));

vi.mock("../modules/appointments/appointment.service.js", async () => {
  const actual = await vi.importActual<
    typeof import("../modules/appointments/appointment.service.js")
  >("../modules/appointments/appointment.service.js");

  return {
    ...actual,
    getAppointmentSlotOccupancy: appointmentService.getAppointmentSlotOccupancy,
  };
});

vi.mock("../modules/appointments/appointment-slot.service.js", () => ({
  getResolvedSlotDefinitionsForDate:
    appointmentSlotService.getResolvedSlotDefinitionsForDate,
}));

import { createApp } from "../app/app.js";

function buildTestApp() {
  return createApp({
    corsOrigin: "http://127.0.0.1:5175",
    nodeEnv: "test",
  });
}

describe("appointment meta endpoints", () => {
  beforeEach(() => {
    appointmentService.getAppointmentSlotOccupancy.mockReset();
    appointmentService.getAppointmentSlotOccupancy.mockResolvedValue({});
    appointmentSlotService.getResolvedSlotDefinitionsForDate.mockReset();
    appointmentSlotService.getResolvedSlotDefinitionsForDate.mockResolvedValue([
      {
        value: "08:00",
        label: "08:00",
        capacity: 3,
        status: "open",
        source: "template",
      },
      {
        value: "11:00",
        label: "11:00",
        capacity: 2,
        status: "open",
        source: "template",
      },
    ]);
  });

  it("returns appointment form metadata for the requested locale", async () => {
    const response = await request(buildTestApp()).get(
      "/api/public/appointment-form-meta?locale=fr",
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Appointment form metadata fetched successfully.",
    );
    expect(response.body.data.locales).toEqual(["fr", "ar"]);
    expect(response.body.data.genders[0]).toEqual({
      value: "male",
      label: "Homme",
    });
    expect(response.body.data.donationTypes[0]).toEqual({
      value: "whole_blood",
      label: "Don de sang total",
    });
    expect(response.body.data.eligibilityChecklistTemplate).toHaveLength(4);
  });

  it("returns slots for a requested date", async () => {
    appointmentService.getAppointmentSlotOccupancy.mockResolvedValue({
      "08:00": 1,
      "11:00": 2,
    });

    const response = await request(buildTestApp()).get(
      "/api/public/appointment-slots?date=2026-06-01&campaignCode=SOLIDARITE-2026",
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Appointment slots fetched successfully.",
    );
    expect(response.body.data.date).toBe("2026-06-01");
    expect(response.body.data.slots).toEqual(
      expect.arrayContaining([
        {
          value: "08:00",
          label: "08:00",
          isAvailable: true,
          capacity: 3,
          reservedCount: 1,
          remainingCapacity: 2,
          status: "open",
        },
        {
          value: "11:00",
          label: "11:00",
          isAvailable: false,
          capacity: 2,
          reservedCount: 2,
          remainingCapacity: 0,
          status: "full",
        },
      ]),
    );
  });

  it("marks blocked and closed slots as unavailable for the public form", async () => {
    appointmentSlotService.getResolvedSlotDefinitionsForDate.mockResolvedValue([
      {
        value: "08:00",
        label: "08:00",
        capacity: 3,
        status: "open",
        source: "template",
      },
      {
        value: "09:00",
        label: "09:00",
        capacity: 1,
        status: "blocked",
        source: "override",
      },
      {
        value: "10:00",
        label: "10:00",
        capacity: 0,
        status: "closed",
        source: "override",
      },
    ]);

    const response = await request(buildTestApp()).get(
      "/api/public/appointment-slots?date=2026-06-02",
    );

    expect(response.status).toBe(200);
    expect(response.body.data.slots).toEqual([
      expect.objectContaining({
        value: "08:00",
        isAvailable: true,
        status: "open",
      }),
      expect.objectContaining({
        value: "09:00",
        isAvailable: false,
        status: "blocked",
      }),
      expect.objectContaining({
        value: "10:00",
        isAvailable: false,
        status: "closed",
      }),
    ]);
  });

  it("keeps holiday closures invisible for the public form", async () => {
    appointmentSlotService.getResolvedSlotDefinitionsForDate.mockResolvedValue([
      {
        value: "08:00",
        label: "08:00",
        capacity: 0,
        status: "closed",
        source: "override",
        closureType: "holiday",
        reason: "Jour férié",
      },
    ]);

    const response = await request(buildTestApp()).get(
      "/api/public/appointment-slots?date=2026-11-01",
    );

    expect(response.status).toBe(200);
    expect(response.body.data.slots).toEqual([
      expect.objectContaining({
        value: "08:00",
        isAvailable: false,
        status: "closed",
      }),
    ]);
  });
});
