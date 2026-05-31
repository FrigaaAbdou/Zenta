import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "../app/app.js";
import { resetEnvCache } from "../config/env.js";
import { AdminUserModel } from "../modules/admin-auth/admin-user.model.js";
import { hashAdminPassword } from "../modules/admin-auth/password.js";

const appointmentSlotService = vi.hoisted(() => ({
  getAdminCalendarMonth: vi.fn(),
  getAdminCalendarDay: vi.fn(),
  createAdminCalendarSlotOverride: vi.fn(),
  updateAdminCalendarSlotOverride: vi.fn(),
  closeAdminCalendarDay: vi.fn(),
  reopenAdminCalendarDay: vi.fn(),
  listAdminCalendarTemplates: vi.fn(),
  replaceAdminCalendarTemplates: vi.fn(),
}));

vi.mock("../modules/appointments/appointment-slot.service.js", () => ({
  getAdminCalendarMonth: appointmentSlotService.getAdminCalendarMonth,
  getAdminCalendarDay: appointmentSlotService.getAdminCalendarDay,
  createAdminCalendarSlotOverride:
    appointmentSlotService.createAdminCalendarSlotOverride,
  updateAdminCalendarSlotOverride:
    appointmentSlotService.updateAdminCalendarSlotOverride,
  closeAdminCalendarDay: appointmentSlotService.closeAdminCalendarDay,
  reopenAdminCalendarDay: appointmentSlotService.reopenAdminCalendarDay,
  listAdminCalendarTemplates:
    appointmentSlotService.listAdminCalendarTemplates,
  replaceAdminCalendarTemplates:
    appointmentSlotService.replaceAdminCalendarTemplates,
}));

const baseConfig = {
  corsOrigin: "http://127.0.0.1:5175",
  nodeEnv: "test" as const,
};

function createAdminFixture(
  role: "super_admin" | "manager" | "operator" = "manager",
) {
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

async function loginAs(
  app: ReturnType<typeof createApp>,
  role: "super_admin" | "manager" | "operator" = "manager",
) {
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

describe("admin calendar routes", () => {
  beforeEach(() => {
    process.env.PORT = "4000";
    process.env.NODE_ENV = "test";
    process.env.MONGODB_URI = "mongodb://localhost:27017/cts";
    process.env.CORS_ORIGIN = "http://127.0.0.1:5175";
    process.env.ADMIN_JWT_SECRET = "test-secret";
    process.env.ADMIN_JWT_EXPIRES_IN = "8h";
    resetEnvCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the month calendar summary for admin readers", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "operator");

    appointmentSlotService.getAdminCalendarMonth.mockResolvedValue({
      month: "2026-06",
      days: [
        {
          date: "2026-06-15",
          appointmentCount: 4,
          openSlots: 3,
          status: "available",
        },
      ],
    });

    const response = await request(app)
      .get("/api/admin/calendar/month?month=2026-06")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.month).toBe("2026-06");
    expect(response.body.data.days[0].date).toBe("2026-06-15");
  });

  it("returns the day calendar detail for admin readers", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "operator");

    appointmentSlotService.getAdminCalendarDay.mockResolvedValue({
      date: "2026-06-15",
      slots: [
        {
          value: "08:00",
          label: "08:00",
          capacity: 3,
          reservedCount: 1,
          remainingCapacity: 2,
          status: "open",
          source: "template",
        },
      ],
    });

    const response = await request(app)
      .get("/api/admin/calendar/day?date=2026-06-15")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.date).toBe("2026-06-15");
    expect(response.body.data.slots[0].value).toBe("08:00");
  });

  it("creates a slot override for manager roles", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "manager");

    appointmentSlotService.createAdminCalendarSlotOverride.mockResolvedValue({
      id: "override-1",
      date: "2026-06-15",
      time: "16:00",
      capacity: 2,
      status: "open",
      reason: "Ouverture speciale",
    });

    const response = await request(app)
      .post("/api/admin/calendar/slots")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2026-06-15",
        time: "16:00",
        capacity: 2,
        status: "open",
        reason: "Ouverture speciale",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.item.id).toBe("override-1");
  });

  it("rejects slot writes for operator roles", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "operator");

    const response = await request(app)
      .post("/api/admin/calendar/slots")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2026-06-15",
        time: "16:00",
        capacity: 2,
        status: "open",
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("closes and reopens a day for manager roles", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "manager");

    appointmentSlotService.closeAdminCalendarDay.mockResolvedValue({
      date: "2026-06-15",
      affectedSlots: 7,
      status: "closed",
      closureType: "holiday",
    });
    appointmentSlotService.reopenAdminCalendarDay.mockResolvedValue({
      date: "2026-06-15",
      removedOverrides: 7,
      status: "open",
    });

    const closeResponse = await request(app)
      .post("/api/admin/calendar/day/close")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2026-06-15",
        reason: "Jour férié",
        closureType: "holiday",
      });

    expect(closeResponse.status).toBe(200);
    expect(closeResponse.body.data.status).toBe("closed");
    expect(appointmentSlotService.closeAdminCalendarDay).toHaveBeenCalledWith({
      date: "2026-06-15",
      reason: "Jour férié",
      closureType: "holiday",
    });

    const reopenResponse = await request(app)
      .post("/api/admin/calendar/day/reopen")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2026-06-15",
      });

    expect(reopenResponse.status).toBe(200);
    expect(reopenResponse.body.data.status).toBe("open");
  });

  it("replaces the weekly templates for manager roles", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "manager");

    appointmentSlotService.replaceAdminCalendarTemplates.mockResolvedValue({
      items: [
        {
          id: "template-1",
          daysOfWeek: [1, 3],
          startTime: "08:00",
          endTime: "12:00",
          intervalMinutes: 15,
          capacity: 3,
          isActive: true,
        },
      ],
    });

    const response = await request(app)
      .put("/api/admin/calendar/templates")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          {
            daysOfWeek: [1, 3],
            startTime: "08:00",
            endTime: "12:00",
            intervalMinutes: 15,
            capacity: 3,
            isActive: true,
          },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.data.items[0].daysOfWeek).toEqual([1, 3]);
    expect(response.body.data.items[0].startTime).toBe("08:00");
  });
});
