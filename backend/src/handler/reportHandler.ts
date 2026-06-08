import { Router } from 'express';
import { CheckInRepository } from '../infra/CheckInRepository';
import { buildDailyCheckInCounts, lastWeekRange } from '../domain/services/DailyCheckInsReport';

const router = Router();
const checkIns = new CheckInRepository();

router.get('/daily-checkins', async (_req, res) => {
  try {
    const now = new Date();
    const { from, to } = lastWeekRange(now);
    const timestamps = await checkIns.listCreatedAtBetween(from, to);
    const days = buildDailyCheckInCounts(timestamps, from, to);
    const total = days.reduce((sum, day) => sum + day.count, 0);
    res.json({
      from: from.toISOString(),
      to: to.toISOString(),
      days,
      total,
    });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
