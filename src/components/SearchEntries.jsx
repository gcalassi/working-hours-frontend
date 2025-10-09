import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Search, 
  Calendar,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const SearchEntries = ({ onBack, onEdit }) => {
  const { user } = useAuth();
  const [searchDate, setSearchDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('single'); // 'single' ou 'range'

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSearch = async () => {
    setError('');
    setLoading(true);

    try {
      let url = '/api/working-hours/search?';
      
      if (searchType === 'single' && searchDate) {
        url += `date=${formatDateForAPI(searchDate)}`;
      } else if (searchType === 'range') {
        if (startDate) url += `start_date=${formatDateForAPI(startDate)}`;
        if (endDate) url += `${startDate ? '&' : ''}end_date=${formatDateForAPI(endDate)}`;
      }

      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao buscar registros');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!user?.is_admin) return;
    
    if (window.confirm('Tem certeza que deseja deletar este registro?')) {
      try {
        const response = await fetch(`/api/working-hours/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setSearchResults(searchResults.filter(entry => entry.id !== id));
        }
      } catch (error) {
        setError('Erro ao deletar registro');
      }
    }
  };

  const clearSearch = () => {
    setSearchDate('');
    setStartDate('');
    setEndDate('');
    setSearchResults([]);
    setError('');
  };

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
                Pesquisar Registros
              </CardTitle>
              <div className="w-8"></div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Tipo de pesquisa */}
            <div className="flex space-x-2">
              <Button
                variant={searchType === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('single')}
                className="flex-1"
              >
                Data Específica
              </Button>
              <Button
                variant={searchType === 'range' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('range')}
                className="flex-1"
              >
                Período
              </Button>
            </div>

            {/* Campos de pesquisa */}
            {searchType === 'single' ? (
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Selecione uma data"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Data inicial"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Data final"
                  />
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex space-x-2">
              <Button
                onClick={handleSearch}
                disabled={loading || (searchType === 'single' ? !searchDate : !startDate && !endDate)}
                className="primary-button flex-1"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
              <Button
                onClick={clearSearch}
                variant="outline"
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Resultados da pesquisa */}
            {searchResults.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-gray-900">
                    Resultados ({searchResults.length})
                  </h3>
                </div>
                
                {searchResults.map((entry) => (
                  <Card key={entry.id} className="border border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              {entry.data}
                            </span>
                            <span className="text-sm text-gray-600">
                              {entry.base} - PS {entry.ps}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{entry.inicio} às {entry.fim}</p>
                            <p>{entry.numero_alunos} alunos ({entry.tipo_alunos})</p>
                            {entry.user && (
                              <p className="text-xs text-gray-500">
                                Por: {entry.user.username}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(entry)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {searchResults.length === 0 && !loading && !error && (searchDate || startDate || endDate) && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum registro encontrado para os critérios de busca.</p>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default SearchEntries;
