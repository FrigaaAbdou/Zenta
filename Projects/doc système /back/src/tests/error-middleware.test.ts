import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { AppError } from "../lib/errors/app-error.js";
import { errorMiddleware } from "../middlewares/error.middleware.js";
import { notFoundMiddleware } from "../middlewares/not-found.middleware.js";

describe("error middleware", () => {
  it("serializes AppError instances into a consistent JSON payload", async () => {
    const app = express();

    app.get("/boom", (_request, _response, next) => {
      next(
        new AppError({
          statusCode: 422,
          code: "VALIDATION_ERROR",
          message: "Payload is invalid",
          details: {
            field: "phone",
          },
        }),
      );
    });

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    const response = await request(app).get("/boom");

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Payload is invalid",
        details: {
          field: "phone",
        },
      },
      fieldErrors: {
        field: "phone",
      },
    });
  });
});
