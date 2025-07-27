import React from 'react';
import { CodeChallenge } from '../types';

interface ChallengeListProps {
  challenges: CodeChallenge[];
  selectedChallengeId: string;
  onSelectChallenge: (challenge: CodeChallenge) => void;
}

const ChallengeList: React.FC<ChallengeListProps> = ({ challenges, selectedChallengeId, onSelectChallenge }) => {
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="bg-nexus-surface/80 p-2 rounded-2xl border border-gray-700 flex-grow overflow-y-auto custom-scrollbar">
      <ul className="space-y-2">
        {challenges.map((challenge) => (
          <li key={challenge.id}>
            <button
              onClick={() => onSelectChallenge(challenge)}
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                selectedChallengeId === challenge.id
                  ? 'bg-nexus-accent/20'
                  : 'hover:bg-gray-700/50'
              }`}
            >
              <p className="font-semibold text-gray-100">{challenge.title}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-400">{challenge.category}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyClass(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChallengeList;