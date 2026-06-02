import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NavbarLogo = () => (
  <div className="flex items-center gap-3">
    <img 
      src="/favicon-removebg-preview.png" 
      alt="QuickSketch Logo" 
      className="h-10 w-auto drop-shadow-md" 
    />
    <span 
      className="text-3xl font-extrabold text-white tracking-wide"
      style={{ fontFamily: "'Poppins', sans-serif, system-ui" }}
    >
      QuickSketch
    </span>
  </div>
);

export default function Navbar() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [hasNotification, setHasNotification] = useState(false);

  useEffect(() => {
    if (location.pathname === '/profile') {
      localStorage.removeItem('hasNewActivity');
      setHasNotification(false);
    } else {
      const status = localStorage.getItem('hasNewActivity');
      setHasNotification(status === 'true');
    }
  }, [location.pathname]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <Link to="/" className="hover:scale-105 transition-transform origin-left">
          <NavbarLogo />
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">

          <Link 
            to="/" 
            className="border-2 border-white/60 hover:border-white text-white px-5 py-2 rounded-xl font-bold transition-all hover:bg-white/10"
          >
            Bacheca
          </Link>

          <Link 
            to="/create" 
            className="bg-green-500 hover:bg-green-400 text-white px-6 py-2.5 rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all transform"
          >
            + Nuovo
          </Link>

          <Link 
            to="/profile" 
            className="hover:scale-105 transition-transform flex items-center gap-2 ml-2"
            title="Vai al profilo"
          >
            <div className={`relative w-10 h-10 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center font-black border-2 border-white shadow-md text-lg ${hasNotification ? 'ring-4 ring-green-400/50' : ''}`}>
              {user?.username?.charAt(0).toUpperCase()}
              
              {hasNotification && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-white"></span>
                </span>
              )}
            </div>
            
            <span className="font-bold hidden md:block">{user?.username}</span>
          </Link>

          {location.pathname === '/profile' && (
            <button 
              onClick={handleLogout} 
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-bold transition-all shadow hover:shadow-lg ml-2"
            >
              Logout
            </button>
          )}
          
        </div>
      </div>
    </nav>
  );
}