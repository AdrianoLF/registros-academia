import { Router } from 'express';
import { PersonRepository } from '../infra/PersonRepository';

const router = Router();
const repository = new PersonRepository();

router.get('/', async (_req, res) => {
  const persons = await repository.findAll();
  res.json(persons);
});

router.post('/', async (req, res) => {
  try {
    const { name, email, birthDate, gender, cpf, role } = req.body;
    const person = await repository.create({
      name,
      email,
      birthDate: new Date(birthDate),
      gender,
      cpf,
      role,
    });
    res.status(201).json(person);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
