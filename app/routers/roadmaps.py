from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List
import google.generativeai as genai
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel # !!!!!!

from ..database import roadmap_collection
from ..models import Roadmap, GenerateRoadmapRequest, RoadmapNode, ChatMessage, UserChatMessage, UpdateNodeStatusRequest, User
from ..config import settings
from ..auth import get_current_user
import json

router = APIRouter(
    prefix="/api/roadmaps",
    tags=["Roadmaps"],
)

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class EnrollResponse(BaseModel):
    personal_roadmap_id: str

@router.post("/generate", response_model=Roadmap, status_code=201)
async def generate_roadmap(request: GenerateRoadmapRequest, current_user: User = Depends(get_current_user)):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API Key is not configured.")

    model = genai.GenerativeModel('gemini-pro')
    
    prompt_for_ai = f"""
    Create a detailed, 10-15 step learning roadmap for the topic: "{request.prompt}".
    The output must be a single, valid JSON object with two keys: "title" and "nodes".
    - "title": A creative and engaging title for the roadmap.
    - "nodes": An array of JSON objects.
    Each node object in the "nodes" array must have these exact keys:
    - "nodeId": A unique string identifier (e.g., "1", "2", "3").
    - "title": The name of the learning topic for this step.
    - "content": A concise, one-paragraph explanation of what this topic covers.
    - "dependencies": An array of strings, where each string is the "nodeId" of a prerequisite topic. The first node should have an empty dependencies array [].
    Ensure the dependencies are logical. Do not make up facts. The entire output must be only the JSON object, with no extra text, formatting like ```json, or explanations before or after it.
    """
    try:
        # Gemini API çağrısı
        response = await model.generate_content_async(prompt_for_ai)
        
        # Gemini'nin yanıtından JSON'ı temizle
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "").strip()
        ai_response = json.loads(cleaned_response)

        roadmap_nodes = [RoadmapNode(**node_data) for node_data in ai_response.get("nodes", [])]
        new_roadmap_data = {
            "title": ai_response.get("title", f"Roadmap for {request.prompt}"),
            "prompt": request.prompt,
            "type": "user_generated",
            "nodes": [node.dict() for node in roadmap_nodes],
            "ownerId": str(current_user.id),
            "progress": 0
        }
        result = await roadmap_collection.insert_one(new_roadmap_data)
        created_roadmap = await roadmap_collection.find_one({"_id": result.inserted_id})
        return created_roadmap

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI'dan roadmap oluşturulurken bir hata oluştu: {str(e)}")

@router.get("/ongoing", response_model=List[Roadmap])
async def get_ongoing_roadmaps(current_user: User = Depends(get_current_user)):
    """Sadece mevcut kullanıcıya ait olan 'user_generated' yol haritalarını listeler."""
    roadmaps = await roadmap_collection.find({
        "type": "user_generated",
        "ownerId": str(current_user.id)  # HATA 2 DÜZELTİLDİ: Sadece bu kullanıcıya ait olanları filtrele
    }).to_list(100)
    return roadmaps

@router.get("/suggested", response_model=List[Roadmap])
async def get_suggested_roadmaps():
    roadmaps = await roadmap_collection.find({"type": "suggested"}).to_list(100)
    return roadmaps

@router.post("/{template_id}/enroll", response_model=EnrollResponse)
async def enroll_in_roadmap(template_id: str, current_user: User = Depends(get_current_user)):
    existing_copy = await roadmap_collection.find_one({"ownerId": str(current_user.id), "templateId": template_id})
    if existing_copy:
        return {"personal_roadmap_id": str(existing_copy["_id"])}
    template_roadmap = await roadmap_collection.find_one({"_id": ObjectId(template_id), "type": "suggested"})
    if not template_roadmap:
        raise HTTPException(status_code=404, detail="Suggested roadmap template not found.")
    new_personal_roadmap = {"title": template_roadmap["title"], "prompt": template_roadmap.get("prompt"), "type": "user_generated", "ownerId": str(current_user.id), "templateId": str(template_roadmap["_id"]), "progress": 0, "nodes": template_roadmap["nodes"]}
    result = await roadmap_collection.insert_one(new_personal_roadmap)
    return {"personal_roadmap_id": str(result.inserted_id)}

@router.get("/{roadmap_id}", response_model=Roadmap)
async def get_roadmap_by_id(roadmap_id: str):
    roadmap = await roadmap_collection.find_one({"_id": ObjectId(roadmap_id)})
    if roadmap:
        return roadmap
    raise HTTPException(status_code=404, detail=f"Roadmap with id {roadmap_id} not found")

@router.patch("/{roadmap_id}/nodes/{node_id}/status", response_model=RoadmapNode)
async def update_node_status(roadmap_id: str, node_id: str, request: UpdateNodeStatusRequest, current_user: User = Depends(get_current_user)):
    if request.status not in ["not_started", "in_progress", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status value.")
    roadmap = await roadmap_collection.find_one({"_id": ObjectId(roadmap_id)})
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")
    if roadmap.get("type") == "user_generated":
        if roadmap.get("ownerId") != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to update this roadmap.")
    result = await roadmap_collection.update_one({"_id": ObjectId(roadmap_id), "nodes.nodeId": node_id}, {"$set": {"nodes.$.status": request.status}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Node not found in this roadmap.")
    updated_roadmap = await roadmap_collection.find_one({"_id": ObjectId(roadmap_id)})
    for node in updated_roadmap["nodes"]:
        if node["nodeId"] == node_id:
            return RoadmapNode(**node)
    raise HTTPException(status_code=500, detail="Could not retrieve updated node.")

@router.get("/{roadmap_id}/nodes/{node_id}/chat", response_model=List[ChatMessage])
async def get_node_chat_history(roadmap_id: str, node_id: str):
    roadmap = await roadmap_collection.find_one({"_id": ObjectId(roadmap_id)}, {"nodes": {"$elemMatch": {"nodeId": node_id}}})
    if not roadmap or "nodes" not in roadmap or not roadmap["nodes"]:
        raise HTTPException(status_code=404, detail="Roadmap or Node not found")
    return roadmap["nodes"][0].get("chatHistory", [])

@router.post("/{roadmap_id}/nodes/{node_id}/chat", response_model=ChatMessage)
async def post_chat_message(roadmap_id: str, node_id: str, message: UserChatMessage):
    user_message = ChatMessage(sender="user", text=message.text)
    ai_response_text = (f"Bu harika bir soru: '{message.text}'. " "Şu an için ben bir simülasyonum. " "Gerçek Gemini modeli bağlandığında bu konuyu senin için detaylandıracağım.")
    ai_message = ChatMessage(sender="ai", text=ai_response_text)
    result = await roadmap_collection.update_one({"_id": ObjectId(roadmap_id), "nodes.nodeId": node_id}, {"$push": {"nodes.$.chatHistory": {"$each": [user_message.dict(), ai_message.dict()]}}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Could not find roadmap or node to update.")
    return ai_message