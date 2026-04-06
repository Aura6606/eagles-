import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Car, LogOut, User as UserIcon, Menu, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, login, loginWithRedirect, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const handleLogin = async () => {
    await login();
  };

  const handleLoginRedirect = async () => {
    await loginWithRedirect();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Car className="text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">Salama<span className="text-green-500">Ride</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`hover:text-green-500 transition-colors ${pathname === '/' ? 'text-green-500' : ''}`}>Home</Link>
            {user ? (
              <>
                <Link to="/booking" className={`hover:text-green-500 transition-colors ${pathname === '/booking' ? 'text-green-500' : ''}`}>Book a Ride</Link>
                <Link to="/history" className={`hover:text-green-500 transition-colors ${pathname === '/history' ? 'text-green-500' : ''}`}>History</Link>
                {profile?.isAdmin && (
                  <Link to="/admin" className={`flex items-center space-x-1 text-green-500 hover:text-green-400 transition-colors ${pathname === '/admin' ? 'text-green-400' : ''}`}>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/10">
                  <Link to="/profile" className={`flex items-center space-x-2 hover:text-green-500 transition-colors ${pathname === '/profile' ? 'text-green-500' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {user.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium">{profile?.name?.split(' ')[0] || ''}</span>
                  </Link>
                  <button onClick={handleLogout} className="p-2 hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleLogin}
                  className="bg-green-500 text-black px-6 py-2 rounded-full font-semibold hover:bg-green-400 transition-all active:scale-95"
                >
                  Login
                </button>
                <button 
                  onClick={handleLoginRedirect}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                  title="Use redirect if popup is blocked"
                >
                  (Redirect)
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-900 border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-white/5">Home</Link>
              {user ? (
                <>
                  <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-white/5">Book a Ride</Link>
                  <Link to="/history" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-white/5">History</Link>
                  {profile?.isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-green-500 hover:bg-white/5">Admin Dashboard</Link>
                  )}
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-white/5">Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-red-500 hover:bg-white/5">Logout</button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <button onClick={handleLogin} className="w-full bg-green-500 text-black px-3 py-2 rounded-md font-semibold">Login with Popup</button>
                  <button onClick={handleLoginRedirect} className="w-full bg-zinc-800 text-white px-3 py-2 rounded-md font-semibold text-sm">Login with Redirect (Mobile)</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
