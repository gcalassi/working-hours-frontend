import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Clock, 
  Users, 
  Calendar, 
  LogOut, 
  Settings,
  Download,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import WorkingHoursForm from './WorkingHoursForm';
import ChangePassword from './ChangePassword';
import UserManagement from './UserManagement';
import SearchEntries from './SearchEntries';
import '../App.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workingHours, setWorkingHours] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchWorkingHours();
      fetchStats();
    }
  }, [activeTab]);

  const fetchWorkingHours = async () => {
    try {
      const response = await fetch('/api/working-hours');
      if (response.ok) {
        const data = await response.json();
        setWorkingHours(data);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/working-hours/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleExport = async () => {
    if (!user?.is_admin) return;
    
    try {
      const response = await fetch('/api/working-hours/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'working_hours_export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!user?.is_admin) return;
    
    if (window.confirm('Tem certeza que deseja deletar este registro?')) {
      try {
        const response = await fetch(`/api/working-hours/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchWorkingHours();
          fetchStats();
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

    const handleFormSuccess = (updatedEntry = null) => {
    setShowForm(false);
    setEditingEntry(null);
    // Se uma entrada foi atualizada/criada, podemos tentar atualizar o estado localmente
    if (updatedEntry) {
      setWorkingHours(prevHours => {
        const existingIndex = prevHours.findIndex(h => h.id === updatedEntry.id);
        if (existingIndex > -1) {
          // Atualizar entrada existente
          const newHours = [...prevHours];
          newHours[existingIndex] = updatedEntry;
          return newHours;
        } else {
          // Adicionar nova entrada
          return [updatedEntry, ...prevHours];
        }
      });
    } else {
      // Se não houver updatedEntry, buscar tudo novamente para garantir consistência
      fetchWorkingHours();
    }
    fetchStats();
  };

  const renderDashboard = () => (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {user?.username}!
          </h1>
          <p className="text-gray-600">
            {user?.is_admin ? 'Administrador' : 'Usuário'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowChangePassword(true)}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Senha
          </Button>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total de Registros</p>
                <p className="text-2xl font-bold text-white">
                  {stats.total_entries || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        {user?.is_admin && (
          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total de Usuários</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.total_users || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Admin Actions */}
      {user?.is_admin && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Ações do Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleExport}
              className="w-full mb-2"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados (CSV)
            </Button>
            <Button
              onClick={() => setShowUserManagement(true)}
              className="w-full"
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Usuários
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registros Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {workingHours.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhum registro encontrado
            </p>
          ) : (
            <div className="space-y-3">
              {workingHours.slice(0, 5).map((entry) => (
                <div key={entry.id} className="entry-card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold">{entry.data}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {entry.base} - PS {entry.ps}
                      </p>
                      <p className="text-sm text-gray-600">
                        {entry.inicio} às {entry.fim}
                      </p>
                      <p className="text-sm text-gray-600">
                        {entry.numero_alunos} alunos ({entry.tipo_alunos})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {user?.is_admin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowForm(true)}
        className="floating-action-button"
      >
        <Plus />
      </button>
    </div>
  );

  const renderEntries = () => (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Todos os Registros</h2>
        <Button
          onClick={() => setShowForm(true)}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo
        </Button>
      </div>

      {workingHours.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum registro encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {workingHours.map((entry) => (
            <div key={entry.id} className="entry-card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">{entry.data}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {entry.base} - PS {entry.ps}
                  </p>
                  <p className="text-sm text-gray-600">
                    {entry.inicio} às {entry.fim}
                  </p>
                  <p className="text-sm text-gray-600">
                    {entry.numero_alunos} alunos ({entry.tipo_alunos})
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(entry)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {user?.is_admin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mobile-container">
      {showChangePassword && (
        <ChangePassword
          onBack={() => setShowChangePassword(false)}
          isAdmin={false}
        />
      )}

      {showUserManagement && (
        <UserManagement
          onBack={() => setShowUserManagement(false)}
        />
      )}

      {showSearch && (
        <SearchEntries
          onBack={() => setShowSearch(false)}
          onEdit={handleEdit}
        />
      )}

      {showForm && (
        <WorkingHoursForm
          onClose={() => {
            setShowForm(false);
            setEditingEntry(null);
          }}
          onSuccess={handleFormSuccess}
          editingEntry={editingEntry}
        />
      )}

      {!showChangePassword && !showUserManagement && !showSearch && activeTab === 'dashboard' && renderDashboard()}
      {!showChangePassword && !showUserManagement && !showSearch && activeTab === 'entries' && renderEntries()}

      {/* Navigation Bar */}
      {!showChangePassword && !showUserManagement && !showSearch && (
        <div className="navigation-bar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <Clock className="h-5 w-5 mb-1" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('entries')}
          className={`nav-item ${activeTab === 'entries' ? 'active' : ''}`}
        >
          <Calendar className="h-5 w-5 mb-1" />
          Registros
        </button>
        <button
          onClick={() => setShowSearch(true)}
          className="nav-item"
        >
          <Search className="h-5 w-5 mb-1" />
          Pesquisar
        </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
