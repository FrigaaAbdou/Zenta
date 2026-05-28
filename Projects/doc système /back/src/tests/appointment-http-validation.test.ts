import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../app/app.js";

function buildTestApp() {
  return createApp({
    corsOrigin: "http://127.0.0.1:5175",
    nodeEnv: "test",
  });
}

describe("appointment endpoint validation", () => {
  it("returns 422 when the slot query has no date", async () => {
    const response = await request(buildTestApp()).get(
      "/api/public/appointment-slots",
    );

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.fieldErrors).toEqual({
      date: "Invalid input: expected string, received undefined",
    });
  });

  it("returns 422 when the appointment payload misses a required field", async () => {
    const response = await request(buildTestApp())
      .post("/api/public/appointments")
      .send({
        firstName: "Amine",
        lastName: "Brahimi",
        birthDate: "1994-06-10",
        gender: "male",
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
        locale: "fr",
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.fieldErrors).toMatchObject({
      phone: "Invalid input: expected string, received undefined",
    });
  });

  it("returns 422 when an existing donor payload misses lastDonationDate", async () => {
    const response = await request(buildTestApp())
      .post("/api/public/appointments")
      .send({
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
        locale: "fr",
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.fieldErrors).toMatchObject({
      lastDonationDate: "Last donation date is required for existing donors.",
    });
  });
});
