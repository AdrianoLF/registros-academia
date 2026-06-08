export type CheckInProps = {
  id?: number;
  personId: number;
  planId: number;
  createdAt?: Date;
};

export class CheckIn {
  id!: number;
  personId!: number;
  planId!: number;
  createdAt!: Date;

  constructor(props: CheckInProps) {
    Object.assign(this, props);
  }

  toJSON() {
    return {
      id: this.id,
      personId: this.personId,
      planId: this.planId,
      createdAt: this.createdAt,
    };
  }
}
