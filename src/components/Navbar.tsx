import React from 'react';
import { Rocket, User } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'roadmaps' | 'practice';
  onTabChange: (tab: 'dashboard' | 'roadmaps' | 'practice') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
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

          {/* Profile Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-nexus-accent/20 flex items-center justify-center animate-pulse-glow">
              <User className="w-6 h-6 text-nexus-accent" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-nexus-accent rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;