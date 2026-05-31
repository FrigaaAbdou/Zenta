import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminCampaignsPage } from "./AdminCampaignsPage";

vi.mock("@/features/admin-auth/AdminAuthProvider", () => ({
  useAdminAuth: () => ({
    token: "admin-token",
    admin: {
      id: "admin-1",
      email: "manager@cts.local",
      role: "manager",
      isActive: true,
    },
    logout: vi.fn(),
  }),
}));

vi.mock("@/lib/api/adminCampaignsApi", () => ({
  listAdminCampaigns: vi.fn(),
  createAdminCampaign: vi.fn(),
  updateAdminCampaign: vi.fn(),
}));

import {
  createAdminCampaign,
  listAdminCampaigns,
  updateAdminCampaign,
} from "@/lib/api/adminCampaignsApi";

describe("AdminCampaignsPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the campaigns list", async () => {
    vi.mocked(listAdminCampaigns).mockResolvedValue([
      {
        id: "campaign-1",
        code: "SOLIDARITE-2026",
        status: "published",
        isPublished: true,
        isActive: true,
        priority: 90,
        badgeLabel: "Urgence estivale",
        theme: "emergency",
        startDate: null,
        endDate: null,
        localeContent: {
          fr: { title: "Solidarité 2026", description: "Desc", ctaLabel: "Je donne" },
          ar: null,
        },
      },
    ]);

    render(
      <MemoryRouter>
        <AdminCampaignsPage />
      </MemoryRouter>,
    );

    expect(await screen.findAllByText("SOLIDARITE-2026")).not.toHaveLength(0);
    expect(screen.getByText("Solidarité 2026")).toBeInTheDocument();
  });

  it("creates a campaign from the editor form", async () => {
    const user = userEvent.setup();

    vi.mocked(listAdminCampaigns).mockResolvedValue([]);
    vi.mocked(createAdminCampaign).mockResolvedValue({
      id: "campaign-1",
      code: "SOLIDARITE-2026",
      status: "published",
      isPublished: true,
      isActive: true,
      priority: 90,
      badgeLabel: "Urgence estivale",
      theme: "emergency",
      startDate: null,
      endDate: null,
      localeContent: {
        fr: { title: "Solidarité 2026", description: "Desc", ctaLabel: "Je donne" },
        ar: null,
      },
    });

    render(
      <MemoryRouter>
        <AdminCampaignsPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /nouvelle campagne/i }));
    await user.type(screen.getByLabelText("Code"), "solidarite-2026");
    await user.type(screen.getByLabelText("Titre FR"), "Solidarité 2026");
    await user.type(screen.getByLabelText("Description FR"), "Desc");
    await user.type(screen.getByLabelText("CTA FR"), "Je donne");
    await user.click(screen.getByRole("button", { name: /enregistrer la campagne/i }));

    await waitFor(() => {
      expect(createAdminCampaign).toHaveBeenCalled();
    });
  });

  it("asks confirmation before disabling an active or published campaign", async () => {
    const user = userEvent.setup();

    vi.mocked(listAdminCampaigns).mockResolvedValue([
      {
        id: "campaign-1",
        code: "SOLIDARITE-2026",
        status: "published",
        isPublished: true,
        isActive: true,
        priority: 90,
        badgeLabel: "Urgence estivale",
        theme: "emergency",
        startDate: null,
        endDate: null,
        localeContent: {
          fr: { title: "Solidarité 2026", description: "Desc", ctaLabel: "Je donne" },
          ar: null,
        },
      },
    ]);
    vi.mocked(updateAdminCampaign).mockResolvedValue({
      id: "campaign-1",
      code: "SOLIDARITE-2026",
      status: "published",
      isPublished: false,
      isActive: false,
      priority: 90,
      badgeLabel: "Urgence estivale",
      theme: "emergency",
      startDate: null,
      endDate: null,
      localeContent: {
        fr: { title: "Solidarité 2026", description: "Desc", ctaLabel: "Je donne" },
        ar: null,
      },
    });

    render(
      <MemoryRouter>
        <AdminCampaignsPage />
      </MemoryRouter>,
    );

    await screen.findByText("Solidarité 2026");
    await user.click(screen.getAllByRole("combobox")[1]);
    await user.click(await screen.findByText("Non"));
    await user.click(screen.getByRole("button", { name: /enregistrer la campagne/i }));

    expect(
      await screen.findByText(/cette campagne ne sera plus active ou publiée/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /confirmer la désactivation/i }));

    await waitFor(() => {
      expect(updateAdminCampaign).toHaveBeenCalled();
    });
  });
});
