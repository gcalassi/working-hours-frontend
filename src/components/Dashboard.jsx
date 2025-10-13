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
import { apiFetch } from '@/lib/api';

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
      const response = await apiFetch('/working-hours');
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
      const response = await apiFetch('/working-hours/stats');
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
      const response = await apiFetch('/working-hours/export');
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
        const response = await apiFetch(`/working-hours/${id}`, { method: 'DELETE' });
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
    if (updatedEntry) {
      setWorkingHours(prev => {
        const i = prev.findIndex(h => h.id === updatedEntry.id);
        if (i > -1) {
          const next = [...prev];
          next[i] = updatedEntry;
          return next;
        }
        return [updatedEntry, ...prev];
      });
    } else {
      fetchWorkingHours();
    }
    fetchStats();
  };

  // … resto igual ao seu arquivo (renderDashboard / renderEntries / return)
};

export default Dashboard;
