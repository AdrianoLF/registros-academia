import { Person } from './Person';

export class Teacher extends Person {
  get role(): string {
    return 'TEACHER';
  }
  viewStudent(): void {}
  createWorkout(): void {}
}
