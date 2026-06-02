import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function PlayGame() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sketch, setSketch] = useState(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hint, setHint] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const fetchSketch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/game/sketches/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSketch(res.data);
      } catch (error) {
        console.error("Errore", error);
        alert('Impossibile caricare il disegno.');
        navigate('/');
      }
    };
    fetchSketch();
  }, [id, token, navigate]);

  const handleGuess = async (e) => {
    e.preventDefault();
    if (!guess.trim() || isGameOver) return;

    try {
      const res = await axios.post(`http://localhost:5000/api/game/sketches/${id}/guess`, 
        { guessedWord: guess },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { message, attempts, points, hint: newHint, solution } = res.data;

      setFeedback({ text: message, attempts });
      
      if (newHint) setHint(newHint);
      setGuess('');
      
      if (points) {
        localStorage.setItem('hasNewActivity', 'true');
        setIsGameOver(true);
      }

      if (solution) {
        setIsGameOver(true);
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Errore durante il tentativo";
      alert(errorMsg);
      
      if (errorMsg.includes('già indovinato') || errorMsg.includes('esaurito')) {
        setIsGameOver(true);
      }
    }
  };

  if (!sketch) return <div className="text-center mt-20 text-xl font-bold animate-pulse text-blue-600">Caricamento disegno...</div>;

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto min-h-screen pb-20">
      <div className="w-full flex justify-between items-center mb-8 mt-4">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Indovina lo Sketch!</h1>
        <button 
          onClick={() => navigate('/')} 
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition-colors border border-gray-200"
        >
          ← Torna alla Bacheca
        </button>
      </div>

      <div className="w-full bg-white p-2 md:p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-10">

        <div className="md:w-1/2 flex justify-center items-center bg-gray-50 rounded-4x1 border-2 border-dashed border-gray-200 p-4 min-h-87.5">
          <img 
            src={sketch.imageData} 
            alt="Disegno da indovinare" 
            className="max-w-full h-auto object-contain rounded-lg drop-shadow-xl" 
          />
        </div>

        <div className="md:w-1/2 flex flex-col justify-center px-4">
          
          {!isGameOver ? (
            <form onSubmit={handleGuess} className="space-y-6">
              <div>
                <label className="block text-gray-500 font-bold mb-3 uppercase text-xs tracking-widest">La tua risposta</label>
                <input 
                  type="text" 
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Scrivi qui..."
                  className="w-full px-6 py-4 text-xl border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 active:translate-y-0"
              >
                Invia Tentativo
              </button>
            </form>
          ) : (
            <div className="text-center p-8 bg-blue-50 rounded-3xl border border-blue-100 shadow-inner">
              <h3 className="text-3xl font-black text-blue-900 mb-2">Gioco Terminato</h3>
              <p className="text-blue-700 mb-6 font-medium">Hai completato questa sfida!</p>
              <button 
                onClick={() => navigate('/')} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg"
              >
                Scegli un altro Sketch
              </button>
            </div>
          )}
          <div className="mt-8 space-y-4">
            {feedback && (
              <div className={`p-5 rounded-2xl text-center font-black text-lg border-2 shadow-sm animate-in fade-in slide-in-from-bottom-2 ${
                isGameOver && feedback.text.includes('Complimenti') ? 'bg-green-50 text-green-700 border-green-200' : 
                isGameOver ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}>
                {feedback.text}
                {!isGameOver && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden max-w-37.5">
                        <div className="bg-orange-400 h-full transition-all" style={{width: `${feedback.attempts * 10}%`}}></div>
                    </div>
                    <span className="text-xs opacity-70">Tentativo {feedback.attempts}/10</span>
                  </div>
                )}
              </div>
            )}

            {hint && !isGameOver && (
              <div className="p-5 bg-yellow-400/10 rounded-2xl border-2 border-yellow-400/20 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform text-4xl">💡</div>
                <p className="text-xs font-black text-yellow-700 uppercase tracking-widest mb-1">Suggerimento:</p>
                <p className="text-yellow-900 font-bold text-lg">{hint}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}