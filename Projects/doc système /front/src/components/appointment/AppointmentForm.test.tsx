import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppointmentForm } from "@/components/appointment/AppointmentForm";

vi.mock("@/lib/api/campaignApi", () => ({
  getActiveCampaigns: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/api/appointmentApi", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/appointmentApi")>(
    "@/lib/api/appointmentApi",
  );

  return {
    ...actual,
    getAppointmentFormMeta: vi.fn().mockResolvedValue({
      success: true,
      data: {
        locales: ["fr", "ar"],
        genders: [
          { value: "male", label: "Homme" },
          { value: "female", label: "Femme" },
        ],
        bloodGroups: ["A+", "O+"],
        donationTypes: [
          { value: "whole_blood", label: "Don de sang total" },
          { value: "plasma", label: "Don de plasma" },
        ],
        wilayas: [
          { code: "16", label: "Alger" },
          { code: "09", label: "Blida" },
        ],
        communesByWilaya: {
          "16": ["Sidi M'Hamed", "Bab El Oued"],
          "09": ["Blida"],
        },
        eligibilityChecklistTemplate: [],
      },
      message: "ok",
    }),
    getAppointmentSlots: vi.fn().mockResolvedValue({
      success: true,
      data: {
        date: "2026-06-10",
        slots: [{ value: "08:00", label: "08:00", isAvailable: true }],
      },
      message: "ok",
    }),
    createAppointmentRequest: vi.fn(),
  };
});

async function unlockForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText("Âge entre 18 et 65 ans"));
  await user.click(screen.getByLabelText("Poids minimum 50 kg"));
  await user.click(screen.getByLabelText("Être en bonne santé"));
  await user.click(screen.getByLabelText("Aucune contre-indication au don"));
  await user.click(screen.getByRole("button", { name: "Prendre rendez-vous" }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

async function fillValidAppointmentForm(user: ReturnType<typeof userEvent.setup>) {
  const lastNameInput = document.querySelector(
    'input[name="lastName"]',
  ) as HTMLInputElement;
  const firstNameInput = document.querySelector(
    'input[name="firstName"]',
  ) as HTMLInputElement;
  const birthDateInput = document.querySelector(
    'input[name="birthDate"]',
  ) as HTMLInputElement;
  const phoneInput = document.querySelector(
    'input[name="phone"]',
  ) as HTMLInputElement;
  const wilayaSelect = document.querySelector(
    'select[name="wilayaCode"]',
  ) as HTMLSelectElement;
  const communeSelect = document.querySelector(
    'select[name="commune"]',
  ) as HTMLSelectElement;
  const appointmentDateInput = document.querySelector(
    'input[name="appointmentDate"]',
  ) as HTMLInputElement;
  const appointmentTimeSelect = document.querySelector(
    'select[name="appointmentTime"]',
  ) as HTMLSelectElement;
  const bloodGroupSelect = document.querySelector(
    'select[name="bloodGroup"]',
  ) as HTMLSelectElement;
  const donationTypeSelect = document.querySelector(
    'select[name="donationType"]',
  ) as HTMLSelectElement;

  await user.type(lastNameInput, "Dupont");
  await user.type(firstNameInput, "Nadia");
  fireEvent.change(birthDateInput, { target: { value: "1995-01-10" } });
  await user.type(phoneInput, "0550123456");
  await user.selectOptions(wilayaSelect, "16");
  await user.selectOptions(communeSelect, "Sidi M'Hamed");
  fireEvent.change(appointmentDateInput, { target: { value: "2026-06-10" } });
  await screen.findByRole("option", { name: "08:00" });
  await user.selectOptions(appointmentTimeSelect, "08:00");
  await user.selectOptions(bloodGroupSelect, "A+");
  await user.selectOptions(donationTypeSelect, "whole_blood");
}

test("shows validation errors when required fields are missing", async () => {
  const user = userEvent.setup();

  render(<AppointmentForm />);
  await unlockForm(user);

  await user.click(screen.getByRole("button", { name: "Envoyer ma demande" }));

  expect(await screen.findByText("Le nom est requis.")).toBeInTheDocument();
  expect(screen.getByText("Le prénom est requis.")).toBeInTheDocument();
  expect(
    screen.getByText("La date du rendez-vous est requise."),
  ).toBeInTheDocument();
});

test("hydrates metadata-driven options after eligibility gate unlock", async () => {
  const user = userEvent.setup();

  render(<AppointmentForm />);
  await unlockForm(user);

  expect(await screen.findByRole("option", { name: "Alger" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Blida" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Don de plasma" })).toBeInTheDocument();
});

test("falls back to local metadata when the API metadata call fails", async () => {
  const user = userEvent.setup();
  const { getAppointmentFormMeta } = await import("@/lib/api/appointmentApi");

  vi.mocked(getAppointmentFormMeta).mockRejectedValueOnce(
    new Error("metadata failure"),
  );

  render(<AppointmentForm />);
  await unlockForm(user);

  expect(await screen.findByRole("option", { name: "Alger" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Tipaza" })).toBeInTheDocument();
});

test("falls back to local metadata when the API payload shape is invalid", async () => {
  const user = userEvent.setup();
  const { getAppointmentFormMeta } = await import("@/lib/api/appointmentApi");

  vi.mocked(getAppointmentFormMeta).mockResolvedValueOnce({
    success: true,
    data: undefined as never,
    message: "invalid",
  });

  render(<AppointmentForm />);
  await unlockForm(user);

  expect(await screen.findByRole("option", { name: "Alger" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Tipaza" })).toBeInTheDocument();
});

test("loads appointment slots from the API once a date is selected", async () => {
  const user = userEvent.setup();
  const { getAppointmentSlots } = await import("@/lib/api/appointmentApi");

  render(<AppointmentForm />);
  await unlockForm(user);

  const dateInput = document.querySelector(
    'input[name="appointmentDate"]',
  ) as HTMLInputElement;
  const timeSelect = document.querySelector(
    'select[name="appointmentTime"]',
  ) as HTMLSelectElement;

  expect(timeSelect).toBeDisabled();
  expect(screen.getByText("Choisissez d'abord une date.")).toBeInTheDocument();

  fireEvent.change(dateInput, { target: { value: "2026-06-10" } });

  await waitFor(() =>
    expect(getAppointmentSlots).toHaveBeenCalledWith("2026-06-10", undefined),
  );

  expect(await screen.findByRole("option", { name: "08:00" })).toBeInTheDocument();
  expect(timeSelect).not.toBeDisabled();
});

test("resets the selected time when the appointment date changes", async () => {
  const user = userEvent.setup();
  const { getAppointmentSlots } = await import("@/lib/api/appointmentApi");

  vi.mocked(getAppointmentSlots)
    .mockResolvedValueOnce({
      success: true,
      data: {
        date: "2026-06-10",
        slots: [{ value: "08:00", label: "08:00", isAvailable: true }],
      },
      message: "ok",
    })
    .mockResolvedValueOnce({
      success: true,
      data: {
        date: "2026-06-11",
        slots: [{ value: "09:00", label: "09:00", isAvailable: true }],
      },
      message: "ok",
    });

  render(<AppointmentForm />);
  await unlockForm(user);

  const dateInput = document.querySelector(
    'input[name="appointmentDate"]',
  ) as HTMLInputElement;
  const timeSelect = document.querySelector(
    'select[name="appointmentTime"]',
  ) as HTMLSelectElement;

  fireEvent.change(dateInput, { target: { value: "2026-06-10" } });
  await screen.findByRole("option", { name: "08:00" });
  await user.selectOptions(timeSelect, "08:00");
  expect(timeSelect.value).toBe("08:00");

  fireEvent.change(dateInput, { target: { value: "2026-06-11" } });

  await waitFor(() => expect(timeSelect.value).toBe(""));
  expect(await screen.findByRole("option", { name: "09:00" })).toBeInTheDocument();
});

test("shows an unavailable state when no appointment slots can be used", async () => {
  const user = userEvent.setup();
  const { getAppointmentSlots } = await import("@/lib/api/appointmentApi");

  vi.mocked(getAppointmentSlots).mockResolvedValueOnce({
    success: true,
    data: {
      date: "2026-06-12",
      slots: [{ value: "08:00", label: "08:00", isAvailable: false }],
    },
    message: "ok",
  });

  render(<AppointmentForm />);
  await unlockForm(user);

  const dateInput = document.querySelector(
    'input[name="appointmentDate"]',
  ) as HTMLInputElement;
  const timeSelect = document.querySelector(
    'select[name="appointmentTime"]',
  ) as HTMLSelectElement;

  fireEvent.change(dateInput, { target: { value: "2026-06-12" } });

  expect(
    await screen.findByText("Aucun créneau disponible pour cette date."),
  ).toBeInTheDocument();
  expect(timeSelect).toBeDisabled();
});

test("shows a recoverable message when slot loading fails", async () => {
  const user = userEvent.setup();
  const { getAppointmentSlots } = await import("@/lib/api/appointmentApi");

  vi.mocked(getAppointmentSlots).mockRejectedValueOnce(new Error("slots failure"));

  render(<AppointmentForm />);
  await unlockForm(user);

  const dateInput = document.querySelector(
    'input[name="appointmentDate"]',
  ) as HTMLInputElement;
  const timeSelect = document.querySelector(
    'select[name="appointmentTime"]',
  ) as HTMLSelectElement;

  fireEvent.change(dateInput, { target: { value: "2026-06-13" } });

  expect(
    await screen.findByText("Impossible de charger les créneaux."),
  ).toBeInTheDocument();
  expect(timeSelect).toBeDisabled();
});

test("submits successfully with the real backend payload shape", async () => {
  const user = userEvent.setup();
  const { createAppointmentRequest } = await import("@/lib/api/appointmentApi");

  vi.mocked(createAppointmentRequest).mockResolvedValueOnce({
    success: true,
    data: {
      id: "appt-1",
      status: "pending",
      appointmentDate: "2026-06-10",
      appointmentTime: "08:00",
      createdAt: "2026-05-24T00:00:00.000Z",
    },
    message: "ok",
  });

  render(<AppointmentForm />);
  await unlockForm(user);
  await fillValidAppointmentForm(user);
  await user.click(screen.getByRole("button", { name: "Envoyer ma demande" }));

  await waitFor(() =>
    expect(createAppointmentRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Nadia",
        lastName: "Dupont",
        phone: "0550123456",
        appointmentDate: "2026-06-10",
        appointmentTime: "08:00",
        donationType: "whole_blood",
        locale: "fr",
        eligibilityChecklist: {
          ageConfirmed: true,
          weightConfirmed: true,
          healthyConfirmed: true,
          noContraIndicationConfirmed: true,
        },
      }),
    ),
  );

  expect(
    await screen.findByText(
      "Votre demande a été envoyée. Nous vous recontacterons pour confirmation.",
    ),
  ).toBeInTheDocument();
});

test("maps backend 422 field errors into the form", async () => {
  const user = userEvent.setup();
  const { createAppointmentRequest } = await import("@/lib/api/appointmentApi");

  vi.mocked(createAppointmentRequest).mockRejectedValueOnce({
    status: 422,
    message: "Appointment request payload is invalid.",
    fieldErrors: {
      phone: "Ce numéro de téléphone est déjà invalide.",
    },
  });

  render(<AppointmentForm />);
  await unlockForm(user);
  await fillValidAppointmentForm(user);
  await user.click(screen.getByRole("button", { name: "Envoyer ma demande" }));

  expect(
    await screen.findByText("Appointment request payload is invalid."),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Ce numéro de téléphone est déjà invalide."),
  ).toBeInTheDocument();
});

test("shows a slot conflict message and marks the time field on 409", async () => {
  const user = userEvent.setup();
  const { createAppointmentRequest } = await import("@/lib/api/appointmentApi");

  vi.mocked(createAppointmentRequest).mockRejectedValueOnce({
    status: 409,
    code: "SLOT_UNAVAILABLE",
    message: "Le creneau selectionne n'est plus disponible.",
    details: {
      appointmentTime: "Veuillez choisir un autre horaire.",
    },
  });

  render(<AppointmentForm />);
  await unlockForm(user);
  await fillValidAppointmentForm(user);
  await user.click(screen.getByRole("button", { name: "Envoyer ma demande" }));

  expect(
    await screen.findByText(
      "Ce créneau n'est plus disponible. Merci d'en choisir un autre.",
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Veuillez choisir un autre horaire."),
  ).toBeInTheDocument();
});

test("shows a safe generic message when the API fails unexpectedly", async () => {
  const user = userEvent.setup();
  const { createAppointmentRequest } = await import("@/lib/api/appointmentApi");

  vi.mocked(createAppointmentRequest).mockRejectedValueOnce({
    status: 500,
    message: "An unexpected error occurred",
  });

  render(<AppointmentForm />);
  await unlockForm(user);
  await fillValidAppointmentForm(user);
  await user.click(screen.getByRole("button", { name: "Envoyer ma demande" }));

  expect(
    await screen.findByText(
      "Le serveur a rencontré une erreur. Merci de réessayer un peu plus tard.",
    ),
  ).toBeInTheDocument();
});

test("clears stale success state when the user edits the form again", async () => {
  const user = userEvent.setup();
  const { createAppointmentRequest } = await import("@/lib/api/appointmentApi");

  vi.mocked(createAppointmentRequest).mockResolvedValueOnce({
    success: true,
    data: {
      id: "appt-2",
      status: "pending",
      appointmentDate: "2026-06-10",
      appointmentTime: "08:00",
      createdAt: "2026-05-24T00:00:00.000Z",
    },
    message: "ok",
  });

  render(<AppointmentForm />);
  await unlockForm(user);
  await fillValidAppointmentForm(user);
  await user.click(screen.getByRole("button", { name: "Envoyer ma demande" }));

  expect(
    await screen.findByText(
      "Votre demande a été envoyée. Nous vous recontacterons pour confirmation.",
    ),
  ).toBeInTheDocument();

  const remarksInput = document.querySelector(
    'textarea[name="remarks"]',
  ) as HTMLTextAreaElement;
  await user.type(remarksInput, " Nouveau commentaire");

  await waitFor(() =>
    expect(
      screen.queryByText(
        "Votre demande a été envoyée. Nous vous recontacterons pour confirmation.",
      ),
    ).not.toBeInTheDocument(),
  );
});
