const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Cerca il token nell'intestazione della richiesta
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(401).json({ message: 'Accesso negato. Nessun token fornito.' });
    }

    try {
        // Verifica il token (rimuovendo la parola "Bearer " che di solito lo precede)
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        
        // Aggiunge i dati dell'utente (es. l'ID) alla richiesta, così i controller successivi sapranno chi è
        req.user = verified;
        next(); // Fa passare l'utente alla rotta richiesta
    } catch (error) {
        res.status(400).json({ message: 'Token non valido.' });
    }
};