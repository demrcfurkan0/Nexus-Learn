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
    if text.strip().startswith('{') and text.strip().endswith('}'):
        return text.strip()
    raise ValueError("No valid JSON block found in the AI response.")

async def generate_assessment_session(topic: str) -> Dict:
    """Generates a challenging, certificate-level assessment."""
    prompt = f"""
    Create a difficult, certificate-level skill assessment for the topic: "{topic}".
    The output MUST be a single JSON object with two keys: "knowledge_questions" and "project_tasks".

    1. "knowledge_questions": A list of exactly 10 challenging, in-depth theory question objects. Each object must have:
       - "question_text": The question itself, designed to test deep understanding.
       - "question_type": Should be "theory".

    2. "project_tasks": A list of exactly 5 challenging coding project objects. Each object must have:
       - "description": A detailed description of a practical coding project that requires combining multiple concepts.
       - "template_code": Starter Python code for the project.

    Return ONLY the valid JSON object.
    """
    try:
        response = await run_in_threadpool(model.generate_content, prompt)
        json_text = _extract_json_block(response.text)
        data = json.loads(json_text)
        if "knowledge_questions" not in data or "project_tasks" not in data:
            raise ValueError("AI response is missing required keys.")
        return data
    except Exception as e:
        print(f"Error generating assessment session: {e}\nResponse was: {response.text if 'response' in locals() else 'No response'}")
        raise HTTPException(status_code=500, detail="Failed to generate assessment from AI.")

async def evaluate_assessment_submission(topic: str, questions: List[Dict], project_code: str, username: str) -> str:
    """Evaluates user's answers and project code, then generates a final report."""
    submission_text = "--- Bilgi Soruları ve Cevapları ---\n"
    for i, q in enumerate(questions, 1):
        submission_text += f"\nSoru {i}: {q.get('question_text')}\n"
        submission_text += f"Adayın Cevabı: {q.get('user_answer', 'Cevap verilmedi.')}\n"
    
    submission_text += "\n--- Mini Proje Kodu ---\n"
    submission_text += f"```python\n{project_code}\n```"

    prompt = f"""
    Sen, "{topic}" konusunda uzman bir teknik lider ve eğitmensin.
    Adayın adı **{username}**. Yetkinlik Değerlendirme Raporu'nu aşağıda verilen katı formata göre, Markdown kullanarak ve Türkçe olarak oluştur.

    ---
    ### Yetkinlik Değerlendirme Raporu
    **Aday:** {username}
    **Değerlendirme Alanı:** {topic}

    ### 1. Genel Özet
    *Buraya adayın genel yetkinliği hakkında 2-3 cümlelik bir özet yaz.*

    ### 2. Bilgi Soruları Analizi
    *Buraya teorik sorulara verilen cevapların bir analizini yap. Doğru ve yanlışları belirt.*

    ### 3. Proje Görevi Değerlendirmesi
    *Buraya gönderilen kodun doğruluğu, verimliliği, okunabilirliği ve en iyi pratiklere uygunluğu hakkında detaylı bir analiz yaz.*

    ### 4. Yetkinlik Matrisi
    - **[Anahtar Yetkinlik 1]:** **[10 üzerinden Puan]** - *Kısa yorum*
    - **[Anahtar Yetkinlik 2]:** **[10 üzerinden Puan]** - *Kısa yorum*
    - **[Anahtar Yetkinlik 3]:** **[10 üzerinden Puan]** - *Kısa yorum*

    ### 5. Final Sonucu
    **Durum:** **[Başarılı/Başarısız]**
    ---

    Yukarıdaki şablonu kullanarak, adayın gönderimini analiz et ve raporu doldur:
    {submission_text}
    """
    try:
        response = await run_in_threadpool(model.generate_content, prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error evaluating assessment: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate the assessment submission.")