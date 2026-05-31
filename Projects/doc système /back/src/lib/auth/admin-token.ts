import type { Request } from "express";

import { AppError } from "../errors/app-error.js";
import {
  extractBearerToken,
  getAuthenticatedAdminFromToken,
  type AuthenticatedAdmin,
} from "../../modules/admin-auth/admin-auth.service.js";

function createUnauthorizedError(message = "Admin authentication is required") {
  return new AppError({
    statusCode: 401,
    code: "UNAUTHORIZED",
    message,
  });
}

export function getAdminBearerToken(request: Request) {
  return extractBearerToken(request.header("authorization"));
}

export async function authenticateAdminRequest(request: Request): Promise<AuthenticatedAdmin> {
  const token = getAdminBearerToken(request);

  if (!token) {
    throw createUnauthorizedError();
  }

  return getAuthenticatedAdminFromToken(token);
}
