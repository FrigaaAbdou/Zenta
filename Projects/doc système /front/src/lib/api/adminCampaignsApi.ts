import { apiRequest } from "@/lib/api/client";

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
    fr: {
      title: string;
      description: string;
      ctaLabel: string;
    };
    ar: {
      title: string;
      description: string;
      ctaLabel: string;
    } | null;
  };
};

export type AdminCampaignPayload = {
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
    fr: {
      title: string;
      description: string;
      ctaLabel: string;
    };
    ar: {
      title: string;
      description: string;
      ctaLabel: string;
    } | null;
  };
};

type AdminCampaignsResponse = {
  data: {
    items: AdminCampaignItem[];
  };
};

type AdminCampaignMutationResponse = {
  data: {
    item: AdminCampaignItem;
  };
};

function createAdminHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function listAdminCampaigns(token: string) {
  const payload = await apiRequest<AdminCampaignsResponse>("/api/admin/campaigns", {
    headers: createAdminHeaders(token),
  });

  return payload.data.items;
}

export async function createAdminCampaign(
  token: string,
  input: AdminCampaignPayload,
) {
  const payload = await apiRequest<AdminCampaignMutationResponse>("/api/admin/campaigns", {
    method: "POST",
    headers: createAdminHeaders(token),
    body: JSON.stringify(input),
  });

  return payload.data.item;
}

export async function updateAdminCampaign(
  token: string,
  id: string,
  input: Partial<AdminCampaignPayload>,
) {
  const payload = await apiRequest<AdminCampaignMutationResponse>(
    `/api/admin/campaigns/${id}`,
    {
      method: "PATCH",
      headers: createAdminHeaders(token),
      body: JSON.stringify(input),
    },
  );

  return payload.data.item;
}
