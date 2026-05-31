import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminAppointmentsListPage } from "./AdminAppointmentsListPage";

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

vi.mock("@/lib/api/adminAppointmentsApi", () => ({
  listAdminAppointments: vi.fn(),
  updateAdminAppointmentStatus: vi.fn(),
}));

vi.mock("@/lib/api/adminCampaignsApi", () => ({
  listAdminCampaigns: vi.fn(),
}));

import {
  listAdminAppointments,
  updateAdminAppointmentStatus,
} from "@/lib/api/adminAppointmentsApi";
import { listAdminCampaigns } from "@/lib/api/adminCampaignsApi";

describe("AdminAppointmentsListPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the fetched appointments list", async () => {
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
          fr: { title: "Solidarité 2026", description: "", ctaLabel: "" },
          ar: null,
        },
      },
    ]);
    vi.mocked(listAdminAppointments).mockResolvedValue({
      items: [
        {
          id: "appointment-1",
          donor: {
            id: "donor-1",
            firstName: "Sara",
            lastName: "Benali",
            phone: "0555123456",
            bloodGroup: "O+",
          },
          campaignCode: "SOLIDARITE-2026",
          appointmentDate: "2026-05-29",
          appointmentTime: "09:00",
          donationType: "whole_blood",
          status: "pending",
          createdAt: "2026-05-28T10:00:00.000Z",
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
    });

    render(
      <MemoryRouter>
        <AdminAppointmentsListPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Sara Benali")).toBeInTheDocument();
    expect(screen.getByText("SOLIDARITE-2026")).toBeInTheDocument();
  });

  it("can trigger a quick status update from the table", async () => {
    const user = userEvent.setup();

    vi.mocked(listAdminCampaigns).mockResolvedValue([]);
    vi.mocked(listAdminAppointments).mockResolvedValue({
      items: [
        {
          id: "appointment-1",
          donor: {
            id: "donor-1",
            firstName: "Sara",
            lastName: "Benali",
            phone: "0555123456",
            bloodGroup: "O+",
          },
          campaignCode: null,
          appointmentDate: "2026-05-29",
          appointmentTime: "09:00",
          donationType: "whole_blood",
          status: "pending",
          createdAt: "2026-05-28T10:00:00.000Z",
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
    });
    vi.mocked(updateAdminAppointmentStatus).mockResolvedValue({
      id: "appointment-1",
      donor: {
        id: "donor-1",
        firstName: "Sara",
        lastName: "Benali",
        phone: "0555123456",
        bloodGroup: "O+",
      },
      donorFull: {
        id: "donor-1",
        firstName: "Sara",
        lastName: "Benali",
        birthDate: "1995-01-01T00:00:00.000Z",
        gender: "female",
        phone: "0555123456",
        email: null,
        wilayaCode: "16",
        commune: "Sidi M'Hamed",
        bloodGroup: "O+",
      },
      campaignCode: null,
      appointmentDate: "2026-05-29",
      appointmentTime: "09:00",
      donationType: "whole_blood",
      status: "confirmed",
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T11:00:00.000Z",
      isExistingDonor: false,
      lastDonationDate: null,
      eligibilityChecklist: {
        ageConfirmed: true,
        weightConfirmed: true,
        healthyConfirmed: true,
        noContraIndicationConfirmed: true,
      },
      remarks: "",
      locale: "fr",
    });

    render(
      <MemoryRouter>
        <AdminAppointmentsListPage />
      </MemoryRouter>,
    );

    await screen.findByText("Sara Benali");
    const actionButton = screen
      .getAllByRole("button")
      .find((button) => button.getAttribute("aria-haspopup") === "menu");

    expect(actionButton).toBeDefined();

    await user.click(actionButton!);
    await user.click(screen.getByText("Confirmé"));

    await waitFor(() => {
      expect(updateAdminAppointmentStatus).toHaveBeenCalledWith(
        "admin-token",
        "appointment-1",
        "confirmed",
      );
    });
  });
});
