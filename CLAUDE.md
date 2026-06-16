# P.R. MOTO — Gestionale Officina Moto

## Panoramica
App web gestionale per **P.R. MOTO** — officina moto di Acerra (NA), Via Benedetto Croce 13/15, Tel: 333 95 41 524. Gestisce clienti, veicoli, schede lavoro, preventivi, pagamenti e analytics. Tutto in cloud.

## Stack Tecnologico
- **Frontend:** React 19 + Vite 8 (JSX, no TypeScript)
- **Styling:** TailwindCSS 4 — tema scuro custom (primary #dc2626 rosso, dark #111111)
- **Routing:** React Router DOM 7
- **Backend:** Firebase (Firestore, Auth email/password, Storage)
- **PDF:** jsPDF + jspdf-autotable
- **Grafici:** Chart.js + react-chartjs-2
- **Hosting:** Netlify (https://pr-moto.netlify.app)
- **Site ID Netlify:** cb37fd02-1317-4811-aa2d-ebdbbdeb4678

## Struttura Progetto
```
src/
├── App.jsx                # Router + AuthProvider + ProtectedRoute
├── firebase.js            # Init Firebase (Firestore, Auth, Storage)
├── main.jsx               # Entry point
├── index.css              # TailwindCSS con tema custom
├── pages/
│   ├── Login.jsx          # Login Firebase Auth
│   ├── Dashboard.jsx      # KPI, grafici fatturato/stati/pagamenti, scadenze
│   ├── Clienti.jsx        # Lista clienti con ricerca
│   ├── NuovoCliente.jsx   # Crea/modifica cliente + veicoli (marca/modello datalist)
│   ├── ClienteDettaglio.jsx # Dettaglio cliente, storico lavori, WhatsApp
│   ├── SchedaLavoro.jsx   # Lista schede lavoro con filtri
│   ├── NuovaScheda.jsx    # Crea/modifica scheda (fedele al modulo cartaceo)
│   ├── Preventivi.jsx     # Lista preventivi, approva, PDF, WhatsApp
│   └── Impostazioni.jsx   # Settings officina, template WhatsApp
├── components/
│   └── Layout.jsx         # Sidebar responsive con hamburger mobile
├── hooks/
│   ├── useAuth.jsx        # Context Firebase Auth (NB: .jsx non .js)
│   ├── useClienti.js      # CRUD clienti Firestore con onSnapshot
│   └── useSchede.js       # CRUD schede_lavoro Firestore
└── utils/
    ├── formatters.js      # formatValuta (EUR), formatData, formatDataOra
    ├── whatsapp.js        # Link WhatsApp: ritiro, preventivo, promemoria
    ├── pdf.js             # generaPDF, generaPreventivoPDF (match modulo cartaceo)
    └── motoDatabase.js    # 33 marche, 400+ modelli con autocomplete
```

## Collezioni Firestore
- **clienti** — nome, cognome, telefono, email, indirizzo, veicoli[] (marca, modello, targa, km), note, creato_il
- **schede_lavoro** — cliente_id, cliente_nome, targa, marca_moto, modello_moto, modello_veicolo, km, data, stato (in_lavorazione|completato|in_attesa|consegnato), metodo_pagamento (contanti|carta|fattura|bonifico|non_pagato), ricambi[] (descrizione, prezzo), manodopera, note_tecniche, prossima_scadenza, totale, tipo (lavoro|preventivo), numero_preventivo, creato_il

## Convenzioni
- **Lingua:** UI e codice in italiano
- **Componenti:** Funzionali con hooks, nessuna classe
- **State:** useState/useEffect, nessuna libreria esterna
- **Naming:** camelCase variabili, PascalCase componenti, snake_case campi Firestore
- **PDF:** import `{ jsPDF } from 'jspdf'` e `import autoTable from 'jspdf-autotable'` con `autoTable(doc, {...})`
- **Moto DB:** datalist HTML5 per autocomplete marca/modello, NO dropdown custom
- **Auth:** Firebase email/password, ProtectedRoute wrappa tutte le route admin

## Comandi
```bash
npm install      # Installa dipendenze
npm run dev      # Dev server Vite (localhost:5173)
npm run build    # Build produzione
```

## Deploy
Il deploy avviene tramite Netlify MCP tools da Claude Code. Il sito e' https://pr-moto.netlify.app.

## Variabili d'Ambiente (.env.local)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=pr-moto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pr-moto
VITE_FIREBASE_STORAGE_BUCKET=pr-moto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Note Importanti
- useAuth e' .jsx (contiene JSX), non .js — non rinominare
- Il repo GitHub e' genni73/pr-moto ma il codice piu' aggiornato e' sempre su Netlify
- L'utente lavora da Mac e Windows, preferisce che tutto sia fatto da Claude Code
- L'utente chiama Claude "Leo"
