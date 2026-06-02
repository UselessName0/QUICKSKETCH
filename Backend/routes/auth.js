const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Quando ricevi una richiesta POST a /register, esegui la funzione register
router.post('/register', authController.register);

// Quando ricevi una richiesta POST a /login, esegui la funzione login
router.post('/login', authController.login);

// Rotta protetta per avere i dati del profilo
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;