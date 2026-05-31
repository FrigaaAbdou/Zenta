import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "../app/app.js";
import { resetEnvCache } from "../config/env.js";
import { AdminUserModel } from "../modules/admin-auth/admin-user.model.js";
import { hashAdminPassword } from "../modules/admin-auth/password.js";

const baseConfig = {
  corsOrigin: "http://127.0.0.1:5175",
  nodeEnv: "test" as const,
};

function createUserFixture(overrides?: Partial<Record<string, unknown>>) {
  const state = {
    _id: {
      toString: () => "admin-user-id",
    },
    email: "admin@cts.local",
    passwordHash: "",
    role: "super_admin",
    isActive: true,
    lastLoginAt: null,
    save: vi.fn(async () => state),
    ...overrides,
  };

  return state;
}

describe("admin auth routes", () => {
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

  it("logs in an active admin and returns a token", async () => {
    const passwordHash = await hashAdminPassword("secret123");
    const user = createUserFixture({ passwordHash });

    vi.spyOn(AdminUserModel, "findOne").mockReturnValue({
      exec: vi.fn().mockResolvedValue(user),
    } as never);

    const app = createApp(baseConfig);

    const response = await request(app).post("/api/admin/auth/login").send({
      email: "admin@cts.local",
      password: "secret123",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.expiresIn).toBe("8h");
    expect(response.body.admin).toMatchObject({
      id: "admin-user-id",
      email: "admin@cts.local",
      role: "super_admin",
      isActive: true,
    });
    expect(user.save).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid credentials", async () => {
    vi.spyOn(AdminUserModel, "findOne").mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    } as never);

    const app = createApp(baseConfig);

    const response = await request(app).post("/api/admin/auth/login").send({
      email: "admin@cts.local",
      password: "wrong",
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns the authenticated admin from a bearer token", async () => {
    const passwordHash = await hashAdminPassword("secret123");
    const user = createUserFixture({ passwordHash });

    vi.spyOn(AdminUserModel, "findOne").mockReturnValue({
      exec: vi.fn().mockResolvedValue(user),
    } as never);

    vi.spyOn(AdminUserModel, "findById").mockReturnValue({
      exec: vi.fn().mockResolvedValue(user),
    } as never);

    const app = createApp(baseConfig);

    const loginResponse = await request(app).post("/api/admin/auth/login").send({
      email: "admin@cts.local",
      password: "secret123",
    });

    const meResponse = await request(app)
      .get("/api/admin/auth/me")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.admin).toMatchObject({
      id: "admin-user-id",
      email: "admin@cts.local",
      role: "super_admin",
    });
  });

  it("rejects /me when the authorization header is missing", async () => {
    const app = createApp(baseConfig);

    const response = await request(app).get("/api/admin/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("responds with 204 on logout", async () => {
    const passwordHash = await hashAdminPassword("secret123");
    const user = createUserFixture({ passwordHash });

    vi.spyOn(AdminUserModel, "findOne").mockReturnValue({
      exec: vi.fn().mockResolvedValue(user),
    } as never);

    vi.spyOn(AdminUserModel, "findById").mockReturnValue({
      exec: vi.fn().mockResolvedValue(user),
    } as never);

    const app = createApp(baseConfig);
    const loginResponse = await request(app).post("/api/admin/auth/login").send({
      email: "admin@cts.local",
      password: "secret123",
    });

    const response = await request(app)
      .post("/api/admin/auth/logout")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(response.status).toBe(204);
    expect(response.text).toBe("");
  });
});
