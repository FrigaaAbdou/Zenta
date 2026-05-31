import type { Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../../lib/errors/app-error.js";
import {
  closeAdminCalendarDay,
  createAdminCalendarSlotOverride,
  getAdminCalendarDay,
  getAdminCalendarMonth,
  listAdminCalendarTemplates,
  reopenAdminCalendarDay,
  replaceAdminCalendarTemplates,
  updateAdminCalendarSlotOverride,
} from "../appointments/appointment-slot.service.js";
import {
  adminCalendarDayActionSchema,
  adminCalendarDayQuerySchema,
  adminCalendarMonthQuerySchema,
  adminCalendarSlotCreateSchema,
  adminCalendarSlotUpdateSchema,
  adminCalendarTemplatesReplaceSchema,
} from "./admin-calendar.schema.js";

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

export async function getAdminCalendarMonthController(
  request: Request,
  response: Response,
) {
  const parsedQuery = adminCalendarMonthQuerySchema.safeParse(request.query);

  if (!parsedQuery.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin calendar month query is invalid.",
      details: createFieldErrors(parsedQuery.error),
    });
  }

  const data = await getAdminCalendarMonth(parsedQuery.data.month);

  return response.status(200).json({
    success: true,
    data,
    message: "Admin calendar month fetched successfully.",
  });
}

export async function getAdminCalendarDayController(
  request: Request,
  response: Response,
) {
  const parsedQuery = adminCalendarDayQuerySchema.safeParse(request.query);

  if (!parsedQuery.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin calendar day query is invalid.",
      details: createFieldErrors(parsedQuery.error),
    });
  }

  const data = await getAdminCalendarDay(parsedQuery.data.date);

  return response.status(200).json({
    success: true,
    data,
    message: "Admin calendar day fetched successfully.",
  });
}

export async function createAdminCalendarSlotController(
  request: Request,
  response: Response,
) {
  const parsedBody = adminCalendarSlotCreateSchema.safeParse(request.body);

  if (!parsedBody.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin calendar slot payload is invalid.",
      details: createFieldErrors(parsedBody.error),
    });
  }

  const item = await createAdminCalendarSlotOverride(parsedBody.data);

  return response.status(201).json({
    success: true,
    data: { item },
    message: "Admin calendar slot created successfully.",
  });
}

export async function updateAdminCalendarSlotController(
  request: Request<{ id: string }>,
  response: Response,
) {
  const parsedBody = adminCalendarSlotUpdateSchema.safeParse(request.body);

  if (!parsedBody.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin calendar slot payload is invalid.",
      details: createFieldErrors(parsedBody.error),
    });
  }

  const item = await updateAdminCalendarSlotOverride(request.params.id, parsedBody.data);

  return response.status(200).json({
    success: true,
    data: { item },
    message: "Admin calendar slot updated successfully.",
  });
}

export async function closeAdminCalendarDayController(
  request: Request,
  response: Response,
) {
  const parsedBody = adminCalendarDayActionSchema.safeParse(request.body);

  if (!parsedBody.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin calendar day payload is invalid.",
      details: createFieldErrors(parsedBody.error),
    });
  }

  const data = await closeAdminCalendarDay(parsedBody.data);

  return response.status(200).json({
    success: true,
    data,
    message: "Admin calendar day closed successfully.",
  });
}

export async function reopenAdminCalendarDayController(
  request: Request,
  response: Response,
) {
  const parsedBody = adminCalendarDayActionSchema.safeParse(request.body);

  if (!parsedBody.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin calendar day payload is invalid.",
      details: createFieldErrors(parsedBody.error),
    });
  }

  const data = await reopenAdminCalendarDay(parsedBody.data.date);

  return response.status(200).json({
    success: true,
    data,
    message: "Admin calendar day reopened successfully.",
  });
}

export async function listAdminCalendarTemplatesController(
  _request: Request,
  response: Response,
) {
  const data = await listAdminCalendarTemplates();

  return response.status(200).json({
    success: true,
    data,
    message: "Admin calendar templates fetched successfully.",
  });
}

export async function replaceAdminCalendarTemplatesController(
  request: Request,
  response: Response,
) {
  const parsedBody = adminCalendarTemplatesReplaceSchema.safeParse(request.body);

  if (!parsedBody.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin calendar templates payload is invalid.",
      details: createFieldErrors(parsedBody.error),
    });
  }

  const data = await replaceAdminCalendarTemplates(parsedBody.data.items);

  return response.status(200).json({
    success: true,
    data,
    message: "Admin calendar templates replaced successfully.",
  });
}
