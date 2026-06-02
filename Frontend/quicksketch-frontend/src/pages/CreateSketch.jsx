import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import * as fabric from 'fabric';

export default function CreateSketch() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const [word, setWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (isPlaying && !fabricRef.current && canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth > 600 ? 500 : 320,
        height: 400,
        backgroundColor: '#ffffff'
      });
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 4;
      canvas.freeDrawingBrush.color = '#000000';
      fabricRef.current = canvas;
    }
  }, [isPlaying]);

  const startGame = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/game/random-word', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWord(res.data.word);
      setTimeLeft(30);
      setIsFinished(false);
      setIsPlaying(true); 
      setIsPaused(false); 
      
      if (fabricRef.current) {
        fabricRef.current.clear();
        fabricRef.current.backgroundColor = '#ffffff';
        fabricRef.current.isDrawingMode = true;
      }
    } catch (error) {
      alert('Errore di connessione al server.');
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying && !isPaused && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      finishEarly();
    }
    return () => clearInterval(timer);
  }, [isPlaying, isPaused, timeLeft]);

  const finishEarly = () => {
    setIsPlaying(false);
    setIsFinished(true);
    if (fabricRef.current) fabricRef.current.isDrawingMode = false;
  };

  const publishSketch = async () => {
    if (!fabricRef.current) return;
    const imageData = fabricRef.current.toDataURL({ format: 'png' });
    try {
      await axios.post('http://localhost:5000/api/game/sketches', 
        { word, imageData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem('hasNewActivity', 'true');

      alert('Sketch pubblicato!');
      navigate('/'); 
    } catch (error) {
      alert('Errore durante la pubblicazione.');
    }
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen pb-20">

      {!isPlaying && !isFinished ? (
        <div className="flex flex-col items-center mt-10">
            <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 text-center mb-8 max-w-sm">
                <p className="text-blue-800 font-medium">Pronto per la sfida? Ti darò una parola e avrai 30 secondi per disegnarla!</p>
            </div>
            <button onClick={startGame} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95">
            Inizia a disegnare!
            </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-lg">
          
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-8 w-full text-center relative">
            
            <p className="text-sm text-gray-400 uppercase font-bold tracking-widest mb-4">
              Cosa devi disegnare:
            </p>
            
            <div className="flex flex-col items-center justify-center">
              <a 
                href={`https://it.wikipedia.org/wiki/${word}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-4xl font-black text-blue-600 hover:text-indigo-600 transition-colors flex items-center justify-center gap-3"
              >
                {word} 
                <span className="text-3xl">🔗</span>
              </a>
            </div>

            <div className="flex flex-row items-center justify-center gap-3 mt-8">
              
              <div className={`flex items-center justify-center gap-2 py-2 px-6 rounded-full text-xl font-black italic shadow-inner ${isPaused ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                 <span className={isPaused ? '' : 'animate-pulse'}>
                   {isPaused ? '⏸️' : '⏱️'}
                 </span> 
                 {isPaused ? 'In pausa' : `${timeLeft}s`}
              </div>

              {isPlaying && (
                <button 
                  onClick={startGame}
                  className="text-sm font-bold text-gray-700 hover:text-blue-700 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-5 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm active:scale-95"
                  title="Non ti piace? Cambiala! Il timer e il disegno si resetteranno."
                >
                  <span className="text-lg">🔄</span>
                  <span className="hidden sm:block">Cambia Parola</span>
                </button>
              )}
              
            </div>
          </div>

          <div className="border-4 border-white rounded-3xl bg-white shadow-2xl overflow-hidden touch-none">
            <canvas ref={canvasRef} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full px-4">
            {isPlaying && (
              <button 
                onClick={finishEarly} 
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all"
              >
                Ho finito!
              </button>
            )}

            {isFinished && (
              <button 
                onClick={publishSketch} 
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg animate-bounce"
              >
                Pubblica ora!
              </button>
            )}

            <button 
              onClick={() => navigate('/')} 
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-2xl transition-all"
            >
              ❌ Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}