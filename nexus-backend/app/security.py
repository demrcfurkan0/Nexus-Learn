from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel
from bson import ObjectId
from .config import settings
from .models import User, UserCreate, Token, Roadmap, InterviewSession, AssessmentSession

# Proje içi importlar
from .database import user_collection, roadmap_collection, interview_collection, assessment_collection
from .models import TokenData, User, UserCreate, Token, Roadmap, InterviewSession, AssessmentSession

# --- ROUTER TANIMI ---
router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication & Users"],
)

# --- ŞİFRELEME ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- JWT AYARLARI ---
SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user_data = await user_collection.find_one({"email": token_data.email})
    if user_data is None:
        raise credentials_exception
    
    return User.model_validate(user_data)

# --- PROFIL İÇİN Pydantic MODELİ ---
class UserProfileResponse(BaseModel):
    user_details: User
    roadmaps: List[Roadmap]
    interviews: List[InterviewSession]
    assessments: List[AssessmentSession]
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# --- ENDPOINTS ---

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    db_user = await user_collection.find_one({"email": user.email})
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    
    new_user = await user_collection.insert_one(user_dict)
    created_user = await user_collection.find_one({"_id": new_user.inserted_id})
    return User.model_validate(created_user)

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user_data = await user_collection.find_one({"email": form_data.username})
    if not user_data or not verify_password(form_data.password, user_data["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users/me/profile", response_model=UserProfileResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    user_roadmaps = await roadmap_collection.find({"ownerId": str(current_user.id)}).to_list(100)
    for r in user_roadmaps:
        total_nodes = len(r.get("nodes", []))
        r["progress"] = int((len([n for n in r.get("nodes", []) if n.get("status") == "completed"]) / total_nodes) * 100) if total_nodes > 0 else 0

    completed_interviews = await interview_collection.find({"ownerId": str(current_user.id), "status": "completed"}).to_list(100)
    completed_assessments = await assessment_collection.find({"ownerId": str(current_user.id), "status": "completed"}).to_list(100)
    
    profile_data = {
        "user_details": current_user,
        "roadmaps": user_roadmaps,
        "interviews": completed_interviews,
        "assessments": completed_assessments
    }
    
    return UserProfileResponse.model_validate(profile_data)