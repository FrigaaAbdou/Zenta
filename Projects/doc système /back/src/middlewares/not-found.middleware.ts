import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/errors/app-error.js";

export function notFoundMiddleware(
  _request: Request,
  _response: Response,
  next: NextFunction,
) {
  next(
    new AppError({
      statusCode: 404,
      code: "NOT_FOUND",
      message: "Route not found",
    }),
  );
}
