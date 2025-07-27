import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, User, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'dashboard' | 'roadmaps' | 'practice';
  onTabChange: (tab: 'dashboard' | 'roadmaps' | 'practice') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-nexus-surface/80 backdrop-blur-md border-b border-nexus-accent/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-nexus-accent/20 rounded-lg">
              <Rocket className="w-6 h-6 text-nexus-accent" />
            </div>
            <span className="text-2xl font-bold text-nexus-accent glow-text">
              Nexus
            </span>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center space-x-2">
            {(['dashboard', 'roadmaps', 'practice'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`nav-pill px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-nexus-accent text-nexus-dark shadow-lg shadow-nexus-accent/30'
                    : 'text-gray-300 hover:text-nexus-accent hover:bg-nexus-accent/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Dinamik Profile Avatar */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)} // Blur event'i ile menüyü kapat
                  className="w-12 h-12 rounded-full bg-nexus-accent/20 flex items-center justify-center animate-pulse-glow border-2 border-transparent hover:border-nexus-accent transition-colors"
                >
                  <span className="text-xl font-bold text-nexus-accent">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute top-14 right-0 w-56 bg-nexus-surface rounded-lg shadow-2xl border border-gray-700 py-2 animate-fade-in-fast z-10">
                    <div className="px-4 py-2 border-b border-gray-600">
                      <p className="text-sm text-gray-400">Signed in as</p>
                      <p className="font-semibold text-white truncate">{user.username}</p>
                    </div>
                    <ul className="py-1">
                      <li>
                        <Link
                          to="/profile"
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-nexus-accent/20 hover:text-nexus-accent transition-colors"
                          onClick={() => setIsMenuOpen(false)} // Menüyü kapat
                        >
                          <UserCog className="w-4 h-4 mr-3" />
                          Profile
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={logout}
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-nexus-accent/20 hover:text-nexus-accent transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              // Kullanıcı giriş yapmamışsa gösterilecek yer tutucu
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;