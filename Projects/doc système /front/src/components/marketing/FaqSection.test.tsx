import { render, screen } from "@testing-library/react";

import { FaqSection } from "@/components/marketing/FaqSection";

vi.mock("@/i18n/locale", () => ({
  useLocale: () => ({
    locale: "ar",
    direction: "rtl",
    setLocale: vi.fn(),
  }),
}));

test("renders localized arabic fallback faq content when no items are provided", () => {
  render(<FaqSection items={[]} />);

  expect(
    screen.getByRole("heading", { name: /الأسئلة الشائعة/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/من يمكنه التبرع بالدم/i)).toBeInTheDocument();
});
