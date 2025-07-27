from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from ..database import roadmap_collection
from ..models import FlashcardDeck, GenerateFlashcardsRequest, User
from ..security import get_current_user
from ..services import flashcard_service

router = APIRouter(
    prefix="/api/flash-cards",
    tags=["Flashcards"]
)

@router.post("/generate", response_model=FlashcardDeck)
async def generate_flashcard_deck(
    request: GenerateFlashcardsRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generates a flashcard deck for a given roadmap based on completed nodes.
    """
    if not ObjectId.is_valid(request.roadmapId):
        raise HTTPException(status_code=400, detail="Invalid roadmap ID format.")

    roadmap = await roadmap_collection.find_one({"_id": ObjectId(request.roadmapId)})
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")

    # Roadmap kullanıcı tarafından oluşturulmuşsa, sahibinin o olduğundan emin ol.
    if roadmap.get("type") == "user_generated" and roadmap.get("ownerId") != str(current_user.id):
        raise HTTPException(status_code=403, detail="You are not authorized to access this roadmap.")

    completed_nodes_titles = [
        node.get("title")
        for node in roadmap.get("nodes", [])
        if node.get("status") == "completed" and node.get("title")
    ]

    if not completed_nodes_titles:
        raise HTTPException(
            status_code=400,
            detail="You need to complete at least one topic in this expedition to generate flashcards."
        )

    try:
        cards_data = await flashcard_service.generate_flashcards_for_topic(
            topic=roadmap["title"],
            completed_nodes=completed_nodes_titles
        )
        if not cards_data:
             raise HTTPException(status_code=500, detail="AI could not generate flashcards for this topic.")
        
        return FlashcardDeck(
            topic=roadmap["title"],
            cards=cards_data
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred while generating flashcards.")