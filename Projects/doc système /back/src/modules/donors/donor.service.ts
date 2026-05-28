import { DonorModel } from "./donor.model.js";

export type DonorDraft = {
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: "male" | "female";
  phone: string;
  email?: string | null;
  wilayaCode: string;
  commune: string;
  bloodGroup: string;
};

export async function findDonorByPhone(phone: string) {
  return DonorModel.findOne({ phone }).exec();
}

export async function upsertDonorByPhone(draft: DonorDraft) {
  const existingDonor = await findDonorByPhone(draft.phone);

  if (existingDonor) {
    existingDonor.firstName = draft.firstName;
    existingDonor.lastName = draft.lastName;
    existingDonor.birthDate = draft.birthDate;
    existingDonor.gender = draft.gender;
    existingDonor.email = draft.email ?? null;
    existingDonor.wilayaCode = draft.wilayaCode;
    existingDonor.commune = draft.commune;
    existingDonor.bloodGroup = draft.bloodGroup;

    await existingDonor.save();

    return existingDonor;
  }

  const donor = new DonorModel({
    ...draft,
    email: draft.email ?? null,
  });

  await donor.save();

  return donor;
}
