/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProsthodonticCase, BoardColumn, AppUser, UrgencyLevel } from './types';
import LoginDialog from './components/LoginDialog';
import AddCaseModal from './components/AddCaseModal';
import CaseDetailModal from './components/CaseDetailModal';
import { 
  Plus, 
  Search, 
  LogOut, 
  Smile, 
  FileText, 
  Sparkles, 
  Clock, 
  Filter, 
  TrendingUp, 
  MessageSquare, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Edit2,
  Trash2,
  Users,
  Wrench,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Database,
  CloudLightning
} from 'lucide-react';

const AVATAR_COLORS = [
  'bg-emerald-600', 'bg-teal-600', 'bg-blue-600', 'bg-indigo-600', 
  'bg-violet-600', 'bg-purple-600', 'bg-fuchsia-600', 'bg-rose-600', 
  'bg-orange-500', 'bg-amber-600'
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  
  // Dynamic persistent states loaded from Server JSON database
  const [cases, setCases] = useState<ProsthodonticCase[]>([]);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [collaborators, setCollaborators] = useState<AppUser[]>([]);
  const [laboratories, setLaboratories] = useState<string[]>([]);

  // Server backups list
  const [backups, setBackups] = useState<{ filename: string; date: string; size: number }[]>([]);
  const [lastSynced, setLastSynced] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Selection & UI Modals States
  const [selectedCase, setSelectedCase] = useState<ProsthodonticCase | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [draggedOverColumnId, setDraggedOverColumnId] = useState<string | null>(null);

  // Column management States
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editColTitle, setEditColTitle] = useState('');
  const [editColDesc, setEditColDesc] = useState('');
  const [editColColor, setEditColColor] = useState('');
  
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColColor, setNewColColor] = useState('border-t-4 border-t-slate-500 text-slate-700');

  // Sidebar admin expandable states
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);
  const [adminTab, setAdminTab] = useState<'collabs' | 'labs' | 'backups'>('collabs');

  // New collaborator form states
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabRole, setNewCollabRole] = useState<'dentist' | 'technician' | 'assistant' | 'coordinator'>('dentist');
  const [newCollabEmail, setNewCollabEmail] = useState('');

  // New Lab form state
  const [newLabName, setNewLabName] = useState('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<string>('all');
  const [selectedLabFilter, setSelectedLabFilter] = useState<string>('all');

  // Load data initially and start polling
  useEffect(() => {
    // Initial fetch
    fetchDatabase();

    // Fetch database backups
    fetchBackups();

    // Auto-login session check (kept locally for ease of use)
    const sessionUser = localStorage.getItem('prosthodontic_session_user');
    if (sessionUser) {
      try {
        const u = JSON.parse(sessionUser);
        setCurrentUser(u);
      } catch (e) {
        console.error(e);
      }
    }

    // Modern 3-second automatic background synchronization
    const interval = setInterval(() => {
      syncWithServer();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchDatabase = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
        setColumns(data.columns || []);
        setCollaborators(data.collaborators || []);
        setLaboratories(data.laboratories || []);
        updateSyncTime();
      }
    } catch (err) {
      console.error("Errore durante il caricamento dal server NAS:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncWithServer = async () => {
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const data = await res.json();
        // Core check: only update states if they have actually changed on the server to prevent DOM redraw jitter
        setCases(prev => JSON.stringify(prev) !== JSON.stringify(data.cases) ? data.cases : prev);
        setColumns(prev => JSON.stringify(prev) !== JSON.stringify(data.columns) ? data.columns : prev);
        setCollaborators(prev => JSON.stringify(prev) !== JSON.stringify(data.collaborators) ? data.collaborators : prev);
        setLaboratories(prev => JSON.stringify(prev) !== JSON.stringify(data.laboratories) ? data.laboratories : prev);
        updateSyncTime();
      }
    } catch (err) {
      console.error("Sincronizzazione fallita:", err);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/db/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch (err) {
      console.error("Errore lettura backup dal server NAS:", err);
    }
  };

  const updateSyncTime = () => {
    const now = new Date();
    setLastSynced(now.toLocaleTimeString('it-IT'));
  };

  // Helper to save entire DB state to backend server
  const saveAllToServer = async (
    updatedCases: ProsthodonticCase[],
    updatedCollaborators: AppUser[],
    updatedColumns: BoardColumn[],
    updatedLaboratories: string[]
  ) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/db/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cases: updatedCases,
          collaborators: updatedCollaborators,
          columns: updatedColumns,
          laboratories: updatedLaboratories
        })
      });
      if (!response.ok) {
        throw new Error('Errore durante il salvataggio sul server');
      }
      updateSyncTime();
      // Keep backups tab fresh
      fetchBackups();
    } catch (err) {
      console.error('Network save error:', err);
      alert('Impossibile salvare i dati sul NAS. Verifica la connessione.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('prosthodontic_session_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('prosthodontic_session_user');
  };

  // Add case to bacheca
  const handleAddCase = (newCase: ProsthodonticCase) => {
    const updated = [newCase, ...cases];
    setCases(updated);
    saveAllToServer(updated, collaborators, columns, laboratories);
    setIsAddModalOpen(false);
  };

  // Update existing case
  const handleUpdateCase = (updatedCase: ProsthodonticCase) => {
    const updatedList = cases.map(c => c.id === updatedCase.id ? updatedCase : c);
    setCases(updatedList);
    saveAllToServer(updatedList, collaborators, columns, laboratories);
    
    if (selectedCase && selectedCase.id === updatedCase.id) {
      setSelectedCase(updatedCase);
    }
  };

  // Delete / Archive case
  const handleDeleteCase = (caseId: string) => {
    const updatedList = cases.filter(c => c.id !== caseId);
    setCases(updatedList);
    saveAllToServer(updatedList, collaborators, columns, laboratories);
    setSelectedCase(null);
  };

  // Move card between dynamic stages via click or Drag and Drop
  const handleMoveCaseToStage = (caseId: string, targetStageId: string) => {
    const caseToMove = cases.find(c => c.id === caseId);
    if (!caseToMove || caseToMove.stage === targetStageId) return;

    const currentStageIndex = columns.findIndex(col => col.id === caseToMove.stage);
    const newStageIndex = columns.findIndex(col => col.id === targetStageId);

    const prevStageName = columns[currentStageIndex]?.title || caseToMove.stage;
    const newStageName = columns[newStageIndex]?.title || targetStageId;

    if (!currentUser) return;

    const newActivity = {
      id: `act-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Fase Spostata (D&D)',
      details: `Spostato manufatto da "${prevStageName}" a "${newStageName}" tramite bacheca interattiva.`,
      timestamp: new Date().toISOString()
    };

    const updatedCase: ProsthodonticCase = {
      ...caseToMove,
      stage: targetStageId,
      activities: [newActivity, ...caseToMove.activities]
    };

    const updatedList = cases.map(c => c.id === caseId ? updatedCase : c);
    setCases(updatedList);
    saveAllToServer(updatedList, collaborators, columns, laboratories);

    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase(updatedCase);
    }
  };

  // Click buttons to advance / return
  const shiftCaseStage = (currentCase: ProsthodonticCase, direction: 'forward' | 'backward') => {
    const currentStageIndex = columns.findIndex(col => col.id === currentCase.stage);
    let newStageIndex = currentStageIndex;

    if (direction === 'forward' && currentStageIndex < columns.length - 1) {
      newStageIndex = currentStageIndex + 1;
    } else if (direction === 'backward' && currentStageIndex > 0) {
      newStageIndex = currentStageIndex - 1;
    }

    if (newStageIndex === currentStageIndex) return;

    const newStage = columns[newStageIndex].id;
    handleMoveCaseToStage(currentCase.id, newStage);
  };

  // Reset local adjustments back to clinic standard defaults on the NAS database
  const handleResetPresets = async () => {
    if (confirm('Conferma ripristino NAS? Tutte le modifiche caricate (casi clinici, colonne, collaboratori, laboratori) verranno resettate ai valori demo originali della clinica.')) {
      try {
        const res = await fetch('/api/db/reset', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setCases(data.db.cases);
          setColumns(data.db.columns);
          setCollaborators(data.db.collaborators);
          setLaboratories(data.db.laboratories);
          updateSyncTime();
          fetchBackups();
          alert('Database sul NAS ripristinato con successo.');
        }
      } catch (err) {
        console.error(err);
        alert('Impossibile comunicare con il server NAS.');
      }
    }
  };

  // Restore backup file
  const handleRestoreBackup = async (filename: string) => {
    if (confirm(`Sei sicuro di voler ripristinare il database al backup "${filename}"? Tutti i dati correnti verranno sovrascritti.`)) {
      try {
        const res = await fetch('/api/db/backups/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename })
        });
        if (res.ok) {
          const data = await res.json();
          setCases(data.db.cases);
          setColumns(data.db.columns);
          setCollaborators(data.db.collaborators);
          setLaboratories(data.db.laboratories);
          updateSyncTime();
          alert(`Backup "${filename}" ripristinato sul NAS con successo!`);
        } else {
          const errData = await res.json();
          alert(`Errore: ${errData.error}`);
        }
      } catch (err) {
        console.error(err);
        alert('Impossibile collegarsi al server per il ripristino del backup.');
      }
    }
  };

  // Admin section: Collaborator Appending
  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabName.trim()) return;

    const roleLabels = {
      dentist: 'Protesista Clinico',
      technician: 'Maestro Odontotecnico',
      assistant: 'Assistente di Studio',
      coordinator: 'Segreteria e Trattamenti'
    };

    const newCollab: AppUser = {
      id: `user-${Date.now()}`,
      name: newCollabName.trim(),
      role: newCollabRole,
      roleLabel: roleLabels[newCollabRole],
      email: newCollabEmail.trim() || 'info@clinic.com',
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    };

    const updatedCollabs = [...collaborators, newCollab];
    setCollaborators(updatedCollabs);
    saveAllToServer(cases, updatedCollabs, columns, laboratories);

    // reset
    setNewCollabName('');
    setNewCollabEmail('');
  };

  // Admin section: Collaborator Deletion
  const handleRemoveCollaborator = (id: string, name: string) => {
    if (currentUser?.id === id) {
      alert('Non puoi eliminare te stesso mentre sei connesso a questa sessione.');
      return;
    }
    if (confirm(`Rimuovere il collaboratore "${name}"? I casi assegnati a questo utente rimarranno salvati, ma l'utente non comparirà più nei moduli.`)) {
      const updated = collaborators.filter(u => u.id !== id);
      setCollaborators(updated);
      saveAllToServer(cases, updated, columns, laboratories);
    }
  };

  // Admin section: Laboratory Appending
  const handleAddLaboratory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName.trim()) return;
    if (laboratories.includes(newLabName.trim())) {
      alert('Questo laboratorio partner è già presente in elenco.');
      return;
    }

    const updated = [...laboratories, newLabName.trim()];
    setLaboratories(updated);
    saveAllToServer(cases, collaborators, columns, updated);
    setNewLabName('');
  };

  // Admin section: Laboratory Deletion
  const handleRemoveLaboratory = (lab: string) => {
    if (confirm(`Rimuovere l'odontotecnico partner "${lab}"?`)) {
      const updated = laboratories.filter(l => l !== lab);
      setLaboratories(updated);
      saveAllToServer(cases, collaborators, columns, updated);
    }
  };

  // Board Multi-criteria Filter Application
  const filteredCases = cases.filter(c => {
    // keyword searches patient name + unified restoration description text field
    const searchMatch = searchQuery === '' || 
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.restorationSpecifics.toLowerCase().includes(searchQuery.toLowerCase());

    const doctorMatch = selectedDoctorFilter === 'all' || c.dentistId === selectedDoctorFilter;
    const urgencyMatch = selectedUrgencyFilter === 'all' || c.urgency === selectedUrgencyFilter;
    const labMatch = selectedLabFilter === 'all' || c.labName === selectedLabFilter;

    return searchMatch && doctorMatch && urgencyMatch && labMatch;
  });

  // Render Stats Counts
  const totalCasesCount = cases.length;
  const urgentCount = cases.filter(c => c.urgency === 'urgent').length;
  const inHouseCount = cases.filter(c => c.labName.toLowerCase().includes('in-house')).length;
  const externalCount = cases.filter(c => !c.labName.toLowerCase().includes('in-house')).length;

  if (!currentUser) {
    return <LoginDialog onLogin={handleLogin} />;
  }

  // Doctors for the filter lists
  const dentistCollaborators = collaborators.filter(u => u.role === 'dentist');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white" id="main-panel">
      
      {/* Clinic Premium Header Bar */}
      <header className="h-16 border-b border-slate-200 bg-white px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:sticky md:top-0 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold font-sans">
            🦷
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 font-sans flex items-center gap-2">
              Sciunnach <span className="font-normal text-slate-400">Prosthodontics</span>
            </h1>
          </div>
        </div>

        {/* User Identity widget */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 p-1.5 px-3 rounded-lg">
            <div className={`w-7 h-7 rounded-full ${currentUser.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold font-mono text-xs shadow-sm`}>
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-left select-none hidden sm:block">
              <div className="font-semibold text-slate-800 max-w-[130px] truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 font-medium">{currentUser.roleLabel}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-650 hover:bg-blue-700 bg-blue-600 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-all text-xs flex items-center gap-1.5 shrink-0 cursor-pointer text-white"
              title="Aggiungi nuovo caso protesico"
            >
              <Plus className="w-4 h-4 text-blue-200" />
              <span>Nuovo Caso</span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 p-2 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Disconnetti / Cambia utente"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Sub Navigation Bar matching theme */}
      <nav className="h-12 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 select-none">
        <div className="flex gap-4 items-center">
          <div className="flex items-center px-3 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Bacheca Casi Protesici
          </div>
          <span className="hidden md:inline-flex text-xs text-slate-400">
            {filteredCases.length} casi attivi • {totalCasesCount} casi totali
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 font-mono">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0 select-none">
            <CloudLightning className={`w-3.5 h-3.5 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
            Caricato su NAS: {lastSynced ? `Sincronizzato alle ${lastSynced}` : 'In corso...'}
          </span>
        </div>
      </nav>

      {/* Main Container Split Grid */}
      <div className="flex-1 flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
        
        {/* Left Side Control Dashboard/Sidebar */}
        <aside className="w-full lg:w-72 bg-white p-5 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-5 flex-shrink-0 overflow-y-auto">
          
          {/* Quick Stats overview widget */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              Statistiche della Clinica
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <div className="text-lg font-bold text-slate-850 font-mono text-gray-900">{totalCasesCount}</div>
                <div className="text-[10px] text-slate-500">Casi Attivi</div>
              </div>
              <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                <div className="text-lg font-bold text-red-700 font-mono">{urgentCount}</div>
                <div className="text-[10px] text-red-500">Urgente</div>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                <div className="text-lg font-bold text-blue-700 font-mono">{inHouseCount}</div>
                <div className="text-[10px] text-blue-500">Lab Interno</div>
              </div>
              <div className="bg-violet-50 p-2.5 rounded-lg border border-violet-100">
                <div className="text-lg font-bold text-violet-700 font-mono">{externalCount}</div>
                <div className="text-[10px] text-violet-500">Lab Esterni</div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Sliders and Filters section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              Filtri e Ricerche
            </h3>

            {/* Keyword Search field */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cerca paziente o specifica..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-2 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Doctor filter dropdown */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Dentista Responsabile</label>
              <select
                value={selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">Mostra Tutti i Medici</option>
                {dentistCollaborators.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>

            {/* Urgency filter dropdown */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Urgenza / Priorità</label>
              <select
                value={selectedUrgencyFilter}
                onChange={(e) => setSelectedUrgencyFilter(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">Mostra Tutte le Priorità</option>
                <option value="routine">Ordinario</option>
                <option value="rush">Rapido</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            {/* Lab source filter dropdown */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Laboratorio Assegnato</label>
              <select
                value={selectedLabFilter}
                onChange={(e) => setSelectedLabFilter(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">Filtra per Laboratorio</option>
                {laboratories.map(lab => (
                  <option key={lab} value={lab}>{lab}</option>
                ))}
              </select>
            </div>

            {/* Fast filter clear helper */}
            {(searchQuery || selectedDoctorFilter !== 'all' || selectedUrgencyFilter !== 'all' || selectedLabFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDoctorFilter('all');
                  setSelectedUrgencyFilter('all');
                  setSelectedLabFilter('all');
                }}
                className="w-full py-1.5 text-center text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-100 transition-all font-semibold cursor-pointer"
              >
                Resetta Filtri
              </button>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Dynamic Administration Panel inside Sidebar */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
            <button
              type="button"
              onClick={() => setIsAdminExpanded(!isAdminExpanded)}
              className="w-full flex items-center justify-between font-bold text-xs text-slate-700 hover:text-blue-600 transition-colors uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-500" />
                Amministrazione Risorse
              </span>
              {isAdminExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isAdminExpanded && (
              <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
                {/* Tabs inside widget */}
                <div className="grid grid-cols-3 gap-0.5 bg-white p-0.5 rounded border border-slate-200 shadow-3xs">
                  <button
                    type="button"
                    onClick={() => setAdminTab('collabs')}
                    className={`py-1 text-[9px] text-center font-bold rounded cursor-pointer ${
                      adminTab === 'collabs' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Team ({collaborators.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTab('labs')}
                    className={`py-1 text-[9px] text-center font-bold rounded cursor-pointer ${
                      adminTab === 'labs' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Partner
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminTab('backups');
                      fetchBackups();
                    }}
                    className={`py-1 text-[9px] text-center font-bold rounded cursor-pointer ${
                      adminTab === 'backups' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Backup NAS
                  </button>
                </div>

                {/* Tab Content: Collaborators */}
                {adminTab === 'collabs' && (
                  <div className="space-y-3">
                    {/* List active team */}
                    <div className="max-h-[160px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                      {collaborators.map(user => (
                        <div key={user.id} className="flex items-center justify-between bg-white border border-slate-100 p-1.5 rounded shadow-2xs">
                          <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                            <span className={`w-4 h-4 text-[8px] rounded-full text-white ${user.avatarColor} flex items-center justify-center font-bold shrink-0`}>
                              {user.name[0]}
                            </span>
                            <div className="truncate">
                              <p className="font-semibold text-[11px] text-gray-900 leading-none">{user.name}</p>
                              <p className="text-[8px] text-gray-400 capitalize">{user.role}</p>
                            </div>
                          </div>
                          
                          {/* Trash button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveCollaborator(user.id, user.name)}
                            className="text-gray-400 hover:text-red-650 hover:bg-red-50 p-1 rounded-md transition-colors cursor-pointer"
                            title="Rimuovi Membro"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add collaborator compact form */}
                    <form onSubmit={handleAddCollaborator} className="bg-white p-2 rounded border border-slate-250 space-y-1.5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Nuovo Collaboratore</p>
                      <input
                        type="text"
                        required
                        placeholder="Nome Cognome"
                        value={newCollabName}
                        onChange={(e) => setNewCollabName(e.target.value)}
                        className="w-full text-[10px] p-1 border border-slate-200 bg-white text-gray-950 rounded focus:outline-none"
                      />
                      
                      <div className="flex gap-1">
                        <select
                          value={newCollabRole}
                          onChange={(e: any) => setNewCollabRole(e.target.value)}
                          className="flex-1 text-[10px] p-1 border border-slate-200 bg-white text-gray-950 rounded focus:outline-none"
                        >
                          <option value="dentist">Medico (Dentista)</option>
                          <option value="technician">Tecnico (Lab)</option>
                          <option value="assistant">Assistente</option>
                          <option value="coordinator">Segreteria</option>
                        </select>
                        <button
                          type="submit"
                          className="bg-blue-600 text-white font-bold text-[10px] px-2 rounded cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tab Content: Laboratories */}
                {adminTab === 'labs' && (
                  <div className="space-y-3">
                    {/* List active labs */}
                    <div className="max-h-[160px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                      {laboratories.map(lab => (
                        <div key={lab} className="flex items-center justify-between bg-white border border-slate-100 p-1.5 rounded shadow-2xs">
                          <p className="font-semibold text-[11.5px] text-gray-800 truncate max-w-[180px]" title={lab}>{lab}</p>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveLaboratory(lab)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer"
                            title="Rimuovi Laboratorio"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Laboratory form */}
                    <form onSubmit={handleAddLaboratory} className="bg-white p-2 rounded border border-slate-250 space-y-1.5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Aggiungi Laboratorio</p>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          required
                          placeholder="es. Laboratorio Roma"
                          value={newLabName}
                          onChange={(e) => setNewLabName(e.target.value)}
                          className="flex-1 text-[10px] p-1 border border-slate-200 bg-white text-gray-950 rounded focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white font-bold text-[10px] px-2 rounded cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tab Content: Server Backups */}
                {adminTab === 'backups' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-blue-50/50 border border-blue-100 p-2 rounded-lg text-[10px] text-blue-700">
                      <span className="font-semibold flex items-center gap-1">
                        <Database className="w-3.5 h-3.5" />
                        Salvataggio NAS Automatico
                      </span>
                    </div>

                    <p className="text-[9px] text-gray-400 leading-tight">
                      Vengono conservati fino a 30 punti di ripristino automatici creati ad ogni modifica.
                    </p>

                    <div className="max-h-[160px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                      {backups.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 italic text-[10px]">
                          Nessun backup trovato sul NAS
                        </div>
                      ) : (
                        backups.map(bk => {
                          const dateObj = new Date(bk.date);
                          const formattedDate = dateObj.toLocaleDateString('it-IT') + ' ' + dateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                          const formattedSize = (bk.size / 1024).toFixed(1) + ' KB';
                          return (
                            <div key={bk.filename} className="bg-white border border-slate-100 p-2 rounded shadow-2xs flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                <div className="truncate">
                                  <p className="font-semibold text-[10px] text-gray-800">{formattedDate}</p>
                                  <p className="text-[8px] text-gray-400 font-mono shrink-0 truncate max-w-[150px]">{bk.filename}</p>
                                </div>
                                <span className="text-[8px] bg-slate-100 text-slate-500 font-mono px-1 py-0.5 rounded border border-slate-200 shrink-0">
                                  {formattedSize}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRestoreBackup(bk.filename)}
                                className="w-full py-1 bg-slate-100 hover:bg-blue-600 hover:text-white transition-all text-slate-700 text-[10px] font-semibold rounded border border-slate-200 cursor-pointer"
                              >
                                Ripristina questo punto
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Clinic references */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/85 text-[11px] leading-relaxed text-slate-500 space-y-2">
            <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1 select-none">
              <span>🦷</span> Aiuto Navigazione
            </h4>
            <div className="space-y-1.5">
              <p>
                <strong>Trascina e Rilascia:</strong> Trascina qualsiasi scheda di un paziente verso un'altra colonna per aggiornarne istantaneamente lo stato.
              </p>
              <p>
                <strong>Modifica Colonne:</strong> Fai clic sull'icona di modifica accanto ad ogni titolo per modificarne l'aspetto o aggiungerne di nuove a lato.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between">
              <button
                onClick={handleResetPresets}
                className="text-slate-400 hover:text-amber-600 transition-colors font-mono cursor-pointer text-[10px]"
                title="Ripristina i casi e colonne demo originali della clinica"
              >
                Ripristina Tutto (Demo)
              </button>
            </div>
          </div>

        </aside>

        {/* Right Side Fluid Trello-like Canvas viewport */}
        <main className="flex-1 p-6 overflow-x-auto min-w-0 bg-slate-50/50">
          
          <div className="flex gap-4 min-w-[1240px] h-full items-start pb-4">
            {columns.map((col, colIndex) => {
              // Extract cards belonging to this particular column stage
              const stageCases = filteredCases.filter(c => c.stage === col.id);
              const isDraggedOver = draggedOverColumnId === col.id;
              
              return (
                <div 
                  key={col.id} 
                  className={`w-[290px] rounded-xl p-4 flex flex-col max-h-[calc(100vh-190px)] border shrink-0 transition-all ${
                    isDraggedOver 
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-100 scale-[1.01]' 
                      : 'bg-white border-slate-150'
                  }`}
                  id={`column-${col.id}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDraggedOverColumnId(col.id);
                  }}
                  onDragLeave={() => {
                    setDraggedOverColumnId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDraggedOverColumnId(null);
                    const caseId = e.dataTransfer.getData('text/plain');
                    if (caseId) {
                      handleMoveCaseToStage(caseId, col.id);
                    }
                  }}
                >
                  
                  {/* Column Header */}
                  <div className={`pb-2 mb-3 border-b border-slate-100 group`}>
                    
                    {editingColumnId === col.id ? (
                      /* Inline Editor for column title and description */
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!editColTitle.trim()) return;
                          
                          const updated = columns.map(c => c.id === col.id ? {
                            ...c,
                            title: editColTitle.trim(),
                            description: editColDesc.trim(),
                            color: editColColor
                          } : c);
                          
                          setColumns(updated);
                          saveAllToServer(cases, collaborators, updated, laboratories);
                          setEditingColumnId(null);
                        }}
                        className="space-y-1.5 p-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs"
                      >
                        <div>
                          <input
                            type="text"
                            required
                            value={editColTitle}
                            onChange={(e) => setEditColTitle(e.target.value)}
                            placeholder="Nome Fase"
                            className="w-full text-xs p-1 bg-white text-gray-950 border border-slate-300 rounded font-bold"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={editColDesc}
                            onChange={(e) => setEditColDesc(e.target.value)}
                            placeholder="Descrizione della fase"
                            className="w-full text-[10px] p-1 bg-white text-gray-950 border border-slate-300 rounded"
                          />
                        </div>
                        <div className="flex gap-1">
                          <select
                            value={editColColor}
                            onChange={(e) => setEditColColor(e.target.value)}
                            className="flex-1 text-[9px] p-1 bg-white text-gray-950 border border-slate-300 rounded"
                          >
                            <option value="border-t-4 border-t-cyan-500 text-cyan-700">Azzurro (Diagnosis)</option>
                            <option value="border-t-4 border-t-blue-500 text-blue-700">Blu (Preparation)</option>
                            <option value="border-t-4 border-t-indigo-500 text-indigo-700">Indaco (Impression)</option>
                            <option value="border-t-4 border-t-amber-500 text-amber-700">Ambra (Laboratory)</option>
                            <option value="border-t-4 border-t-purple-500 text-purple-700">Viola (Try-In)</option>
                            <option value="border-t-4 border-t-emerald-500 text-emerald-700">Smeraldo (Cementation)</option>
                            <option value="border-t-4 border-t-rose-500 text-rose-700">Rosa (Archive)</option>
                            <option value="border-t-4 border-t-slate-500 text-slate-700">Grigio</option>
                          </select>
                        </div>
                        <div className="flex gap-1 justify-between pt-1">
                          {stageCases.length === 0 && columns.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Rimuovere la colonna "${col.title}"? Tutti i casi futuri dovranno essere assegnati ad altre fasi.`)) {
                                  const updated = columns.filter(c => c.id !== col.id);
                                  setColumns(updated);
                                  saveAllToServer(cases, collaborators, updated, laboratories);
                                  setEditingColumnId(null);
                                }
                              }}
                              className="text-[9px] text-red-500 border border-red-200 hover:bg-red-50 p-1 rounded font-bold cursor-pointer"
                            >
                              Elimina
                            </button>
                          )}
                          <div className="flex gap-1 ml-auto">
                            <button
                              type="button"
                              onClick={() => setEditingColumnId(null)}
                              className="text-[9px] bg-white border border-slate-200 px-2.5 py-1 rounded hover:bg-slate-50 text-gray-800 cursor-pointer"
                            >
                              Annulla
                            </button>
                            <button
                              type="submit"
                              className="text-[9px] bg-blue-600 font-bold text-white px-2.5 py-1 rounded hover:bg-blue-700 cursor-pointer text-white"
                            >
                              Salva
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      /* Display static headers */
                      <div className={`p-1 ${col.color} flex items-start justify-between min-h-[46px]`}>
                        <div className="min-w-0 pr-2">
                          <h3 className="text-xs font-bold leading-tight font-sans text-slate-800 flex items-center">
                            <span className="truncate">{col.title}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingColumnId(col.id);
                                setEditColTitle(col.title);
                                setEditColDesc(col.description);
                                setEditColColor(col.color);
                              }}
                              className="opacity-0 group-hover:opacity-100 ml-1.5 p-0.5 text-slate-400 hover:text-blue-600 transition-opacity rounded cursor-pointer shrink-0"
                              title="Modifica nome o parametri colonna"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </h3>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[210px] mt-0.5" title={col.description}>
                            {col.description}
                          </span>
                        </div>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                          {stageCases.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Column Case Cards List Container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 scrollbar-thin">
                    {stageCases.length === 0 ? (
                      <div className="py-8 text-center text-[10px] text-slate-400 italic border border-dashed border-slate-200 rounded-xl select-none bg-slate-50/50">
                        Nessun caso attivo
                      </div>
                    ) : (
                      stageCases.map((caseItem) => {
                        const doctorNameObj = collaborators.find(du => du.id === caseItem.dentistId);
                        const doctorName = doctorNameObj ? doctorNameObj.name.split(' ').pop() : 'Medico';
                        
                        // Urgency level indicator colors
                        const priorityColors = {
                          urgent: 'bg-red-50 border-red-200 text-red-700',
                          rush: 'bg-amber-50 border-amber-200 text-amber-800',
                          routine: 'bg-slate-50 border-slate-200 text-slate-600'
                        };

                        const priorityLabels = {
                          urgent: 'Urgente',
                          rush: 'Rapido',
                          routine: 'Ordinario'
                        };

                        return (
                          <div
                            key={caseItem.id}
                            onClick={() => setSelectedCase(caseItem)}
                            draggable={editingColumnId !== col.id} // disable dragging if currently editing stage headers
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', caseItem.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            className="bg-white hover:bg-slate-50/50 border border-slate-250 cursor-grab active:cursor-grabbing p-3.5 rounded-xl shadow-3xs hover:shadow-2xs transition-all group relative"
                            id={`case-card-${caseItem.id}`}
                          >
                            
                            {/* Card top Priority and Dentist Badge */}
                            <div className="flex justify-between items-start mb-2.5 flex-wrap gap-1">
                              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border leading-none ${priorityColors[caseItem.urgency]}`}>
                                {priorityLabels[caseItem.urgency]}
                              </span>
                              
                              <span className="text-[9px] text-slate-550 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium whitespace-nowrap">
                                Dr. {doctorName}
                              </span>
                            </div>

                            {/* Patient Name */}
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                              {caseItem.patientName}
                            </h4>
                            
                            {/* Restoration Specifics Text Area Preview instead of older split fields */}
                            <div className="text-slate-650 text-xs mt-2 line-clamp-3 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 italic break-words leading-relaxed font-sans">
                              {caseItem.restorationSpecifics}
                            </div>

                            {/* Card Logistics Footer */}
                            <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                              
                              {/* Time Due Indicator */}
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="font-medium text-slate-450">Consegna: {caseItem.dueDate.split('-').slice(1).reverse().join('/')}</span>
                              </div>

                              {/* Interaction & Lab Status */}
                              <div className="flex items-center gap-2">
                                {caseItem.comments.length > 0 && (
                                  <div className="flex items-center gap-0.5 text-slate-400 font-medium" title={`${caseItem.comments.length} commenti`}>
                                    <MessageSquare className="w-3 h-3" />
                                    <span className="font-mono">{caseItem.comments.length}</span>
                                  </div>
                                )}
                                
                                {caseItem.labInstructions && (
                                  <span className="text-[8px] text-amber-705 bg-amber-50 border border-amber-100 px-1 py-0.5 rounded font-extrabold" title="Direttiva odontotecnica presente">
                                    LAB RX
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Nav Buttons (Backup alternative to drag & drop for accessibility) */}
                            <div className="mt-4 grid grid-cols-2 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  shiftCaseStage(caseItem, 'backward');
                                }}
                                className="bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 py-1 rounded border border-slate-200 text-[10px] flex items-center justify-center gap-0.5 cursor-pointer font-medium"
                                title="Sposta alla colonna precedente"
                              >
                                <ChevronLeft className="w-3 h-3" />
                                Indietro
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  shiftCaseStage(caseItem, 'forward');
                                }}
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 py-1 rounded border border-blue-100 text-[10px] flex items-center justify-center gap-0.5 font-bold cursor-pointer"
                                title="Sposta alla colonna successiva"
                              >
                                Avanti
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              );
            })}

            {/* Append New Column Interactive Action Box */}
            <div className="w-[290px] bg-slate-100/55 border border-dashed border-slate-300 rounded-xl p-4 shrink-0 flex flex-col justify-start">
              {!isAddingCol ? (
                <button
                  type="button"
                  onClick={() => setIsAddingCol(true)}
                  className="w-full py-8 text-slate-500 hover:text-blue-600 transition-colors flex flex-col items-center justify-center gap-1.5 focus:outline-none cursor-pointer h-full border border-slate-200/50 rounded-lg bg-white/70"
                >
                  <Plus className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-bold font-sans">Aggiungi Colonna</span>
                </button>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newColTitle.trim()) return;
                    
                    const newColId = `col-${Date.now()}`;
                    const updated = [...columns, {
                      id: newColId,
                      title: newColTitle.trim(),
                      description: newColDesc.trim() || 'Fase del processo.',
                      color: newColColor
                    }];
                    
                    setColumns(updated);
                    saveAllToServer(cases, collaborators, updated, laboratories);
                    
                    // Reset Column forms
                    setNewColTitle('');
                    setNewColDesc('');
                    setNewColColor('border-t-4 border-t-slate-500 text-slate-700');
                    setIsAddingCol(false);
                  }}
                  className="space-y-3.5 text-xs bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs"
                >
                  <div className="flex justify-between items-center pb-1 border-b border-slate-150">
                    <h4 className="font-bold text-slate-700">Nuova Colonna</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingCol(false)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Nome Fase*</label>
                    <input
                      type="text"
                      required
                      placeholder="es. Prova Metallo"
                      value={newColTitle}
                      onChange={(e) => setNewColTitle(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-250 bg-white text-gray-950 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Descrizione</label>
                    <input
                      type="text"
                      placeholder="es. Verifica accoppiamento pilastri"
                      value={newColDesc}
                      onChange={(e) => setNewColDesc(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-250 bg-white text-gray-950 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">Sfumatura Accento</label>
                    <select
                      value={newColColor}
                      onChange={(e) => setNewColColor(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-250 bg-white text-gray-950 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="border-t-4 border-t-cyan-500 text-cyan-700">Azzurro (Diagnosis)</option>
                      <option value="border-t-4 border-t-blue-500 text-blue-700">Blu (Preparation)</option>
                      <option value="border-t-4 border-t-indigo-500 text-indigo-700">Indaco (Impression)</option>
                      <option value="border-t-4 border-t-amber-500 text-amber-700">Ambra (Laboratory)</option>
                      <option value="border-t-4 border-t-purple-500 text-purple-700">Viola (Try-In)</option>
                      <option value="border-t-4 border-t-emerald-500 text-emerald-700">Smeraldo (Cementation)</option>
                      <option value="border-t-4 border-t-rose-500 text-rose-700">Rosa (Archive)</option>
                      <option value="border-t-4 border-t-slate-500 text-slate-700">Grigio</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-705 text-white font-bold rounded-lg transition-colors cursor-pointer text-center text-white"
                  >
                    Crea Colonna
                  </button>
                </form>
              )}
            </div>

          </div>

        </main>

      </div>

      {/* Dynamic App Modals Container */}
      {isAddModalOpen && (
        <AddCaseModal 
          currentUser={currentUser}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCase}
          collaborators={collaborators}
          laboratories={laboratories}
        />
      )}

      {selectedCase && (
        <CaseDetailModal 
          currentCase={selectedCase}
          currentUser={currentUser}
          columns={columns}
          onClose={() => setSelectedCase(null)}
          onUpdate={handleUpdateCase}
          onDelete={handleDeleteCase}
          collaborators={collaborators}
        />
      )}

    </div>
  );
}
