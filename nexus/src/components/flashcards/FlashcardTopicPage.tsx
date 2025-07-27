import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { RoadmapData, UserProfile } from '../../types';
import { BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

type RoadmapResponse = RoadmapData & { _id?: string };

const FlashcardTopicPage: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) {
    return <div className="text-center text-gray-400 py-20 animate-pulse">Loading Your Expeditions...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-100 mb-4">Flashcard Decks</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">Select an expedition to generate flashcards from your completed topics.</p>
      </header>
      
      {roadmaps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {roadmaps.map((roadmap) => (
            <button
              key={roadmap.id}
              onClick={() => navigate(`/practice/flash-cards/session/${roadmap.id}`)}
              className="expedition-card p-8 rounded-3xl group text-center"
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
          <p>Go to the dashboard to start a new journey and then generate flashcards!</p>
        </div>
      )}
    </div>
  );
};

export default FlashcardTopicPage;