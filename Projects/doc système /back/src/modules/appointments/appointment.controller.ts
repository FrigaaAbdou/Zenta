import type { Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../../lib/errors/app-error.js";
import { resolveLocale } from "../../shared/utils/locale.js";
import { upsertDonorByPhone } from "../donors/donor.service.js";
import type { AppointmentRequestInput } from "./appointment.mapper.js";
import { mapAppointmentRequestInput } from "./appointment.mapper.js";
import { getAppointmentFormMeta, getAppointmentSlots } from "./appointment-meta.service.js";
import {
  createAppointmentRequest,
  findPendingAppointmentConflict,
} from "./appointment.service.js";
import {
  createAppointmentRequestSchema,
  getAppointmentSlotsQuerySchema,
} from "./appointment.schema.js";

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

export function getAppointmentFormMetaController(
  request: Request,
  response: Response,
) {
  const locale = resolveLocale(request.query.locale);
  const data = getAppointmentFormMeta(locale);

  return response.status(200).json({
    success: true,
    data,
    message: "Appointment form metadata fetched successfully.",
  });
}

export async function getAppointmentSlotsController(
  request: Request,
  response: Response,
) {
  const result = getAppointmentSlotsQuerySchema.safeParse(request.query);

  if (!result.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Invalid appointment slot query.",
      details: createFieldErrors(result.error),
    });
  }

  const data = await getAppointmentSlots(result.data.date);

  return response.status(200).json({
    success: true,
    data,
    message: "Appointment slots fetched successfully.",
  });
}

function isEligibilityChecklistFullyPositive(input: AppointmentRequestInput) {
  return Object.values(input.eligibilityChecklist).every(Boolean);
}

export async function createAppointmentRequestController(
  request: Request,
  response: Response,
) {
  const result = createAppointmentRequestSchema.safeParse(
    request.body,
  ) as { success: true; data: AppointmentRequestInput } | { success: false; error: ZodError };

  if (!result.success) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Appointment request payload is invalid.",
      details: createFieldErrors(result.error),
    });
  }

  if (!isEligibilityChecklistFullyPositive(result.data)) {
    throw new AppError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Appointment request payload is invalid.",
      details: {
        eligibilityChecklist: "All eligibility checklist confirmations must be true.",
      },
    });
  }

  const { donor, appointment } = mapAppointmentRequestInput(result.data);
  const persistedDonor = await upsertDonorByPhone(donor);
  const donorId = String(persistedDonor._id);

  const conflict = await findPendingAppointmentConflict({
    donorId,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
  });

  if (conflict) {
    throw new AppError({
      statusCode: 409,
      code: "SLOT_UNAVAILABLE",
      message: "Le creneau selectionne n'est plus disponible.",
      details: {
        appointmentTime: "Veuillez choisir un autre horaire.",
      },
    });
  }

  const slotAvailability = await getAppointmentSlots(
    appointment.appointmentDate,
  );
  const selectedSlot = slotAvailability.slots.find(
    (slot) => slot.value === appointment.appointmentTime,
  );

  if (!selectedSlot || !selectedSlot.isAvailable) {
    throw new AppError({
      statusCode: 409,
      code: "SLOT_UNAVAILABLE",
      message: "Le creneau selectionne n'est plus disponible.",
      details: {
        appointmentTime: "Veuillez choisir un autre horaire.",
      },
    });
  }

  const createdAppointment = await createAppointmentRequest({
    donorId,
    ...appointment,
  });

  return response.status(201).json({
    success: true,
    data: {
      id: String(createdAppointment._id),
      status: createdAppointment.status,
      appointmentDate: createdAppointment.appointmentDate,
      appointmentTime: createdAppointment.appointmentTime,
      createdAt: createdAppointment.createdAt.toISOString(),
    },
    message: "Votre demande a bien ete enregistree.",
  });
}
