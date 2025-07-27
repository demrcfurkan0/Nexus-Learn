import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css'; 
import { CodeChallenge } from '../types';
import { Play, Upload, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

interface ChallengeDetailProps {
  challenge: CodeChallenge;
}

const ChallengeDetail: React.FC<ChallengeDetailProps> = ({ challenge }) => {
  const [code, setCode] = useState(challenge.template_code);
  const [isHintLoading, setIsHintLoading] = useState(false);

  useEffect(() => {
    setCode(challenge.template_code);
  }, [challenge]);

  const highlightCode = (codeToHighlight: string) => {
    return Prism.highlight(codeToHighlight, Prism.languages.python, 'python');
  };

  const handleRunCode = () => {
    toast('Run Code functionality is not yet implemented.', { icon: '🚧' });
  };

  const handleSubmitCode = () => {
    toast('Submit Code functionality is not yet implemented.', { icon: '🚧' });
  };

  const handleGetHint = async () => {
    setIsHintLoading(true);
    const toastId = toast.loading('Getting a hint from AI...');
    try {
      const response = await apiClient.post<{ hint: string }>(`/api/challenges/${challenge.id}/hint`, {
        user_code: code,
      });
      toast.success(response.data.hint, { id: toastId, duration: 6000 });
    } catch (error) {
      toast.error("Could not get a hint. Please try again.", { id: toastId });
    } finally {
      setIsHintLoading(false);
    }
  };

  return (
    <div className="bg-nexus-surface/80 rounded-2xl border border-gray-700 h-full flex flex-col p-4">
      {/* Açıklama Alanı */}
      <div className="p-4 flex-shrink-0 overflow-y-auto custom-scrollbar" style={{ maxHeight: '25%' }}>
        <h2 className="text-2xl font-bold text-nexus-accent glow-text">{challenge.title}</h2>
        <p className="mt-2 text-gray-300 whitespace-pre-wrap">{challenge.description}</p>
      </div>
      
      {/* --- KOD EDİTÖRÜ KAPSAYICISI GÜNCELLENDİ --- */}
      {/* Bu div artık yeni CSS sınıfımızı kullanıyor */}
      <div className="my-4 code-editor-container custom-scrollbar">
        <Editor
          value={code}
          onValueChange={c => setCode(c)}
          highlight={highlightCode}
          padding={16}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 16,
          }}
        />
      </div>
      {/* ------------------------------------ */}

      {/* Buton Alanı */}
      <div className="flex-shrink-0 p-4 flex justify-between items-center">
        <button onClick={handleGetHint} disabled={isHintLoading} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors disabled:opacity-50">
          <Lightbulb className={`w-5 h-5 ${isHintLoading ? 'animate-pulse' : ''}`} />
          <span>Get a Hint</span>
        </button>
        <div className="flex space-x-4">
           <button onClick={handleRunCode} className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">
              <Play className="w-5 h-5"/>
              <span>Run Code</span>
          </button>
          <button onClick={handleSubmitCode} className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-nexus-accent text-nexus-dark hover:bg-nexus-accent/90 transition-colors">
              <Upload className="w-5 h-5"/>
              <span>Submit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;