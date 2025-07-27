import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InterviewSession, InterviewQuestion } from '../../types'; 
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { Timer, CheckSquare, Send } from 'lucide-react';

const TOTAL_TIME = 20 * 60;

const InterviewSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  
  const timerRef = useRef<number>();

  useEffect(() => {
    if (!sessionId) return;
    apiClient.get<InterviewSession>(`/api/interviews/${sessionId}`)
      .then(response => {
        setSession(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Could not load interview session.");
        navigate('/practice/interview-topics');
      });
  }, [sessionId, navigate]);

  useEffect(() => {
    if (!loading && session) { 
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [loading, session]);

  useEffect(() => {
    if (timeLeft === 0 && session?.status === 'in_progress') {
      handleSubmit();
    }
  }, [timeLeft, session]);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    if(!session) return;
    clearInterval(timerRef.current);
    toast.loading('Submitting your answers for evaluation...');

    const submissionData = session.questions.map((q, index) => ({
      question_text: q.question_text,
      user_answer: answers[index] || ""
    }));

    try {
      await apiClient.post(`/api/interviews/${session.id}/submit`, { answers: submissionData });
      toast.dismiss();
      toast.success("Interview completed! Redirecting to your profile...", { duration: 4000 });
      setTimeout(() => navigate(`/profile`), 2000); 
    } catch(error) {
      toast.dismiss();
      toast.error("Failed to submit interview.");
      console.error(error);
    }
  };

  if (loading || !session) {
    return (
        <div className="h-screen flex items-center justify-center bg-nexus-dark">
            <p className="text-white text-xl animate-pulse">Loading Interview Environment...</p>
        </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="h-screen bg-nexus-dark text-white p-8 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-nexus-accent">{session.topic} Interview</h1>
        <div className={`flex items-center space-x-2 text-2xl font-semibold p-2 rounded-lg ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
          <Timer className="w-7 h-7" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-nexus-surface/50 rounded-2xl p-6 flex flex-col">
        <div className="mb-4 flex-shrink-0">
          <p className="text-gray-400">Question {currentQuestionIndex + 1} of {session.questions.length}</p>
          <h2 className="text-2xl font-semibold text-gray-100 mt-1 whitespace-pre-wrap">{currentQuestion.question_text}</h2>
        </div>

        <div className="flex-grow my-4 overflow-auto">
          {currentQuestion.question_type === 'live_coding' ? (
            <Editor
              value={answers[currentQuestionIndex] || currentQuestion.template_code || ''}
              onValueChange={code => handleAnswerChange(currentQuestionIndex, code)}
              highlight={code => Prism.highlight(code, Prism.languages.python, 'python')}
              padding={16}
              className="bg-nexus-dark rounded-lg h-full min-h-[300px] custom-scrollbar code-editor"
              style={{ fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 16 }}
            />
          ) : (
            <textarea
              value={answers[currentQuestionIndex] || ''}
              onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
              className="w-full h-full bg-nexus-dark rounded-lg p-4 text-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-nexus-accent resize-none"
              placeholder="Your answer here..."
            />
          )}
        </div>
      </main>

      {/* Footer & Navigation */}
      <footer className="mt-6 flex justify-between items-center">
        <button 
          onClick={() => setCurrentQuestionIndex(p => p > 0 ? p - 1 : p)}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        
        {currentQuestionIndex === session.questions.length - 1 ? (
          <button onClick={handleSubmit} className="px-8 py-4 rounded-lg bg-green-600 hover:bg-green-500 flex items-center space-x-2 transition-colors">
            <CheckSquare />
            <span>Finish & Submit</span>
          </button>
        ) : (
          <button onClick={() => setCurrentQuestionIndex(p => p < session.questions.length - 1 ? p + 1 : p)}
            className="px-6 py-3 rounded-lg bg-nexus-accent text-nexus-dark hover:bg-nexus-accent/90 transition-colors"
          >
            Next Question
          </button>
        )}
      </footer>
    </div>
  );
};

export default InterviewSessionPage;