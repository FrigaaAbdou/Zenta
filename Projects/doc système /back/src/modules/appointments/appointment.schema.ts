import { z } from "zod";

import { BLOOD_GROUPS } from "./appointment.constants.js";
import { isAdultBirthDate } from "./appointment-age.js";

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD.");

export const getAppointmentSlotsQuerySchema = z.object({
  date: dateStringSchema,
  campaignCode: z.string().trim().optional(),
});

export const createAppointmentRequestSchema = z
  .object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    birthDate: dateStringSchema,
    gender: z.enum(["male", "female"]),
    phone: z.string().trim().min(1),
    email: z.string().trim().email().or(z.literal("")).optional(),
    wilayaCode: z.string().trim().min(1),
    commune: z.string().trim().min(1),
    bloodGroup: z.enum(BLOOD_GROUPS),
    campaignCode: z.string().trim().optional(),
    appointmentDate: dateStringSchema,
    appointmentTime: z.string().trim().min(1),
    donationType: z.enum(["whole_blood", "plasma", "platelets"]),
    isExistingDonor: z.boolean(),
    lastDonationDate: dateStringSchema.optional(),
    eligibilityChecklist: z.object({
      ageConfirmed: z.boolean(),
      weightConfirmed: z.boolean(),
      healthyConfirmed: z.boolean(),
      noContraIndicationConfirmed: z.boolean(),
    }),
    remarks: z.string().optional(),
    locale: z.enum(["fr", "ar"]),
    wilayaLabel: z.string().optional(),
  })
  .superRefine((data, context) => {
    if (!isAdultBirthDate(data.birthDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDate"],
        message:
          "The donor must be at least 18 years old to request an appointment.",
      });
    }

    if (data.isExistingDonor && !data.lastDonationDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lastDonationDate"],
        message: "Last donation date is required for existing donors.",
      });
    }
  });
