import { z } from "zod";

export const appointmentFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "Le prénom est requis."),
    lastName: z.string().trim().min(1, "Le nom est requis."),
    birthDate: z.string().min(1, "La date de naissance est requise."),
    gender: z.enum(["male", "female"], {
      message: "Le sexe est requis.",
    }),
    phone: z.string().trim().min(1, "Le numéro de téléphone est requis."),
    email: z.union([
      z.literal(""),
      z.string().trim().email("Adresse e-mail invalide."),
    ]),
    wilayaCode: z.string().min(1, "La wilaya est requise."),
    commune: z.string().trim().min(1, "La commune est requise."),
    campaignCode: z.string().optional(),
    appointmentDate: z.string().min(1, "La date du rendez-vous est requise."),
    appointmentTime: z.string().min(1, "L'heure du rendez-vous est requise."),
    bloodGroup: z.string().min(1, "Le groupe sanguin est requis."),
    donationType: z.string().min(1, "Le type de don est requis."),
    isExistingDonor: z.boolean(),
    lastDonationDate: z.string().optional(),
    remarks: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isExistingDonor && !data.lastDonationDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lastDonationDate"],
        message:
          "La date du dernier don est requise pour un donneur existant.",
      });
    }
  });

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
