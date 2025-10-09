import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Trash2, 
  Shield,
  User
} from 'lucide-react';
import ChangePassword from './ChangePassword';
import '../App.css';

const UserManagement = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Erro ao carregar usuários');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${username}"? Esta ação não pode ser desfeita.`)) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setSuccess(`Usuário "${username}" excluído com sucesso`);
          fetchUsers();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          const data = await response.json();
          setError(data.error || 'Erro ao excluir usuário');
        }
      } catch (error) {
        setError('Erro de conexão. Tente novamente.');
      }
    }
  };

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setShowChangePassword(true);
  };

  const handleBackFromChangePassword = () => {
    setShowChangePassword(false);
    setSelectedUser(null);
  };

  if (showChangePassword && selectedUser) {
    return (
      <ChangePassword
        onBack={handleBackFromChangePassword}
        isAdmin={true}
        targetUserId={selectedUser.id}
        targetUsername={selectedUser.username}
      />
    );
  }

  return (
    <div className="mobile-container flex flex-col p-4">
      <Card className="auth-card w-full max-w-md mx-auto">
        <div className="auth-content">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl font-bold text-white">
                Gerenciar Usuários
              </CardTitle>
              <div className="w-8"></div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Carregando usuários...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum usuário encontrado
                  </p>
                ) : (
                  users.map((user) => (
                    <Card key={user.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {user.is_admin ? (
                                <Shield className="h-8 w-8 text-red-600" />
                              ) : (
                                <User className="h-8 w-8 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {user.username}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {user.email}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.is_admin ? 'Administrador' : 'Usuário'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleChangePassword(user)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              title="Alterar senha"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            
                            {!user.is_admin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(user.id, user.username)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                title="Excluir usuário"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                Total: {users.length} usuário{users.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default UserManagement;
