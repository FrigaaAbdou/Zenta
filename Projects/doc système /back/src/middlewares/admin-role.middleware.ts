import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/errors/app-error.js";
import type { AdminRole } from "../modules/admin-auth/admin-user.model.js";

export function requireAdminRole(...allowedRoles: AdminRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.admin) {
      next(
        new AppError({
          statusCode: 401,
          code: "UNAUTHORIZED",
          message: "Admin authentication is required",
        }),
      );
      return;
    }

    if (!allowedRoles.includes(request.admin.role)) {
      next(
        new AppError({
          statusCode: 403,
          code: "FORBIDDEN",
          message: "You do not have permission to access this admin resource",
        }),
      );
      return;
    }

    next();
  };
}
