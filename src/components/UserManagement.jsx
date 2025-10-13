// imports iguais
import { apiFetch } from '@/lib/api';

const UserManagement = ({ onBack }) => {
  // states iguais

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/users');
      if (response.ok) {
        setUsers(await response.json());
      } else {
        setError('Erro ao carregar usuários');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${username}"? Esta ação não pode ser desfeita.`)) {
      try {
        const response = await apiFetch(`/users/${userId}`, { method: 'DELETE' });
        if (response.ok) {
          setSuccess(`Usuário "${username}" excluído com sucesso`);
          fetchUsers();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          const data = await response.json().catch(() => ({}));
          setError(data.error || 'Erro ao excluir usuário');
        }
      } catch {
        setError('Erro de conexão. Tente novamente.');
      }
    }
  };

  // … resto igual ao seu arquivo (UI)
};

export default UserManagement;
