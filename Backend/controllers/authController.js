const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrazione
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: 'La password deve avere almeno 8 caratteri, una lettera maiuscola e un numero.' 
            });
        }
        // Controllo di esistenza utente
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username già in uso.' });
        }

        // Cifratura password 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Salvataggio utente nel database
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

// Login 
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Ricerca utente nel database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Credenziali non valide.' });
        }

        // Confronto password con quella cifrata
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenziali non valide.' });
        }

        // Generazione token JWT
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // Invio al frontend token e username
        res.json({ 
            token, 
            user: { id: user._id, username: user.username } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante il login.' });
    }
};

// Reupero profilo utente con end-point protetto
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero del profilo' });
    }
};