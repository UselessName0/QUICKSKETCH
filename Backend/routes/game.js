const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteggiamo TUTTE le rotte di questo file imponendo l'uso dell'authMiddleware
router.use(authMiddleware);

// GET /api/game/random-word -> Ottiene la parola da Wikipedia
router.get('/random-word', gameController.getRandomWord);

// POST /api/game/sketches -> Pubblica un nuovo sketch
router.post('/sketches', gameController.createSketch);

// POST /api/game/sketches/:sketchId/guess -> Tenta di indovinare
router.post('/sketches/:sketchId/guess', gameController.guessSketch);

// GET /api/game/sketches -> Ottiene il feed dei disegni da indovinare
router.get('/sketches', gameController.getSketchesFeed);

// GET /api/game/my-sketches -> Ottiene i disegni creati dall'utente loggato
router.get('/my-sketches', gameController.getMySketches);

// GET /api/game/sketches/:sketchId -> Ottiene un singolo disegno
router.get('/sketches/:sketchId', gameController.getSketchById);

// GET /api/game/guessed-sketches -> Ottiene gli sketch già indovinati o finiti dall'utente
router.get('/guessed-sketches', gameController.getGuessedSketches);

module.exports = router;