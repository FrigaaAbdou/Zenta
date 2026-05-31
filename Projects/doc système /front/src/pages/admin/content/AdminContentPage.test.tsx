import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Link,
  MemoryRouter,
  RouterProvider,
  createMemoryRouter,
} from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminContentPage } from "./AdminContentPage";

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

vi.mock("@/lib/api/adminContentApi", () => ({
  listAdminContent: vi.fn(),
  updateAdminContent: vi.fn(),
}));

import { listAdminContent, updateAdminContent } from "@/lib/api/adminContentApi";

describe("AdminContentPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the admin content editor", async () => {
    vi.mocked(listAdminContent).mockResolvedValue([
      {
        id: "home-id",
        key: "home",
        localeContent: {
          fr: {
            hero: {
              eyebrow: "Centre",
              title: "Titre FR",
              description: "Description FR",
              primaryCtaLabel: "Je donne",
              secondaryCtaLabel: "Vérifier",
            },
            impact: { sectionLabel: "", title: "", description: "", stats: [] },
            eligibilityPreview: { sectionLabel: "", title: "", description: "", items: [] },
            ctaBanner: { title: "CTA", description: "Desc CTA", ctaLabel: "Action" },
            process: { sectionLabel: "", title: "", description: "", items: [] },
            sections: [],
            support: { label: "Support", phone: "+213" },
            footer: {
              organization: "Org",
              institution: "Inst",
              address: "Addr",
              phone: "+213",
              email: "mail@test.com",
            },
          },
          ar: {
            hero: {
              eyebrow: "مركز",
              title: "عنوان",
              description: "وصف",
              primaryCtaLabel: "اتبرع",
              secondaryCtaLabel: "تحقق",
            },
            impact: { sectionLabel: "", title: "", description: "", stats: [] },
            eligibilityPreview: { sectionLabel: "", title: "", description: "", items: [] },
            ctaBanner: { title: "دعوة", description: "وصف", ctaLabel: "إجراء" },
            process: { sectionLabel: "", title: "", description: "", items: [] },
            sections: [],
            support: { label: "دعم", phone: "+213" },
            footer: {
              organization: "منظمة",
              institution: "مؤسسة",
              address: "عنوان",
              phone: "+213",
              email: "mail@test.com",
            },
          },
        },
      },
    ]);

    render(
      <MemoryRouter>
        <AdminContentPage />
      </MemoryRouter>,
    );

    expect(await screen.findByDisplayValue("Titre FR")).toBeInTheDocument();
  });

  it("saves the content payload", async () => {
    const user = userEvent.setup();

    vi.mocked(listAdminContent).mockResolvedValue([
      {
        id: "home-id",
        key: "home",
        localeContent: {
          fr: {
            hero: {
              eyebrow: "Centre",
              title: "Titre FR",
              description: "Description FR",
              primaryCtaLabel: "Je donne",
              secondaryCtaLabel: "Vérifier",
            },
            impact: { sectionLabel: "", title: "", description: "", stats: [] },
            eligibilityPreview: { sectionLabel: "", title: "", description: "", items: [] },
            ctaBanner: { title: "CTA", description: "Desc CTA", ctaLabel: "Action" },
            process: { sectionLabel: "", title: "", description: "", items: [] },
            sections: [],
            support: { label: "Support", phone: "+213" },
            footer: {
              organization: "Org",
              institution: "Inst",
              address: "Addr",
              phone: "+213",
              email: "mail@test.com",
            },
          },
          ar: {
            hero: {
              eyebrow: "مركز",
              title: "عنوان",
              description: "وصف",
              primaryCtaLabel: "اتبرع",
              secondaryCtaLabel: "تحقق",
            },
            impact: { sectionLabel: "", title: "", description: "", stats: [] },
            eligibilityPreview: { sectionLabel: "", title: "", description: "", items: [] },
            ctaBanner: { title: "دعوة", description: "وصف", ctaLabel: "إجراء" },
            process: { sectionLabel: "", title: "", description: "", items: [] },
            sections: [],
            support: { label: "دعم", phone: "+213" },
            footer: {
              organization: "منظمة",
              institution: "مؤسسة",
              address: "عنوان",
              phone: "+213",
              email: "mail@test.com",
            },
          },
        },
      },
    ]);
    vi.mocked(updateAdminContent).mockResolvedValue({
      id: "home-id",
      key: "home",
      localeContent: {
        fr: {
          hero: {
            eyebrow: "Centre",
            title: "Titre mis à jour",
            description: "Description FR",
            primaryCtaLabel: "Je donne",
            secondaryCtaLabel: "Vérifier",
          },
          impact: { sectionLabel: "", title: "", description: "", stats: [] },
          eligibilityPreview: { sectionLabel: "", title: "", description: "", items: [] },
          ctaBanner: { title: "CTA", description: "Desc CTA", ctaLabel: "Action" },
          process: { sectionLabel: "", title: "", description: "", items: [] },
          sections: [],
          support: { label: "Support", phone: "+213" },
          footer: {
            organization: "Org",
            institution: "Inst",
            address: "Addr",
            phone: "+213",
            email: "mail@test.com",
          },
        },
        ar: {
          hero: {
            eyebrow: "مركز",
            title: "عنوان",
            description: "وصف",
            primaryCtaLabel: "اتبرع",
            secondaryCtaLabel: "تحقق",
          },
          impact: { sectionLabel: "", title: "", description: "", stats: [] },
          eligibilityPreview: { sectionLabel: "", title: "", description: "", items: [] },
          ctaBanner: { title: "دعوة", description: "وصف", ctaLabel: "إجراء" },
          process: { sectionLabel: "", title: "", description: "", items: [] },
          sections: [],
          support: { label: "دعم", phone: "+213" },
          footer: {
            organization: "منظمة",
            institution: "مؤسسة",
            address: "عنوان",
            phone: "+213",
            email: "mail@test.com",
          },
        },
      },
    });

    render(
      <MemoryRouter>
        <AdminContentPage />
      </MemoryRouter>,
    );

    const titleInput = await screen.findByLabelText("Titre hero FR");
    await user.clear(titleInput);
    await user.type(titleInput, "Titre mis à jour");
    await user.click(screen.getByRole("button", { name: /enregistrer le contenu/i }));

    await waitFor(() => {
      expect(updateAdminContent).toHaveBeenCalled();
    });
  });

  it("warns before leaving with unsaved changes", async () => {
    const user = userEvent.setup();

    vi.mocked(listAdminContent).mockResolvedValue([
      {
        id: "home-id",
        key: "home",
        localeContent: {
          fr: {
            hero: {
              eyebrow: "Centre",
              title: "Titre FR",
              description: "Description FR",
              primaryCtaLabel: "Je donne",
              secondaryCtaLabel: "Vérifier",
            },
            impact: { sectionLabel: "", title: "", description: "", stats: [] },
            eligibilityPreview: { sectionLabel: "", title: "", description: "", items: [] },
            ctaBanner: { title: "CTA", description: "Desc CTA", ctaLabel: "Action" },
            process: { sectionLabel: "", title: "", description: "", items: [] },
            sections: [],
            support: { label: "Support", phone: "+213" },
            footer: {
              organization: "Org",
              institution: "Inst",
              address: "Addr",
              phone: "+213",
              email: "mail@test.com",
            },
          },
          ar: {
            hero: {
              eyebrow: "مركز",
              title: "عنوان",
              description: "وصف",
              primaryCtaLabel: "اتبرع",
              secondaryCtaLabel: "تحقق",
            },
            impact: { sectionLabel: "", title: "", description: "", stats: [] },
            eligibilityPreview: { sectionLabel: "", title: "", description: "", items: [] },
            ctaBanner: { title: "دعوة", description: "وصف", ctaLabel: "إجراء" },
            process: { sectionLabel: "", title: "", description: "", items: [] },
            sections: [],
            support: { label: "دعم", phone: "+213" },
            footer: {
              organization: "منظمة",
              institution: "مؤسسة",
              address: "عنوان",
              phone: "+213",
              email: "mail@test.com",
            },
          },
        },
      },
    ]);

    const router = createMemoryRouter(
      [
        {
          path: "/admin/content",
          element: (
            <>
              <Link to="/admin">Retour dashboard</Link>
              <AdminContentPage />
            </>
          ),
        },
        { path: "/admin", element: <p>dashboard</p> },
      ],
      {
        initialEntries: ["/admin/content"],
      },
    );

    render(<RouterProvider router={router} />);

    const titleInput = await screen.findByLabelText("Titre hero FR");
    await user.clear(titleInput);
    await user.type(titleInput, "Titre brouillon");
    await user.click(screen.getByRole("link", { name: /retour dashboard/i }));

    expect(
      await screen.findByText(/des modifications non enregistrées seront perdues/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /quitter sans enregistrer/i }));

    expect(await screen.findByText("dashboard")).toBeInTheDocument();
  });
});
