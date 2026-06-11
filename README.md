# QuickSketch

Progetto realizzato per l'esame di WebTech.
QuickSketch è un'applicazione web interattiva con architettura client-server in cui gli utenti possono registrarsi, ricevere una parola casuale tramite l'API di Wikipedia, disegnarla su un canvas digitale con un tempo limite di 30 secondi e pubblicarla in bacheca. Gli altri utenti della piattaforma possono tentare di indovinare le parole degli sketch per accumulare punti.

## Tecnologie Utilizzate

### Front-End
* **React (Vite):** Creazione dell'interfaccia utente (SPA).
* **Tailwind CSS:** Styling responsivo e utility-first.
* **React Router:** Gestione delle rotte e navigazione.
* **Fabric.js:** Manipolazione e rendering del canvas di disegno.
* **Axios:** Client per le richieste HTTP verso le API di back-end.
* **Playwright:** Framework per il testing End-to-End (E2E).

### Back-End
* **Node.js & Express:** Creazione del server e gestione delle API RESTful.
* **MongoDB & Mongoose:** Database NoSQL e Object Data Modeling.
* **JWT (JSON Web Tokens):** Autenticazione stateless e protezione delle rotte.
* **Bcrypt:** Hashing sicuro delle password.

---

## ⚙️ Installazione e Configurazione

Assicurarsi di avere [Node.js](https://nodejs.org/) e l'accesso a un cluster [MongoDB](https://www.mongodb.com/) (locale o Atlas) installati.

### 1. Configurazione del Back-End
1. Aprire il terminale e navigare nella cartella del server:
   ```bash
   cd Backend

2. Eseguire il comando 
   ```bash
   npm run dev

### 2. Configurazione del Front-End 
1. Aprire un nuovo terminale e navigare nella cartella del front-end:
   ```bash
   cd Frontend
   cd quicksketch-frontend

2. Eseguire il comando:
   ```bash
   npm run dev

### 3. Configurazione ed esecuzione dei test PlayWright (E2E):
1. Assicurarsi di essere sempre nella cartella Frontend con il comando:
   ```bash
   cd Frontend
   cd quicksketch-frontend

2. Eseguire il comando:
   ```bash
    npx playwright test

