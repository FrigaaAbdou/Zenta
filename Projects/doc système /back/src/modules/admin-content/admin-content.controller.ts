import type { Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../../lib/errors/app-error.js";
import {
  listAdminSiteContent,
  updateAdminSiteContentByKey,
} from "../content/content.service.js";
import { adminSiteContentUpdateSchema } from "./admin-content.schema.js";

function createFieldErrors(error: ZodError) {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".");
    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

export async function listAdminContentController(_request: Request, response: Response) {
  const items = await listAdminSiteContent();

  return response.status(200).json({
    success: true,
    data: { items },
    message: "Admin site content fetched successfully.",
  });
}

export async function updateAdminContentController(
  request: Request<{ id: string }>,
  response: Response,
) {
  const parsedBody = adminSiteContentUpdateSchema.safeParse(request.body);

  if (!parsedBody.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin site content payload is invalid.",
      details: createFieldErrors(parsedBody.error),
    });
  }

  const item = await updateAdminSiteContentByKey(
    request.params.id,
    parsedBody.data.localeContent,
  );

  return response.status(200).json({
    success: true,
    data: { item },
    message: "Admin site content updated successfully.",
  });
}
