import type { Request, Response } from "express";

import { AppError } from "../../lib/errors/app-error.js";
import { adminLoginSchema } from "./admin-auth.schema.js";
import { loginAdmin } from "./admin-auth.service.js";

export async function loginAdminController(request: Request, response: Response) {
  const parsedBody = adminLoginSchema.safeParse(request.body);

  if (!parsedBody.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin login payload is invalid.",
      details: Object.fromEntries(
        parsedBody.error.issues.map((issue) => [String(issue.path[0] ?? "root"), issue.message]),
      ),
    });
  }

  const session = await loginAdmin(parsedBody.data.email, parsedBody.data.password);

  response.status(200).json(session);
}

export async function getAdminMeController(request: Request, response: Response) {
  response.status(200).json({ admin: request.admin });
}

export async function logoutAdminController(_request: Request, response: Response) {
  response.status(204).send();
}
