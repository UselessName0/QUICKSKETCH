const Sketch = require('../models/Sketch');
const Guess = require('../models/Guess');
const User = require('../models/User');

// 1. CHIAMATA A WIKIPEDIA
exports.getRandomWord = async (req, res) => {
    try {
        // 1. Definiamo categorie di Wikipedia che contengono solo oggetti fisici/reali
        const categories = [
            'Categoria:Frutti',
            'Categoria:Strumenti_musicali',
            'Categoria:Animali_domestici',
            'Categoria:Capi_di_abbigliamento',
            'Categoria:Mobili',
            'Categoria:Utensili_da_cucina'
        ];

        // 2. Ne scegliamo una a caso
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        // 3. Chiediamo a Wikipedia i primi 50 elementi di quella specifica categoria
        const url = `https://it.wikipedia.org/w/api.php?action=query&list=categorymembers&cmnamespace=0&cmtitle=${randomCategory}&cmlimit=50&format=json`;
        
        // ---> LA CORREZIONE È QUI SOTTO: ABBIAMO AGGIUNTO GLI HEADERS CON L'USER-AGENT <---
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // Wikipedia esige sapere "chi sei". Mettiamo il nome della tua app!
                'User-Agent': 'QuickSketch/1.0 (studente@progetto.local)' 
            }
        });

        // Controllo di sicurezza se Wikipedia dà comunque errore
        if (!response.ok) {
            throw new Error(`Wikipedia ha risposto con codice HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // Il ? è un "optional chaining", evita che l'app crashi se data.query non esiste
        const members = data.query?.categorymembers; 

        // Fallback di emergenza nel caso l'API non restituisca risultati validi
        if (!members || members.length === 0) {
            return res.json({ word: "Pizza" });
        }

        // 4. Peschiamo una voce a caso dall'elenco
        let word = members[Math.floor(Math.random() * members.length)].title;

        // 5. Trucco magico: eliminiamo le parentesi e teniamo solo la parola pulita!
        word = word.split('(')[0].trim();

        res.json({ word });
    } catch (error) {
        console.error("Errore API Wikipedia:", error);
        // Fallback di sicurezza per non bloccare mai il giocatore
        // (Ho messo status 200 altrimenti il tuo frontend potrebbe dare errore invece di usare "Albero")
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

        // ---> NOVITÀ: Diamo 5 punti all'autore per aver creato uno sketch
        await User.findByIdAndUpdate(req.user.id, { $inc: { score: 5 } });

        res.status(201).json({ message: 'Sketch pubblicato! Hai guadagnato 5 punti.', sketch: newSketch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel salvataggio dello sketch' });
    }
};

// 3. LOGICA DEI TENTATIVI
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

            // Se l'utente arriva a 5 tentativi, gli diamo una mano
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
                hint: hint // Se è null il frontend non lo mostrerà, se contiene testo lo mostrerà
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante il tentativo' });
    }
};

// 4. FEED INTELLIGENTE DEGLI SKETCH
exports.getSketchesFeed = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Trova gli ID degli sketch in cui l'utente ha già vinto O ha finito i 10 tentativi
        const finishedGuesses = await Guess.find({
            userId,
            $or: [{ hasWon: true }, { attemptsCount: { $gte: 10 } }]
        }).select('sketchId');
        
        // Estraiamo solo un array di ID
        const finishedSketchIds = finishedGuesses.map(g => g.sketchId);

        // 2. Chiediamo a MongoDB tutti gli sketch NON creati dall'utente e NON presenti in finishedSketchIds
        const sketches = await Sketch.find({
            authorId: { $ne: userId },
            _id: { $nin: finishedSketchIds }
        })
        .select('-word') // IMPORTANTISSIMO: nascondiamo la parola segreta per evitare che barino guardando il codice!
        .sort({ createdAt: -1 }); // Mostra i più recenti per primi

        res.json(sketches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero degli sketch' });
    }
};

// 5. RECUPERA UN SINGOLO SKETCH PER GIOCARE
exports.getSketchById = async (req, res) => {
    try {
        const sketch = await Sketch.findById(req.params.sketchId).select('-word'); // Nascondiamo sempre la parola!
        if (!sketch) return res.status(404).json({ message: 'Sketch non trovato' });
        res.json(sketch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero dello sketch' });
    }
};

// 6. RECUPERA TUTTI I DISEGNI CREATI DALL'UTENTE
exports.getMySketches = async (req, res) => {
    try {
        const sketches = await Sketch.find({ authorId: req.user.id }).sort({ createdAt: -1 });
        res.json(sketches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero dei tuoi sketch' });
    }
};

// 7. RECUPERA GLI SKETCH INDOVINATI DALL'UTENTE
exports.getGuessedSketches = async (req, res) => {
    try {
        const userId = req.user.id;
        // Cerchiamo i record "Guess" dove l'utente ha vinto
        const guesses = await Guess.find({ userId, hasWon: true }).populate('sketchId');
        
        // Estraiamo solo i dati dello sketch (filtrando eventuali sketch eliminati)
        const sketches = guesses.map(g => g.sketchId).filter(s => s !== null);
        
        res.json(sketches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero degli sketch indovinati' });
    }
};