const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Rotta protetta per avere i dati del profilo
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;