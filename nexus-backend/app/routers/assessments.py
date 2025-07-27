from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Dict
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel

from ..database import assessment_collection
from ..models import AssessmentSession, StartAssessmentRequest, User
from ..security import get_current_user
from ..services import assessment_service

router = APIRouter(
    prefix="/api/assessments",
    tags=["Assessments"]
)

class SubmitAssessmentRequest(BaseModel):
    knowledge_answers: List[Dict]
    project_codes: List[str]

@router.post("/start", response_model=AssessmentSession)
async def start_assessment_session(request: StartAssessmentRequest, current_user: User = Depends(get_current_user)):
    try:
        session_data = await assessment_service.generate_assessment_session(request.topic)
        new_session = AssessmentSession(
            ownerId=str(current_user.id),
            topic=request.topic,
            knowledge_questions=session_data["knowledge_questions"],
            project_tasks=session_data["project_tasks"],
        )
        db_session = new_session.model_dump(by_alias=True, exclude=["id"])
        result = await assessment_collection.insert_one(db_session)
        created_session_doc = await assessment_collection.find_one({"_id": result.inserted_id})
        if not created_session_doc:
            raise HTTPException(status_code=500, detail="Failed to retrieve created session.")
        return AssessmentSession.model_validate(created_session_doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start assessment: {e}")

@router.get("/{session_id}", response_model=AssessmentSession)
async def get_assessment_session(session_id: str, current_user: User = Depends(get_current_user)):
    if not ObjectId.is_valid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID format.")
    session = await assessment_collection.find_one({"_id": ObjectId(session_id), "ownerId": str(current_user.id)})
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found or access denied.")
    return AssessmentSession.model_validate(session)

@router.post("/{session_id}/submit")
async def submit_assessment(
    session_id: str,
    request: SubmitAssessmentRequest,
    current_user: User = Depends(get_current_user)
):
    session = await assessment_collection.find_one({"_id": ObjectId(session_id), "ownerId": str(current_user.id)})
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found.")
    
    # AI'dan final raporu al
    final_report = await assessment_service.evaluate_assessment_submission(
        topic=session["topic"],
        questions=request.knowledge_answers,
        project_codes=request.project_codes # project_codes'u gönder
    )
    
    # Oturumu güncelle
    await assessment_collection.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {
            "status": "completed",
            "final_report": final_report,
            "completed_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Assessment submitted successfully."}