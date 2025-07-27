import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import { InterviewSession, RoadmapData, UserProfile } from '../../types';
import { BookOpen } from 'lucide-react';

// Gelen yanıtta _id olabileceğini belirtmek için
type RoadmapResponse = RoadmapData & { _id?: string };

const InterviewTopicPage: React.FC = () => {
  const [isStarting, setIsStarting] = useState(false);
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Kullanıcının tüm roadmap'lerini çek
  useEffect(() => {
    const fetchUserRoadmaps = async () => {
      try {
        const response = await apiClient.get<UserProfile>('/api/auth/users/me/profile');
        const transformedRoadmaps = response.data.roadmaps.map(roadmap => ({
          ...roadmap,
          id: (roadmap as RoadmapResponse).id || (roadmap as RoadmapResponse)._id || '',
        }));
        setRoadmaps(transformedRoadmaps);
      } catch (error) {
        toast.error("Could not load your expeditions.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserRoadmaps();
  }, []);

  const handleStartInterview = async (topic: string) => {
    setIsStarting(true);
    const toastId = toast.loading(`Starting interview simulation for ${topic}...`);
    
    try {
      const response = await apiClient.post<any>('/api/interviews/start', { topic });
      const sessionId = response.data.id || response.data._id;
      if (sessionId) {
        toast.dismiss(toastId);
        navigate(`/practice/interview/${sessionId}`);
      } else {
        throw new Error("No session ID received.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to start interview. Please try again.');
      console.error(error);
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400 py-20 animate-pulse">Loading Your Expeditions...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-100 mb-4">AI Interview Simulation</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">Select one of your expeditions to start a simulated technical interview on that topic.</p>
      </header>

      {roadmaps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {roadmaps.map((roadmap) => (
            <button
              key={roadmap.id}
              onClick={() => handleStartInterview(roadmap.title)}
              disabled={isStarting}
              className="expedition-card p-8 rounded-3xl group disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              <div className="text-nexus-accent w-16 h-16 mx-auto mb-4 flex items-center justify-center text-4xl">
                <BookOpen />
              </div>
              <h3 className="text-2xl font-semibold text-gray-100 group-hover:text-nexus-accent transition-colors">
                {roadmap.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2">{roadmap.nodes.length} topics</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-20">
          <p>You haven't started any expeditions yet.</p>
          <p>Go to the dashboard to start a new journey and then practice with an interview!</p>
        </div>
      )}
    </div>
  );
};

export default InterviewTopicPage;