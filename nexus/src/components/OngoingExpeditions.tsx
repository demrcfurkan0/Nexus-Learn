import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { Brain, Code, Atom, Palette, Database, Cpu, X } from 'lucide-react';
import { RoadmapData } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';


type RoadmapResponse = RoadmapData & { _id?: string };

// Bileşenin alabileceği prop'ları tanımlıyoruz
interface OngoingExpeditionsProps {
  showTitle?: boolean; // Bu prop başlığın gösterilip gösterilmeyeceğini kontrol eder
}

const OngoingExpeditions: React.FC<OngoingExpeditionsProps> = ({ showTitle = true }) => {
  const [expeditions, setExpeditions] = useState<RoadmapData[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchOngoingRoadmaps = async () => {
      if (!user) {
        setExpeditions([]);
        return;
      }
      try {
        const response = await apiClient.get<RoadmapResponse[]>('/api/roadmaps/ongoing');
        const transformedData = response.data.map(roadmap => ({
          ...roadmap,
          id: roadmap.id || roadmap._id || '', 
        }));
        setExpeditions(transformedData);
      } catch (error) {
        console.error("Failed to fetch ongoing expeditions:", error);
        toast.error("Could not load your ongoing expeditions.");
      }
    };
    fetchOngoingRoadmaps();
  }, [user]);

  const handleDelete = async (roadmapId: string, roadmapTitle: string) => {
    // Kullanıcıdan onay al
    if (window.confirm(`Are you sure you want to delete the "${roadmapTitle}" expedition? This action cannot be undone.`)) {
      try {
        // Backend'e silme isteği gönder
        await apiClient.delete(`/api/roadmaps/${roadmapId}`);
        // Arayüzü anında güncelle
        setExpeditions(prevExpeditions => prevExpeditions.filter(exp => exp.id !== roadmapId));
        toast.success(`"${roadmapTitle}" expedition deleted.`);
      } catch (error) {
        toast.error("Failed to delete expedition.");
      }
    }
  };
  
  const getCardDetails = (index: number) => {
    const details = [
        { icon: <Brain className="w-8 h-8" />, color: '#FF6B6B' }, 
        { icon: <Code className="w-8 h-8" />, color: '#4ECDC4' }, 
        { icon: <Atom className="w-8 h-8" />, color: '#45B7D1' }, 
        { icon: <Palette className="w-8 h-8" />, color: '#F7B801' }, 
        { icon: <Database className="w-8 h-8" />, color: '#6C5CE7' }, 
        { icon: <Cpu className="w-8 h-8" />, color: '#FD79A8' }
    ];
    return details[index % details.length];
  };

  const CircularProgress: React.FC<{ progress: number; color: string; icon: React.ReactNode }> = ({ progress, color, icon }) => {
      const circumference = 2 * Math.PI * 45;
      const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="8" fill="none" strokeDasharray={strokeDasharray} strokeLinecap="round" className="transition-all duration-1000 ease-out" style={{ filter: `drop-shadow(0 0 8px ${color}50)` }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-nexus-accent">{icon}</div>
        </div>
      );
  };
  
  if (expeditions.length === 0 && showTitle) {
    return (
        <section className="w-full max-w-6xl mx-auto">
            <div className="mb-12">
                <h2 className="text-4xl font-bold text-gray-100 mb-4">Ongoing <span className="text-nexus-accent glow-text">Expeditions</span></h2>
                <p className="text-xl text-gray-400">You haven't started any expeditions yet. Create one on the Dashboard to begin your journey!</p>
            </div>
        </section>
    );
  }

  return (
    <section className="w-full max-w-6xl mx-auto">
      {showTitle && (
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-100 mb-4">Ongoing <span className="text-nexus-accent glow-text">Expeditions</span></h2>
          <p className="text-xl text-gray-400">Your current journeys through the cosmos of knowledge</p>
        </div>
      )}

      {expeditions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {expeditions.map((expedition, index) => {
              const cardDetails = getCardDetails(index);
              return (
                  <div key={expedition.id} className="expedition-card p-8 rounded-3xl cursor-pointer group animate-float relative" onClick={() => navigate(`/roadmaps/${expedition.id}`)}>
                      <button 
                        className="absolute top-4 right-4 p-1.5 bg-nexus-surface/50 text-gray-500 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors z-10"
                        onClick={(e) => { e.stopPropagation(); handleDelete(expedition.id, expedition.title); }}
                        aria-label={`Delete ${expedition.title}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex flex-col items-center space-y-6">
                        <CircularProgress progress={expedition.progress} color={cardDetails.color} icon={cardDetails.icon} />
                        <div className="text-center">
                          <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-nexus-accent transition-colors">{expedition.title}</h3>
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${expedition.progress}%`, backgroundColor: cardDetails.color, boxShadow: `0 0 10px ${cardDetails.color}50` }}/>
                            </div>
                            <span className="text-sm font-medium text-gray-400">{expedition.progress}%</span>
                          </div>
                        </div>
                      </div>
                  </div>
              )
          })}
        </div>
      )}
    </section>
  );
};

export default OngoingExpeditions;