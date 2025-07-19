import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Roadmaps from './components/Roadmaps';
import Practice from './components/Practice';
import Starfield from './components/Starfield';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'roadmaps' | 'practice'>('dashboard');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'roadmaps':
        return <Roadmaps />;
      case 'practice':
        return <Practice />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark font-inter">
      <Starfield />
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        {renderActiveComponent()}
      </main>
    </div>
  );
}

export default App;