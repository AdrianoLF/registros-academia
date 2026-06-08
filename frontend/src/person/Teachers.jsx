import { Navigate, useParams } from 'react-router-dom';
import PersonManager from './PersonManager';

function Teachers() {
  const { tab } = useParams();
  if (tab !== 'ativos' && tab !== 'inativos') {
    return <Navigate to="/professores/ativos" replace />;
  }
  return (
    <PersonManager
      title="Professores"
      role="TEACHER"
      basePath="professores"
      listTab={tab}
      emptyText="Nenhum professor cadastrado."
    />
  );
}

export default Teachers;
