import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HierarchicalRoadmap from './HierarchicalRoadmap';
import LearningModal from './LearningModal';
import apiClient from '../services/apiClient';
import { ApiNode, RoadmapData } from '../types';
import toast from 'react-hot-toast';
import OngoingExpeditions from './OngoingExpeditions';

const Roadmaps: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<ApiNode | null>(null);

  useEffect(() => {
    // Sadece URL'de bir ID varsa tekil roadmap'i çek
    if (id) {
      setLoading(true);
      setError(null);
      apiClient.get<RoadmapData>(`/api/roadmaps/${id}`)
        .then(response => {
          setRoadmapData(response.data);
        })
        .catch(err => {
          console.error("Failed to fetch roadmap:", err);
          setError("Could not load the cosmic map. Please try again.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Eğer ID yoksa, yüklemeyi durdur. Liste görünümü gösterilecek.
      setLoading(false);
    }
  }, [id]);

  const handleNodeClick = (node: ApiNode) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  const handleMarkComplete = async (nodeId: string) => {
    if (!id || !roadmapData) return;
    let targetRoadmapId = id;
    let shouldNavigate = false;

    if (roadmapData.type === 'suggested') {
      try {
        const toastId = toast.loading('Enrolling in this expedition...');
        const response = await apiClient.post<{ personal_roadmap_id: string }>(`/api/roadmaps/${id}/enroll`);
        targetRoadmapId = response.data.personal_roadmap_id;
        shouldNavigate = true;
        toast.success('Expedition started!', { id: toastId });
      } catch (err) {
        toast.error("Could not start this expedition.");
        return;
      }
    }
    
    try {
      await apiClient.patch(`/api/roadmaps/${targetRoadmapId}/nodes/${nodeId}/status`, {
        status: 'completed',
      });

      if (shouldNavigate) {
        navigate(`/roadmaps/${targetRoadmapId}`, { replace: true });
      } else {
        setRoadmapData(prevData => {
          if (!prevData) return null;
          const newNodes = prevData.nodes.map(node => 
            node.nodeId === nodeId ? { ...node, status: 'completed' } : node
          );
          return { ...prevData, nodes: newNodes };
        });
        toast.success('Node marked as complete!');
      }
      
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark">
      <div className="container mx-auto px-6 py-12">
        {id ? (
          // URL'de ID varsa, tekil roadmap görünümü
          <>
            {loading && <p className="text-white text-2xl text-center animate-pulse">Loading your cosmic map...</p>}
            {error && <p className="text-red-500 text-2xl text-center">{error}</p>}
            {roadmapData && (
              <>
                <div className="text-center mb-12 animate-fade-in">
                  <h1 className="text-5xl font-bold text-gray-100 mb-4">
                    <span className="text-nexus-accent glow-text">{roadmapData.title}</span>
                  </h1>
                  <p className="text-xl text-gray-400">Follow the path to master this universe of knowledge.</p>
                </div>
                <HierarchicalRoadmap 
                  apiNodes={roadmapData.nodes} 
                  onNodeClick={handleNodeClick} 
                />
              </>
            )}
          </>
        ) : (
          // URL'de ID yoksa, Ongoing Expeditions listesi
          <>
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-100 mb-4">
                Your <span className="text-nexus-accent glow-text">Expeditions</span>
              </h1>
              <p className="text-xl text-gray-400">Select an expedition to view its map, or start a new one from the dashboard.</p>
            </div>
            <OngoingExpeditions showTitle={false} />
          </>
        )}
      </div>

      {isModalOpen && selectedNode && id && (
        <LearningModal 
          node={selectedNode}
          roadmapId={id}
          onClose={handleCloseModal}
          onMarkComplete={handleMarkComplete}
        />
      )}
    </div>
  );
};

export default Roadmaps;