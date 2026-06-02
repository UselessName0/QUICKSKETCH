const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// LOGICA DI REGISTRAZIONE
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: 'La password deve avere almeno 8 caratteri, una lettera maiuscola e un numero.' 
            });
        }
        // 1. Controllo se l'utente esiste già
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username già in uso.' });
        }

        // 2. Cripto la password prima di salvarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Salvo il nuovo utente nel database
        const newUser = new User({ 
            username, 
            password: hashedPassword 
        });
        await newUser.save();

        res.status(201).json({ message: 'Utente registrato con successo!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante la registrazione.' });
    }
};

// LOGICA DI LOGIN
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Cerco l'utente nel database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Credenziali non valide.' });
        }

        // 2. Controllo che la password coincida con quella criptata
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenziali non valide.' });
        }

        // 3. Genero il Token JWT valido per 1 ora
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // 4. Rispondo al frontend con il token e i dati dell'utente
        res.json({ 
            token, 
            user: { id: user._id, username: user.username } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante il login.' });
    }
};

// RECUPERA I DATI DELL'UTENTE LOGGATO (incluso il punteggio)
exports.getMe = async (req, res) => {
    try {
        // req.user.id arriva dal token. Troviamo l'utente ma escludiamo la password per sicurezza!
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero del profilo' });
    }
};