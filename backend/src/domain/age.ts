export function assertMinAge(birthDate: Date, minAge: number): void {
  if (ageOf(birthDate) < minAge) {
    throw new Error(`Minimum age is ${minAge}`);
  }
}

function ageOf(birthDate: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
