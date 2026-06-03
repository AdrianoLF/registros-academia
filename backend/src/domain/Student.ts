import { Person, PersonProps } from './Person';
import { assertMinAge } from './age';

export class Student extends Person {
  constructor(props: PersonProps) {
    super(props);
    assertMinAge(props.birthDate, 14);
  }

  get role(): string {
    return 'STUDENT';
  }
}
