import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Creiamo il contesto
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true); // Nuovo stato: mettiamo l'app in pausa finché non verifichiamo chi sei

    useEffect(() => {
        const verifyUser = async () => {
            if (token) {
                localStorage.setItem('token', token);
                // Se c'è un token ma non abbiamo i dati dell'utente (es. dopo un refresh della pagina)
                if (!user) {
                    try {
                        const res = await axios.get('http://localhost:5000/api/auth/me', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setUser(res.data);
                    } catch (error) {
                        console.error("Token scaduto o non valido.");
                        // Se il token è finto o scaduto, buttiamo l'utente fuori per sicurezza!
                        setToken(null);
                        localStorage.removeItem('token');
                    }
                }
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false); // Finito il controllo, avviamo l'app
        };

        verifyUser();
    }, [token, user]);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    // Schermata di caricamento invisibile per evitare sfarfallii durante il controllo di sicurezza
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold text-2xl">Autenticazione in corso...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};