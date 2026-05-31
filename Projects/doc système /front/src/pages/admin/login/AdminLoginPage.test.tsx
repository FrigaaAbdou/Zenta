import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminLoginPage } from "./AdminLoginPage";

const loginMock = vi.fn();

vi.mock("@/features/admin-auth/AdminAuthProvider", () => ({
  useAdminAuth: () => ({
    login: loginMock,
  }),
}));

describe("AdminLoginPage", () => {
  afterEach(() => {
    loginMock.mockReset();
  });

  it("submits credentials and redirects to the admin shell", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@cts.local",
      role: "manager",
      isActive: true,
    });

    render(
      <MemoryRouter initialEntries={["/admin/login"]}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<p>dashboard</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "admin@cts.local");
    await user.type(screen.getByLabelText("Mot de passe"), "secret123");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "admin@cts.local",
        password: "secret123",
      });
    });

    expect(await screen.findByText("dashboard")).toBeInTheDocument();
  });

  it("shows a server message when login fails", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue({
      message: "Identifiants invalides.",
    });

    render(
      <MemoryRouter initialEntries={["/admin/login"]}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "admin@cts.local");
    await user.type(screen.getByLabelText("Mot de passe"), "wrong");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(await screen.findByText("Identifiants invalides.")).toBeInTheDocument();
  });

  it("shows a service-unavailable message for generic request failures", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue({
      message: "Une erreur est survenue lors de la requête.",
    });

    render(
      <MemoryRouter initialEntries={["/admin/login"]}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "admin@cts.local");
    await user.type(screen.getByLabelText("Mot de passe"), "wrong");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(
      await screen.findByText(
        "Connexion impossible. Vérifiez que le service admin est disponible.",
      ),
    ).toBeInTheDocument();
  });
});
