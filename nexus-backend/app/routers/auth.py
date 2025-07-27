from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from pydantic import BaseModel
from typing import List

# Gerekli modülleri ve fonksiyonları import ediyoruz
from .. import security
from ..models import User, UserCreate, Token, Roadmap
from ..database import user_collection, roadmap_collection

# --- YARDIMCI FONKSİYON ---
# MongoDB'nin '_id' ObjectId'sini frontend'in beklediği string 'id'ye çevirir.
def map_mongo_id(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
    return doc

# --- PYDANTIC MODELLERİ ---
class UserProfile(BaseModel):
    user_details: User
    roadmaps: List[Roadmap]

# --- ROUTER TANIMI ---
router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)

# --- ENDPOINTLER ---

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    """Yeni bir kullanıcı kaydı oluşturur."""
    db_user = await user_collection.find_one({"email": user.email})
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    hashed_password = security.get_password_hash(user.password)
    user_dict = user.dict(exclude={"password"}) 
    user_dict["hashed_password"] = hashed_password

    new_user = await user_collection.insert_one(user_dict)
    created_user = await user_collection.find_one({"_id": new_user.inserted_id})
    
    return map_mongo_id(created_user)

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Kullanıcı girişi yapar ve JWT token döndürür."""
    user = await user_collection.find_one({"email": form_data.username})
    if not user or not security.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(security.get_current_user)):
    """Geçerli token'a sahip kullanıcının temel bilgilerini döndürür."""
    return current_user

@router.get("/users/me/profile", response_model=UserProfile)
async def get_user_profile(current_user: User = Depends(security.get_current_user)):
    """Kullanıcının profil bilgilerini ve tüm yol haritalarını döndürür."""
    user_roadmaps_cursor = roadmap_collection.find({"ownerId": str(current_user.id)})
    user_roadmaps = await user_roadmaps_cursor.to_list(100)

    processed_roadmaps = []
    for r in user_roadmaps:
        total_nodes = len(r.get("nodes", []))
        if total_nodes > 0:
            completed_nodes = len([node for node in r["nodes"] if node.get("status") == "completed"])
            r["progress"] = int((completed_nodes / total_nodes) * 100)
        else:
            r["progress"] = 0

        processed_roadmaps.append(r)
            
    return {"user_details": current_user, "roadmaps": processed_roadmaps}