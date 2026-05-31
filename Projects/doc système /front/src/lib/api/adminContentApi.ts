import { apiRequest } from "@/lib/api/client";

export type AdminHomeContentLocale = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
  impact: {
    sectionLabel: string;
    title: string;
    description: string;
    stats: Array<{ label: string; value: string }>;
  };
  eligibilityPreview: {
    sectionLabel: string;
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  ctaBanner: {
    title: string;
    description: string;
    ctaLabel: string;
  };
  process: {
    sectionLabel: string;
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  sections: Array<{ key: string; title: string }>;
  support: {
    label: string;
    phone: string;
  };
  footer: {
    organization: string;
    institution: string;
    address: string;
    phone: string;
    email: string;
  };
};

export type AdminContentItem = {
  id: string;
  key: string;
  localeContent: {
    fr: AdminHomeContentLocale;
    ar: AdminHomeContentLocale;
  };
};

type AdminContentListResponse = {
  data: {
    items: AdminContentItem[];
  };
};

type AdminContentMutationResponse = {
  data: {
    item: AdminContentItem;
  };
};

function createAdminHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function listAdminContent(token: string) {
  const payload = await apiRequest<AdminContentListResponse>("/api/admin/content", {
    headers: createAdminHeaders(token),
  });

  return payload.data.items;
}

export async function updateAdminContent(
  token: string,
  key: string,
  localeContent: Partial<Record<"fr" | "ar", Partial<AdminHomeContentLocale>>>,
) {
  const payload = await apiRequest<AdminContentMutationResponse>(
    `/api/admin/content/${key}`,
    {
      method: "PATCH",
      headers: createAdminHeaders(token),
      body: JSON.stringify({ localeContent }),
    },
  );

  return payload.data.item;
}
