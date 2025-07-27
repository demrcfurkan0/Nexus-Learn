import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, GitBranch, CheckCircle, TrendingUp, Mic, FileText, Award } from 'lucide-react';
import apiClient from '../services/apiClient';
import { UserProfile, RoadmapData, InterviewSession, AssessmentSession } from '../types';
import InterviewReportModal from './InterviewReportModal';
import AssessmentReportModal from './AssessmentReportModal';

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<InterviewSession | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentSession | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await apiClient.get<UserProfile>('/api/auth/users/me/profile');
        setProfileData(data);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-center text-gray-400 text-xl">Loading Explorer Data...</p></div>;
  }

  if (!profileData) {
    return <div className="flex justify-center items-center h-screen"><p className="text-center text-red-400 text-xl">Could not load profile data.</p></div>;
  }

  const { user_details, roadmaps, interviews, assessments } = profileData;

  const completedNodes = roadmaps.reduce((acc, roadmap) => {
    return acc + (roadmap.nodes?.filter(node => node.status === 'completed').length || 0);
  }, 0);
  
  const avgProgress = roadmaps.length > 0 ? Math.round(roadmaps.reduce((acc, r) => acc + (r.progress || 0), 0) / roadmaps.length) : 0;

  return (
    <>
      <div className="container mx-auto px-6 py-12 animate-fade-in">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-100 mb-2">Explorer Profile</h1>
          <p className="text-xl text-nexus-accent glow-text">{user_details.username}</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Panel */}
          <div className="lg:col-span-1">
            <div className="bg-nexus-surface/80 p-6 rounded-2xl border border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-nexus-accent/20 flex items-center justify-center border-2 border-nexus-accent">
                  <span className="text-3xl font-bold text-nexus-accent">{user_details.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">{user_details.username}</h2>
                  <p className="text-gray-400 flex items-center"><Mail className="w-4 h-4 mr-2" />{user_details.email}</p>
                </div>
              </div>
              <hr className="border-gray-700 my-6" />
              <h3 className="text-xl font-semibold text-white mb-4">Overall Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-gray-300"><span className="flex items-center"><GitBranch className="w-5 h-5 mr-3 text-cyan-400" />Roadmaps Initiated</span><span className="font-bold text-white text-lg">{roadmaps.length}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="flex items-center"><CheckCircle className="w-5 h-5 mr-3 text-green-400" />Nodes Completed</span><span className="font-bold text-white text-lg">{completedNodes}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="flex items-center"><TrendingUp className="w-5 h-5 mr-3 text-yellow-400" />Average Progress</span><span className="font-bold text-white text-lg">{avgProgress}%</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="flex items-center"><Mic className="w-5 h-5 mr-3 text-blue-400" />Interviews Completed</span><span className="font-bold text-white text-lg">{interviews?.length || 0}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="flex items-center"><Award className="w-5 h-5 mr-3 text-orange-400" />Assessments Taken</span><span className="font-bold text-white text-lg">{assessments?.length || 0}</span></div>
              </div>
            </div>
          </div>

          {/* Sağ Panel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-nexus-surface/80 p-6 rounded-2xl border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">My Expeditions</h3>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {roadmaps && roadmaps.length > 0 ? (
                  roadmaps.map((roadmap) => {
                    const roadmapId = (roadmap as any).id || (roadmap as any)._id;
                    if (!roadmapId) return null;
                    return (
                      <div key={roadmapId} className="bg-nexus-dark/50 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-nexus-accent/10 transition-colors" onClick={() => navigate(`/roadmaps/${roadmapId}`)}>
                        <div>
                          <h4 className="font-semibold text-gray-100">{roadmap.title}</h4>
                          <p className="text-sm text-gray-400">From prompt: "{roadmap.prompt || 'Suggested Template'}"</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="font-bold text-nexus-accent text-lg">{roadmap.progress || 0}%</span>
                          <p className="text-xs text-gray-500">Complete</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-gray-400 text-center py-8">You haven't generated any roadmaps yet.</p>
                )}
              </div>
            </div>

            <div className="bg-nexus-surface/80 p-6 rounded-2xl border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Interview Reports</h3>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {interviews && interviews.length > 0 ? (
                    interviews.map((interview) => (
                    <div key={interview.id} className="bg-nexus-dark/50 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-nexus-accent/10 transition-colors" onClick={() => setSelectedInterview(interview)}>
                        <div className="flex items-center space-x-4">
                          {interview.score !== null && typeof interview.score !== 'undefined' ? (
                            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-nexus-accent bg-nexus-surface">
                              <span className="text-2xl font-bold text-nexus-accent">{interview.score}</span>
                              <span className="text-xs text-gray-400">/100</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-nexus-surface border border-gray-700">
                              <Mic className="w-8 h-8 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-100">{interview.topic}</h4>
                            <p className="text-sm text-gray-400">
                                Completed on: {new Date(interview.completed_at || '').toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4 flex items-center space-x-2 text-nexus-accent hover:underline">
                            <FileText className="w-5 h-5" />
                            <span>View Report</span>
                        </div>
                    </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center py-8">You haven't completed any interviews yet.</p>
                )}
              </div>
            </div>

            <div className="bg-nexus-surface/80 p-6 rounded-2xl border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Assessment Reports</h3>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {assessments && assessments.length > 0 ? (
                    assessments.map((assessment) => (
                    <div key={assessment.id} className="bg-nexus-dark/50 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-nexus-accent/10 transition-colors" onClick={() => setSelectedAssessment(assessment)}>
                        <div>
                          <h4 className="font-semibold text-gray-100">{assessment.topic}</h4>
                          <p className="text-sm text-gray-400">
                            Completed on: {new Date(assessment.completed_at || '').toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4 flex items-center space-x-2 text-nexus-accent hover:underline">
                            <FileText className="w-5 h-5" />
                            <span>View Report</span>
                        </div>
                    </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center py-8">You haven't completed any skill assessments yet.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {selectedInterview && <InterviewReportModal interview={selectedInterview} onClose={() => setSelectedInterview(null)} />}
      {selectedAssessment && <AssessmentReportModal assessment={selectedAssessment} onClose={() => setSelectedAssessment(null)} />}
    </>
  );
};

export default ProfilePage;