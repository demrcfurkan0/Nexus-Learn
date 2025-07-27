from pydantic import BaseModel, Field, BeforeValidator
from typing import List, Optional, Annotated
from bson import ObjectId
from datetime import datetime

PyObjectId = Annotated[
    str,
    BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v),
]

# --- Auth & User Models ---
class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Chat Models ---
class ChatMessage(BaseModel):
    sender: str  
    text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class UserChatMessage(BaseModel):
    text: str

# --- Roadmap Models ---
class RoadmapNode(BaseModel):
    nodeId: str
    title: str
    content: str
    status: str = "not_started"
    dependencies: List[str]
    chatHistory: List[ChatMessage] = []

class Roadmap(BaseModel):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    title: str
    prompt: Optional[str] = None
    type: str
    ownerId: Optional[str] = None
    progress: int = 0
    nodes: List[RoadmapNode]
    templateId: Optional[str] = None
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda dt: dt.isoformat()}

class GenerateRoadmapRequest(BaseModel):
    prompt: str

class UpdateNodeStatusRequest(BaseModel):
    status: str

# --- Challenge Models ---
class CodeChallenge(BaseModel):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    title: str
    description: str
    difficulty: str
    category: str
    template_code: str
    solution_code: str
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class HintRequest(BaseModel):
    user_code: str

class HintResponse(BaseModel):
    hint: str

# --- Interview Models ---
class InterviewQuestion(BaseModel):
    question_type: str
    question_text: str
    user_answer: Optional[str] = None
    template_code: Optional[str] = None 

class InterviewSession(BaseModel):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    ownerId: str
    topic: str
    questions: List[InterviewQuestion]
    status: str = "in_progress"
    feedback: Optional[str] = None
    score: Optional[int] = None
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda dt: dt.isoformat()}

class StartInterviewRequest(BaseModel):
    topic: str

class SubmitInterviewRequest(BaseModel):
    answers: List[dict]

# --- Flashcard Models ---
class Flashcard(BaseModel):
    front: str
    back: str

class FlashcardDeck(BaseModel):
    topic: str
    cards: List[Flashcard]

class GenerateFlashcardsRequest(BaseModel):
    roadmapId: str

# --- Assessment Models ---
class AssessmentQuestion(BaseModel):
    question_type: str
    question_text: str
    options: Optional[List[str]] = None

class AssessmentProject(BaseModel):
    description: str
    template_code: str
    user_code: Optional[str] = None
    evaluation: Optional[str] = None

class AssessmentSession(BaseModel):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    ownerId: str
    topic: str
    knowledge_questions: List[AssessmentQuestion]
    project_tasks: List[AssessmentProject]
    status: str = "in_progress"
    final_report: Optional[str] = None # Değerlendirme raporunu saklamak için
    completed_at: Optional[datetime] = None # Tamamlanma zamanını saklamak için
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda dt: dt.isoformat()}

class StartAssessmentRequest(BaseModel):
    topic: str