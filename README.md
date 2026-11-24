# Gestionale per piccola impresa — Capstone

Applicazione web per gestire **clienti, prodotti e ordini** di una piccola impresa, con una dashboard che riassume l'andamento delle vendite. È il progetto finale del corso di web development e usa le tecnologie viste durante il corso: **HTML, CSS, JavaScript, Node.js e MongoDB**.

---

## 1. Utenti di prova

Dopo aver eseguito `npm run seed`, nel database esistono due utenti per provare l'applicazione:

| Ruolo | Email | Password |
|---|---|---|
| Amministratore | `admin@azienda.it` | `admin123` |
| Operatore | `operatore@azienda.it` | `operatore123` |

La differenza tra i due ruoli è questa: l'**amministratore** può fare tutto, compresa l'eliminazione di clienti, prodotti e ordini; l'**operatore** può consultare, creare e modificare, ma il pulsante "Elimina" non gli viene mostrato e, anche se provasse a chiamare l'API a mano, il server lo rifiuterebbe. Solo l'amministratore vede la pagina **Utenti**.

> Sono credenziali di prova, pensate solo per la dimostrazione. In un'applicazione reale andrebbero cambiate subito.

---

## 2. Come avviare il progetto

Servono **Node.js** (versione 18 o superiore) e un database **MongoDB**.

1. Apri la cartella del progetto nel terminale e installa le librerie: `npm install`
2. Crea un database gratuito su **MongoDB Atlas** (cluster gratuito → *Database Access* per creare un utente → *Network Access* per autorizzare il tuo indirizzo IP → *Connect → Drivers* per copiare la stringa di connessione).
3. Copia il file `.env.example` in un nuovo file chiamato `.env` e compilalo:
   ```
   MONGODB_URI=mongodb+srv://UTENTE:PASSWORD@cluster0.xxxxx.mongodb.net/gestionale?retryWrites=true&w=majority
   JWT_SECRET=una-frase-lunga-e-casuale
   PORT=3000
   ```
4. Popola il database con dati di esempio: `npm run seed`
5. Avvia il server: `npm start`
6. Apri `http://localhost:3000` nel browser e accedi con uno degli utenti di prova.

Il file `.env` contiene le credenziali del database e **non deve mai essere condiviso né caricato su GitHub** (è già escluso dal `.gitignore`).

---

## 3. Cosa fa l'applicazione

- **Accesso protetto**: senza login non si vede nulla. Dopo l'accesso la sessione dura 8 ore.
- **Clienti**: elenco, ricerca per nome, email o città, creazione, modifica ed eliminazione.
- **Prodotti**: come i clienti, con codice, prezzo e giacenza. I prodotti in esaurimento (5 pezzi o meno) vengono evidenziati.
- **Ordini**: si crea un ordine scegliendo un cliente e uno o più prodotti con le quantità. Il totale viene calcolato dal server. Ogni ordine passa per gli stati *Nuovo → In lavorazione → Spedito → Consegnato*, oppure *Annullato*. Ogni stato ha un colore diverso.
- **Dashboard**: quattro numeri chiave (fatturato degli ultimi 6 mesi, ordini aperti, clienti, prodotti), un grafico del fatturato per mese, un grafico a ciambella degli ordini per stato, i prodotti più venduti e i prodotti con giacenza bassa.
- **Dettaglio ordine e stampa**: dal pulsante "Dettagli" si apre la scheda dell'ordine con dati del cliente, righe, imponibile, IVA al 22% e totale. Il pulsante "Stampa" produce una pagina pulita, pronta anche per essere salvata in PDF dalla finestra di stampa del browser.
- **Elenchi a pagine, con ordinamento e filtri**: clienti, prodotti e ordini mostrano 8 elementi per pagina. Cliccando sull'intestazione di una colonna (ad esempio Nome, Prezzo, Totale, Data) si ordina in modo crescente o decrescente. Gli ordini si filtrano anche per stato e per intervallo di date.
- **Gestione utenti (solo admin)**: si creano nuovi utenti, si cambia il ruolo, si reimposta la password e si attiva o disattiva l'accesso. Gli utenti non si eliminano ma si **disattivano**, così lo storico resta coerente. Un admin non può disattivare né declassare se stesso, per non restare chiuso fuori.

Alcune regole fanno in modo che i dati restino coerenti:
- quando si crea un ordine, la **giacenza dei prodotti scende** automaticamente; se la giacenza non basta, l'ordine viene rifiutato;
- se un ordine viene **annullato**, la merce **torna in magazzino**; un ordine annullato non si può più riaprire;
- un **cliente con ordini collegati non si può eliminare**;
- un **ordine si può eliminare solo se è annullato**;
- ogni riga d'ordine conserva il **nome e il prezzo del momento**: se in futuro il prezzo di un prodotto cambia, gli ordini già fatti non cambiano.

---

## 4. Le tecnologie, spiegate semplice

Un'applicazione web è come un ristorante. Il cliente (il **browser**) si siede al tavolo e guarda il menu. Il cameriere (il **server**) prende l'ordine, lo porta in cucina e riporta il piatto. In magazzino (il **database**) ci sono gli ingredienti, che restano lì anche a ristorante chiuso.

### HTML — la struttura
È il linguaggio che descrive *cosa c'è* nella pagina: titoli, tabelle, pulsanti, moduli. Nel progetto ci sono due pagine: `index.html` (il login) e `app.html` (il gestionale vero e proprio). Il contenuto delle sezioni viene poi costruito dinamicamente da JavaScript.

### CSS — l'aspetto
Descrive *come appare* la pagina: colori, spaziature, font, disposizione. Il file `public/css/style.css` contiene tutto lo stile. Qualche scelta tecnica:
- i colori sono definiti una sola volta come **variabili** (`--brand`, `--ink`…), così cambiare tema significa modificare poche righe;
- il layout usa **CSS Grid** e **Flexbox**, che permettono di disporre gli elementi in colonne e righe senza trucchi;
- le **media query** adattano l'interfaccia a schermi piccoli (su telefono la barra laterale diventa una barra in alto);
- è rispettata l'accessibilità di base: il focus da tastiera è visibile e le animazioni si disattivano se l'utente le ha disabilitate nel sistema.

### JavaScript (lato browser) — il comportamento
È il linguaggio che rende la pagina *viva*. Nel progetto è **JavaScript puro**, senza framework come React: tutto sta in `public/js/app.js` e `public/js/api.js`. Fa queste cose:
- **router a pagina singola**: cliccando su "Clienti" o "Ordini" l'indirizzo cambia (`#/clienti`) e il contenuto si aggiorna senza ricaricare la pagina;
- **richieste al server con `fetch`**: per leggere o salvare i dati chiede al server, che risponde in formato JSON;
- **costruzione delle tabelle e dei form** a partire dai dati ricevuti;
- **finestre modali** (basate sull'elemento `<dialog>` di HTML) per creare e modificare;
- **grafici disegnati a mano in SVG**, cioè con codice che genera le linee e gli spicchi, senza librerie esterne;
- **protezione dall'iniezione di codice (XSS)**: ogni testo inserito dall'utente passa da una funzione (`esc`) che neutralizza i caratteri pericolosi prima di mostrarlo.

### Node.js — JavaScript fuori dal browser
Normalmente JavaScript gira solo dentro il browser. **Node.js** permette di eseguirlo anche su un computer o un server. Qui serve per far girare il "cameriere" del nostro ristorante, cioè il backend. Il vantaggio è che si usa lo stesso linguaggio sia per l'interfaccia sia per il server.

### Express — il server web
**Express** è una libreria per Node.js che semplifica la creazione di un server. Definisce le *rotte*, cioè le "porte d'ingresso" dell'applicazione. Per esempio: "quando arriva una richiesta GET all'indirizzo `/api/customers`, leggi i clienti e rispondi con l'elenco". Nel progetto Express fa tre lavori: serve le pagine HTML/CSS/JS, risponde alle richieste dell'interfaccia (le API) e gestisce gli errori in un punto solo.

### API REST — il linguaggio tra browser e server
Le **API REST** sono un modo ordinato di organizzare le richieste. Ogni tipo di dato ha un indirizzo, e il verbo HTTP indica l'azione: `GET` per leggere, `POST` per creare, `PUT` per modificare, `DELETE` per eliminare. Le rotte del progetto:

| Indirizzo | Azioni |
|---|---|
| `/api/auth/login` | `POST` accesso |
| `/api/customers` e `/api/customers/:id` | `GET`, `POST`, `PUT`, `DELETE` |
| `/api/products` e `/api/products/:id` | `GET`, `POST`, `PUT`, `DELETE` |
| `/api/orders` | `GET` elenco (anche per stato), `POST` nuovo ordine |
| `/api/orders/:id/status` | `PUT` cambio di stato |
| `/api/orders/:id` | `DELETE` (solo ordini annullati) |
| `/api/orders/:id` | `GET` dettaglio con dati del cliente |
| `/api/users` e `/api/users/:id` | `GET`, `POST`, `PUT` (solo admin) |
| `/api/stats` | `GET` dati per la dashboard |

Gli elenchi accettano i parametri `page`, `limit`, `sort` e `dir` (e per gli ordini anche `status`, `from`, `to`). Il server ammette solo i campi di ordinamento previsti, per evitare richieste anomale. Senza `page` l'API restituisce l'elenco completo, utile ai menu a tendina.

### MongoDB — il database
**MongoDB** è un database "a documenti": invece di tabelle con righe e colonne rigide, salva documenti simili a oggetti JavaScript, raggruppati in *collezioni* (`users`, `customers`, `products`, `orders`). Un ordine, per esempio, contiene al suo interno l'elenco delle righe, e questo rende naturale rappresentarlo. Il database ospita i dati in modo permanente: se spegni il server, i dati restano.

### MongoDB Atlas — il database nel cloud
**Atlas** è il servizio ufficiale che ospita MongoDB su internet. Il "cluster" è semplicemente il computer in cloud su cui gira il nostro database. Il piano gratuito basta per questo progetto e non richiede di installare nulla sul proprio computer.

### Mongoose — il traduttore tra Node e MongoDB
**Mongoose** permette di descrivere la forma dei dati con gli *schemi* (`src/models.js`): quali campi ha un cliente, quali sono obbligatori, che prezzo minimo è valido. Mongoose controlla i dati *prima* di salvarli e mostra messaggi di errore chiari, per esempio "Il nome del cliente è obbligatorio".

### JWT — il "biglietto" di accesso
Quando fai login, il server verifica le credenziali e ti consegna un **token JWT**, una specie di biglietto firmato con una chiave segreta (`JWT_SECRET`). Il browser lo conserva e lo allega a ogni richiesta successiva. Il server controlla la firma: se è valida e non scaduta (8 ore), ti riconosce senza chiederti di nuovo la password. Il biglietto contiene l'identità dell'utente ma non la password.

### bcrypt — le password al sicuro
Le password **non vengono mai salvate in chiaro**. Prima del salvataggio passano per **bcrypt**, che ne calcola un'impronta (hash) irreversibile. Al login il server ricalcola l'impronta della password inserita e confronta le due. Così, anche chi leggesse il database non potrebbe ricavare le password.

### dotenv e il file `.env` — i segreti fuori dal codice
Stringa di connessione e chiave segreta stanno nel file `.env`, non nel codice. Questo evita di pubblicare per errore dati sensibili e permette di usare configurazioni diverse sul proprio computer e online.

---

## 5. Cosa succede quando crei un ordine (passo per passo)

1. Clicchi "Nuovo ordine", scegli il cliente e i prodotti, poi "Crea ordine".
2. `app.js` raccoglie i dati e li invia con `fetch` a `POST /api/orders`, allegando il token JWT.
3. Express riceve la richiesta. Il middleware `protect` controlla il token: se manca o è scaduto, risponde con errore 401.
4. La rotta verifica che il cliente esista, che le quantità siano valide e che i prodotti ci siano.
5. Per ogni prodotto scala la giacenza con un aggiornamento "atomico": MongoDB scala la quantità solo se ce n'è abbastanza. Se un prodotto non basta, annulla gli scarichi già fatti e risponde con un errore comprensibile.
6. Calcola il totale, salva l'ordine in MongoDB tramite Mongoose e risponde con l'ordine creato.
7. Il browser mostra la conferma e ricarica la tabella.

---

## 6. Struttura del progetto

```
gestionale/
├── server.js          punto di ingresso: avvia Express e si collega a MongoDB
├── seed.js            crea utenti e dati di esempio
├── package.json       elenco delle librerie e dei comandi (start, seed)
├── Procfile           comando di avvio per le piattaforme di hosting
├── .env.example       modello del file di configurazione
├── src/
│   ├── models.js      schemi dei dati: User, Customer, Product, Order
│   ├── auth.js        login, controllo del token (protect), controllo ruoli (only)
│   └── routes.js      tutte le API: CRUD, ordini, statistiche
└── public/            tutto ciò che arriva al browser
    ├── index.html     pagina di login
    ├── app.html       struttura del gestionale
    ├── css/style.css  stile
    └── js/
        ├── api.js     piccolo client per parlare con il server (aggiunge il token)
        └── app.js     router, viste, modali, grafici
```

---

## 7. Sicurezza

- password salvate con hash bcrypt;
- accesso con token JWT a scadenza; tutte le API, tranne il login, richiedono il token;
- permessi per ruolo controllati dal **server** (non solo nascosti nell'interfaccia);
- validazione dei dati con gli schemi Mongoose, con messaggi di errore chiari;
- testi dell'utente "ripuliti" prima di essere mostrati, contro gli attacchi XSS;
- la ricerca usa un'espressione regolare con i caratteri speciali neutralizzati;
- segreti nel file `.env`, escluso dal controllo di versione.

---

## 8. Limiti noti e possibili sviluppi

- Gli aggiornamenti di giacenza non usano le **transazioni** di MongoDB: in caso di errore a metà, il programma ripristina a mano le quantità già scalate.
- Non ci sono **test automatici**.
- La fattura è un **riepilogo proforma** (senza numerazione fiscale e dati dell'azienda): sarebbe il passo successivo per un uso reale.
- Altri sviluppi possibili: esportazione in CSV, immagini dei prodotti su Cloudinary, registro delle attività, cambio password dal proprio profilo, limite ai tentativi di login.

---

## 9. Pubblicazione online (deploy)

Il progetto è un'unica applicazione: Express serve sia le API sia le pagine, quindi basta **un solo servizio** online, con il database già su Atlas. Esempio con **Render** (offre un piano gratuito):

1. Carica il progetto su **GitHub** (`git init`, `git add .`, `git commit`, poi push su un nuovo repository). Il file `.env` non viene caricato perché è nel `.gitignore`.
2. In **Atlas → Network Access** consenti l'accesso da qualsiasi indirizzo (`0.0.0.0/0`): sulle piattaforme di hosting l'indirizzo IP cambia.
3. Su render.com scegli **New → Web Service**, collega il repository e imposta: *Build Command* `npm install`, *Start Command* `npm start`, piano **Free**.
4. Nelle **Environment Variables** inserisci `MONGODB_URI` e `JWT_SECRET` (le stesse del file `.env`). La porta la imposta Render da solo.
5. Avvia il deploy: otterrai un indirizzo del tipo `https://nome-progetto.onrender.com`. Se il database di Atlas è lo stesso che hai già popolato con `npm run seed`, gli utenti di prova funzionano subito.

Nota: sul piano gratuito il servizio si "addormenta" dopo circa 15 minuti senza visite, e la prima richiesta successiva può richiedere fino a circa un minuto. Il `Procfile` incluso permette l'uso anche su piattaforme in stile Heroku.

---

## 10. Crediti

Interfaccia e codice realizzati per questo capstone. Il layout a barra laterale è ispirato ai classici gestionali (tra cui il template open source *Volt React Dashboard*, analizzato all'inizio come riferimento): **nessun codice del template è stato riutilizzato**.
Librerie npm: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `dotenv`. Font: Public Sans (Google Fonts). Le icone e i grafici sono disegnati con SVG inserito nel codice.
