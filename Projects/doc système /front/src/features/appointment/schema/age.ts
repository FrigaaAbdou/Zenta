export function getAgeFromBirthDate(
  birthDate: string,
  referenceDate = new Date(),
) {
  const parsedBirthDate = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(parsedBirthDate.getTime())) {
    return null;
  }

  let age = referenceDate.getFullYear() - parsedBirthDate.getFullYear();
  const monthDelta = referenceDate.getMonth() - parsedBirthDate.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && referenceDate.getDate() < parsedBirthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}

export function isAdultBirthDate(
  birthDate: string,
  minimumAge = 18,
  referenceDate = new Date(),
) {
  const age = getAgeFromBirthDate(birthDate, referenceDate);

  if (age === null) {
    return false;
  }

  return age >= minimumAge;
}
