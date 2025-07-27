import google.generativeai as genai
from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool
from typing import List, Dict

from ..config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

async def get_ai_response(topic: str, history: List[Dict]) -> str:
    system_instruction = f"""
    Sen Nexus adlı bir öğrenme platformunda uzman, sabırlı ve teşvik edici bir eğitmensin. 
    Görevin, kullanıcıya '{topic}' konusunu öğretmek.
    YANITLARINI MUTLAKA MARKDOWN KULLANARAK FORMATLA.
    - Önemli anahtar kelimeleri veya kavramları `**kalın metin**` olarak vurgula.
    - Adımları, özellikleri veya maddeleri anlatırken mutlaka `-` karakteri ile başlayan madde imli listeler kullan.
    - Kod örnekleri veya komutlar verirken, bunları mutlaka ```python ... ``` gibi kod blokları içine al.
    - Kısa ve öz paragraflar kullan. Asla çok uzun metin blokları yazma.
    """
    formatted_history = []
    for message in history:
        role = "model" if message["sender"] == "ai" else "user"
        formatted_history.append({"role": role, "parts": [message["text"]]})
    convo = model.start_chat(history=[
        {'role': 'user', 'parts': [system_instruction]},
        {'role': 'model', 'parts': [f"Anlaşıldı. Ben bir Nexus eğitmeniyim ve kullanıcıya '{topic}' konusunu Markdown formatında öğretmeye hazırım."]},
        *formatted_history
    ])
    last_user_message = formatted_history[-1]['parts'] if formatted_history and formatted_history[-1]['role'] == 'user' else "Lütfen konuyu anlatmaya devam et."
    try:
        response = await run_in_threadpool(convo.send_message, last_user_message)
        return response.text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail="AI assistant is currently unavailable.")

async def get_ai_challenge_response(challenge_title: str, challenge_description: str, user_question: str) -> str:
    system_instruction = f"""
    Sen, Nexus platformunda yardımcı bir AI kodlama asistanısın.
    Kullanıcı şu anda "{challenge_title}" adlı problemi çözmeye çalışıyor.
    Problemin açıklaması: "{challenge_description}"
    Senin görevin, Sokratik metodu kullanarak kullanıcıya yol göstermektir.
    - ASLA doğrudan çözüm kodunu verme.
    - Kullanıcının sorusuna göre ona yol gösterici bir karşı soru sor veya bir sonraki adımı düşünmesini sağla.
    - Yanıtlarını Markdown formatında yapılandır.
    """
    prompt = f'Sistem talimatını takip et. Kullanıcının sorusu şu: "{user_question}". Bu soruya göre yol gösterici bir yanıt oluştur.'
    try:
        response = await run_in_threadpool(model.generate_content, [system_instruction, prompt])
        return response.text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail="AI assistant is currently unavailable for challenges.")