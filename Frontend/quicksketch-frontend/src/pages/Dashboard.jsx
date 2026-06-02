import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const { logout, token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [sketches, setSketches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSketches = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/game/sketches', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSketches(res.data);
      } catch (error) {
        console.error("Errore nel caricamento degli sketch:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSketches();
    }
  }, [token]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Bacheca Sketch</h1>
          <p className="text-gray-500 mt-1">Ciao {user?.username}! Scegli un disegno e prova a indovinare.</p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center text-xl text-gray-500 py-10 font-bold animate-pulse">
          Caricamento disegni in corso...
        </div>
      ) : sketches.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
          <p className="text-gray-500 text-xl mb-4">Nessun nuovo disegno da indovinare al momento.</p>
          <p className="text-gray-400">Aspetta che altri utenti pubblichino qualcosa o crea tu un nuovo sketch!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sketches.map((sketch) => (
            <div key={sketch._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 flex flex-col">
              <div className="bg-gray-50 border-b border-gray-100 p-2">
                <img 
                  src={sketch.imageData} 
                  alt="Sketch" 
                  className="w-full h-48 object-contain"
                />
              </div>
              <div className="p-5 flex flex-col grow justify-between gap-4">
                <p className="text-sm text-gray-400">
                  Pubblicato il: {new Date(sketch.createdAt).toLocaleDateString()}
                </p>
                <button 
                  onClick={() => navigate(`/play/${sketch._id}`)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Gioca
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}