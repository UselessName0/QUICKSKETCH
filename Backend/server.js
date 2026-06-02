require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// MIDDLEWARES 

// 1. CORS: Permettiamo solo al nostro frontend React di comunicare con questo server.
// Evita che siti esterni non autorizzati facciano richieste alla tua API.
app.use(cors({ 
    origin: 'http://localhost:5173', // L'indirizzo del tuo frontend in sviluppo
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Opzionale: restringe i metodi consentiti
    credentials: true // Opzionale: utile se in futuro userai i cookie
}));

// 2. LIMITATORE JSON: Blocca i payload troppo pesanti.
// Dato che riceviamo immagini Base64, impostiamo un limite di 2MB. 
// Previene attacchi DoS in cui un utente maligno invia un file enorme per far crashare il server.
app.use(express.json({ limit: '2mb' })); 

// --------------------------------------------------

// Rotte
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const gameRoutes = require('./routes/game');
app.use('/api/game', gameRoutes);

// Rotta di test
app.get('/api/test', (req, res) => {
    res.json({ message: 'Il server di QUICKSKETCH è vivo e funzionante!' });
});

// Connessione al Database e avvio server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connesso a MongoDB con successo!');
        app.listen(PORT, () => {
            console.log(`Server in ascolto sulla porta ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Errore di connessione a MongoDB:', error);
    });