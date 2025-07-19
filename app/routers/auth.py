# app/routers/auth.py (YENİ DOSYA)

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from .. import auth
from ..models import User, UserCreate, Token, Roadmap
from ..database import user_collection, roadmap_collection

from pydantic import BaseModel 
from typing import List 

class UserProfile(BaseModel):
    user_details: User
    roadmaps: List[Roadmap]
    
    
router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)



@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    # Kullanıcının zaten var olup olmadığını kontrol et
    db_user = await user_collection.find_one({"email": user.email})
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    hashed_password = auth.get_password_hash(user.password)
    user_dict = user.dict()
    user_dict.pop("password")
    user_dict["hashed_password"] = hashed_password

    new_user = await user_collection.insert_one(user_dict)
    created_user = await user_collection.find_one({"_id": new_user.inserted_id})
    return created_user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await user_collection.find_one({"email": form_data.username}) # form_data.username emaili temsil eder
    if not user or not auth.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(auth.get_current_user)):
    return current_user

@router.get("/users/me/profile", response_model=UserProfile)
async def get_user_profile(current_user: User = Depends(auth.get_current_user)):
    """Mevcut kullanıcının detaylarını ve sahip olduğu tüm yol haritalarını getirir."""
    
    # Kullanıcıya ait yol haritalarını bul
    user_roadmaps = await roadmap_collection.find({"ownerId": str(current_user.id)}).to_list(100)

    # Her bir roadmapin progress'ini hesapla 
    for r in user_roadmaps:
        total_nodes = len(r.get("nodes", []))
        if total_nodes > 0:
            completed_nodes = len([node for node in r["nodes"] if node.get("status") == "completed"])
            r["progress"] = int((completed_nodes / total_nodes) * 100)
        else:
            r["progress"] = 0
            
    return {"user_details": current_user, "roadmaps": user_roadmaps}