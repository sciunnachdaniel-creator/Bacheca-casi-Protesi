/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProsthodonticCase, UrgencyLevel, AppUser } from '../types';
import { loadCollaborators, loadLaboratories } from '../mockData';
import { X, Calendar, Activity, Info, Sparkles, Smile, FileText } from 'lucide-react';

interface AddCaseModalProps {
  currentUser: AppUser;
  onClose: () => void;
  onAdd: (newCase: ProsthodonticCase) => void;
  collaborators: AppUser[];
  laboratories: string[];
}

export default function AddCaseModal({ currentUser, onClose, onAdd, collaborators, laboratories }: AddCaseModalProps) {
  const [patientName, setPatientName] = useState('');
  const [restorationSpecifics, setRestorationSpecifics] = useState('');
  
  const dentists = collaborators.filter(u => u.role === 'dentist');
  
  // Set default state based on loaded items
  const [dentistId, setDentistId] = useState(() => {
    const isUserDentist = collaborators.find(u => u.id === currentUser.id && u.role === 'dentist');
    return isUserDentist ? currentUser.id : (dentists[0]?.id || '');
  });
  const [labName, setLabName] = useState(() => laboratories[0] || 'In-House Studio');
  
  const [dueDate, setDueDate] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('routine');
  const [notes, setNotes] = useState('');
  const [labInstructions, setLabInstructions] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;
    if (!restorationSpecifics.trim()) return;

    const newCase: ProsthodonticCase = {
      id: `case-${Date.now()}`,
      patientName: patientName.trim(),
      restorationSpecifics: restorationSpecifics.trim(),
      dentistId,
      labName,
      dueDate: dueDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      urgency,
      stage: 'diagnosis', // starts at dynamic first column or default 'diagnosis'
      notes: notes.trim() || 'Nessun commento clinico.',
      labInstructions: labInstructions.trim() || undefined,
      comments: [],
      activities: [
        {
          id: `act-${Date.now()}-1`,
          userId: currentUser.id,
          userName: currentUser.name,
          action: 'Caso Creato',
          details: `Registrato nuovo trattamento protesico per ${patientName}.`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAdd(newCase);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4" id="add-case-overlay">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]" id="add-case-container">
        
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-blue-200" />
            <h2 className="text-lg font-bold text-white">Nuovo Caso Clinico Protesico</h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Patient Details Section (Age and gender deleted as requested) */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <span>👤</span> Informazioni sul Paziente
            </h3>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nome Completo Paziente*</label>
              <input
                type="text"
                required
                placeholder="es. Mario Rossi"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-950"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Clinical Specifications - Unified Description Field Only */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <span>🦷</span> Specifiche del Restauro
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Dettagli e Specifiche del Manufatto*
              </label>
              <textarea
                required
                rows={4}
                placeholder="Inserire le specifiche del restauro (es. tipo di procedura, materiale scelto, elementi dentari coinvolti, colore/shade desiderato)..."
                value={restorationSpecifics}
                onChange={(e) => setRestorationSpecifics(e.target.value)}
                className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-950"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Esempio: 6 Faccette Anteriori in IPS e.max, elementi #13-#23, Colore finale B1, con moncone di preparazione ND2.
              </p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Logistics & Assigning */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <span>📋</span> Logistica Clinica e Amministrativa
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dentista Responsabile</label>
                <select
                  value={dentistId}
                  onChange={(e) => setDentistId(e.target.value)}
                  className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg bg-white text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dentists.map(dentist => (
                    <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
                  ))}
                  {dentists.length === 0 && (
                    <option value="">Nessun dentista configurato</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Struttura / Laboratorio</label>
                <select
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg bg-white text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {laboratories.map((lab) => (
                    <option key={lab} value={lab}>{lab}</option>
                  ))}
                  {laboratories.length === 0 && (
                    <option value="Generico">Nessun laboratorio configurato</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Data Consegna Obiettivo</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-sm py-1.5 px-3 border border-gray-300 rounded-lg bg-white text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="block text-xs font-semibold text-gray-700">Livello di Urgenza</label>
              <div className="flex flex-wrap gap-3 mt-1">
                {(['routine', 'rush', 'urgent'] as const).map((level) => {
                  let badgeLabel = 'Ordinario';
                  if (level === 'rush') badgeLabel = 'Rapido';
                  if (level === 'urgent') badgeLabel = 'Urgente';

                  return (
                    <label 
                      key={level} 
                      className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg cursor-pointer text-xs font-semibold tracking-wide transition-all ${
                        urgency === level
                          ? level === 'urgent' ? 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-100'
                            : level === 'rush' ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-100'
                            : 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-100'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={level}
                        checked={urgency === level}
                        onChange={() => setUrgency(level)}
                        className="sr-only"
                      />
                      <span className={`w-2 h-2 rounded-full ${
                        level === 'urgent' ? 'bg-red-600' : level === 'rush' ? 'bg-amber-500' : 'bg-gray-400'
                      }`} />
                      {badgeLabel}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Clinical notes and instructions */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Note ed Indicazioni Aggiuntive
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Segni Clinici ed Osservazioni Principali</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Se presenti, descrivere elementi clinici di rilievo o particolari richieste estetiche del paziente..."
                  className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Prescrizioni e Istruzioni per il Laboratorio</label>
                <textarea
                  rows={3}
                  value={labInstructions}
                  onChange={(e) => setLabInstructions(e.target.value)}
                  placeholder="Direttive strutturali, materiali speciali o tempistiche concordate con l'odontotecnico..."
                  className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-950"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer controls */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-[11px] text-gray-500">
            * Il caso inizia nella prima colonna della bacheca
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 bg-white rounded-lg transition-colors hover:bg-gray-50 cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!patientName.trim() || !restorationSpecifics.trim()}
              className={`px-5 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer ${
                patientName.trim() && restorationSpecifics.trim()
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-300 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4 text-white" />
              Crea Caso nella Bacheca
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
