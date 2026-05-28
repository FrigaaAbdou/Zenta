import { describe, expect, it } from "vitest";

import { DonorModel } from "../modules/donors/donor.model.js";

describe("DonorModel", () => {
  it("accepts a valid donor payload", () => {
    const donor = new DonorModel({
      firstName: "Amine",
      lastName: "Brahimi",
      birthDate: new Date("1994-06-10"),
      gender: "male",
      phone: "+213560000000",
      email: "amine@example.com",
      wilayaCode: "16",
      commune: "Sidi M'Hamed",
      bloodGroup: "O+",
    });

    expect(donor.validateSync()).toBeUndefined();
  });

  it("requires the donor phone number", () => {
    const donor = new DonorModel({
      firstName: "Amine",
      lastName: "Brahimi",
      birthDate: new Date("1994-06-10"),
      gender: "male",
      wilayaCode: "16",
      commune: "Sidi M'Hamed",
      bloodGroup: "O+",
    });

    const validationError = donor.validateSync();

    expect(validationError?.errors.phone?.message).toMatch(/required/i);
  });
});
