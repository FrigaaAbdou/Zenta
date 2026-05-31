import type { Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../../lib/errors/app-error.js";
import {
  getAdminAppointmentById,
  listAdminAppointments,
  updateAdminAppointmentStatus,
} from "../appointments/appointment.service.js";
import {
  adminAppointmentsListQuerySchema,
  adminAppointmentStatusUpdateSchema,
} from "./admin-appointments.schema.js";

function getAppointmentIdParam(request: Request<{ id: string }>) {
  return request.params.id;
}

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

export async function listAdminAppointmentsController(
  request: Request,
  response: Response,
) {
  const parsedQuery = adminAppointmentsListQuerySchema.safeParse(request.query);

  if (!parsedQuery.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin appointment list query is invalid.",
      details: createFieldErrors(parsedQuery.error),
    });
  }

  const data = await listAdminAppointments(parsedQuery.data);

  return response.status(200).json({
    success: true,
    data,
    message: "Admin appointments fetched successfully.",
  });
}

export async function getAdminAppointmentByIdController(
  request: Request<{ id: string }>,
  response: Response,
) {
  const data = await getAdminAppointmentById(getAppointmentIdParam(request));

  return response.status(200).json({
    success: true,
    data,
    message: "Admin appointment fetched successfully.",
  });
}

export async function updateAdminAppointmentStatusController(
  request: Request<{ id: string }>,
  response: Response,
) {
  const parsedBody = adminAppointmentStatusUpdateSchema.safeParse(request.body);

  if (!parsedBody.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Admin appointment status payload is invalid.",
      details: createFieldErrors(parsedBody.error),
    });
  }

  if (!request.admin) {
    throw new AppError({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Admin authentication is required",
    });
  }

  const data = await updateAdminAppointmentStatus({
    appointmentId: getAppointmentIdParam(request),
    nextStatus: parsedBody.data.status,
    actorRole: request.admin.role,
  });

  return response.status(200).json({
    success: true,
    data,
    message: "Admin appointment status updated successfully.",
  });
}
