import { z } from "zod";

const isoDateTimeSchema = z.string().datetime({ offset: true });

const localizedCampaignContentSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  ctaLabel: z.string().trim().min(1),
});

export const adminCampaignCreateSchema = z.object({
  code: z.string().trim().min(3).max(64),
  status: z.string().trim().min(1).max(32),
  isPublished: z.boolean(),
  isActive: z.boolean(),
  priority: z.number().int().min(0).max(999).default(0),
  badgeLabel: z.string().trim().max(120).default(""),
  theme: z.string().trim().max(64).default("default"),
  startDate: z.union([isoDateTimeSchema, z.null()]).optional(),
  endDate: z.union([isoDateTimeSchema, z.null()]).optional(),
  localeContent: z.object({
    fr: localizedCampaignContentSchema,
    ar: localizedCampaignContentSchema.nullable().optional(),
  }),
});

export const adminCampaignUpdateSchema = adminCampaignCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field must be provided.",
  },
);
