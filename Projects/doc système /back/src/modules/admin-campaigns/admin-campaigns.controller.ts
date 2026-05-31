import type { Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../../lib/errors/app-error.js";
import {
  createAdminCampaign,
  listAdminCampaigns,
  updateAdminCampaign,
} from "../campaigns/campaign.service.js";
import {
  adminCampaignCreateSchema,
  adminCampaignUpdateSchema,
} from "./admin-campaigns.schema.js";

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

export async function listAdminCampaignsController(_request: Request, response: Response) {
  const items = await listAdminCampaigns();

  return response.status(200).json({
    success: true,
    data: { items },
    message: "Admin campaigns fetched successfully.",
  });
}

export async function createAdminCampaignController(request: Request, response: Response) {
  const parsedBody = adminCampaignCreateSchema.safeParse(request.body);

  if (!parsedBody.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin campaign payload is invalid.",
      details: createFieldErrors(parsedBody.error),
    });
  }

  const item = await createAdminCampaign(parsedBody.data);

  return response.status(201).json({
    success: true,
    data: { item },
    message: "Admin campaign created successfully.",
  });
}

export async function updateAdminCampaignController(
  request: Request<{ id: string }>,
  response: Response,
) {
  const parsedBody = adminCampaignUpdateSchema.safeParse(request.body);

  if (!parsedBody.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin campaign payload is invalid.",
      details: createFieldErrors(parsedBody.error),
    });
  }

  const item = await updateAdminCampaign(request.params.id, parsedBody.data);

  return response.status(200).json({
    success: true,
    data: { item },
    message: "Admin campaign updated successfully.",
  });
}
