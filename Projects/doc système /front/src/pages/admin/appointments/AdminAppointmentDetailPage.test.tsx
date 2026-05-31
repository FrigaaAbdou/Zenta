import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminAppointmentDetailPage } from "./AdminAppointmentDetailPage";

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
  getAdminAppointment: vi.fn(),
  updateAdminAppointmentStatus: vi.fn(),
}));

import {
  getAdminAppointment,
  updateAdminAppointmentStatus,
} from "@/lib/api/adminAppointmentsApi";

describe("AdminAppointmentDetailPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the appointment detail payload", async () => {
    vi.mocked(getAdminAppointment).mockResolvedValue({
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
        email: "sara@example.com",
        wilayaCode: "16",
        commune: "Sidi M'Hamed",
        bloodGroup: "O+",
      },
      campaignCode: "SOLIDARITE-2026",
      appointmentDate: "2026-05-29",
      appointmentTime: "09:00",
      donationType: "whole_blood",
      status: "pending",
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:00:00.000Z",
      isExistingDonor: false,
      lastDonationDate: null,
      eligibilityChecklist: {
        ageConfirmed: true,
        weightConfirmed: true,
        healthyConfirmed: true,
        noContraIndicationConfirmed: true,
      },
      remarks: "RAS",
      locale: "fr",
    });

    render(
      <MemoryRouter initialEntries={["/admin/appointments/appointment-1"]}>
        <Routes>
          <Route
            path="/admin/appointments/:id"
            element={<AdminAppointmentDetailPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Sara Benali")).toBeInTheDocument();
    expect(screen.getByText("RAS")).toBeInTheDocument();
  });

  it("updates the appointment status from the detail view", async () => {
    const user = userEvent.setup();

    vi.mocked(getAdminAppointment).mockResolvedValue({
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
        email: "sara@example.com",
        wilayaCode: "16",
        commune: "Sidi M'Hamed",
        bloodGroup: "O+",
      },
      campaignCode: "SOLIDARITE-2026",
      appointmentDate: "2026-05-29",
      appointmentTime: "09:00",
      donationType: "whole_blood",
      status: "pending",
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:00:00.000Z",
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
        email: "sara@example.com",
        wilayaCode: "16",
        commune: "Sidi M'Hamed",
        bloodGroup: "O+",
      },
      campaignCode: "SOLIDARITE-2026",
      appointmentDate: "2026-05-29",
      appointmentTime: "09:00",
      donationType: "whole_blood",
      status: "confirmed",
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:10:00.000Z",
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
      <MemoryRouter initialEntries={["/admin/appointments/appointment-1"]}>
        <Routes>
          <Route
            path="/admin/appointments/:id"
            element={<AdminAppointmentDetailPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText("Sara Benali");
    await user.click(screen.getByRole("button", { name: "Confirmé" }));

    await waitFor(() => {
      expect(updateAdminAppointmentStatus).toHaveBeenCalledWith(
        "admin-token",
        "appointment-1",
        "confirmed",
      );
    });
  });
});
