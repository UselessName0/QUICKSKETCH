const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ 
            message: 'Accesso negato. Nessun token fornito.' 
        });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Formato token non valido.'
        });
    }

    const token = authHeader.split(' ')[1];
};