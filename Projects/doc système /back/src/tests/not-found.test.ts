import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../app/app.js";

describe("unknown routes", () => {
  it("returns a 404 JSON payload", async () => {
    const app = createApp({
      corsOrigin: "http://127.0.0.1:5175",
      nodeEnv: "test",
    });

    const response = await request(app).get("/missing-route");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
        details: null,
      },
    });
  });
});
