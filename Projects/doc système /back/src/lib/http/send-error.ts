import type { Response } from "express";

import { AppError } from "../errors/app-error.js";

export function sendError(response: Response, error: AppError) {
  const payload = {
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  } as {
    error: {
      code: string;
      message: string;
      details: unknown;
    };
    fieldErrors?: Record<string, string>;
  };

  if (
    error.code === "VALIDATION_ERROR" &&
    error.details &&
    typeof error.details === "object" &&
    !Array.isArray(error.details)
  ) {
    payload.fieldErrors = error.details as Record<string, string>;
  }

  return response.status(error.statusCode).json(payload);
}
