import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "../app/app.js";
import { resetEnvCache } from "../config/env.js";
import { AppError } from "../lib/errors/app-error.js";
import { AdminUserModel } from "../modules/admin-auth/admin-user.model.js";
import { hashAdminPassword } from "../modules/admin-auth/password.js";
import * as campaignService from "../modules/campaigns/campaign.service.js";

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

describe("admin campaign routes", () => {
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

  it("returns the admin campaigns list", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "operator");

    vi.spyOn(campaignService, "listAdminCampaigns").mockResolvedValue([
      {
        id: "campaign-1",
        code: "SOLIDARITE-2026",
        status: "published",
        isPublished: true,
        isActive: true,
        priority: 90,
        badgeLabel: "Urgence estivale",
        theme: "emergency",
        startDate: "2026-06-01T00:00:00.000Z",
        endDate: null,
        localeContent: {
          fr: {
            title: "Solidarite 2026",
            description: "Description FR",
            ctaLabel: "Je donne",
          },
          ar: null,
        },
      },
    ]);

    const response = await request(app)
      .get("/api/admin/campaigns")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].code).toBe("SOLIDARITE-2026");
  });

  it("creates a campaign for manager roles", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "manager");

    vi.spyOn(campaignService, "createAdminCampaign").mockResolvedValue({
      id: "campaign-1",
      code: "SOLIDARITE-2026",
      status: "published",
      isPublished: true,
      isActive: true,
      priority: 90,
      badgeLabel: "Urgence estivale",
      theme: "emergency",
      startDate: "2026-06-01T00:00:00.000Z",
      endDate: null,
      localeContent: {
        fr: {
          title: "Solidarite 2026",
          description: "Description FR",
          ctaLabel: "Je donne",
        },
        ar: null,
      },
    });

    const response = await request(app)
      .post("/api/admin/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "solidarite-2026",
        status: "published",
        isPublished: true,
        isActive: true,
        priority: 90,
        badgeLabel: "Urgence estivale",
        theme: "emergency",
        startDate: "2026-06-01T00:00:00.000Z",
        endDate: null,
        localeContent: {
          fr: {
            title: "Solidarite 2026",
            description: "Description FR",
            ctaLabel: "Je donne",
          },
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.data.item.code).toBe("SOLIDARITE-2026");
  });

  it("rejects campaign writes for operator roles", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "operator");

    const response = await request(app)
      .post("/api/admin/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "solidarite-2026",
        status: "published",
        isPublished: true,
        isActive: true,
        priority: 90,
        badgeLabel: "Urgence estivale",
        theme: "emergency",
        localeContent: {
          fr: {
            title: "Solidarite 2026",
            description: "Description FR",
            ctaLabel: "Je donne",
          },
        },
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns 409 when the campaign code already exists", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "super_admin");

    vi.spyOn(campaignService, "createAdminCampaign").mockRejectedValue(
      new AppError({
        statusCode: 409,
        code: "CAMPAIGN_CODE_ALREADY_EXISTS",
        message: "A campaign with this code already exists.",
      }),
    );

    const response = await request(app)
      .post("/api/admin/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "solidarite-2026",
        status: "published",
        isPublished: true,
        isActive: true,
        priority: 90,
        badgeLabel: "Urgence estivale",
        theme: "emergency",
        localeContent: {
          fr: {
            title: "Solidarite 2026",
            description: "Description FR",
            ctaLabel: "Je donne",
          },
        },
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CAMPAIGN_CODE_ALREADY_EXISTS");
  });
});
