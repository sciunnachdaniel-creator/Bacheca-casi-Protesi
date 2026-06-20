/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppUser } from '../types';
import { loadCollaborators } from '../mockData';
import { ShieldAlert, User, KeyRound, Sparkles, LogIn, Heart } from 'lucide-react';

interface LoginDialogProps {
  onLogin: (user: AppUser) => void;
}

export default function LoginDialog({ onLogin }: LoginDialogProps) {
  const [users] = useState<AppUser[]>(() => loadCollaborators());
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleUserSelect = (user: AppUser) => {
    setSelectedUser(user);
    setPasscode('');
    setError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Simulate simple correct passcode (all presets can use '1234' or click Quick Login)
    if (passcode === '1234' || passcode === '') {
      onLogin(selectedUser);
    } else {
      setError('Codice PIN non valido. Prova "1234" o lascia vuoto per l\'accesso istantaneo.');
    }
  };

  const handleQuickLogin = (user: AppUser) => {
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4" id="login-overlay">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" id="login-container">
        <div className="bg-blue-600 p-6 text-white text-center relative">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-blue-500/30 px-3 py-1 rounded-full text-xs font-mono font-medium">
            <Heart className="w-3 h-3 fill-blue-300 stroke-none" />
            Sciunnach Prosthodontics
          </div>
          <h2 className="text-2xl font-bold font-sans tracking-tight mb-2">Acceso Portale Clinico</h2>
          <p className="text-blue-100 text-sm max-w-md mx-auto">
            Sistema di gestione dei casi protesici e del workflow del laboratorio. Seleziona il tuo account per accedere alla bacheca dei casi attivi.
          </p>
        </div>

        <div className="p-8 grid md:grid-cols-5 gap-8">
          {/* User selector column */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Seleziona Membro della Clinica
            </h3>
            
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
               {users.map((user) => {
                const isSelected = selectedUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleUserSelect(user)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                        : 'border-gray-200 hover:border-blue-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${user.avatarColor} text-white flex items-center justify-center text-xs font-bold font-mono shadow-sm`}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-950">{user.name}</div>
                        <div className="text-xs text-gray-500 font-sans">{user.roleLabel}</div>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">Selezionato</span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickLogin(user);
                        }}
                        className="text-[11px] text-gray-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer"
                        title="Accedi istantaneamente senza password"
                      >
                        ⚡ Istantaneo
                      </button>
                    )}
                  </button>
                );
              })}
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-xs italic">
                  Nessun membro della clinica configurato. Accedi come amministratore o aggiungine uno dalla bacheca dei comandi.
                </div>
              )}
            </div>
          </div>

          {/* Passcode column */}
          <div className="md:col-span-2 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
            {selectedUser ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-center md:text-left">
                  <div className={`inline-flex w-12 h-12 rounded-full ${selectedUser.avatarColor} text-white items-center justify-center text-sm font-black mb-2 shadow`}>
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">{selectedUser.name}</h4>
                  <p className="text-xs text-gray-400">{selectedUser.roleLabel}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-blue-600" />
                    Inserisci il Codice PIN della Clinica
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full text-center text-lg tracking-widest py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <div className="text-[10px] text-gray-400 text-center">
                    Lascia vuoto o inserisci <strong className="font-mono text-blue-600">1234</strong>
                  </div>
                </div>

                {error && (
                  <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-xs rounded-lg flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Accedi
                </button>
              </form>
            ) : (
              <div className="text-center py-6 text-gray-400 space-y-2">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 mx-auto flex items-center justify-center">
                  <KeyRound className="w-4 h-4 stroke-1.5" />
                </div>
                <p className="text-xs">Scegli un account sulla sinistra per completare l'autenticazione.</p>
                <div className="bg-amber-50 text-amber-800 border border-amber-100 p-2.5 rounded-lg text-[11px] text-left">
                  <strong>💡 Suggerimento:</strong> Ogni utente ha competenze specifiche per il proprio ruolo. Puoi aggiungere o rimuovere medici e personale clinico direttamente dal menù di gestione collaboratori!
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-3 text-center border-t border-gray-100 text-[11px] text-gray-500 font-mono">
          Modalità Demo Abilitata — Persistenza Standard in Local Storage
        </div>
      </div>
    </div>
  );
}

