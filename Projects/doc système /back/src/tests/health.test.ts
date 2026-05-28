import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../app/app.js";

describe("GET /health", () => {
  it("returns an ok status payload", async () => {
    const app = createApp({
      corsOrigin: "http://127.0.0.1:5175",
      nodeEnv: "test",
    });

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
