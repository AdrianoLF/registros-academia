import { Navigate, useParams } from 'react-router-dom';
import PersonManager from './PersonManager';

function Students() {
  const { tab } = useParams();
  if (tab !== 'ativos' && tab !== 'inativos') {
    return <Navigate to="/alunos/ativos" replace />;
  }
  return (
    <PersonManager
      title="Alunos"
      role="STUDENT"
      basePath="alunos"
      listTab={tab}
      emptyText="Nenhum aluno cadastrado."
    />
  );
}

export default Students;
