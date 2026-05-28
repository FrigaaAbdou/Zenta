import request from "supertest";
import mongoose from "mongoose";
import { describe, expect, it, vi } from "vitest";

import { createApp } from "../app/app.js";
import { DonationCampaignModel } from "../modules/campaigns/campaign.model.js";
import { FAQEntryModel } from "../modules/faq/faq.model.js";
import { SiteContentModel } from "../modules/content/content.model.js";

function buildTestApp() {
  return createApp({
    corsOrigin: "http://127.0.0.1:5175",
    nodeEnv: "test",
  });
}

async function withMockedConnectedState<T>(run: () => Promise<T>) {
  const originalReadyState = Object.getOwnPropertyDescriptor(
    mongoose.connection,
    "readyState",
  );

  Object.defineProperty(mongoose.connection, "readyState", {
    configurable: true,
    value: 1,
  });

  try {
    return await run();
  } finally {
    if (originalReadyState) {
      Object.defineProperty(mongoose.connection, "readyState", originalReadyState);
    } else {
      Object.defineProperty(mongoose.connection, "readyState", {
        configurable: true,
        value: 0,
      });
    }
  }
}

describe("public content endpoints", () => {
  it("returns localized home content in a frontend-friendly shape", async () => {
    const response = await request(buildTestApp()).get(
      "/api/public/home-content?locale=fr",
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Home content fetched successfully.");
    expect(response.body.data.hero.title).toBeTypeOf("string");
    expect(response.body.data.impact.title).toBeTypeOf("string");
    expect(response.body.data.eligibilityPreview.title).toBeTypeOf("string");
    expect(response.body.data.ctaBanner.title).toBeTypeOf("string");
    expect(response.body.data.process.title).toBeTypeOf("string");
    expect(response.body.data.footer.organization).toBeTypeOf("string");
    expect(response.body.data.sections).toBeInstanceOf(Array);
  });

  it("falls back to french localized content when arabic content is missing in the database", async () => {
    const findOneSpy = vi.spyOn(SiteContentModel, "findOne").mockReturnValue({
      lean: () =>
        Promise.resolve({
          key: "home",
          localeContent: {
            fr: {
              hero: {
                eyebrow: "Centre de Transfusion Sanguine",
                title: "Hero FR",
                description: "Description FR",
                primaryCtaLabel: "CTA FR",
              },
              impact: {
                sectionLabel: "Section FR",
                title: "Impact FR",
                conclusion: "Conclusion FR",
              },
            },
          },
        }),
    } as never);

    try {
      const response = await withMockedConnectedState(() =>
        request(buildTestApp()).get("/api/public/home-content?locale=ar"),
      );

      expect(response.status).toBe(200);
      expect(response.body.data.hero.title).toBe("Hero FR");
      expect(response.body.data.impact.title).toBe("Impact FR");
    } finally {
      findOneSpy.mockRestore();
    }
  });

  it("returns published faq items as an empty list when no records exist", async () => {
    const response = await request(buildTestApp()).get("/api/public/faq?locale=fr");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        items: [],
      },
      message: "FAQ fetched successfully.",
    });
  });

  it("falls back to french faq content when arabic translation is missing", async () => {
    const findSpy = vi.spyOn(FAQEntryModel, "find").mockReturnValue({
      sort: () => ({
        lean: () =>
          Promise.resolve([
            {
              _id: "faq-1",
              slug: "eligibilite",
              category: "eligibility",
              order: 1,
              localeContent: {
                fr: {
                  question: "Question FR",
                  answer: "Réponse FR",
                },
              },
            },
          ]),
      }),
    } as never);

    try {
      const response = await withMockedConnectedState(() =>
        request(buildTestApp()).get("/api/public/faq?locale=ar"),
      );

      expect(response.status).toBe(200);
      expect(response.body.data.items).toEqual([
        expect.objectContaining({
          slug: "eligibilite",
          question: "Question FR",
          answer: "Réponse FR",
        }),
      ]);
    } finally {
      findSpy.mockRestore();
    }
  });

  it("returns active campaigns as an empty list when no records exist", async () => {
    const response = await request(buildTestApp()).get(
      "/api/public/campaigns/active?locale=fr",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        items: [],
      },
      message: "Active campaigns fetched successfully.",
    });
  });

  it("returns a featured campaign with french fallback when arabic campaign content is missing", async () => {
    const findSpy = vi.spyOn(DonationCampaignModel, "find").mockReturnValue({
      sort: () => ({
        lean: () =>
          Promise.resolve([
            {
              _id: "campaign-1",
              code: "SOLIDARITE-2026",
              status: "published",
              isPublished: true,
              isActive: true,
              priority: 90,
              badgeLabel: "Urgent",
              theme: "emergency",
              startDate: new Date("2026-06-01T08:00:00.000Z"),
              endDate: null,
              localeContent: {
                fr: {
                  title: "Campagne principale FR",
                  description: "Description FR",
                  ctaLabel: "Participer",
                },
              },
            },
          ]),
      }),
    } as never);

    try {
      const response = await withMockedConnectedState(() =>
        request(buildTestApp()).get("/api/public/campaigns/featured?locale=ar"),
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Featured campaign fetched successfully.");
      expect(response.body.data.item.code).toBe("SOLIDARITE-2026");
      expect(response.body.data.item.title).toBe("Campagne principale FR");
      expect(response.body.data.item.badgeLabel).toBe("Urgent");
      expect(response.body.data.item.theme).toBe("emergency");
      expect(response.body.data.item.priority).toBe(90);
    } finally {
      findSpy.mockRestore();
    }
  });

  it("returns active campaigns with french fallback when arabic translation is missing", async () => {
    const findSpy = vi.spyOn(DonationCampaignModel, "find").mockReturnValue({
      sort: () => ({
        lean: () =>
          Promise.resolve([
            {
              _id: "campaign-3",
              code: "SOLIDARITE-2026",
              status: "published",
              isPublished: true,
              isActive: true,
              priority: 75,
              badgeLabel: "Collecte",
              theme: "community",
              startDate: null,
              endDate: null,
              localeContent: {
                fr: {
                  title: "Campagne active FR",
                  description: "Description active FR",
                  ctaLabel: "Agir",
                },
              },
            },
          ]),
      }),
    } as never);

    try {
      const response = await withMockedConnectedState(() =>
        request(buildTestApp()).get("/api/public/campaigns/active?locale=ar"),
      );

      expect(response.status).toBe(200);
      expect(response.body.data.items).toEqual([
        expect.objectContaining({
          code: "SOLIDARITE-2026",
          title: "Campagne active FR",
          description: "Description active FR",
          ctaLabel: "Agir",
        }),
      ]);
    } finally {
      findSpy.mockRestore();
    }
  });

  it("returns campaign details by code", async () => {
    const findOneSpy = vi.spyOn(DonationCampaignModel, "findOne").mockReturnValue({
      lean: () =>
        Promise.resolve({
          _id: "campaign-2",
          code: "SOLIDARITE-2026",
          status: "published",
          isPublished: true,
          isActive: true,
          priority: 80,
          badgeLabel: "En cours",
          theme: "community",
          startDate: new Date("2026-06-01T08:00:00.000Z"),
          endDate: new Date("2026-07-01T08:00:00.000Z"),
          localeContent: {
            fr: {
              title: "Campagne detail FR",
              description: "Description detail FR",
              ctaLabel: "Je participe",
            },
            ar: {
              title: "حملة مفصلة",
              description: "وصف مفصل",
              ctaLabel: "اشارك",
            },
          },
        }),
    } as never);

    try {
      const response = await withMockedConnectedState(() =>
        request(buildTestApp()).get("/api/public/campaigns/SOLIDARITE-2026?locale=fr"),
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Campaign fetched successfully.");
      expect(response.body.data.item.code).toBe("SOLIDARITE-2026");
      expect(response.body.data.item.title).toBe("Campagne detail FR");
      expect(response.body.data.item.ctaLabel).toBe("Je participe");
    } finally {
      findOneSpy.mockRestore();
    }
  });
});
