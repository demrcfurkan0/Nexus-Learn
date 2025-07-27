import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AssessmentSession } from '../../types';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { ArrowRight, CheckSquare, ArrowLeft } from 'lucide-react';

type Stage = 'knowledge' | 'project' | 'completed';
// Gelen yanıtta _id olabileceğini belirtmek için
type AssessmentResponse = AssessmentSession & { _id?: string };

const AssessmentSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage>('knowledge');
  
  const [knowledgeAnswers, setKnowledgeAnswers] = useState<Record<number, string>>({});
  const [projectCodes, setProjectCodes] = useState<Record<number, string>>({});
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  useEffect(() => {
    if (!sessionId || sessionId === 'undefined') {
      toast.error("Invalid session ID.");
      navigate('/practice/assessment-topics');
      return;
    }
    setLoading(true);
    apiClient.get<AssessmentResponse>(`/api/assessments/${sessionId}`)
      .then(res => {
        // --- KESİN ÇÖZÜM: VERİYİ STATE'E ATMADAN ÖNCE DÖNÜŞTÜRME ---
        const sessionData = {
          ...res.data,
          // 'id' alanının varlığını garantile
          id: res.data.id || res.data._id || sessionId,
        };
        // -----------------------------------------------------------
        setSession(sessionData);

        const initialCodes: Record<number, string> = {};
        if (sessionData.project_tasks) {
          sessionData.project_tasks.forEach((task, index) => {
            initialCodes[index] = task.template_code || '';
          });
        }
        setProjectCodes(initialCodes);
      })
      .catch(() => {
        toast.error("Could not load assessment session.");
        navigate('/practice/assessment-topics');
      })
      .finally(() => setLoading(false));
  }, [sessionId, navigate]);

  const handleKnowledgeAnswerChange = (index: number, value: string) => {
    setKnowledgeAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleProjectCodeChange = (index: number, value: string) => {
    setProjectCodes(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    if (!session || !session.id) { // session.id var mı diye kontrol et
      toast.error("Session data is missing. Cannot submit.");
      return;
    }
    const toastId = toast.loading('Submitting your final assessment for evaluation...');
    try {
      const submissionData = {
        knowledge_answers: session.knowledge_questions.map((q, i) => ({
          question_text: q.question_text,
          user_answer: knowledgeAnswers[i] || '',
        })),
        project_codes: session.project_tasks.map((_, i) => projectCodes[i] || ''),
      };
      // Artık session.id'nin geçerli olduğundan eminiz
      await apiClient.post(`/api/assessments/${session.id}/submit`, submissionData);
      toast.success('Assessment submitted! Your report will be on your profile page.', { id: toastId, duration: 5000 });
      setStage('completed');
      setTimeout(() => navigate('/profile'), 3000);
    } catch (error) {
      toast.error('Failed to submit assessment.', { id: toastId });
    }
  };

  // ... (Geri kalan JSX kısmı önceki cevaptaki gibi tam ve doğru)
  if (loading) return <div className="h-screen flex items-center justify-center text-white animate-pulse">Loading Assessment Environment...</div>;
  if (!session) return <div className="h-screen flex items-center justify-center text-white">Could not load the assessment session. Please try again.</div>;
  
  const currentProject = session.project_tasks ? session.project_tasks[currentProjectIndex] : null;

  return (
    <div className="h-screen bg-nexus-dark text-white p-8 flex flex-col">
      <header className="text-center mb-8 flex-shrink-0">
        <h1 className="text-3xl font-bold text-nexus-accent mb-2">Skill Assessment: {session.topic}</h1>
        <p className="text-lg text-gray-400">
          {stage === 'knowledge' && `Part 1: Knowledge Questions (${session.knowledge_questions.length} Questions)`}
          {stage === 'project' && `Part 2: Project Tasks (${currentProjectIndex + 1} of ${session.project_tasks.length})`}
          {stage === 'completed' && 'Evaluation in Progress'}
        </p>
      </header>

      {stage === 'knowledge' && (
        <main className="flex-grow overflow-y-auto custom-scrollbar pr-4 space-y-8">
          {session.knowledge_questions.map((q, index) => (
            <div key={`kq-${index}`}>
              <label className="block text-lg text-gray-300 mb-2">{index + 1}. {q.question_text}</label>
              <textarea
                value={knowledgeAnswers[index] || ''}
                onChange={(e) => handleKnowledgeAnswerChange(index, e.target.value)}
                className="w-full h-24 bg-nexus-surface rounded-lg p-3 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-nexus-accent resize-y"
                placeholder="Your answer..."
              />
            </div>
          ))}
        </main>
      )}

      {stage === 'project' && currentProject && (
        <main className="flex-grow flex flex-col overflow-hidden gap-4">
          <div className="bg-nexus-surface p-4 rounded-lg flex-shrink-0">
            <h2 className="text-xl font-semibold mb-2">Project Task {currentProjectIndex + 1}</h2>
            <p className="text-gray-400">{currentProject.description}</p>
          </div>
          <div className="flex-grow relative overflow-auto bg-nexus-dark rounded-lg border border-gray-700">
            <Editor
              value={projectCodes[currentProjectIndex] || ''}
              onValueChange={code => handleProjectCodeChange(currentProjectIndex, code)}
              highlight={code => Prism.highlight(code, Prism.languages.python, 'python')}
              padding={16}
              className="h-full custom-scrollbar code-editor"
              style={{ fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 16 }}
            />
          </div>
        </main>
      )}
      
      {stage === 'completed' && (
          <main className="flex-grow flex flex-col items-center justify-center text-center">
              <CheckSquare className="w-24 h-24 text-green-500 mb-6 animate-pulse"/>
              <h2 className="text-4xl font-bold text-gray-100 mb-4">Assessment Submitted!</h2>
              <p className="text-xl text-gray-400">Our AI is evaluating your submission. You will be redirected to your profile page shortly.</p>
          </main>
      )}

      <footer className="mt-6 flex justify-between items-center flex-shrink-0">
        {stage === 'project' ? (
          <button
            onClick={() => setCurrentProjectIndex(p => p > 0 ? p - 1 : p)}
            disabled={currentProjectIndex === 0}
            className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <ArrowLeft/> <span>Previous Project</span>
          </button>
        ) : ( <div></div> )}

        {stage === 'knowledge' && (
          <button onClick={() => setStage('project')} className="px-8 py-3 rounded-lg bg-nexus-accent text-nexus-dark flex items-center space-x-2 hover:bg-nexus-accent/90 transition-colors">
            <span>Next: Project Tasks</span><ArrowRight/>
          </button>
        )}
        {stage === 'project' && session.project_tasks && currentProjectIndex < session.project_tasks.length - 1 && (
           <button onClick={() => setCurrentProjectIndex(p => p + 1)} className="px-8 py-3 rounded-lg bg-nexus-accent text-nexus-dark flex items-center space-x-2 hover:bg-nexus-accent/90 transition-colors">
            <span>Next Project</span><ArrowRight/>
          </button>
        )}
        {stage === 'project' && session.project_tasks && currentProjectIndex === session.project_tasks.length - 1 && (
          <button onClick={handleSubmit} className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-500 flex items-center space-x-2 transition-colors">
            <CheckSquare/><span>Finish & Submit Assessment</span>
          </button>
        )}
      </footer>
    </div>
  );
};

export default AssessmentSessionPage;