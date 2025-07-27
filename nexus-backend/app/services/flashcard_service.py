import json
import re
import google.generativeai as genai
from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool
from typing import List, Dict

from ..config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

def _extract_json_block(text: str) -> str:
    match = re.search(r"```json(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    if text.strip().startswith('[') and text.strip().endswith(']'):
        return text.strip()
    raise ValueError("No valid JSON block found in AI response.")

async def generate_flashcards_for_topic(topic: str, completed_nodes: List[str], count: int = 15) -> List[Dict]:
    """
    Bir roadmap'in tamamlanmış konularından bilgi kartları üretir.
    """
    if not completed_nodes:
        return []

    nodes_text = ", ".join(completed_nodes)
    
    prompt = f"""
    You are an expert learning assistant creating a flashcard deck.
    The main topic of the roadmap is "{topic}". The user has completed these specific sub-topics: "{nodes_text}".

    Your task is to generate {count} flashcards based ONLY on the completed sub-topics.
    Create flashcards for the most important keywords, definitions, and fundamental questions.
    The "front" of the card should be a term or a short question.
    The "back" of the card should be a concise definition or answer.

    Return a valid JSON list of objects, where each object has a "front" and a "back" key.
    Do not include any text or markdown formatting outside of the JSON list itself.
    """

    try:
        response = await run_in_threadpool(model.generate_content, prompt)
        json_text = _extract_json_block(response.text)
        flashcards = json.loads(json_text)
        if not isinstance(flashcards, list) or not all("front" in card and "back" in card for card in flashcards):
            raise ValueError("AI did not return the expected flashcard structure.")
        return flashcards
    except (json.JSONDecodeError, ValueError) as e:
        print(f"AI-generated JSON for flashcards is invalid: {response.text}\nError: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate valid flashcards from AI.")
    except Exception as e:
        print(f"Error in flashcard generation service: {e}")
        raise HTTPException(status_code=500, detail="Could not generate flashcards.")