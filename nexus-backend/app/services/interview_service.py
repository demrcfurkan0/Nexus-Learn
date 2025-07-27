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
    raise ValueError("No valid JSON block found in the AI response.")

async def generate_interview_questions(topic: str) -> List[Dict]:
    """
    Belirli bir konu için 10 teorik ve 10 kodlama mülakat sorusu üretir.
    """
    prompt = f"""
    Generate a comprehensive technical interview question set for the topic: "{topic}".
    The set must include exactly 20 questions: 10 of type 'theory' and 10 of type 'live_coding'.
    Return a single, valid JSON list of objects. Do not include any text or markdown formatting outside of the list.
    Each object must have a "question_text" and a "question_type".
    For 'live_coding' questions, also include a 'template_code' field with a simple Python function template.
    Ensure a good mix of difficulties, from easy to hard.
    """
    try:
        response = await run_in_threadpool(model.generate_content, prompt)
        json_text = _extract_json_block(response.text)
        questions = json.loads(json_text)
        if not isinstance(questions, list) or not all("question_type" in q for q in questions):
             raise ValueError("AI did not return the expected question structure.")
        return questions
    except (json.JSONDecodeError, ValueError) as e:
        print(f"AI-generated JSON for interview is invalid: {response.text}\nError: {e}")
        raise HTTPException(status_code=500, detail="AI failed to generate a valid interview.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not start the interview session.")

async def evaluate_interview_submission(topic: str, answers: List[Dict], username: str) -> str:
    """
    Kullanıcının mülakat cevaplarını değerlendirir ve bir rapor oluşturur.
    """
    submission_text = ""
    for i, ans in enumerate(answers, 1):
        submission_text += f"\n--- Soru {i} ---\n"
        submission_text += f"Soru: {ans.get('question_text', 'N/A')}\n"
        submission_text += f"Adayın Cevabı:\n```\n{ans.get('user_answer', 'Cevap verilmedi.')}\n```\n"

    prompt = f"""
    Sen, "{topic}" konusunda uzman, deneyimli bir teknik mülakatçı ve işe alım yöneticisisin.
    Adayın adı **{username}**. Mülakat Değerlendirme Raporu'nu aşağıda verilen katı formata göre, Markdown kullanarak ve Türkçe olarak oluştur.

    ---
    ### Mülakat Değerlendirme Raporu
    **Aday:** {username}
    **Pozisyon:** Junior Software Developer ({topic})

    ### 1. Genel Değerlendirme
    *Buraya adayın performansı hakkında 2-3 cümlelik bir özet yaz.*

    ### 2. Güçlü Yönler
    - **[Güçlü Yön Başlığı]:** *Buraya spesifik ve olumlu bir geri bildirim yaz.*
    - **[Başka Bir Güçlü Yön]:** *Buraya spesifik ve olumlu bir geri bildirim daha yaz.*

    ### 3. Geliştirilebilecek Alanlar
    - **[Geliştirilecek Alan Başlığı]:** *Buraya yapıcı ve spesifik bir eleştiri yaz. Nasıl daha iyi olabileceğini açıkla.*
    - **[Başka Bir Geliştirilecek Alan]:** *Buraya yapıcı ve spesifik bir eleştiri daha yaz.*

    ### 4. Sonuç ve Öneri
    **İşe Alınabilirlik:** **[Yüzde Belirt, örn: 75%]**
    **Final Puanı:** **[100 Üzerinden Puan Ver, örn: 78/100]**
    ---

    Yukarıdaki şablonu kullanarak, adayın cevaplarını analiz et ve raporu doldur:
    {submission_text}
    """
    try:
        response = await run_in_threadpool(model.generate_content, prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error in interview evaluation service: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate the interview submission.")