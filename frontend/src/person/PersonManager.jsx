import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersons, createPerson, updatePerson } from './api';
import { getPlans } from '../plans/api';
import { useError } from '../shared/ErrorContext';
import PersonForm, { empty } from './PersonForm';
import List from '../shared/List';
import Modal from '../shared/Modal';
import Tabs from '../shared/Tabs';
import LoadingPanel from '../shared/LoadingPanel';
import IconButton, { PencilIcon } from '../shared/IconButton';
import Toggle from '../shared/Toggle';
import ConfirmModal from '../shared/ConfirmModal';

const genderLabels = { MALE: 'Masculino', FEMALE: 'Feminino', OTHER: 'Outro' };
const tabs = [
  { key: 'ativos', label: 'Ativos' },
  { key: 'inativos', label: 'Inativos' },
];

function age(birthDate) {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function PersonManager({ title, role, basePath, listTab, emptyText }) {
  const navigate = useNavigate();
  const [people, setPeople] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(empty);
  const [editForm, setEditForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const showError = useError();
  const isStudent = role === 'STUDENT';
  const showActive = listTab === 'ativos';

  function getPlanName(planId) {
    const plan = plans.find((p) => p.id === Number(planId));
    return plan ? plan.name : 'Sem plano';
  }

  function toForm(person) {
    return {
      name: person.name,
      email: person.email,
      birthDate: person.birthDate.slice(0, 10),
      gender: person.gender,
      cpf: person.cpf,
      planId: person.planId != null ? String(person.planId) : '',
    };
  }

  function toPayload(formData, enabled) {
    const payload = { ...formData, role, enabled };
    if (!isStudent) {
      delete payload.planId;
    }
    return payload;
  }

  async function loadPeople() {
    setLoadingList(true);
    try {
      const list = await getPersons(role);
      setPeople(list);
    } catch (e) {
      showError(e.message);
    } finally {
      setLoadingList(false);
    }
  }

  async function loadPlans() {
    try {
      setPlans(await getPlans());
    } catch (e) {
      showError(e.message);
    }
  }

  useEffect(() => {
    loadPeople();
    if (isStudent) {
      loadPlans();
    }
  }, [role]);

  const filtered = people.filter((p) => (showActive ? p.enabled : !p.enabled));

  function openEdit(person) {
    setEditing(person);
    setEditForm(toForm(person));
  }

  function closeEdit() {
    setEditing(null);
    setEditForm(empty);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setLoadingCreate(true);
    try {
      await createPerson(toPayload(form, true));
      setForm(empty);
      await loadPeople();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    setLoadingEdit(true);
    try {
      await updatePerson(editing.id, toPayload(editForm, editing.enabled));
      closeEdit();
      await loadPeople();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoadingEdit(false);
    }
  }

  function requestToggle(person, nextEnabled) {
    setConfirmToggle({ person, nextEnabled });
  }

  async function confirmTogglePerson() {
    const { person, nextEnabled } = confirmToggle;
    setTogglingId(person.id);
    try {
      await updatePerson(person.id, toPayload(toForm(person), nextEnabled));
      setConfirmToggle(null);
      await loadPeople();
    } catch (err) {
      showError(err.message);
    } finally {
      setTogglingId(null);
    }
  }

  const emptyLabel = showActive ? emptyText : 'Nenhum inativo.';

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>

      <PersonForm
        form={form}
        setForm={setForm}
        onSubmit={handleCreate}
        submitLabel="Adicionar"
        plans={plans}
        showPlan={isStudent}
        loading={loadingCreate}
      />

      <Tabs tabs={tabs} active={listTab} onChange={(key) => navigate(`/${basePath}/${key}`)} />

      {loadingList ? (
        <LoadingPanel />
      ) : (
        <List
          items={filtered}
          empty={emptyLabel}
          renderItem={(p) => (
            <li key={p.id} className="px-4 py-3">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="flex gap-3 flex-wrap">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-slate-500">{p.email}</span>
                  </div>
                  <div className="text-sm text-slate-400 mt-1 flex flex-wrap gap-4">
                    <span>{genderLabels[p.gender] || p.gender}</span>
                    <span>{age(p.birthDate)} anos</span>
                    <span>{p.cpf}</span>
                    {isStudent && (
                      <span className="text-indigo-500 font-medium">{getPlanName(p.planId)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Toggle
                    enabled={p.enabled}
                    loading={togglingId === p.id}
                    onChange={(next) => requestToggle(p, next)}
                  />
                  <IconButton label="Editar" onClick={() => openEdit(p)}>
                    <PencilIcon />
                  </IconButton>
                </div>
              </div>
            </li>
          )}
        />
      )}

      <Modal
        open={editing !== null}
        title={isStudent ? 'Editar aluno' : 'Editar professor'}
        onClose={closeEdit}
      >
        <PersonForm
          form={editForm}
          setForm={setEditForm}
          onSubmit={handleEdit}
          onCancel={closeEdit}
          submitLabel="Salvar"
          plans={plans}
          showPlan={isStudent}
          loading={loadingEdit}
          plain
        />
      </Modal>

      <ConfirmModal
        open={confirmToggle !== null}
        title={confirmToggle?.nextEnabled ? 'Ativar' : 'Desativar'}
        message={
          confirmToggle
            ? `Tem certeza que deseja ${confirmToggle.nextEnabled ? 'ativar' : 'desativar'} ${confirmToggle.person.name}?`
            : ''
        }
        confirmLabel={confirmToggle?.nextEnabled ? 'Ativar' : 'Desativar'}
        danger={confirmToggle ? !confirmToggle.nextEnabled : false}
        loading={togglingId !== null}
        onConfirm={confirmTogglePerson}
        onCancel={() => setConfirmToggle(null)}
      />
    </div>
  );
}

export default PersonManager;
