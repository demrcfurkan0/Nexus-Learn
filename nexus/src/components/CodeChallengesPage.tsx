import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../services/apiClient';
import { CodeChallenge, RoadmapData, UserProfile } from '../types';
import ChallengeList from './ChallengeList';
import ChallengeDetail from './ChallengeDetail';
import ChatPanel from './ChatPanel';
import { Bot, Sparkles, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

type ChallengeTab = 'suggested' | 'recommended';
type ChallengeResponse = CodeChallenge & { _id?: string };

const CodeChallengesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ChallengeTab>('suggested');
  const [suggestedChallenges, setSuggestedChallenges] = useState<CodeChallenge[]>([]);
  const [recommendedChallenges, setRecommendedChallenges] = useState<CodeChallenge[]>([]);
  const [userRoadmaps, setUserRoadmaps] = useState<RoadmapData[]>([]);
  
  const [selectedChallenge, setSelectedChallenge] = useState<CodeChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);

  const challengesToShow = activeTab === 'suggested' ? suggestedChallenges : recommendedChallenges;

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [challengesRes, profileRes] = await Promise.all([
          apiClient.get<ChallengeResponse[]>('/api/challenges/'),
          apiClient.get<UserProfile>('/api/auth/users/me/profile')
        ]);
        
        const transformedChallenges = challengesRes.data.map(c => ({ ...c, id: c.id || c._id || '' }));
        setSuggestedChallenges(transformedChallenges);
        
        // Gelen roadmap verisini de dönüştürerek ID'lerini garantile
        const transformedRoadmaps = profileRes.data.roadmaps.map(r => ({ ...r, id: (r as any).id || (r as any)._id || '' }));
        setUserRoadmaps(transformedRoadmaps);

        if (transformedChallenges.length > 0 && activeTab === 'suggested') {
          setSelectedChallenge(transformedChallenges[0]);
        }
      } catch (error) {
        toast.error("Could not load page data. Please try again.");
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const eligibleRoadmaps = useMemo(() => {
    return userRoadmaps.filter(roadmap => 
      roadmap.nodes.some(node => node.status === 'completed')
    );
  }, [userRoadmaps]);

  const handleGenerateForRoadmap = async (roadmapId: string, roadmapTitle: string) => {
    setGeneratingForId(roadmapId);
    const toastId = toast.loading(`Generating challenges for "${roadmapTitle}"...`);
    try {
      const response = await apiClient.post<ChallengeResponse[]>('/api/challenges/generate-recommended', { roadmapId });
      const transformedData = response.data.map(c => ({ ...c, id: c.id || c._id || '' }));
      
      setRecommendedChallenges(transformedData);
      setActiveTab('recommended');
      
      if (transformedData.length > 0) {
        setSelectedChallenge(transformedData[0]);
        toast.success('New challenges generated!', { id: toastId });
      } else {
        toast.error('Could not generate new challenges for this roadmap.', { id: toastId });
      }
    } catch (error: any) {
      const detail = error.response?.data?.detail || "Could not generate challenges.";
      toast.error(detail, { id: toastId });
      console.error("Error generating challenges:", error);
    } finally {
      setGeneratingForId(null);
    }
  };

  const handleTabChange = (tab: ChallengeTab) => {
    setActiveTab(tab);
    const list = tab === 'suggested' ? suggestedChallenges : recommendedChallenges;
    setSelectedChallenge(list.length > 0 ? list[0] : null);
  };

  if (loading) {
    return <div className="text-center text-gray-400 py-20 animate-pulse">Loading Arena...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-gray-100 mb-2">Practice Arena</h1>
        <p className="text-xl text-nexus-accent glow-text">Code Challenges</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[75vh]">
        {/* Sol Panel: Challenge Listeleri */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex bg-nexus-surface p-1 rounded-lg">
            <button onClick={() => handleTabChange('suggested')} className={`w-1/2 p-2 rounded ${activeTab === 'suggested' ? 'bg-nexus-accent text-nexus-dark' : 'hover:bg-gray-700'}`}>Suggested</button>
            <button onClick={() => handleTabChange('recommended')} className={`w-1/2 p-2 rounded ${activeTab === 'recommended' ? 'bg-nexus-accent text-nexus-dark' : 'hover:bg-gray-700'}`}>AI Recommended</button>
          </div>
          
          {activeTab === 'suggested' ? (
            <ChallengeList challenges={suggestedChallenges} selectedChallengeId={selectedChallenge?.id || ''} onSelectChallenge={setSelectedChallenge} />
          ) : (
            <div className="bg-nexus-surface/80 p-4 rounded-2xl border border-gray-700 flex-grow flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4 px-2">Generate challenges from an expedition:</h3>
              <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {eligibleRoadmaps.length > 0 ? (
                  eligibleRoadmaps.map(roadmap => (
                    <button 
                      key={roadmap.id} 
                      onClick={() => handleGenerateForRoadmap(roadmap.id, roadmap.title)}
                      disabled={!!generatingForId}
                      className="w-full text-left p-3 rounded-lg bg-nexus-dark/50 hover:bg-nexus-accent/10 transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-nexus-accent transition-colors" />
                        <span className="text-gray-200">{roadmap.title}</span>
                      </div>
                      {generatingForId === roadmap.id ? (
                        <div className="w-5 h-5 border-2 border-dashed border-white rounded-full animate-spin"></div>
                      ) : (
                        <Sparkles className="w-5 h-5 text-gray-500 group-hover:text-nexus-accent transition-colors" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-center text-gray-500 p-8 h-full flex flex-col items-center justify-center">
                    <p>Complete some topics in your expeditions first to generate personalized challenges here.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Orta Panel: Challenge Detayı */}
        <div className="lg:col-span-5">
          {selectedChallenge ? (
            <ChallengeDetail challenge={selectedChallenge} />
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500 bg-nexus-surface/80 rounded-2xl border border-gray-700">
              <p>Select a challenge to begin, or generate AI recommended challenges.</p>
            </div>
          )}
        </div>

        {/* Sağ Panel: AI Asistanı */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-nexus-surface/80 p-4 rounded-2xl border border-gray-700 flex-grow flex flex-col">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Bot className="w-6 h-6 mr-2 text-nexus-accent"/> AI Assistant
            </h2>
            {selectedChallenge ? (
              <ChatPanel key={selectedChallenge.id} context={{ type: 'challenge', challengeId: selectedChallenge.id }} />
            ) : (
              <div className="text-center text-gray-500 flex-grow flex items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg">
                Select a challenge to start a conversation with the AI.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeChallengesPage;