const Sketch = require('../models/Sketch');
const Guess = require('../models/Guess');
const User = require('../models/User');

// Chiamata a WikiPedia
exports.getRandomWord = async (req, res) => {
    try {
        const categories = [
            'Categoria:Frutti',
            'Categoria:Strumenti_musicali',
            'Categoria:Animali_domestici',
            'Categoria:Capi_di_abbigliamento',
            'Categoria:Mobili',
            'Categoria:Utensili_da_cucina'
        ];

        // Scelta casuale
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        // Richiesta a Wikipedia per ottenere le voci della categoria scelta
        const url = `https://it.wikipedia.org/w/api.php?action=query&list=categorymembers&cmnamespace=0&cmtitle=${randomCategory}&cmlimit=50&format=json`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'QuickSketch/1.0 (studente@progetto.local)' 
            }
        });

        // Controllo di sicurezza se Wikipedia dà comunque errore
        if (!response.ok) {
            throw new Error(`Wikipedia ha risposto con codice HTTP: ${response.status}`);
        }

        const data = await response.json();
        const members = data.query?.categorymembers; 

        // Fallback di emergenza nel caso l'API non restituisca risultati validi
        if (!members || members.length === 0) {
            return res.json({ word: "Pizza" });
        }

        let word = members[Math.floor(Math.random() * members.length)].title;
        word = word.split('(')[0].trim();

        res.json({ word });
    } catch (error) {
        console.error("Errore API Wikipedia:", error);
        // Fallback di sicurezza per non bloccare mai il giocatore
        res.status(200).json({ word: "Albero" }); 
    }
};

exports.createSketch = async (req, res) => {
    try {
        const { word, imageData } = req.body;
        
        const newSketch = new Sketch({
            authorId: req.user.id,
            word,
            imageData
        });
        await newSketch.save();
        await User.findByIdAndUpdate(req.user.id, { $inc: { score: 5 } });

        res.status(201).json({ message: 'Sketch pubblicato! Hai guadagnato 5 punti.', sketch: newSketch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel salvataggio dello sketch' });
    }
};

// Logica dei tentativi
exports.guessSketch = async (req, res) => {
    try {
        const { sketchId } = req.params;
        const { guessedWord } = req.body;
        const userId = req.user.id;

        const sketch = await Sketch.findById(sketchId);
        if (!sketch) return res.status(404).json({ message: 'Sketch non trovato' });

        if (sketch.authorId.toString() === userId) {
            return res.status(400).json({ message: 'Non puoi indovinare il tuo stesso disegno.' });
        }

        let guessRecord = await Guess.findOne({ userId, sketchId });
        if (!guessRecord) {
            guessRecord = new Guess({ userId, sketchId });
        }

        if (guessRecord.hasWon) return res.status(400).json({ message: 'Hai già indovinato questa parola!' });
        if (guessRecord.attemptsCount >= 10) return res.status(400).json({ message: 'Hai esaurito i tentativi.', solution: sketch.word });

        guessRecord.attemptsCount += 1;
        const isCorrect = guessedWord.trim().toLowerCase() === sketch.word.trim().toLowerCase();

        if (isCorrect) {
            guessRecord.hasWon = true;
            await guessRecord.save();
            
            // Calcolo dei punti
            const pointsEarned = 11 - guessRecord.attemptsCount;
            await User.findByIdAndUpdate(userId, { $inc: { score: pointsEarned } });

            return res.json({ 
                message: `Complimenti! Hai indovinato in ${guessRecord.attemptsCount} tentativi e vinto ${pointsEarned} punti!`, 
                attempts: guessRecord.attemptsCount,
                points: pointsEarned
            });
        } else {
            await guessRecord.save();
            
            if (guessRecord.attemptsCount >= 10) {
                return res.json({ message: 'Hai perso!', solution: sketch.word, attempts: 10 });
            }

            // Aiuto fornito dopo 5 tentativi falliti
            let hint = null;
            if (guessRecord.attemptsCount >= 5) {
                const wordString = sketch.word.trim();
                const firstLetter = wordString[0];
                const lastLetter = wordString[wordString.length - 1];
                hint = `Inizia con ${firstLetter.toUpperCase()}, finisce con ${lastLetter.toUpperCase()} ed è lunga ${wordString.length} lettere.`;
            }

            return res.json({ 
                message: 'Parola errata.', 
                attempts: guessRecord.attemptsCount,
                hint: hint 
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante il tentativo' });
    }
};

// Feed degli sketch
exports.getSketchesFeed = async (req, res) => {
    try {
        const userId = req.user.id;

        // Trova gli ID degli sketch in cui l'utente ha già vinto O ha finito i 10 tentativi
        const finishedGuesses = await Guess.find({
            userId,
            $or: [{ hasWon: true }, { attemptsCount: { $gte: 10 } }]
        }).select('sketchId');
        
        // Estrazione di un array di ID di sketch da escludere
        const finishedSketchIds = finishedGuesses.map(g => g.sketchId);

        // Richiesta al DB di tutti gli sketch non creati dall'utente e non ancora indovinati
        const sketches = await Sketch.find({
            authorId: { $ne: userId },
            _id: { $nin: finishedSketchIds }
        })
        .select('-word')
        .sort({ createdAt: -1 }); 

        res.json(sketches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero degli sketch' });
    }
};

// Recupero di uno sketch per ogni singolo giocare
exports.getSketchById = async (req, res) => {
    try {
        const sketch = await Sketch.findById(req.params.sketchId).select('-word');
        if (!sketch) return res.status(404).json({ message: 'Sketch non trovato' });
        res.json(sketch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero dello sketch' });
    }
};

// Recupero di tutti i disegni creati dall'utente
exports.getMySketches = async (req, res) => {
    try {
        const sketches = await Sketch.find({ authorId: req.user.id }).sort({ createdAt: -1 });
        res.json(sketches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero dei tuoi sketch' });
    }
};

// Recupero degli scketch indovinati dall'utente
exports.getGuessedSketches = async (req, res) => {
    try {
        const userId = req.user.id;
        const guesses = await Guess.find({ userId, hasWon: true }).populate('sketchId');
        const sketches = guesses.map(g => g.sketchId).filter(s => s !== null);
        
        res.json(sketches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero degli sketch indovinati' });
    }
};