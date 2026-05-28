import type { Request, Response } from "express";

import { resolveLocale } from "../../shared/utils/locale.js";
import { getPublishedFaq } from "./faq.service.js";

export async function getFaqController(request: Request, response: Response) {
  const locale = resolveLocale(request.query.locale);
  const category =
    typeof request.query.category === "string" && request.query.category.length > 0
      ? request.query.category
      : undefined;

  const items = await getPublishedFaq({ locale, category });

  return response.status(200).json({
    success: true,
    data: {
      items,
    },
    message: "FAQ fetched successfully.",
  });
}
