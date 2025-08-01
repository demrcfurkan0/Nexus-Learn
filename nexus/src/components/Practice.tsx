import React from 'react';
import { Target, Clock, Zap, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Practice: React.FC = () => {
  const navigate = useNavigate();
  
  const practiceAreas = [
    {
      title: 'Code Challenges',
      description: 'Sharpen your programming skills with interactive challenges',
      icon: <Target className="w-8 h-8" />,
      color: '#FF6B6B',
      coming: false,
      path: '/practice/code-challenges'
    },
    {
      title: 'Timed Quizzes',
      description: 'Test your knowledge in a simulated AI interview',
      icon: <Clock className="w-8 h-8" />,
      color: '#4ECDC4',
      coming: false,
      path: '/practice/interview-topics'
    },
    {
      title: 'Flash Cards',
      description: 'Memorize key concepts with AI-generated cards',
      icon: <Zap className="w-8 h-8" />,
      color: '#45B7D1',
      coming: false,
      path: '/practice/flash-cards'
    },
    {
      title: 'Skill Assessments',
      description: 'Get a detailed competency report on your skills',
      icon: <Award className="w-8 h-8" />,
      color: '#F7B801',
      coming: false, // Artık aktif
      path: '/practice/assessment-topics'
    }
  ];

  return (
    <div className="min-h-screen bg-nexus-dark">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-100 mb-4">
            Practice <span className="text-nexus-accent glow-text">Arena</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Hone your skills in the cosmic training grounds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {practiceAreas.map((area, index) => (
            <div
              key={index}
              className={`expedition-card p-8 rounded-3xl group ${
                area.coming ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => !area.coming && area.path && navigate(area.path)}
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
                  
                  <div className="mt-4">
                    {area.coming ? (
                      <span className="inline-flex items-center px-4 py-2 bg-nexus-surface/50 rounded-full text-sm text-gray-400 border border-gray-600">
                        Coming Soon
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-6 py-3 bg-nexus-accent text-nexus-dark rounded-full font-medium group-hover:bg-nexus-accent/90 transition-colors">
                        Start Training
                      </span>
                    )}
                  </div>
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