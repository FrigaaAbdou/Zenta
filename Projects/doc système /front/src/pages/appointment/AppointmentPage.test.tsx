import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { LocaleProvider } from "@/i18n/locale";
import { AppointmentPage } from "@/pages/appointment/AppointmentPage";

test("switching to arabic updates direction and appointment headings", async () => {
  const user = userEvent.setup();

  if (typeof window.localStorage?.removeItem === "function") {
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

  await user.click(screen.getByLabelText("العمر بين 18 و65 سنة"));
  await user.click(screen.getByLabelText("الوزن الأدنى 50 كلغ"));
  await user.click(screen.getByLabelText("حالة صحية جيدة"));
  await user.click(screen.getByLabelText("عدم وجود مانع للتبرع"));
  await user.click(screen.getByRole("button", { name: "أطلب موعدا" }));

  expect(
    await screen.findByRole("heading", {
      level: 2,
      name: "المعلومات الشخصية",
    }),
  ).toBeInTheDocument();
  expect(screen.getByText("الاسم")).toBeInTheDocument();
  expect(screen.getByText("الولاية")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "إرسال طلبي" })).toBeInTheDocument();
});
