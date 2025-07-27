import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import NodeInfoPanel from './NodeInfoPanel';
import ChatPanel from './ChatPanel'; // Bu importun yolu doğru olmalı
import { ApiNode } from '../types';

interface LearningModalProps {
  node: ApiNode;
  roadmapId: string;
  onClose: () => void;
  onMarkComplete: (nodeId: string) => void;
}

const LearningModal: React.FC<LearningModalProps> = ({ node, roadmapId, onClose, onMarkComplete }) => {
  const [promptForChat, setPromptForChat] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const handlePromptClick = (prompt: string) => {
    setPromptForChat(prompt);
  };

  const handleCompleteClick = async () => {
    setIsCompleting(true);
    try {
      await onMarkComplete(node.nodeId);
    } catch (error) {
      console.error("Completion failed from modal:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-nexus-surface/95 border border-nexus-accent/20 rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl shadow-nexus-accent/10 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-nexus-accent glow-text">{node.title}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-grow flex p-4 gap-4 overflow-hidden">
          <div className="w-1/3 flex flex-col">
            <NodeInfoPanel node={node} onPromptClick={handlePromptClick} />
          </div>
          <div className="w-2/3 flex flex-col border-l border-gray-700 pl-4">
            {/* --- HATA DÜZELTİLDİ: ChatPanel'e doğru 'context' prop'u veriliyor --- */}
            <ChatPanel 
              key={`${roadmapId}-${node.nodeId}`} // Modal her açıldığında ChatPanel'in yeniden yüklenmesini sağlar
              context={{ 
                type: 'roadmap', 
                roadmapId: roadmapId, 
                nodeId: node.nodeId 
              }}
              initialPrompt={promptForChat}
              clearInitialPrompt={() => setPromptForChat('')}
            />
            {/* ---------------------------------------------------------------------- */}
          </div>
        </main>

        <footer className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={handleCompleteClick}
            disabled={node.status === 'completed' || isCompleting}
            className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                       bg-green-600/80 text-white hover:bg-green-500/80
                       disabled:bg-gray-600"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {isCompleting ? 'Completing...' : (node.status === 'completed' ? 'Completed' : 'Mark as Complete')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LearningModal;