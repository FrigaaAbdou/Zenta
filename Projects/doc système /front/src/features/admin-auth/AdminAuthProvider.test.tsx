import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminAuthProvider, useAdminAuth } from "./AdminAuthProvider";

vi.mock("@/lib/api/adminAuthApi", () => ({
  getAdminMe: vi.fn(),
  loginAdmin: vi.fn(),
  logoutAdmin: vi.fn(),
}));

import { getAdminMe, loginAdmin, logoutAdmin } from "@/lib/api/adminAuthApi";

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}

function Consumer() {
  const { admin, status, login, logout } = useAdminAuth();

  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="email">{admin?.email ?? "none"}</p>
      <button
        type="button"
        onClick={() =>
          void login({ email: "admin@cts.local", password: "secret123" })
        }
      >
        login
      </button>
      <button type="button" onClick={() => void logout()}>
        logout
      </button>
    </div>
  );
}

describe("AdminAuthProvider", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: createLocalStorageMock(),
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("restores an existing admin session from local storage", async () => {
    window.localStorage.setItem("cts-admin-token", "stored-token");
    vi.mocked(getAdminMe).mockResolvedValue({
      admin: {
        id: "admin-1",
        email: "admin@cts.local",
        role: "manager",
        isActive: true,
      },
    });

    render(
      <AdminAuthProvider>
        <Consumer />
      </AdminAuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    expect(screen.getByTestId("email")).toHaveTextContent("admin@cts.local");
    expect(getAdminMe).toHaveBeenCalledWith("stored-token");
  });

  it("logs in and persists the admin token", async () => {
    const user = userEvent.setup();

    vi.mocked(loginAdmin).mockResolvedValue({
      token: "fresh-token",
      expiresIn: "8h",
      admin: {
        id: "admin-1",
        email: "admin@cts.local",
        role: "super_admin",
        isActive: true,
      },
    });

    render(
      <AdminAuthProvider>
        <Consumer />
      </AdminAuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    expect(window.localStorage.getItem("cts-admin-token")).toBe("fresh-token");
    expect(screen.getByTestId("email")).toHaveTextContent("admin@cts.local");
  });

  it("logs out and clears the stored token", async () => {
    const user = userEvent.setup();

    vi.mocked(loginAdmin).mockResolvedValue({
      token: "fresh-token",
      expiresIn: "8h",
      admin: {
        id: "admin-1",
        email: "admin@cts.local",
        role: "operator",
        isActive: true,
      },
    });
    vi.mocked(logoutAdmin).mockResolvedValue(undefined);

    render(
      <AdminAuthProvider>
        <Consumer />
      </AdminAuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "login" }));
    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    await user.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated");
    });

    expect(window.localStorage.getItem("cts-admin-token")).toBeNull();
    expect(logoutAdmin).toHaveBeenCalledWith("fresh-token");
  });
});
