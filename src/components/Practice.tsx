import React from 'react';
import { Target, Clock, Zap, Award } from 'lucide-react';

const Practice: React.FC = () => {
  const practiceAreas = [
    {
      title: 'Kod Meydan okumaları',
      description: 'Etkileşimli zorluklarla zorluklarla programlama becerilerinizi geliştirin.',
      icon: <Target className="w-8 h-8" />,
      color: '#FF6B6B',
      coming: false
    },
    {
      title: 'Zaman Ayarlı Testler',
      description: 'Bilginizi Baskı Altında test edin.',
      icon: <Clock className="w-8 h-8" />,
      color: '#4ECDC4',
      coming: true
    },
    {
      title: 'Çalışma Kartları',
      description: 'Anahtar Kavramları Verimli bir Şekilde ezberleyin.',
      icon: <Zap className="w-8 h-8" />,
      color: '#45B7D1',
      coming: true
    },
    {
      title: 'Yetenek Değerlendirmeleri',
      description: 'Ustalık seviyenizi değerlendirin.',
      icon: <Award className="w-8 h-8" />,
      color: '#F7B801',
      coming: true
    }
  ];

  return (
    <div className="min-h-screen bg-nexus-dark">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-100 mb-4">
            Pratik <span className="text-nexus-accent glow-text">Arenası</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Kozmik eğitim sahasında becerilerinizi geliştirin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {practiceAreas.map((area, index) => (
            <div
              key={index}
              className={`expedition-card p-8 rounded-3xl cursor-pointer group ${
                area.coming ? 'opacity-60' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center space-y-6 text-center">
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    backgroundColor: `${area.color}20`,
                    color: area.color
                  }}
                >
                  {area.icon}
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold text-gray-100 mb-3 group-hover:text-nexus-accent transition-colors">
                    {area.title}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {area.description}
                  </p>
                  
                  {area.coming ? (
                    <div className="inline-flex items-center px-4 py-2 bg-nexus-surface/50 rounded-full text-sm text-gray-400 border border-gray-600">
                      Çok Yakında
                    </div>
                  ) : (
                    <button className="inline-flex items-center px-6 py-3 bg-nexus-accent text-nexus-dark rounded-full font-medium hover:bg-nexus-accent/90 transition-colors">
                      Eğitime Başla
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Practice;