import { Person, PersonProps } from './Person';
import { assertMinAge } from './age';

export class Teacher extends Person {
  constructor(props: PersonProps) {
    super(props);
    assertMinAge(props.birthDate, 23);
  }

  get role(): string {
    return 'TEACHER';
  }
}
