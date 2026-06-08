import { prisma } from './prisma';
import { Payment, PaymentProps } from '../domain/payment/Payment';
import { startOfUtcDay } from '../domain/shared/dates';
import { buildPageResult, PageResult, ParsedPageQuery, skip } from '../domain/shared/pagination';

type Row = PaymentProps & { id: number; createdAt: Date };

function toDomain(row: Row): Payment {
  return new Payment(row);
}

export type PaymentData = Omit<PaymentProps, 'id' | 'createdAt'>;

export class PaymentRepository {
  async create(data: PaymentData): Promise<Payment> {
    const payment = toDomain({ ...data, id: 0, createdAt: new Date() });
    const saved = await prisma.payment.create({ data });
    payment.id = saved.id;
    payment.createdAt = saved.createdAt;
    return payment;
  }

  async listByPerson(personId: number): Promise<Payment[]> {
    const rows = await prisma.payment.findMany({
      where: { personId },
      orderBy: { periodStart: 'desc' },
    });
    return rows.map(toDomain);
  }

  async findPageByPerson(personId: number, query: ParsedPageQuery): Promise<PageResult<Payment>> {
    const where = { personId };
    const total = await prisma.payment.count({ where });
    const rows = await prisma.payment.findMany({
      where,
      orderBy: { periodStart: 'desc' },
      skip: skip(query.page, query.limit),
      take: query.limit,
    });
    return buildPageResult(rows.map(toDomain), total, query.page, query.limit);
  }

  async findCovering(personId: number, day: Date): Promise<Payment[]> {
    const at = startOfUtcDay(day);
    const rows = await prisma.payment.findMany({
      where: {
        personId,
        periodStart: { lte: at },
        periodEnd: { gt: at },
      },
    });
    return rows.map(toDomain);
  }
}
