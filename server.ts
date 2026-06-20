/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json({ limit: '10mb' }));

// Ensure database folders exist
const DATA_DIR = path.join(process.cwd(), "data");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const DB_FILE = path.join(DATA_DIR, "database.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Initial/default data
const DEFAULT_USERS = [
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

const DEFAULT_COLUMNS = [
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

const DEFAULT_LABS = [
  'In-House Studio (Leo)',
  'Apex Elite Lab (Esterno)',
  'Glidewell Mill-Center',
  'Signature Aesthetics Inc'
];

const INITIAL_CASES = [
  {
    id: 'case-101',
    patientName: 'Eleanor Vance',
    restorationSpecifics: 'Riabilitazione Completa della Bocca in Zirconia Prettau per l\'Arcata Superiore e Inferiore (#18-#27, #38-#47). Colore BL2 (Sbiancato), moncone ND3.',
    dentistId: 'user1',
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
    dentistId: 'user2',
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
    dentistId: 'user1',
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

const DEFAULT_DB = {
  cases: INITIAL_CASES,
  columns: DEFAULT_COLUMNS,
  collaborators: DEFAULT_USERS,
  laboratories: DEFAULT_LABS
};

// Database helper functions
function getDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
    return DEFAULT_DB;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Database file is corrupted. Re-initializing with defaults.", err);
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
    return DEFAULT_DB;
  }
}

function writeDB(data: typeof DEFAULT_DB) {
  // Sync write to ensure atomicity
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  createBackup(data);
}

// Backup logic (keeps last 30 automated backups)
function createBackup(data: typeof DEFAULT_DB) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(BACKUP_DIR, `backup_${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), "utf8");
    
    // Clean up older backups if count exceeds 30
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith("backup_") && f.endsWith(".json"))
      .map(f => ({ name: f, path: path.join(BACKUP_DIR, f), time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time); // newest first

    if (files.length > 30) {
      const filesToDelete = files.slice(30);
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
      }
    }
  } catch (err) {
    console.error("Failed to create automated backup:", err);
  }
}

// REST API Endpoints

// Get entire DB state
app.get("/api/db", (req, res) => {
  res.json(getDB());
});

// Save/overwrite the whole DB (convenient for unified operations)
app.post("/api/db/save", (req, res) => {
  const data = req.body;
  if (!data || !data.cases || !data.columns || !data.collaborators || !data.laboratories) {
    return res.status(400).json({ error: "Dati non validi" });
  }
  writeDB(data);
  res.json({ success: true, message: "Database salvato con successo" });
});

// Reset database to initial clinic defaults
app.post("/api/db/reset", (req, res) => {
  writeDB(DEFAULT_DB);
  res.json({ success: true, message: "Database ripristinato con successo", db: DEFAULT_DB });
});

// Listing available backups
app.get("/api/db/backups", (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith("backup_") && f.endsWith(".json"))
      .map(f => {
        const stats = fs.statSync(path.join(BACKUP_DIR, f));
        return {
          filename: f,
          date: stats.mtime.toISOString(),
          size: stats.size
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // newest first
    res.json({ backups: files });
  } catch (err) {
    res.status(500).json({ error: "Impossibile leggere l'elenco dei backup" });
  }
});

// Restore from a specific backup file
app.post("/api/db/backups/restore", (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: "Nome file mancante" });
  }
  
  const targetFile = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(targetFile)) {
    return res.status(404).json({ error: "File di backup non trovato" });
  }

  try {
    const raw = fs.readFileSync(targetFile, "utf8");
    const parsed = JSON.parse(raw);
    writeDB(parsed);
    res.json({ success: true, message: `Database ripristinato con successo dal backup ${filename}`, db: parsed });
  } catch (err) {
    res.status(500).json({ error: "Errore durante il ripristino del backup" });
  }
});

// Setup Vite & express Static directories
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite Middlewares in development mode
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static delivery
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sciunnach Prosthodontics] Server is running on port ${PORT}`);
    console.log(`Database folder is located at: ${DATA_DIR}`);
    console.log(`Backup folder is located at: ${BACKUP_DIR}`);
  });
}

startServer();
