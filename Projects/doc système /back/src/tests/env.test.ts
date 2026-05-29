import { describe, expect, it } from "vitest";

import { createEnv } from "../config/env.js";

describe("createEnv", () => {
  it("parses the required backend environment variables", () => {
    const result = createEnv({
      PORT: "4100",
      NODE_ENV: "development",
      MONGODB_URI: "mongodb://localhost:27017/cts",
      CORS_ORIGIN:
        "http://127.0.0.1:5175,https://c646-154-252-4-8.ngrok-free.app",
    });

    expect(result).toEqual({
      PORT: 4100,
      NODE_ENV: "development",
      MONGODB_URI: "mongodb://localhost:27017/cts",
      CORS_ORIGIN:
        "http://127.0.0.1:5175,https://c646-154-252-4-8.ngrok-free.app",
    });
  });

  it("fails when a required variable is missing", () => {
    expect(() =>
      createEnv({
        PORT: "4100",
        NODE_ENV: "development",
        CORS_ORIGIN: "http://127.0.0.1:5175",
      }),
    ).toThrow(/MONGODB_URI/i);
  });
});
