import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminDashboardPage } from "./AdminDashboardPage";

vi.mock("@/features/admin-auth/AdminAuthProvider", () => ({
  useAdminAuth: () => ({
    token: "admin-token",
  }),
}));

vi.mock("@/lib/api/adminDashboardApi", () => ({
  getAdminDashboardOverview: vi.fn(),
}));

import { getAdminDashboardOverview } from "@/lib/api/adminDashboardApi";

describe("AdminDashboardPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dashboard overview from the admin API", async () => {
    vi.mocked(getAdminDashboardOverview).mockResolvedValue({
      metrics: {
        pendingCount: 12,
        todayCount: 4,
        activeCampaignCount: 2,
      },
      statusDistribution: [
        { status: "pending", count: 12 },
        { status: "confirmed", count: 8 },
        { status: "rejected", count: 2 },
        { status: "completed", count: 5 },
        { status: "cancelled", count: 1 },
      ],
      recentAppointments: [
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
          createdAt: "2026-05-29T08:45:00.000Z",
        },
      ],
      featuredCampaign: {
        code: "SOLIDARITE-2026",
        title: "Solidarité 2026",
        badgeLabel: "Urgence estivale",
        theme: "emergency",
        startDate: "2026-06-01T00:00:00.000Z",
        endDate: null,
      },
      activity: [
        {
          id: "activity-1",
          title: "Nouvelle demande reçue",
          detail: "08:45 - Sara Benali",
        },
      ],
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findAllByText("12")).not.toHaveLength(0);
    expect(screen.getByText("Solidarité 2026")).toBeInTheDocument();
    expect(screen.getByText("Sara Benali")).toBeInTheDocument();
    expect(screen.getByText("Nouvelle demande reçue")).toBeInTheDocument();
  });

  it("shows a retry state when the dashboard loading fails", async () => {
    vi.mocked(getAdminDashboardOverview).mockRejectedValue(
      new Error("dashboard failure"),
    );

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/impossible de charger la vue d'ensemble admin/i),
      ).toBeInTheDocument();
    });
  });
});
