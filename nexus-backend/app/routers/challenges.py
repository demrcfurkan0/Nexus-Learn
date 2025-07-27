from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId

from ..database import challenge_collection, roadmap_collection
from ..models import CodeChallenge, UserChatMessage, ChatMessage, HintRequest, HintResponse, User
from ..security import get_current_user
from ..services import challenge_service, chat_service

router = APIRouter(
    prefix="/api/challenges",
    tags=["Challenges"]
)

@router.get("/", response_model=List[CodeChallenge])
async def get_all_challenges():
    challenges = await challenge_collection.find().to_list(100)
    return [CodeChallenge.model_validate(c) for c in challenges]

@router.post("/generate-recommended", response_model=List[CodeChallenge])
async def generate_recommended_challenges(current_user: User = Depends(get_current_user)):
    """
    Generates personalized challenges based on the user's completed roadmap nodes.
    """
    user_roadmaps = await roadmap_collection.find({"ownerId": str(current_user.id)}).to_list(100)
    completed_topics = {
        node["title"]
        for roadmap in user_roadmaps
        for node in roadmap.get("nodes", [])
        if node.get("status") == "completed"
    }

    if not completed_topics:
        raise HTTPException(
            status_code=400,
            detail="Complete some roadmap nodes first to get personalized challenges!"
        )

    topics_str = ", ".join(list(completed_topics)[:5])
    try:
        generated_data = await challenge_service.generate_challenges_from_topics(topics_str)
        
        # --- KESİN ÇÖZÜM: YANITI MANUEL OLARAK HAZIRLAMA ---
        response_list = []
        for data in generated_data:
            # AI'dan gelen veriye eksik alanı ekle
            data["solution_code"] = "# Solution is not provided for AI-generated challenges."
            
            # Pydantic ile doğrula, bu işlem ona bir ObjectId atayacak
            validated_challenge_model = CodeChallenge.model_validate(data)
            
            # Pydantic modelini JSON'a uygun bir dictionary'e dönüştür.
            # model_dump(), ObjectId'yi string'e çevirir.
            challenge_dict = validated_challenge_model.model_dump(by_alias=True)
            
            # Frontend'in 'id' alanını bulabilmesi için garantile
            challenge_dict['id'] = str(challenge_dict['_id'])
            
            response_list.append(challenge_dict)
        
        # Artık serileştirmeye hazır, temiz bir dictionary listesi döndürüyoruz
        return response_list
        # ----------------------------------------------------

    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An error occurred while generating challenges.")

@router.post("/{challenge_id}/hint", response_model=HintResponse)
async def get_challenge_hint(challenge_id: str, request: HintRequest):
    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=400, detail="Invalid challenge ID format.")
    challenge = await challenge_collection.find_one({"_id": ObjectId(challenge_id)})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    hint_text = await challenge_service.get_hint_for_challenge(
        challenge_description=challenge['description'],
        user_code=request.user_code
    )
    return HintResponse(hint=hint_text)

@router.post("/{challenge_id}/chat", response_model=ChatMessage)
async def post_challenge_chat_message(challenge_id: str, message: UserChatMessage, current_user: User = Depends(get_current_user)):
    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=400, detail=f"Invalid challenge ID: {challenge_id}")
    challenge = await challenge_collection.find_one({"_id": ObjectId(challenge_id)})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    ai_response_text = await chat_service.get_ai_challenge_response(
        challenge_title=challenge["title"],
        challenge_description=challenge["description"],
        user_question=message.text
    )
    ai_message = ChatMessage(sender="ai", text=ai_response_text)
    return ai_message

@router.post("/{challenge_id}/hint", response_model=HintResponse)
async def get_challenge_hint(challenge_id: str, request: HintRequest, current_user: User = Depends(get_current_user)):
    # ID'nin geçerli olup olmadığını kontrol et
    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=400, detail="Invalid challenge ID format.")
        
    # İlgili challenge'ı veritabanından bul
    challenge = await challenge_collection.find_one({"_id": ObjectId(challenge_id)})
    if not challenge:
        # Eğer suggested challenge'lar arasında yoksa, belki AI tarafından üretilmiş ve DB'de olmayan bir challenge'dır.
        # Bu senaryo şimdilik kapsam dışı, bu yüzden 404 dönüyoruz.
        raise HTTPException(status_code=404, detail="Challenge not found.")

    # AI servisinden ipucu al
    hint_text = await challenge_service.get_hint_for_challenge(
        challenge_description=challenge['description'],
        user_code=request.user_code
    )
    return HintResponse(hint=hint_text)