/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppUser, ProsthodonticCase, BoardColumn } from './types';

export const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user1',
    name: 'Dr. Daniel Sciunnach',
    role: 'dentist',
    roleLabel: 'Protesista Capo',
    email: 'sciunnachdaniel@gmail.com',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'user2',
    name: 'Dr. Sophie Miller',
    role: 'dentist',
    roleLabel: 'Protesista Senior',
    email: 'dr.sophie@clinic.com',
    avatarColor: 'bg-teal-600',
  },
  {
    id: 'user3',
    name: 'Leo Vance',
    role: 'technician',
    roleLabel: 'Maestro Ceramista Laboratorio',
    email: 'leo.vance@clinic.com',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'user4',
    name: 'Maria Santos',
    role: 'assistant',
    roleLabel: 'Assistente Clinica Principale',
    email: 'maria.santos@clinic.com',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'user5',
    name: 'Jessica Thorne',
    role: 'coordinator',
    roleLabel: 'Coordinatore Cura Pazienti',
    email: 'jessica.thorne@clinic.com',
    avatarColor: 'bg-rose-600',
  },
  {
    id: 'user6',
    name: 'Alex Rivera',
    role: 'technician',
    roleLabel: 'Assistente Lab CAD/CAM',
    email: 'alex.rivera@clinic.com',
    avatarColor: 'bg-orange-500',
  }
];

export const DEFAULT_COLUMNS: BoardColumn[] = [
  {
    id: 'diagnosis',
    title: 'Diagnosi e Pianificazione',
    color: 'border-t-4 border-t-cyan-500 text-cyan-700',
    description: 'Modelli, digital smile design, cerature diagnostiche e consulti clinici.'
  },
  {
    id: 'preparation',
    title: 'Preparazione e Provvisori',
    color: 'border-t-4 border-t-blue-500 text-blue-700',
    description: 'Struttura dei denti preparata, corone/ponti provvisori posizionati.'
  },
  {
    id: 'impression',
    title: 'Impronta Finale / Scanner',
    color: 'border-t-4 border-t-indigo-500 text-indigo-700',
    description: 'Scansione intraorale finale o impronta fisica completata e inviata al laboratorio.'
  },
  {
    id: 'laboratory',
    title: 'Lavorazione Laboratorio',
    color: 'border-t-4 border-t-amber-500 text-amber-700',
    description: 'Manufatti fresati, stratificati o stampati dai ceramisti o dal centro fresatura.'
  },
  {
    id: 'try_in',
    title: 'Prova Clinica (Try-In)',
    color: 'border-t-4 border-t-purple-500 text-purple-700',
    description: 'Prova in studio dei manufactti (struttura, prova biscotto) per calzata ed estetica.'
  },
  {
    id: 'cementation',
    title: 'Cementazione e Consegna',
    color: 'border-t-4 border-t-emerald-500 text-emerald-700',
    description: 'Cementazione definitiva, adesione, controlli occlusali e dimissione paziente.'
  }
];

export const DEFAULT_LABS: string[] = [
  'In-House Studio (Leo)',
  'Apex Elite Lab (Esterno)',
  'Glidewell Mill-Center',
  'Signature Aesthetics Inc'
];

export const INITIAL_CASES: ProsthodonticCase[] = [
  {
    id: 'case-101',
    patientName: 'Eleanor Vance',
    restorationSpecifics: 'Riabilitazione Completa della Bocca in Zirconia Prettau per l\'Arcata Superiore e Inferiore (#18-#27, #38-#47). Colore BL2 (Sbiancato), moncone ND3.',
    dentistId: 'user1', // Dr. Daniel
    labName: 'In-House Studio (Leo)',
    dueDate: '2026-06-25',
    urgency: 'urgent',
    stage: 'laboratory',
    notes: 'Grave attrito e fallimento meccanico di vecchi restauri. Gli impianti mascellari sono ben osteointegrati. Design di precisione che corrisponde alle cerature diagnostiche biometriche.',
    labInstructions: 'Si prega di fresare zirconio monolitico a contorno completo, colorare manualmente i margini incisali per l\'integrazione. Riduzione vestibolare per stratificazione minima in ceramica (#13-#23). Data di consegna tassativa.',
    createdAt: '2026-06-05',
    comments: [
      {
        id: 'c1',
        userId: 'user1',
        userName: 'Dr. Daniel Sciunnach',
        userRole: 'Protesista Capo',
        content: 'La paziente desidera la massima traslucenza naturale. Prestare particolare attenzione ai terzi incisali.',
        timestamp: '2026-06-12T09:15:00Z'
      },
      {
        id: 'c2',
        userId: 'user3',
        userName: 'Leo Vance',
        userRole: 'Maestro Ceramista Laboratorio',
        content: 'Design completato. Inizio fresatura CAD sui blocchi di zirconio ad alta resistenza. Pubblicherò presto le foto della struttura monolitica.',
        timestamp: '2026-06-15T14:40:00Z'
      }
    ],
    activities: [
      {
        id: 'a1',
        userId: 'user1',
        userName: 'Dr. Daniel Sciunnach',
        action: 'Creato Caso',
        details: 'Dati diagnostici iniziali della bocca caricati.',
        timestamp: '2026-06-05T08:30:00Z'
      }
    ]
  },
  {
    id: 'case-102',
    patientName: 'Marcus Brody',
    restorationSpecifics: '6 Faccette Anteriori in IPS e.max (Disilicato di Litio) per gli elementi #13, #12, #11, #21, #22, #23. Colore B1, moncone ND2.',
    dentistId: 'user2', // Dr. Sophie
    labName: 'Apex Elite Lab (Esterno)',
    dueDate: '2026-06-22',
    urgency: 'rush',
    stage: 'preparation',
    notes: 'Chiusura di un lieve diastema tra #11 e #21. Richiesta preparazione dentale minima. Il paziente è un conduttore televisivo e richiede un\'anatomia naturale e armoniosa.',
    labInstructions: 'Altamente lucidato, tessitura superficiale moderata per emulare i naturali perichimati. Non eccedere con la glassatura.',
    createdAt: '2026-06-12',
    comments: [
      {
        id: 'c3',
        userId: 'user2',
        userName: 'Dr. Sophie Miller',
        userRole: 'Protesista Senior',
        content: 'Preparato splendidamente. Faccette con spessore minimo. Verificare il moncone ND2 prima di scegliere il lingotto.',
        timestamp: '2026-06-14T10:30:00Z'
      }
    ],
    activities: [
      {
        id: 'a4',
        userId: 'user2',
        userName: 'Dr. Sophie Miller',
        action: 'Creato Caso',
        details: 'Valutazione dei mockup del sorriso anteriore da parte del paziente.',
        timestamp: '2026-06-12T10:00:00Z'
      }
    ]
  },
  {
    id: 'case-103',
    patientName: 'Clara Oswald',
    restorationSpecifics: 'Corona Anteriore Singola in IPS e.max Press per elemento #11. Colore A1, moncone ND4 (Radice Scurita).',
    dentistId: 'user1', // Dr. Daniel
    labName: 'In-House Studio (Leo)',
    dueDate: '2026-06-29',
    urgency: 'routine',
    stage: 'impression',
    notes: 'Sostituzione di una vecchia corona metallo-ceramica grigiastra. Il trattamento canalare è stabile, ma il moncone radicolare è fortemente discromico. Potrebbe essere necessario un blocco ad alta opacità.',
    labInstructions: 'Utilizzare un nucleo ad alta opacità (HO) per mascherare il moncone radicolare ND4, stratificato con ceramica smalto ad alta estetica per abbinarsi al dente naturale adiacente #21.',
    createdAt: '2026-06-15',
    comments: [],
    activities: [
      {
        id: 'a6',
        userId: 'user1',
        userName: 'Dr. Daniel Sciunnach',
        action: 'Creato Caso',
        details: 'Vecchia corona rimossa, eliminata la carie secondaria, ricostruito il perno in composito.',
        timestamp: '2026-06-15T09:40:00Z'
      }
    ]
  }
];

// LocalStorage Keys
const CASES_KEY = 'prosthetic_workflow_cases';
const USERS_KEY = 'prosthetic_workflow_users';
const COLUMNS_KEY = 'prosthetic_workflow_columns2';
const LABS_KEY = 'prosthetic_workflow_labs';

// ---- CASES PERSISTENCE ----
export function loadCases(): ProsthodonticCase[] {
  const stored = localStorage.getItem(CASES_KEY);
  if (!stored) {
    localStorage.setItem(CASES_KEY, JSON.stringify(INITIAL_CASES));
    return INITIAL_CASES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_CASES;
  }
}

export function saveCases(cases: ProsthodonticCase[]): void {
  localStorage.setItem(CASES_KEY, JSON.stringify(cases));
}

// ---- COLLABORATORS (CLINIC MEMBERS) PERSISTENCE ----
export function loadCollaborators(): AppUser[] {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_USERS;
  }
}

export function saveCollaborators(users: AppUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ---- COLUMNS PERSISTENCE ----
export function loadColumns(): BoardColumn[] {
  const stored = localStorage.getItem(COLUMNS_KEY);
  if (!stored) {
    localStorage.setItem(COLUMNS_KEY, JSON.stringify(DEFAULT_COLUMNS));
    return DEFAULT_COLUMNS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_COLUMNS;
  }
}

export function saveColumns(columns: BoardColumn[]): void {
  localStorage.setItem(COLUMNS_KEY, JSON.stringify(columns));
}

// ---- LABORATORIES PERSISTENCE ----
export function loadLaboratories(): string[] {
  const stored = localStorage.getItem(LABS_KEY);
  if (!stored) {
    localStorage.setItem(LABS_KEY, JSON.stringify(DEFAULT_LABS));
    return DEFAULT_LABS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_LABS;
  }
}

export function saveLaboratories(labs: string[]): void {
  localStorage.setItem(LABS_KEY, JSON.stringify(labs));
}
