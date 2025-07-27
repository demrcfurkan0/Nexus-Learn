import traceback
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from pydantic import BaseModel

from ..security import get_current_user
from ..models import User, Roadmap, GenerateRoadmapRequest, RoadmapNode, UpdateNodeStatusRequest, ChatMessage, UserChatMessage
from ..database import roadmap_collection
from ..services import roadmap_service, chat_service

router = APIRouter(
    prefix="/api/roadmaps",
    tags=["Roadmaps"],
)

class EnrollResponse(BaseModel):
    personal_roadmap_id: str

@router.post("/generate", response_model=Roadmap, status_code=status.HTTP_201_CREATED)
async def generate_new_roadmap(request: GenerateRoadmapRequest, current_user: User = Depends(get_current_user)):
    try:
        ai_response = await roadmap_service.generate_roadmap_from_prompt(request.prompt)
        sanitized_nodes_data = []
        for node in ai_response.get("nodes", []):
            node['nodeId'] = str(node.get('nodeId', ''))
            if 'dependencies' in node and isinstance(node.get('dependencies'), list):
                node['dependencies'] = [str(dep) for dep in node['dependencies']]
            sanitized_nodes_data.append(node)
        roadmap_nodes = [RoadmapNode(**node) for node in sanitized_nodes_data]
        new_roadmap = Roadmap(
            title=ai_response.get("title", f"Roadmap for {request.prompt}"),
            prompt=request.prompt,
            type="user_generated",
            ownerId=str(current_user.id),
            nodes=roadmap_nodes
        )
        db_roadmap = new_roadmap.model_dump(by_alias=True, exclude=["id"])
        result = await roadmap_collection.insert_one(db_roadmap)
        created_roadmap_doc = await roadmap_collection.find_one({"_id": result.inserted_id})
        if not created_roadmap_doc:
            raise HTTPException(status_code=500, detail="Failed to retrieve created roadmap.")
        return Roadmap.model_validate(created_roadmap_doc)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An unexpected internal error occurred.")

@router.get("/ongoing", response_model=List[Roadmap])
async def get_ongoing_roadmaps(current_user: User = Depends(get_current_user)):
    """
    Fetches all roadmaps started by the current user, including calculated progress.
    """
    user_roadmaps = await roadmap_collection.find({
        "ownerId": str(current_user.id)
    }).to_list(length=100)

    for r in user_roadmaps:
        r["id"] = str(r["_id"])
        
        nodes = r.get("nodes", [])
        total_nodes = len(nodes)
        
        if total_nodes > 0:
            completed_nodes = len([node for node in nodes if node.get("status") == "completed"])
            r["progress"] = int((completed_nodes / total_nodes) * 100)
        else:
            r["progress"] = 0
    # ----------------------------------------------------
            
    return user_roadmaps

@router.get("/suggested", response_model=List[Roadmap])
async def get_suggested_roadmaps():
    suggested_roadmaps = await roadmap_collection.find({"type": "suggested"}).to_list(50)
    for r in suggested_roadmaps:
        r["id"] = str(r["_id"])
    return suggested_roadmaps

@router.get("/{roadmap_id}", response_model=Roadmap)
async def get_roadmap_by_id(roadmap_id: str):
    if not ObjectId.is_valid(roadmap_id):
        raise HTTPException(status_code=400, detail="Invalid roadmap ID.")
    roadmap = await roadmap_collection.find_one({"_id": ObjectId(roadmap_id)})
    if roadmap:
        return Roadmap.model_validate(roadmap)
    raise HTTPException(status_code=404, detail="Roadmap not found.")

@router.post("/{template_id}/enroll", response_model=EnrollResponse)
async def enroll_in_roadmap(template_id: str, current_user: User = Depends(get_current_user)):
    existing_copy = await roadmap_collection.find_one({"ownerId": str(current_user.id), "templateId": template_id})
    if existing_copy:
        return {"personal_roadmap_id": str(existing_copy["_id"])}
    template_roadmap = await roadmap_collection.find_one({"_id": ObjectId(template_id), "type": "suggested"})
    if not template_roadmap:
        raise HTTPException(status_code=404, detail="Suggested roadmap not found.")
    new_personal_roadmap = {
        "title": template_roadmap["title"], "prompt": template_roadmap.get("prompt"),
        "type": "user_generated", "ownerId": str(current_user.id),
        "templateId": str(template_roadmap["_id"]), "progress": 0,
        "nodes": template_roadmap["nodes"]
    }
    result = await roadmap_collection.insert_one(new_personal_roadmap)
    return {"personal_roadmap_id": str(result.inserted_id)}

@router.patch("/{roadmap_id}/nodes/{node_id}/status", response_model=RoadmapNode)
async def update_node_status(roadmap_id: str, node_id: str, request: UpdateNodeStatusRequest, current_user: User = Depends(get_current_user)):
    if not ObjectId.is_valid(roadmap_id):
        raise HTTPException(status_code=400, detail="Invalid roadmap ID.")
    if request.status not in ["not_started", "in_progress", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status value.")
    roadmap = await roadmap_collection.find_one({"_id": ObjectId(roadmap_id), "ownerId": str(current_user.id)})
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found or not owner.")
    result = await roadmap_collection.update_one(
        {"_id": ObjectId(roadmap_id), "nodes.nodeId": node_id},
        {"$set": {"nodes.$.status": request.status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Node not found.")
    updated_roadmap = await roadmap_collection.find_one({"_id": ObjectId(roadmap_id)})
    for node in updated_roadmap.get("nodes", []):
        if node["nodeId"] == node_id:
            return RoadmapNode.model_validate(node)
    raise HTTPException(status_code=500, detail="Could not retrieve updated node.")

@router.get("/{roadmap_id}/nodes/{node_id}/chat", response_model=List[ChatMessage])
async def get_node_chat_history(roadmap_id: str, node_id: str, current_user: User = Depends(get_current_user)):
    roadmap = await roadmap_collection.find_one(
        {"_id": ObjectId(roadmap_id), "ownerId": str(current_user.id)},
        {"nodes": {"$elemMatch": {"nodeId": node_id}}}
    )
    if not roadmap or not roadmap.get("nodes"):
        raise HTTPException(status_code=404, detail="Roadmap or Node not found")
    return roadmap["nodes"][0].get("chatHistory", [])

@router.post("/{roadmap_id}/nodes/{node_id}/chat", response_model=ChatMessage)
async def chat_with_ai_on_node(roadmap_id: str, node_id: str, user_message: UserChatMessage, current_user: User = Depends(get_current_user)):
    roadmap = await roadmap_collection.find_one({"_id": ObjectId(roadmap_id), "ownerId": str(current_user.id)})
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found or access denied.")
    target_node = next((node for node in roadmap["nodes"] if node["nodeId"] == node_id), None)
    if not target_node:
        raise HTTPException(status_code=404, detail="Node not found in this roadmap.")
    history = target_node.get("chatHistory", [])
    user_chat_msg_obj = ChatMessage(sender="user", text=user_message.text)
    history.append(user_chat_msg_obj.model_dump())
    ai_response_text = await chat_service.get_ai_response(target_node["title"], history)
    ai_chat_msg_obj = ChatMessage(sender="ai", text=ai_response_text)
    history.append(ai_chat_msg_obj.model_dump())
    await roadmap_collection.update_one(
        {"_id": ObjectId(roadmap_id), "nodes.nodeId": node_id},
        {"$set": {"nodes.$.chatHistory": history}}
    )
    return ai_chat_msg_obj

@router.delete("/{roadmap_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_roadmap(roadmap_id: str, current_user: User = Depends(get_current_user)):
    """
    Deletes a user-generated roadmap. Ensures the user is the owner.
    """
    if not ObjectId.is_valid(roadmap_id):
        raise HTTPException(status_code=400, detail="Invalid roadmap ID format.")

    # Sadece sahibinin silebildiğinden emin olmak için hem ID hem de ownerId ile sorgula
    delete_result = await roadmap_collection.find_one_and_delete({
        "_id": ObjectId(roadmap_id),
        "ownerId": str(current_user.id)
    })

    if delete_result is None:
        # Eğer hiçbir şey silinmediyse, ya roadmap yok ya da kullanıcı sahip değil
        raise HTTPException(status_code=404, detail="Roadmap not found or you are not the owner.")

    # 204 status kodu ile yanıt gövdesi gönderilmez
    return