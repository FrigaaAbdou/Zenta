import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../app/app.js";

function buildTestApp() {
  return createApp({
    corsOrigin: "http://127.0.0.1:5175",
    nodeEnv: "test",
  });
}

describe("appointment meta endpoints", () => {
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
        },
      ]),
    );
  });
});
