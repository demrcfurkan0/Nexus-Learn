import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ApiNode {
  nodeId: string;
  title: string;
  content: string;
}

interface NodeInfoPanelProps {
  node: ApiNode;
  onPromptClick: (prompt: string) => void;
}

const NodeInfoPanel: React.FC<NodeInfoPanelProps> = ({ node, onPromptClick }) => {
  const suggestedPrompts = [
    `"${node.title}" konusunu daha basit bir dille anlat.`,
    `"${node.title}" için gerçek hayattan bir örnek ver.`,
    'Bu konunun bir önceki adımla bağlantısı nedir?',
    'Bu konuyu öğrenirken nelere dikkat etmeliyim?',
  ];

  return (
    <div className="flex flex-col h-full bg-nexus-dark/30 p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">Konu Detayları</h3>
      <p className="text-gray-300 flex-grow overflow-y-auto mb-6 pr-2 custom-scrollbar">
        {node.content}
      </p>

      <div className="border-t border-gray-700 pt-6">
        <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
          Hızlı Başlangıç
        </h4>
        <div className="space-y-3">
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onPromptClick(prompt)}
              className="w-full text-left p-3 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-nexus-accent/20 hover:text-nexus-accent transition-all duration-200"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NodeInfoPanel;