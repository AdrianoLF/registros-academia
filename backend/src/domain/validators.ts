export function assertEmail(email: string): void {
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!ok) {
    throw new Error('Invalid email');
  }
}

export function assertBirthDate(birthDate: Date): void {
  const min = new Date('1900-01-01');
  const now = new Date();
  if (isNaN(birthDate.getTime()) || birthDate < min || birthDate > now) {
    throw new Error('Invalid birth date');
  }
}

export function assertCpf(cpf: string): void {
  if (!isValidCpf(cpf)) {
    throw new Error('Invalid CPF');
  }
}

function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }
  const checkDigit = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
}
