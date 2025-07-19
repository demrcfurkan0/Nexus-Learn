import React, { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';

const CreateNewMap: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      console.log('Creating roadmap for:', inputValue);
      // Here you would typically call an API to create the roadmap
      setInputValue('');
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto mb-16">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-100 mb-4">
          Yapay Zekayla Yeni {' '}
          <span className="text-nexus-accent glow-text">Bilgi Evrenini</span>{' '}
          Keşfet
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Bir fikir gir, anlayışın evreni senin için şekillensin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Öğrenmek istediğin bir konuyu yaz... örneğin 'Genel Görelilik'"
              className={`w-full px-8 py-6 text-xl bg-nexus-surface/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 placeholder-gray-500 text-gray-100 focus:outline-none ${
                isFocused
                  ? 'border-nexus-accent glow-border'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            />
            {isFocused && (
              <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nexus-accent to-transparent animate-scanline"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={`group px-12 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 ${
              inputValue.trim()
                ? 'bg-nexus-accent text-nexus-dark hover:bg-nexus-accent/90 hover:scale-105 animate-pulse-glow'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span>Ignite</span>
            <Sparkles className="w-5 h-5 group-hover:animate-spin" />
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateNewMap;