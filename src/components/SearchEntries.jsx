import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Search, Calendar, Edit, Trash2, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';
import { apiFetch } from '@/lib/api';

const SearchEntries = ({ onBack, onEdit }) => {
  // ... seus states / helpers iguais

  const handleSearch = async () => {
    setError('');
    setLoading(true);
    try {
      let url = '/working-hours/search?';
      if (searchType === 'single' && searchDate) {
        url += `date=${formatDateForAPI(searchDate)}`;
      } else if (searchType === 'range') {
        if (startDate) url += `start_date=${formatDateForAPI(startDate)}`;
        if (endDate) url += `${startDate ? '&' : ''}end_date=${formatDateForAPI(endDate)}`;
      }
      const response = await apiFetch(url);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Erro ao buscar registros');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!user?.is_admin) return;
    if (window.confirm('Tem certeza que deseja deletar este registro?')) {
      try {
        const response = await apiFetch(`/working-hours/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setSearchResults(prev => prev.filter(e => e.id !== id));
        }
      } catch {
        setError('Erro ao deletar registro');
      }
    }
  };

  // … resto igual ao seu arquivo (UI)
};

export default SearchEntries;
