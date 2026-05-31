import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminCalendarPage } from "./AdminCalendarPage";

vi.mock("@/features/admin-auth/AdminAuthProvider", () => ({
  useAdminAuth: () => ({
    token: "admin-token",
    logout: vi.fn(),
  }),
  isUnauthorizedAdminError: () => false,
}));

vi.mock("@/lib/api/adminCalendarApi", () => ({
  closeAdminCalendarDay: vi.fn(),
  createAdminCalendarSlot: vi.fn(),
  getAdminCalendarMonth: vi.fn(),
  getAdminCalendarDay: vi.fn(),
  listAdminCalendarTemplates: vi.fn(),
  replaceAdminCalendarTemplates: vi.fn(),
  reopenAdminCalendarDay: vi.fn(),
  updateAdminCalendarSlot: vi.fn(),
}));

import {
  closeAdminCalendarDay,
  createAdminCalendarSlot,
  getAdminCalendarDay,
  getAdminCalendarMonth,
  listAdminCalendarTemplates,
  replaceAdminCalendarTemplates,
} from "@/lib/api/adminCalendarApi";

describe("AdminCalendarPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the admin calendar month, day detail and weekly templates", async () => {
    vi.mocked(getAdminCalendarMonth).mockResolvedValue({
      month: "2026-06",
      days: [
        {
          date: "2026-06-15",
          appointmentCount: 4,
          openSlots: 2,
          fullSlots: 1,
          blockedSlots: 0,
          closedSlots: 0,
          status: "available",
        },
      ],
    });
    vi.mocked(getAdminCalendarDay).mockResolvedValue({
      date: "2026-06-15",
      summary: {
        totalSlots: 3,
        openSlots: 2,
        fullSlots: 1,
        blockedSlots: 0,
        closedSlots: 0,
        appointmentCount: 4,
        dayClosureType: null,
      },
      slots: [
        {
          value: "08:00",
          label: "08:00",
          capacity: 3,
          reservedCount: 1,
          remainingCapacity: 2,
          status: "open",
          source: "template",
          overrideId: null,
          reason: null,
        },
      ],
    });
    vi.mocked(listAdminCalendarTemplates).mockResolvedValue([
      {
        id: "template-1",
        daysOfWeek: [1],
        startTime: "08:00",
        endTime: "12:00",
        intervalMinutes: 15,
        capacity: 3,
        isActive: true,
        donationTypes: ["whole_blood"],
      },
    ]);

    render(
      <MemoryRouter>
        <AdminCalendarPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Calendrier")).toBeInTheDocument();
    expect(screen.getByText("Vue mensuelle")).toBeInTheDocument();
    expect(screen.getByText("Détail de la journée")).toBeInTheDocument();
    expect(screen.getByText("Règles hebdomadaires")).toBeInTheDocument();
    expect(screen.getAllByText("08:00").length).toBeGreaterThan(0);
    expect(screen.getByText("Lun")).toBeInTheDocument();
    expect(screen.getByText("08:00 -> 12:00")).toBeInTheDocument();
  });

  it("shows a retry state when the admin calendar fails to load", async () => {
    vi.mocked(getAdminCalendarMonth).mockRejectedValue(new Error("month failure"));
    vi.mocked(getAdminCalendarDay).mockRejectedValue(new Error("day failure"));
    vi.mocked(listAdminCalendarTemplates).mockRejectedValue(
      new Error("templates failure"),
    );

    render(
      <MemoryRouter>
        <AdminCalendarPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/impossible de charger le calendrier admin/i),
      ).toBeInTheDocument();
    });
  });

  it("creates a slot override from the calendar sheet", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();

    vi.mocked(getAdminCalendarMonth).mockResolvedValue({
      month: "2026-06",
      days: [],
    });
    vi.mocked(getAdminCalendarDay).mockResolvedValue({
      date: "2026-05-31",
      summary: {
        totalSlots: 0,
        openSlots: 0,
        fullSlots: 0,
        blockedSlots: 0,
        closedSlots: 0,
        appointmentCount: 0,
        dayClosureType: null,
      },
      slots: [],
    });
    vi.mocked(listAdminCalendarTemplates).mockResolvedValue([]);
    vi.mocked(createAdminCalendarSlot).mockResolvedValue({
      id: "override-1",
      date: "2026-05-31",
      time: "16:00",
      capacity: 2,
      status: "open",
      reason: "",
      campaignCode: null,
    });

    render(
      <MemoryRouter>
        <AdminCalendarPage />
      </MemoryRouter>,
    );

    await screen.findByText("Calendrier");
    await user.click(screen.getByRole("button", { name: /ajouter un créneau/i }));

    const timeInput = screen.getByLabelText("Heure");
    const capacityInput = screen.getByLabelText("Capacité");

    await user.clear(timeInput);
    await user.type(timeInput, "16:00");
    await user.clear(capacityInput);
    await user.type(capacityInput, "2");
    await user.click(screen.getByRole("button", { name: /^Enregistrer$/i }));

    await waitFor(() => {
      expect(createAdminCalendarSlot).toHaveBeenCalledWith(
        "admin-token",
        expect.objectContaining({
          date: expect.any(String),
          time: "16:00",
          capacity: 2,
          status: "open",
        }),
      );
    });
  });

  it("confirms and closes the selected day", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();

    vi.mocked(getAdminCalendarMonth).mockResolvedValue({
      month: "2026-06",
      days: [],
    });
    vi.mocked(getAdminCalendarDay).mockResolvedValue({
      date: "2026-05-31",
      summary: {
        totalSlots: 1,
        openSlots: 1,
        fullSlots: 0,
        blockedSlots: 0,
        closedSlots: 0,
        appointmentCount: 0,
        dayClosureType: null,
      },
      slots: [
        {
          value: "08:00",
          label: "08:00",
          capacity: 3,
          reservedCount: 0,
          remainingCapacity: 3,
          status: "open",
          source: "template",
          overrideId: null,
          reason: null,
        },
      ],
    });
    vi.mocked(listAdminCalendarTemplates).mockResolvedValue([]);
    vi.mocked(closeAdminCalendarDay).mockResolvedValue({
      date: "2026-05-31",
      status: "closed",
      affectedSlots: 1,
      closureType: "day_off",
    });

    render(
      <MemoryRouter>
        <AdminCalendarPage />
      </MemoryRouter>,
    );

    await screen.findByText("Calendrier");
    await user.click(screen.getByRole("button", { name: /jour off/i }));
    await user.click(screen.getByRole("button", { name: /^Marquer off$/i }));

    await waitFor(() => {
      expect(closeAdminCalendarDay).toHaveBeenCalledWith("admin-token", {
        date: expect.any(String),
        reason: "Jour off",
        closureType: "day_off",
      });
    });
  });

  it("edits and saves weekly templates from the dedicated sheet", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();

    vi.mocked(getAdminCalendarMonth).mockResolvedValue({
      month: "2026-06",
      days: [],
    });
    vi.mocked(getAdminCalendarDay).mockResolvedValue({
      date: "2026-05-31",
      summary: {
        totalSlots: 0,
        openSlots: 0,
        fullSlots: 0,
        blockedSlots: 0,
        closedSlots: 0,
        appointmentCount: 0,
        dayClosureType: null,
      },
      slots: [],
    });
    vi.mocked(listAdminCalendarTemplates).mockResolvedValue([
      {
        id: "template-1",
        daysOfWeek: [1],
        startTime: "08:00",
        endTime: "12:00",
        intervalMinutes: 15,
        capacity: 3,
        isActive: true,
        donationTypes: ["whole_blood"],
      },
    ]);
    vi.mocked(replaceAdminCalendarTemplates).mockResolvedValue([
      {
        id: "template-1",
        daysOfWeek: [1],
        startTime: "09:00",
        endTime: "12:00",
        intervalMinutes: 30,
        capacity: 4,
        isActive: true,
        donationTypes: ["whole_blood"],
      },
    ]);

    render(
      <MemoryRouter>
        <AdminCalendarPage />
      </MemoryRouter>,
    );

    await screen.findByText("Calendrier");
    await user.click(
      screen.getByRole("button", { name: /modifier les règles/i }),
    );

    const startTimeTrigger = screen.getByRole("combobox", {
      name: "Heure du créneau",
    });
    const endTimeTrigger = screen.getByRole("combobox", {
      name: "Heure de fin",
    });
    const capacityInput = screen.getByLabelText("Capacité hebdomadaire");

    await user.click(startTimeTrigger);
    await user.click(screen.getByRole("option", { name: "09:00" }));
    await user.click(endTimeTrigger);
    await user.click(screen.getByRole("option", { name: "12:00" }));
    await user.clear(capacityInput);
    await user.type(capacityInput, "4");
    await user.click(screen.getByRole("combobox", { name: "Intervalle" }));
    await user.click(screen.getByRole("option", { name: "30 min" }));

    expect(screen.getAllByText("09:00").length).toBeGreaterThan(0);
    expect(screen.getByText("09:30")).toBeInTheDocument();
    expect(screen.getByText("11:30")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Enregistrer$/i }));

    await waitFor(() => {
      expect(replaceAdminCalendarTemplates).toHaveBeenCalledWith("admin-token", [
        expect.objectContaining({
          daysOfWeek: [1],
          startTime: "09:00",
          endTime: "12:00",
          intervalMinutes: 30,
          capacity: 4,
          isActive: true,
          donationTypes: ["whole_blood"],
        }),
      ]);
    });
  });

  it("applies recurrence presets such as week-end before saving a rule", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();

    vi.mocked(getAdminCalendarMonth).mockResolvedValue({
      month: "2026-06",
      days: [],
    });
    vi.mocked(getAdminCalendarDay).mockResolvedValue({
      date: "2026-05-31",
      summary: {
        totalSlots: 0,
        openSlots: 0,
        fullSlots: 0,
        blockedSlots: 0,
        closedSlots: 0,
        appointmentCount: 0,
        dayClosureType: null,
      },
      slots: [],
    });
    vi.mocked(listAdminCalendarTemplates).mockResolvedValue([
      {
        id: "template-1",
        daysOfWeek: [1],
        startTime: "08:00",
        endTime: "10:00",
        intervalMinutes: 30,
        capacity: 2,
        isActive: true,
        donationTypes: ["whole_blood"],
      },
    ]);
    vi.mocked(replaceAdminCalendarTemplates).mockResolvedValue([
      {
        id: "template-1",
        daysOfWeek: [0, 6],
        startTime: "08:00",
        endTime: "10:00",
        intervalMinutes: 30,
        capacity: 2,
        isActive: true,
        donationTypes: ["whole_blood"],
      },
    ]);

    render(
      <MemoryRouter>
        <AdminCalendarPage />
      </MemoryRouter>,
    );

    await screen.findByText("Calendrier");
    await user.click(screen.getByRole("button", { name: /modifier les règles/i }));
    await user.click(screen.getByRole("button", { name: "Week-end" }));
    await user.click(screen.getByRole("button", { name: /^Enregistrer$/i }));

    await waitFor(() => {
      expect(replaceAdminCalendarTemplates).toHaveBeenCalledWith("admin-token", [
        expect.objectContaining({
          daysOfWeek: [0, 6],
        }),
      ]);
    });
  });

  it("offers only quarter-hour values for recurring rule time selectors", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();

    vi.mocked(getAdminCalendarMonth).mockResolvedValue({
      month: "2026-06",
      days: [],
    });
    vi.mocked(getAdminCalendarDay).mockResolvedValue({
      date: "2026-05-31",
      summary: {
        totalSlots: 0,
        openSlots: 0,
        fullSlots: 0,
        blockedSlots: 0,
        closedSlots: 0,
        appointmentCount: 0,
        dayClosureType: null,
      },
      slots: [],
    });
    vi.mocked(listAdminCalendarTemplates).mockResolvedValue([
      {
        id: "template-1",
        daysOfWeek: [1],
        startTime: "08:00",
        endTime: "10:00",
        intervalMinutes: 15,
        capacity: 2,
        isActive: true,
        donationTypes: ["whole_blood"],
      },
    ]);

    render(
      <MemoryRouter>
        <AdminCalendarPage />
      </MemoryRouter>,
    );

    await screen.findByText("Calendrier");
    await user.click(screen.getByRole("button", { name: /modifier les règles/i }));
    await user.click(
      screen.getByRole("combobox", { name: "Heure du créneau" }),
    );

    expect(screen.getByRole("option", { name: "08:15" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "08:07" }),
    ).not.toBeInTheDocument();
  });
});
