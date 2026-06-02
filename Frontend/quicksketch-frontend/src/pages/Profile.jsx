import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const { token } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [mySketches, setMySketches] = useState([]);
  const [guessedSketches, setGuessedSketches] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndSketches = async () => {
      try {
        const [profileRes, sketchesRes, guessedRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/game/my-sketches', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/game/guessed-sketches', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        setProfileData(profileRes.data);
        setMySketches(sketchesRes.data);
        setGuessedSketches(guessedRes.data);
      } catch (error) {
        console.error("Errore nel caricamento del profilo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndSketches();
  }, [token]);

  if (loading) return <div className="text-center mt-20 text-xl font-bold animate-pulse text-purple-600">Caricamento profilo...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-20">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-16 border border-gray-100">
        <div className="bg-linear-to-r from-purple-500 to-pink-500 h-32"></div>
        <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-16 gap-6">
          <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
            <div className="w-full h-full bg-linear-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-5xl text-white font-black">
              {profileData?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="text-center sm:text-left grow">
            <h1 className="text-4xl font-black text-gray-800">{profileData?.username}</h1>
            <p className="text-gray-500 font-medium mt-1">Membro dal: {new Date(profileData?.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="bg-linear-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 px-8 py-4 rounded-2xl shadow-sm text-center">
            <p className="text-yellow-800 font-bold text-sm uppercase tracking-widest">Punteggio Totale</p>
            <p className="text-5xl font-black text-yellow-600">{profileData?.score} <span className="text-2xl">pt</span></p>
          </div>
        </div>
      </div>
      <div className="mb-16"> 
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          La tua Galleria ({mySketches.length})
        </h2>
        {mySketches.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm text-center text-gray-500 border border-gray-100">
            Non hai ancora creato nessun capolavoro. Vai subito a disegnare!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mySketches.map((sketch) => (
              <div key={sketch._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow relative group">
                <div className="bg-gray-50 p-2 border-b border-gray-100">
                  <img src={sketch.imageData} alt="sketch" className="w-full h-48 object-contain" />
                </div>
                <div className="absolute inset-0 bg-blue-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 text-center backdrop-blur-sm cursor-pointer">
                  <div>
                    <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2">Parola Segreta</p>
                    <p className="text-2xl font-black">{sketch.word}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          Ciò che hai indovinato! ({guessedSketches.length})
        </h2>
        
        {guessedSketches.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm text-center text-gray-500 border border-gray-100">
            Non hai ancora indovinato nessun disegno. Torna in bacheca e mettiti alla prova!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {guessedSketches.map((sketch) => (
              <div key={sketch._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow relative group">
                <div className="bg-gray-50 p-2 border-b border-gray-100">
                  <img src={sketch.imageData} alt="sketch" className="w-full h-48 object-contain" />
                </div>
                <div className="absolute inset-0 bg-green-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 text-center backdrop-blur-sm cursor-pointer">
                  <div>
                    <p className="text-sm font-bold text-green-200 uppercase tracking-widest mb-2">Hai indovinato!</p>
                    <p className="text-2xl font-black">{sketch.word}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}