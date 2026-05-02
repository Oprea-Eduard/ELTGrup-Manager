# ELTGRUP Manager — Analiză aplicație & Plan de evoluție

**Versiune curentă:** 0.3.2 | **Data:** Mai 2026 | **Context:** Aplicație construită pentru [ELT Grup Servicii](https://eltgrupservicii.ro/) — antreprenor general în instalații MEP, PSI, BMS

---

## Cuprins

1. [Stadiul actual](#1-stadiul-actual)
2. [Probleme identificate](#2-probleme-identificate)
3. [Plan de simplificare UI](#3-plan-de-simplificare-ui)
4. [Noi feature-uri propuse](#4-noi-feature-uri-propuse)
5. [Roadmap propus](#5-roadmap-propus)
6. [Variante de arhitectură viitoare](#6-variante-de-arhitectura-viitoare)

---

## 1. Stadiul actual

### Ce funcționează bine

| Aspect | Stare |
|--------|-------|
| **Arhitectură securitate** | Multi-layer (edge → auth → RBAC → scope → audit). Excelent. |
| **Autentificare + roluri** | 10 roluri, 11 resurse, 7 acțiuni. Matrice completă. |
| **37 modele DB** | Acoperă întreg fluxul: ofertă → proiect → execuție → facturare |
| **Soft-delete** | Consecvent pe toate entitățile cu `deletedAt` |
| **Dark/Light theme** | Implementat cu CSS vars, toggle în sidebar, persistat |
| **Keyboard shortcuts** | 11 comenzi rapide + Cmd+K command palette |
| **Căutare fuzzy** | fuse.js în global search cu highlight |
| **Performance** | Dynamic imports, Promise.all, connection pooling |

### Ce trebuie îmbunătățit

| Aspect | Problemă |
|--------|----------|
| **Card-uri în card-uri** | ~35 de instanțe de nesting vizual inutil — în majoritatea paginilor |
| **Dashboard aglomerat** | Prea multe widget-uri simultan fără personalizare |
| **Formulare lungi** | Formulare de creare cu 10+ câmpuri fără wizard/ghidare |
| **Lipsă offline support** | Aplicația nu funcționează deloc fără internet (problemă pe șantier) |
| **Mobile UX** | Funcționează dar nu e optimizată pentru utilizare pe telefon în teren |
| **Notificări în timp real** | Doar polling la încărcare pagină — nu vezi notificări noi fără refresh |
| **Fără PWA** | Manifest există dar nu service worker, nu instalabil |

---

## 2. Probleme identificate

### 2.1 Card-in-Card (rezolvat parțial)

**Înainte:** Fiecare secțiune avea `<Card>` care conținea `<div>`-uri cu aceleași stiluri de card. Rezultat: borduros, greu de scanat vizual.

**După:** Am introdus `ListItem` și `SectionCard` — liniar, fără borduri duble, hover highlight subtil.

**Probleme rămase:** 
- `/clienti/`, `/subcontractori/`, `/lucrari/page.tsx`, `/calendar/`, `/pontaj/`, `/notificari/` și alte pagini încă folosesc `bulk-zone` cu card-uri imbricate
- `Table` componentul încă e înconjurat de Card în multe locuri — tabelele ar trebui să fie native, nu card-uri

### 2.2 Dashboard overload

Dashboard-ul (`/panou`) are 13 widget-uri diferite — KPI-uri, grafice, activitate, pipeline, avizare, statusuri, focus rol, program. Un utilizator care intră zilnic vede aceleași informații și învață să ignore mare parte din ele.

**Soluție propusă:** Widget-uri personalizabile cu drag-and-drop (dnd-kit e deja instalat).

### 2.3 Formular fatigue

Formularele de creare (proiect, lucrare, pontaj, ofertă) au 8-15 câmpuri toate odată. Un utilizator pe șantier cu mâinile murdare nu poate completa eficient.

**Soluție propusă:** Formulare în 2 pași / mod "rapid" cu câmpuri minimale.

### 2.4 Context business lipsă

Aplicația e construită generic pentru "construcții" — dar ELT Grup Servicii are specificul ei:
- Lucrează predominant pe **instalații MEP + PSI + BMS**
- Proiectele au **faze obligatorii** (avizare ISU, proiectare, execuție, recepție)
- Au **echipe tehnice specializate** pe instalații electrice, detecție, stingere
- Lucrările implică **verificări periodice** (instalații, mentenanță)

---

## 3. Plan de simplificare UI

### 3.1 Dashboard — "Operational Cockpit"

**Acum:** 13 widget-uri static, toate vizibile simultan.

**Propune:** Layout cu 3 zone + personalizare:

```
┌─────────────────────────────────────────────┐
│  Zona 1: HEADLINE (KPI-uri critice)         │
│  [Proiecte active] [Lucrări urgente]        │
│  [Echipe în teren] [Creanțe]                │
├──────────────────┬──────────────────────────┤
│  Zona 2: MONITOR  │  Zona 3: ACȚIUNI        │
│  (configurabil)   │  (configurabil)          │
│  ┌──────────────┐ │  ┌────────────────────┐ │
│  │ Grafice ore  │ │  │ Notificări recente │ │
│  │ Pipeline     │ │  │ Prioritar rol      │ │
│  │ Status proi. │ │  │ Activitate         │ │
│  │ Widget FGO   │ │  │ Program azi        │ │
│  └──────────────┘ │  └────────────────────┘ │
├──────────────────┴──────────────────────────┤
│  Zona BOTTOM: Timeline / Tabel program       │
└─────────────────────────────────────────────┘
```

**Implementare:**
- Zonele 2+3 folosesc `@dnd-kit/core` + `@dnd-kit/sortable` (deja instalat la `^6.3.1` și `^10.0.0`)
- Persistență per utilizator (localStorage sau DB)
- Fiecare widget e un `SectionCardSimple` cu header + conținut

### 3.2 Pagină listă — "Data Grid" în loc de "Card Grid"

**Acum:** Fiecare pagină listă (proiecte, lucrări, materiale, etc.) are:
- PageHeader (Card)
- Stat cards (KpiCard)
- Filtre (Card)
- Listă/Card conținând rânduri (Card)

**Propune:** O structură plată:

```
PageHeader (non-Card)
├── KPI row (slim, no Card, just text+number)
├── Filters bar (inline, no Card)
├── Bulk bar (appears on select)
└── Table or List (no wrapping Card)
    ├── Row 1 (hover highlight, no border)
    ├── Row 2
    └── ...
```

**Implementare:**
- `PageHeader` rămâne dar fără border-bottom și shadow — doar text
- KPI-urile devin `<div>` simple cu text mare, nu Card-uri — mai rapid de scanat
- Filtrele devin o bară orizontală, nu un Card
- Tabelul nu mai e învelit în Card — `Table` e direct în pagină

### 3.3 Pagină detaliu — "Dashboard-ul entității"

**Acum:** Pagina detaliu proiect are 15 secțiuni, fiecare într-un Card, cu scroll infinit.

**Propune:** Layout cu 2 coloane + sticky nav internă:

```
┌─────────────────────────────────────────────┐
│ PageHeader + Breadcrumb                     │
├──────────────────┬──────────────────────────┤
│  Coloana stângă  │  Coloana dreaptă         │
│  (conținut      │  (informații conexe)      │
│   principal)    │                           │
│  ┌────────────┐  │  ■ KPI proiect           │
│  │ Lucrări    │  │  ■ Faze                  │
│  │ active     │  │  ■ Timeline activitate   │
│  └────────────┘  │  ■ Documente recente     │
│  ┌────────────┐  │  ■ Echipă                │
│  │ Instalații │  │  ■ Costuri               │
│  └────────────┘  │                           │
│  ┌────────────┐  │                           │
│  │ Rapoarte   │  │                           │
│  └────────────┘  │                           │
└──────────────────┴──────────────────────────┘
```

### 3.4 Formulare — "Quick Forms"

**Acum:** Formulare lungi cu toate câmpurile vizibile.

**Propune:** 3 niveluri de intrare:
- **Quick** (minimal, 3-5 câmpuri) — pentru creare rapidă din teren
- **Standard** (complet, cu secțiuni colapsabile) — pentru birou
- **Bulk** (import CSV / duplicate din șablon)

Exemplu **Quick Create Work Order**:
```
[Titlu] [Proiect] [Echipă] → Salvează

(După salvare, utilizatorul e întrebat: "Vrei să adaugi detalii?" → formular complet)
```

### 3.5 Mobile-first redesign

**Acum:** Layout-ul e desktop-first cu adaptare mobilă.

**Propune:** Mobile-first cu:
- Bottom navigation bar în loc de sidebar pe telefon
- Tabele → card-uri swipeable (ca Tinder cards pentru taskuri)
- Quick actions: FAB (Floating Action Button) pentru acțiunile frecvente
- Pontaj cu un singur tap → "Start/Stop"

---

## 4. Noi feature-uri propuse

### 4.1 🔥 Prioritate maximă — aliniere cu business-ul ELT Grup

| Feature | Descriere | Impact |
|---------|-----------|--------|
| **Module tehnice specializate** | Tab-uri în proiect după specialitate: PSI, Electrice, BMS, HVAC, Sanitare | Reflectă exact cele 6 servicii de pe site |
| **Șabloane de lucrări** | "Verificare trimestrială PSI", "Instalare detector fum", "Testare stingere" — cu checklist pre-populat | Reduce timpul de creare cu 80% |
| **Avizare ISU intégré** | Urmărire fază: Documentație → Depunere ISU → Aviz → Autorizație → Recepție | Flux complet, nu doar notițe |
| **Caiet de sarcini** | Template pentru caiet de sarcini per tip instalație (generat din config) | Documentație tehnică standardizată |
| **Verificări periodice** | Calendar automat de mentenanță: detectoare, stingere, hidranți, tablouri | Conformare legală fără efort manual |
| **QR Code pe echipamente** | Deja există în schemă (`Equipment.serialNumber`) — de afișat și printat | Trasabilitate fizică |

### 4.2 Funcționalități operaționale

| Feature | Descriere |
|---------|-----------|
| **Pontaj cu NFC/BLE** | Muncitorii își scanează telefonul pe un tag la intrare/ieșire |
| **Galerie foto proiect** | Poze încărcate din teren apar ca galerie vizuală, nu listă |
| **Rapoarte PDF automate** | Generează raport zilnic/săptămânal ca PDF descărcabil |
| **Harta proiecte** | Proiectele pe hartă (GPS deja în schemă `Project.gpsCoordinates`) |
| **Chat intern** | Mesagerie simplă pe proiect/lucrare (pentru blocaje rapide) |
| **Semnătură digitală** | RAF/PVS (Proces Verbal de Recepție) cu semnătură în aplicație |
| **Notificări push** | Push pe telefon pentru: lucrare nouă, termen depășit, aprobare necesară |
| **Dashboard subcontractori** | Portal separat pentru subcontractori să-și vadă doar taskurile |

### 4.3 Funcționalități financiar-contabile

| Feature | Descriere |
|---------|-----------|
| **Integrare eFactura completă** | FGO e deja implementat, dar nu e activat în producție (`EFATURA_ENABLED=false`) |
| **Deviz estimativ vs. real** | Comparație automată între ofertă și costurile reale per fază |
| **Notă de intrare recepție (NIR)** | Document pentru recepția materialelor |
| **Borderou de lucrări** | Listă lunară cu ore, materiale, costuri per proiect |
| **Facturare anti-fraudă** | Statusuri FGO: SENT_TO_ANAF, VALIDATION_OK, SUBMITTED_OK, REJECTED |

### 4.4 Funcționalități de business

| Feature | Descriere |
|---------|-----------|
| **Analytics avansat** | Profitabilitate per proiect, per echipă, per tip instalație |
| **Raport săptămânal automat** | Trimis pe email către management în fiecare luni |
| **Time tracking pe fază** | Orele pontate se alocă pe fază de proiect, nu doar pe proiect |
| **Dashboard client** | Portal client cu progres proiect, documente publice, facturi |
| **Integrare calendar Google/Outlook** | Taskurile apar în calendarul personal al utilizatorului |

---

## 5. Roadmap propus

### Faza 1 — Quick Win (1-2 săptămâni) ✅ IN PROGRESS

- [x] Eliminare Card-in-Card nesting (35 instanțe)
- [x] SectionCard + ListItem components
- [x] Light/Dark theme complet
- [x] Keyboard shortcuts

### Faza 2 — Mobile & Offline (2-3 săptămâni)

- [ ] PWA complet: manifest + service worker + install prompt
- [ ] Bottom navigation bar pe mobil
- [ ] FAB pentru quick actions
- [ ] IndexedDB cache pentru date recente (offline-first)
- [ ] Pontaj offline: start/stop fără internet, sync când revine

### Faza 3 — Specific ELT Grup (3-4 săptămâni)

- [ ] Șabloane de lucrări PSI/Electrice/BMS
- [ ] Avizare ISU — flux complet cu etape
- [ ] Verificări periodice automate (calendar mentenanță)
- [ ] QR code generation pentru echipamente
- [ ] Module tehnice (tab-uri în proiect per specialitate)

### Faza 4 — Financiar & Analytics (2-3 săptămâni)

- [ ] Deviz vs. real dashboard
- [ ] FGO/eFactura activare producție
- [ ] Borderou lunar automat
- [ ] Profitabilitate per tip instalație
- [ ] Raport săptămânal automat pe email

### Faza 5 — Colaborare & Portal (3-4 săptămâni)

- [ ] Chat intern pe proiect/lucrare
- [ ] Portal subcontractor (autonom, login separat, taskuri proprii)
- [ ] Dashboard client cu progres
- [ ] Semnătură digitală pentru RAF/PVS
- [ ] Galerie foto proiect

---

## 6. Variante de arhitectură viitoare

### Varianta A: PWA + Notificări Push (recomandat pentru 2026)

```
Frontend: Next.js PWA (service worker + manifest)
  ├── Cache static (app shell)
  ├── Cache dinamic (date recente în IndexedDB)
  ├── Push notifications (Web Push API)
  └── Background sync (pontaj offline)

Backend: Next.js API + WebSocket (sau SSE)
  ├── API routes (existente)
  ├── WebSocket server (notificări în timp real)
  └── Cron jobs (rapoarte automate, verificări)
```

**De adăugat:**
- `next-pwa` sau `@serwist/next` pentru service worker
- `web-push` pentru notificări push
- SSE (Server-Sent Events) pentru notificări live

### Varianta B: Aplicație Hibridă (React Native sau Tauri)

Pentru utilizare intensivă pe șantier (pontaj NFC, scanare QR, cameră foto):
- Aplicație React Native separată pentru "ELT Teren"
- Sincronizare cu API-ul existent
- Funcționalități native: cameră, NFC, GPS background, notificări push

### Varianta C: Micro-frontend cu portale

Pentru clienți și subcontractori:
- Portal client: Next.js standalone (doar proiecte + documente publice)
- Portal subcontractor: React standalone (doar taskuri + rapoarte)
- Toate share-uiesc aceeași bază de date și auth

---

## Concluzii

### Ce am făcut deja în v0.3.x

| Acțiune | Status |
|---------|--------|
| Card-in-Card eliminat (~35 instanțe) | ✅ |
| SectionCard + ListItem + ListItemSlim | ✅ |
| Light mode funcțional | ✅ |
| Keyboard shortcuts | ✅ |
| Căutare fuzzy | ✅ |
| Breadcrumbs | ✅ |
| Animații micro (stagger) | ✅ |
| Skeleton-uri specifice | ✅ |
| Documentație arhitectură | ✅ |
| User manual | ✅ |
| Culori hardcodate → CSS vars | ✅ |
| Nav simplificată (redirect-uri) | ✅ |

### Următorii pași recomandați

1. **PWA**: service worker + cache offline (estimat: 3 zile)
2. **Șabloane lucrări PSI**: cele mai frecvente 10 tipuri de lucrări cu checklist (estimat: 2 zile)
3. **Avizare ISU**: flux complet cu etape și documente (estimat: 4 zile)
4. **Notificări push**: SSE + Web Push (estimat: 3 zile)
5. **Analytics**: profitabilitate deviz vs. real (estimat: 2 zile)
6. **FGO activare producție**: schimbat `.env` + testat (estimat: 1 zi)

**Total estimat Faze 2-5:** ~12-18 săptămâni
**Total estimat Quick Wins (Faza 1):** 1-2 săptămâni (aproape complet)
