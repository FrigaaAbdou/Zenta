import type { NextFunction, Request, Response } from "express";

import { authenticateAdminRequest } from "../lib/auth/admin-token.js";

export async function requireAdminAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  try {
    request.admin = await authenticateAdminRequest(request);
    next();
  } catch (error) {
    next(error);
  }
}
