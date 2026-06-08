import { useEffect, useState } from 'react';
import { getPersons, createPerson, updatePerson, deletePerson } from './api';
import { getPlans } from '../plans/api';
import { useError } from '../shared/ErrorContext';
import PersonForm, { empty } from './PersonForm';
import List from '../shared/List';

const genderLabels = { MALE: 'Masculino', FEMALE: 'Feminino', OTHER: 'Outro' };

function age(birthDate) {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function PersonManager({ title, role, emptyText }) {
  const [people, setPeople] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const showError = useError();
  const isStudent = role === 'STUDENT';

  function getPlanName(planId) {
    const plan = plans.find((p) => p.id === Number(planId));
    return plan ? plan.name : 'Sem plano';
  }

  function loadPeople() {
    getPersons(role)
      .then(setPeople)
      .catch((e) => showError(e.message));
  }

  function loadPlans() {
    getPlans()
      .then(setPlans)
      .catch((e) => showError(e.message));
  }

  useEffect(() => {
    loadPeople();
    if (isStudent) {
      loadPlans();
    }
  }, [role]);

  function reset() {
    setForm(empty);
    setEditingId(null);
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      email: p.email,
      birthDate: p.birthDate.slice(0, 10),
      gender: p.gender,
      cpf: p.cpf,
      planId: p.planId != null ? String(p.planId) : '',
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, role };
    if (!isStudent) {
      delete payload.planId;
    }
    try {
      if (editingId) {
        await updatePerson(editingId, payload);
      } else {
        await createPerson(payload);
      }
      reset();
      loadPeople();
    } catch (err) {
      showError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deletePerson(id);
      if (editingId === id) {
        reset();
      }
      loadPeople();
    } catch (err) {
      showError(err.message);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <PersonForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onCancel={reset}
        editing={editingId !== null}
        plans={plans}
        showPlan={isStudent}
      />
      <List
        items={people}
        empty={emptyText}
        renderItem={(p) => (
          <li key={p.id} className="px-4 py-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex gap-3">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-slate-500">{p.email}</span>
                </div>
                <div className="text-sm text-slate-400 mt-1 flex gap-4">
                  <span>{genderLabels[p.gender] || p.gender}</span>
                  <span>{age(p.birthDate)} anos</span>
                  <span>{p.cpf}</span>
                  {isStudent && (
                    <span className="text-indigo-500 font-medium">{getPlanName(p.planId)}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => startEdit(p)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          </li>
        )}
      />
    </div>
  );
}

export default PersonManager;
