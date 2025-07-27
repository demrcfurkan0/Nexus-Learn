import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Roadmaps from './components/Roadmaps';
import Practice from './components/Practice';
import Starfield from './components/Starfield';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ProfilePage from './components/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import CodeChallengesPage from './components/CodeChallengesPage';
import InterviewTopicPage from './components/interviews/InterviewTopicPage';
import InterviewSessionPage from './components/interviews/InterviewSessionPage';
import FlashcardTopicPage from './components/flashcards/FlashcardTopicPage';
import FlashcardSessionPage from './components/flashcards/FlashcardSessionPage';
import AssessmentTopicPage from './components/assessments/AssessmentTopicPage';
import AssessmentSessionPage from './components/assessments/AssessmentSessionPage';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // showLayout, Navbar'ın ve Starfield'ın login/signup sayfalarında görünmesini engeller
  const showLayout = !['/login', '/signup'].includes(location.pathname);

  const getActiveTab = (): 'dashboard' | 'roadmaps' | 'practice' => {
    if (location.pathname.startsWith('/roadmaps')) return 'roadmaps';
    if (location.pathname.startsWith('/practice')) return 'practice';
    if (location.pathname.startsWith('/profile')) return 'dashboard';
    return 'dashboard';
  };

  return (
    <div className="min-h-screen bg-nexus-dark font-inter">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#1a2238',
            color: '#f0f0f0',
            border: '1px solid #00E5FF40'
          },
        }}
      />
      
      {/* Starfield ve Navbar SADECE burada ve SADECE bir kez çağrılıyor */}
      {showLayout && <Starfield />}
      {showLayout && (
        <Navbar
          activeTab={getActiveTab()}
          onTabChange={(tab) => navigate(tab === 'dashboard' ? '/' : `/${tab}`)}
        />
      )}

      {/* Sayfa içeriği bu main etiketi içinde render ediliyor */}
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/roadmaps" element={<ProtectedRoute><Roadmaps /></ProtectedRoute>} />
          <Route path="/roadmaps/:id" element={<ProtectedRoute><Roadmaps /></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          
          <Route path="/practice/code-challenges" element={<ProtectedRoute><CodeChallengesPage /></ProtectedRoute>} />
          <Route path="/practice/interview-topics" element={<ProtectedRoute><InterviewTopicPage /></ProtectedRoute>} />
          <Route path="/practice/interview/:sessionId" element={<ProtectedRoute><InterviewSessionPage /></ProtectedRoute>} />
          <Route path="/practice/flash-cards" element={<ProtectedRoute><FlashcardTopicPage /></ProtectedRoute>} />
          <Route path="/practice/flash-cards/session/:roadmapId" element={<ProtectedRoute><FlashcardSessionPage /></ProtectedRoute>} />
          <Route path="/practice/assessment-topics" element={<ProtectedRoute><AssessmentTopicPage /></ProtectedRoute>} />
          <Route path="/practice/assessment/:sessionId" element={<ProtectedRoute><AssessmentSessionPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;