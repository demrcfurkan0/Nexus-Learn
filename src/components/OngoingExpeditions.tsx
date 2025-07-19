import React from 'react';
import { Brain, Code, Atom, Palette, Database, Cpu } from 'lucide-react';

interface Expedition {
  id: string;
  title: string;
  progress: number;
  icon: React.ReactNode;
  color: string;
}

const OngoingExpeditions: React.FC = () => {
  const expeditions: Expedition[] = [
    {
      id: '1',
      title: 'Makine Öğrenmesi Anaforu',
      progress: 67,
      icon: <Brain className="w-8 h-8" />,
      color: '#FF6B6B'
    },
    {
      id: '2',
      title: 'React Cosmos Keşfi',
      progress: 45,
      icon: <Code className="w-8 h-8" />,
      color: '#4ECDC4'
    },
    {
      id: '3',
      title: 'Kuantum Hesaplama Derinlikleri',
      progress: 23,
      icon: <Atom className="w-8 h-8" />,
      color: '#45B7D1'
    },
    {
      id: '4',
      title: 'Tasarım Sistemi Galaksisi',
      progress: 89,
      icon: <Palette className="w-8 h-8" />,
      color: '#F7B801'
    },
    {
      id: '5',
      title: 'Veritabanı Mimarisi ',
      progress: 56,
      icon: <Database className="w-8 h-8" />,
      color: '#6C5CE7'
    },
    {
      id: '6',
      title: 'Sistem Tasarımı Evreni',
      progress: 34,
      icon: <Cpu className="w-8 h-8" />,
      color: '#FD79A8'
    }
  ];

  const CircularProgress: React.FC<{ progress: number; color: string; icon: React.ReactNode }> = ({ progress, color, icon }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;

    return (
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-nexus-accent">
          {icon}
        </div>
      </div>
    );
  };

  return (
    <section className="w-full max-w-6xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-gray-100 mb-4">
          Devam Eden <span className="text-nexus-accent glow-text">Keşifler</span>
        </h2>
        <p className="text-xl text-gray-400">
          Bilgi evrenindeki mevcut yolculuklarınız
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {expeditions.map((expedition) => (
          <div
            key={expedition.id}
            className="expedition-card p-8 rounded-3xl cursor-pointer group animate-float"
            style={{ animationDelay: `${parseInt(expedition.id) * 0.2}s` }}
          >
            <div className="flex flex-col items-center space-y-6">
              <CircularProgress
                progress={expedition.progress}
                color={expedition.color}
                icon={expedition.icon}
              />
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-nexus-accent transition-colors">
                  {expedition.title}
                </h3>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out rounded-full"
                      style={{
                        width: `${expedition.progress}%`,
                        backgroundColor: expedition.color,
                        boxShadow: `0 0 10px ${expedition.color}50`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-400">
                    {expedition.progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OngoingExpeditions;