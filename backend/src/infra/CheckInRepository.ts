import { prisma } from './prisma';
import { CheckIn, CheckInProps } from '../domain/checkin/CheckIn';
import { PaymentData } from './PaymentRepository';
import { buildPageResult, PageResult, ParsedPageQuery, skip } from '../domain/shared/pagination';

type Row = CheckInProps & { id: number; createdAt: Date };

function toDomain(row: Row): CheckIn {
  return new CheckIn(row);
}

export type CheckInData = Omit<CheckInProps, 'id' | 'createdAt'>;

export class CheckInRepository {
  async create(data: CheckInData): Promise<CheckIn> {
    const checkIn = toDomain({ ...data, id: 0, createdAt: new Date() });
    const saved = await prisma.checkIn.create({ data });
    checkIn.id = saved.id;
    checkIn.createdAt = saved.createdAt;
    return checkIn;
  }

  async createWithDailyPayment(
    checkInData: CheckInData,
    paymentData: PaymentData
  ): Promise<{ checkIn: CheckIn; payment: { id: number } }> {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({ data: paymentData });
      const checkIn = await tx.checkIn.create({ data: checkInData });
      return { payment, checkIn };
    });
    return {
      checkIn: toDomain(result.checkIn),
      payment: { id: result.payment.id },
    };
  }

  async findPageByPerson(personId: number, query: ParsedPageQuery): Promise<PageResult<CheckIn>> {
    const where = { personId };
    const total = await prisma.checkIn.count({ where });
    const rows = await prisma.checkIn.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: skip(query.page, query.limit),
      take: query.limit,
    });
    return buildPageResult(rows.map(toDomain), total, query.page, query.limit);
  }

  async countByPerson(personId: number): Promise<number> {
    return prisma.checkIn.count({ where: { personId } });
  }

  async countByPersonInMonth(personId: number, month: Date): Promise<number> {
    const start = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
    const end = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
    return prisma.checkIn.count({
      where: {
        personId,
        createdAt: { gte: start, lt: end },
      },
    });
  }
}
