import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, 
  Plus, 
  Minus, 
  Calendar, 
  Clock, 
  Users, 
  Building,
  Hash
} from 'lucide-react';
import '../App.css';

const WorkingHoursForm = ({ onClose, onSuccess, editingEntry }) => {
  const [isBulkMode, setIsBulkMode] = useState(false);

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
  const [entries, setEntries] = useState([{
    data: '',
    ps: '',
    base: '',
    inicio: '',
    fim: '',
    numero_alunos: '',
    tipo_alunos: ''
  }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingEntry) {
      setEntries([{
        data: editingEntry.data,
        ps: editingEntry.ps.toString(),
        base: editingEntry.base,
        inicio: editingEntry.inicio,
        fim: editingEntry.fim,
        numero_alunos: editingEntry.numero_alunos.toString(),
        tipo_alunos: editingEntry.tipo_alunos
      }]);
      setIsBulkMode(false);
    }
  }, [editingEntry]);

  const addEntry = () => {
    const lastEntry = entries[entries.length - 1];
    setEntries([...entries, {
      data: lastEntry.data,
      ps: lastEntry.ps,
      base: '',
      inicio: '',
      fim: '',
      numero_alunos: '',
      tipo_alunos: ''
    }]);
  };

  const removeEntry = (index) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
  };

  const validateEntry = (entry) => {
    const required = ['data', 'ps', 'base', 'inicio', 'fim', 'numero_alunos', 'tipo_alunos'];
    for (let field of required) {
      if (!entry[field] || entry[field].trim() === '') {
        return `Campo ${field} é obrigatório`;
      }
    }

    // Validar formato da data
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(entry.data)) {
      return 'Data deve estar no formato DD/MM/YYYY';
    }

    // Validar formato do horário
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(entry.inicio) || !timeRegex.test(entry.fim)) {
      return 'Horários devem estar no formato HH:MM';
    }

    // Validar números
    if (isNaN(entry.ps) || parseInt(entry.ps) <= 0) {
      return 'PS deve ser um número válido';
    }

    if (isNaN(entry.numero_alunos) || parseInt(entry.numero_alunos) <= 0) {
      return 'Número de alunos deve ser um número válido';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar todas as entradas
    for (let i = 0; i < entries.length; i++) {
      const validationError = validateEntry(entries[i]);
      if (validationError) {
        setError(`Entrada ${i + 1}: ${validationError}`);
        setLoading(false);
        return;
      }
    }

    try {
      let response;
      
      if (editingEntry) {
        // Editar entrada existente
        response = await fetch(`/api/working-hours/${editingEntry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entries[0]),
        });
      } else if (entries.length === 1) {
        // Criar entrada única
        response = await fetch('/api/working-hours', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entries[0]),
        });
      } else {
        // Criar múltiplas entradas
        response = await fetch('/api/working-hours/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ entries }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        onSuccess(data);
      } else {
        setError(data.error || 'Erro ao salvar dados');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const renderEntryForm = (entry, index) => (
    <div key={index} className={`bulk-entry ${index === 0 ? 'active' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-gray-700">
          {editingEntry ? 'Editar Registro' : `Registro ${index + 1}`}
        </h4>
        {!editingEntry && entries.length > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeEntry(index)}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="date"
            placeholder="informar data"
            value={formatDateForInput(entry.data)}
            onChange={(e) => updateEntry(index, 'data', formatDateForAPI(e.target.value))}
            className="form-input pl-10"
            required
          />
          <label className="text-xs text-gray-500 mt-1 block">Data</label>
        </div>

        <div className="relative">
          <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="number"
            placeholder="PS"
            value={entry.ps}
            onChange={(e) => updateEntry(index, 'ps', e.target.value)}
            className="form-input pl-10"
            required
          />
          <label className="text-xs text-gray-500 mt-1 block">PS</label>
        </div>

        <div className="col-span-2 relative">
          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Base"
            value={entry.base}
            onChange={(e) => updateEntry(index, 'base', e.target.value)}
            className="form-input pl-10"
            required
          />
          <label className="text-xs text-gray-500 mt-1 block">Base</label>
        </div>

        <div className="relative">
          <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="HH:MM"
            value={entry.inicio}
            onChange={(e) => updateEntry(index, 'inicio', e.target.value)}
            className="form-input pl-10"
            required
          />
          <label className="text-xs text-gray-500 mt-1 block">Início</label>
        </div>

        <div className="relative">
          <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="HH:MM"
            value={entry.fim}
            onChange={(e) => updateEntry(index, 'fim', e.target.value)}
            className="form-input pl-10"
            required
          />
          <label className="text-xs text-gray-500 mt-1 block">Fim</label>
        </div>

        <div className="relative">
          <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="number"
            placeholder="Número"
            value={entry.numero_alunos}
            onChange={(e) => updateEntry(index, 'numero_alunos', e.target.value)}
            className="form-input pl-10"
            required
          />
          <label className="text-xs text-gray-500 mt-1 block">Nº Alunos</label>
        </div>

        <div className="relative">
          <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tipo de alunos"
            value={entry.tipo_alunos}
            onChange={(e) => updateEntry(index, 'tipo_alunos', e.target.value)}
            className="form-input pl-10"
            required
          />
          <label className="text-xs text-gray-500 mt-1 block">Tipo Alunos</label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">
            {editingEntry ? 'Editar Registro' : 'Novo Registro'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingEntry && (
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">
                  Múltiplos lançamentos
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkMode(!isBulkMode)}
                >
                  {isBulkMode ? 'Modo Único' : 'Modo Múltiplo'}
                </Button>
              </div>
            )}

            {entries.map((entry, index) => renderEntryForm(entry, index))}

            {!editingEntry && isBulkMode && (
              <Button
                type="button"
                variant="outline"
                onClick={addEntry}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Registro
              </Button>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 primary-button"
              >
                {loading ? 'Salvando...' : (editingEntry ? 'Atualizar' : 'Salvar')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkingHoursForm;
