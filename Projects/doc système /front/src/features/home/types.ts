export type HomePageContent = {
  hero: {
    campaignLabel: string;
    title: string;
    description: string;
    ctaLabel: string;
  };
  impact: {
    sectionLabel: string;
    title: string;
    description: string;
    stats: Array<{
      label: string;
      value: string;
    }>;
  };
  eligibilityPreview: {
    sectionLabel: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
    }>;
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
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  support: {
    label: string;
    phone: string;
    email?: string;
  };
};

export type HomeContentApiResponse = {
  success: true;
  data: {
    hero?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      primaryCtaLabel?: string;
      secondaryCtaLabel?: string;
    };
    impact?: {
      sectionLabel?: string;
      title?: string;
      description?: string;
      stats?: Array<{
        label?: string;
        value?: string;
      }>;
    };
    eligibilityPreview?: {
      sectionLabel?: string;
      title?: string;
      description?: string;
      items?: Array<{
        title?: string;
        description?: string;
      }>;
    };
    ctaBanner?: {
      title?: string;
      description?: string;
      ctaLabel?: string;
    };
    process?: {
      sectionLabel?: string;
      title?: string;
      description?: string;
      items?: Array<{
        title?: string;
        description?: string;
      }>;
    };
    sections?: Array<{
      key: string;
      title: string;
    }>;
    support?: {
      label?: string;
      phone?: string;
    };
    footer?: {
      organization?: string;
      institution?: string;
      address?: string;
      phone?: string;
      email?: string;
    };
  };
  message: string;
};

export type FaqItem = {
  id: string;
  slug: string;
  question: string;
  answer: string;
  category: string;
  order: number;
};

export type FaqApiResponse = {
  success: true;
  data: {
    items: FaqItem[];
  };
  message: string;
};

export type CampaignItem = {
  id: string;
  code: string;
  title: string;
  description: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  ctaLabel: string;
  badgeLabel: string;
  theme: string;
  priority: number;
};

export type CampaignApiResponse = {
  success: true;
  data: {
    items: CampaignItem[];
  };
  message: string;
};

export type FeaturedCampaignApiResponse = {
  success: true;
  data: {
    item: CampaignItem | null;
  };
  message: string;
};
