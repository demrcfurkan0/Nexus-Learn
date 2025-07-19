from pydantic import BaseModel, Field, BeforeValidator
from typing import List, Optional, Annotated
from bson import ObjectId
from datetime import datetime, timedelta

PyObjectId = Annotated[
    str,
    BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v),
]

class HintRequest(BaseModel):
    user_code: str

class HintResponse(BaseModel):
    hint: str

class CodeChallenge(BaseModel):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    title: str
    description: str
    difficulty: str  # 'Easy', 'Medium', 'Hard'
    category: str    # 'Arrays', 'Strings', 'Data Structures' etc.
    template_code: str # Kullanıcının başlayacağı şablon kod
    solution_code: str # Çözüm kodu
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    disabled: Optional[bool] = False

# Veritabanında saklanacak tam kullanıcı modeli (şifre dahil)
class UserInDB(User):
    hashed_password: str

# Token Modelleri
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Chat mesajları için model
class ChatMessage(BaseModel):
    sender: str  
    text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# RoadmapNode 
class RoadmapNode(BaseModel):
    nodeId: str
    title: str
    content: str
    status: str = "not_started"
    dependencies: List[str]
    chatHistory: List[ChatMessage] = [] # Chat geçmişi için boş bir liste 

class Roadmap(BaseModel):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    title: str
    prompt: Optional[str] = None
    type: str  # 'user_generated' veya 'suggested'
    ownerId: Optional[str] = None
    progress: int = 0
    nodes: List[RoadmapNode]
    templateId: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda dt: dt.isoformat()} # datetime için encoder 

class GenerateRoadmapRequest(BaseModel):
    prompt: str

# Chat için kullanıcı girdisi modeli
class UserChatMessage(BaseModel):
    text: str
    
class UpdateNodeStatusRequest(BaseModel):
    status: str
    