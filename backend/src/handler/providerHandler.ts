import { Router } from 'express';
import { allProviders } from '../domain/provider/providers';

const router = Router();

router.get('/', (_req, res) => {
  res.json(allProviders().map((provider) => provider.toJSON()));
});

export default router;
