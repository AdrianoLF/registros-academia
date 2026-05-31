import { useEffect, useState } from 'react';
import { getPersons, createPerson } from './api';
import { useError } from '../shared/ErrorContext';
import PersonForm, { empty } from './PersonForm';
import List from '../shared/List';

function PersonManager({ title, role, emptyText }) {
  const [people, setPeople] = useState([]);
  const [form, setForm] = useState(empty);
  const showError = useError();

  function load() {
    getPersons(role)
      .then(setPeople)
      .catch((e) => showError(e.message));
  }

  useEffect(load, [role]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createPerson({ ...form, role });
      setForm(empty);
      load();
    } catch (err) {
      showError(err.message);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <PersonForm form={form} setForm={setForm} onSubmit={handleSubmit} />
      <List
        items={people}
        empty={emptyText}
        renderItem={(p) => (
          <li key={p.id} className="px-4 py-3 flex justify-between">
            <span className="font-medium">{p.name}</span>
            <span className="text-slate-500">{p.email}</span>
          </li>
        )}
      />
    </div>
  );
}

export default PersonManager;
