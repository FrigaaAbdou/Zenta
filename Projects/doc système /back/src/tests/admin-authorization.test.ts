import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { errorMiddleware } from "../middlewares/error.middleware.js";
import { requireAdminAuth } from "../middlewares/admin-auth.middleware.js";
import { requireAdminRole } from "../middlewares/admin-role.middleware.js";
import { resetEnvCache } from "../config/env.js";
import { AdminUserModel } from "../modules/admin-auth/admin-user.model.js";
import { hashAdminPassword } from "../modules/admin-auth/password.js";
import { loginAdmin } from "../modules/admin-auth/admin-auth.service.js";

function createUserFixture(role: "super_admin" | "manager" | "operator") {
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

function createProtectedApp() {
  const app = express();

  app.get("/protected", requireAdminAuth, (_request, response) => {
    response.status(200).json({ ok: true });
  });

  app.get(
    "/manager-only",
    requireAdminAuth,
    requireAdminRole("manager", "super_admin"),
    (_request, response) => {
      response.status(200).json({ ok: true });
    },
  );

  app.use(errorMiddleware);

  return app;
}

describe("admin authorization middleware", () => {
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

  it("returns 401 when a protected admin route has no bearer token", async () => {
    const app = createProtectedApp();

    const response = await request(app).get("/protected");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 403 when the authenticated admin role is insufficient", async () => {
    const operator = createUserFixture("operator");
    operator.passwordHash = await hashAdminPassword("secret123");

    vi.spyOn(AdminUserModel, "findOne").mockReturnValue({
      exec: vi.fn().mockResolvedValue(operator),
    } as never);

    vi.spyOn(AdminUserModel, "findById").mockReturnValue({
      exec: vi.fn().mockResolvedValue(operator),
    } as never);

    const login = await loginAdmin(operator.email, "secret123");
    const app = createProtectedApp();

    const response = await request(app)
      .get("/manager-only")
      .set("Authorization", `Bearer ${login.token}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("allows access when the admin has a sufficient role", async () => {
    const manager = createUserFixture("manager");
    manager.passwordHash = await hashAdminPassword("secret123");

    vi.spyOn(AdminUserModel, "findOne").mockReturnValue({
      exec: vi.fn().mockResolvedValue(manager),
    } as never);

    vi.spyOn(AdminUserModel, "findById").mockReturnValue({
      exec: vi.fn().mockResolvedValue(manager),
    } as never);

    const login = await loginAdmin(manager.email, "secret123");
    const app = createProtectedApp();

    const response = await request(app)
      .get("/manager-only")
      .set("Authorization", `Bearer ${login.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
