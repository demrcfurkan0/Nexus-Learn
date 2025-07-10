import os
import re
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")

def extract_json_block(text):
    match = re.search(r"```json(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()

def generate_quiz(topic: str, question_count: int = 5):
    prompt = f"""
    Lütfen '{topic}' konusu hakkında {question_count} adet çoktan seçmeli quiz sorusu hazırla.

    Her sorunun 4 şıkkı olsun (A, B, C, D). Cevapları belirt ve çıktıyı geçerli JSON formatında ver:

    [
        {{
            "soru": "Soru metni",
            "secenekler": {{
                "A": "...",
                "B": "...",
                "C": "...",
                "D": "..."
            }},
            "dogru_cevap": "C"
        }},
        ...
    ]
    """

    response = model.generate_content(prompt)
    text = response.text.strip()
    json_text = extract_json_block(text)

    try:
        quiz_data = json.loads(json_text)
        return quiz_data
    except Exception as e:
        print(" Quiz JSON hatası:", e)
        print("\nGelen metin:\n", text)
        return None

def run_quiz(quiz_data):
    score = 0
    print("\n📊 Quiz Başlıyor!\n")

    for i, soru in enumerate(quiz_data, 1):
        print(f"{i}. {soru['soru']}")
        for secenek, metin in soru["secenekler"].items():
            print(f"   {secenek}) {metin}")
        cevap = input("Cevabın (A/B/C/D): ").strip().upper()

        if cevap == soru["dogru_cevap"]:
            print(" Doğru!\n")
            score += 1
        else:
            print(f" Yanlış. Doğru cevap: {soru['dogru_cevap']}\n")

    print(f"🎯 Sonuç: {score} / {len(quiz_data)} doğru yaptın.")
