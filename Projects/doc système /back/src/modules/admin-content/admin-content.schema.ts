import { z } from "zod";

const statsItemSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

const listCardItemSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

const homeSectionSchema = z.object({
  key: z.string().trim().min(1),
  title: z.string().trim().min(1),
});

const localizedHomeContentSchema = z.object({
  hero: z
    .object({
      eyebrow: z.string().trim().min(1),
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      primaryCtaLabel: z.string().trim().min(1),
      secondaryCtaLabel: z.string().trim().min(1),
    })
    .partial()
    .optional(),
  impact: z
    .object({
      sectionLabel: z.string().trim().min(1),
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      stats: z.array(statsItemSchema).min(1),
    })
    .partial()
    .optional(),
  eligibilityPreview: z
    .object({
      sectionLabel: z.string().trim().min(1),
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      items: z.array(listCardItemSchema).min(1),
    })
    .partial()
    .optional(),
  ctaBanner: z
    .object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      ctaLabel: z.string().trim().min(1),
    })
    .partial()
    .optional(),
  process: z
    .object({
      sectionLabel: z.string().trim().min(1),
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      items: z.array(listCardItemSchema).min(1),
    })
    .partial()
    .optional(),
  sections: z.array(homeSectionSchema).optional(),
  support: z
    .object({
      label: z.string().trim().min(1),
      phone: z.string().trim().min(1),
    })
    .partial()
    .optional(),
  footer: z
    .object({
      organization: z.string().trim().min(1),
      institution: z.string().trim().min(1),
      address: z.string().trim().min(1),
      phone: z.string().trim().min(1),
      email: z.string().trim().min(1),
    })
    .partial()
    .optional(),
});

export const adminSiteContentUpdateSchema = z
  .object({
    localeContent: z
      .object({
        fr: localizedHomeContentSchema.optional(),
        ar: localizedHomeContentSchema.optional(),
      })
      .refine((value) => Boolean(value.fr || value.ar), {
        message: "At least one locale payload must be provided.",
      }),
  })
  .strict();
