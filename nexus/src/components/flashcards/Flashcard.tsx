import React, { useState } from 'react';
import { Flashcard as FlashcardType } from '../../types';

interface FlashcardProps {
  card: FlashcardType;
}

const Flashcard: React.FC<FlashcardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Yeni bir kart gösterildiğinde
  // kartın otomatik olarak ön yüzüne dönmesini sağla
  React.useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  return (
    <div
      className="w-full h-full perspective-1000 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full preserve-3d transition-transform duration-500 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Kartın Ön Yüzü */}
        <div className="absolute w-full h-full backface-hidden bg-nexus-surface border border-nexus-accent/30 rounded-2xl flex items-center justify-center p-8 text-center shadow-lg group-hover:border-nexus-accent/60 transition-all">
          <p className="text-2xl text-gray-200">{card.front}</p>
        </div>
        
        {/* Kartın Arka Yüzü */}
        <div className="absolute w-full h-full backface-hidden bg-nexus-surface/90 border border-gray-700 rounded-2xl flex items-center justify-center p-8 text-center rotate-y-180 shadow-lg">
          <p className="text-xl text-nexus-accent">{card.back}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;