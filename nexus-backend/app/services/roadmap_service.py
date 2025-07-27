import json
import re
import google.generativeai as genai
from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool
from typing import Dict

from ..config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

def _extract_json_block(text: str) -> str:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0).strip()
    return text.strip()

async def generate_roadmap_from_prompt(user_goal: str) -> Dict:
    prompt = f"""
    Create a detailed, step-by-step learning roadmap for the topic: "{user_goal}".
    The output MUST be a single, valid JSON object with exactly two keys: "title" (a string for the roadmap's title) and "nodes" (a list of node objects).
    Each node object in the "nodes" list must have:
    - "nodeId" (a unique string ID, e.g., "python_basics").
    - "title" (a string).
    - "content" (a short string description).
    - "dependencies" (a list of other nodeId strings).
    The first node should have an empty dependencies array [].
    The entire output must be ONLY the JSON object, with no extra text, explanations, or markdown formatting like ```json.
    """
    try:
        response = await run_in_threadpool(model.generate_content, prompt)
        json_text = _extract_json_block(response.text)
        roadmap_data = json.loads(json_text)
        if not isinstance(roadmap_data, dict) or "title" not in roadmap_data or "nodes" not in roadmap_data:
            raise ValueError("AI did not return the expected dictionary with 'title' and 'nodes'.")
        return roadmap_data
    except (json.JSONDecodeError, ValueError) as e:
        print(f"AI-generated JSON is invalid: {response.text}\nError: {e}")
        raise HTTPException(status_code=500, detail="AI failed to generate a valid roadmap structure.")
    except Exception as e:
        print(f"An unexpected error occurred in roadmap generation service: {e}")
        raise HTTPException(status_code=500, detail="Could not generate the learning roadmap due to an internal error.")