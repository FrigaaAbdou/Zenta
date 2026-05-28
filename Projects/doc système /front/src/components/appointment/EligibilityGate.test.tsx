import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { EligibilityGate } from "@/components/appointment/EligibilityGate";

function EligibilityGateHarness() {
  const [value, setValue] = useState({
    ageConfirmed: true,
    weightConfirmed: true,
    healthyConfirmed: true,
    noContraIndicationConfirmed: true,
  });

  return (
    <EligibilityGate value={value} onChange={setValue} onContinue={() => {}} />
  );
}

test("disables continuation when a required checkbox is unchecked", async () => {
  const user = userEvent.setup();

  render(<EligibilityGateHarness />);

  const ageCheckbox = screen.getByLabelText("Âge entre 18 et 65 ans");
  await user.click(ageCheckbox);

  expect(
    screen.getByRole("button", { name: "Prendre rendez-vous" }),
  ).toBeDisabled();
});
