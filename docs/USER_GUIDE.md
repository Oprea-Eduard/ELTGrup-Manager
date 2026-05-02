# ELTGRUP Manager — Ghid de utilizare

**Versiune document:** 0.3.1 | **Platforma:** web (Next.js) | **Optimizat pentru:** desktop, tableta, mobil

---

## Cuprins

1. [Introducere](#1-introducere)
2. [Autentificare](#2-autentificare)
3. [Panou principal (Dashboard)](#3-panou-principal-dashboard)
4. [Oferte](#4-oferte)
5. [Proiecte](#5-proiecte)
6. [Lucrari (Ordine de lucru)](#6-lucrari)
7. [Pontaj (Timp de lucru)](#7-pontaj)
8. [Calendar](#8-calendar)
9. [Depozit (Materiale, Scule, Echipamente)](#9-depozit)
10. [Documente](#10-documente)
11. [Clienti](#11-clienti)
12. [Rapoarte zilnice](#12-rapoarte-zilnice)
13. [Subcontractori](#13-subcontractori)
14. [Financiar](#14-financiar)
15. [Echipe](#15-echipe)
16. [Notificari](#16-notificari)
17. [Setari](#17-setari)
18. [Scurtaturi tastatura](#18-scurtaturi-tastatura)
19. [Intrebari frecvente](#19-intrebari-frecvente)

---

## 1. Introducere

ELTGRUP Manager este platforma operationala pentru constructii, proiectare si echipe de teren. Acopera fluxul complet: **oferta → proiect → executie → facturare**.

### Roluri si permisiuni

| Rol | Acces principal |
|-----|----------------|
| **Super Admin** | Control total. Administratori, roluri, setari, toate modulele. |
| **Administrator** | Acces complet la toate modulele. Nu poate administra utilizatori. |
| **Project Manager** | Oferte, proiecte, lucrari, echipe, pontaj, facturi, rapoarte. |
| **Sef de santier** | Proiecte, lucrari, echipe, pontaj, documente, rapoarte. Fara facturi. |
| **Magazioner** | Gestiune completa materiale + scule. Vizualizare proiecte/lucrari. |
| **Backoffice** | Suport operational: proiecte, lucrari, documente, rapoarte. |
| **Muncitor** | Taskuri proprii, pontaj, documente, rapoarte de teren. |
| **Contabil** | Facturi, costuri, pontaj (vizualizare+export). |
| **Client** | Vizualizare proiecte, documente, facturi. |
| **Subcontractor** | Taskuri atribuite, documente, rapoarte. |

---

## 2. Autentificare

Accesati `https://eltgrupmanager.vercel.app` — veti fi redirectati catre pagina de autentificare.

1. Introduceti **email-ul** (se face automat lowercase)
2. Introduceti **parola**
3. Apasati **"Autentificare"**

**Erori comune:**
- *"Credentiale invalide"* — email sau parola gresita. Dupa 5 incercari esuate, veti fi blocat temporar 15 minute.
- *"Sesiune invalida"* — ati fost deconectat. Reautentificati-va.

Dupa logare, veti fi redirectionat catre **Panou operational** (dashboard-ul personalizat pe rolul dvs.).

---

## 3. Panou principal (Dashboard)

`/panou` — prima pagina dupa autentificare. Se adapteaza dupa rolul dvs.

### Ce vedeti

- **KPI-uri**: proiecte active, lucrari intarziate, pontaje active, cereri materiale, creante
- **Grafic ore facturabile**: distributia orelor pe proiecte (ultimele 6)
- **Activitate recenta**: ultimele 8 actiuni in sistem
- **Widget-uri**: FGO/eFactura, pipeline comercial, avizare ISU, status proiecte, status echipe
- **Prioritati rol**: recomandari contextuale bazate pe rolul dvs.
- **Program echipe**: taskurile planificate pentru ziua curenta

### Actiuni rapide

- Click pe orice card KPI pentru a naviga la modulul corespunzator
- Folositi **Cmd+K** (sau Ctrl+K) pentru Command Palette
- Folositi **scurtaturile de tastatura** (vezi sectiunea 18)

---

## 4. Oferte

`/oferte` — gestionarea ofertelor tehnico-comerciale.

### Creare oferta
1. Apasati **"Oferta noua"**
2. Completati: titlu, client, proiect, valabilitate
3. Adaugati articole (denumire, cantitate, pret unitar)
4. Apasati **"Salveaza"**

### Statusuri oferta
- **Draft** — in lucru
- **Trimisa** — expediata clientului
- **Acceptata** — clientul a acceptat → se poate converti in proiect
- **Respinsa** — oferta neacceptata

### Conversie oferta → proiect
Din pagina de detalii oferta (status ACCEPTATA), apasati **"Converteste in proiect"**. Se va crea automat un proiect cu datele din oferta.

---

## 5. Proiecte

`/proiecte` — modulul central al platformei.

### Lista proiecte
- Cautare dupa titlu
- Filtrare dupa status (Activ, Planificat, Blocat, Finalizat)
- Paginare (10 per pagina)
- Actiuni in masa: schimbare status, arhivare

### Detalii proiect (`/proiecte/[id]`)
Pagina contine:

| Sectiune | Ce contine |
|----------|------------|
| **Header** | Cod proiect, client, adresa, actiuni rapide (Calendar, Pontaj, Rapoarte) |
| **KPI proiect** | Status, Buget estimat, Cost real, Facturat, Marja estimata |
| **Faze proiect** | Lista fazelor (OFERTARE, PROIECTARE, AVIZ_ISU, EXECUTIE, etc.) cu status |
| **Lucrari active** | Taskurile din proiect, ordonate dupa termen |
| **Instalatii** | Echipamente instalate, verificari periodice, status certificare |
| **Avize/Permise** | Urmarire autorizatii (ISU, SSM, Pompieri) |
| **Planuri tehnice** | Documente grupate pe discipline (detectie, electric, HVAC, sanitar, etc.) |
| **Documente generale** | Restul documentelor proiectului |
| **Materiale consumate** | Lista materialelor utilizate |
| **Facturi** | Facturile emise pe proiect |
| **Costuri** | Costurile operationale inregistrate |
| **Rapoarte zilnice** | Rapoartele de santier |
| **Subcontractori** | Subcontractorii asignati |
| **Activitate recenta** | Timeline complet al actiunilor pe proiect |

### Actiuni
- **Editeaza** — modifica titlu, adresa, valori, date
- **Arhiveaza** — soft-delete (se poate restaura)
- **Schimba status** — Planificat → Activ → Blocat → Finalizat
- **Adauga lucrare** — creaza o ordine de lucru in proiect

---

## 6. Lucrari

`/lucrari` — taskuri si ordine de lucru.

### Creare lucrare
1. Apasati **"Lucrare noua"**
2. Selectati proiectul (obligatoriu)
3. Completati: titlu, echipa, responsabil, termene, ore estimate, prioritate
4. Indicatorul de incarcare va arata disponibilitatea echipei/responsabilului
5. Apasati **"Salveaza"**

### Statusuri lucrare
- **Todo** — neinceputa
- **In Progress** — in executie
- **Blocked** — blocata (necesita interventie)
- **Review** — in verificare
- **Done** — finalizata
- **Canceled** — anulata

### Filtru teren
Adaugati `?filter=teren` in URL pentru a vedea doar lucrarile de teren. Pagina `/teren` face automat acest lucru.

### Checklist
Fiecare lucrare poate contine itemi de checklist. Bifati pe masura ce progresati.

---

## 7. Pontaj

`/pontaj` — inregistrarea timpului de lucru.

### Inregistrare pontaj
1. Apasati **"Pontaj nou"**
2. Selectati: proiect, lucrare (optional), angajat (optional — doar managerii)
3. Alegeti modul:
   - **Tura standard** (8h, se termina la 17:00) — completati doar startul
   - **Personalizat** — completati si start si final
4. Adaugati pauza (minute)
5. Apasati **"Salveaza"**

### Aprobare pontaj
Managerii pot **aprecia** (aproba) sau **respinge** pontajele inregistrate.
Pontajul aprobat genereaza automat un cost de mana de lucru.

### Pontaj live
Muncitorii pot porni/opri cronometrul direct din aplicatie. Timpul se calculeaza automat.

---

## 8. Calendar

`/calendar` — planificarea si programarea echipelor.

Vizualizare saptamanala/lunara a lucrarilor planificate.
- Fiecare task apare cu titlu, proiect si echipa
- Click pe un task pentru detalii rapide
- Planificati taskuri noi direct din interfata

---

## 9. Depozit

`/materiale` — modulul unificat pentru materiale, scule si echipamente.

### Tab-uri disponibile
- **Materiale** — catalog materiale, stocuri, cereri
- **Scule** (`?tab=scule`) — gestiune scule si unelte
- **Echipamente** (`?tab=echipamente`) — echipamente cu seria, cod QR, mentenanta

### Cereri materiale
1. Apasati **"Cerere noua"**
2. Selectati proiectul, materialul, cantitatea
3. Status: PENDING → APPROVED → ISSUED
4. Managerii pot **aproba** sau **respinge**

### Miscari de stoc
- **IN** — intrare in depozit
- **OUT** — iesire (consum pe proiect)
- **TRANSFER** — intre depozite
- **RETURN** — retur din teren
- **WASTE** — casare
- **ADJUSTMENT** — corectie inventar

### Echipamente
Fiecare echipament are: cod unic, serie, categorie, data de mentenanta, status (Disponibil, In uz, In mentenanta, Retras).
- Scanati codul QR pentru detalii rapide
- Statusul se actualizeaza automat la asignare/returnare

---

## 10. Documente

`/documente` — stocarea si gestionarea documentelor.

### Incarcare document
1. Apasati **"Document nou"**
2. Selectati fisierul (PDF, imagine, Office — max 20MB)
3. Completati: titlu, categorie, proiect/client/lucrare (optional)
4. Tag-uri (ex: `plan:fire-detection`, `factura:fornitor`)
5. Optiuni: document privat (vizibil doar echipei) / public (vizibil si clientului)
6. Data expirare (optional — documente cu termen)
7. Apasati **"Salveaza"**

### Categorii
Contract, Anexa, Oferta, Factura, Aviz livrare, Raport santier, Foto, Conformitate, Autorizatie, Predare, Altele

### Actiuni in masa
Selectati mai multe documente cu checkbox si aplicati: **Face public**, **Face privat**, **Sterge**.

---

## 11. Clienti

`/clienti` — baza de date clienti.

### Creare client
1. Apasati **"Client nou"**
2. Completati: nume, CUI, reg. comert, adresa, contacte
3. Optiuni: TVA la incasare, plata

### Fisa client
- Date generale
- Contacte asociate
- Proiecte asociate
- Oferte emise
- Facturi emise
- Note interne

---

## 12. Rapoarte zilnice

`/rapoarte-zilnice` — rapoartele de santier.

### Creare raport
1. Apasati **"Raport nou"**
2. Selectati proiectul si lucrarea (optional)
3. Completati:
   - Vremea
   - Numar muncitori (0-200)
   - Subcontractori prezenti
   - Lucrari executate (obligatoriu, minim 3 caractere)
   - Blocaje (daca completati, se notifica managerii automat)
   - Incidente de siguranta
   - Materiale primite
   - Echipamente utilizate
   - Poze (URL-uri, separate prin virgula)
4. Apasati **"Salveaza"**

---

## 13. Subcontractori

`/subcontractori` — colaboratori externi.

- Creare fisa subcontractor (nume, email, telefon, domeniu)
- Atribuire proiecte
- Status aprobare: PENDING → APPROVED → REJECTED
- Arhivare (soft-delete)

---

## 14. Financiar

`/financiar` — facturi si costuri.

### Facturi
- Lista facturi cu status: DRAFT, SENT, OVERDUE, PAID, PARTIAL_PAID, CANCELED
- Actualizare status (la SCHIMBA STATUS)
- Daca o factura devine RESTANTA, se notifica automat contabilul si managerul
- Stergerea este **soft-delete** (recuperabila)

### Costuri operationale
- Tipuri: LABOR, MATERIAL, SUBCONTRACTOR, TRANSPORT, EQUIPMENT, OTHER
- Fiecare cost se ataseaza unui proiect
- Costurile de mana de lucru se genereaza automat la aprobarea pontajului

### Exporturi
Datele financiare se pot exporta in CSV din API.

---

## 15. Echipe

`/echipe` — organizarea echipelor de lucru.

### Creare echipa
1. Apasati **"Echipa noua"**
2. Nume, cod unic, regiune (optional)
3. Selectati liderul echipei
4. Adaugati membri
5. Apasati **"Salveaza"**

### Gestionare
- Adaugare/eliminare membri
- Arhivare (soft-delete) / Restaurare

---

## 16. Notificari

`/notificari` — notificarile in aplicatie.

Notificarile apar automat pentru:
- Lucrari noi atribuite
- Termene depasite
- Stocuri scazute
- Documente lipsa
- Proiecte/blocaje intarziate
- Cereri de aprobare pontaj
- Cereri materiale
- Facturi restante
- Documente care expira

Numarul de notificari necitite apare in bara de sus langa clopotel.

---

## 17. Setari

`/setari` — administrarea platformei.

### Tab-uri
- **Setari generale** — configurari platforma
- **Activitate** (`?tab=activitate`) — log-ul complet de activitate al platformei

### Administrare utilizatori (doar SUPER_ADMIN / ADMINISTRATOR)
- Creare utilizator: nume, prenume, email, parola, rol
- Activare/Dezactivare cont
- Stergere (soft-delete — email-ul se anonimizeaza)
- Schimbare roluri

**Atentie:** Nu puteti sterge ultimul Super Admin activ.

### Cleanup date demo
Din setari, puteti sterge toate datele demonstrative (cu confirmare).

---

## 18. Scurtaturi tastatura

| Tasta | Actiune |
|-------|---------|
| **Cmd+K** / **Ctrl+K** | Command Palette (cautare globala) |
| **P** | Proiecte |
| **L** | Lucrari |
| **C** | Clienti |
| **F** | Financiar |
| **O** | Oferte |
| **M** | Materiale / Depozit |
| **D** | Documente |
| **E** | Echipe |
| **T** | Pontaj (Time tracking) |
| **N** | Notificari |
| **S** | Setari |

**Scurtaturile functioneaza doar cand nu sunteti focusat pe un camp de input.**

### Cautare globala
In caseta de cautare (bara de sus), puteti folosi prefixe:
- `proiect: text` — cauta in proiecte
- `lucrare: text` — cauta in lucrari
- `client: text` — cauta in clienti
- `document: text` — cauta in documente
- `financiar: text` — cauta in finante
- `material: text` — cauta in materiale
- etc.

Fara prefix, cautarea fuzzy cauta in toate modulele simultan.

---

## 19. Tema

Aplicatia suporta doua teme:
- **Intunecata (dark)** — implicita, optimizata pentru birou si teren
- **Lumina (light)** — pentru medii bine iluminate

Schimbati tema din sidebar (butonul 🌙/☀️ din dreapta-jos). Alegerea se salveaza automat.

---

## 20. Intrebari frecvente

### Cum resetez parola?
Contactati un administrator al platformei. Resetarea parolei nu este disponibila self-service.

### De ce nu vad anumite module?
Accesul la module este controlat de rol. Contactati administratorul pentru modificarea rolului.

### Cum pot exporta date?
Din paginile cu tabele, puteti folosi functia de export (unde disponibila). API-urile de export sunt protejate prin permisiuni.

### Datele sterse mai pot fi recuperate?
Majoritatea stergerilor sunt **soft-delete** — datele raman in baza de date (marcate ca sterse). Contactati administratorul pentru recuperare.

### Aplicatia functioneaza pe telefon?
Da, interfata este responsive. Folositi meniul hamburger (stanga-sus) pentru navigare pe mobil.

### Cum raportez o problema?
Folositi email-ul: **administrator ELTGRUP** sau creati un ticket in repository-ul GitHub.
