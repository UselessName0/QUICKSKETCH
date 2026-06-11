require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS: inizialmente senza process.env.CLIENT_URL per limitare al solo localhost di acccedere
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ 
    origin: clientUrl, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Limitatore JSON: Blocca i payload troppo pesanti (per evitare attacchi DoS)
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