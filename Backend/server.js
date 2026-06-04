require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS: limitiamo solo al frontend in sviluppo di accedere alle API
app.use(cors({ 
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Permettendo la possibilità di inviare i cookie qualora fosse necessario (per le sessioni ad esempio) 
}));

// Limitatore JSON: Blocca i payload troppo pesanti
// Previene attacchi DoS
app.use(express.json({ limit: '2mb' })); 

// Rotte
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const gameRoutes = require('./routes/game');
app.use('/api/game', gameRoutes);

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