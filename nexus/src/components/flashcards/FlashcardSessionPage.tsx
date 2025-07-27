import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FlashcardDeck } from '../../types';
import apiClient from '../../services/apiClient';
import Flashcard from './Flashcard'; 
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import toast from 'react-hot-toast';

const FlashcardSessionPage: React.FC = () => {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!roadmapId) return;
    
    const generateDeck = async () => {
      const toastId = toast.loading('Generating flashcard deck with AI...');
      try {
        const response = await apiClient.post<FlashcardDeck>('/api/flash-cards/generate', { roadmapId });
        setDeck(response.data);
        toast.success('Deck generated!', { id: toastId });
      } catch (error: any) {
        console.error("Failed to generate deck:", error);
        const errorMessage = error.response?.data?.detail || 'Could not generate deck. Please try again.';
        toast.error(errorMessage, { id: toastId, duration: 5000 });
        navigate('/practice/flash-cards');
      } finally {
        setLoading(false);
      }
    };
    generateDeck();
  }, [roadmapId, navigate]);

  const goToNextCard = () => {
    if (deck) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % deck.cards.length);
    }
  };

  const goToPreviousCard = () => {
    if (deck) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + deck.cards.length) % deck.cards.length);
    }
  };

  const shuffleDeck = () => {
    if (deck) {
      const shuffledCards = [...deck.cards].sort(() => Math.random() - 0.5);
      setDeck({ ...deck, cards: shuffledCards });
      setCurrentIndex(0);
      toast('Deck shuffled!', { icon: '🔀' });
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-white text-xl animate-pulse">Generating AI Flashcards...</div>;
  }

  if (!deck || deck.cards.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl mb-4">Could not load flashcards.</h2>
        <button onClick={() => navigate('/practice/flash-cards')} className="px-6 py-2 bg-nexus-accent text-nexus-dark rounded-lg">
          Back to Topics
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-nexus-dark text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-2 text-gray-200">{deck.topic}</h1>
      <p className="text-lg text-gray-400 mb-8">Card {currentIndex + 1} of {deck.cards.length}</p>

      <div className="w-full max-w-2xl h-80">
        <Flashcard card={deck.cards[currentIndex]} />
      </div>
      
      <div className="flex items-center space-x-8 mt-8">
        <button onClick={goToPreviousCard} className="p-4 bg-nexus-surface rounded-full hover:bg-nexus-accent/20 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={shuffleDeck} className="p-4 bg-nexus-surface rounded-full hover:bg-nexus-accent/20 transition-colors">
          <Shuffle className="w-6 h-6" />
        </button>
        <button onClick={goToNextCard} className="p-4 bg-nexus-surface rounded-full hover:bg-nexus-accent/20 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardSessionPage;