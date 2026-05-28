import { apiRequest } from "@/lib/api/client";
import type { FaqApiResponse, FaqItem } from "@/features/home/types";

export async function getFaq(locale: "fr" | "ar" = "fr"): Promise<FaqItem[]> {
  const payload = await apiRequest<FaqApiResponse>(
    `/api/public/faq?locale=${locale}`,
  );

  return payload.data.items.filter(
    (item) => item.question?.trim() && item.answer?.trim(),
  );
}
