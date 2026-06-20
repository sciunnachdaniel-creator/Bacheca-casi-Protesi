/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProsthodonticCase, BoardColumn, AppUser, CaseComment } from '../types';
import { loadCollaborators } from '../mockData';
import { X, Calendar, User, MessageSquare, Clipboard, Activity, Send, CheckCircle2, ChevronRight, FileCode2, Clock, Trash2, Edit2 } from 'lucide-react';

interface CaseDetailModalProps {
  currentCase: ProsthodonticCase;
  currentUser: AppUser;
  columns: BoardColumn[];
  onClose: () => void;
  onUpdate: (updatedCase: ProsthodonticCase) => void;
  onDelete?: (caseId: string) => void;
  collaborators: AppUser[];
}

export default function CaseDetailModal({ currentCase, currentUser, columns, onClose, onUpdate, onDelete, collaborators }: CaseDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'activities' | 'lab'>('details');

  // Find responsible dentist name dynamically from collaborators list
  const dentistUser = collaborators.find(u => u.id === currentCase.dentistId) || {
    name: 'Dentista Sconosciuto',
    roleLabel: 'Professionista'
  };

  const handleStageChange = (newStage: string) => {
    const prevStageName = columns.find(c => c.id === currentCase.stage)?.title || currentCase.stage;
    const newStageName = columns.find(c => c.id === newStage)?.title || newStage;

    const newActivity = {
      id: `act-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Transizione di Fase',
      details: `Spostato lo stato del caso da "${prevStageName}" a "${newStageName}".`,
      timestamp: new Date().toISOString()
    };

    const updatedCase: ProsthodonticCase = {
      ...currentCase,
      stage: newStage,
      activities: [newActivity, ...currentCase.activities]
    };

    onUpdate(updatedCase);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: CaseComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.roleLabel,
      content: commentText.trim(),
      timestamp: new Date().toISOString()
    };

    const newActivity = {
      id: `act-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Aggiunto Commento',
      details: `Ha commentato: "${commentText.trim().substring(0, 30)}..."`,
      timestamp: new Date().toISOString()
    };

    const updatedCase: ProsthodonticCase = {
      ...currentCase,
      comments: [...currentCase.comments, newComment],
      activities: [newActivity, ...currentCase.activities]
    };

    onUpdate(updatedCase);
    setCommentText('');
  };

  // Centralized auto-save logic onBlur
  const handleFieldUpdate = (newVal: string, field: 'restorationSpecifics' | 'notes' | 'labInstructions') => {
    if (currentCase[field] === newVal) return; // skip if unchanged

    let actionLabel = 'Aggiornato Caso';
    let detailLabel = '';

    if (field === 'restorationSpecifics') {
      actionLabel = 'Specifiche Aggiornate';
      detailLabel = 'Aggiornate le specifiche del manufatto protesico.';
    } else if (field === 'notes') {
      actionLabel = 'Diagnosi Aggiornata';
      detailLabel = 'Modificati i segni clinici e gli obiettivi.';
    } else if (field === 'labInstructions') {
      actionLabel = 'Prescrizione Aggiornata';
      detailLabel = 'Modificate le indicazioni per l\'odontotecnico.';
    }

    const newActivity = {
      id: `act-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action: actionLabel,
      details: detailLabel,
      timestamp: new Date().toISOString()
    };

    const updatedCase: ProsthodonticCase = {
      ...currentCase,
      [field]: newVal,
      activities: [newActivity, ...currentCase.activities]
    };

    onUpdate(updatedCase);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('it-IT', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoStr;
    }
  };

  const urgencyColors = {
    routine: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rush: 'bg-amber-50 text-amber-800 border-amber-200',
    urgent: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
  };

  const urgencyLabels = {
    routine: 'Ordinario',
    rush: 'Rapido',
    urgent: 'Urgente',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4" id="case-detail-overlay">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]" id="case-detail-container">
        
        {/* Top Header Panel */}
        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${urgencyColors[currentCase.urgency]}`}>
                  Priorità: {urgencyLabels[currentCase.urgency]}
                </span>
                <span className="text-slate-400 text-xs font-mono">ID Caso: {currentCase.id}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight font-sans text-white">
                {currentCase.patientName}
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Paziente Protesico • Assegnato a <span className="text-white font-medium">{dentistUser.name}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Sei sicuro di voler eliminare e archiviare il caso di ${currentCase.patientName}?`)) {
                      onDelete(currentCase.id);
                      onClose();
                    }
                  }}
                  className="bg-red-900/20 hover:bg-red-900/40 text-red-300 p-2 rounded-xl transition-colors cursor-pointer"
                  title="Archivia Caso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button 
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Flow Stage Wizard (Dynamic column selection!) */}
          <div className="mt-6 border-t border-slate-800 pt-4">
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              FASE DI AVANZAMENTO WORKFLOW
            </h3>
            <div className="flex overflow-x-auto pb-1 gap-1.5 scrollbar-thin">
              {columns.map((col, index) => {
                const isActive = currentCase.stage === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleStageChange(col.id)}
                    className={`flex-1 min-w-[120px] text-left p-2 rounded-lg transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 border-blue-500 text-white shadow'
                        : 'bg-slate-800/10 border-slate-800 text-slate-300 hover:bg-slate-800/65'
                    }`}
                  >
                    <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      {isActive && <CheckCircle2 className="w-3 h-3 text-blue-200 shrink-0" />}
                      Fase {index + 1}
                    </div>
                    <div className="text-xs font-bold truncate">{col.title}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto grid md:grid-cols-3 bg-gray-50/50">
          
          {/* Main Info Left Column */}
          <div className="md:col-span-2 p-6 border-r border-gray-100 flex flex-col space-y-6">
            
            {/* Tabs selector */}
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'border-blue-600 text-blue-800 font-extrabold'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                📋 Specifiche e Diagnostica
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lab')}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-all cursor-pointer ${
                  activeTab === 'lab'
                    ? 'border-blue-600 text-blue-800 font-extrabold'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                🔬 Note Laboratorio
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('activities')}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-all cursor-pointer ${
                  activeTab === 'activities'
                    ? 'border-blue-600 text-blue-800 font-extrabold'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                ⏳ Storico Attività ({currentCase.activities.length})
              </button>
            </div>

            {/* Tab content (Details tab) */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Specifics of restoration (unified textbox as requested!) */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <Edit2 className="w-4 h-4 text-blue-600" />
                      Specifiche del Restauro (Modifica)
                    </div>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Salvataggio automatico</span>
                  </div>
                  <textarea
                    rows={4}
                    defaultValue={currentCase.restorationSpecifics}
                    onBlur={(e) => handleFieldUpdate(e.target.value, 'restorationSpecifics')}
                    className="w-full text-sm text-gray-800 bg-gray-50/50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                    placeholder="Specificazioni del restauro: tipo di manufatto, materiale prescelto, elementi, colori..."
                  />
                  <p className="text-[10px] text-gray-400 font-medium">
                    * Modifica le specifiche del manufatto qui sopra. Clicca all'esterno della casella per salvare istantaneamente le variazioni.
                  </p>
                </div>

                {/* Clinical Notes tab */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <Clipboard className="w-4 h-4 text-indigo-500" />
                    Osservazioni Diagnostiche e Cliniche
                  </div>
                  <textarea
                    rows={3}
                    defaultValue={currentCase.notes}
                    onBlur={(e) => handleFieldUpdate(e.target.value, 'notes')}
                    className="w-full text-sm text-gray-800 bg-gray-50/50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Inserisci commenti diagnostici o note cliniche sul trattamento..."
                  />
                </div>
              </div>
            )}

            {/* Tab content (Lab tab) */}
            {activeTab === 'lab' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    Istruzioni di Fabbricazione / Prescrizione
                  </div>
                  <textarea
                    rows={4}
                    defaultValue={currentCase.labInstructions || ''}
                    onBlur={(e) => handleFieldUpdate(e.target.value, 'labInstructions')}
                    className="w-full text-sm text-gray-800 bg-gray-50/50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Aggiungi indicazioni tecniche, calzata, rifiniture esterne..."
                  />
                  <p className="text-[10px] text-gray-400 italic">
                    * Le istruzioni tecniche si salvano in automatico quando clicchi fuori dalla casella.
                  </p>
                </div>

                <div className="bg-slate-50 border border-gray-200 p-4 rounded-xl text-xs space-y-1">
                  <h4 className="font-bold text-gray-700">Canale di Laboratorio Selezionato:</h4>
                  <p className="text-gray-900 font-semibold">{currentCase.labName}</p>
                </div>
              </div>
            )}

            {/* Tab content (Activities Tab) */}
            {activeTab === 'activities' && (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {currentCase.activities.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-100 flex gap-3 text-xs leading-relaxed">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center font-mono font-bold shrink-0">
                      ⏱️
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-gray-950 font-semibold">{item.userName}</strong>
                        <span className="text-gray-400 text-[10px] font-mono">{formatDate(item.timestamp)}</span>
                      </div>
                      <div className="text-blue-700 font-semibold text-[11px]">{item.action}</div>
                      <p className="text-gray-500 mt-0.5">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comments Timeline */}
            <div className="space-y-4 pt-4 border-t border-gray-100/80">
              <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wide">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Chat Interdisciplinare Collaborativa ({currentCase.comments.length})
              </h3>

              {/* Comments list */}
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {currentCase.comments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center">Nessun commento scambiato su questo dente/caso.</p>
                ) : (
                  currentCase.comments.map((comment) => (
                    <div key={comment.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-4xs space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-950">{comment.userName}</span>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-medium">
                            {comment.userRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">{formatDate(comment.timestamp)}</span>
                      </div>
                      <p className="text-gray-700 text-xs mt-1 bg-slate-50/50 p-2 rounded border border-slate-100/60 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment submission form */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={`Scrivi alla chat come ${currentUser.name}...`}
                  className="flex-1 text-xs py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-950"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center px-4 cursor-pointer text-white"
                  title="Invia commento"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </form>
            </div>

          </div>

          {/* Sidebar Right Info Column */}
          <div className="p-6 space-y-6 bg-gray-50/70 border-t md:border-t-0 border-gray-100">
            
            {/* Quick Details List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-2 border-b border-gray-200">
                INFORMAZIONI GENERALI
              </h3>
              
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-gray-400 uppercase tracking-wide text-[10px] block">Limite Consegna</span>
                  <div className="flex items-center gap-1.5 text-gray-900 mt-0.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{formatDate(currentCase.dueDate).split(',')[0]}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 uppercase tracking-wide text-[10px] block font-sans">Specialista</span>
                  <div className="text-gray-900 mt-0.5 font-bold">{dentistUser.name}</div>
                  <div className="text-[10px] text-gray-400">{dentistUser.roleLabel}</div>
                </div>

                <div>
                  <span className="text-gray-400 uppercase tracking-wide text-[10px] block font-sans font-semibold">Destinazione</span>
                  <div className="text-gray-900 mt-0.5 font-semibold">{currentCase.labName}</div>
                </div>

                <div className="pt-2">
                  <span className="text-gray-400 uppercase tracking-wide text-[10px] block font-sans mb-1">Specifiche Riassunte</span>
                  <div className="text-gray-700 bg-white p-2 rounded-lg border border-gray-200 text-[11px] leading-relaxed break-words whitespace-pre-wrap font-sans">
                    {currentCase.restorationSpecifics}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Clinic Roles Context */}
            <div className="bg-slate-900 text-white rounded-xl p-3.5 text-xs space-y-2.5 shadow-sm">
              <h4 className="font-extrabold uppercase text-[10px] tracking-widest text-blue-400 animate-pulse">
                REGISTRO UTENTE ATTIVO
              </h4>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center text-[10px] font-bold font-mono`}>
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-bold truncate max-w-[150px]">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-300 font-sans">{currentUser.roleLabel}</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed pt-1.5 border-t border-slate-800">
                La firma operatore inserisce automaticamente ogni commento ed avanzamento colonna.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
