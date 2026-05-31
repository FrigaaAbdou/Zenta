import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "../app/app.js";
import { resetEnvCache } from "../config/env.js";
import { AppError } from "../lib/errors/app-error.js";
import { AdminUserModel } from "../modules/admin-auth/admin-user.model.js";
import { hashAdminPassword } from "../modules/admin-auth/password.js";
import * as appointmentService from "../modules/appointments/appointment.service.js";

const baseConfig = {
  corsOrigin: "http://127.0.0.1:5175",
  nodeEnv: "test" as const,
};

function createAdminFixture(role: "super_admin" | "manager" | "operator" = "manager") {
  const state = {
    _id: {
      toString: () => `${role}-id`,
    },
    email: `${role}@cts.local`,
    passwordHash: "",
    role,
    isActive: true,
    lastLoginAt: null,
    save: vi.fn(async () => state),
  };

  return state;
}

async function loginAs(app: ReturnType<typeof createApp>, role: "super_admin" | "manager" | "operator" = "manager") {
  const admin = createAdminFixture(role);
  admin.passwordHash = await hashAdminPassword("secret123");

  vi.spyOn(AdminUserModel, "findOne").mockReturnValue({
    exec: vi.fn().mockResolvedValue(admin),
  } as never);

  vi.spyOn(AdminUserModel, "findById").mockReturnValue({
    exec: vi.fn().mockResolvedValue(admin),
  } as never);

  const loginResponse = await request(app).post("/api/admin/auth/login").send({
    email: admin.email,
    password: "secret123",
  });

  return loginResponse.body.token as string;
}

describe("admin appointment routes", () => {
  beforeEach(() => {
    process.env.PORT = "4000";
    process.env.NODE_ENV = "test";
    process.env.MONGODB_URI = "mongodb://localhost:27017/cts";
    process.env.CORS_ORIGIN = "http://127.0.0.1:5175";
    process.env.ADMIN_JWT_SECRET = "test-secret";
    process.env.ADMIN_JWT_EXPIRES_IN = "8h";
    resetEnvCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a paginated admin appointment list", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "manager");

    vi.spyOn(appointmentService, "listAdminAppointments").mockResolvedValue({
      items: [
        {
          id: "appointment-1",
          donor: {
            id: "donor-1",
            firstName: "Sara",
            lastName: "Benali",
            phone: "0555123456",
            bloodGroup: "O+",
          },
          campaignCode: "SOLIDARITE-2026",
          appointmentDate: "2026-05-29",
          appointmentTime: "09:00",
          donationType: "whole_blood",
          status: "pending",
          createdAt: "2026-05-28T10:00:00.000Z",
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
    });

    const response = await request(app)
      .get("/api/admin/appointments?page=1&pageSize=10")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.pagination.total).toBe(1);
  });

  it("returns an appointment detail payload", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "manager");

    vi.spyOn(appointmentService, "getAdminAppointmentById").mockResolvedValue({
      id: "appointment-1",
      donor: {
        id: "donor-1",
        firstName: "Sara",
        lastName: "Benali",
        phone: "0555123456",
        bloodGroup: "O+",
      },
      donorFull: {
        id: "donor-1",
        firstName: "Sara",
        lastName: "Benali",
        birthDate: "1995-01-01T00:00:00.000Z",
        gender: "female",
        phone: "0555123456",
        email: "sara@example.com",
        wilayaCode: "16",
        commune: "Sidi M'Hamed",
        bloodGroup: "O+",
      },
      campaignCode: "SOLIDARITE-2026",
      appointmentDate: "2026-05-29",
      appointmentTime: "09:00",
      donationType: "whole_blood",
      status: "pending",
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:00:00.000Z",
      isExistingDonor: false,
      lastDonationDate: null,
      eligibilityChecklist: {
        ageConfirmed: true,
        weightConfirmed: true,
        healthyConfirmed: true,
        noContraIndicationConfirmed: true,
      },
      remarks: "",
      locale: "fr",
    });

    const response = await request(app)
      .get("/api/admin/appointments/appointment-1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe("appointment-1");
    expect(response.body.data.donorFull.firstName).toBe("Sara");
  });

  it("updates an appointment status", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "operator");

    vi.spyOn(appointmentService, "updateAdminAppointmentStatus").mockResolvedValue({
      id: "appointment-1",
      donor: {
        id: "donor-1",
        firstName: "Sara",
        lastName: "Benali",
        phone: "0555123456",
        bloodGroup: "O+",
      },
      donorFull: {
        id: "donor-1",
        firstName: "Sara",
        lastName: "Benali",
        birthDate: "1995-01-01T00:00:00.000Z",
        gender: "female",
        phone: "0555123456",
        email: "sara@example.com",
        wilayaCode: "16",
        commune: "Sidi M'Hamed",
        bloodGroup: "O+",
      },
      campaignCode: "SOLIDARITE-2026",
      appointmentDate: "2026-05-29",
      appointmentTime: "09:00",
      donationType: "whole_blood",
      status: "confirmed",
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:10:00.000Z",
      isExistingDonor: false,
      lastDonationDate: null,
      eligibilityChecklist: {
        ageConfirmed: true,
        weightConfirmed: true,
        healthyConfirmed: true,
        noContraIndicationConfirmed: true,
      },
      remarks: "",
      locale: "fr",
    });

    const response = await request(app)
      .patch("/api/admin/appointments/appointment-1/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "confirmed" });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("confirmed");
  });

  it("returns 422 on invalid list query", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "manager");

    const response = await request(app)
      .get("/api/admin/appointments?page=0")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 403 when the service rejects a status mutation", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "operator");

    vi.spyOn(appointmentService, "updateAdminAppointmentStatus").mockRejectedValue(
      new AppError({
        statusCode: 403,
        code: "FORBIDDEN",
        message: "You do not have permission to apply this appointment status transition",
      }),
    );

    const response = await request(app)
      .patch("/api/admin/appointments/appointment-1/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "cancelled" });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});
