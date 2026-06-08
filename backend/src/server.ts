import express from 'express';
import cors from 'cors';
import personRoutes from './handler/personHandler';
import providerRoutes from './handler/providerHandler';
import planRoutes from './handler/planHandler';
import paymentRoutes from './handler/paymentHandler';
import checkInRoutes from './handler/checkInHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Gym backend no ar' });
});

app.use('/persons', personRoutes);
app.use('/providers', providerRoutes);
app.use('/plans', planRoutes);
app.use('/payments', paymentRoutes);
app.use('/checkins', checkInRoutes);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`API on :${port}`));
