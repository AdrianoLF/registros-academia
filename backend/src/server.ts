import express from 'express';
import cors from 'cors';
import personRoutes from './handler/personHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Gym backend no ar' });
});

app.use('/persons', personRoutes);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`API on :${port}`));
