import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const donorService = vi.hoisted(() => ({
  upsertDonorByPhone: vi.fn(),
}));

const appointmentService = vi.hoisted(() => ({
  createAppointmentRequest: vi.fn(),
  findPendingAppointmentConflict: vi.fn(),
  getAppointmentSlotOccupancy: vi.fn(),
}));

const appointmentSlotService = vi.hoisted(() => ({
  getResolvedSlotDefinitionsForDate: vi.fn(),
}));

vi.mock("../modules/donors/donor.service.js", () => donorService);
vi.mock("../modules/appointments/appointment.service.js", () => appointmentService);
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

const validPayload = {
  firstName: "Amine",
  lastName: "Brahimi",
  birthDate: "1994-06-10",
  gender: "male",
  phone: "+213560000000",
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
};

describe("POST /api/public/appointments", () => {
  beforeEach(() => {
    donorService.upsertDonorByPhone.mockReset();
    appointmentService.createAppointmentRequest.mockReset();
    appointmentService.findPendingAppointmentConflict.mockReset();
    appointmentService.getAppointmentSlotOccupancy.mockReset();
    appointmentService.getAppointmentSlotOccupancy.mockResolvedValue({});
    appointmentSlotService.getResolvedSlotDefinitionsForDate.mockReset();
    appointmentSlotService.getResolvedSlotDefinitionsForDate.mockResolvedValue([
      {
        value: "10:00",
        label: "10:00",
        capacity: 3,
        status: "open",
        source: "template",
      },
    ]);
  });

  it("creates an appointment request and returns a 201 payload", async () => {
    donorService.upsertDonorByPhone.mockResolvedValue({
      _id: "6650f9f2c10d4e5d2a3e0101",
    });
    appointmentService.findPendingAppointmentConflict.mockResolvedValue(null);
    appointmentService.createAppointmentRequest.mockResolvedValue({
      _id: "6650f9f2c10d4e5d2a3e0102",
      status: "pending",
      appointmentDate: "2026-06-01",
      appointmentTime: "10:00",
      createdAt: new Date("2026-05-23T18:00:00.000Z"),
    });

    const response = await request(buildTestApp())
      .post("/api/public/appointments")
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      data: {
        id: "6650f9f2c10d4e5d2a3e0102",
        status: "pending",
        appointmentDate: "2026-06-01",
        appointmentTime: "10:00",
        createdAt: "2026-05-23T18:00:00.000Z",
      },
      message: "Votre demande a bien ete enregistree.",
    });
  });

  it("rejects a request when the eligibility checklist is not fully positive", async () => {
    const response = await request(buildTestApp())
      .post("/api/public/appointments")
      .send({
        ...validPayload,
        eligibilityChecklist: {
          ...validPayload.eligibilityChecklist,
          healthyConfirmed: false,
        },
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.fieldErrors).toEqual({
      eligibilityChecklist: "All eligibility checklist confirmations must be true.",
    });
  });

  it("rejects a request when the selected slot is already taken", async () => {
    donorService.upsertDonorByPhone.mockResolvedValue({
      _id: "6650f9f2c10d4e5d2a3e0101",
    });
    appointmentService.findPendingAppointmentConflict.mockResolvedValue({
      _id: "6650f9f2c10d4e5d2a3e0999",
    });

    const response = await request(buildTestApp())
      .post("/api/public/appointments")
      .send(validPayload);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: {
        code: "SLOT_UNAVAILABLE",
        message: "Le creneau selectionne n'est plus disponible.",
        details: {
          appointmentTime: "Veuillez choisir un autre horaire.",
        },
      },
    });
  });

  it("rejects a request when the selected slot has no remaining capacity", async () => {
    donorService.upsertDonorByPhone.mockResolvedValue({
      _id: "6650f9f2c10d4e5d2a3e0101",
    });
    appointmentService.findPendingAppointmentConflict.mockResolvedValue(null);
    appointmentService.getAppointmentSlotOccupancy.mockResolvedValue({
      "10:00": 3,
    });

    const response = await request(buildTestApp())
      .post("/api/public/appointments")
      .send(validPayload);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("SLOT_UNAVAILABLE");
  });
});
