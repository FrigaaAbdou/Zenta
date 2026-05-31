import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "../app/app.js";
import { resetEnvCache } from "../config/env.js";
import { AppError } from "../lib/errors/app-error.js";
import { AdminUserModel } from "../modules/admin-auth/admin-user.model.js";
import { hashAdminPassword } from "../modules/admin-auth/password.js";
import * as contentService from "../modules/content/content.service.js";

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

describe("admin content routes", () => {
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

  it("returns the admin site content list", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "operator");

    vi.spyOn(contentService, "listAdminSiteContent").mockResolvedValue([
      {
        id: "home",
        key: "home",
        localeContent: {
          fr: {
            hero: {
              eyebrow: "Centre",
              title: "Titre",
              description: "Description",
              primaryCtaLabel: "Action",
              secondaryCtaLabel: "Verifier",
            },
          },
          ar: {
            hero: {
              eyebrow: "مركز",
              title: "عنوان",
              description: "وصف",
              primaryCtaLabel: "اتبرع",
              secondaryCtaLabel: "تحقق",
            },
          },
        },
      },
    ] as never);

    const response = await request(app)
      .get("/api/admin/content")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].key).toBe("home");
  });

  it("updates site content for manager roles", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "manager");

    vi.spyOn(contentService, "updateAdminSiteContentByKey").mockResolvedValue({
      id: "home-id",
      key: "home",
      localeContent: {
        fr: {
          hero: {
            eyebrow: "Centre",
            title: "Nouveau titre",
            description: "Description",
            primaryCtaLabel: "Action",
            secondaryCtaLabel: "Verifier",
          },
        },
        ar: {
          hero: {
            eyebrow: "مركز",
            title: "عنوان جديد",
            description: "وصف",
            primaryCtaLabel: "اتبرع",
            secondaryCtaLabel: "تحقق",
          },
        },
      },
    } as never);

    const response = await request(app)
      .patch("/api/admin/content/home")
      .set("Authorization", `Bearer ${token}`)
      .send({
        localeContent: {
          fr: {
            hero: {
              title: "Nouveau titre",
            },
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.item.key).toBe("home");
  });

  it("rejects content writes for operator roles", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "operator");

    const response = await request(app)
      .patch("/api/admin/content/home")
      .set("Authorization", `Bearer ${token}`)
      .send({
        localeContent: {
          fr: {
            hero: {
              title: "Nouveau titre",
            },
          },
        },
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns 404 when updating an unknown content key", async () => {
    const app = createApp(baseConfig);
    const token = await loginAs(app, "super_admin");

    vi.spyOn(contentService, "updateAdminSiteContentByKey").mockRejectedValue(
      new AppError({
        statusCode: 404,
        code: "SITE_CONTENT_NOT_FOUND",
        message: "Site content not found.",
      }),
    );

    const response = await request(app)
      .patch("/api/admin/content/missing")
      .set("Authorization", `Bearer ${token}`)
      .send({
        localeContent: {
          fr: {
            hero: {
              title: "Nouveau titre",
            },
          },
        },
      });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("SITE_CONTENT_NOT_FOUND");
  });
});
