import os
import json
import re
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")

def generate_learning_roadmap(user_goal: str):
    prompt = f"""
    Kullanıcının hedefi: {user_goal}

    Bu hedefe ulaşması için adım adım öğrenmesi gereken konuları, ön koşullarıyla birlikte sıralı bir şekilde ver.
    Her konuyu kısaca açıkla. Çıktıyı mutlaka aşağıdaki formatta ve geçerli JSON olarak ver:

    [
        {{
            "baslik": "Konu Adı",
            "aciklama": "Kısa açıklama",
            "on_kosullar": ["ön koşul 1", "ön koşul 2"]
        }}
    ]
    """

    response = model.generate_content(prompt)
    text = response.text.strip()

    json_text = re.sub(r"^```json|```$", "", text, flags=re.MULTILINE).strip()

    try:
        roadmap = json.loads(json_text)
        return roadmap
    except json.JSONDecodeError:
        print(" AI düzgün JSON üretmedi. Gelen yanıt:\n")
        print(text)
        return None
