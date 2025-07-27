import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, HelpCircle } from 'lucide-react';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';

const CreateNewMap: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    setIsGenerating(true);
    const toastId = toast.loading('Igniting new universe of knowledge...');

    try {
      const response = await apiClient.post<any>('/api/roadmaps/generate', {
        prompt: inputValue,
      });
      
      toast.success('Roadmap created successfully!', { id: toastId });
      
      const newRoadmapId = response.data.id || response.data._id;

      if (newRoadmapId) {
        navigate(`/roadmaps/${newRoadmapId}`);
      } else {
        console.error("New roadmap created but no ID was returned:", response.data);
        toast.error("Roadmap created, but failed to navigate. Please go to the dashboard.");
      }
    } catch (error: any) {
      console.error('Failed to create roadmap:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to create roadmap.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsGenerating(false);
      setInputValue('');
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto mb-16">
      {/* Başlık Bölümü (Soru işareti buradan kaldırıldı) */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-100">
          Chart Your Next <span className="text-nexus-accent glow-text">Universe</span> of Knowledge
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mt-4">
          Enter any concept and watch as we map the cosmos of understanding before you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- YENİ YAPI: INPUT VE İPUCU İKONU BİR ARADA --- */}
        <div className="flex items-center gap-4">
          {/* Input Alanı */}
          <div className="relative flex-grow">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter a concept to master... like 'General Relativity'"
              className={`w-full px-8 py-6 text-xl bg-nexus-surface/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 placeholder-gray-500 text-gray-100 focus:outline-none ${isFocused ? 'border-nexus-accent glow-border' : 'border-gray-600 hover:border-gray-500'}`}
              disabled={isGenerating}
            />
          </div>

          {/* İpucu İkonu ve Pop-up'ı */}
          <div className="relative group flex-shrink-0">
            <HelpCircle className="w-8 h-8 text-gray-500 cursor-pointer hover:text-nexus-accent transition-colors"/>
            <div className="absolute bottom-full mb-2 right-0 w-80 bg-nexus-surface p-4 rounded-lg border border-gray-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none z-20">
              <h4 className="font-bold text-white mb-2">How to write a good prompt?</h4>
              <p className="text-sm text-gray-400 mb-2">Be specific! The more detail you provide, the better the roadmap will be.</p>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 text-left">
                <li>"Learn Python for Data Analysis with Pandas"</li>
                <li>"Become a full-stack developer with React and FastAPI"</li>
                <li>"Master game development basics with Godot"</li>
              </ul>
              {/* Ok işareti */}
              <div className="absolute right-3 bottom-[-8px] w-4 h-4 bg-nexus-surface border-b border-r border-gray-700 transform rotate-45"></div>
            </div>
          </div>
        </div>
        {/* ------------------------------------------- */}

        {/* Buton Alanı */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!inputValue.trim() || isGenerating}
            className={`group px-12 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 ${inputValue.trim() && !isGenerating ? 'bg-nexus-accent text-nexus-dark hover:bg-nexus-accent/90 hover:scale-105 animate-pulse-glow' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
          >
            <Zap className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Ignite'}</span>
            <Sparkles className="w-5 h-5 group-hover:animate-spin" />
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateNewMap;