import type { Request, Response } from "express";

import { resolveLocale } from "../../shared/utils/locale.js";
import { getHomeContent } from "./content.service.js";

export async function getHomeContentController(request: Request, response: Response) {
  const locale = resolveLocale(request.query.locale);
  const data = await getHomeContent(locale);

  return response.status(200).json({
    success: true,
    data,
    message: "Home content fetched successfully.",
  });
}
