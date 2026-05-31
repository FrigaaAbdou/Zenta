import mongoose from "mongoose";

import { AppError } from "../../lib/errors/app-error.js";
import type { SupportedLocale } from "../../shared/constants/locales.js";
import { DonationCampaignModel } from "./campaign.model.js";

type CampaignLocaleContent = {
  title: string;
  description: string;
  ctaLabel: string;
};

export type AdminCampaignPayload = {
  code: string;
  status: string;
  isPublished: boolean;
  isActive: boolean;
  priority: number;
  badgeLabel: string;
  theme: string;
  startDate?: string | null;
  endDate?: string | null;
  localeContent: {
    fr: CampaignLocaleContent;
    ar?: CampaignLocaleContent | null;
  };
};

export type AdminCampaignItem = {
  id: string;
  code: string;
  status: string;
  isPublished: boolean;
  isActive: boolean;
  priority: number;
  badgeLabel: string;
  theme: string;
  startDate: string | null;
  endDate: string | null;
  localeContent: {
    fr: CampaignLocaleContent;
    ar: CampaignLocaleContent | null;
  };
};

type CampaignDocumentShape = {
  _id: unknown;
  code: string;
  status: string;
  isPublished: boolean;
  isActive: boolean;
  priority?: number | null;
  badgeLabel?: string | null;
  theme?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  localeContent?: Partial<Record<SupportedLocale, CampaignLocaleContent | null>>;
};

function buildActiveCampaignFilter() {
  const now = new Date();

  return {
    isPublished: true,
    isActive: true,
    $and: [
      {
        $or: [{ startDate: null }, { startDate: { $lte: now } }],
      },
      {
        $or: [{ endDate: null }, { endDate: { $gte: now } }],
      },
    ],
  };
}

function resolveCampaignLocaleContent(
  document: CampaignDocumentShape,
  locale: SupportedLocale,
) {
  return document.localeContent?.[locale] ?? document.localeContent?.fr ?? null;
}

function serializeCampaign(
  document: CampaignDocumentShape,
  locale: SupportedLocale,
) {
  const content = resolveCampaignLocaleContent(document, locale);

  return {
    id: String(document._id),
    code: document.code,
    title: content?.title ?? "",
    description: content?.description ?? "",
    status: document.status,
    startDate: document.startDate?.toISOString() ?? null,
    endDate: document.endDate?.toISOString() ?? null,
    ctaLabel: content?.ctaLabel ?? "",
    badgeLabel: document.badgeLabel ?? "",
    theme: document.theme ?? "default",
    priority: document.priority ?? 0,
  };
}

function serializeAdminCampaign(document: CampaignDocumentShape): AdminCampaignItem {
  return {
    id: String(document._id),
    code: document.code,
    status: document.status,
    isPublished: document.isPublished,
    isActive: document.isActive,
    priority: document.priority ?? 0,
    badgeLabel: document.badgeLabel ?? "",
    theme: document.theme ?? "default",
    startDate: document.startDate?.toISOString() ?? null,
    endDate: document.endDate?.toISOString() ?? null,
    localeContent: {
      fr: {
        title: document.localeContent?.fr?.title ?? "",
        description: document.localeContent?.fr?.description ?? "",
        ctaLabel: document.localeContent?.fr?.ctaLabel ?? "",
      },
      ar: document.localeContent?.ar
        ? {
            title: document.localeContent.ar.title,
            description: document.localeContent.ar.description,
            ctaLabel: document.localeContent.ar.ctaLabel,
          }
        : null,
    },
  };
}

function normalizeCampaignPayload(input: AdminCampaignPayload) {
  return {
    code: input.code.trim().toUpperCase(),
    status: input.status.trim(),
    isPublished: input.isPublished,
    isActive: input.isActive,
    priority: input.priority,
    badgeLabel: input.badgeLabel.trim(),
    theme: input.theme.trim() || "default",
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
    localeContent: {
      fr: {
        title: input.localeContent.fr.title.trim(),
        description: input.localeContent.fr.description.trim(),
        ctaLabel: input.localeContent.fr.ctaLabel.trim(),
      },
      ar: input.localeContent.ar
        ? {
            title: input.localeContent.ar.title.trim(),
            description: input.localeContent.ar.description.trim(),
            ctaLabel: input.localeContent.ar.ctaLabel.trim(),
          }
        : null,
    },
  };
}

function createCampaignNotFoundError() {
  return new AppError({
    statusCode: 404,
    code: "CAMPAIGN_NOT_FOUND",
    message: "Campaign not found.",
  });
}

function createCampaignCodeConflictError() {
  return new AppError({
    statusCode: 409,
    code: "CAMPAIGN_CODE_ALREADY_EXISTS",
    message: "A campaign with this code already exists.",
  });
}

export async function getActiveCampaigns(locale: SupportedLocale) {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }

  const documents = await DonationCampaignModel.find(buildActiveCampaignFilter())
    .sort({ priority: -1, startDate: -1, createdAt: -1 })
    .lean();

  return documents.map((document) =>
    serializeCampaign(document as CampaignDocumentShape, locale),
  );
}

export async function getFeaturedCampaign(locale: SupportedLocale) {
  const items = await getActiveCampaigns(locale);

  return items[0] ?? null;
}

export async function getCampaignByCode(code: string, locale: SupportedLocale) {
  if (mongoose.connection.readyState !== 1) {
    return null;
  }

  const document = await DonationCampaignModel.findOne({ code }).lean();

  if (!document) {
    throw new AppError({
      statusCode: 404,
      code: "CAMPAIGN_NOT_FOUND",
      message: "Campaign not found.",
    });
  }

  return serializeCampaign(document as CampaignDocumentShape, locale);
}

export async function listAdminCampaigns() {
  const documents = await DonationCampaignModel.find({})
    .sort({ priority: -1, startDate: -1, createdAt: -1 })
    .lean();

  return documents.map((document) =>
    serializeAdminCampaign(document as CampaignDocumentShape),
  );
}

export async function createAdminCampaign(input: AdminCampaignPayload) {
  const payload = normalizeCampaignPayload(input);

  const existing = await DonationCampaignModel.findOne({ code: payload.code }).exec();

  if (existing) {
    throw createCampaignCodeConflictError();
  }

  const document = await DonationCampaignModel.create(payload);

  return serializeAdminCampaign(document.toObject() as CampaignDocumentShape);
}

export async function updateAdminCampaign(id: string, input: Partial<AdminCampaignPayload>) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createCampaignNotFoundError();
  }

  const document = await DonationCampaignModel.findById(id).exec();

  if (!document) {
    throw createCampaignNotFoundError();
  }

  const current = document.toObject() as CampaignDocumentShape;
  const merged = normalizeCampaignPayload({
    code: input.code ?? current.code,
    status: input.status ?? current.status,
    isPublished: input.isPublished ?? current.isPublished,
    isActive: input.isActive ?? current.isActive,
    priority: input.priority ?? current.priority ?? 0,
    badgeLabel: input.badgeLabel ?? current.badgeLabel ?? "",
    theme: input.theme ?? current.theme ?? "default",
    startDate:
      input.startDate !== undefined
        ? input.startDate
        : current.startDate?.toISOString() ?? null,
    endDate:
      input.endDate !== undefined ? input.endDate : current.endDate?.toISOString() ?? null,
    localeContent: {
      fr: {
        title: input.localeContent?.fr?.title ?? current.localeContent?.fr?.title ?? "",
        description:
          input.localeContent?.fr?.description ?? current.localeContent?.fr?.description ?? "",
        ctaLabel: input.localeContent?.fr?.ctaLabel ?? current.localeContent?.fr?.ctaLabel ?? "",
      },
      ar:
        input.localeContent?.ar !== undefined
          ? input.localeContent.ar
          : current.localeContent?.ar ?? null,
    },
  });

  if (merged.code !== current.code) {
    const duplicate = await DonationCampaignModel.findOne({
      code: merged.code,
      _id: { $ne: document._id },
    }).exec();

    if (duplicate) {
      throw createCampaignCodeConflictError();
    }
  }

  document.code = merged.code;
  document.status = merged.status;
  document.isPublished = merged.isPublished;
  document.isActive = merged.isActive;
  document.priority = merged.priority;
  document.badgeLabel = merged.badgeLabel;
  document.theme = merged.theme;
  document.startDate = merged.startDate;
  document.endDate = merged.endDate;
  document.localeContent = merged.localeContent;

  await document.save();

  return serializeAdminCampaign(document.toObject() as CampaignDocumentShape);
}
