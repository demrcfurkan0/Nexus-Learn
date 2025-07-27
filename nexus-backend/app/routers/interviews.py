from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from datetime import datetime

from ..database import interview_collection
from ..models import InterviewSession, StartInterviewRequest, SubmitInterviewRequest, User, InterviewQuestion
from ..security import get_current_user
from ..services import interview_service

import re

router = APIRouter(
    prefix="/api/interviews",
    tags=["Interviews"]
)

@router.post("/start", response_model=InterviewSession)
async def start_interview_session(request: StartInterviewRequest, current_user: User = Depends(get_current_user)):
    try:
        questions_data = await interview_service.generate_interview_questions(request.topic)
        questions = [InterviewQuestion.model_validate(q) for q in questions_data]
        new_session = InterviewSession(
            ownerId=str(current_user.id),
            topic=request.topic,
            questions=questions,
        )
        db_session = new_session.model_dump(by_alias=True, exclude=["id"])
        result = await interview_collection.insert_one(db_session)
        created_session_doc = await interview_collection.find_one({"_id": result.inserted_id})
        if not created_session_doc:
            raise HTTPException(status_code=500, detail="Failed to retrieve created session.")
        return InterviewSession.model_validate(created_session_doc)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to start interview session.")

@router.get("/{session_id}", response_model=InterviewSession)
async def get_interview_session(session_id: str, current_user: User = Depends(get_current_user)):
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID.")
    session = await interview_collection.find_one({"_id": ObjectId(session_id), "ownerId": str(current_user.id)})
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    return InterviewSession.model_validate(session)

@router.post("/{session_id}/submit")
async def submit_interview_answers(
    session_id: str,
    request: SubmitInterviewRequest,
    current_user: User = Depends(get_current_user)
):
    """Submits user answers for evaluation and parses key metrics."""
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID.")

    session = await interview_collection.find_one({
        "_id": ObjectId(session_id),
        "ownerId": str(current_user.id)
    })
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.get("status") == "completed":
        raise HTTPException(status_code=400, detail="This interview has already been completed.")

    # AI'dan değerlendirme raporunu al
    feedback_report = await interview_service.evaluate_interview_submission(
        topic=session["topic"],
        answers=request.answers
    )

    # --- YENİ EKLENEN KISIM: RAPORDAN METRİKLERİ ÇEKME ---
    score = None
    try:
        # "Final Score: 85/100" veya "Final Puanı: 85" gibi formatları arar
        score_match = re.search(r"(?:Score|Puanı?):\s*(\d{1,3})", feedback_report, re.IGNORECASE)
        if score_match:
            score = int(score_match.group(1))
    except (ValueError, IndexError):
        score = None # Hata olursa skoru boş bırak
    # ---------------------------------------------------
        
    # Veritabanındaki oturumu güncelle
    await interview_collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                "status": "completed",
                "feedback": feedback_report,
                "score": score, # Ayrıştırılan skoru kaydet
                "completed_at": datetime.utcnow()
            }
        }
    )

    return {"message": "Interview completed and submitted for evaluation."}