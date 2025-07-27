
export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
  }
  
  export interface ApiNode {
    nodeId: string;
    title: string;
    content: string;
    status: string;
    dependencies: string[];
    chatHistory: ChatMessage[]; 
  }
  
  export interface RoadmapData {
    id: string;
    title: string;
    prompt: string | null;
    type: string;
    ownerId: string | null;
    progress: number;
    nodes: ApiNode[];
    templateId?: string | null; 
  }
  
  export interface AuthUser {
    username: string;
    email: string;
  }
  
  export interface UserProfile {
    user_details: AuthUser;
    roadmaps: RoadmapData[];
    interviews?: InterviewSession[]; // interviews alanını ekle/doğrula
    assessments?: AssessmentSession[]; // assessments alanını ekle/doğrula
  }

  export interface CodeChallenge {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    template_code: string;
    solution_code: string;
  }

  export interface InterviewQuestion {
    question_type: 'theory' | 'code_comprehension' | 'live_coding';
    question_text: string;
    user_answer?: string;
    template_code?: string;
  }
  
  export interface InterviewSession {
    id: string;
    ownerId: string;
    topic: string;
    questions: InterviewQuestion[];
    status: 'in_progress' | 'completed';
    feedback?: string;
    score?: number;
    started_at: string;
    completed_at?: string;
  }

  export interface Flashcard {
    card_type: 'keyword' | 'cloze' | 'question_answer';
    front: string;
    back: string;
  }
  
  export interface FlashcardDeck {
    topic: string;
    cards: Flashcard[];
  }

  export interface AssessmentQuestion {
    question_type: string;
    question_text: string;
    options?: string[];
    correct_answer?: string;
    user_answer?: string;
    is_correct?: boolean;
  }
    
  export interface AssessmentProject {
    description: string;
    template_code: string;
    user_code?: string;
    evaluation?: string;
  }
    
  export interface AssessmentSession {
    id: string;
    ownerId: string;
    topic: string;
    knowledge_questions: AssessmentQuestion[];
    project_tasks: AssessmentProject[]; 
    status: 'in_progress' | 'completed';
    final_report?: string;
    competency_matrix?: Record<string, number>;
    started_at: string;
    completed_at?: string;
  }