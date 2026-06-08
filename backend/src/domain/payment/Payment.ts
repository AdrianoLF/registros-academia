export type PaymentProps = {
  id?: number;
  personId: number;
  planId: number;
  priceCents: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt?: Date;
};

export class Payment {
  id!: number;
  personId!: number;
  planId!: number;
  priceCents!: number;
  periodStart!: Date;
  periodEnd!: Date;
  createdAt!: Date;

  constructor(props: PaymentProps) {
    Object.assign(this, props);
  }

  covers(day: Date): boolean {
    const start = this.periodStart.getTime();
    const end = this.periodEnd.getTime();
    const at = day.getTime();
    return at >= start && at < end;
  }

  toJSON() {
    return {
      id: this.id,
      personId: this.personId,
      planId: this.planId,
      priceCents: this.priceCents,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      createdAt: this.createdAt,
    };
  }
}
