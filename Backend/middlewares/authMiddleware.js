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

    try {
        const clear_token = jwt.verify(token, process.env.JWT_SECRET);
        req.user = clear_token;
        next();
    } catch (error) {
        return res.status(403).json({
            message: 'Token non valido o scaduto.'
        });
    }
};