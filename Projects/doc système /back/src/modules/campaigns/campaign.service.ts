import mongoose from "mongoose";

import { AppError } from "../../lib/errors/app-error.js";
import type { SupportedLocale } from "../../shared/constants/locales.js";
import { DonationCampaignModel } from "./campaign.model.js";

type CampaignLocaleContent = {
  title: string;
  description: string;
  ctaLabel: string;
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
