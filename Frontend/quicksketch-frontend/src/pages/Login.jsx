import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AnimatedLogo = () => (
  <div className="flex items-center justify-center gap-4 mb-8">
    <style>
      {`
        .pencil-animation {
          animation: pencil-bounce 1.5s ease-in-out infinite alternate;
        }
        
        .text-fade-in {
          opacity: 0;
          transform: translateY(10px);
          animation: login-text-reveal 0.8s ease-out 0.3s forwards;
        }

        @keyframes pencil-bounce {
          from { transform: translateY(0) rotate(0deg); }
          to { transform: translateY(-10px) rotate(5deg); }
        }

        @keyframes login-text-reveal {
          to { opacity: 1; transform: translateY(0); }
        }
      `}
    </style>

    <img 
      src="/favicon-removebg-preview.png" 
      alt="QuickSketch Logo" 
      className="h-20 w-auto pencil-animation drop-shadow-xl" 
    />

    <span 
      className="text-5xl font-black text-gray-800 text-fade-in tracking-tight"
      style={{ fontFamily: "'Poppins', sans-serif, system-ui" }}
    >
      QuickSketch
    </span>
  </div>
);

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' }); 

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setMessage({ type: '', text: '' });

    if (isRegistering) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        setMessage({ 
          type: 'error', 
          text: 'La password deve avere almeno 8 caratteri, una lettera maiuscola e un numero.' 
        });
        return; 
      }
    }

    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        username,
        password
      });

      if (isRegistering) {
        setMessage({ type: 'success', text: 'Registrazione completata! Ora puoi fare il login.' });
        setIsRegistering(false);
        setPassword(''); 
      } else {
        login(response.data.token, response.data.user);
        navigate('/'); 
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Si è verificato un errore di connessione.' 
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        
        <AnimatedLogo />

        <p className="text-center text-gray-500 mb-8 font-medium">
          {isRegistering ? 'Crea un nuovo account' : 'Accedi per giocare'}
        </p>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 pl-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 pl-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
            {isRegistering && (
              <p className="text-xs text-gray-500 mt-2 pl-1 font-medium">
                Minimo 8 caratteri, 1 maiuscola, 1 numero.
              </p>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {isRegistering ? 'Registrati' : 'Accedi'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          {isRegistering ? 'Hai già un account? ' : 'Non hai un account? '}
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMessage({ type: '', text: '' });
            }} 
            className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
          >
            {isRegistering ? 'Accedi qui' : 'Registrati ora'}
          </button>
        </div>  
      </div>
    </div>
  );
}