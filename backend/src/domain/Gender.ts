import { Gender as GenderEnum } from '@prisma/client';

export type GenderName = GenderEnum;

const labels: Record<GenderName, string> = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
  OTHER: 'Outro',
};

export class Gender {
  constructor(public readonly name: GenderName) {
    if (!(name in labels)) {
      throw new Error('Invalid gender');
    }
  }

  get label(): string {
    return labels[this.name];
  }

  toJSON(): GenderName {
    return this.name;
  }
}
