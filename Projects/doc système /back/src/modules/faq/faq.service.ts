import mongoose from "mongoose";

import type { SupportedLocale } from "../../shared/constants/locales.js";
import { FAQEntryModel } from "./faq.model.js";

type GetFaqOptions = {
  locale: SupportedLocale;
  category?: string;
};

export async function getPublishedFaq({ locale, category }: GetFaqOptions) {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }

  const filters: Record<string, unknown> = { isPublished: true };

  if (category) {
    filters.category = category;
  }

  const documents = await FAQEntryModel.find(filters).sort({ order: 1 }).lean();

  return documents
    .map((document) => {
      const localizedContent =
        document.localeContent?.[locale] ?? document.localeContent?.fr ?? null;

      return {
        id: String(document._id),
        slug: document.slug,
        question: localizedContent?.question ?? "",
        answer: localizedContent?.answer ?? "",
        category: document.category,
        order: document.order,
      };
    })
    .filter((item) => item.question && item.answer);
}
