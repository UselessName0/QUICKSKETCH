import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const verifyUser = async () => {
            if (token) {
                localStorage.setItem('token', token);
                if (!user) {
                    try {
                        const res = await axios.get('http://localhost:5000/api/auth/me', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setUser(res.data);
                    } catch (error) {
                        console.error("Token scaduto o non valido.");
                        setToken(null);
                        localStorage.removeItem('token');
                    }
                }
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false); 
        };

        verifyUser();
    }, [token]);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold text-2xl">Autenticazione in corso...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};