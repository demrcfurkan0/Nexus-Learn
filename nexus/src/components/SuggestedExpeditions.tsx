import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { BrainCircuit, Combine, ShieldCheck, Code, Cpu, Database } from 'lucide-react';
import { RoadmapData } from '../types';

const SuggestedExpeditions: React.FC = () => {
  const [expeditions, setExpeditions] = useState<RoadmapData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestedRoadmaps = async () => {
      try {
        const response = await apiClient.get<RoadmapData[]>('/api/roadmaps/suggested');
        setExpeditions(response.data);
      } catch (error) {
        console.error("Failed to fetch suggested expeditions:", error);
      }
    };
    fetchSuggestedRoadmaps();
  }, []);

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('machine learning')) return <BrainCircuit className="w-8 h-8 text-red-400" />;
    if (title.toLowerCase().includes('react')) return <Combine className="w-8 h-8 text-cyan-400" />;
    if (title.toLowerCase().includes('hacking')) return <ShieldCheck className="w-8 h-8 text-red-400" />;
    if (title.toLowerCase().includes('data science')) return <Database className="w-8 h-8 text-purple-400" />;
    if (title.toLowerCase().includes('devops')) return <Cpu className="w-8 h-8 text-pink-400" />;
    return <Code className="w-8 h-8 text-gray-400" />;
  };

  return (
    <section className="w-full max-w-6xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-gray-100 mb-4">
          Suggested <span className="text-nexus-accent glow-text">Expeditions</span>
        </h2>
        <p className="text-xl text-gray-400">
          Start your journey with our expert-curated paths
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {expeditions.map((expedition: any) => { // Tipi 'any' olarak değiştirip esneklik sağlıyoruz
            const expeditionId = expedition.id || expedition._id; // Önce id'yi, yoksa _id'yi dene
            if (!expeditionId) {
              console.warn("Suggested expedition with missing ID skipped:", expedition);
              return null; // id yoksa bu kartı render etme
            }
            return (
              <div
                key={expeditionId}
                className="expedition-card p-8 rounded-3xl cursor-pointer group transition-all duration-300 hover:border-nexus-accent/50"
                onClick={() => navigate(`/roadmaps/${expeditionId}`)}
              >
                <div className="flex flex-col items-center space-y-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-nexus-surface/50 border-2 border-gray-700 flex items-center justify-center group-hover:border-nexus-accent/50 transition-colors">
                    {getIcon(expedition.title)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100 group-hover:text-nexus-accent transition-colors">
                    {expedition.title}
                  </h3>
                </div>
              </div>
            )
        })}
      </div>
    </section>
  );
};

export default SuggestedExpeditions;