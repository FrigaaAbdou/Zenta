import type { Request, Response } from "express";

import { resolveLocale } from "../../shared/utils/locale.js";
import {
  getActiveCampaigns,
  getCampaignByCode,
  getFeaturedCampaign,
} from "./campaign.service.js";

export async function getActiveCampaignsController(
  request: Request,
  response: Response,
) {
  const locale = resolveLocale(request.query.locale);
  const items = await getActiveCampaigns(locale);

  return response.status(200).json({
    success: true,
    data: {
      items,
    },
    message: "Active campaigns fetched successfully.",
  });
}

export async function getFeaturedCampaignController(
  request: Request,
  response: Response,
) {
  const locale = resolveLocale(request.query.locale);
  const item = await getFeaturedCampaign(locale);

  return response.status(200).json({
    success: true,
    data: {
      item,
    },
    message: "Featured campaign fetched successfully.",
  });
}

export async function getCampaignByCodeController(
  request: Request,
  response: Response,
) {
  const locale = resolveLocale(request.query.locale);
  const code = Array.isArray(request.params.code)
    ? request.params.code[0]
    : request.params.code;
  const item = await getCampaignByCode(code, locale);

  return response.status(200).json({
    success: true,
    data: {
      item,
    },
    message: "Campaign fetched successfully.",
  });
}
