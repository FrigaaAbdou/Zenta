import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { LocaleProvider } from "@/i18n/locale";
import { AppointmentPage } from "@/pages/appointment/AppointmentPage";

test("switching to arabic updates direction and appointment headings", () => {
  if (typeof window.localStorage.removeItem === "function") {
    window.localStorage.removeItem("cts-app-locale");
  }

  render(
    <LocaleProvider>
      <MemoryRouter>
        <AppointmentPage />
      </MemoryRouter>
    </LocaleProvider>,
  );

  fireEvent.click(screen.getAllByRole("button", { name: "AR" })[0]);

  expect(document.documentElement.dir).toBe("rtl");
  expect(
    screen.getByRole("heading", { level: 1, name: /استمارة طلب موعد/i }),
  ).toBeInTheDocument();
});
