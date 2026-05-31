import { Person } from './Person';

export class Student extends Person {
  get role(): string {
    return 'STUDENT';
  }
}
