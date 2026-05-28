import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/errors/app-error.js";
import { sendError } from "../lib/http/send-error.js";

export function errorMiddleware(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return sendError(response, error);
  }

  const unexpectedError = new AppError({
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });

  return sendError(response, unexpectedError);
}
