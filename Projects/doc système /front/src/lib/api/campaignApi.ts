import { apiRequest } from "@/lib/api/client";
import type {
  CampaignApiResponse,
  CampaignItem,
  FeaturedCampaignApiResponse,
} from "@/features/home/types";

function isRenderableCampaign(item: CampaignItem | null | undefined): item is CampaignItem {
  return Boolean(item?.code && item?.title?.trim() && item?.ctaLabel?.trim());
}

export async function getActiveCampaigns(
  locale: "fr" | "ar" = "fr",
): Promise<CampaignItem[]> {
  const payload = await apiRequest<CampaignApiResponse>(
    `/api/public/campaigns/active?locale=${locale}`,
  );

  return payload.data.items.filter(isRenderableCampaign);
}

export async function getFeaturedCampaign(
  locale: "fr" | "ar" = "fr",
): Promise<CampaignItem | null> {
  const payload = await apiRequest<FeaturedCampaignApiResponse>(
    `/api/public/campaigns/featured?locale=${locale}`,
  );

  return isRenderableCampaign(payload.data.item) ? payload.data.item : null;
}
