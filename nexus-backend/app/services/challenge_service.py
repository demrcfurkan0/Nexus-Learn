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
    return text

async def generate_challenges_from_topics(topics: str, count: int = 3) -> List[dict]:
    """
    Verilen konulara göre tam teşekküllü kodlama görevleri üretir.
    """
    prompt = f"""
    Generate {count} new code challenges based on these topics: "{topics}".
    The output MUST be a single, valid JSON list of objects.
    Each object must have the following keys:
    - "title": A string for the challenge title.
    - "description": A string explaining the challenge.
    - "difficulty": A string, either "Easy", "Medium", or "Hard".
    - "category": A relevant string from the provided topics.
    - "template_code": A string containing starter Python code with a function signature and a 'pass' statement.

    Do not include any text or markdown formatting like ```json outside of the JSON list itself.
    """
    try:
        response = await run_in_threadpool(model.generate_content, prompt)
        json_text = _extract_json_block(response.text)
        challenges = json.loads(json_text)
        if not isinstance(challenges, list) or not all("title" in c and "template_code" in c for c in challenges):
            raise ValueError("AI response is missing required keys.")
        return challenges
    except (json.JSONDecodeError, ValueError) as e:
        print(f"AI-generated JSON for challenges is invalid: {response.text}\nError: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate valid challenges from AI.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not generate challenges.")

async def get_hint_for_challenge(challenge_description: str, user_code: str) -> str:
    """
    Bir kodlama görevi ve kullanıcının yazdığı kod için AI'dan ipucu alır.
    """
    prompt = f"""
    You are a helpful programming tutor.
    The user is trying to solve the following problem: "{challenge_description}"

    Here is the user's current code:
    ```python
    {user_code}
    ```

    Analyze the user's code. Provide a concise, helpful hint to guide them in the right direction. 
    Do NOT give the full answer. Focus on the logical error or the next step they should take.
    If the code is empty or nonsensical, suggest a starting point (e.g., "Think about which data structure would be efficient for lookups.").
    Your response should be in Turkish.
    """
    try:
        response = await run_in_threadpool(model.generate_content, prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error in hint generation service: {e}")
        raise HTTPException(status_code=500, detail="Could not get a hint from the AI.")