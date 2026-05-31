import express from 'express';

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Gym backend no ar' });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`API on :${port}`));
